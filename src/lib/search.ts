import { Product } from "@/types/product";

/**
 * Checks whether a product matches a search query across all product metadata
 * (name, sku, category, subcategory, scent notes, features, descriptions).
 * Supports multi-token query matching.
 */
export function matchesProduct(product: Product, query: string): boolean {
  if (!query || !query.trim()) return false;
  const q = query.toLowerCase().trim();
  const tokens = q.split(/\s+/).filter(Boolean);

  const corpus = [
    product.name,
    product.tagline,
    product.description,
    product.shortDescription,
    product.sku,
    product.category,
    product.categoryName,
    product.subCategory,
    product.scentFamily,
    ...(product.features || []),
    ...(product.scentNotes
      ? [...product.scentNotes.top, ...product.scentNotes.heart, ...product.scentNotes.base]
      : []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (corpus.includes(q)) return true;
  return tokens.every((token) => corpus.includes(token));
}

/**
 * Calculates a relevance score for ordering search results.
 */
export function scoreProductRelevance(product: Product, query: string): number {
  if (!query || !query.trim()) return 0;
  const q = query.toLowerCase().trim();
  const tokens = q.split(/\s+/).filter(Boolean);
  const name = (product.name || "").toLowerCase();
  const sku = (product.sku || "").toLowerCase();
  const tagline = (product.tagline || "").toLowerCase();
  const category = (product.category || "").toLowerCase();
  const subCategory = (product.subCategory || "").toLowerCase();

  let score = 0;
  if (name === q) score += 100;
  else if (name.startsWith(q)) score += 50;
  else if (name.includes(q)) score += 30;

  if (sku === q) score += 80;
  else if (sku.includes(q)) score += 20;

  if (category.includes(q) || subCategory.includes(q)) score += 15;
  if (tagline.includes(q)) score += 10;

  for (const token of tokens) {
    if (name.includes(token)) score += 5;
  }

  return score;
}
