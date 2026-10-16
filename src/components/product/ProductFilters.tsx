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
        <h3 className="text-[10px] font-medium tracking-[0.2em] uppercase text-[var(--champagne)] mb-3">
          Collection
        </h3>
        <div className="space-y-1">
          {categories.map((c) => {
            const isSelected = filters.category === c.value;
            return (
              <button
                key={c.value}
                type="button"
                onClick={() => onFilterChange({ category: c.value })}
                className={`w-full text-left px-3 py-2 text-xs rounded-sm transition-all duration-200 flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? "bg-[var(--near-black)] text-[var(--porcelain)] font-medium"
                    : "text-[var(--deep-espresso)]/80 hover:bg-[var(--ivory)] hover:text-[var(--near-black)]"
                }`}
              >
                <span>{c.label}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-[var(--champagne)]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Scent Family filter */}
      <div className="pt-4 border-t border-[var(--warm-stone)]/40">
        <h3 className="text-[10px] font-medium tracking-[0.2em] uppercase text-[var(--champagne)] mb-3">
          Olfactory Family
        </h3>
        <div className="space-y-1">
          {scentFamilies.map((s) => {
            const isSelected = filters.scentFamily === s.value;
            return (
              <button
                key={s.value}
                type="button"
                onClick={() => onFilterChange({ scentFamily: s.value })}
                className={`w-full text-left px-3 py-2 text-xs rounded-sm transition-all duration-200 flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? "bg-[var(--champagne)] text-white font-medium"
                    : "text-[var(--deep-espresso)]/80 hover:bg-[var(--ivory)] hover:text-[var(--near-black)]"
                }`}
              >
                <span>{s.label}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Availability */}
      <div className="pt-4 border-t border-[var(--warm-stone)]/40">
        <h3 className="text-[10px] font-medium tracking-[0.2em] uppercase text-[var(--champagne)] mb-3">
          Availability
        </h3>
        <label className="flex items-center gap-2.5 cursor-pointer text-xs text-[var(--deep-espresso)]/80 font-light">
          <input
            type="checkbox"
            checked={filters.inStockOnly}
            onChange={(e) => onFilterChange({ inStockOnly: e.target.checked })}
            className="rounded-sm border-[var(--warm-stone)] text-[var(--champagne)] focus:ring-[var(--champagne)] w-4 h-4 cursor-pointer"
          />
          <span>In-Stock Allocations Only</span>
        </label>
      </div>

      {/* Reset button */}
      {isFiltered && (
        <div className="pt-4 border-t border-[var(--warm-stone)]/40">
          <button
            type="button"
            onClick={onReset}
            className="w-full py-2.5 px-3 border border-[var(--warm-stone)]/60 text-[var(--deep-espresso)] hover:border-[var(--champagne)] text-xs font-light rounded-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[var(--champagne)]" />
            <span>Reset All Filters</span>
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
      <aside className="hidden lg:block w-64 shrink-0">
        <div className="sticky top-28 bg-white/80 backdrop-blur-sm p-5 rounded-sm border border-[var(--warm-stone)]/40 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--warm-stone)]/40 mb-4">
            <span className="font-serif text-sm font-normal tracking-wide text-[var(--near-black)]">
              Refine Catalogue
            </span>
            {isFiltered && (
              <button
                type="button"
                onClick={onReset}
                className="text-[11px] text-[var(--champagne)] hover:underline cursor-pointer font-light"
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
            className="fixed inset-0 bg-[var(--near-black)]/60 backdrop-blur-xs"
            onClick={() => onMobileOpenChange?.(false)}
            aria-hidden="true"
          />
          <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-[var(--porcelain)] p-6 shadow-2xl flex flex-col z-50 overflow-y-auto border-l border-[var(--warm-stone)]/40">
            <div className="flex items-center justify-between pb-4 border-b border-[var(--warm-stone)]/40 mb-6">
              <h2 className="font-serif text-lg font-normal text-[var(--near-black)]">
                Filter & Refine
              </h2>
              <button
                onClick={() => onMobileOpenChange?.(false)}
                className="p-1.5 text-[var(--deep-espresso)]/70 hover:text-[var(--near-black)] rounded-sm cursor-pointer"
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
            <div className="mt-8 pt-4 border-t border-[var(--warm-stone)]/40">
              <button
                type="button"
                onClick={() => onMobileOpenChange?.(false)}
                className="w-full py-3 bg-[var(--near-black)] text-[var(--porcelain)] text-xs font-medium uppercase tracking-[0.2em] rounded-sm hover:bg-[var(--champagne)] transition-colors cursor-pointer"
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
