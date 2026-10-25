import { createHash } from "crypto";
import type { Product } from "@/types/product";

/**
 * Product photos uploaded through the admin are stored inline as data: URLs.
 * Sending those to the browser makes every page that lists products several
 * megabytes, so storefront pages swap them for a cacheable image route
 * (src/app/api/products/[slug]/images/[index]/[version]/route.ts).
 * The version segment changes whenever the photo does, so the route can be
 * cached forever.
 */

function imageVersion(dataUrl: string): string {
  return createHash("sha1").update(dataUrl).digest("hex").slice(0, 12);
}

export function productImageUrl(slug: string, index: number, dataUrl: string): string {
  return `/api/products/${encodeURIComponent(slug)}/images/${index}/${imageVersion(dataUrl)}`;
}

export function withServedImages(product: Product): Product {
  if (!product.images?.some((src) => src?.startsWith("data:"))) return product;
  return {
    ...product,
    images: product.images.map((src, idx) =>
      src?.startsWith("data:") ? productImageUrl(product.slug, idx, src) : src
    ),
  };
}

export function withServedImagesAll(products: Product[]): Product[] {
  return products.map(withServedImages);
}

/** Decodes a base64 data: URL into its bytes and content type. */
export function decodeDataUrl(dataUrl: string): { contentType: string; body: Buffer } | null {
  const match = /^data:([\w.+-]+\/[\w.+-]+)?(;base64)?,([\s\S]*)$/.exec(dataUrl);
  if (!match) return null;
  const [, contentType = "application/octet-stream", isBase64, payload] = match;
  if (!contentType.startsWith("image/")) return null;
  const body = isBase64 ? Buffer.from(payload, "base64") : Buffer.from(decodeURIComponent(payload));
  return { contentType, body };
}
