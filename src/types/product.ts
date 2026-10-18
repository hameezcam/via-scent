/**
 * Product & E-Commerce Type Definitions
 */

export type ProductCategory =
  | "aroma-diffusers"
  | "fragrance-oils"
  | "commercial-scenting"
  | "home-fragrance"
  | "gift-collections"
  | "sprays"
  | "best-sellers";

export type ScentFamily =
  | "woody"
  | "citrus"
  | "floral"
  | "oriental"
  | "fresh"
  | "amber"
  | "gourmand"
  | "fruity"
  | "fb"
  | "choice"
  | "car-scent"
  | "premium";

export interface ScentNotes {
  top: string[];
  heart: string[];
  base: string[];
  intensity?: "Delicate" | "Moderate" | "Opulent" | "Intense";
}

export interface Specification {
  label: string;
  value: string;
}

export interface ProductVariant {
  id: string;
  sku: string;
  name: string; // e.g. "100ml Bottle" or "Obsidian Black / 500ml"
  priceLKR: number;
  originalPriceLKR?: number;
  inStock: boolean;
  attributes: {
    volume?: string;
    color?: string;
    coverage?: string;
    material?: string;
    finish?: string;
    capacity?: string;
    edition?: string;
    [key: string]: string | undefined;
  };
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  sku: string;
  category: ProductCategory;
  categoryName: string;
  subCategory?: string;
  basePriceLKR: number;
  originalPriceLKR?: number;
  images: string[];
  featured: boolean;
  isBestseller: boolean;
  isNew?: boolean;
  inStock: boolean;
  stockStatus: "In Stock" | "Low Stock" | "Made to Order" | "Backorder";
  scentFamily?: ScentFamily;
  scentNotes?: ScentNotes;
  coverageArea?: string;
  bottleVolume?: string;
  shortDescription: string;
  description: string;
  usageInstructions?: string[];
  features: string[];
  specifications: Specification[];
  variants: ProductVariant[];
  drScentAuthorized: boolean;
  warrantyPeriod?: string;
  warrantyDurationMonths?: number;
  isPublished?: boolean;
  isArchived?: boolean;
  inventoryCount?: number;
}

export interface CategoryInfo {
  id: ProductCategory;
  name: string;
  tagline: string;
  description: string;
  image: string;
  featuredInHome: boolean;
}

export interface CartItem {
  id: string; // Composite key: `${productId}-${variantId}`
  productId: string;
  productSlug: string;
  productName: string;
  variantId: string;
  variantName: string;
  priceLKR: number;
  quantity: number;
  image: string;
  category: ProductCategory;
  sku: string;
  selectedAttributes: Record<string, string>;
}

export type SortOption =
  | "featured"
  | "price-asc"
  | "price-desc"
  | "name-asc"
  | "name-desc"
  | "newest";

export interface ProductFilterParams {
  category?: ProductCategory | "all";
  scentFamily?: ScentFamily | "all";
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  query?: string;
  sort?: SortOption;
}
