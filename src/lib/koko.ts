import { createPrivateKey, createPublicKey, createSign, createVerify, type KeyObject } from "node:crypto";

/**
 * Koko (Sri Lanka) buy now, pay later: customers pay in 3 interest-free instalments.
 *
 * Customers are sent to Koko with a signed form, pay there, and Koko tells us the
 * result with a signed server-to-server POST (the response URL).
 * Docs: "Koko - API Documentation, Developer Preview v1.06".
 *
 * Env vars (all from Koko's Merchant Success team; never put these in the repo):
 * - KOKO_MERCHANT_ID / KOKO_API_KEY
 * - KOKO_PRIVATE_KEY: our RSA private key, signs the orders we send to Koko.
 * - KOKO_PUBLIC_KEY: Koko's RSA public key, checks the results Koko sends us.
 * - KOKO_MODE: "live" for real payments. Anything else uses Koko's QA environment.
 */

export type KokoMode = "qa" | "live";

export interface KokoConfig {
  merchantId: string;
  apiKey: string;
  privateKey: string;
  publicKey: string;
  mode: KokoMode;
}

export const KOKO_PLUGIN_NAME = "customapi";
export const KOKO_PLUGIN_VERSION = "1.0.1";

export const KOKO_STATUS = {
  SUCCESS: "SUCCESS",
  FAILURE: "FAILURE",
} as const;

/**
 * Keys pasted into env vars come in many shapes: with "\n" typed out instead of real new
 * lines, wrapped in quotes, or just the base64 body with no BEGIN/END lines. Tidy all of it.
 */
const normalisePem = (value: string) =>
  value
    .trim()
    .replace(/^["']|["']$/g, "")
    .replace(/\\n/g, "\n")
    .replace(/\r/g, "")
    .trim();

/** The base64 body of a key, whatever lines or header it came with. */
const keyBody = (pem: string) => pem.replace(/-----[^-]+-----/g, "").replace(/\s+/g, "");

/** Reads a private key given as PEM (PKCS#8 or PKCS#1) or as bare base64. */
export function readPrivateKey(value: string): KeyObject {
  const pem = normalisePem(value);
  if (pem.includes("-----BEGIN")) return createPrivateKey(pem);
  const der = Buffer.from(keyBody(pem), "base64");
  try {
    return createPrivateKey({ key: der, format: "der", type: "pkcs8" });
  } catch {
    return createPrivateKey({ key: der, format: "der", type: "pkcs1" });
  }
}

/** Reads a public key given as PEM (SPKI or PKCS#1) or as bare base64. */
export function readPublicKey(value: string): KeyObject {
  const pem = normalisePem(value);
  if (pem.includes("-----BEGIN")) return createPublicKey(pem);
  const der = Buffer.from(keyBody(pem), "base64");
  try {
    return createPublicKey({ key: der, format: "der", type: "spki" });
  } catch {
    return createPublicKey({ key: der, format: "der", type: "pkcs1" });
  }
}

export function getKokoConfig(): KokoConfig | null {
  const merchantId = process.env.KOKO_MERCHANT_ID?.trim();
  const apiKey = process.env.KOKO_API_KEY?.trim();
  const privateKey = process.env.KOKO_PRIVATE_KEY;
  const publicKey = process.env.KOKO_PUBLIC_KEY;
  if (!merchantId || !apiKey || !privateKey?.trim() || !publicKey?.trim()) return null;
  return {
    merchantId,
    apiKey,
    privateKey,
    publicKey,
    mode: process.env.KOKO_MODE?.trim() === "live" ? "live" : "qa",
  };
}

export function isKokoConfigured(): boolean {
  return getKokoConfig() !== null;
}

export function kokoOrderCreateUrl(mode: KokoMode): string {
  return mode === "live"
    ? "https://prodapi.paykoko.com/api/merchants/orderCreate"
    : "https://qaapi.paykoko.com/api/merchants/orderCreate";
}

/** Koko expects amounts with exactly two decimals and no thousands separators. */
export function formatKokoAmount(amountLKR: number): string {
  return amountLKR.toFixed(2);
}

const signText = (privateKey: string, text: string) =>
  createSign("RSA-SHA256").update(text).sign(readPrivateKey(privateKey), "base64");

export interface KokoCheckoutOrder {
  orderNumber: string;
  confirmationToken: string;
  totalLKR: number;
  customer: { fullName: string; email: string };
}

export interface KokoCheckoutForm {
  action: string;
  fields: Record<string, string>;
}

/**
 * The text we sign. Koko requires this exact order (it is not alphabetical).
 */
export function buildOrderDataString(fields: {
  merchantId: string;
  amount: string;
  currency: string;
  pluginName: string;
  pluginVersion: string;
  returnUrl: string;
  cancelUrl: string;
  orderId: string;
  reference: string;
  firstName: string;
  lastName: string;
  email: string;
  description: string;
  apiKey: string;
  responseUrl: string;
}): string {
  return [
    fields.merchantId,
    fields.amount,
    fields.currency,
    fields.pluginName,
    fields.pluginVersion,
    fields.returnUrl,
    fields.cancelUrl,
    fields.orderId,
    fields.reference,
    fields.firstName,
    fields.lastName,
    fields.email,
    fields.description,
    fields.apiKey,
    fields.responseUrl,
  ].join("");
}

export function buildKokoCheckoutForm(config: KokoConfig, order: KokoCheckoutOrder, siteUrl: string): KokoCheckoutForm {
  const nameParts = order.customer.fullName.trim().split(/\s+/);
  const firstName = nameParts[0] || "Customer";
  const lastName = nameParts.slice(1).join(" ") || firstName;

  // Koko may add its own query string to these URLs, so the order lives in the path
  const values = {
    merchantId: config.merchantId,
    amount: formatKokoAmount(order.totalLKR),
    currency: "LKR",
    pluginName: KOKO_PLUGIN_NAME,
    pluginVersion: KOKO_PLUGIN_VERSION,
    returnUrl: `${siteUrl}/checkout/return/${encodeURIComponent(order.orderNumber)}/${encodeURIComponent(
      order.confirmationToken
    )}`,
    cancelUrl: `${siteUrl}/checkout/payment-cancelled`,
    // Each Koko payment needs an order id that is unique across the system: our order number is
    orderId: order.orderNumber,
    reference: order.orderNumber,
    firstName,
    lastName,
    email: order.customer.email,
    description: `VIA Scent order ${order.orderNumber}`,
    apiKey: config.apiKey,
    responseUrl: `${siteUrl}/api/koko/response`,
  };

  return {
    action: kokoOrderCreateUrl(config.mode),
    fields: {
      _mId: values.merchantId,
      api_key: values.apiKey,
      _returnUrl: values.returnUrl,
      _cancelUrl: values.cancelUrl,
      _responseUrl: values.responseUrl,
      _amount: values.amount,
      _currency: values.currency,
      _reference: values.reference,
      _orderId: values.orderId,
      _pluginName: values.pluginName,
      _pluginVersion: values.pluginVersion,
      _description: values.description,
      _firstName: values.firstName,
      _lastName: values.lastName,
      _email: values.email,
      dataString: buildOrderDataString(values),
      signature: signText(config.privateKey, buildOrderDataString(values)),
    },
  };
}

export interface KokoResponse {
  orderId: string;
  trnId: string;
  status: string;
  signature: string;
}

/** Checks that a payment result really came from Koko (it signs orderId + trnId + status). */
export function verifyKokoResponse(config: KokoConfig, response: KokoResponse): boolean {
  if (!response.signature) return false;
  try {
    return createVerify("RSA-SHA256")
      .update(`${response.orderId}${response.trnId}${response.status}`)
      .verify(readPublicKey(config.publicKey), response.signature.trim(), "base64");
  } catch {
    return false;
  }
}
