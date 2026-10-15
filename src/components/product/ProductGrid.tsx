import React from "react";
import { Product } from "@/types/product";
import { ProductCard } from "./ProductCard";

interface ProductGridProps {
  products: Product[];
  emptyMessage?: string;
  columns?: 2 | 3 | 4;
}

export function ProductGrid({
  products,
  emptyMessage = "No fragrances found matching your selection.",
  columns = 4,
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="py-16 text-center border border-dashed border-stone-300 rounded-lg p-8 bg-stone-50/50">
        <p className="font-serif text-lg text-stone-800">{emptyMessage}</p>
        <p className="text-xs text-stone-500 mt-1">
          Try adjusting your filter options or clearing selected scent families.
        </p>
      </div>
    );
  }

  const columnClass = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  }[columns];

  return (
    <div className={`grid gap-6 ${columnClass}`}>
      {products.map((product, idx) => (
        <ProductCard key={product.id} product={product} priority={idx < 4} />
      ))}
    </div>
  );
}
