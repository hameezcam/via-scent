import { NextRequest, NextResponse } from "next/server";
import { returnsService, SubmitReturnInput } from "@/services/returns.service";

export async function POST(req: NextRequest) {
  try {
    const body: SubmitReturnInput = await req.json();

    if (!body.orderNumber || !body.customerEmail || !body.itemSku || !body.reason) {
      return NextResponse.json(
        { error: "Order number, customer email, item SKU, and reason are required." },
        { status: 400 }
      );
    }

    const result = await returnsService.submitReturn(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error || "Failed to submit return." }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      returnRequest: result.returnRequest,
      message: result.returnRequest?.isWithin7Days
        ? "Your return request has been recorded within our 7-day policy window. Our concierge will review it within 24 hours."
        : "Your return request has been submitted past the standard 7-day window and will undergo discretionary review.",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error submitting return request.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
