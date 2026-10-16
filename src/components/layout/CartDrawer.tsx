"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck, Lock } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useCart } from "@/context/CartContext";
import { formatLKR } from "@/config/brand.config";
import { LUXURY_EASE } from "@/config/motion.config";

export function CartDrawer() {
  const { items, removeItem, updateQuantity, isCartOpen, closeCart, subtotalLKR, itemCount } = useCart();

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isCartOpen) {
        closeCart();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCartOpen, closeCart]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isCartOpen]);

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-[var(--near-black)]/60 backdrop-blur-sm"
            onClick={closeCart}
            aria-hidden="true"
          />

          {/* Slide-over panel */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-heading"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.45, ease: LUXURY_EASE }}
            className="fixed inset-y-0 right-0 max-w-md w-full bg-[var(--porcelain)] text-[var(--near-black)] shadow-2xl flex flex-col z-50 border-l border-[var(--warm-stone)]/40"
          >
            {/* Header */}
            <div className="p-6 border-b border-[var(--warm-stone)]/40 flex items-center justify-between bg-[var(--ivory)]/70">
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-4 h-4 text-[var(--champagne)]" />
                <h2 id="cart-heading" className="font-serif text-lg font-normal tracking-tight text-[var(--near-black)]">
                  Shopping Bag ({itemCount})
                </h2>
              </div>
              <button
                onClick={closeCart}
                aria-label="Close cart"
                className="p-1.5 text-[var(--deep-espresso)]/70 hover:text-[var(--near-black)] rounded-sm transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-6 divide-y divide-[var(--warm-stone)]/30">
              {items.length === 0 ? (
                <div className="py-20 text-center space-y-5">
                  <div className="w-14 h-14 rounded-full bg-[var(--ivory)] border border-[var(--warm-stone)]/60 mx-auto flex items-center justify-center text-[var(--champagne)]">
                    <ShoppingBag className="w-6 h-6 stroke-[1.5]" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="font-serif text-lg font-normal text-[var(--near-black)]">
                      Your bag is unoccupied
                    </h3>
                    <p className="text-xs text-[var(--deep-espresso)]/70 max-w-xs mx-auto font-light leading-relaxed">
                      Discover our collection of authorized Dr. Scent cold-air diffusion instruments and pure fragrance oils.
                    </p>
                  </div>
                  <div className="pt-2">
                    <Link
                      href="/shop"
                      onClick={closeCart}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--near-black)] text-[var(--porcelain)] rounded-sm text-xs tracking-[0.2em] uppercase font-medium hover:bg-[var(--champagne)] transition-colors"
                    >
                      <span>Discover Collection</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="py-4.5 flex gap-4 first:pt-0 last:pb-0">
                    <div className="relative w-20 h-20 rounded-sm bg-white overflow-hidden shrink-0 border border-[var(--warm-stone)]/40">
                      <Image
                        src={item.image}
                        alt={item.productName}
                        fill
                        unoptimized={typeof item.image === "string" && item.image.startsWith("data:")}
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            href={`/products/${item.productSlug}`}
                            onClick={closeCart}
                            className="font-medium text-[var(--near-black)] text-xs hover:text-[var(--champagne)] transition-colors line-clamp-1"
                          >
                            {item.productName}
                          </Link>
                          <button
                            onClick={() => removeItem(item.id)}
                            aria-label={`Remove ${item.productName} from cart`}
                            className="text-[var(--warm-stone)] hover:text-red-600 transition-colors p-0.5 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-[11px] text-[var(--deep-espresso)]/60 font-light mt-0.5">
                          {item.variantName} {item.sku ? `• SKU: ${item.sku}` : ""}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        {/* Quantity controls */}
                        <div className="flex items-center border border-[var(--warm-stone)]/60 rounded-sm bg-white">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="px-2.5 py-1 text-[var(--deep-espresso)] hover:bg-[var(--ivory)] transition-colors cursor-pointer"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-xs font-mono font-medium text-[var(--near-black)] min-w-6 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="px-2.5 py-1 text-[var(--deep-espresso)] hover:bg-[var(--ivory)] transition-colors cursor-pointer"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="text-right">
                          <div className="text-[10px] text-[var(--deep-espresso)]/60 font-light">
                            {formatLKR(item.priceLKR)}
                          </div>
                          <div className="text-xs font-medium text-[var(--near-black)] font-mono">
                            {formatLKR(item.priceLKR * item.quantity)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer / Summary */}
            {items.length > 0 && (
              <div className="p-6 border-t border-[var(--warm-stone)]/40 bg-[var(--ivory)]/70 space-y-4">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-[var(--deep-espresso)]/80">
                    <span className="font-light">Subtotal ({itemCount} {itemCount === 1 ? "instrument" : "instruments"})</span>
                    <span className="font-medium text-[var(--near-black)] text-sm font-mono">
                      {formatLKR(subtotalLKR)}
                    </span>
                  </div>
                  <p className="text-[10px] text-[var(--deep-espresso)]/60 font-light">
                    Doorstep courier delivery rates and payment choices finalized at checkout.
                  </p>
                </div>

                <div className="space-y-2.5 pt-1">
                  <Link
                    href="/checkout"
                    onClick={closeCart}
                    className="w-full py-3.5 bg-[var(--near-black)] text-[var(--porcelain)] hover:bg-[var(--champagne)] hover:text-white font-medium text-xs tracking-[0.2em] uppercase rounded-sm transition-all duration-300 flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Proceed to Checkout</span>
                  </Link>

                  <Link
                    href="/cart"
                    onClick={closeCart}
                    className="w-full py-2.5 bg-white border border-[var(--warm-stone)]/60 text-[var(--deep-espresso)] hover:border-[var(--champagne)] font-medium text-[11px] tracking-[0.15em] uppercase rounded-sm transition-colors text-center block"
                  >
                    Review Detailed Bag
                  </Link>
                </div>

                <div className="pt-2 flex items-center justify-center gap-1.5 text-[10px] text-[var(--deep-espresso)]/70 font-light">
                  <ShieldCheck className="w-3.5 h-3.5 text-[var(--champagne)]" />
                  <span>Authorized Dr. Scent Franchise Supply • Islandwide Sri Lanka</span>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
