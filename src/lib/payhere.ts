import { createHash, timingSafeEqual } from "node:crypto";

/**
 * PayHere (Sri Lanka) hosted checkout.
 *
 * Customers are sent to PayHere with a signed form, pay there, and PayHere
 * tells us the result with a signed server-to-server notification.
 * Docs: https://support.payhere.lk/api-&-mobile-sdk/payhere-checkout
 *
 * Env vars:
 * - PAYHERE_MERCHANT_ID / PAYHERE_MERCHANT_SECRET: from PayHere > Settings > Domains & Credentials.
 * - PAYHERE_MODE: "live" for real payments. Anything else uses PayHere's sandbox.
 */

export type PayHereMode = "sandbox" | "live";

export interface PayHereConfig {
  merchantId: string;
  merchantSecret: string;
  mode: PayHereMode;
}

export const PAYHERE_STATUS = {
  SUCCESS: 2,
  PENDING: 0,
  CANCELED: -1,
  FAILED: -2,
  CHARGEBACK: -3,
} as const;

export function getPayHereConfig(): PayHereConfig | null {
  const merchantId = process.env.PAYHERE_MERCHANT_ID?.trim();
  const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET?.trim();
  if (!merchantId || !merchantSecret) return null;
  return { merchantId, merchantSecret, mode: process.env.PAYHERE_MODE?.trim() === "live" ? "live" : "sandbox" };
}

export function isPayHereConfigured(): boolean {
  return getPayHereConfig() !== null;
}

const md5Upper = (value: string) => createHash("md5").update(value).digest("hex").toUpperCase();

/** PayHere signs amounts with exactly two decimals and no thousands separators. */
export function formatPayHereAmount(amountLKR: number): string {
  return amountLKR.toFixed(2);
}

export function payHereCheckoutUrl(mode: PayHereMode): string {
  return mode === "live" ? "https://www.payhere.lk/pay/checkout" : "https://sandbox.payhere.lk/pay/checkout";
}

/** Signature that proves to PayHere the amount and order really came from us. */
export function signCheckout(config: PayHereConfig, orderId: string, amountLKR: number): string {
  return md5Upper(
    `${config.merchantId}${orderId}${formatPayHereAmount(amountLKR)}LKR${md5Upper(config.merchantSecret)}`
  );
}

export interface PayHereNotification {
  merchantId: string;
  orderId: string;
  amount: string;
  currency: string;
  statusCode: string;
  signature: string;
}

/** Checks that a payment notification really came from PayHere. */
export function verifyNotification(config: PayHereConfig, n: PayHereNotification): boolean {
  const expected = md5Upper(
    `${n.merchantId}${n.orderId}${n.amount}${n.currency}${n.statusCode}${md5Upper(config.merchantSecret)}`
  );
  const received = n.signature.trim().toUpperCase();
  const a = Buffer.from(expected);
  const b = Buffer.from(received);
  return a.length === b.length && timingSafeEqual(a, b);
}

export interface PayHereCheckoutOrder {
  orderNumber: string;
  confirmationToken: string;
  totalLKR: number;
  customer: { fullName: string; email: string; phone: string; addressLine1: string; addressLine2?: string; city: string };
}

export interface PayHereCheckoutForm {
  action: string;
  fields: Record<string, string>;
}

export function buildCheckoutForm(config: PayHereConfig, order: PayHereCheckoutOrder, siteUrl: string): PayHereCheckoutForm {
  const nameParts = order.customer.fullName.trim().split(/\s+/);
  const firstName = nameParts[0] || "Customer";
  const lastName = nameParts.slice(1).join(" ") || firstName;

  // PayHere may add its own query string to these URLs, so the order lives in the path
  const returnUrl = `${siteUrl}/checkout/return/${encodeURIComponent(order.orderNumber)}/${encodeURIComponent(
    order.confirmationToken
  )}`;

  return {
    action: payHereCheckoutUrl(config.mode),
    fields: {
      merchant_id: config.merchantId,
      return_url: returnUrl,
      cancel_url: `${siteUrl}/checkout/payment-cancelled`,
      notify_url: `${siteUrl}/api/payhere/notify`,
      order_id: order.orderNumber,
      items: `VIA Scent order ${order.orderNumber}`,
      currency: "LKR",
      amount: formatPayHereAmount(order.totalLKR),
      first_name: firstName,
      last_name: lastName,
      email: order.customer.email,
      phone: order.customer.phone,
      address: [order.customer.addressLine1, order.customer.addressLine2].filter(Boolean).join(", "),
      city: order.customer.city,
      country: "Sri Lanka",
      hash: signCheckout(config, order.orderNumber, order.totalLKR),
    },
  };
}
