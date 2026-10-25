import type { Metadata } from "next";
import { productService } from "@/services/product.service";
import { withServedImagesAll } from "@/lib/product-images";
import { ScentFinder } from "@/components/scent-finder/ScentFinder";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Scent Finder",
  description: "Answer four quick questions and we'll match you with the right Dr. Scent diffuser, fragrance oil or spray for your space.",
  alternates: { canonical: "/scent-finder" },
};

export default async function ScentFinderPage() {
  const products = await productService.getAll().then(withServedImagesAll);
  return <ScentFinder products={products} />;
}
