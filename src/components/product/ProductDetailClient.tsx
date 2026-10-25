"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  Check,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  Award,
  ArrowRight,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Product, ProductVariant } from "@/types/product";
import { formatLKR, formatWarranty, isPriceOnRequest } from "@/config/brand.config";
import { useCart } from "@/context/CartContext";
import { ProductGallery } from "./ProductGallery";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { ProductGrid } from "./ProductGrid";
import { LUXURY_EASE } from "@/config/motion.config";

interface ProductDetailClientProps {
  product: Product;
  relatedProducts: Product[];
}

export function ProductDetailClient({ product, relatedProducts }: ProductDetailClientProps) {
  const router = useRouter();
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
  const onRequest = isPriceOnRequest(price);
  const warrantyLabel = formatWarranty(product.warrantyDurationMonths);

  const handleAddToCart = () => {
    if (!product.inStock || !selectedVariant.inStock) return;
    addItem(product, selectedVariant, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  };

  const handleBuyNow = () => {
    if (!product.inStock || !selectedVariant.inStock) return;
    addItem(product, selectedVariant, quantity);
    router.push("/checkout");
  };

  const breadcrumbs = [
    { label: "Catalogue", href: "/shop" },
    { label: product.categoryName, href: `/shop/${product.category}` },
    { label: product.name },
  ];

  return (
    <div className="py-10 sm:py-16 bg-[var(--porcelain)] text-[var(--near-black)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Breadcrumbs items={breadcrumbs} />
        </div>

        {/* Product Overview Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 pt-2 pb-20 border-b border-[var(--warm-stone)]/40">
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
          <div className="lg:col-span-5 flex flex-col justify-between space-y-8">
            <div className="space-y-6">
              {/* Category, SKU & Status */}
              <div className="flex items-center justify-between text-[11px] text-[var(--deep-espresso)]/70 uppercase tracking-[0.2em]">
                <Link
                  href={`/shop/${product.category}`}
                  className="hover:text-[var(--champagne)] transition-colors font-medium"
                >
                  {product.categoryName}
                </Link>
                <span className="font-mono text-[10px]">SKU: {selectedVariant.sku || product.sku}</span>
              </div>

              {/* Title & Tagline */}
              <div className="space-y-2">
                <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-[var(--near-black)] tracking-tight leading-[1.12]">
                  {product.name}
                </h1>
                <p className="text-xs sm:text-sm text-[var(--deep-espresso)]/80 font-light leading-relaxed">
                  {product.tagline}
                </p>
              </div>

              {/* Price & Availability */}
              <div className="flex items-baseline gap-4 pt-2 border-t border-b border-[var(--warm-stone)]/30 py-4">
                {onRequest ? (
                  <span className="font-serif text-2xl sm:text-3xl text-[var(--near-black)] font-medium">
                    Price on request
                  </span>
                ) : (
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs tracking-wider uppercase text-[var(--champagne)] font-medium">Rs.</span>
                    <span className="font-serif text-2xl sm:text-3xl text-[var(--near-black)] font-medium">
                      {price.toLocaleString("en-LK")}
                    </span>
                  </div>
                )}
                {!onRequest && originalPrice && originalPrice > price && (
                  <span className="text-xs text-[var(--warm-stone)] line-through">
                    {formatLKR(originalPrice, true)}
                  </span>
                )}
                <span
                  className={`text-[10px] px-2.5 py-1 rounded-sm uppercase tracking-widest font-medium ml-auto ${
                    product.inStock && selectedVariant.inStock
                      ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
                      : "bg-stone-100 text-stone-500 border border-stone-200"
                  }`}
                >
                  {product.inStock && selectedVariant.inStock ? product.stockStatus : "Allocation Filled"}
                </span>
              </div>

              {/* Scent notes highlight if fragrance oil */}
              {product.scentNotes && (
                <div className="p-4 rounded-sm bg-[var(--ivory)] border border-[var(--warm-stone)]/60 text-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-xs text-[var(--near-black)] tracking-wider uppercase flex items-center gap-1.5 font-medium">
                      <Sparkles className="w-3.5 h-3.5 text-[var(--champagne)]" />
                      Olfactory Architecture
                    </span>
                    {product.scentNotes.intensity && (
                      <span className="text-[10px] uppercase tracking-wider text-[var(--champagne)] font-mono">
                        Intensity: {product.scentNotes.intensity}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-[var(--deep-espresso)] pt-2 border-t border-[var(--warm-stone)]/40 text-[11px] font-light">
                    <div>
                      <strong className="text-[var(--near-black)] block font-medium uppercase text-[9px] tracking-wider mb-0.5">Top Note</strong>
                      <span>{product.scentNotes.top.join(", ")}</span>
                    </div>
                    <div>
                      <strong className="text-[var(--near-black)] block font-medium uppercase text-[9px] tracking-wider mb-0.5">Heart Note</strong>
                      <span>{product.scentNotes.heart.join(", ")}</span>
                    </div>
                    <div>
                      <strong className="text-[var(--near-black)] block font-medium uppercase text-[9px] tracking-wider mb-0.5">Base Note</strong>
                      <span>{product.scentNotes.base.join(", ")}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Variant Selector */}
              {product.variants.length > 1 && (
                <div className="space-y-2.5 pt-1">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-[var(--deep-espresso)]/70 font-medium block">
                    Select Edition / Volume:
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {product.variants.map((v) => {
                      const isSelected = selectedVariant.id === v.id;
                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => setSelectedVariant(v)}
                          className={`px-4 py-2.5 rounded-sm text-xs transition-all duration-200 border cursor-pointer ${
                            isSelected
                              ? "bg-[var(--near-black)] text-[var(--porcelain)] border-[var(--near-black)] shadow-xs"
                              : "bg-white border-[var(--warm-stone)]/60 text-[var(--deep-espresso)] hover:border-[var(--champagne)]"
                          }`}
                        >
                          <span className="font-medium">{v.name}</span>
                          <span className="ml-2 text-[10px] font-mono opacity-80">({formatLKR(v.priceLKR)})</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Short description */}
              <p className="text-xs sm:text-sm text-[var(--deep-espresso)]/80 leading-relaxed font-light">
                {product.shortDescription}
              </p>
            </div>

            {/* Buying Controls */}
            <div className="space-y-5 pt-6 border-t border-[var(--warm-stone)]/40">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {/* Quantity */}
                <div className="flex items-center justify-between sm:justify-start border border-[var(--warm-stone)]/60 rounded-sm bg-white shrink-0">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3.5 py-3 text-[var(--deep-espresso)] hover:bg-[var(--ivory)] transition-colors cursor-pointer"
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span className="px-3 text-xs font-mono font-medium text-[var(--near-black)] min-w-8 text-center">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.min(10, quantity + 1))}
                    className="px-3.5 py-3 text-[var(--deep-espresso)] hover:bg-[var(--ivory)] transition-colors cursor-pointer"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>

                {onRequest ? (
                  <Link
                    href="/business-scenting/request-quote"
                    className="flex-1 py-3.5 px-5 bg-[var(--near-black)] text-[var(--porcelain)] hover:bg-[var(--champagne)] hover:text-white text-xs font-medium tracking-[0.16em] uppercase rounded-sm transition-all duration-300 flex items-center justify-center gap-2 shadow-sm"
                  >
                    <span>Request a Quote</span>
                  </Link>
                ) : (
                  <>
                  {/* Add to Cart button */}
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={handleAddToCart}
                    disabled={!product.inStock || !selectedVariant.inStock}
                    className="flex-1 py-3.5 px-5 border border-[var(--near-black)] bg-white text-[var(--near-black)] hover:bg-[var(--near-black)] hover:text-white disabled:opacity-40 text-xs font-medium tracking-[0.16em] uppercase rounded-sm transition-all duration-300 flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                  >
                    {added ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span>Added to Cart</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4" />
                        <span>Add to Cart</span>
                      </>
                    )}
                  </motion.button>

                  {/* Buy Now button */}
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={handleBuyNow}
                    disabled={!product.inStock || !selectedVariant.inStock}
                    className="flex-1 py-3.5 px-5 bg-[var(--near-black)] text-[var(--porcelain)] hover:bg-[var(--champagne)] hover:text-white disabled:opacity-40 text-xs font-medium tracking-[0.16em] uppercase rounded-sm transition-all duration-300 flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                  >
                    <Zap className="w-4 h-4 text-[var(--champagne)]" />
                    <span>Buy Now</span>
                  </motion.button>
                  </>
                )}
              </div>

              {/* Direct B2B consultation link for commercial units */}
              {product.category === "commercial-scenting" && (
                <div className="p-3.5 bg-[var(--ivory)] rounded-sm border border-[var(--warm-stone)]/60 text-xs text-[var(--deep-espresso)] flex items-center justify-between">
                  <span className="font-light">Planning an HVAC or architectural installation?</span>
                  <Link
                    href="/business-scenting/request-quote"
                    className="font-medium text-[var(--champagne)] hover:underline flex items-center gap-1"
                  >
                    <span>Request Site Survey</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              )}

              {/* Trust micro-badges */}
              <div className="grid grid-cols-2 gap-3.5 pt-2 text-[11px] text-[var(--deep-espresso)]/80 font-light">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[var(--champagne)] shrink-0" />
                  <span>Official Dr. Scent Franchise Supply</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[var(--champagne)] shrink-0" />
                  <span>Islandwide Tracked Delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-[var(--champagne)] shrink-0" />
                  <span>{warrantyLabel}</span>
                </div>
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-[var(--champagne)] shrink-0" />
                  <span>7-Day Return / Replacement Protection</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Structured Tabs (Specifications, Description & Usage, Delivery & Warranty) */}
        <div className="py-14 border-b border-[var(--warm-stone)]/40">
          <div className="flex border-b border-[var(--warm-stone)]/40 gap-8">
            <button
              type="button"
              onClick={() => setActiveTab("specs")}
              className={`pb-3.5 text-xs uppercase tracking-[0.2em] font-medium transition-colors border-b-2 cursor-pointer ${
                activeTab === "specs"
                  ? "border-[var(--near-black)] text-[var(--near-black)]"
                  : "border-transparent text-[var(--deep-espresso)]/60 hover:text-[var(--near-black)]"
              }`}
            >
              Specifications & Engineering
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("usage")}
              className={`pb-3.5 text-xs uppercase tracking-[0.2em] font-medium transition-colors border-b-2 cursor-pointer ${
                activeTab === "usage"
                  ? "border-[var(--near-black)] text-[var(--near-black)]"
                  : "border-transparent text-[var(--deep-espresso)]/60 hover:text-[var(--near-black)]"
              }`}
            >
              Narrative & Protocol
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("delivery")}
              className={`pb-3.5 text-xs uppercase tracking-[0.2em] font-medium transition-colors border-b-2 cursor-pointer ${
                activeTab === "delivery"
                  ? "border-[var(--near-black)] text-[var(--near-black)]"
                  : "border-transparent text-[var(--deep-espresso)]/60 hover:text-[var(--near-black)]"
              }`}
            >
              Fulfillment & Warranty
            </button>
          </div>

          <div className="pt-8">
            {activeTab === "specs" && (
              <div className="space-y-6 max-w-3xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {product.specifications.map((spec) => (
                    <div
                      key={spec.label}
                      className="p-3.5 bg-white rounded-sm border border-[var(--warm-stone)]/40 flex justify-between text-xs"
                    >
                      <span className="text-[var(--deep-espresso)]/70 font-light">{spec.label}</span>
                      <span className="text-[var(--near-black)] font-medium text-right font-mono">
                        {/* Keep warranty consistent with the structured duration used for claims */}
                        {spec.label.toLowerCase() === "warranty" ? warrantyLabel : spec.value}
                      </span>
                    </div>
                  ))}
                </div>

                {product.features.length > 0 && (
                  <div className="pt-4">
                    <h4 className="font-serif text-sm font-medium text-[var(--near-black)] mb-3">
                      Architectural Highlights & Innovations
                    </h4>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-[var(--deep-espresso)]/80 font-light">
                      {product.features.map((f, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-[var(--champagne)] shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {activeTab === "usage" && (
              <div className="space-y-4 max-w-3xl text-xs sm:text-sm text-[var(--deep-espresso)]/80 leading-relaxed font-light">
                <p>{product.description}</p>
                {product.usageInstructions && product.usageInstructions.length > 0 && (
                  <div className="pt-4">
                    <h4 className="font-serif text-sm font-medium text-[var(--near-black)] mb-2.5">
                      Recommended Operating Protocol
                    </h4>
                    <ol className="list-decimal list-inside space-y-2 text-xs text-[var(--deep-espresso)]/80 font-light">
                      {product.usageInstructions.map((instruction, idx) => (
                        <li key={idx} className="leading-relaxed">{instruction}</li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            )}

            {activeTab === "delivery" && (
              <div className="space-y-4 max-w-3xl text-xs sm:text-sm text-[var(--deep-espresso)]/80 leading-relaxed font-light">
                <p>
                  <strong className="text-[var(--near-black)] font-medium">Greater Colombo & Suburbs:</strong> Dispatched via dedicated courier within 24 to 48 hours. Express same-day delivery available upon request.
                </p>
                <p>
                  <strong className="text-[var(--near-black)] font-medium">All Provincial Regions in Sri Lanka:</strong> Islandwide tracked delivery within 2 to 4 business days.
                </p>
                <p>
                  <strong className="text-[var(--near-black)] font-medium">6-Month Hardware Warranty:</strong> Covers manufacturing, mechanical pump, or nebulization chamber defects through our Colombo service center with genuine Dr. Scent parts.
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
                <span className="text-[10px] font-medium tracking-[0.25em] uppercase text-[var(--champagne)] block mb-1">
                  Complementary Atmospheric Creations
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl text-[var(--near-black)] font-normal">
                  You May Also Appreciate
                </h2>
              </div>
              <Link
                href="/shop"
                className="text-xs uppercase tracking-[0.2em] font-medium text-[var(--near-black)] hover:text-[var(--champagne)] transition-colors"
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
