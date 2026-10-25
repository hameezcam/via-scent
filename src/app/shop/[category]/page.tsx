import { notFound } from "next/navigation";
import { Suspense } from "react";
import type { Metadata } from "next";
import { productService } from "@/services/product.service";
import { withServedImagesAll } from "@/lib/product-images";
import { categoryService } from "@/services/category.service";
import { ProductCategory } from "@/types/product";
import { ShopContainer } from "@/components/shop/ShopContainer";
import { CATEGORIES } from "@/data/products";

interface CategoryPageProps {
  params: Promise<{
    category: string;
  }>;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateStaticParams() {
  const base = CATEGORIES.map((cat) => ({
    category: cat.id,
  }));
  return [
    ...base,
    { category: "aroma-oil" },
    { category: "diffuser" },
    { category: "bestsellers" },
  ];
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  const categoryInfo = await productService.getCategoryById(category as ProductCategory);

  if (!categoryInfo) {
    return {
      title: "Category Not Found",
    };
  }

  return {
    title: `${categoryInfo.name} | Authorized Dr. Scent Franchisee Sri Lanka`,
    description: categoryInfo.description,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;
  const categoryInfo = await productService.getCategoryById(category as ProductCategory);

  if (!categoryInfo) {
    notFound();
  }

  const [allProducts, allCategories] = await Promise.all([
    productService.getAll().then(withServedImagesAll),
    categoryService.getAll(),
  ]);

  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-20 text-center text-stone-500">Loading collection...</div>}>
      <ShopContainer
        initialProducts={allProducts}
        initialCategory={categoryInfo.id}
        categoryName={categoryInfo.name}
        categoryDescription={categoryInfo.description}
        categories={allCategories}
      />
    </Suspense>
  );
}
