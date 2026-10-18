import { NextRequest, NextResponse } from "next/server";
import { categoryService } from "@/services/category.service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const featuredOnly = searchParams.get("featured") === "true";

    const categories = featuredOnly
      ? await categoryService.getFeaturedInHome()
      : await categoryService.getAll();

    return NextResponse.json({
      success: true,
      data: categories,
      count: categories.length,
    });
  } catch (error) {
    console.error("[API /api/categories] GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch categories." },
      { status: 500 }
    );
  }
}
