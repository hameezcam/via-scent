import test from "node:test";
import assert from "node:assert/strict";
import { orderService } from "../src/services/order.service";
import { productService } from "../src/services/product.service";

// Orders are priced from the live catalogue, so tests buy from it too
const catalogue = () => productService.getAll();

test("Payment & Orders: COD orders are created with placed_cod and UNPAID status", async () => {
  const product = (await catalogue())[0];
  const order = await orderService.createOrder({
    customer: {
      fullName: "Anura Silva",
      email: "anura@example.com",
      phone: "+94712345678",
      addressLine1: "10 Temple Rd",
      city: "Colombo",
      district: "Colombo",
      postalCode: "00500",
    },
    items: [
      {
        productId: product.id,
        variantId: product.variants[0]?.id || "default",
        quantity: 1,
      },
    ],
    paymentMethod: "cod",
  });

  assert.equal(order.payment.method, "cod", "Payment method must be COD");
  assert.equal(
    order.payment.status,
    "unpaid",
    "CRITICAL: COD orders must NEVER be marked as paid at checkout!"
  );
  assert.equal(order.status, "placed_cod", "Order status must initially be placed_cod");
  assert.ok(order.orderNumber.startsWith("VIA-"), "Order number must carry VIA brand prefix");
});

test("Payment & Orders: Authorized staff can record COD payment collection", async () => {
  const product = (await catalogue())[0];
  const order = await orderService.createOrder({
    customer: {
      fullName: "Sunil Jayawardena",
      email: "sunil@example.com",
      phone: "+94765432109",
      addressLine1: "88 Marine Drive",
      city: "Colombo",
      district: "Colombo",
      postalCode: "00300",
    },
    items: [
      {
        productId: product.id,
        variantId: product.variants[0]?.id || "default",
        quantity: 1,
      },
    ],
    paymentMethod: "cod",
  });

  assert.equal(order.payment.status, "unpaid");

  // Cashier records receipt
  const updatedOrder = await orderService.recordPaymentCollection(order.id, "cashier@viascent.lk", {
    receiptNumber: "REC-COD-9912",
    notes: "Cash collected at doorstep by rider",
  });

  assert.equal(updatedOrder.payment.status, "paid", "Payment status must now be marked as paid");
  assert.equal(updatedOrder.payment.receiptNumber, "REC-COD-9912");
  assert.ok(updatedOrder.payment.collectedAt, "Must record timestamp of collection");

  // Verify history entry
  const lastHistory = updatedOrder.history[updatedOrder.history.length - 1];
  assert.ok(lastHistory.note.includes("REC-COD-9912"), "Audit history must record receipt number");
});

test("Payment & Orders: Online digital payment initiates in pending state and verifies server-side", async () => {
  const product = (await catalogue())[0];
  const order = await orderService.createOrder({
    customer: {
      fullName: "Dilshan Mendis",
      email: "dilshan@example.com",
      phone: "+94773456789",
      addressLine1: "15 Flower Rd",
      city: "Colombo",
      district: "Colombo",
      postalCode: "00700",
    },
    items: [
      {
        productId: product.id,
        variantId: product.variants[0]?.id || "default",
        quantity: 1,
      },
    ],
    paymentMethod: "online_gateway",
  });

  assert.equal(order.payment.method, "online_gateway");
  assert.equal(order.status, "pending_payment");
  assert.equal(order.payment.status, "unpaid");

  // Server-side verification with valid signature
  const verifyResult = await orderService.verifyOnlinePayment(
    order.id,
    "PAYHERE-TXN-88401",
    "SIGNATURE_HASH_VALID_SHA256"
  );

  assert.equal(verifyResult.success, true);
  assert.equal(verifyResult.order?.payment.status, "paid");
  assert.equal(verifyResult.order?.status, "confirmed");
  assert.equal(verifyResult.order?.payment.transactionId, "PAYHERE-TXN-88401");
});

test("Payment & Orders: Online payment verification is strictly idempotent", async () => {
  const product = (await catalogue())[0];
  const order = await orderService.createOrder({
    customer: {
      fullName: "Rohan De Silva",
      email: "rohan@example.com",
      phone: "+94774567890",
      addressLine1: "20 Havelock Rd",
      city: "Colombo",
      district: "Colombo",
      postalCode: "00500",
    },
    items: [
      {
        productId: product.id,
        variantId: product.variants[0]?.id || "default",
        quantity: 1,
      },
    ],
    paymentMethod: "online_gateway",
  });

  // First verification
  const first = await orderService.verifyOnlinePayment(order.id, "TXN-101", "VALID_SIGNATURE_123");
  assert.equal(first.success, true);
  assert.equal(first.order?.payment.status, "paid");

  // Duplicate webhook / callback (idempotent test)
  const second = await orderService.verifyOnlinePayment(order.id, "TXN-101", "VALID_SIGNATURE_123");
  assert.equal(second.success, true, "Duplicate callback must succeed idempotently");
  assert.ok(second.message?.includes("Idempotent"), "Response must indicate idempotent handling");
});

test("Payment & Orders: Invalid gateway signatures are rejected", async () => {
  const product = (await catalogue())[0];
  const order = await orderService.createOrder({
    customer: {
      fullName: "Impostor Client",
      email: "hacker@example.com",
      phone: "+94770000000",
      addressLine1: "Unknown",
      city: "Colombo",
      district: "Colombo",
      postalCode: "00100",
    },
    items: [
      {
        productId: product.id,
        variantId: product.variants[0]?.id || "default",
        quantity: 1,
      },
    ],
    paymentMethod: "online_gateway",
  });

  const failure = await orderService.verifyOnlinePayment(order.id, "TXN-FAKE", ""); // empty signature
  assert.equal(failure.success, false);

  const reloaded = await orderService.getOrderById(order.id);
  assert.equal(reloaded?.payment.status, "failed");
});
