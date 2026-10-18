import { NextRequest, NextResponse } from "next/server";
import { categoryService } from "@/services/category.service";
import { CategoryInput } from "@/types/category";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const categories = await categoryService.getAll();
    return NextResponse.json({
      success: true,
      data: categories,
      count: categories.length,
    });
  } catch (error) {
    console.error("[API /api/admin/categories] GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch categories." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: CategoryInput = await req.json();

    if (!body.name || !body.name.trim()) {
      return NextResponse.json(
        { success: false, error: "Category name is required." },
        { status: 400 }
      );
    }

    const created = await categoryService.create(body, "admin@viascent.lk");

    return NextResponse.json({
      success: true,
      data: created,
      message: `Category "${created.name}" created successfully.`,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create category.";
    console.error("[API /api/admin/categories] POST error:", error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 }
    );
  }
}
