import { NextRequest, NextResponse } from "next/server";
import { returnsService } from "@/services/returns.service";

export async function GET() {
  const returns = await returnsService.getAllReturns();
  return NextResponse.json(returns);
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const adminUser = req.headers.get("x-admin-user") || "admin@viascent.lk";
    const { returnId, status, notes, refundAmountLKR } = body;

    if (!returnId || !status) {
      return NextResponse.json({ error: "returnId and status are required." }, { status: 400 });
    }

    const updated = await returnsService.updateReturnStatus(returnId, status, adminUser, notes, refundAmountLKR);
    return NextResponse.json({ success: true, returnRequest: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update return request.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
