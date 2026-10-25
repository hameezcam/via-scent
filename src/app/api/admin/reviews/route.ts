import { NextRequest, NextResponse } from "next/server";
import { reviewService } from "@/services/review.service";
import type { ReviewStatus } from "@/types/review";

const STATUSES: ReviewStatus[] = ["pending", "approved", "rejected"];

export async function GET() {
  const reviews = await reviewService.getAll();
  return NextResponse.json(reviews);
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, status } = await req.json();
    if (!id || !STATUSES.includes(status)) {
      return NextResponse.json({ error: "A review id and a valid status are required." }, { status: 400 });
    }
    const adminUser = req.headers.get("x-admin-user") || "admin";
    const review = await reviewService.setStatus(id, status, adminUser);
    return NextResponse.json({ success: true, review });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update review.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
