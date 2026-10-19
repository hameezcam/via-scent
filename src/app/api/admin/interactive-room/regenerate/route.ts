import { NextResponse } from "next/server";
import { interactiveRoomService } from "@/services/interactive-room.service";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productIds, presetThemeId, customInstructions, geminiApiKey } = body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json(
        { error: "Please select at least 1 product to integrate into the living room scene." },
        { status: 400 }
      );
    }

    const recreatedConfig = await interactiveRoomService.recreateWithProducts(
      productIds,
      presetThemeId,
      customInstructions,
      geminiApiKey
    );

    return NextResponse.json({
      success: true,
      message: "Living room scene successfully recreated and synchronized with selected products!",
      config: recreatedConfig,
    });
  } catch (error) {
    console.error("[API/admin/interactive-room/regenerate] Error:", error);
    return NextResponse.json(
      { error: "Failed to recreate scene with selected products" },
      { status: 500 }
    );
  }
}
