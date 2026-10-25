"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Eye, ShoppingBag, Check, ShieldCheck, Sparkles } from "lucide-react";
import { Product } from "@/types/product";
import { formatLKR, formatProductPrice, isPriceOnRequest } from "@/config/brand.config";
import { useCart } from "@/context/CartContext";
import { Badge } from "@/components/common/Badge";
import { QuickViewModal } from "@/components/common/QuickViewModal";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const { addItem } = useCart();
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  const defaultVariant = product.variants[0];
  const price = defaultVariant ? defaultVariant.priceLKR : product.basePriceLKR;
  const originalPrice = defaultVariant?.originalPriceLKR || product.originalPriceLKR;
  const onRequest = isPriceOnRequest(price);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!defaultVariant || !product.inStock) return;
    if (onRequest) {
      window.location.href = "/business-scenting/request-quote";
      return;
    }

    setIsAdding(true);
    addItem(product, defaultVariant, 1);
    setTimeout(() => setIsAdding(false), 1000);
  };

  const hasSecondaryImage = Boolean(product.images && product.images.length > 1 && product.images[1]);

  return (
    <>
      <div
        className="group relative flex flex-col bg-[#FFFFFF] rounded-xl border border-[#E7E2D8] hover:border-[#B49A70]/60 hover:shadow-xl transition-all duration-500 overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image Container with Consistent Ratio (4:5) */}
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#FAF8F5]">
          <Link href={`/products/${product.slug}`} className="block w-full h-full relative">
            {!imageError && product.images[0] ? (
              <>
                {/* Primary Image */}
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  priority={priority}
                  unoptimized={typeof product.images[0] === "string" && product.images[0].startsWith("data:")}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className={`object-cover object-center transition-all duration-700 ease-out ${
                    hasSecondaryImage && isHovered ? "opacity-0 scale-105" : "opacity-100 scale-100 group-hover:scale-105"
                  }`}
                  onError={() => setImageError(true)}
                />

                {/* Secondary Alternate Image on Hover */}
                {hasSecondaryImage && (
                  <Image
                    src={product.images[1]}
                    alt={`${product.name} alternate view`}
                    fill
                    unoptimized={typeof product.images[1] === "string" && product.images[1].startsWith("data:")}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className={`object-cover object-center transition-all duration-700 ease-out ${
                      isHovered ? "opacity-100 scale-105" : "opacity-0 scale-100"
                    }`}
                  />
                )}
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-[#FAF8F5] p-6 text-center select-none">
                <div className="w-12 h-12 rounded-full bg-[#EFEAE1] border border-[#B49A70]/30 flex items-center justify-center text-[#B49A70] mb-2">
                  <ShieldCheck className="w-6 h-6 text-[#B49A70]" />
                </div>
                <span className="font-serif text-xs font-semibold text-[#151412] line-clamp-1 px-2">
                  {product.name}
                </span>
                <span className="text-[10px] tracking-widest uppercase text-[#B49A70] mt-1">
                  VIA Scent • Dr. Scent
                </span>
              </div>
            )}
          </Link>

          {/* Badges Overlay */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
            {originalPrice && originalPrice > price && (
              <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-[#211C19] text-[#B49A70] shadow-xs">
                Offer
              </span>
            )}
            {product.isBestseller && <Badge variant="gold">Bestseller</Badge>}
            {product.isNew && <Badge variant="dark">New Arrival</Badge>}
          </div>

          {/* Franchise Verification Badge */}
          {product.drScentAuthorized && (
            <div
              className="absolute top-3 right-3 z-10 bg-white/90 backdrop-blur-xs p-1.5 rounded-full shadow-xs text-[#B49A70] border border-[#E7E2D8]"
              title="Official Dr. Scent Franchise Supply"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          )}

          {/* Floating Actions on Hover */}
          <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-[#151412]/80 via-[#151412]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2 z-20">
            <button
              type="button"
              onClick={() => setIsQuickViewOpen(true)}
              className="px-3.5 py-2 bg-white/95 text-[#151412] hover:bg-white text-[11px] font-semibold tracking-wider uppercase rounded-md shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              aria-label={`Quick view ${product.name}`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Quick View</span>
            </button>

            <button
              type="button"
              onClick={handleQuickAdd}
              disabled={!product.inStock || isAdding}
              className={`px-3.5 py-2 text-[11px] font-semibold tracking-wider uppercase rounded-md shadow-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                isAdding
                  ? "bg-[#B49A70] text-[#151412]"
                  : product.inStock
                  ? "bg-[#151412] text-[#B49A70] hover:bg-black"
                  : "bg-stone-300 text-stone-500 cursor-not-allowed"
              }`}
              aria-label={onRequest ? `Request a quote for ${product.name}` : `Add ${product.name} to shopping bag`}
            >
              {isAdding ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Added</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>{onRequest ? "Enquire" : "Add to Bag"}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Product Information */}
        <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] tracking-[0.2em] uppercase text-[#8A8275]">
              <span>{product.categoryName}</span>
              {product.variants.length > 1 && (
                <span className="text-[#B49A70] font-medium">{product.variants.length} Options</span>
              )}
            </div>

            <Link href={`/products/${product.slug}`} className="block group-hover:text-[#B49A70] transition-colors">
              <h3 className="font-serif text-base sm:text-lg font-semibold text-[#151412] line-clamp-1 leading-snug">
                {product.name}
              </h3>
            </Link>

            <p className="text-xs text-[#57534E] line-clamp-1 leading-relaxed">
              {product.tagline || product.shortDescription}
            </p>
          </div>

          {/* Pricing & Stock Status */}
          <div className="pt-2 border-t border-[#EFEAE1] flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="font-semibold text-sm sm:text-base text-[#151412]">
                {formatProductPrice(price)}
              </span>
              {!onRequest && originalPrice && originalPrice > price && (
                <span className="text-xs text-[#8A8275] line-through">
                  {formatLKR(originalPrice)}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  product.inStock ? "bg-emerald-600" : "bg-amber-600"
                }`}
              />
              <span className="text-[10px] font-medium tracking-wider uppercase text-[#8A8275]">
                {product.stockStatus || (product.inStock ? "In Stock" : "Backorder")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        product={product}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
      />
    </>
  );
}
