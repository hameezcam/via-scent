import test from "node:test";
import assert from "node:assert/strict";
import { createSign, createVerify, generateKeyPairSync } from "node:crypto";
import { NextRequest } from "next/server";
import { POST as kokoResponse } from "../src/app/api/koko/response/route";
import { buildKokoCheckoutForm, buildOrderDataString, getKokoConfig, verifyKokoResponse } from "../src/lib/koko";
import { orderService } from "../src/services/order.service";
import { productService } from "../src/services/product.service";

const pem = (type: "spki" | "pkcs8", key: import("node:crypto").KeyObject) =>
  key.export({ type, format: "pem" }).toString();

// Our keypair (signs orders) and Koko's keypair (signs results), both made fresh for the test
const ours = generateKeyPairSync("rsa", { modulusLength: 2048 });
const kokos = generateKeyPairSync("rsa", { modulusLength: 2048 });

const ENV = {
  KOKO_MERCHANT_ID: "test-merchant",
  KOKO_API_KEY: "test-api-key",
  KOKO_PRIVATE_KEY: pem("pkcs8", ours.privateKey),
  KOKO_PUBLIC_KEY: pem("spki", kokos.publicKey),
  KOKO_MODE: "qa",
  NEXT_PUBLIC_SITE_URL: "https://shop.example.lk",
};

async function withKoko(fn: () => Promise<void>) {
  const saved: Record<string, string | undefined> = {};
  for (const [k, v] of Object.entries(ENV)) {
    saved[k] = process.env[k];
    process.env[k] = v;
  }
  try {
    await fn();
  } finally {
    for (const [k, v] of Object.entries(saved)) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
  }
}

const kokoSign = (text: string) => createSign("RSA-SHA256").update(text).sign(kokos.privateKey, "base64");

test("Koko is off until its keys are set", () => {
  assert.equal(getKokoConfig(), null);
});

test("Koko form signs the fields in Koko's order", async () => {
  await withKoko(async () => {
    const config = getKokoConfig()!;
    const form = buildKokoCheckoutForm(
      config,
      { orderNumber: "VIA-1", confirmationToken: "tok", totalLKR: 12500, customer: { fullName: "Nimal Perera", email: "n@example.com" } },
      "https://shop.example.lk"
    );
    assert.match(form.action, /^https:\/\/qaapi\.paykoko\.com\//);
    assert.equal(form.fields._amount, "12500.00");
    assert.equal(form.fields._firstName, "Nimal");
    assert.equal(form.fields._lastName, "Perera");
    assert.equal(form.fields._responseUrl, "https://shop.example.lk/api/koko/response");
    assert.ok(form.fields._returnUrl.endsWith("/checkout/return/VIA-1/tok"));
    const expected = buildOrderDataString({
      merchantId: "test-merchant", amount: "12500.00", currency: "LKR", pluginName: "customapi", pluginVersion: "1.0.1",
      returnUrl: form.fields._returnUrl, cancelUrl: form.fields._cancelUrl, orderId: "VIA-1", reference: "VIA-1",
      firstName: "Nimal", lastName: "Perera", email: "n@example.com", description: "VIA Scent order VIA-1",
      apiKey: "test-api-key", responseUrl: form.fields._responseUrl,
    });
    assert.equal(form.fields.dataString, expected);
    assert.ok(createVerify("RSA-SHA256").update(expected).verify(ours.publicKey, form.fields.signature, "base64"));
  });
});

test("Koko results are only trusted with a valid signature", async () => {
  await withKoko(async () => {
    const config = getKokoConfig()!;
    const signature = kokoSign("VIA-1T1SUCCESS");
    assert.ok(verifyKokoResponse(config, { orderId: "VIA-1", trnId: "T1", status: "SUCCESS", signature }));
    assert.ok(!verifyKokoResponse(config, { orderId: "VIA-1", trnId: "T1", status: "FAILURE", signature }));
    assert.ok(!verifyKokoResponse(config, { orderId: "VIA-2", trnId: "T1", status: "SUCCESS", signature }));
    assert.ok(!verifyKokoResponse(config, { orderId: "VIA-1", trnId: "T1", status: "SUCCESS", signature: "" }));
  });
});

async function newKokoOrder() {
  const product = (await productService.getAll())[0];
  return orderService.createOrder({
    customer: {
      fullName: "Test Buyer",
      email: "buyer@example.com",
      phone: "+94771234567",
      addressLine1: "5 Flower Rd",
      city: "Colombo",
      district: "Colombo",
    },
    items: [{ productId: product.id, variantId: product.variants[0]?.id || "default", quantity: 1 }],
    paymentMethod: "online_gateway",
    onlineGateway: "koko",
  });
}

const post = (fields: Record<string, string>) => {
  const body = new URLSearchParams(fields);
  return kokoResponse(new NextRequest("https://shop.example.lk/api/koko/response", { method: "POST", body, headers: { "content-type": "application/x-www-form-urlencoded" } }));
};

test("A signed SUCCESS from Koko marks the order paid, once", async () => {
  await withKoko(async () => {
    const order = await newKokoOrder();
    assert.equal(order.payment.gateway, "koko");
    const fields = { orderId: order.orderNumber, trnId: "TRN9", status: "SUCCESS", signature: kokoSign(`${order.orderNumber}TRN9SUCCESS`) };
    assert.equal((await post(fields)).status, 200);
    const paid = await orderService.getOrderByNumber(order.orderNumber);
    assert.equal(paid?.payment.status, "paid");
    assert.equal(paid?.payment.transactionId, "TRN9");
    assert.equal((await post(fields)).status, 200);
    assert.equal((await orderService.getOrderByNumber(order.orderNumber))?.history.length, paid?.history.length);
  });
});

test("A forged Koko result is rejected", async () => {
  await withKoko(async () => {
    const order = await newKokoOrder();
    const res = await post({ orderId: order.orderNumber, trnId: "X", status: "SUCCESS", signature: "bogus" });
    assert.equal(res.status, 400);
    assert.notEqual((await orderService.getOrderByNumber(order.orderNumber))?.payment.status, "paid");
  });
});
