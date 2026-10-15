"use client";

import React, { useState, useMemo } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Product, ProductCategory, ScentFamily, SortOption } from "@/types/product";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductFilters } from "@/components/product/ProductFilters";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { Search, Filter } from "lucide-react";

interface ShopContainerProps {
  initialProducts: Product[];
  initialCategory?: ProductCategory | "all";
  categoryName?: string;
  categoryDescription?: string;
}

export function ShopContainer({
  initialProducts,
  initialCategory = "all",
  categoryName,
  categoryDescription,
}: ShopContainerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Directly derive state from URL search params (Single Source of Truth)
  const category: ProductCategory | "all" =
    (searchParams.get("category") as ProductCategory | null) || initialCategory;
  const sort = (searchParams.get("sort") as SortOption) || "featured";
  const scentFamily: ScentFamily | "all" =
    (searchParams.get("family") as ScentFamily | null) || "all";
  const searchQuery = searchParams.get("q") || "";

  const [inStockOnly, setInStockOnly] = useState(false);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Update query params in URL
  const updateUrl = (newCat: string, newSort: string, newFam: string, newQ: string) => {
    const params = new URLSearchParams();
    if (newCat && newCat !== "all") params.set("category", newCat);
    if (newSort && newSort !== "featured") params.set("sort", newSort);
    if (newFam && newFam !== "all") params.set("family", newFam);
    if (newQ && newQ.trim() !== "") params.set("q", newQ.trim());

    const qs = params.toString();
    const target = qs ? `${pathname}?${qs}` : pathname;
    router.replace(target, { scroll: false });
  };

  const handleFilterChange = (updates: {
    category?: ProductCategory | "all";
    scentFamily?: ScentFamily | "all";
    inStockOnly?: boolean;
    sort?: SortOption;
    query?: string;
  }) => {
    const nextCat = updates.category !== undefined ? updates.category : category;
    const nextFam = updates.scentFamily !== undefined ? updates.scentFamily : scentFamily;
    const nextSort = updates.sort !== undefined ? updates.sort : sort;
    const nextQ = updates.query !== undefined ? updates.query : searchQuery;

    if (updates.inStockOnly !== undefined) {
      setInStockOnly(updates.inStockOnly);
    }

    updateUrl(nextCat, nextSort, nextFam, nextQ);
  };

  const handleReset = () => {
    setInStockOnly(false);
    updateUrl(initialCategory === "all" ? "all" : initialCategory, "featured", "all", "");
  };

  // Filter products client-side for ultra-responsive feedback
  const filteredProducts = useMemo(() => {
    let list = [...initialProducts];

    if (category !== "all") {
      list = list.filter((p) => p.category === category);
    }

    if (scentFamily !== "all") {
      list = list.filter((p) => p.scentFamily === scentFamily);
    }

    if (inStockOnly) {
      list = list.filter((p) => p.inStock);
    }

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
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
    }

    // Sort
    switch (sort) {
      case "price-asc":
        return list.sort((a, b) => a.basePriceLKR - b.basePriceLKR);
      case "price-desc":
        return list.sort((a, b) => b.basePriceLKR - a.basePriceLKR);
      case "name-asc":
        return list.sort((a, b) => a.name.localeCompare(b.name));
      case "name-desc":
        return list.sort((a, b) => b.name.localeCompare(a.name));
      case "newest":
        return list.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
      case "featured":
      default:
        return list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }
  }, [initialProducts, category, scentFamily, inStockOnly, searchQuery, sort]);

  const isFiltered =
    category !== (initialCategory === "all" ? "all" : initialCategory) ||
    scentFamily !== "all" ||
    inStockOnly ||
    searchQuery.trim() !== "" ||
    sort !== "featured";

  const sortOptions: { label: string; value: SortOption }[] = [
    { label: "Curated / Featured", value: "featured" },
    { label: "Price: Low to High", value: "price-asc" },
    { label: "Price: High to Low", value: "price-desc" },
    { label: "Name: A to Z", value: "name-asc" },
    { label: "Newest Additions", value: "newest" },
  ];

  const breadcrumbs = [
    { label: "Shop", href: "/shop" },
    ...(categoryName && initialCategory !== "all" ? [{ label: categoryName }] : []),
  ];

  return (
    <div className="py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumbs items={breadcrumbs} />

        {/* Page Title & Search */}
        <div className="pt-2 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-stone-200 mb-8">
          <div className="space-y-2 max-w-2xl">
            <span className="text-xs font-semibold tracking-widest uppercase text-amber-800">
              Authorized Dr. Scent Catalogue
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl text-stone-900 font-normal">
              {categoryName || "Fragrance & Diffuser Collections"}
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              {categoryDescription ||
                "Explore our complete range of cold-air nebulizers, pure diffuser oils, commercial HVAC systems, and artisanal home fragrance accents."}
            </p>
          </div>

          {/* Quick Search in catalogue */}
          <div className="w-full md:w-72">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleFilterChange({ query: e.target.value })}
                placeholder="Filter by keyword or note..."
                aria-label="Filter products by name or note"
                className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-stone-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-800 text-stone-900 placeholder-stone-400"
              />
            </div>
          </div>
        </div>

        {/* Main Grid & Filters Sidebar */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Desktop Sidebar & Mobile Drawer */}
          <ProductFilters
            filters={{
              category,
              scentFamily,
              inStockOnly,
              sort,
              query: searchQuery,
            }}
            onFilterChange={handleFilterChange}
            onReset={handleReset}
            totalProducts={filteredProducts.length}
            isMobileOpen={isMobileFiltersOpen}
            onMobileOpenChange={setIsMobileFiltersOpen}
          />

          {/* Right Product Grid Area */}
          <div className="flex-1 min-w-0">
            {/* Top Toolbar (Item Count, Mobile Filter Trigger, and Sort Dropdown) */}
            <div className="bg-white p-3.5 sm:p-4 rounded border border-stone-200 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
              <div className="flex items-center justify-between sm:justify-start gap-4">
                <button
                  type="button"
                  onClick={() => setIsMobileFiltersOpen(true)}
                  className="lg:hidden inline-flex items-center gap-2 px-3.5 py-2 bg-stone-900 text-stone-100 rounded text-xs font-medium uppercase tracking-wider hover:bg-stone-800 transition-colors"
                >
                  <Filter className="w-4 h-4" />
                  Filter Products
                  {isFiltered && (
                    <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                  )}
                </button>

                <span className="text-xs text-stone-500">
                  Showing <strong className="text-stone-900 font-semibold">{filteredProducts.length}</strong>{" "}
                  {filteredProducts.length === 1 ? "fragrance creation" : "fragrance creations"}
                </span>
              </div>

              {/* Sort Select */}
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <label htmlFor="sort-select" className="text-xs text-stone-500 whitespace-nowrap">
                  Sort by:
                </label>
                <select
                  id="sort-select"
                  value={sort}
                  onChange={(e) => handleFilterChange({ sort: e.target.value as SortOption })}
                  className="text-xs bg-stone-50 border border-stone-300 rounded px-2.5 py-1.5 text-stone-800 focus:outline-none focus:ring-1 focus:ring-amber-800"
                >
                  {sortOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Product Grid */}
            <ProductGrid
              products={filteredProducts}
              columns={3}
              emptyMessage={
                searchQuery
                  ? `No creations found matching "${searchQuery}".`
                  : "No products match the selected criteria."
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
