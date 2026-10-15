import test from "node:test";
import assert from "node:assert/strict";
import { returnsService } from "../src/services/returns.service";
import { warrantyService } from "../src/services/warranty.service";
import { settingsService } from "../src/services/settings.service";
import { orderService } from "../src/services/order.service";
import { PRODUCTS } from "../src/data/products";

test("Policies & Claims: 7-Day return policy marks recent orders as eligible", () => {
  // Create an order
  const product = PRODUCTS[0];
  const order = orderService.createOrder({
    customer: {
      fullName: "Chamari Atapattu",
      email: "chamari@example.com",
      phone: "+94771122334",
      addressLine1: "Colombo 07",
      city: "Colombo",
      district: "Colombo",
      postalCode: "00700",
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

  // Submit return immediately
  const returnRes = returnsService.submitReturn({
    orderNumber: order.orderNumber,
    customerName: "Chamari Atapattu",
    customerEmail: "chamari@example.com",
    customerPhone: "+94771122334",
    itemSku: product.sku,
    itemName: product.name,
    reason: "Damaged in transit",
    details: "Outer glass vial was cracked during delivery",
    refundMethod: "bank_transfer_cod",
  });

  assert.equal(returnRes.success, true);
  assert.equal(returnRes.returnRequest?.isWithin7Days, true, "Must be within 7-day policy window");
  assert.equal(returnRes.returnRequest?.status, "REQUESTED");
  assert.ok(returnRes.returnRequest?.returnNumber.startsWith("RET-"));
});

test("Policies & Claims: 8-Stage return workflow administrative status transitions", () => {
  const product = PRODUCTS[0];
  const order = orderService.createOrder({
    customer: {
      fullName: "Kusal Mendis",
      email: "kusal@example.com",
      phone: "+94772233445",
      addressLine1: "Moratuwa",
      city: "Moratuwa",
      district: "Colombo",
      postalCode: "10400",
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

  const returnRes = returnsService.submitReturn({
    orderNumber: order.orderNumber,
    customerName: "Kusal Mendis",
    customerEmail: "kusal@example.com",
    customerPhone: "+94772233445",
    itemSku: product.sku,
    itemName: product.name,
    reason: "Defective unit",
    details: "Pump not atomizing",
    refundMethod: "bank_transfer_cod",
  });

  const returnId = returnRes.returnRequest!.id;

  // Transition through required statuses
  const underReview = returnsService.updateReturnStatus(
    returnId,
    "UNDER_REVIEW",
    "admin@viascent.lk",
    "Reviewing customer photo evidence"
  );
  assert.equal(underReview.status, "UNDER_REVIEW");

  const approved = returnsService.updateReturnStatus(
    returnId,
    "APPROVED",
    "admin@viascent.lk",
    "Replacement or refund authorized"
  );
  assert.equal(approved.status, "APPROVED");

  const received = returnsService.updateReturnStatus(
    returnId,
    "RECEIVED",
    "warehouse@viascent.lk",
    "Defective unit arrived at Colombo warehouse"
  );
  assert.equal(received.status, "RECEIVED");

  const refunded = returnsService.updateReturnStatus(
    returnId,
    "REFUNDED",
    "finance@viascent.lk",
    "Bank transfer SLIPS confirmed",
    35000
  );
  assert.equal(refunded.status, "REFUNDED");
  assert.equal(refunded.refundAmountLKR, 35000);
});

test("Policies & Claims: Hardware warranty defaults to 6 months for diffusers", () => {
  const claim = warrantyService.submitClaim({
    orderNumber: "VIA-20261014-9988",
    productSku: "DRS-DIFF-01",
    customerName: "Mahela Jayawardene",
    customerEmail: "mahela@example.com",
    customerPhone: "+94773344556",
    productName: "Dr. Scent Smart Diffuser",
    reportedIssue: "Nozzle clogged after 2 months of regular use",
    evidenceNotes: "Purchased with official franchisee receipt",
    purchaseDate: new Date().toISOString(),
  });

  assert.ok(claim, "Claim must be returned");
  assert.equal(
    claim.warrantyDurationMonths,
    6,
    "Default hardware warranty duration must be 6 months"
  );
  assert.equal(claim.status, "SUBMITTED");

  // Technician update
  const updatedClaim = warrantyService.updateClaimStatus(
    claim.id,
    "APPROVED_REPAIR",
    "technician@viascent.lk",
    "Pump ultrasonically cleaned and nozzle replaced under warranty"
  );
  assert.equal(updatedClaim.status, "APPROVED_REPAIR");
});

test("Policies & Claims: Sensitive settings updates are recorded in audit trail", () => {
  const prevLogsCount = settingsService.getAuditLogs().length;

  settingsService.updateReturnSettings(
    { returnWindowDays: 7, refundWindowDays: 7 },
    "compliance_officer@viascent.lk"
  );

  const newLogs = settingsService.getAuditLogs();
  assert.ok(newLogs.length > prevLogsCount, "An audit log entry must be appended");

  const latestLog = newLogs[0];
  assert.equal(latestLog.category, "RETURNS");
  assert.equal(latestLog.action, "UPDATE_RETURN_SETTINGS");
  assert.equal(latestLog.performedBy, "compliance_officer@viascent.lk");
});

test("Catalogue Management: Administrators can permanently delete a product", async () => {
  const { productService } = await import("../src/services/product.service");
  const newProduct = await productService.createProduct({
    slug: `test-delete-${Date.now()}`,
    name: "Test Delete Fragrance",
    tagline: "Temporary product for delete test",
    sku: `TEST-DEL-${Date.now()}`,
    category: "fragrance-oils",
    categoryName: "Fragrance Oils",
    basePriceLKR: 8500,
    images: ["https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1000&q=85"],
    featured: false,
    isBestseller: false,
    inStock: true,
    stockStatus: "In Stock",
    shortDescription: "Short test description",
    description: "Detailed test description",
    features: ["Test feature"],
    specifications: [{ label: "Size", value: "50ml" }],
    variants: [],
    drScentAuthorized: true,
  });

  const createdId = newProduct.id;
  assert.ok(createdId, "Product ID must exist");

  // Verify it exists
  const foundBefore = await productService.getById(createdId);
  assert.ok(foundBefore, "Product must be found before delete");

  // Delete product
  const deleted = await productService.deleteProduct(createdId, "admin@viascent.lk");
  assert.equal(deleted, true);

  // Verify it no longer exists
  const foundAfter = await productService.getById(createdId);
  assert.equal(foundAfter, null, "Product must no longer exist after deletion");
});

