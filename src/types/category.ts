/**
 * Category Management Type Definitions
 */

export interface SubCategoryItem {
  id: string;
  label: string;
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
  createdAt?: string;
  updatedAt?: string;
}

export type CategoryInput = Omit<Category, "createdAt" | "updatedAt">;
