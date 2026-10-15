import { NextRequest, NextResponse } from "next/server";
import { warrantyService, SubmitWarrantyInput } from "@/services/warranty.service";

export async function POST(req: NextRequest) {
  try {
    const body: SubmitWarrantyInput = await req.json();

    if (!body.orderNumber || !body.productSku || !body.reportedIssue || !body.customerEmail) {
      return NextResponse.json(
        { error: "Order number, product SKU, customer email, and issue description are required." },
        { status: 400 }
      );
    }

    const claim = warrantyService.submitClaim(body);

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
