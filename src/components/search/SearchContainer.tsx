"use client";

import React, { useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Product } from "@/types/product";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";

interface SearchContainerProps {
  initialProducts: Product[];
}

export function SearchContainer({ initialProducts }: SearchContainerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);

  const filtered = useMemo(() => {
    if (!query.trim()) return initialProducts;
    const q = query.toLowerCase().trim();
    return initialProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tagline.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        (p.scentNotes &&
          [...p.scentNotes.top, ...p.scentNotes.heart, ...p.scentNotes.base].some((note) =>
            note.toLowerCase().includes(q)
          ))
    );
  }, [initialProducts, query]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const breadcrumbs = [
    { label: "Shop", href: "/shop" },
    { label: "Search Results" },
  ];

  return (
    <div className="py-10 sm:py-16 bg-[#FAF8F5] min-h-[70vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumbs items={breadcrumbs} />

        <div className="max-w-3xl mx-auto text-center space-y-4 mb-12">
          <span className="text-xs font-semibold tracking-widest uppercase text-amber-800 block">
            Catalogue Discovery
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-stone-900 font-normal">
            {query ? `Search Results for "${query}"` : "Search The Fragrance Collection"}
          </h1>
          <p className="text-xs sm:text-sm text-stone-600">
            Search across Dr. Scent aroma diffusers, fragrance notes, and commercial HVAC equipment.
          </p>

          <form onSubmit={handleSearchSubmit} className="max-w-xl mx-auto pt-2">
            <div className="relative">
              <Search className="absolute left-4 top-3.5 w-4 h-4 text-stone-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by product name, scent notes (e.g., Oud, Tea, Amber)..."
                className="w-full pl-11 pr-28 py-3 text-xs bg-white border border-stone-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-800 text-stone-900 shadow-xs"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-stone-900 text-amber-100 text-xs uppercase tracking-wider font-semibold rounded hover:bg-stone-800 transition-colors"
              >
                Search
              </button>
            </div>
          </form>
        </div>

        <div className="pt-4">
          <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-6 text-xs text-stone-500">
            <span>
              Found <strong>{filtered.length}</strong> matching creations
            </span>
          </div>

          <ProductGrid
            products={filtered}
            columns={4}
            emptyMessage={
              query
                ? `No fragrance products found matching "${query}".`
                : "Enter a search term above to explore the catalogue."
            }
          />
        </div>
      </div>
    </div>
  );
}
