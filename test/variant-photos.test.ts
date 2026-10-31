import test from "node:test";
import assert from "node:assert/strict";
import { GET as variantImage } from "../src/app/api/products/[slug]/variants/[variantId]/images/[index]/[version]/route";
import { withServedImages } from "../src/lib/product-images";
import { productService } from "../src/services/product.service";
import type { Product } from "../src/types/product";

// A 1x1 PNG, stored inline the same way the admin stores uploads
const PIXEL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

test("each variant's photos are served through their own image route", async () => {
  const base = (await productService.getAll())[0];
  const product = {
    ...base,
    images: [],
    variants: [
      { ...base.variants[0], id: "var-small", name: "Small", images: [PIXEL] },
      { ...base.variants[0], id: "var-medium", name: "Medium", images: [PIXEL, PIXEL] },
    ],
  } as Product;

  const served = withServedImages(product);
  const small = served.variants.find((v) => v.id === "var-small")!;
  const medium = served.variants.find((v) => v.id === "var-medium")!;
  assert.match(small.images![0], new RegExp(`^/api/products/${product.slug}/variants/var-small/images/0/`));
  assert.match(medium.images![1], /\/variants\/var-medium\/images\/1\//);
  assert.equal(served.images.length, 0);
});

test("a variant photo route serves the right photo and 404s for unknown ones", async () => {
  const base = (await productService.getAll())[0];
  await productService.updateProduct(base.id, {
    variants: [{ ...base.variants[0], id: "var-photo-test", name: "Test", images: [PIXEL] }],
  });

  const ok = await variantImage(new Request("http://localhost/x"), {
    params: Promise.resolve({ slug: base.slug, variantId: "var-photo-test", index: "0", version: "x" }),
  });
  assert.equal(ok.status, 200);
  assert.equal(ok.headers.get("Content-Type"), "image/png");

  const missing = await variantImage(new Request("http://localhost/x"), {
    params: Promise.resolve({ slug: base.slug, variantId: "var-photo-test", index: "5", version: "x" }),
  });
  assert.equal(missing.status, 404);
});
