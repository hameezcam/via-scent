"use client";

import React from "react";
import { RotateCcw, Check, X } from "lucide-react";
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
}: FilterContentProps) {
  return (
    <div>
      {/* Category filter */}
      <div>
        <h3 className="text-[11px] font-serif tracking-[0.25em] text-[#151412] font-semibold uppercase mb-3">
          COLLECTION
        </h3>
        <div className="space-y-1.5">
          {categories.map((c) => {
            const isSelected = filters.category === c.value;
            return (
              <button
                key={c.value}
                type="button"
                onClick={() => onFilterChange({ category: c.value })}
                className={`w-full text-left py-1 px-0.5 text-[13px] flex items-center justify-between cursor-pointer transition-colors duration-150 ${
                  isSelected
                    ? "text-[#151412] font-medium"
                    : "text-[#211C19]/80 hover:text-[#151412]"
                }`}
              >
                <span>{c.label}</span>
                {isSelected && <Check className="w-4 h-4 text-[#151412] stroke-[1.75]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-[#151412] my-5" />

      {/* Scent Family filter */}
      <div>
        <h3 className="text-[11px] font-serif tracking-[0.25em] text-[#151412] font-semibold uppercase mb-3">
          OLFACTORY FAMILY
        </h3>
        <div className="space-y-1.5">
          {scentFamilies.map((s) => {
            const isSelected = filters.scentFamily === s.value;
            return (
              <button
                key={s.value}
                type="button"
                onClick={() => onFilterChange({ scentFamily: s.value })}
                className={`w-full text-left py-1 px-0.5 text-[13px] flex items-center justify-between cursor-pointer transition-colors duration-150 ${
                  isSelected
                    ? "text-[#151412] font-medium"
                    : "text-[#211C19]/80 hover:text-[#151412]"
                }`}
              >
                <span>{s.label}</span>
                {isSelected && <Check className="w-4 h-4 text-[#151412] stroke-[1.75]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-[#151412] my-5" />

      {/* Availability */}
      <div>
        <h3 className="text-[11px] font-serif tracking-[0.25em] text-[#151412] font-semibold uppercase mb-3">
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
}: ProductFiltersProps) {
  const categories: { label: string; value: ProductCategory | "all" }[] = [
    { label: "All Collections", value: "all" },
    { label: "Aroma Diffusers", value: "aroma-diffusers" },
    { label: "Fragrance Oils", value: "fragrance-oils" },
    { label: "Commercial Scenting", value: "commercial-scenting" },
    { label: "Home Fragrance", value: "home-fragrance" },
    { label: "Room & Fabric Sprays", value: "sprays" },
    { label: "Gift Collections", value: "gift-collections" },
  ];

  const scentFamilies: { label: string; value: ScentFamily | "all" }[] = [
    { label: "All Families", value: "all" },
    { label: "Dr. Scent's Choice", value: "choice" },
    { label: "Car Scent", value: "car-scent" },
    { label: "Floral & Botanical", value: "floral" },
    { label: "Fresh & Green", value: "fresh" },
    { label: "Fruity & Citrus", value: "fruity" },
    { label: "Oriental & Spice", value: "oriental" },
    { label: "Woody & Amber", value: "woody" },
    { label: "F&B (Hospitality)", value: "fb" },
    { label: "Premium Collection", value: "premium" },
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
        <div className="sticky top-28 bg-white p-6 rounded-md border border-[#151412] shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#151412] mb-5">
            <span className="font-serif text-lg font-normal tracking-wide text-[#151412]">
              Refine Catalogue
            </span>
            <button
              type="button"
              onClick={onReset}
              className="text-xs text-[#211C19]/80 hover:text-[#151412] hover:underline cursor-pointer font-sans transition-colors"
            >
              Clear
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
              categories={categories}
              scentFamilies={scentFamilies}
              filters={filters}
              onFilterChange={onFilterChange}
              onReset={onReset}
              isFiltered={isFiltered}
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
