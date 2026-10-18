"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { Product } from "@/types/product";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { matchesProduct, scoreProductRelevance } from "@/lib/search";

interface SearchContainerProps {
  initialProducts: Product[];
}

export function SearchContainer({ initialProducts }: SearchContainerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(urlQuery);

  // Sync with URL query when changed externally
  useEffect(() => {
    setQuery(urlQuery);
  }, [urlQuery]);

  const updateSearchUrl = useCallback(
    (q: string) => {
      const trimmed = q.trim();
      const currentParam = searchParams.get("q") || "";
      if (trimmed !== currentParam.trim()) {
        if (trimmed) {
          router.replace(`/search?q=${encodeURIComponent(trimmed)}`, { scroll: false });
        } else {
          router.replace("/search", { scroll: false });
        }
      }
    },
    [router, searchParams]
  );

  // Debounce syncing to URL (300ms) while keeping input and grid instantaneous
  useEffect(() => {
    const timer = setTimeout(() => {
      updateSearchUrl(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, updateSearchUrl]);

  const filtered = useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed) return initialProducts;

    const matched = initialProducts.filter((p) => matchesProduct(p, trimmed));

    // Sort by relevance score
    matched.sort((a, b) => {
      const scoreA = scoreProductRelevance(a, trimmed);
      const scoreB = scoreProductRelevance(b, trimmed);
      return scoreB - scoreA;
    });

    return matched;
  }, [initialProducts, query]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSearchUrl(query);
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
                className="w-full pl-11 pr-24 py-3 text-xs bg-white border border-stone-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-800 text-stone-900 shadow-xs"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    updateSearchUrl("");
                  }}
                  className="absolute right-20 top-3 text-stone-400 hover:text-stone-700 cursor-pointer p-1"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="submit"
                className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-stone-900 text-amber-100 text-xs uppercase tracking-wider font-semibold rounded hover:bg-stone-800 transition-colors cursor-pointer"
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
            {query && (
              <span className="text-stone-400">
                Instant search active for &ldquo;{query}&rdquo;
              </span>
            )}
          </div>

          <ProductGrid
            products={filtered}
            columns={4}
            emptyMessage={
              query
                ? `No fragrance products found matching "${query}". Try searching for diffuse, candle, car, or fragrance notes like amber or oud.`
                : "Enter a search term above to explore the catalogue."
            }
          />
        </div>
      </div>
    </div>
  );
}
