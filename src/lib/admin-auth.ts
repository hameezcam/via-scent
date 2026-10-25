/**
 * Admin Session Authentication
 *
 * A single admin login configured through environment variables:
 * - ADMIN_EMAIL           login email (defaults to admin@viascent.lk)
 * - ADMIN_PASSWORD        required; admin access is refused until it is set
 * - ADMIN_SESSION_SECRET  recommended; signs session cookies (falls back to ADMIN_PASSWORD)
 *
 * Sessions are stateless HMAC-signed cookies, verified with Web Crypto so the
 * same code runs in the proxy and in route handlers.
 */

export const ADMIN_SESSION_COOKIE = "via_admin_session";
export const ADMIN_SESSION_MAX_AGE_SECONDS = 60 * 60 * 12; // 12 hours

const encoder = new TextEncoder();

function getSecret(): string | null {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || null;
}

export function getAdminEmail(): string {
  return (process.env.ADMIN_EMAIL || "admin@viascent.lk").trim().toLowerCase();
}

export function isAdminAuthConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD);
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): string {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (value.length % 4)) % 4);
  return atob(padded);
}

async function sign(payload: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return toBase64Url(new Uint8Array(signature));
}

/** Compares two strings without leaking where they differ through timing. */
export function safeEqual(a: string, b: string): boolean {
  const aBytes = encoder.encode(a);
  const bBytes = encoder.encode(b);
  let diff = aBytes.length ^ bBytes.length;
  for (let i = 0; i < Math.max(aBytes.length, bBytes.length); i++) {
    diff |= (aBytes[i] ?? 0) ^ (bBytes[i] ?? 0);
  }
  return diff === 0;
}

export function verifyAdminCredentials(email: string, password: string): boolean {
  const expectedPassword = process.env.ADMIN_PASSWORD;
  if (!expectedPassword) return false;
  const emailOk = safeEqual(email.trim().toLowerCase(), getAdminEmail());
  const passwordOk = safeEqual(password, expectedPassword);
  return emailOk && passwordOk;
}

export async function createAdminSessionToken(email: string): Promise<string> {
  const secret = getSecret();
  if (!secret) throw new Error("Admin authentication is not configured.");
  const expiresAt = Date.now() + ADMIN_SESSION_MAX_AGE_SECONDS * 1000;
  const payload = toBase64Url(encoder.encode(JSON.stringify({ email, expiresAt })));
  return `${payload}.${await sign(payload, secret)}`;
}

/** Returns the admin email for a valid, unexpired session token, otherwise null. */
export async function verifyAdminSessionToken(token: string | undefined | null): Promise<string | null> {
  const secret = getSecret();
  if (!token || !secret) return null;

  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  if (!safeEqual(signature, await sign(payload, secret))) return null;

  try {
    const { email, expiresAt } = JSON.parse(fromBase64Url(payload));
    if (typeof email !== "string" || typeof expiresAt !== "number" || expiresAt < Date.now()) {
      return null;
    }
    return email;
  } catch {
    return null;
  }
}
