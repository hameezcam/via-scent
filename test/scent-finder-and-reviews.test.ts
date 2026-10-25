import test from "node:test";
import assert from "node:assert/strict";
import { recommendProducts, coverageSqft } from "../src/lib/scent-finder";
import { reviewService, summarize } from "../src/services/review.service";
import { productService } from "../src/services/product.service";
import { orderService } from "../src/services/order.service";
import type { Product } from "../src/types/product";

function product(overrides: Partial<Product>): Product {
  return {
    id: overrides.slug ?? "p",
    slug: "p",
    name: "Product",
    tagline: "A product.",
    sku: "SKU",
    category: "fragrance-oils",
    categoryName: "Oils",
    basePriceLKR: 10000,
    images: [],
    featured: false,
    isBestseller: false,
    inStock: true,
    stockStatus: "In Stock",
    shortDescription: "",
    description: "",
    features: [],
    specifications: [],
    variants: [],
    drScentAuthorized: true,
    ...overrides,
  };
}

const catalogue: Product[] = [
  product({ slug: "mini", name: "Mini Diffuser", category: "aroma-diffusers", coverageArea: "Up to 300 sq.ft (28 m²)" }),
  product({ slug: "zen", name: "Zen Diffuser", category: "aroma-diffusers", coverageArea: "Up to 775 sq.ft (72 m²)" }),
  product({ slug: "big", name: "Classic Big Diffuser", category: "aroma-diffusers", coverageArea: "Up to 8,611 sq.ft (800 m²)" }),
  product({ slug: "car", name: "Fresh Drive (Car Diffuser)", category: "aroma-diffusers", tagline: "For your car." }),
  product({ slug: "oud", name: "Royal Oud & Amber", scentFamily: "woody" }),
  product({ slug: "tea", name: "White Tea & Bergamot", scentFamily: "fresh" }),
  product({ slug: "lily", name: "Lily Aerosol Spray", category: "sprays", scentFamily: "floral" }),
  product({ slug: "pet", name: "Pet Odor Eliminator", category: "sprays", subCategory: "odor-eliminator", scentFamily: "citrus" }),
  product({ slug: "hidden", name: "Unpublished Oud", scentFamily: "woody", isPublished: false }),
];
const slugs = (picks: { product: Product }[]) => picks.map((p) => p.product.slug);

test("Scent finder: reads coverage in sq ft and m²", () => {
  assert.equal(coverageSqft(catalogue[2]), 8611);
  assert.equal(coverageSqft(product({ coverageArea: "Up to 100 m²" })), 1076);
  assert.equal(coverageSqft(product({ coverageArea: "Personal space" })), null);
});

test("Scent finder: home diffuser picks the smallest machine that covers the room, then matching oils", () => {
  const picks = recommendProducts(catalogue, { space: "home", goal: "diffuser", size: "medium", mood: "warm" });
  assert.deepEqual(slugs(picks), ["zen", "oud", "tea"]);
  assert.match(picks[0].reason, /775 sq ft/);
});

test("Scent finder: business with a large space gets the big machine", () => {
  const picks = recommendProducts(catalogue, { space: "business", size: "large", mood: "fresh" });
  assert.equal(picks[0].product.slug, "big");
  assert.equal(picks[1].product.slug, "tea");
});

test("Scent finder: car, spray and odour answers stay in the right products", () => {
  assert.equal(recommendProducts(catalogue, { space: "car", mood: "fresh" })[0].product.slug, "car");
  assert.equal(recommendProducts(catalogue, { space: "home", goal: "spray", mood: "floral" })[0].product.slug, "lily");
  assert.equal(recommendProducts(catalogue, { space: "home", goal: "odor", mood: "fresh" })[0].product.slug, "pet");
});

test("Scent finder: never recommends unpublished products", () => {
  const picks = recommendProducts(catalogue, { space: "home", goal: "oil", mood: "warm" });
  assert.ok(!slugs(picks).includes("hidden"));
});

test("Reviews: summary averages to one decimal", () => {
  assert.deepEqual(summarize([{ rating: 5 }, { rating: 4 }, { rating: 4 }]), { average: 4.3, count: 3 });
  assert.deepEqual(summarize([]), { average: 0, count: 0 });
});

test("Reviews: invalid submissions are refused", async () => {
  const [p] = await productService.getAll();
  const noStars = await reviewService.submitReview({ productId: p.id, rating: 0, body: "Lovely scent overall", authorName: "A" });
  assert.equal(noStars.success, false);
  const tooShort = await reviewService.submitReview({ productId: p.id, rating: 5, body: "ok", authorName: "A" });
  assert.equal(tooShort.success, false);
  const noProduct = await reviewService.submitReview({ productId: "missing", rating: 5, body: "Lovely scent overall", authorName: "A" });
  assert.equal(noProduct.success, false);
});

test("Reviews: new reviews stay hidden until approved, and never expose the email", async () => {
  const [p] = await productService.getAll();
  const result = await reviewService.submitReview({
    productId: p.id,
    rating: 4,
    body: "Fills the whole living room.",
    authorName: "Nimali",
    authorEmail: "nimali@example.lk",
  });
  assert.ok(result.success);
  if (!result.success) return;
  assert.equal(result.review.status, "pending");
  assert.equal(result.review.verifiedPurchase, false);

  let shown = await reviewService.getApprovedForProduct(p.id);
  assert.ok(!shown.reviews.some((r) => r.id === result.review.id));

  await reviewService.setStatus(result.review.id, "approved", "admin@test");
  shown = await reviewService.getApprovedForProduct(p.id);
  const visible = shown.reviews.find((r) => r.id === result.review.id);
  assert.ok(visible);
  assert.ok(!("authorEmail" in visible));
  assert.ok(shown.summary.count >= 1);
});

test("Reviews: a matching order number and email marks a verified buyer", async () => {
  const catalogueItems = await productService.getAll();
  const item = catalogueItems.find((p) => (p.variants[0]?.priceLKR ?? p.basePriceLKR) > 0)!;
  const order = await orderService.createOrder({
    customer: {
      fullName: "Kamal Silva",
      email: "Kamal@Example.lk",
      phone: "0770000000",
      addressLine1: "1 Main St",
      city: "Kandy",
      district: "Kandy",
    },
    items: [{ productId: item.id, variantId: item.variants[0]?.id ?? "default", quantity: 1 }],
    paymentMethod: "cod",
  });

  const verified = await reviewService.submitReview({
    productId: item.id,
    rating: 5,
    body: "Exactly as described, love it.",
    authorName: "Kamal",
    authorEmail: "kamal@example.lk",
    orderNumber: order.orderNumber.toLowerCase(),
  });
  assert.ok(verified.success && verified.review.verifiedPurchase);

  const wrongEmail = await reviewService.submitReview({
    productId: item.id,
    rating: 5,
    body: "Exactly as described, love it.",
    authorName: "Someone",
    authorEmail: "other@example.lk",
    orderNumber: order.orderNumber,
  });
  assert.ok(wrongEmail.success && !wrongEmail.review.verifiedPurchase);
});
