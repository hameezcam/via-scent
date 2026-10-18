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

  // Derive state from URL params, supporting canonical and prompt-specified query aliases
  const categoryParam =
    searchParams.get("collection") ||
    searchParams.get("category") ||
    initialCategory;
  const sort = (searchParams.get("sort") as SortOption) || "featured";
  const subCategory =
    searchParams.get("oilType") ||
    searchParams.get("diffuserType") ||
    searchParams.get("sprayType") ||
    searchParams.get("itemType") ||
    searchParams.get("sub") ||
    searchParams.get("family") ||
    "all";
  const searchQuery = searchParams.get("q") || "";

  const [inStockOnly, setInStockOnly] = useState(false);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const updateUrl = (newCat: string, newSort: string, newSub: string, newQ: string) => {
    const params = new URLSearchParams();
    if (newCat && newCat !== "all") params.set("category", newCat);
    if (newSort && newSort !== "featured") params.set("sort", newSort);
    if (newSub && newSub !== "all") params.set("sub", newSub);
    if (newQ && newQ.trim() !== "") params.set("q", newQ.trim());

    const qs = params.toString();
    let basePath = pathname;
    if ((newCat !== initialCategory || newCat === "all") && pathname !== "/shop") {
      basePath = "/shop";
    }
    const target = qs ? `${basePath}?${qs}` : basePath;
    router.replace(target, { scroll: false });
  };

  const handleFilterChange = (updates: {
    category?: string;
    subCategory?: string;
    scentFamily?: string;
    inStockOnly?: boolean;
    sort?: SortOption;
    query?: string;
  }) => {
    const nextCat = updates.category !== undefined ? updates.category : categoryParam;
    const nextSub =
      updates.subCategory !== undefined
        ? updates.subCategory
        : updates.scentFamily !== undefined
        ? updates.scentFamily
        : subCategory;
    const nextSort = updates.sort !== undefined ? updates.sort : sort;
    const nextQ = updates.query !== undefined ? updates.query : searchQuery;

    if (updates.inStockOnly !== undefined) {
      setInStockOnly(updates.inStockOnly);
    }

    // If changing category, reset subCategory unless explicitly passed
    const finalSub = updates.category !== undefined && updates.subCategory === undefined ? "all" : nextSub;

    updateUrl(nextCat, nextSort, finalSub, nextQ);
  };

  const handleReset = () => {
    setInStockOnly(false);
    updateUrl("all", "featured", "all", "");
  };

  const filteredProducts = useMemo(() => {
    let list = [...initialProducts];

    // Determine active collection category
    const isBestsellers = categoryParam === "bestsellers" || categoryParam === "best-sellers";
    const isAromaOil = categoryParam === "aroma-oil" || categoryParam === "fragrance-oils";
    const isDiffuser = categoryParam === "diffuser" || categoryParam === "aroma-diffusers";
    const isSprays = categoryParam === "sprays" || categoryParam === "home-fragrance";
    const isCandles = categoryParam === "candles";
    const isReedDiffusers = categoryParam === "reed-diffusers";

    // 1. Filter by Collection
    if (isBestsellers) {
      list = list.filter((p) => p.isBestseller || p.featured);
    } else if (isAromaOil) {
      list = list.filter(
        (p) =>
          p.category === "fragrance-oils" ||
          p.name.toLowerCase().includes("oil") ||
          p.sku.toLowerCase().includes("oil")
      );
    } else if (isDiffuser) {
      list = list.filter(
        (p) =>
          p.category === "aroma-diffusers" ||
          p.category === "commercial-scenting" ||
          p.name.toLowerCase().includes("diffuser") ||
          p.name.toLowerCase().includes("dispenser") ||
          p.name.toLowerCase().includes("nebulizer")
      );
    } else if (isSprays) {
      list = list.filter(
        (p) =>
          p.category === "sprays" ||
          p.category === "home-fragrance" ||
          p.name.toLowerCase().includes("spray")
      );
    } else if (isCandles) {
      list = list.filter(
        (p) =>
          p.category === "candles" ||
          p.name.toLowerCase().includes("candle") ||
          p.description.toLowerCase().includes("candle")
      );
    } else if (isReedDiffusers) {
      list = list.filter(
        (p) =>
          p.category === "reed-diffusers" ||
          p.name.toLowerCase().includes("reed") ||
          p.description.toLowerCase().includes("reed")
      );
    } else if (categoryParam !== "all") {
      list = list.filter((p) => p.category === categoryParam);
    }

    // 2. Filter by SubCategory
    if (subCategory && subCategory !== "all") {
      const s = subCategory.toLowerCase();

      // If any products have an exact subCategory assignment, filter directly
      const exactMatches = list.filter((p) => p.subCategory && p.subCategory.toLowerCase() === s);
      if (exactMatches.length > 0) {
        list = exactMatches;
      } else if (isAromaOil || (!isDiffuser && !isBestsellers && !isSprays)) {
        if (s === "car-scent") {
          list = list.filter(
            (p) =>
              p.name.toLowerCase().includes("car") ||
              p.tagline.toLowerCase().includes("car") ||
              p.description.toLowerCase().includes("car") ||
              p.scentFamily === "car-scent"
          );
        } else if (s === "choice") {
          list = list.filter(
            (p) =>
              p.isBestseller ||
              p.featured ||
              p.name.toLowerCase().includes("choice") ||
              p.tagline.toLowerCase().includes("signature")
          );
        } else if (s === "fb") {
          list = list.filter(
            (p) =>
              p.scentFamily === "fb" ||
              p.name.toLowerCase().includes("f&b") ||
              p.name.toLowerCase().includes("patisserie") ||
              p.category === "commercial-scenting" ||
              p.description.toLowerCase().includes("hospitality") ||
              p.description.toLowerCase().includes("hotel")
          );
        } else if (s === "floral") {
          list = list.filter(
            (p) =>
              p.scentFamily === "floral" ||
              ["rose", "jasmine", "lily", "floral", "lavender", "bloom"].some(
                (k) =>
                  p.name.toLowerCase().includes(k) ||
                  p.description.toLowerCase().includes(k) ||
                  (p.scentNotes &&
                    [...p.scentNotes.top, ...p.scentNotes.heart, ...p.scentNotes.base].some((n) =>
                      n.toLowerCase().includes(k)
                    ))
              )
          );
        } else if (s === "fresh") {
          list = list.filter(
            (p) =>
              p.scentFamily === "fresh" ||
              ["fresh", "tea", "thyme", "breeze", "marine", "eucalyptus"].some(
                (k) =>
                  p.name.toLowerCase().includes(k) ||
                  p.description.toLowerCase().includes(k) ||
                  (p.scentNotes &&
                    [...p.scentNotes.top, ...p.scentNotes.heart, ...p.scentNotes.base].some((n) =>
                      n.toLowerCase().includes(k)
                    ))
              )
          );
        } else if (s === "fruity") {
          list = list.filter(
            (p) =>
              p.scentFamily === "fruity" ||
              ["fig", "citrus", "bergamot", "lemon", "orange", "berry", "peach", "fruit"].some(
                (k) =>
                  p.name.toLowerCase().includes(k) ||
                  p.description.toLowerCase().includes(k) ||
                  (p.scentNotes &&
                    [...p.scentNotes.top, ...p.scentNotes.heart, ...p.scentNotes.base].some((n) =>
                      n.toLowerCase().includes(k)
                    ))
              )
          );
        } else if (s === "oriental") {
          list = list.filter(
            (p) =>
              p.scentFamily === "oriental" ||
              ["oud", "amber", "spice", "cardamom", "oriental", "vanilla", "saffron"].some(
                (k) =>
                  p.name.toLowerCase().includes(k) ||
                  p.description.toLowerCase().includes(k) ||
                  (p.scentNotes &&
                    [...p.scentNotes.top, ...p.scentNotes.heart, ...p.scentNotes.base].some((n) =>
                      n.toLowerCase().includes(k)
                    ))
              )
          );
        } else if (s === "premium") {
          list = list.filter(
            (p) =>
              p.basePriceLKR >= 14000 ||
              p.featured ||
              ["royal", "luxe", "premium", "reserve", "signature"].some(
                (k) => p.name.toLowerCase().includes(k) || p.tagline.toLowerCase().includes(k)
              )
          );
        }
      } else if (isDiffuser) {
        if (s === "diffuser") {
          list = list.filter(
            (p) =>
              !p.name.toLowerCase().includes("car") &&
              !p.name.toLowerCase().includes("reed") &&
              !p.name.toLowerCase().includes("dispenser")
          );
        } else if (s === "car-diffuser") {
          list = list.filter(
            (p) =>
              p.name.toLowerCase().includes("car") ||
              p.tagline.toLowerCase().includes("car") ||
              p.slug.includes("car")
          );
        } else if (s === "dispenser") {
          list = list.filter(
            (p) =>
              p.name.toLowerCase().includes("dispenser") ||
              p.category === "commercial-scenting" ||
              p.name.toLowerCase().includes("tower") ||
              p.tagline.toLowerCase().includes("commercial")
          );
        } else if (s === "reed-diffuser") {
          list = list.filter(
            (p) =>
              p.name.toLowerCase().includes("reed") ||
              p.description.toLowerCase().includes("reed") ||
              p.tagline.toLowerCase().includes("reed")
          );
        }
      } else if (isBestsellers) {
        if (s === "diffusers") {
          list = list.filter(
            (p) => p.category === "aroma-diffusers" || p.name.toLowerCase().includes("diffuser")
          );
        } else if (s === "aroma-oils") {
          list = list.filter(
            (p) => p.category === "fragrance-oils" || p.name.toLowerCase().includes("oil")
          );
        } else if (s === "sprays") {
          list = list.filter(
            (p) =>
              p.category === "sprays" ||
              p.category === "home-fragrance" ||
              p.name.toLowerCase().includes("spray")
          );
        } else if (s === "reed-diffusers") {
          list = list.filter(
            (p) => p.name.toLowerCase().includes("reed") || p.description.toLowerCase().includes("reed")
          );
        } else if (s === "candles") {
          list = list.filter(
            (p) => p.name.toLowerCase().includes("candle") || p.description.toLowerCase().includes("candle")
          );
        }
      } else if (isSprays) {
        if (s === "fabric-spray") {
          list = list.filter(
            (p) =>
              p.name.toLowerCase().includes("fabric") ||
              p.name.toLowerCase().includes("linen") ||
              p.description.toLowerCase().includes("fabric")
          );
        } else if (s === "odor-eliminator") {
          list = list.filter(
            (p) =>
              p.name.toLowerCase().includes("odor") ||
              p.name.toLowerCase().includes("eliminat") ||
              p.description.toLowerCase().includes("malodor")
          );
        } else if (s === "aerosol") {
          list = list.filter(
            (p) =>
              p.name.toLowerCase().includes("aerosol") ||
              p.description.toLowerCase().includes("aerosol") ||
              p.tagline.toLowerCase().includes("aerosol")
          );
        }
      } else if (isCandles) {
        if (s === "scented-candle" || s === "scented-candles") {
          list = list.filter(
            (p) => p.name.toLowerCase().includes("scented") || !p.name.toLowerCase().includes("soy")
          );
        } else if (s === "soy-wax") {
          list = list.filter(
            (p) => p.name.toLowerCase().includes("soy") || p.description.toLowerCase().includes("soy")
          );
        } else if (s === "luxury-3-wick") {
          list = list.filter(
            (p) =>
              p.name.toLowerCase().includes("3-wick") ||
              p.name.toLowerCase().includes("wick") ||
              p.name.toLowerCase().includes("luxury")
          );
        }
      }
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
  }, [initialProducts, categoryParam, subCategory, inStockOnly, searchQuery, sort]);

  const isFiltered =
    categoryParam !== (initialCategory === "all" ? "all" : initialCategory) ||
    subCategory !== "all" ||
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
              category: categoryParam,
              subCategory,
              scentFamily: subCategory,
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
