import test from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { POST as contact } from "../src/app/api/contact/route";
import { POST as track } from "../src/app/api/orders/track/route";
import { orderService } from "../src/services/order.service";
import { productService } from "../src/services/product.service";

const post = (url: string, body: unknown) =>
  new NextRequest(`http://localhost${url}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

test("contact form accepts a complete message and rejects an incomplete one", async () => {
  const ok = await contact(post("/api/contact", { name: "Nimali", email: "nimali@example.com", message: "Hello" }));
  assert.equal(ok.status, 200);

  const bad = await contact(post("/api/contact", { name: "Nimali", email: "not-an-email", message: "Hello" }));
  assert.equal(bad.status, 400);
});

test("order tracking needs the order number and the matching phone, and returns no personal details", async () => {
  const product = (await productService.getAll())[0];
  const order = await orderService.createOrder({
    customer: {
      fullName: "Nimali Perera",
      email: "nimali@example.com",
      phone: "+94771234567",
      addressLine1: "5 Flower Rd",
      city: "Colombo",
      district: "Colombo",
    },
    items: [{ productId: product.id, variantId: product.variants[0]?.id || "default", quantity: 1 }],
    paymentMethod: "cod",
  });

  // Any way of writing the same phone number works
  const found = await track(post("/api/orders/track", { orderNumber: order.orderNumber, phone: "077 123 4567" }));
  assert.equal(found.status, 200);
  const body = await found.json();
  assert.equal(body.orderNumber, order.orderNumber);
  assert.equal(JSON.stringify(body).includes("Flower Rd"), false);
  assert.equal(JSON.stringify(body).includes("nimali@example.com"), false);

  const wrongPhone = await track(post("/api/orders/track", { orderNumber: order.orderNumber, phone: "0779999999" }));
  assert.equal(wrongPhone.status, 404);

  const unknown = await track(post("/api/orders/track", { orderNumber: "VIA-00000000-0000", phone: "0771234567" }));
  assert.equal(unknown.status, 404);
});
