import test from "node:test";
import assert from "node:assert/strict";
import { categoryService } from "../src/services/category.service";
import { productService } from "../src/services/product.service";

test("Best Sellers and Services are always editable categories", async () => {
  const all = await categoryService.getAll();
  const best = all.find((c) => c.id === "best-sellers");
  const services = all.find((c) => c.id === "services");
  assert.ok(best, "Best Sellers should be listed");
  assert.ok(services, "Services should be listed");
  assert.equal(services?.menuOnly, true);
  assert.ok(services?.subCategories?.some((s) => s.href === "/scent-finder"));
});

test("Services is a menu entry, not a shop collection", async () => {
  assert.equal(await productService.getCategoryById("services"), null);
  const shopCategories = await productService.getCategories();
  assert.ok(!shopCategories.some((c) => c.id === "services"));
});
