import { NextRequest, NextResponse, after } from "next/server";
import { reviewService } from "@/services/review.service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Honeypot: real visitors never see or fill this field
    if (body.website) {
      return NextResponse.json({ success: true });
    }

    const result = await reviewService.submitReview(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    after(() => reviewService.notifyNewReview(result.review));
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "We couldn't save your review. Please try again." }, { status: 500 });
  }
}
