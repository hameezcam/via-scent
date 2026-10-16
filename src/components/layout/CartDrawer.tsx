"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck, Info } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatLKR } from "@/config/brand.config";

export function CartDrawer() {
  const { items, removeItem, updateQuantity, isCartOpen, closeCart, subtotalLKR, itemCount } = useCart();
  const [showCheckoutNotice, setShowCheckoutNotice] = useState(false);

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

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity"
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Slide-over panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-heading"
        className="fixed inset-y-0 right-0 max-w-md w-full bg-[#FAF8F5] shadow-2xl flex flex-col z-50 border-l border-stone-200 animate-in slide-in-from-right duration-300"
      >
        {/* Header */}
        <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-100/50">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-800" />
            <h2 id="cart-heading" className="font-serif text-lg font-medium text-stone-900">
              Shopping Cart ({itemCount})
            </h2>
          </div>
          <button
            onClick={closeCart}
            aria-label="Close cart"
            className="p-2 text-stone-500 hover:text-stone-900 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-5 divide-y divide-stone-200/80">
          {items.length === 0 ? (
            <div className="py-16 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200/70 mx-auto flex items-center justify-center text-amber-700">
                <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
              </div>
              <h3 className="font-serif text-lg font-medium text-stone-900">
                Your cart is currently empty
              </h3>
              <p className="text-sm text-stone-600 max-w-xs mx-auto">
                Explore our collection of authorized Dr. Scent aroma diffusers and artisanal cold-air fragrance oils.
              </p>
              <div className="pt-2">
                <Link
                  href="/shop"
                  onClick={closeCart}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-stone-900 text-stone-100 rounded text-xs tracking-wider uppercase font-medium hover:bg-stone-800 transition-colors"
                >
                  Browse Fragrance Store
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="py-4 flex gap-4">
                <div className="relative w-20 h-20 rounded bg-stone-100 overflow-hidden flex-shrink-0 border border-stone-200">
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
                        className="font-medium text-stone-900 text-sm hover:text-amber-800 transition-colors line-clamp-1"
                      >
                        {item.productName}
                      </Link>
                      <button
                        onClick={() => removeItem(item.id)}
                        aria-label={`Remove ${item.productName} from cart`}
                        className="text-stone-400 hover:text-red-700 transition-colors p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-stone-500 mt-0.5">
                      {item.variantName} {item.sku ? `• SKU: ${item.sku}` : ""}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    {/* Quantity controls */}
                    <div className="flex items-center border border-stone-300 rounded bg-white">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-2 py-1 text-stone-600 hover:bg-stone-100 transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 text-xs font-semibold text-stone-800 min-w-6 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-2 py-1 text-stone-600 hover:bg-stone-100 transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="text-right">
                      <div className="text-xs text-stone-500">
                        {formatLKR(item.priceLKR)} each
                      </div>
                      <div className="text-sm font-semibold text-stone-900">
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
          <div className="p-5 border-t border-stone-200 bg-stone-100/70 space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-sm text-stone-600">
                <span>Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})</span>
                <span className="font-semibold text-stone-900 text-base">
                  {formatLKR(subtotalLKR)}
                </span>
              </div>
              <p className="text-[11px] text-stone-500 flex items-start gap-1">
                <Info className="w-3.5 h-3.5 text-stone-400 mt-0.5 flex-shrink-0" />
                <span>Shipping rates and islandwide delivery calculated at final checkout (Phase 2).</span>
              </p>
            </div>

            <div className="space-y-2">
              <Link
                href="/checkout"
                onClick={closeCart}
                className="w-full py-3 bg-stone-900 text-amber-100 hover:bg-stone-800 font-medium text-xs tracking-wider uppercase rounded transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                Proceed to Checkout
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/cart"
                onClick={closeCart}
                className="w-full py-2.5 bg-white border border-stone-300 text-stone-800 hover:bg-stone-50 font-medium text-xs tracking-wider uppercase rounded transition-colors text-center block"
              >
                View Full Cart
              </Link>
            </div>

            <div className="pt-1 flex items-center justify-center gap-1.5 text-[11px] text-stone-500">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
              <span>Authentic Dr. Scent Franchise Sourced • Islandwide Delivery (LKR 500)</span>
            </div>
          </div>
        )}

        {/* Phase 2 Checkout Notice Modal */}
        {showCheckoutNotice && (
          <div className="fixed inset-0 z-60 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-sm w-full p-6 shadow-2xl border border-stone-200 text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-800 mx-auto flex items-center justify-center border border-amber-200">
                <Info className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-lg font-semibold text-stone-900">
                Phase 1 Preview Mode
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Cart logic, live calculations, and variant selection are fully functional. Digital payment gateways (Commercial Bank / PayHere / IPG), stock reservation, and courier logistics will be connected in <strong>Phase 2</strong>.
              </p>
              <div className="pt-2 flex flex-col gap-2">
                <Link
                  href="/business-scenting/request-quote"
                  onClick={() => {
                    setShowCheckoutNotice(false);
                    closeCart();
                  }}
                  className="w-full py-2.5 bg-stone-900 text-amber-100 text-xs font-semibold uppercase tracking-wider rounded hover:bg-stone-800 transition-colors"
                >
                  Direct Order / B2B Scent Enquiry
                </Link>
                <button
                  type="button"
                  onClick={() => setShowCheckoutNotice(false)}
                  className="w-full py-2 border border-stone-300 text-stone-700 text-xs uppercase tracking-wider rounded hover:bg-stone-100 transition-colors"
                >
                  Continue Browsing
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
