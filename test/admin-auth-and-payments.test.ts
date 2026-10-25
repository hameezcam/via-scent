import test from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { proxy } from "../src/proxy";
import { createAdminSessionToken, verifyAdminSessionToken, ADMIN_SESSION_COOKIE } from "../src/lib/admin-auth";
import { POST as verifyPayment } from "../src/app/api/checkout/verify/route";
import { GET as getConfirmation } from "../src/app/api/orders/confirmation/route";
import { orderService } from "../src/services/order.service";
import { productService } from "../src/services/product.service";

process.env.ADMIN_PASSWORD = "test-password";
process.env.ADMIN_SESSION_SECRET = "test-secret";

test("Admin Auth: Admin API rejects requests without a session", async () => {
  const res = await proxy(new NextRequest("http://localhost:3000/api/admin/orders"));
  assert.equal(res.status, 401);
});

test("Admin Auth: Admin pages redirect to the login page without a session", async () => {
  const res = await proxy(new NextRequest("http://localhost:3000/admin/orders"));
  assert.equal(res.status, 307);
  assert.ok(res.headers.get("location")?.includes("/admin-login?next=%2Fadmin%2Forders"));
});

test("Admin Auth: Valid session passes and overrides spoofed x-admin-user", async () => {
  const token = await createAdminSessionToken("admin@viascent.lk");
  const req = new NextRequest("http://localhost:3000/api/admin/orders", {
    headers: { cookie: `${ADMIN_SESSION_COOKIE}=${token}`, "x-admin-user": "attacker@example.com" },
  });
  const res = await proxy(req);
  assert.equal(res.status, 200);
  assert.equal(res.headers.get("x-middleware-request-x-admin-user"), "admin@viascent.lk");
});

test("Admin Auth: Tampered session tokens are rejected", async () => {
  const token = await createAdminSessionToken("admin@viascent.lk");
  const [payload, signature] = token.split(".");
  const forgedPayload = Buffer.from(JSON.stringify({ email: "x@y.z", expiresAt: Date.now() + 1e9 })).toString("base64url");
  assert.equal(await verifyAdminSessionToken(`${forgedPayload}.${signature}`), null);
  assert.equal(await verifyAdminSessionToken(`${payload}.bad`), null);
  assert.equal(await verifyAdminSessionToken(token), "admin@viascent.lk");
});

test("Payments: Simulated card verification is refused unless explicitly enabled", async () => {
  delete process.env.ENABLE_SIMULATED_PAYMENTS;
  const req = new NextRequest("http://localhost:3000/api/checkout/verify", {
    method: "POST",
    body: JSON.stringify({ orderId: "ord-1", transactionId: "TXN-1", signature: "SIG_FAKE_123" }),
  });
  const res = await verifyPayment(req);
  assert.equal(res.status, 403);
});

test("Orders: Confirmation lookup requires the order's private token", async () => {
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

  const wrong = await getConfirmation(
    new NextRequest(`http://localhost:3000/api/orders/confirmation?orderNumber=${order.orderNumber}&token=guess`)
  );
  assert.equal(wrong.status, 404);

  const right = await getConfirmation(
    new NextRequest(
      `http://localhost:3000/api/orders/confirmation?orderNumber=${order.orderNumber}&token=${order.confirmationToken}`
    )
  );
  assert.equal(right.status, 200);
  const body = await right.json();
  assert.equal(body.orderNumber, order.orderNumber);
  assert.equal(body.confirmationToken, undefined, "Token must not be echoed back");
});
