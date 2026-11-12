import test from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { POST as quote } from "../src/app/api/checkout/quote/route";
import { productService } from "../src/services/product.service";

const call = (body: unknown) =>
  quote(new NextRequest("http://localhost/api/checkout/quote", { method: "POST", body: JSON.stringify(body) }));

test("quote uses live catalogue prices and adds Koko tax only for Koko", async () => {
  const product = (await productService.getAll()).find((p) => (p.variants[0]?.priceLKR ?? p.basePriceLKR) > 0)!;
  const unit = product.variants[0]?.priceLKR ?? product.basePriceLKR;
  const items = [{ productId: product.id, variantId: product.variants[0]?.id, quantity: 2, priceLKR: 1 }];

  const plain = await (await call({ items, district: "Colombo", paymentMethod: "cod" })).json();
  assert.equal(plain.subtotalLKR, unit * 2); // the cart's own price (1) is ignored
  assert.equal(plain.taxLKR, 0);
  assert.equal(plain.totalLKR, plain.subtotalLKR + plain.deliveryFeeLKR);

  const koko = await (await call({ items, district: "Colombo", paymentMethod: "koko" })).json();
  assert.equal(koko.taxLKR, Math.round((koko.subtotalLKR + koko.deliveryFeeLKR) * 10) / 100);
  assert.equal(koko.totalLKR, koko.subtotalLKR + koko.deliveryFeeLKR + koko.taxLKR);
});

test("quote rejects an empty cart", async () => {
  assert.equal((await call({ items: [] })).status, 400);
});
