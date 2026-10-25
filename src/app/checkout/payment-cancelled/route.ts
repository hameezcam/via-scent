import { NextResponse } from "next/server";
import { getSiteUrl } from "@/lib/site-url";

/** Where PayHere sends customers who back out of paying. */
export async function GET() {
  return NextResponse.redirect(new URL("/checkout?payment=cancelled", getSiteUrl()));
}
