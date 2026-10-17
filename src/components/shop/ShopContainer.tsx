"use client";

import React, { useState, useMemo } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Product, ProductCategory, ScentFamily, SortOption } from "@/types/product";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductFilters } from "@/components/product/ProductFilters";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { Search, Filter, Sparkles } from "lucide-react";

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

  // Derive state from URL params
  const category: ProductCategory | "all" =
    (searchParams.get("category") as ProductCategory | null) || initialCategory;
  const sort = (searchParams.get("sort") as SortOption) || "featured";
  const scentFamily: ScentFamily | "all" =
    (searchParams.get("family") as ScentFamily | null) || "all";
  const searchQuery = searchParams.get("q") || "";

  const [inStockOnly, setInStockOnly] = useState(false);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

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

  const filteredProducts = useMemo(() => {
    let list = [...initialProducts];

    if (category !== "all") {
      if (category === "sprays") {
        list = list.filter(
          (p) =>
            p.category === "sprays" ||
            p.category === "home-fragrance" ||
            p.name.toLowerCase().includes("spray") ||
            p.description.toLowerCase().includes("spray")
        );
      } else {
        list = list.filter((p) => p.category === category);
      }
    }

    if (scentFamily !== "all") {
      const fam = scentFamily.toLowerCase();
      list = list.filter((p) => {
        if (p.scentFamily && p.scentFamily.toLowerCase() === fam) return true;
        if (p.scentNotes) {
          const allNotes = [
            ...(p.scentNotes.top || []),
            ...(p.scentNotes.heart || []),
            ...(p.scentNotes.base || []),
          ].map((n) => n.toLowerCase());
          if (allNotes.some((n) => n.includes(fam))) return true;
        }
        if (fam === "car-scent" && (p.name.toLowerCase().includes("car") || p.tagline.toLowerCase().includes("car"))) return true;
        if (fam === "fb" && (p.name.toLowerCase().includes("f&b") || p.categoryName?.includes("F&B") || p.category === "commercial-scenting")) return true;
        if (fam === "choice" && (p.isBestseller || p.featured)) return true;
        if (fam === "premium" && (p.featured || p.basePriceLKR >= 30000 || p.name.toLowerCase().includes("royal") || p.name.toLowerCase().includes("luxe"))) return true;
        if (fam === "woody" && (p.scentFamily === "woody" || p.name.toLowerCase().includes("oud") || p.name.toLowerCase().includes("amber") || p.name.toLowerCase().includes("santal"))) return true;
        if (fam === "fresh" && (p.scentFamily === "fresh" || p.name.toLowerCase().includes("fresh") || p.name.toLowerCase().includes("tea") || p.name.toLowerCase().includes("cypress"))) return true;
        if (fam === "floral" && (p.scentFamily === "floral" || p.name.toLowerCase().includes("rose") || p.name.toLowerCase().includes("floral") || p.name.toLowerCase().includes("botanical"))) return true;
        if (fam === "fruity" && (p.scentFamily === "fruity" || p.name.toLowerCase().includes("fig") || p.name.toLowerCase().includes("citrus") || p.name.toLowerCase().includes("bergamot"))) return true;
        if (fam === "oriental" && (p.scentFamily === "oriental" || p.name.toLowerCase().includes("oud") || p.name.toLowerCase().includes("cardamom") || p.name.toLowerCase().includes("amber"))) return true;
        return false;
      });
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
    { label: "Catalogue", href: "/shop" },
    ...(categoryName && initialCategory !== "all" ? [{ label: categoryName }] : []),
  ];

  return (
    <div className="py-10 lg:py-16 bg-[var(--porcelain)] text-[var(--near-black)] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Breadcrumbs items={breadcrumbs} />
        </div>

        {/* Page Title & Search Header */}
        <div className="pt-2 pb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[var(--warm-stone)]/40 mb-10">
          <div className="space-y-2 max-w-2xl">
            <span className="text-[10px] font-medium tracking-[0.25em] uppercase text-[var(--champagne)] block">
              Official Sri Lanka Franchise Catalogue
            </span>
            <h1 className="font-serif text-3xl sm:text-5xl text-[var(--near-black)] font-normal tracking-tight">
              {categoryName || "Fragrance & Diffusion Architecture"}
            </h1>
            <p className="text-xs sm:text-sm text-[var(--deep-espresso)]/70 font-light leading-relaxed">
              {categoryDescription ||
                "Explore our complete range of cold-air nebulizers, pure diffuser oils, commercial HVAC systems, and artisanal home fragrance accents."}
            </p>
          </div>

          {/* Quick Search */}
          <div className="w-full md:w-80">
            <div className="relative">
              <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-[var(--warm-stone)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleFilterChange({ query: e.target.value })}
                placeholder="Search by note, room or title..."
                aria-label="Filter products by name or note"
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-[var(--warm-stone)]/50 rounded-sm focus:outline-none focus:border-[var(--champagne)] text-[var(--near-black)] placeholder-[var(--warm-stone)]/80 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Main Grid & Filters Sidebar */}
        <div className="flex flex-col lg:flex-row gap-10">
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
            {/* Top Toolbar */}
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-sm border border-[var(--warm-stone)]/40 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center justify-between sm:justify-start gap-4">
                <button
                  type="button"
                  onClick={() => setIsMobileFiltersOpen(true)}
                  className="lg:hidden inline-flex items-center gap-2 px-4 py-2 bg-[var(--near-black)] text-[var(--porcelain)] rounded-sm text-xs font-medium uppercase tracking-[0.15em] hover:bg-[var(--champagne)] transition-colors cursor-pointer"
                >
                  <Filter className="w-3.5 h-3.5" />
                  <span>Filter Creations</span>
                  {isFiltered && (
                    <span className="w-2 h-2 rounded-full bg-[var(--champagne)] inline-block" />
                  )}
                </button>

                <span className="text-xs text-[var(--deep-espresso)]/70 font-light">
                  Showing <strong className="text-[var(--near-black)] font-medium">{filteredProducts.length}</strong>{" "}
                  {filteredProducts.length === 1 ? "instrument / oil" : "instruments & oils"}
                </span>
              </div>

              {/* Sort Select */}
              <div className="flex items-center gap-2.5 self-end sm:self-auto">
                <label htmlFor="sort-select" className="text-xs text-[var(--deep-espresso)]/70 whitespace-nowrap font-light">
                  Sort by:
                </label>
                <select
                  id="sort-select"
                  value={sort}
                  onChange={(e) => handleFilterChange({ sort: e.target.value as SortOption })}
                  className="text-xs bg-white border border-[var(--warm-stone)]/50 rounded-sm px-3 py-1.5 text-[var(--near-black)] focus:outline-none focus:border-[var(--champagne)] cursor-pointer"
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
                  : "No instruments or oils match the selected criteria."
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
