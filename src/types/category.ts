/**
 * Category Management Type Definitions
 */

export interface SubCategoryItem {
  id: string;
  label: string;
  /** Where the menu entry goes. Leave empty to filter the shop by this sub-category. */
  href?: string;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  image: string;
  featuredInHome: boolean;
  displayOrder: number;
  subCategories?: SubCategoryItem[];
  href?: string;
  /** Menu-only entries (like Services) show in the menu but are not shop collections. */
  menuOnly?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type CategoryInput = Omit<Category, "createdAt" | "updatedAt">;
