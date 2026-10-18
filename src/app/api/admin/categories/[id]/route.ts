import { NextRequest, NextResponse } from "next/server";
import { categoryService } from "@/services/category.service";
import { Category } from "@/types/category";

import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const category = await categoryService.getById(id);
    if (!category) {
      return NextResponse.json(
        { success: false, error: "Category not found." },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: category });
  } catch (error) {
    console.error("[API /api/admin/categories/[id]] GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch category." },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: Partial<Category> = await req.json();
    const updated = await categoryService.update(id, body, "admin@viascent.lk");

    try {
      revalidatePath("/");
      revalidatePath("/shop");
      revalidatePath(`/shop/${updated.slug}`);
      revalidatePath(`/shop/${id}`);
    } catch {
      // ignore in environments without active cache
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: `Category "${updated.name}" updated successfully.`,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update category.";
    console.error("[API /api/admin/categories/[id]] PUT error:", error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await categoryService.delete(id, "admin@viascent.lk");

    try {
      revalidatePath("/");
      revalidatePath("/shop");
      revalidatePath(`/shop/${id}`);
    } catch {
      // ignore
    }
    return NextResponse.json({
      success: true,
      message: `Category "${id}" has been deleted successfully.`,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete category.";
    console.error("[API /api/admin/categories/[id]] DELETE error:", error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 }
    );
  }
}
