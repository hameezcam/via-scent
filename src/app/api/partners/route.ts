import { NextResponse } from "next/server";
import { partnerService } from "@/services/partner.service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const partners = await partnerService.getAll(true);
    return NextResponse.json(partners);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load partners";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
