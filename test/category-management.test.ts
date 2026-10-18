import test from "node:test";
import assert from "node:assert/strict";
import { categoryService } from "../src/services/category.service";
import { productService } from "../src/services/product.service";
import { GET as getCategories } from "../src/app/api/categories/route";
import { POST as createCategory } from "../src/app/api/admin/categories/route";
import { PUT as updateCategory, DELETE as deleteCategory } from "../src/app/api/admin/categories/[id]/route";
import { NextRequest } from "next/server";

test("Category Management: Initial seeded categories are available", async () => {
  const all = await categoryService.getAll();
  assert.ok(all.length >= 5, `Expected at least 5 categories, got ${all.length}`);

  const diffusers = await categoryService.getById("aroma-diffusers");
  assert.ok(diffusers, "aroma-diffusers should exist");
  assert.equal(diffusers?.name, "Diffuser");

  const candles = await categoryService.getById("candles");
  assert.ok(candles, "candles category should exist");
});

test("Category Management: API GET /api/categories returns success with data", async () => {
  const req = new NextRequest("http://localhost:3000/api/categories");
  const res = await getCategories(req);
  assert.equal(res.status, 200);

  const json = await res.json();
  assert.equal(json.success, true);
  assert.ok(Array.isArray(json.data));
  assert.ok(json.data.length >= 5);
});

test("Category Management: Create, Update, and Delete category lifecycle via Admin API", async () => {
  const testSlug = `test-luxury-room-sprays-${Date.now()}`;
  const createPayload = {
    name: "Luxury Room Sprays",
    slug: testSlug,
    tagline: "Fine French Mist Formulations",
    description: "Instant botanical atmosphere for luxury residences and penthouses.",
    image: "/uploads/test-room-spray.jpg",
    featuredInHome: true,
    displayOrder: 99,
    subCategories: [
      { id: "amber-mist", label: "Amber Mist" },
      { id: "velvet-rose", label: "Velvet Rose" },
    ],
  };

  // 1. Create
  const createReq = new NextRequest("http://localhost:3000/api/admin/categories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(createPayload),
  });
  const createRes = await createCategory(createReq);
  assert.equal(createRes.status, 200);

  const createJson = await createRes.json();
  assert.equal(createJson.success, true);
  assert.equal(createJson.data.slug, testSlug);
  assert.equal(createJson.data.tagline, "Fine French Mist Formulations");
  assert.equal(createJson.data.featuredInHome, true);

  // 2. Verify in CategoryService and ProductService (Dynamic resolution)
  const fetched = await categoryService.getById(testSlug);
  assert.ok(fetched, "Newly created category must be retrievable by slug");
  assert.equal(fetched?.name, "Luxury Room Sprays");

  const resolvedViaProductService = await productService.getCategoryById(testSlug as any);
  assert.ok(resolvedViaProductService, "productService.getCategoryById must dynamically resolve new category");
  assert.equal(resolvedViaProductService?.name, "Luxury Room Sprays");

  // 3. Update
  const updateReq = new NextRequest(`http://localhost:3000/api/admin/categories/${testSlug}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Ultra Luxury Room Sprays",
      featuredInHome: false,
    }),
  });
  const updateRes = await updateCategory(updateReq, { params: Promise.resolve({ id: testSlug }) });
  assert.equal(updateRes.status, 200);
  const updateJson = await updateRes.json();
  assert.equal(updateJson.success, true);
  assert.equal(updateJson.data.name, "Ultra Luxury Room Sprays");
  assert.equal(updateJson.data.featuredInHome, false);

  // 4. Delete
  const deleteReq = new NextRequest(`http://localhost:3000/api/admin/categories/${testSlug}`, {
    method: "DELETE",
  });
  const deleteRes = await deleteCategory(deleteReq, { params: Promise.resolve({ id: testSlug }) });
  assert.equal(deleteRes.status, 200);
  const deleteJson = await deleteRes.json();
  assert.equal(deleteJson.success, true);

  // 5. Verify deleted
  const checkDeleted = await categoryService.getById(testSlug);
  assert.equal(checkDeleted, null, "Deleted category should no longer exist");
});
