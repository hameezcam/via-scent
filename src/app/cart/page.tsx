"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Lock,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatLKR } from "@/config/brand.config";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, subtotalLKR, itemCount } = useCart();

  const breadcrumbs = [{ label: "Shopping Bag" }];

  if (items.length === 0) {
    return (
      <div className="py-20 sm:py-28 bg-[var(--porcelain)] min-h-[70vh] text-[var(--near-black)]">
        <div className="max-w-3xl mx-auto px-4 text-center space-y-6">
          <Breadcrumbs items={breadcrumbs} />
          <div className="w-16 h-16 rounded-full bg-[var(--ivory)] border border-[var(--warm-stone)]/60 text-[var(--champagne)] mx-auto flex items-center justify-center">
            <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
          </div>
          <div className="space-y-2">
            <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[var(--near-black)]">
              Your shopping bag is unoccupied
            </h1>
            <p className="text-xs sm:text-sm text-[var(--deep-espresso)]/70 max-w-md mx-auto leading-relaxed font-light">
              Begin your journey into architectural scenting with authorized Dr. Scent aroma diffusers, room nebulizers, and pure fragrance oils.
            </p>
          </div>
          <div className="pt-4">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-[var(--near-black)] text-[var(--porcelain)] hover:bg-[var(--champagne)] text-xs font-medium tracking-[0.2em] uppercase rounded-sm transition-all duration-300 shadow-sm"
            >
              <span>Explore The Catalogue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-10 sm:py-16 bg-[var(--porcelain)] text-[var(--near-black)] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Breadcrumbs items={breadcrumbs} />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[var(--warm-stone)]/40 mb-10">
          <div>
            <span className="text-[10px] font-medium tracking-[0.25em] uppercase text-[var(--champagne)] block mb-1">
              Curated Selections
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl text-[var(--near-black)] font-normal">
              Your Shopping Bag ({itemCount} {itemCount === 1 ? "instrument" : "instruments"})
            </h1>
          </div>

          <button
            type="button"
            onClick={clearCart}
            className="text-xs text-[var(--deep-espresso)]/60 hover:text-red-700 underline underline-offset-4 self-start sm:self-auto cursor-pointer font-light transition-colors"
          >
            Empty Entire Bag
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Cart Items Table */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white rounded-sm border border-[var(--warm-stone)]/40 divide-y divide-[var(--warm-stone)]/30 overflow-hidden shadow-xs">
              {items.map((item) => (
                <div key={item.id} className="p-5 sm:p-6 flex flex-col sm:flex-row gap-5 sm:gap-6">
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-sm bg-[var(--porcelain)] border border-[var(--warm-stone)]/40 overflow-hidden shrink-0">
                    <Image
                      src={item.image}
                      alt={item.productName}
                      fill
                      unoptimized={typeof item.image === "string" && item.image.startsWith("data:")}
                      className="object-cover"
                      sizes="112px"
                    />
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/products/${item.productSlug}`}
                          className="font-serif text-base sm:text-lg font-normal text-[var(--near-black)] hover:text-[var(--champagne)] transition-colors"
                        >
                          {item.productName}
                        </Link>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="text-[var(--warm-stone)] hover:text-red-600 transition-colors p-1 cursor-pointer"
                          aria-label={`Remove ${item.productName}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="text-xs text-[var(--deep-espresso)]/70 mt-1 flex flex-wrap gap-2 font-light">
                        <span className="font-medium text-[var(--near-black)]">{item.variantName}</span>
                        {item.sku && <span className="font-mono text-[11px]">• SKU: {item.sku}</span>}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-[var(--warm-stone)]/20">
                      {/* Quantity Selector */}
                      <div className="flex items-center border border-[var(--warm-stone)]/60 rounded-sm bg-white">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-2.5 py-1 text-[var(--deep-espresso)] hover:bg-[var(--ivory)] transition-colors cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-3 text-xs font-mono font-medium text-[var(--near-black)] min-w-8 text-center">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-2.5 py-1 text-[var(--deep-espresso)] hover:bg-[var(--ivory)] transition-colors cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-right">
                        <div className="text-[11px] text-[var(--deep-espresso)]/60 font-light">
                          {formatLKR(item.priceLKR, true)} each
                        </div>
                        <div className="text-base font-medium text-[var(--near-black)] font-mono">
                          {formatLKR(item.priceLKR * item.quantity, true)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2">
              <Link
                href="/shop"
                className="text-xs font-medium uppercase tracking-[0.15em] text-[var(--near-black)] hover:text-[var(--champagne)] flex items-center gap-1.5 transition-colors"
              >
                <span>← Continue Discovering Fragrances</span>
              </Link>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-sm border border-[var(--warm-stone)]/40 p-6 sm:p-7 shadow-xs space-y-5">
              <h2 className="font-serif text-lg font-normal text-[var(--near-black)] pb-3 border-b border-[var(--warm-stone)]/30">
                Summary of Investment
              </h2>

              <div className="space-y-2 text-xs font-light">
                <div className="flex justify-between text-[var(--deep-espresso)]/80">
                  <span>Bag Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})</span>
                  <span className="font-medium text-[var(--near-black)] font-mono">{formatLKR(subtotalLKR, true)}</span>
                </div>
                <div className="flex justify-between text-[var(--deep-espresso)]/80">
                  <span>Islandwide Doorstep Courier</span>
                  <span className="text-[var(--warm-stone)]">Calculated at checkout</span>
                </div>
                <div className="flex justify-between text-[var(--deep-espresso)]/80">
                  <span>Applicable Taxes</span>
                  <span className="text-[var(--warm-stone)]">Inclusive</span>
                </div>
              </div>

              <div className="pt-3 border-t border-[var(--warm-stone)]/30 flex justify-between items-baseline">
                <div>
                  <span className="text-xs uppercase tracking-[0.15em] font-medium text-[var(--near-black)] block">
                    Subtotal (LKR)
                  </span>
                  <span className="text-[10px] text-[var(--deep-espresso)]/60 font-light">Exclusive of delivery</span>
                </div>
                <span className="font-serif text-2xl font-normal text-[var(--near-black)]">
                  {formatLKR(subtotalLKR, true)}
                </span>
              </div>

              <Link
                href="/checkout"
                className="w-full py-4 bg-[var(--near-black)] text-[var(--porcelain)] hover:bg-[var(--champagne)] text-xs font-medium tracking-[0.2em] uppercase rounded-sm transition-all duration-300 flex items-center justify-center gap-2 shadow-sm"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Proceed to Secure Checkout</span>
              </Link>

              <div className="pt-2 border-t border-[var(--warm-stone)]/20 space-y-2.5 text-[11px] text-[var(--deep-espresso)]/80 font-light">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[var(--champagne)] shrink-0" />
                  <span>Authorized Dr. Scent Franchise Warranty</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[var(--champagne)] shrink-0" />
                  <span>Doorstep delivery across all 9 provinces</span>
                </div>
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-[var(--champagne)] shrink-0" />
                  <span>7-Day Return & Replacement Guarantee</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
