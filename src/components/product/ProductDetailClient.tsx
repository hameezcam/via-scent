"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Check,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  Award,
} from "lucide-react";
import { Product, ProductVariant } from "@/types/product";
import { formatLKR } from "@/config/brand.config";
import { useCart } from "@/context/CartContext";
import { ProductGallery } from "./ProductGallery";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { ProductGrid } from "./ProductGrid";

interface ProductDetailClientProps {
  product: Product;
  relatedProducts: Product[];
}

export function ProductDetailClient({ product, relatedProducts }: ProductDetailClientProps) {
  const { addItem } = useCart();
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(
    product.variants[0] || {
      id: "default",
      sku: product.sku,
      name: "Standard Edition",
      priceLKR: product.basePriceLKR,
      inStock: product.inStock,
      attributes: {},
    }
  );
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeTab, setActiveTab] = useState<"specs" | "usage" | "delivery">("specs");

  const price = selectedVariant.priceLKR;
  const originalPrice = selectedVariant.originalPriceLKR || product.originalPriceLKR;

  const handleAddToCart = () => {
    if (!product.inStock || !selectedVariant.inStock) return;
    addItem(product, selectedVariant, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  const breadcrumbs = [
    { label: "Shop", href: "/shop" },
    { label: product.categoryName, href: `/shop/${product.category}` },
    { label: product.name },
  ];

  return (
    <div className="py-8 sm:py-12 bg-[#FAF8F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumbs items={breadcrumbs} />

        {/* Product Overview Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 pt-4 pb-16 border-b border-stone-200">
          {/* Left Column: Image Gallery */}
          <div className="lg:col-span-7">
            <ProductGallery
              images={product.images}
              productName={product.name}
              isBestseller={product.isBestseller}
              isNew={product.isNew}
              drScentAuthorized={product.drScentAuthorized}
            />
          </div>

          {/* Right Column: Buying Controls & Info */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Category, SKU & Status */}
              <div className="flex items-center justify-between text-xs text-stone-500 uppercase tracking-wider">
                <Link
                  href={`/shop/${product.category}`}
                  className="hover:text-amber-900 transition-colors font-medium"
                >
                  {product.categoryName}
                </Link>
                <span>SKU: {selectedVariant.sku || product.sku}</span>
              </div>

              {/* Title & Tagline */}
              <div>
                <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-normal text-stone-900 tracking-tight leading-tight">
                  {product.name}
                </h1>
                <p className="text-xs sm:text-sm text-stone-600 mt-1.5 leading-relaxed">
                  {product.tagline}
                </p>
              </div>

              {/* Price & Availability */}
              <div className="flex items-baseline gap-3 pt-1">
                <span className="font-semibold text-2xl sm:text-3xl text-stone-900">
                  {formatLKR(price, true)}
                </span>
                {originalPrice && originalPrice > price && (
                  <span className="text-sm text-stone-400 line-through">
                    {formatLKR(originalPrice, true)}
                  </span>
                )}
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider ml-2 ${
                    product.inStock && selectedVariant.inStock
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-stone-100 text-stone-500 border border-stone-200"
                  }`}
                >
                  {product.inStock && selectedVariant.inStock ? product.stockStatus : "Sold Out"}
                </span>
              </div>

              {/* Scent notes highlight if fragrance oil */}
              {product.scentNotes && (
                <div className="p-3.5 rounded-lg bg-amber-50/70 border border-amber-200/80 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                      Olfactory Notes
                    </span>
                    {product.scentNotes.intensity && (
                      <span className="text-amber-800 text-[11px] font-medium">
                        Intensity: {product.scentNotes.intensity}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-stone-700 pt-1 border-t border-amber-200/60">
                    <div>
                      <strong className="text-stone-900 block font-medium">Top</strong>
                      <span className="text-[11px]">{product.scentNotes.top.join(", ")}</span>
                    </div>
                    <div>
                      <strong className="text-stone-900 block font-medium">Heart</strong>
                      <span className="text-[11px]">{product.scentNotes.heart.join(", ")}</span>
                    </div>
                    <div>
                      <strong className="text-stone-900 block font-medium">Base</strong>
                      <span className="text-[11px]">{product.scentNotes.base.join(", ")}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Variant Selector */}
              {product.variants.length > 1 && (
                <div className="space-y-2 pt-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-stone-800 block">
                    Choose Option / Finish:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((v) => {
                      const isSelected = selectedVariant.id === v.id;
                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => setSelectedVariant(v)}
                          className={`px-3.5 py-2 rounded text-xs transition-all border ${
                            isSelected
                              ? "bg-stone-900 text-stone-100 border-stone-900 font-medium shadow-xs"
                              : "bg-white border-stone-300 text-stone-700 hover:border-stone-400"
                          }`}
                        >
                          <span>{v.name}</span>
                          <span className="ml-1.5 opacity-80">({formatLKR(v.priceLKR)})</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Short description */}
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed pt-2">
                {product.shortDescription}
              </p>
            </div>

            {/* Buying Controls */}
            <div className="space-y-4 pt-4 border-t border-stone-200">
              <div className="flex items-center gap-3">
                {/* Quantity */}
                <div className="flex items-center border border-stone-300 rounded bg-white">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 text-stone-600 hover:bg-stone-100 transition-colors"
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span className="px-3 text-xs font-semibold text-stone-900 min-w-8 text-center">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.min(10, quantity + 1))}
                    className="px-3 py-2 text-stone-600 hover:bg-stone-100 transition-colors"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>

                {/* Add to Cart button */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={!product.inStock || !selectedVariant.inStock}
                  className="flex-1 py-3 px-6 bg-stone-900 text-amber-100 hover:bg-stone-800 disabled:opacity-50 text-xs font-semibold tracking-wider uppercase rounded transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  {added ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      Added to Cart
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      Add to Shopping Cart
                    </>
                  )}
                </button>
              </div>

              {/* Direct B2B consultation link for commercial units */}
              {product.category === "commercial-scenting" && (
                <div className="p-3 bg-stone-100 rounded border border-stone-200 text-xs text-stone-700 flex items-center justify-between">
                  <span>Planning an HVAC or multi-room installation?</span>
                  <Link
                    href="/business-scenting/request-quote"
                    className="font-semibold text-amber-900 underline hover:text-amber-800"
                  >
                    Request B2B Site Survey →
                  </Link>
                </div>
              )}

              {/* Trust micro-badges */}
              <div className="grid grid-cols-2 gap-3 pt-2 text-[11px] text-stone-600">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-800 shrink-0" />
                  <span>Official Dr. Scent Franchise Supply</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-amber-800 shrink-0" />
                  <span>Islandwide Sri Lanka Delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-800 shrink-0" />
                  <span>{product.warrantyPeriod || "Franchise Quality Guarantee"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-amber-800 shrink-0" />
                  <span>7-Day Return / Replacement Policy</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Structured Tabs (Specifications, Description & Usage, Delivery & Warranty) */}
        <div className="py-12 border-b border-stone-200">
          <div className="flex border-b border-stone-200 gap-6">
            <button
              type="button"
              onClick={() => setActiveTab("specs")}
              className={`pb-3 text-xs uppercase tracking-widest font-semibold transition-colors border-b-2 ${
                activeTab === "specs"
                  ? "border-amber-800 text-stone-900"
                  : "border-transparent text-stone-500 hover:text-stone-800"
              }`}
            >
              Specifications & Details
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("usage")}
              className={`pb-3 text-xs uppercase tracking-widest font-semibold transition-colors border-b-2 ${
                activeTab === "usage"
                  ? "border-amber-800 text-stone-900"
                  : "border-transparent text-stone-500 hover:text-stone-800"
              }`}
            >
              Description & Protocol
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("delivery")}
              className={`pb-3 text-xs uppercase tracking-widest font-semibold transition-colors border-b-2 ${
                activeTab === "delivery"
                  ? "border-amber-800 text-stone-900"
                  : "border-transparent text-stone-500 hover:text-stone-800"
              }`}
            >
              Delivery & Warranty Policy
            </button>
          </div>

          <div className="pt-6">
            {activeTab === "specs" && (
              <div className="space-y-6 max-w-3xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {product.specifications.map((spec) => (
                    <div
                      key={spec.label}
                      className="p-3 bg-white rounded border border-stone-200 flex justify-between text-xs"
                    >
                      <span className="text-stone-500 font-medium">{spec.label}</span>
                      <span className="text-stone-900 font-semibold text-right">{spec.value}</span>
                    </div>
                  ))}
                </div>

                {product.features.length > 0 && (
                  <div className="pt-4">
                    <h4 className="font-serif text-sm font-semibold text-stone-900 mb-2">
                      Key Highlights & Technology
                    </h4>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-600">
                      {product.features.map((f, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {activeTab === "usage" && (
              <div className="space-y-4 max-w-3xl text-xs sm:text-sm text-stone-600 leading-relaxed">
                <p>{product.description}</p>
                {product.usageInstructions && product.usageInstructions.length > 0 && (
                  <div className="pt-4">
                    <h4 className="font-serif text-sm font-semibold text-stone-900 mb-2">
                      Recommended Operating Protocol
                    </h4>
                    <ol className="list-decimal list-inside space-y-1.5 text-xs text-stone-600">
                      {product.usageInstructions.map((instruction, idx) => (
                        <li key={idx}>{instruction}</li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            )}

            {activeTab === "delivery" && (
              <div className="space-y-4 max-w-3xl text-xs sm:text-sm text-stone-600 leading-relaxed">
                <p>
                  <strong>Greater Colombo:</strong> Dispatched via dedicated courier within 24 to 48 hours. Express same-day delivery available upon request.
                </p>
                <p>
                  <strong>All Other Sri Lankan Provinces:</strong> Islandwide tracked delivery within 2 to 4 business days.
                </p>
                <p>
                  <strong>Warranty Coverage:</strong> Official franchisee replacement warranty covers manufacturer mechanical or pump defects. Damaged goods must be reported within 48 hours of receipt.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="pt-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-xs font-semibold tracking-widest uppercase text-amber-800 block mb-1">
                  Complementary Creations
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl text-stone-900 font-normal">
                  You May Also Appreciate
                </h2>
              </div>
              <Link
                href="/shop"
                className="text-xs uppercase tracking-wider font-semibold text-stone-800 hover:text-amber-900"
              >
                View Full Range →
              </Link>
            </div>

            <ProductGrid products={relatedProducts} columns={3} />
          </div>
        )}
      </div>
    </div>
  );
}
