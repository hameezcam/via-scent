import test from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { POST as checkout } from "../src/app/api/checkout/route";
import { GET as adminReceipt } from "../src/app/api/admin/orders/receipt/route";
import { validateReceiptUpload } from "../src/lib/bank-receipt";
import { orderService } from "../src/services/order.service";
import { productService } from "../src/services/product.service";
import { sanitizeBankAccounts, settingsService } from "../src/services/settings.service";

// A tiny but real PNG header is enough: the check looks at the file signature
const PNG = Buffer.from("89504e470d0a1a0a0000000d49484452", "hex").toString("base64");

const customer = {
  fullName: "Bank Buyer",
  email: "bank@example.com",
  phone: "+94771234567",
  addressLine1: "1 Test Road",
  city: "Colombo",
  district: "Colombo",
};

const ACCOUNT = { accountName: "Test Co", bankName: "Test Bank", branch: "Colombo 03", accountNumber: "123456789" };

async function checkoutBody(extra: Record<string, unknown>) {
  const product = (await productService.getAll()).find((p) => (p.variants[0]?.priceLKR ?? p.basePriceLKR) > 0)!;
  return {
    customer,
    items: [{ productId: product.id, variantId: product.variants[0]?.id, quantity: 1 }],
    ...extra,
  };
}

const post = (body: unknown) =>
  checkout(new NextRequest("http://localhost/api/checkout", { method: "POST", body: JSON.stringify(body) }));

test("receipt check accepts images and PDFs and rejects the rest", () => {
  assert.equal(validateReceiptUpload({ fileName: "slip.png", contentType: "image/png", dataBase64: PNG }).contentType, "image/png");
  const asDataUrl = validateReceiptUpload({ fileName: "a b.png", dataBase64: `data:image/png;base64,${PNG}` });
  assert.equal(asDataUrl.dataBase64, PNG);

  assert.throws(() => validateReceiptUpload(undefined), /upload your bank payment receipt/);
  assert.throws(() => validateReceiptUpload({ contentType: "text/html", dataBase64: PNG }), /photo/);
  // Says it is a PDF but is really a PNG
  assert.throws(() => validateReceiptUpload({ contentType: "application/pdf", dataBase64: PNG }), /valid image or PDF/);
  const big = Buffer.concat([Buffer.from("89504e47", "hex"), Buffer.alloc(3 * 1024 * 1024)]).toString("base64");
  assert.throws(() => validateReceiptUpload({ contentType: "image/png", dataBase64: big }), /too large/);
});

test("bank accounts are cleaned, and incomplete ones dropped", () => {
  const clean = sanitizeBankAccounts([
    { ...ACCOUNT, accountName: "  Test Co  " },
    { bankName: "No number", accountNumber: "" },
    "junk",
  ]);
  assert.equal(clean.length, 1);
  assert.equal(clean[0].accountName, "Test Co");
});

test("bank transfer is only offered when switched on and an account exists", async () => {
  await settingsService.updatePaymentSettings({ bankTransferEnabled: true, bankAccounts: [] });
  assert.equal((await settingsService.getEffectivePaymentSettings()).bankTransferEnabled, false);

  await settingsService.updatePaymentSettings({ bankTransferEnabled: true, bankAccounts: [ACCOUNT] });
  const on = await settingsService.getEffectivePaymentSettings();
  assert.equal(on.bankTransferEnabled, true);
  assert.equal(on.bankAccounts?.[0].accountNumber, "123456789");

  await settingsService.updatePaymentSettings({ bankTransferEnabled: false });
  assert.equal((await settingsService.getEffectivePaymentSettings()).bankTransferEnabled, false);
});

test("checkout refuses bank transfer while it is switched off", async () => {
  await settingsService.updatePaymentSettings({ bankTransferEnabled: false, bankAccounts: [ACCOUNT] });
  const res = await post(await checkoutBody({ paymentMethod: "bank_transfer", receipt: { contentType: "image/png", dataBase64: PNG } }));
  assert.equal(res.status, 400);
});

test("bank transfer needs a receipt, then waits for the store to confirm", async () => {
  await settingsService.updatePaymentSettings({ bankTransferEnabled: true, bankAccounts: [ACCOUNT] });

  const missing = await post(await checkoutBody({ paymentMethod: "bank_transfer" }));
  assert.equal(missing.status, 400);

  const res = await post(
    await checkoutBody({
      paymentMethod: "bank_transfer",
      receipt: { fileName: "slip.png", contentType: "image/png", dataBase64: `data:image/png;base64,${PNG}` },
    })
  );
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.paymentType, "bank_transfer");

  const order = (await orderService.getOrderById(data.orderId))!;
  assert.equal(order.payment.method, "bank_transfer");
  assert.equal(order.payment.status, "unpaid");
  assert.equal(order.status, "pending_payment");
  assert.ok(order.payment.receiptUploadedAt);
  // The file itself is kept apart from the order
  assert.equal(JSON.stringify(order).includes(PNG), false);

  const file = await adminReceipt(new NextRequest(`http://localhost/api/admin/orders/receipt?orderId=${order.id}`));
  assert.equal(file.status, 200);
  assert.equal(file.headers.get("content-type"), "image/png");

  const paid = await orderService.confirmBankTransfer(order.id, "admin@example.com");
  assert.equal(paid.payment.status, "paid");
  assert.equal(paid.status, "confirmed");

  // Confirming twice changes nothing
  const again = await orderService.confirmBankTransfer(order.id, "admin@example.com");
  assert.equal(again.history.length, paid.history.length);
});

test("only bank transfer orders can be confirmed this way", async () => {
  const product = (await productService.getAll()).find((p) => (p.variants[0]?.priceLKR ?? p.basePriceLKR) > 0)!;
  const cod = await orderService.createOrder({
    customer,
    items: [{ productId: product.id, variantId: product.variants[0]?.id, quantity: 1 }],
    paymentMethod: "cod",
  });
  await assert.rejects(() => orderService.confirmBankTransfer(cod.id, "admin@example.com"), /not paid by bank transfer/);
});
