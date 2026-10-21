import { NextRequest, NextResponse } from "next/server";
import { returnsService, SubmitReturnInput } from "@/services/returns.service";
import { clientIp, isRateLimited, sendFormEmail, singleLine } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    if (isRateLimited(clientIp(req.headers))) {
      return NextResponse.json({ error: "Too many submissions. Please wait a few minutes." }, { status: 429 });
    }

    const body: SubmitReturnInput = await req.json();

    if (!body.orderNumber || !body.customerEmail || !body.itemSku || !body.reason) {
      return NextResponse.json(
        { error: "Order number, customer email, item SKU, and reason are required." },
        { status: 400 }
      );
    }

    const result = returnsService.submitReturn(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error || "Failed to submit return." }, { status: 400 });
    }

    // The returns store is not yet persistent on Vercel, so email is the
    // record staff can rely on. Fail the request if it can't be delivered.
    const r = result.returnRequest;
    const emailed = await sendFormEmail({
      subject: `Return request ${singleLine(r?.returnNumber || "")}: order ${singleLine(String(body.orderNumber))}`,
      heading: "New return / refund request",
      replyTo: String(body.customerEmail),
      fields: [
        { label: "Return number", value: r?.returnNumber },
        { label: "Order number", value: String(body.orderNumber).slice(0, 100) },
        { label: "Customer", value: String(body.customerName || "").slice(0, 150) },
        { label: "Email", value: String(body.customerEmail).slice(0, 254) },
        { label: "Phone", value: String(body.customerPhone || "").slice(0, 40) },
        { label: "Item", value: `${String(body.itemName || "").slice(0, 150)} (${String(body.itemSku).slice(0, 100)})` },
        { label: "Reason", value: String(body.reason).slice(0, 200) },
        { label: "Refund method", value: String(body.refundMethod || "").slice(0, 50) },
        { label: "Within 7-day window", value: r?.isWithin7Days ? "Yes" : "No" },
        { label: "Details", value: String(body.details || "").slice(0, 5000) },
      ],
    });
    if (!emailed) {
      return NextResponse.json(
        { error: "We couldn't submit your return right now. Please email info@vialk.com with your order number." },
        { status: 502 }
      );
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
