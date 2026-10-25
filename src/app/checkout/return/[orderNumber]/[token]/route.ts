import { NextRequest, NextResponse } from "next/server";
import { getSiteUrl } from "@/lib/site-url";

/**
 * Where PayHere sends customers after paying. The order reference is in the path
 * (PayHere may append its own query string), and we pass it on to the confirmation page.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ orderNumber: string; token: string }> }
) {
  const { orderNumber, token } = await params;
  const target = new URL("/checkout/success", getSiteUrl());
  target.searchParams.set("orderNumber", orderNumber);
  target.searchParams.set("token", token);
  return NextResponse.redirect(target);
}
