import { NextRequest, NextResponse } from "next/server";
import { warrantyService } from "@/services/warranty.service";

export async function GET() {
  const claims = await warrantyService.getAllClaims();
  return NextResponse.json(claims);
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const adminUser = req.headers.get("x-admin-user") || "admin@viascent.lk";
    const { claimId, status, resolutionNotes } = body;

    if (!claimId || !status) {
      return NextResponse.json({ error: "claimId and status are required." }, { status: 400 });
    }

    const updated = await warrantyService.updateClaimStatus(claimId, status, adminUser, resolutionNotes);
    return NextResponse.json({ success: true, claim: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update warranty claim.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
