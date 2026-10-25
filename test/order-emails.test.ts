import test from "node:test";
import assert from "node:assert/strict";
import {
  buildOrderConfirmationEmail,
  buildNewOrderAlertEmail,
  buildStatusUpdateEmail,
} from "../src/services/order-email.service";
import { sendEmail } from "../src/lib/email";
import type { Order } from "../src/types/order";

function sampleOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: "ord-test-1",
    orderNumber: "VIA-20261025-1234",
    confirmationToken: "tok-123",
    createdAt: "2026-10-25T08:00:00.000Z",
    customer: {
      fullName: "Nimali <b>Perera</b>",
      email: "nimali@example.lk",
      phone: "+94 77 000 0000",
      addressLine1: "12 Flower Rd",
      city: "Colombo 07",
      district: "Colombo",
    },
    items: [
      {
        productId: "p1",
        productSlug: "zen",
        productName: "Dr. Scent Zen Diffuser",
        variantId: "v1",
        variantName: "Black",
        sku: "SKU1",
        category: "aroma-diffusers",
        unitPriceLKR: 49800,
        quantity: 1,
        lineTotalLKR: 49800,
        image: "",
      },
    ],
    pricingSnapshot: { merchandiseSubtotalLKR: 49800, deliveryFeeLKR: 500, discountLKR: 0, taxLKR: 0, totalLKR: 50300 },
    payment: { method: "cod", status: "unpaid" },
    status: "placed_cod",
    history: [],
    ...overrides,
  };
}

test("Order emails: confirmation goes to the customer with totals, COD amount and a private order link", () => {
  const email = buildOrderConfirmationEmail(sampleOrder());
  assert.equal(email.to, "nimali@example.lk");
  assert.match(email.subject, /VIA-20261025-1234/);
  assert.match(email.text, /Rs\. 50,300/);
  assert.match(email.text, /Cash on delivery: please have Rs\. 50,300 ready/);
  assert.match(email.text, /checkout\/success\?orderNumber=VIA-20261025-1234&token=tok-123/);
});

test("Order emails: customer-entered text is escaped in HTML", () => {
  const email = buildOrderConfirmationEmail(sampleOrder());
  assert.ok(!email.html.includes("<b>Perera</b>"));
  assert.ok(email.html.includes("&lt;b&gt;Perera&lt;/b&gt;"));
});

test("Order emails: store alert goes to the alert address and replies reach the customer", () => {
  const email = buildNewOrderAlertEmail(sampleOrder());
  assert.equal(email.to, process.env.ORDER_ALERT_EMAIL || "info@vialk.com");
  assert.equal(email.replyTo, "nimali@example.lk");
  assert.match(email.text, /\+94 77 000 0000/);
});

test("Order emails: only customer-facing statuses send an update", () => {
  assert.equal(buildStatusUpdateEmail(sampleOrder({ status: "processing" })), null);
  const dispatched = buildStatusUpdateEmail(sampleOrder({ status: "dispatched" }));
  assert.ok(dispatched);
  assert.match(dispatched.subject, /on its way/);
  assert.match(dispatched.text, /Rs\. 50,300 ready in cash/);
  const paid = buildStatusUpdateEmail(sampleOrder({ status: "dispatched", payment: { method: "cod", status: "paid" } }));
  assert.ok(paid && !/ready in cash/.test(paid.text));
});

test("Order emails: sending is skipped, not thrown, when Resend is not configured", async () => {
  const saved = process.env.RESEND_API_KEY;
  delete process.env.RESEND_API_KEY;
  const result = await sendEmail(buildOrderConfirmationEmail(sampleOrder()));
  assert.deepEqual(result, { sent: false, reason: "not_configured" });
  if (saved) process.env.RESEND_API_KEY = saved;
});
