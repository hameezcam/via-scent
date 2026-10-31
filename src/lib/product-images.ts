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

export function variantImageUrl(slug: string, variantId: string, index: number, dataUrl: string): string {
  const base = `/api/products/${encodeURIComponent(slug)}/variants/${encodeURIComponent(variantId)}`;
  return `${base}/images/${index}/${imageVersion(dataUrl)}`;
}

const hasInlineImage = (list?: string[]) => Boolean(list?.some((src) => src?.startsWith("data:")));

export function withServedImages(product: Product): Product {
  const productNeedsServing = hasInlineImage(product.images);
  const variantNeedsServing = (product.variants ?? []).some((v) => hasInlineImage(v.images));
  if (!productNeedsServing && !variantNeedsServing) return product;

  return {
    ...product,
    images: productNeedsServing
      ? product.images.map((src, idx) => (src?.startsWith("data:") ? productImageUrl(product.slug, idx, src) : src))
      : product.images,
    variants: (product.variants ?? []).map((variant) =>
      hasInlineImage(variant.images)
        ? {
            ...variant,
            images: variant.images!.map((src, idx) =>
              src?.startsWith("data:") ? variantImageUrl(product.slug, variant.id, idx, src) : src
            ),
          }
        : variant
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
