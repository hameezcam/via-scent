import test, { beforeEach } from "node:test";
import assert from "node:assert/strict";
import { orderService } from "../src/services/order.service";
import { settingsService } from "../src/services/settings.service";
import { PRODUCTS } from "../src/data/products";

// Ensure pristine baseline settings before tests
beforeEach(() => {
  settingsService.updateDeliverySettings({
    defaultCourierFeeLKR: 500,
    districtFees: {},
    freeDeliveryThresholdLKR: null,
  });
});

test("Pricing & Delivery: Default courier fee is LKR 500 per order", () => {
  const currentFee = settingsService.getDeliveryFee();
  assert.equal(currentFee, 500, "Default courier fee must be LKR 500");
});

test("Pricing & Delivery: Decimal-safe subtotal calculation prevents floating-point inaccuracies", () => {
  const product = PRODUCTS[0];
  const variant = product.variants[0];
  const unitPrice = variant ? variant.priceLKR : product.basePriceLKR;

  const quantity = 3;
  const result = orderService.calculateCheckoutTotals([
    {
      productId: product.id,
      variantId: variant ? variant.id : "default",
      quantity,
    },
  ]);

  const expectedSubtotal = unitPrice * quantity;
  assert.equal(
    result.merchandiseSubtotalLKR,
    expectedSubtotal,
    "Merchandise subtotal must accurately match integer-safe minor unit multiplication"
  );
  assert.equal(result.deliveryFeeLKR, 500, "Delivery fee must default to LKR 500");
  assert.equal(
    result.totalLKR,
    expectedSubtotal + 500,
    "Total must equal subtotal + delivery fee"
  );
});

test("Pricing & Delivery: Free delivery threshold applies when configured", () => {
  try {
    settingsService.updateDeliverySettings({
      freeDeliveryThresholdLKR: 40000,
      defaultCourierFeeLKR: 500,
    });

    const highValueItem = PRODUCTS.find((p) => p.basePriceLKR >= 40000) || PRODUCTS[0];
    const result = orderService.calculateCheckoutTotals([
      {
        productId: highValueItem.id,
        variantId: highValueItem.variants[0]?.id || "default",
        quantity: 2,
      },
    ]);

    assert.equal(
      result.deliveryFeeLKR,
      0,
      "Delivery fee must be waived (0 LKR) when subtotal exceeds free delivery threshold"
    );
  } finally {
    settingsService.updateDeliverySettings({
      freeDeliveryThresholdLKR: null,
      defaultCourierFeeLKR: 500,
    });
  }
});

test("Pricing & Delivery: Immutable snapshot retention - previous orders retain original fee when delivery fee changes", () => {
  try {
    // Step 1: Ensure baseline fee is LKR 500 and districtFees is empty
    settingsService.updateDeliverySettings({ defaultCourierFeeLKR: 500, districtFees: {} });

    const product = PRODUCTS[0];
    const order1 = orderService.createOrder({
      customer: {
        fullName: "Nimal Fernando",
        email: "nimal@example.com",
        phone: "+94771234567",
        addressLine1: "123 Galle Rd",
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

    assert.equal(order1.pricingSnapshot.deliveryFeeLKR, 500, "Order 1 snapshot must be 500 LKR");

    // Step 2: Administrator updates delivery fee to LKR 750 without redeploying code
    settingsService.updateDeliverySettings({ defaultCourierFeeLKR: 750, districtFees: {} }, "superadmin@viascent.lk");
    assert.equal(settingsService.getDeliveryFee(), 750, "Active store delivery fee must now be 750 LKR");

    // Step 3: Checkout for a new order reflects the new fee (750 LKR)
    const order2 = orderService.createOrder({
      customer: {
        fullName: "Kamal Perera",
        email: "kamal@example.com",
        phone: "+94779876543",
        addressLine1: "45 Kandy Rd",
        city: "Kandy",
        district: "Kandy",
        postalCode: "20000",
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

    assert.equal(order2.pricingSnapshot.deliveryFeeLKR, 750, "Order 2 snapshot must reflect new 750 LKR fee");

    // Step 4: CRITICAL ACCEPTANCE CRITERIA: Order 1 MUST retain its original LKR 500 fee snapshot!
    const fetchedOrder1 = orderService.getOrderById(order1.id);
    assert.equal(
      fetchedOrder1?.pricingSnapshot.deliveryFeeLKR,
      500,
      "Previously placed Order 1 MUST retain its immutable original LKR 500 delivery fee"
    );
  } finally {
    // Restore fee back to default 500
    settingsService.updateDeliverySettings({ defaultCourierFeeLKR: 500, districtFees: {} });
  }
});
