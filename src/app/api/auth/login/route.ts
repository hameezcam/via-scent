import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE_SECONDS,
  createAdminSessionToken,
  isAdminAuthConfigured,
  verifyAdminCredentials,
} from "@/lib/admin-auth";

// Best-effort brute-force throttle (per server instance)
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;
const failedAttempts = new Map<string, { count: number; firstAt: number }>();

function clientKey(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

export async function POST(req: NextRequest) {
  if (!isAdminAuthConfigured()) {
    return NextResponse.json(
      { error: "Admin login is not configured. Set ADMIN_PASSWORD in the environment." },
      { status: 503 }
    );
  }

  const key = clientKey(req);
  const record = failedAttempts.get(key);
  if (record && Date.now() - record.firstAt < WINDOW_MS && record.count >= MAX_ATTEMPTS) {
    return NextResponse.json(
      { error: "Too many failed attempts. Please wait 15 minutes and try again." },
      { status: 429 }
    );
  }

  let email = "";
  let password = "";
  try {
    const body = await req.json();
    email = typeof body?.email === "string" ? body.email : "";
    password = typeof body?.password === "string" ? body.password : "";
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!verifyAdminCredentials(email, password)) {
    const fresh = !record || Date.now() - record.firstAt >= WINDOW_MS;
    failedAttempts.set(key, {
      count: fresh ? 1 : record.count + 1,
      firstAt: fresh ? Date.now() : record.firstAt,
    });
    return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
  }

  failedAttempts.delete(key);
  const token = await createAdminSessionToken(email.trim().toLowerCase());
  const res = NextResponse.json({ success: true });
  res.cookies.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
  });
  return res;
}
