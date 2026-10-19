import { NextResponse } from "next/server";
import { interactiveRoomService, SCENE_PRESETS } from "@/services/interactive-room.service";
import { productService } from "@/services/product.service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [config, products] = await Promise.all([
      interactiveRoomService.getConfig(),
      productService.getAll(),
    ]);

    return NextResponse.json({
      config,
      presets: SCENE_PRESETS,
      products: products.map((p) => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        basePriceLKR: p.basePriceLKR,
        categoryName: p.categoryName || "Diffuser",
        image: p.images?.[0] || "/images/categories/aroma-diffusers.jpg",
      })),
    });
  } catch (error) {
    console.error("[API/admin/interactive-room] GET error:", error);
    return NextResponse.json({ error: "Failed to load admin interactive room data" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const updated = await interactiveRoomService.updateConfig(body);
    return NextResponse.json({ success: true, config: updated });
  } catch (error) {
    console.error("[API/admin/interactive-room] PUT error:", error);
    return NextResponse.json({ error: "Failed to update interactive room config" }, { status: 500 });
  }
}
