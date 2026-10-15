import { Suspense } from "react";
import { productService } from "@/services/product.service";
import { ShopContainer } from "@/components/shop/ShopContainer";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Shop All Fragrances & Diffusers | Authorized Dr. Scent Franchisee",
  description:
    "Explore Dr. Scent aroma diffusers, cold-air nebulizers, and pure botanical fragrance oils in Sri Lanka. Fast islandwide delivery.",
};

export default async function ShopPage() {
  const products = await productService.getAll();

  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-20 text-center text-stone-500">Loading fragrance catalogue...</div>}>
      <ShopContainer initialProducts={products} />
    </Suspense>
  );
}
