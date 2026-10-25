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
  Award,
  ArrowRight,
  Plus,
  Minus,
  MessageCircle,
  Maximize,
  Droplet,
} from "lucide-react";
import { motion } from "motion/react";
import { Product, ProductVariant } from "@/types/product";
import { BRAND_CONFIG, formatLKR, formatWarranty, isPriceOnRequest } from "@/config/brand.config";
import { useCart } from "@/context/CartContext";
import { ProductGallery } from "./ProductGallery";
import { ProductCard } from "./ProductCard";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { ProductReviews, ReviewSummaryLink } from "./ProductReviews";
import type { PublicReview, ReviewSummary } from "@/types/review";

interface ProductDetailClientProps {
  product: Product;
  relatedProducts: Product[];
  reviews?: PublicReview[];
  reviewSummary?: ReviewSummary;
}

/** One collapsible section of the product details, open or closed independently. */
function DetailSection({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  return (
    <details open={defaultOpen} className="group border-b border-[var(--warm-stone)]/40">
      <summary className="flex items-center justify-between py-4 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
        <span className="text-xs uppercase tracking-[0.18em] font-medium text-[var(--near-black)]">{title}</span>
        <Plus className="w-4 h-4 text-[var(--deep-espresso)]/60 group-open:hidden" />
        <Minus className="w-4 h-4 text-[var(--deep-espresso)]/60 hidden group-open:block" />
      </summary>
      <div className="pb-5 text-sm text-[var(--deep-espresso)]/85 leading-relaxed space-y-3">{children}</div>
    </details>
  );
}

export function ProductDetailClient({
  product,
  relatedProducts,
  reviews = [],
  reviewSummary = { average: 0, count: 0 },
}: ProductDetailClientProps) {
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

  const price = selectedVariant.priceLKR;
  const originalPrice = selectedVariant.originalPriceLKR || product.originalPriceLKR;
  const onRequest = isPriceOnRequest(price);
  const available = product.inStock && selectedVariant.inStock;
  const warrantyLabel = formatWarranty(product.warrantyDurationMonths);
  const variantPricesDiffer = new Set(product.variants.map((v) => v.priceLKR)).size > 1;
  const whatsappHref = `https://wa.me/${BRAND_CONFIG.contact.whatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
    `Hi, I have a question about ${product.name.trim()}.`
  )}`;

  const quickFacts = [
    product.coverageArea && { icon: Maximize, label: "Coverage", value: product.coverageArea },
    product.bottleVolume && { icon: Droplet, label: "Size", value: product.bottleVolume },
    warrantyLabel && { icon: Award, label: "Warranty", value: warrantyLabel },
  ].filter(Boolean) as { icon: typeof Award; label: string; value: string }[];

  const handleAddToCart = () => {
    if (!available) return;
    addItem(product, selectedVariant, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  };

  const handleBuyNow = () => {
    if (!available) return;
    addItem(product, selectedVariant, quantity);
    router.push("/checkout");
  };

  const breadcrumbs = [
    { label: "Shop", href: "/shop" },
    { label: product.categoryName, href: `/shop/${product.category}` },
    { label: product.name },
  ];

  const priceDisplay = onRequest ? (
    <span className="font-serif text-2xl text-[var(--near-black)]">Price on request</span>
  ) : (
    <span className="font-serif text-2xl sm:text-[28px] text-[var(--near-black)]">{formatLKR(price)}</span>
  );

  return (
    <div className="pt-6 sm:pt-10 pb-28 lg:pb-20 bg-[var(--porcelain)] text-[var(--near-black)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-5 sm:mb-8">
          <Breadcrumbs items={breadcrumbs} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14">
          {/* Gallery */}
          <div className="lg:col-span-7">
            <div className="lg:sticky lg:top-28">
              <ProductGallery
                images={product.images}
                productName={product.name}
                isBestseller={product.isBestseller}
                isNew={product.isNew}
              />
            </div>
          </div>

          {/* Buy box and details */}
          <div className="lg:col-span-5 min-w-0">
            <Link
              href={`/shop/${product.category}`}
              className="text-[11px] uppercase tracking-[0.2em] text-[var(--champagne)] hover:text-[var(--near-black)] transition-colors font-medium"
            >
              {product.categoryName}
            </Link>
            <h1 className="mt-2 font-serif text-[2rem] sm:text-4xl lg:text-[44px] font-normal tracking-tight leading-[1.1]">
              {product.name}
            </h1>
            {product.tagline && (
              <p className="mt-3 text-sm sm:text-base text-[var(--deep-espresso)]/80 leading-relaxed">{product.tagline}</p>
            )}
            <div>
              <ReviewSummaryLink summary={reviewSummary} />
            </div>

            <div className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              {priceDisplay}
              {!onRequest && originalPrice && originalPrice > price && (
                <span className="text-sm text-[var(--deep-espresso)]/50 line-through">{formatLKR(originalPrice)}</span>
              )}
              <span
                className={`ml-auto inline-flex items-center gap-1.5 text-xs ${
                  available ? "text-emerald-800" : "text-[var(--deep-espresso)]/60"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${available ? "bg-emerald-600" : "bg-stone-400"}`} />
                {available ? product.stockStatus : "Out of stock"}
              </span>
            </div>

            {/* Options */}
            {product.variants.length > 1 && (
              <div className="mt-7">
                <p className="text-xs text-[var(--deep-espresso)]/70 mb-2.5">
                  Option: <span className="text-[var(--near-black)] font-medium">{selectedVariant.name}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => {
                    const isSelected = selectedVariant.id === v.id;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSelectedVariant(v)}
                        aria-pressed={isSelected}
                        className={`min-w-16 px-4 py-2.5 text-xs border transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-[var(--near-black)] text-[var(--porcelain)] border-[var(--near-black)]"
                            : "bg-white border-[var(--warm-stone)]/60 text-[var(--deep-espresso)] hover:border-[var(--near-black)]"
                        } ${v.inStock ? "" : "line-through opacity-50"}`}
                      >
                        {v.name}
                        {variantPricesDiffer && !isPriceOnRequest(v.priceLKR) && (
                          <span className="ml-1.5 opacity-70">{formatLKR(v.priceLKR)}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Buying controls */}
            <div className="mt-7 space-y-3">
              {onRequest ? (
                <Link
                  href="/business-scenting/request-quote"
                  className="w-full py-4 px-5 bg-[var(--near-black)] text-[var(--porcelain)] hover:bg-[var(--deep-espresso)] text-xs font-medium tracking-[0.18em] uppercase transition-colors flex items-center justify-center gap-2"
                >
                  Request a quote
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <>
                  <div className="flex gap-3">
                    <div className="flex items-center border border-[var(--warm-stone)]/60 bg-white shrink-0">
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-3.5 py-3.5 hover:bg-[var(--ivory)] transition-colors cursor-pointer"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-sm" aria-live="polite">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.min(10, quantity + 1))}
                        className="px-3.5 py-3.5 hover:bg-[var(--ivory)] transition-colors cursor-pointer"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={handleAddToCart}
                      disabled={!available}
                      className="flex-1 py-4 px-5 bg-[var(--near-black)] text-[var(--porcelain)] hover:bg-[var(--deep-espresso)] disabled:opacity-40 text-xs font-medium tracking-[0.18em] uppercase transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {added ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
                      {added ? "Added to cart" : "Add to cart"}
                    </motion.button>
                  </div>
                  <button
                    type="button"
                    onClick={handleBuyNow}
                    disabled={!available}
                    className="w-full py-4 px-5 border border-[var(--near-black)] text-[var(--near-black)] hover:bg-white disabled:opacity-40 text-xs font-medium tracking-[0.18em] uppercase transition-colors cursor-pointer"
                  >
                    Buy now
                  </button>
                </>
              )}
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-2 text-xs text-[var(--deep-espresso)]/80 hover:text-[var(--near-black)] transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Questions? Chat with us on WhatsApp
              </a>
            </div>

            {/* Quick facts */}
            {quickFacts.length > 0 && (
              <div
                className={`mt-6 grid ${quickFacts.length === 3 ? "grid-cols-3" : quickFacts.length === 2 ? "grid-cols-2" : "grid-cols-1"} border-y border-[var(--warm-stone)]/40 divide-x divide-[var(--warm-stone)]/40`}
              >
                {quickFacts.map((fact) => {
                  const Icon = fact.icon;
                  return (
                    <div key={fact.label} className="py-4 px-2 text-center">
                      <Icon className="w-4 h-4 mx-auto text-[var(--champagne)]" strokeWidth={1.5} />
                      <p className="mt-1.5 text-[10px] uppercase tracking-[0.16em] text-[var(--deep-espresso)]/60">{fact.label}</p>
                      <p className="mt-0.5 text-xs text-[var(--near-black)] leading-snug">{fact.value}</p>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Details */}
            <div className={`${quickFacts.length > 0 ? "mt-2" : "mt-6 border-t border-[var(--warm-stone)]/40"}`}>
              <DetailSection title="Description" defaultOpen>
                {product.shortDescription && <p>{product.shortDescription}</p>}
                {product.description && product.description !== product.shortDescription && <p>{product.description}</p>}
                {product.features.length > 0 && (
                  <ul className="space-y-1.5 pt-1">
                    {product.features.map((f, i) => (
                      <li key={i} className="flex gap-2">
                        <Check className="w-4 h-4 mt-0.5 text-[var(--champagne)] shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </DetailSection>

              {product.scentNotes && (
                <DetailSection title="Scent notes" defaultOpen>
                  <dl className="grid grid-cols-3 gap-4">
                    {(
                      [
                        ["Top", product.scentNotes.top],
                        ["Heart", product.scentNotes.heart],
                        ["Base", product.scentNotes.base],
                      ] as const
                    ).map(([label, notes]) => (
                      <div key={label}>
                        <dt className="text-[10px] uppercase tracking-[0.16em] text-[var(--deep-espresso)]/60">{label}</dt>
                        <dd className="mt-1 text-[var(--near-black)]">{notes.join(", ")}</dd>
                      </div>
                    ))}
                  </dl>
                  {product.scentNotes.intensity && (
                    <p className="text-xs text-[var(--deep-espresso)]/70">Strength: {product.scentNotes.intensity}</p>
                  )}
                </DetailSection>
              )}

              {product.usageInstructions && product.usageInstructions.length > 0 && (
                <DetailSection title="How to use">
                  <ol className="space-y-2">
                    {product.usageInstructions.map((step, idx) => (
                      <li key={idx} className="flex gap-3">
                        <span className="w-5 h-5 shrink-0 rounded-full border border-[var(--warm-stone)] text-[10px] flex items-center justify-center mt-0.5">
                          {idx + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </DetailSection>
              )}

              {product.specifications.length > 0 && (
                <DetailSection title="Specifications">
                  <dl className="divide-y divide-[var(--warm-stone)]/30">
                    {product.specifications.map((spec) => (
                      <div key={spec.label} className="flex justify-between gap-4 py-2 text-xs sm:text-sm">
                        <dt className="text-[var(--deep-espresso)]/70">{spec.label}</dt>
                        <dd className="text-[var(--near-black)] text-right">
                          {/* Keep warranty consistent with the structured duration used for claims */}
                          {spec.label.toLowerCase() === "warranty" ? warrantyLabel ?? "Not covered" : spec.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </DetailSection>
              )}

              <DetailSection title="Delivery & returns">
                <p>
                  <strong className="text-[var(--near-black)] font-medium">Colombo and suburbs:</strong> delivered in 1 to 2 days.
                </p>
                <p>
                  <strong className="text-[var(--near-black)] font-medium">Rest of Sri Lanka:</strong> tracked delivery in 2 to 4 working days.
                </p>
                <p>
                  <strong className="text-[var(--near-black)] font-medium">Returns:</strong> 7 days for unopened items and faulty machines.
                </p>
                {warrantyLabel && (
                  <p>
                    <strong className="text-[var(--near-black)] font-medium">Warranty:</strong> {warrantyLabel}, serviced at our
                    Colombo service centre with genuine Dr. Scent parts.
                  </p>
                )}
              </DetailSection>
            </div>

            {product.category === "commercial-scenting" && (
              <Link
                href="/business-scenting/request-quote"
                className="mt-6 p-4 bg-[var(--ivory)] border border-[var(--warm-stone)]/60 text-xs flex items-center justify-between gap-3 hover:border-[var(--champagne)] transition-colors"
              >
                <span>Scenting a hotel, office or showroom? We offer a free site visit.</span>
                <ArrowRight className="w-4 h-4 shrink-0 text-[var(--champagne)]" />
              </Link>
            )}

            {/* Reassurance */}
            <ul className="mt-6 grid grid-cols-2 gap-3 text-xs text-[var(--deep-espresso)]/80">
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[var(--champagne)] shrink-0" />
                Genuine Dr. Scent
              </li>
              <li className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[var(--champagne)] shrink-0" />
                Islandwide delivery
              </li>
              <li className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-[var(--champagne)] shrink-0" />
                7-day returns
              </li>
              <li className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-[var(--champagne)] shrink-0" />
                Cash on delivery
              </li>
            </ul>
          </div>
        </div>

        <ProductReviews productId={product.id} reviews={reviews} summary={reviewSummary} />

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <section className="mt-16 sm:mt-24 pt-12 border-t border-[var(--warm-stone)]/40">
            <div className="flex items-end justify-between gap-4 mb-8">
              <h2 className="font-serif text-[1.75rem] sm:text-4xl font-normal tracking-tight">You may also like</h2>
              <Link
                href={`/shop/${product.category}`}
                className="shrink-0 text-xs uppercase tracking-[0.18em] font-medium hover:text-[var(--champagne)] transition-colors"
              >
                See all
              </Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Mobile buy bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-[var(--porcelain)]/95 backdrop-blur border-t border-[var(--warm-stone)]/50 px-4 py-3 flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs text-[var(--deep-espresso)]/70 truncate">{product.name}</p>
          <p className="text-sm font-medium">{onRequest ? "Price on request" : formatLKR(price)}</p>
        </div>
        {onRequest ? (
          <Link
            href="/business-scenting/request-quote"
            className="px-5 py-3 bg-[var(--near-black)] text-[var(--porcelain)] text-[11px] font-medium tracking-[0.16em] uppercase"
          >
            Get a quote
          </Link>
        ) : (
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!available}
            className="px-5 py-3 bg-[var(--near-black)] text-[var(--porcelain)] disabled:opacity-40 text-[11px] font-medium tracking-[0.16em] uppercase cursor-pointer"
          >
            {added ? "Added" : "Add to cart"}
          </button>
        )}
      </div>
    </div>
  );
}
