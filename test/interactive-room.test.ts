import { test } from "node:test";
import assert from "node:assert";
import { interactiveRoomService, SCENE_PRESETS } from "../src/services/interactive-room.service";
import { productService } from "../src/services/product.service";

test("Interactive Shoppable Room: Configuration loads with valid structure", async () => {
  const config = await interactiveRoomService.getConfig();

  assert.ok(config, "Config should exist");
  assert.strictEqual(config.title, "NEW COLLECTION");
  assert.ok(config.subtitle.includes("Discover the fragrances that transform your space"));
  assert.ok(config.imageUrl, "Image URL must be defined");
  assert.ok(Array.isArray(config.hotspots), "Hotspots must be an array");
  assert.ok(config.hotspots.length > 0, "At least 1 hotspot must be configured");
});

test("Interactive Shoppable Room: Hotspots have valid bounded percentage coordinates", async () => {
  const config = await interactiveRoomService.getConfig();

  for (const hotspot of config.hotspots) {
    assert.ok(
      hotspot.x >= 0 && hotspot.x <= 100,
      `Hotspot ${hotspot.id} x coordinate (${hotspot.x}) must be between 0 and 100%`
    );
    assert.ok(
      hotspot.y >= 0 && hotspot.y <= 100,
      `Hotspot ${hotspot.id} y coordinate (${hotspot.y}) must be between 0 and 100%`
    );
    assert.ok(hotspot.productId, `Hotspot ${hotspot.id} must have a productId`);
    assert.ok(hotspot.productSlug, `Hotspot ${hotspot.id} must have a productSlug`);
    assert.ok(hotspot.productPriceLKR > 0, `Hotspot ${hotspot.id} must have a positive LKR price`);
  }
});

test("Interactive Shoppable Room: Hotspots map to actual products in catalogue", async () => {
  const config = await interactiveRoomService.getConfig();
  const allProducts = await productService.getAll();

  for (const hotspot of config.hotspots) {
    const matched = allProducts.find(
      (p) => p.id === hotspot.productId || p.slug === hotspot.productSlug
    );
    assert.ok(
      matched,
      `Hotspot product '${hotspot.productSlug}' must exist in the real product catalogue`
    );
    assert.strictEqual(
      hotspot.productPriceLKR,
      matched.basePriceLKR,
      `Hotspot price must synchronize with catalogue basePriceLKR for ${matched.name}`
    );
  }
});

test("Interactive Shoppable Room: Scene presets are defined with lifestyle images", async () => {
  assert.ok(SCENE_PRESETS.length >= 3, "At least 3 architectural presets must be available");
  for (const preset of SCENE_PRESETS) {
    assert.ok(preset.id, "Preset must have an id");
    assert.ok(preset.name, "Preset must have a name");
    assert.ok(preset.imageUrl.startsWith("/images/home/"), "Preset image must be in /images/home/");
    assert.ok(preset.recommendedHotspots.length > 0, "Preset must have recommended hotspot coordinates");
  }
});
