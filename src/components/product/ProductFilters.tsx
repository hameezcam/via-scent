"use client";

import React from "react";
import { X, RotateCcw, Check } from "lucide-react";
import { ProductCategory, ScentFamily, SortOption } from "@/types/product";

export interface FilterState {
  category: ProductCategory | "all";
  scentFamily: ScentFamily | "all";
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
}

interface FilterContentProps {
  categories: { label: string; value: ProductCategory | "all" }[];
  scentFamilies: { label: string; value: ScentFamily | "all" }[];
  filters: FilterState;
  onFilterChange: (filters: Partial<FilterState>) => void;
  onReset: () => void;
  isFiltered: boolean;
}

function FilterContent({
  categories,
  scentFamilies,
  filters,
  onFilterChange,
  onReset,
  isFiltered,
}: FilterContentProps) {
  return (
    <div className="space-y-6">
      {/* Category filter */}
      <div>
        <h3 className="text-xs font-semibold tracking-wider uppercase text-stone-900 mb-3">
          Category
        </h3>
        <div className="space-y-1.5">
          {categories.map((c) => {
            const isSelected = filters.category === c.value;
            return (
              <button
                key={c.value}
                type="button"
                onClick={() => onFilterChange({ category: c.value })}
                className={`w-full text-left px-2.5 py-1.5 text-xs rounded transition-colors flex items-center justify-between ${
                  isSelected
                    ? "bg-stone-900 text-stone-100 font-medium"
                    : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                }`}
              >
                <span>{c.label}</span>
                {isSelected && <Check className="w-3.5 h-3.5" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Scent Family filter */}
      <div className="pt-4 border-t border-stone-200">
        <h3 className="text-xs font-semibold tracking-wider uppercase text-stone-900 mb-3">
          Olfactive Family
        </h3>
        <div className="space-y-1.5">
          {scentFamilies.map((s) => {
            const isSelected = filters.scentFamily === s.value;
            return (
              <button
                key={s.value}
                type="button"
                onClick={() => onFilterChange({ scentFamily: s.value })}
                className={`w-full text-left px-2.5 py-1.5 text-xs rounded transition-colors flex items-center justify-between ${
                  isSelected
                    ? "bg-amber-900 text-stone-100 font-medium"
                    : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                }`}
              >
                <span>{s.label}</span>
                {isSelected && <Check className="w-3.5 h-3.5" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Availability */}
      <div className="pt-4 border-t border-stone-200">
        <h3 className="text-xs font-semibold tracking-wider uppercase text-stone-900 mb-3">
          Availability
        </h3>
        <label className="flex items-center gap-2 cursor-pointer text-xs text-stone-700">
          <input
            type="checkbox"
            checked={filters.inStockOnly}
            onChange={(e) => onFilterChange({ inStockOnly: e.target.checked })}
            className="rounded border-stone-300 text-amber-800 focus:ring-amber-800 w-4 h-4"
          />
          <span>In Stock Items Only</span>
        </label>
      </div>

      {/* Reset button */}
      {isFiltered && (
        <div className="pt-4 border-t border-stone-200">
          <button
            type="button"
            onClick={onReset}
            className="w-full py-2 px-3 border border-stone-300 text-stone-700 hover:bg-stone-100 text-xs font-medium rounded flex items-center justify-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset All Filters
          </button>
        </div>
      )}
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
}: ProductFiltersProps) {
  const categories: { label: string; value: ProductCategory | "all" }[] = [
    { label: "All Collections", value: "all" },
    { label: "Aroma Diffusers", value: "aroma-diffusers" },
    { label: "Fragrance Oils", value: "fragrance-oils" },
    { label: "Commercial Scenting", value: "commercial-scenting" },
    { label: "Home Fragrance", value: "home-fragrance" },
    { label: "Gift Collections", value: "gift-collections" },
  ];

  const scentFamilies: { label: string; value: ScentFamily | "all" }[] = [
    { label: "All Families", value: "all" },
    { label: "Woody & Amber", value: "woody" },
    { label: "Fresh & Green", value: "fresh" },
    { label: "Citrus & Aromatic", value: "citrus" },
    { label: "Floral & Botanical", value: "floral" },
    { label: "Oriental & Spice", value: "oriental" },
  ];

  const isFiltered =
    filters.category !== "all" ||
    filters.scentFamily !== "all" ||
    filters.inStockOnly ||
    filters.query !== "" ||
    filters.sort !== "featured";

  return (
    <>
      {/* Desktop Sidebar (hidden on mobile) */}
      <aside className="hidden lg:block w-64 flex-shrink-0">
        <div className="sticky top-28 bg-white p-5 rounded border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-4">
            <span className="font-serif text-sm font-semibold tracking-wider text-stone-900">
              Refine Search
            </span>
            {isFiltered && (
              <button
                type="button"
                onClick={onReset}
                className="text-[11px] text-amber-800 hover:underline"
              >
                Clear
              </button>
            )}
          </div>
          <FilterContent
            categories={categories}
            scentFamilies={scentFamilies}
            filters={filters}
            onFilterChange={onFilterChange}
            onReset={onReset}
            isFiltered={isFiltered}
          />
        </div>
      </aside>

      {/* Mobile Filter Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs"
            onClick={() => onMobileOpenChange?.(false)}
            aria-hidden="true"
          />
          <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-[#FAF8F5] p-6 shadow-2xl flex flex-col z-50 overflow-y-auto border-l border-stone-200">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-6">
              <h2 className="font-serif text-lg font-medium text-stone-900">
                Filter & Refine
              </h2>
              <button
                onClick={() => onMobileOpenChange?.(false)}
                className="p-1.5 text-stone-500 hover:text-stone-900 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <FilterContent
              categories={categories}
              scentFamilies={scentFamilies}
              filters={filters}
              onFilterChange={onFilterChange}
              onReset={onReset}
              isFiltered={isFiltered}
            />
            <div className="mt-8 pt-4 border-t border-stone-200">
              <button
                type="button"
                onClick={() => onMobileOpenChange?.(false)}
                className="w-full py-2.5 bg-stone-900 text-stone-100 text-xs font-semibold uppercase tracking-wider rounded"
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
