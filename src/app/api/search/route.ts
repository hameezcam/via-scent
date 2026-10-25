import { NextRequest, NextResponse } from "next/server";
import { productService } from "@/services/product.service";
import { withServedImagesAll } from "@/lib/product-images";
import { matchesProduct, scoreProductRelevance } from "@/lib/search";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";

    if (!query.trim()) {
      return NextResponse.json({
        success: true,
        data: [],
        total: 0,
      });
    }

    const allProducts = await productService.getAll().then(withServedImagesAll);
    const matched = allProducts.filter((p) => matchesProduct(p, query));

    // Sort by relevance score descending
    matched.sort((a, b) => {
      const scoreA = scoreProductRelevance(a, query);
      const scoreB = scoreProductRelevance(b, query);
      return scoreB - scoreA;
    });

    return NextResponse.json({
      success: true,
      data: matched.slice(0, 10),
      total: matched.length,
    });
  } catch (error) {
    console.error("[API /api/search] Search failed:", error);
    return NextResponse.json(
      { success: false, error: "Search failed" },
      { status: 500 }
    );
  }
}
