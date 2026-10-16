"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Eye, ShoppingBag, Check, ShieldCheck } from "lucide-react";
import { Product } from "@/types/product";
import { formatLKR } from "@/config/brand.config";
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

  const defaultVariant = product.variants[0];
  const price = defaultVariant ? defaultVariant.priceLKR : product.basePriceLKR;
  const originalPrice = defaultVariant?.originalPriceLKR || product.originalPriceLKR;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!defaultVariant || !product.inStock) return;

    setIsAdding(true);
    addItem(product, defaultVariant, 1);
    setTimeout(() => setIsAdding(false), 800);
  };

  const [imageError, setImageError] = useState(false);

  return (
    <>
      <div className="group relative flex flex-col bg-white rounded border border-[#E7E2D8] hover:border-amber-700/40 hover:shadow-lg transition-all duration-300">
        {/* Image Container with Consistent Ratio (4:5) */}
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-stone-100 rounded-t">
          <Link href={`/products/${product.slug}`} className="block w-full h-full relative">
            {!imageError && product.images[0] ? (
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                priority={priority}
                unoptimized={typeof product.images[0] === "string" && product.images[0].startsWith("data:")}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#F5F2EB] to-[#EAE4D7] p-6 text-center select-none">
                <div className="w-12 h-12 rounded-full bg-amber-900/10 border border-amber-800/20 flex items-center justify-center text-amber-800 mb-2">
                  <ShieldCheck className="w-6 h-6 text-amber-800" />
                </div>
                <span className="font-serif text-xs font-semibold text-stone-800 line-clamp-1 px-2">
                  {product.name}
                </span>
                <span className="text-[10px] tracking-widest uppercase text-amber-800/70 mt-1 font-mono">
                  VIA Scent • Dr. Scent
                </span>
              </div>
            )}
          </Link>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
            {originalPrice && originalPrice > price && (
              <Badge variant="sale">Special Offer</Badge>
            )}
            {product.isBestseller && <Badge variant="gold">Bestseller</Badge>}
            {product.isNew && <Badge variant="dark">New</Badge>}
          </div>

          {/* Franchise authenticity mark */}
          {product.drScentAuthorized && (
            <div className="absolute top-3 right-3 z-10 bg-white/90 backdrop-blur-xs p-1 rounded-full shadow-xs text-amber-800" title="Authorized Franchisee Product">
              <ShieldCheck className="w-4 h-4" />
            </div>
          )}

          {/* Quick Actions Hover Overlay */}
          <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-stone-950/70 via-stone-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setIsQuickViewOpen(true)}
              className="px-3 py-1.5 bg-white/95 text-stone-900 text-xs font-medium rounded hover:bg-white flex items-center gap-1.5 shadow-xs transition-colors"
              aria-label={`Quick view ${product.name}`}
            >
              <Eye className="w-3.5 h-3.5" />
              Quick View
            </button>

            <button
              type="button"
              onClick={handleQuickAdd}
              disabled={!product.inStock || isAdding}
              className="px-3 py-1.5 bg-stone-900 text-amber-100 text-xs font-medium rounded hover:bg-stone-800 flex items-center gap-1.5 shadow-xs transition-colors disabled:opacity-50"
              aria-label={`Add ${product.name} to cart`}
            >
              {isAdding ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  Added
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" />
                  Add to Cart
                </>
              )}
            </button>
          </div>
        </div>

        {/* Product Details */}
        <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
          <div>
            <div className="flex items-center justify-between text-[11px] text-stone-500 uppercase tracking-wider mb-1">
              <span>{product.categoryName}</span>
              {product.coverageArea && (
                <span className="text-stone-400">{product.coverageArea}</span>
              )}
            </div>

            <h3 className="font-serif text-base font-medium text-stone-900 group-hover:text-amber-900 transition-colors line-clamp-1">
              <Link href={`/products/${product.slug}`}>
                {product.name}
              </Link>
            </h3>

            <p className="text-xs text-stone-500 line-clamp-1 mt-0.5">
              {product.tagline}
            </p>
          </div>

          <div className="pt-2 border-t border-stone-100 flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <span className="font-semibold text-stone-900 text-sm">
                {formatLKR(price)}
              </span>
              {originalPrice && originalPrice > price && (
                <span className="text-xs text-stone-400 line-through">
                  {formatLKR(originalPrice)}
                </span>
              )}
            </div>

            <span
              className={`text-[10px] uppercase tracking-wider font-medium ${
                product.inStock ? "text-emerald-700" : "text-stone-400"
              }`}
            >
              {product.inStock ? "In Stock" : "Backorder"}
            </span>
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
