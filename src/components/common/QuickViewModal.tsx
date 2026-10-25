"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { X, ShoppingBag, ArrowRight, Check, ShieldCheck, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { Product } from "@/types/product";
import { formatLKR, formatProductPrice, isPriceOnRequest } from "@/config/brand.config";
import { useCart } from "@/context/CartContext";
import { Badge } from "./Badge";

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
  const { addItem } = useCart();
  const router = useRouter();
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (!isOpen || !product) return null;

  const currentVariant =
    product.variants.find((v) => v.id === selectedVariantId) ||
    product.variants[0] ||
    null;
  const price = currentVariant ? currentVariant.priceLKR : product.basePriceLKR;
  const originalPrice = currentVariant?.originalPriceLKR || product.originalPriceLKR;
  const onRequest = isPriceOnRequest(price);

  const handleAddToCart = () => {
    if (!currentVariant) return;
    if (onRequest) {
      router.push("/business-scenting/request-quote");
      return;
    }
    addItem(product, currentVariant, quantity);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-950/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-lg bg-[#FAF8F5] text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-2xl border border-stone-200">
          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="absolute right-4 top-4 z-10 p-2 text-stone-500 hover:text-stone-900 rounded-full hover:bg-stone-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Image side */}
            <div className="relative aspect-square md:aspect-auto h-72 md:h-full bg-stone-100 overflow-hidden">
              {product.images && product.images.length > 0 ? (
                <>
                  <Image
                    src={product.images[activeImageIndex] || product.images[0]}
                    alt={`${product.name} - View ${activeImageIndex + 1}`}
                    fill
                    unoptimized={typeof (product.images[activeImageIndex] || product.images[0]) === "string" && (product.images[activeImageIndex] || product.images[0]).startsWith("data:")}
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />

                  {product.images.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveImageIndex((prev) => (prev <= 0 ? product.images.length - 1 : prev - 1));
                        }}
                        aria-label="Previous image"
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-stone-900 border border-stone-200/90 shadow-sm flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4 text-stone-800" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveImageIndex((prev) => (prev >= product.images.length - 1 ? 0 : prev + 1));
                        }}
                        aria-label="Next image"
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-stone-900 border border-stone-200/90 shadow-sm flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                      >
                        <ChevronRight className="w-4 h-4 text-stone-800" />
                      </button>

                      <div className="absolute bottom-2.5 right-2.5 z-10 px-2 py-0.5 rounded-full text-[10px] font-medium bg-black/60 text-white backdrop-blur-xs select-none">
                        {activeImageIndex + 1} / {product.images.length}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-[#F5F2EB] p-8 text-center">
                  <ShieldCheck className="w-10 h-10 text-amber-800 mb-2" />
                  <span className="font-serif text-sm font-semibold text-stone-800">
                    {product.name}
                  </span>
                </div>
              )}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                {product.isBestseller && <Badge variant="gold">Bestseller</Badge>}
                {product.isNew && <Badge variant="dark">New Arrival</Badge>}
              </div>
            </div>

            {/* Info side */}
            <div className="p-6 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center gap-2 text-xs text-stone-500 uppercase tracking-wider mb-1">
                  <span>{product.categoryName}</span>
                  <span>•</span>
                  <span>SKU: {currentVariant?.sku || product.sku}</span>
                </div>

                <h3 className="font-serif text-xl font-medium text-stone-900 leading-snug">
                  {product.name}
                </h3>
                <p className="text-xs text-stone-600 mt-1 line-clamp-2">
                  {product.tagline}
                </p>

                {/* Price */}
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-lg font-semibold text-stone-900">
                    {formatProductPrice(price)}
                  </span>
                  {!onRequest && originalPrice && originalPrice > price && (
                    <span className="text-xs text-stone-400 line-through">
                      {formatLKR(originalPrice)}
                    </span>
                  )}
                </div>

                {/* Scent notes or coverage preview */}
                {product.scentNotes && (
                  <div className="mt-3 p-2.5 rounded bg-amber-50/70 border border-amber-200/60 text-xs">
                    <span className="font-semibold text-amber-950 block mb-1 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-600" />
                      Fragrance Profile:
                    </span>
                    <p className="text-amber-900">
                      <strong>Top:</strong> {product.scentNotes.top.join(", ")} |{" "}
                      <strong>Heart:</strong> {product.scentNotes.heart.join(", ")}
                    </p>
                  </div>
                )}

                {product.coverageArea && (
                  <p className="mt-2 text-xs text-stone-600">
                    <strong>Coverage:</strong> {product.coverageArea}
                  </p>
                )}

                {/* Variant selection */}
                {product.variants.length > 1 && (
                  <div className="mt-4 space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-stone-700 block">
                      Select Variant:
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {product.variants.map((v) => (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => setSelectedVariantId(v.id)}
                          className={`px-3 py-1.5 rounded text-xs transition-all ${
                            currentVariant?.id === v.id
                              ? "bg-stone-900 text-stone-100 font-semibold"
                              : "bg-white border border-stone-300 text-stone-700 hover:border-stone-400"
                          }`}
                        >
                          {v.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action controls */}
              <div className="space-y-3 pt-3 border-t border-stone-200">
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-stone-300 rounded bg-white">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-2.5 py-1.5 text-stone-600 hover:bg-stone-100"
                      aria-label="Decrease quantity"
                    >
                      -
                    </button>
                    <span className="px-3 text-xs font-medium text-stone-800">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.min(10, quantity + 1))}
                      className="px-2.5 py-1.5 text-stone-600 hover:bg-stone-100"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={!product.inStock || added}
                    className="flex-1 py-2.5 px-4 bg-stone-900 text-amber-100 hover:bg-stone-800 text-xs font-semibold tracking-wider uppercase rounded transition-colors flex items-center justify-center gap-2 shadow-xs"
                  >
                    {added ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        Added to Cart
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4" />
                        {onRequest ? "Request a Quote" : "Add to Cart"}
                      </>
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <Link
                    href={`/products/${product.slug}`}
                    onClick={onClose}
                    className="text-stone-700 hover:text-amber-900 font-medium underline underline-offset-4 flex items-center gap-1"
                  >
                    View Full Specifications
                    <ArrowRight className="w-3 h-3" />
                  </Link>

                  <span className="text-stone-500 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-amber-700" />
                    Authorized Dr. Scent
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
