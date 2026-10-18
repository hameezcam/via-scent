"use client";

import React from "react";
import { RotateCcw, Check, X } from "lucide-react";
import { SortOption } from "@/types/product";
import { Category } from "@/types/category";

export interface FilterState {
  category: string;
  subCategory?: string;
  scentFamily?: string;
  inStockOnly: boolean;
  sort: SortOption;
  query: string;
}

export interface ProductFiltersProps {
  filters: FilterState;
  onFilterChange: (filters: Partial<FilterState>) => void;
  onReset: () => void;
  totalProducts: number;
  isMobileOpen?: boolean;
  onMobileOpenChange?: (open: boolean) => void;
  categories?: Category[];
}

export interface SubOption {
  label: string;
  value: string;
}

export interface CollectionConfig {
  id: "aroma-oil" | "diffuser" | "bestsellers" | "sprays" | "candles";
  label: string;
  categoryParam: string;
  sectionTitle: string;
  allLabel: string;
  subOptions: SubOption[];
}

export const COLLECTIONS_HIERARCHY: CollectionConfig[] = [
  {
    id: "aroma-oil",
    label: "Aroma Oil",
    categoryParam: "fragrance-oils",
    sectionTitle: "AROMA OIL TYPE",
    allLabel: "All Aroma Oils",
    subOptions: [
      { label: "Car Scent", value: "car-scent" },
      { label: "Dr Scent's Choice", value: "choice" },
      { label: "F&B", value: "fb" },
      { label: "Floral", value: "floral" },
      { label: "Fresh", value: "fresh" },
      { label: "Fruity", value: "fruity" },
      { label: "Oriental", value: "oriental" },
      { label: "Premium Collection", value: "premium" },
    ],
  },
  {
    id: "diffuser",
    label: "Diffuser",
    categoryParam: "aroma-diffusers",
    sectionTitle: "DIFFUSER TYPE",
    allLabel: "All Diffusers",
    subOptions: [
      { label: "Diffuser", value: "diffuser" },
      { label: "Car Diffuser", value: "car-diffuser" },
      { label: "Dispenser", value: "dispenser" },
      { label: "Reed Diffuser", value: "reed-diffuser" },
    ],
  },
  {
    id: "bestsellers",
    label: "Best Sellers",
    categoryParam: "bestsellers",
    sectionTitle: "BEST SELLERS",
    allLabel: "All Best Sellers",
    subOptions: [
      { label: "Diffusers", value: "diffusers" },
      { label: "Aroma Oils", value: "aroma-oils" },
      { label: "Sprays", value: "sprays" },
      { label: "Reed Diffusers", value: "reed-diffusers" },
      { label: "Candles", value: "candles" },
    ],
  },
  {
    id: "sprays",
    label: "Sprays",
    categoryParam: "sprays",
    sectionTitle: "SPRAY TYPE",
    allLabel: "All Sprays",
    subOptions: [
      { label: "Fabric Spray", value: "fabric-spray" },
      { label: "Odor Eliminator", value: "odor-eliminator" },
      { label: "Aerosol", value: "aerosol" },
    ],
  },
  {
    id: "candles",
    label: "Candles",
    categoryParam: "candles",
    sectionTitle: "CANDLE TYPE",
    allLabel: "All Candles",
    subOptions: [
      { label: "Scented Candle", value: "scented-candle" },
      { label: "Soy Wax Candle", value: "soy-wax" },
      { label: "Luxury 3-Wick", value: "luxury-3-wick" },
    ],
  },
];

export function resolveCollectionId(
  category: string,
  sort?: string
): "all" | "aroma-oil" | "diffuser" | "bestsellers" | "sprays" | "candles" | string {
  if (sort === "bestselling" || category === "bestsellers" || category === "best-sellers") {
    return "bestsellers";
  }
  if (category === "aroma-oil" || category === "fragrance-oils") {
    return "aroma-oil";
  }
  if (category === "diffuser" || category === "aroma-diffusers") {
    return "diffuser";
  }
  if (category === "sprays" || category === "home-fragrance") {
    return "sprays";
  }
  if (category === "candles") {
    return "candles";
  }
  if (!category || category === "all") {
    return "all";
  }
  return category;
}

interface FilterContentProps {
  filters: FilterState;
  onFilterChange: (filters: Partial<FilterState>) => void;
  onReset: () => void;
  categories?: Category[];
}

function FilterContent({
  filters,
  onFilterChange,
  onReset,
  categories = [],
}: FilterContentProps) {
  const activeColId = resolveCollectionId(filters.category, filters.sort);
  const currentSub = filters.subCategory || filters.scentFamily || "all";

  // Active collection configuration fallback
  const activeConfig =
    COLLECTIONS_HIERARCHY.find((c) => c.id === activeColId) || COLLECTIONS_HIERARCHY[0];

  // Dynamically match category from database / admin categories
  const matchedCategory = categories.find((c) => {
    const slugOrId = c.slug?.toLowerCase();
    const catId = c.id?.toLowerCase();
    const active = activeColId.toLowerCase();
    const param = (filters.category || "").toLowerCase();
    return (
      slugOrId === active ||
      catId === active ||
      slugOrId === param ||
      catId === param ||
      (active === "aroma-oil" && (catId === "fragrance-oils" || slugOrId === "fragrance-oils")) ||
      (active === "diffuser" && (catId === "aroma-diffusers" || slugOrId === "aroma-diffusers")) ||
      (active === "bestsellers" && (catId === "best-sellers" || slugOrId === "best-sellers"))
    );
  });

  // Derive dynamic subOptions: if matched category has subCategories, use them directly
  const dynamicSubOptions: SubOption[] =
    matchedCategory && Array.isArray(matchedCategory.subCategories)
      ? matchedCategory.subCategories.map((sc) => ({ label: sc.label, value: sc.id }))
      : activeConfig.subOptions;

  const sectionTitle =
    matchedCategory && matchedCategory.name
      ? `${matchedCategory.name.toUpperCase()} TYPE`
      : activeColId === "all"
      ? "AROMA OIL TYPE"
      : activeConfig.sectionTitle;

  const allLabel =
    matchedCategory && matchedCategory.name
      ? `All ${matchedCategory.name}`
      : activeColId === "all"
      ? "All Types"
      : activeConfig.allLabel;

  const handleSelectCollection = (colId: string, categoryParam: string) => {
    if (colId === "all") {
      onFilterChange({
        category: "all",
        subCategory: "all",
        scentFamily: "all",
      });
    } else {
      onFilterChange({
        category: categoryParam,
        subCategory: "all",
        scentFamily: "all",
      });
    }
  };

  const handleSelectSub = (subVal: string) => {
    onFilterChange({
      subCategory: subVal,
      scentFamily: subVal,
    });
  };

  return (
    <div>
      {/* COLLECTION */}
      <div>
        <h3 className="text-[11px] font-serif tracking-[0.25em] text-[#151412] font-semibold uppercase mb-3.5">
          COLLECTION
        </h3>
        <div className="space-y-1.5">
          {/* All Collections */}
          <button
            type="button"
            onClick={() => handleSelectCollection("all", "all")}
            className={`w-full text-left py-1.5 px-0.5 text-[13px] flex items-center justify-between cursor-pointer transition-colors duration-150 ${
              activeColId === "all"
                ? "text-[#151412] font-medium"
                : "text-[#211C19]/80 hover:text-[#151412]"
            }`}
          >
            <span>All Collections</span>
            {activeColId === "all" && (
              <Check className="w-4 h-4 text-[#151412] stroke-[1.75]" />
            )}
          </button>

          {/* 4 Main Collections */}
          {COLLECTIONS_HIERARCHY.map((col) => {
            const isSelected = activeColId === col.id;
            return (
              <button
                key={col.id}
                type="button"
                onClick={() => handleSelectCollection(col.id, col.categoryParam)}
                className={`w-full text-left py-1.5 px-0.5 text-[13px] flex items-center justify-between cursor-pointer transition-colors duration-150 ${
                  isSelected
                    ? "text-[#151412] font-medium"
                    : "text-[#211C19]/80 hover:text-[#151412]"
                }`}
              >
                <span>{col.label}</span>
                {isSelected && (
                  <Check className="w-4 h-4 text-[#151412] stroke-[1.75]" />
                )}
              </button>
            );
          })}

          {/* Dynamic / Custom Category if active */}
          {!["all", "aroma-oil", "diffuser", "bestsellers", "sprays", "candles"].includes(activeColId) && (
            <button
              type="button"
              onClick={() => handleSelectCollection(activeColId, filters.category)}
              className="w-full text-left py-1.5 px-0.5 text-[13px] flex items-center justify-between cursor-pointer transition-colors duration-150 text-[#151412] font-medium"
            >
              <span className="capitalize">{filters.category.replace(/-/g, " ")}</span>
              <Check className="w-4 h-4 text-[#151412] stroke-[1.75]" />
            </button>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-[#151412] my-5" />

      {/* DYNAMIC SECONDARY SECTION: Scent Lines / Diffuser Types / Sprays / Best Sellers */}
      {dynamicSubOptions.length > 0 && (
        <div>
          <h3 className="text-[11px] font-serif tracking-[0.25em] text-[#151412] font-semibold uppercase mb-3.5">
            {sectionTitle}
          </h3>
          <div className="space-y-1.5">
            {/* All Option */}
            <button
              type="button"
              onClick={() => handleSelectSub("all")}
              className={`w-full text-left py-1.5 px-0.5 text-[13px] flex items-center justify-between cursor-pointer transition-colors duration-150 ${
                currentSub === "all"
                  ? "text-[#151412] font-medium"
                  : "text-[#211C19]/80 hover:text-[#151412]"
              }`}
            >
              <span>{allLabel}</span>
              {currentSub === "all" && (
                <Check className="w-4 h-4 text-[#151412] stroke-[1.75]" />
              )}
            </button>

            {/* Sub Options for Selected Collection */}
            {dynamicSubOptions.map((sub) => {
              const isSelected = currentSub === sub.value;
              return (
                <button
                  key={sub.value}
                  type="button"
                  onClick={() => handleSelectSub(sub.value)}
                  className={`w-full text-left py-1.5 px-0.5 text-[13px] flex items-center justify-between cursor-pointer transition-colors duration-150 ${
                    isSelected
                      ? "text-[#151412] font-medium"
                      : "text-[#211C19]/80 hover:text-[#151412]"
                  }`}
                >
                  <span>{sub.label}</span>
                  {isSelected && (
                    <Check className="w-4 h-4 text-[#151412] stroke-[1.75]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Divider */}
      <div className="w-full h-px bg-[#151412] my-5" />

      {/* AVAILABILITY */}
      <div>
        <h3 className="text-[11px] font-serif tracking-[0.25em] text-[#151412] font-semibold uppercase mb-3.5">
          AVAILABILITY
        </h3>
        <label className="flex items-center gap-3 cursor-pointer text-[13px] text-[#151412] font-normal hover:text-black transition-colors select-none">
          <input
            type="checkbox"
            checked={filters.inStockOnly}
            onChange={(e) => onFilterChange({ inStockOnly: e.target.checked })}
            className="w-4 h-4 rounded-[3px] border border-[#151412] text-[#151412] focus:ring-0 focus:ring-offset-0 cursor-pointer accent-[#151412]"
          />
          <span>In-Stock Allocations Only</span>
        </label>
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-[#151412] my-5" />

      {/* Reset button */}
      <div>
        <button
          type="button"
          onClick={onReset}
          className="w-full py-2.5 px-4 border border-[#151412] text-[#151412] hover:bg-[#151412] hover:text-white rounded-md text-[13px] font-normal flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset All Filters</span>
        </button>
      </div>
    </div>
  );
}

export function ProductFilters({
  filters,
  onFilterChange,
  onReset,
  totalProducts,
  isMobileOpen = false,
  onMobileOpenChange,
  categories: initialCategories,
}: ProductFiltersProps) {
  const [categories, setCategories] = React.useState<Category[]>(initialCategories || []);

  React.useEffect(() => {
    if (initialCategories && initialCategories.length > 0) {
      setCategories(initialCategories);
      return;
    }
    fetch("/api/categories")
      .then((r) => r.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setCategories(json.data);
        }
      })
      .catch(() => {});
  }, [initialCategories]);

  const activeColId = resolveCollectionId(filters.category, filters.sort);
  const currentSub = filters.subCategory || filters.scentFamily || "all";

  const isFiltered =
    activeColId !== "all" ||
    currentSub !== "all" ||
    filters.inStockOnly ||
    (filters.query && filters.query !== "") ||
    (filters.sort && filters.sort !== "featured");

  return (
    <>
      {/* Desktop Sidebar (hidden on mobile) */}
      <aside className="hidden lg:block w-64 shrink-0">
        <div className="sticky top-28 bg-white p-6 rounded-md border border-[#151412] shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#151412] mb-5">
            <span className="font-serif text-lg font-normal tracking-wide text-[#151412]">
              Refine Catalogue
            </span>
            <button
              type="button"
              onClick={onReset}
              className={`text-xs transition-colors cursor-pointer font-sans ${
                isFiltered
                  ? "text-[#151412] underline font-medium"
                  : "text-[#211C19]/60 hover:text-[#151412]"
              }`}
            >
              Clear
            </button>
          </div>
          <FilterContent
            filters={filters}
            onFilterChange={onFilterChange}
            onReset={onReset}
            categories={categories}
          />
        </div>
      </aside>

      {/* Mobile Filter Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-[#151412]/60 backdrop-blur-xs"
            onClick={() => onMobileOpenChange?.(false)}
            aria-hidden="true"
          />
          <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-white p-6 shadow-2xl flex flex-col z-50 overflow-y-auto border-l border-[#151412]">
            <div className="flex items-center justify-between pb-4 border-b border-[#151412] mb-6">
              <h2 className="font-serif text-lg font-normal text-[#151412]">
                Refine Catalogue
              </h2>
              <button
                onClick={() => onMobileOpenChange?.(false)}
                className="p-1.5 text-[#57534E] hover:text-[#151412] rounded-sm cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <FilterContent
              filters={filters}
              onFilterChange={onFilterChange}
              onReset={onReset}
              categories={categories}
            />
            <div className="mt-8 pt-4 border-t border-[#151412]">
              <button
                type="button"
                onClick={() => onMobileOpenChange?.(false)}
                className="w-full py-3 bg-[#151412] text-white text-xs font-semibold uppercase tracking-[0.2em] rounded-md hover:bg-[#B49A70] hover:text-[#151412] transition-colors cursor-pointer shadow-xs"
              >
                Apply Filters ({totalProducts})
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
