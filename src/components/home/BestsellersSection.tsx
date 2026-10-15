import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Product } from "@/types/product";
import { ProductGrid } from "@/components/product/ProductGrid";

interface BestsellersSectionProps {
  products: Product[];
}

export function BestsellersSection({ products }: BestsellersSectionProps) {
  return (
    <section className="py-16 sm:py-24 bg-[#FAF8F5] border-b border-[#E7E2D8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest uppercase text-amber-800 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Signature Selections</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal text-stone-900 tracking-tight">
              Bestselling Diffusers & Fragrance Formulations
            </h2>
            <p className="text-sm text-stone-600 mt-2 max-w-xl">
              Engineered with cold-air micro-nebulization and IFRA-certified botanical perfumery for residential and boutique environments.
            </p>
          </div>

          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-stone-800 hover:text-amber-900 transition-colors group shrink-0"
          >
            <span>Explore All Fragrances</span>
            <ArrowRight className="w-4 h-4 text-stone-400 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <ProductGrid products={products} columns={4} />
      </div>
    </section>
  );
}
