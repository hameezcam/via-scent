import { Suspense } from "react";
import { productService } from "@/services/product.service";
import { withServedImagesAll } from "@/lib/product-images";
import { SearchContainer } from "@/components/search/SearchContainer";

export const metadata = {
  title: "Search",
  description: "Search Dr. Scent cold-air aroma diffusers, room nebulizers, and pure fragrance oils.",
};

export default async function SearchPage() {
  const allProducts = await productService.getAll().then(withServedImagesAll);

  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-20 text-center text-stone-500">Searching catalogue...</div>}>
      <SearchContainer initialProducts={allProducts} />
    </Suspense>
  );
}
