import { NextResponse } from "next/server";
import { productService } from "@/services/product.service";
import { decodeDataUrl } from "@/lib/product-images";

export const dynamic = "force-dynamic";

/** Serves a variant photo that is stored inline in the catalogue. See src/lib/product-images.ts. */
export async function GET(
  _req: Request,
  {
    params,
  }: { params: Promise<{ slug: string; variantId: string; index: string }> },
) {
  const { slug, variantId, index } = await params;
  const product = await productService.getBySlug(decodeURIComponent(slug));
  const variant = product?.variants?.find(
    (v) => v.id === decodeURIComponent(variantId),
  );
  const src = variant?.images?.[Number(index)];
  const decoded = src?.startsWith("data:") ? decodeDataUrl(src) : null;

  if (!decoded) {
    return NextResponse.json({ error: "Image not found." }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(decoded.body), {
    headers: {
      "Content-Type": decoded.contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
