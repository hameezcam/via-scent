import { NextRequest, NextResponse } from "next/server";
import { warrantyService, SubmitWarrantyInput } from "@/services/warranty.service";
import { clientIp, isRateLimited, sendFormEmail, singleLine } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    if (isRateLimited(clientIp(req.headers))) {
      return NextResponse.json({ error: "Too many submissions. Please wait a few minutes." }, { status: 429 });
    }

    const body: SubmitWarrantyInput = await req.json();

    if (!body.orderNumber || !body.productSku || !body.reportedIssue || !body.customerEmail) {
      return NextResponse.json(
        { error: "Order number, product SKU, customer email, and issue description are required." },
        { status: 400 }
      );
    }

    const claim = warrantyService.submitClaim(body);

    // The claims store is not yet persistent on Vercel, so email is the
    // record staff can rely on. Fail the request if it can't be delivered.
    const emailed = await sendFormEmail({
      subject: `Warranty claim ${singleLine(claim.claimNumber)}: order ${singleLine(String(body.orderNumber))}`,
      heading: "New warranty claim",
      replyTo: String(body.customerEmail),
      fields: [
        { label: "Claim number", value: claim.claimNumber },
        { label: "Order number", value: String(body.orderNumber).slice(0, 100) },
        { label: "Customer", value: String(body.customerName || "").slice(0, 150) },
        { label: "Email", value: String(body.customerEmail).slice(0, 254) },
        { label: "Phone", value: String(body.customerPhone || "").slice(0, 40) },
        { label: "Product", value: `${String(body.productName || "").slice(0, 150)} (${String(body.productSku).slice(0, 100)})` },
        { label: "Purchase date", value: String(body.purchaseDate || "").slice(0, 40) },
        { label: "Reported issue", value: String(body.reportedIssue).slice(0, 5000) },
        { label: "Evidence notes", value: String(body.evidenceNotes || "").slice(0, 5000) },
      ],
    });
    if (!emailed) {
      return NextResponse.json(
        { error: "We couldn't submit your claim right now. Please email info@vialk.com with your order number." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      claim,
      message: `Warranty claim ${claim.claimNumber} logged under VIA Scent 6-month official franchisee coverage.`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error submitting warranty claim.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
