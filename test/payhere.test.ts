import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { NextRequest } from "next/server";
import { POST as checkout } from "../src/app/api/checkout/route";
import { POST as notify } from "../src/app/api/payhere/notify/route";
import { GET as paymentReturn } from "../src/app/checkout/return/[orderNumber]/[token]/route";
import { buildCheckoutForm, getPayHereConfig, signCheckout, verifyNotification } from "../src/lib/payhere";
import { orderService } from "../src/services/order.service";
import { productService } from "../src/services/product.service";
import { settingsService } from "../src/services/settings.service";

const MERCHANT_ID = "1221149";
const SECRET = "test-merchant-secret";
const md5Upper = (v: string) => createHash("md5").update(v).digest("hex").toUpperCase();

/** Runs a test with PayHere keys set, then puts the environment back. */
async function withPayHere(fn: () => Promise<void>) {
  const saved = {
    id: process.env.PAYHERE_MERCHANT_ID,
    secret: process.env.PAYHERE_MERCHANT_SECRET,
    mode: process.env.PAYHERE_MODE,
    site: process.env.NEXT_PUBLIC_SITE_URL,
  };
  process.env.PAYHERE_MERCHANT_ID = MERCHANT_ID;
  process.env.PAYHERE_MERCHANT_SECRET = SECRET;
  process.env.PAYHERE_MODE = "sandbox";
  process.env.NEXT_PUBLIC_SITE_URL = "https://shop.example.lk";
  try {
    await fn();
  } finally {
    for (const [key, value] of [
      ["PAYHERE_MERCHANT_ID", saved.id],
      ["PAYHERE_MERCHANT_SECRET", saved.secret],
      ["PAYHERE_MODE", saved.mode],
      ["NEXT_PUBLIC_SITE_URL", saved.site],
    ] as const) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
}

async function createOnlineOrder() {
  const product = (await productService.getAll())[0];
  return orderService.createOrder({
    customer: {
      fullName: "Nimali Perera",
      email: "nimali@example.com",
      phone: "+94771234567",
      addressLine1: "5 Flower Rd",
      city: "Colombo",
      district: "Colombo",
    },
    items: [{ productId: product.id, variantId: product.variants[0]?.id || "default", quantity: 1 }],
    paymentMethod: "online_gateway",
  });
}

function notification(orderNumber: string, amount: string, statusCode: string, overrides: Record<string, string> = {}) {
  const fields: Record<string, string> = {
    merchant_id: MERCHANT_ID,
    order_id: orderNumber,
    payhere_amount: amount,
    payhere_currency: "LKR",
    status_code: statusCode,
    payment_id: "320032123456",
    ...overrides,
  };
  fields.md5sig =
    overrides.md5sig ??
    md5Upper(`${fields.merchant_id}${fields.order_id}${fields.payhere_amount}${fields.payhere_currency}${fields.status_code}${md5Upper(SECRET)}`);
  return new NextRequest("http://localhost:3000/api/payhere/notify", {
    method: "POST",
    body: new URLSearchParams(fields),
  });
}

test("PayHere: Checkout signature follows PayHere's documented formula", async () => {
  await withPayHere(async () => {
    const config = getPayHereConfig()!;
    assert.equal(config.mode, "sandbox");
    const expected = md5Upper(`${MERCHANT_ID}VIA-1${"1500.00"}LKR${md5Upper(SECRET)}`);
    assert.equal(signCheckout(config, "VIA-1", 1500), expected);
  });
});

test("PayHere: Is off until both keys are set, and defaults to the sandbox", async () => {
  assert.equal(getPayHereConfig(), null);
  await withPayHere(async () => {
    delete process.env.PAYHERE_MODE;
    assert.equal(getPayHereConfig()!.mode, "sandbox");
    process.env.PAYHERE_MODE = "live";
    assert.equal(getPayHereConfig()!.mode, "live");
  });
});

test("PayHere: Notification signatures reject tampering", async () => {
  await withPayHere(async () => {
    const config = getPayHereConfig()!;
    const base = { merchantId: MERCHANT_ID, orderId: "VIA-1", amount: "1500.00", currency: "LKR", statusCode: "2" };
    const signature = md5Upper(`${MERCHANT_ID}VIA-1${"1500.00"}LKR2${md5Upper(SECRET)}`);
    assert.equal(verifyNotification(config, { ...base, signature }), true);
    assert.equal(verifyNotification(config, { ...base, signature: signature.toLowerCase() }), true);
    assert.equal(verifyNotification(config, { ...base, amount: "1.00", signature }), false);
    assert.equal(verifyNotification(config, { ...base, signature: "" }), false);
  });
});

test("PayHere: Checkout form keeps the order in the URL path and signs the real total", async () => {
  await withPayHere(async () => {
    const config = getPayHereConfig()!;
    const form = buildCheckoutForm(
      config,
      {
        orderNumber: "VIA-20261025-1234",
        confirmationToken: "tok-1",
        totalLKR: 12345.5,
        customer: { fullName: "Nimali", email: "n@example.com", phone: "0771234567", addressLine1: "5 Flower Rd", city: "Colombo" },
      },
      "https://shop.example.lk"
    );
    assert.equal(form.action, "https://sandbox.payhere.lk/pay/checkout");
    assert.equal(form.fields.amount, "12345.50");
    assert.equal(form.fields.return_url, "https://shop.example.lk/checkout/return/VIA-20261025-1234/tok-1");
    assert.equal(form.fields.notify_url, "https://shop.example.lk/api/payhere/notify");
    assert.equal(form.fields.last_name, "Nimali");
    assert.equal(form.fields.hash, signCheckout(config, "VIA-20261025-1234", 12345.5));
  });
});

test("PayHere: Card payment is offered only once keys are set", async () => {
  assert.equal((await settingsService.getEffectivePaymentSettings()).onlineGatewayEnabled, false);
  await withPayHere(async () => {
    assert.equal((await settingsService.getEffectivePaymentSettings()).onlineGatewayEnabled, true);
  });
});

test("PayHere: Checkout returns a signed PayHere form for card orders", async () => {
  await withPayHere(async () => {
    const product = (await productService.getAll())[0];
    const res = await checkout(
      new NextRequest("http://localhost:3000/api/checkout", {
        method: "POST",
        body: JSON.stringify({
          customer: {
            fullName: "Nimali Perera",
            email: "nimali@example.com",
            phone: "+94771234567",
            addressLine1: "5 Flower Rd",
            city: "Colombo",
            district: "Colombo",
          },
          items: [{ productId: product.id, variantId: product.variants[0]?.id || "default", quantity: 1 }],
          paymentMethod: "online_gateway",
        }),
      })
    );
    const body = await res.json();
    assert.equal(res.status, 200);
    assert.equal(body.paymentType, "payhere");
    assert.equal(body.payhere.fields.merchant_id, MERCHANT_ID);
    assert.equal(body.payhere.fields.order_id, body.orderNumber);
    assert.equal(body.payhere.fields.amount, body.pricingSnapshot.totalLKR.toFixed(2));
    assert.equal(body.payhere.fields.hash, signCheckout(getPayHereConfig()!, body.orderNumber, body.pricingSnapshot.totalLKR));
    assert.ok(body.payhere.fields.return_url.endsWith(`/${body.order.confirmationToken}`));
  });
});

test("PayHere: A verified success notification marks the order paid, once", async () => {
  await withPayHere(async () => {
    const order = await createOnlineOrder();
    const amount = order.pricingSnapshot.totalLKR.toFixed(2);

    const first = await notify(notification(order.orderNumber, amount, "2"));
    assert.equal(first.status, 200);
    const paid = await orderService.getOrderByNumber(order.orderNumber);
    assert.equal(paid?.payment.status, "paid");
    assert.equal(paid?.payment.transactionId, "320032123456");
    assert.equal(paid?.status, "confirmed");
    const historyLength = paid!.history.length;

    // PayHere retries notifications: a repeat must not change anything
    const second = await notify(notification(order.orderNumber, amount, "2"));
    assert.equal(second.status, 200);
    assert.equal((await orderService.getOrderByNumber(order.orderNumber))?.history.length, historyLength);
  });
});

test("PayHere: Forged or mismatched notifications never mark an order paid", async () => {
  await withPayHere(async () => {
    const order = await createOnlineOrder();
    const amount = order.pricingSnapshot.totalLKR.toFixed(2);

    const forged = await notify(notification(order.orderNumber, amount, "2", { md5sig: "0".repeat(32) }));
    assert.equal(forged.status, 400);

    // Correctly signed, but for a smaller amount than the order total
    const underpaid = await notify(notification(order.orderNumber, "1.00", "2"));
    assert.equal(underpaid.status, 400);

    const wrongCurrency = await notify(notification(order.orderNumber, amount, "2", { payhere_currency: "USD" }));
    assert.equal(wrongCurrency.status, 400);

    const unknown = await notify(notification("VIA-00000000-0000", amount, "2"));
    assert.equal(unknown.status, 404);

    assert.equal((await orderService.getOrderByNumber(order.orderNumber))?.payment.status, "unpaid");
  });
});

test("PayHere: A failed attempt is recorded, and a later success still counts", async () => {
  await withPayHere(async () => {
    const order = await createOnlineOrder();
    const amount = order.pricingSnapshot.totalLKR.toFixed(2);

    assert.equal((await notify(notification(order.orderNumber, amount, "-2"))).status, 200);
    const failed = await orderService.getOrderByNumber(order.orderNumber);
    assert.equal(failed?.payment.status, "failed");
    assert.equal(failed?.status, "pending_payment");

    assert.equal((await notify(notification(order.orderNumber, amount, "2"))).status, 200);
    assert.equal((await orderService.getOrderByNumber(order.orderNumber))?.payment.status, "paid");
  });
});

test("PayHere: Notifications are refused when card payments aren't set up", async () => {
  const res = await notify(notification("VIA-1", "1.00", "2"));
  assert.equal(res.status, 503);
});

test("PayHere: The return URL passes the order reference on to the confirmation page", async () => {
  await withPayHere(async () => {
    const res = await paymentReturn(new NextRequest("http://localhost:3000/checkout/return/VIA-1/tok-9?order_id=VIA-1"), {
      params: Promise.resolve({ orderNumber: "VIA-1", token: "tok-9" }),
    });
    assert.equal(res.status, 307);
    assert.equal(res.headers.get("location"), "https://shop.example.lk/checkout/success?orderNumber=VIA-1&token=tok-9");
  });
});
