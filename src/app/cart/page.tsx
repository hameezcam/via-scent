"use client";

import React, { useState } from "react";
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
  Info,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatLKR } from "@/config/brand.config";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, subtotalLKR, itemCount } = useCart();
  const [showCheckoutNotice, setShowCheckoutNotice] = useState(false);

  const breadcrumbs = [{ label: "Shopping Cart" }];

  if (items.length === 0) {
    return (
      <div className="py-16 sm:py-24 bg-[#FAF8F5] min-h-[70vh]">
        <div className="max-w-3xl mx-auto px-4 text-center space-y-6">
          <Breadcrumbs items={breadcrumbs} />
          <div className="w-20 h-20 rounded-full bg-amber-50 border border-amber-200 text-amber-800 mx-auto flex items-center justify-center">
            <ShoppingBag className="w-10 h-10 stroke-[1.5]" />
          </div>
          <h1 className="font-serif text-3xl font-medium text-stone-900">
            Your fragrance cart is empty
          </h1>
          <p className="text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
            Begin your journey into architectural scenting with authorized Dr. Scent aroma diffusers, room nebulizers, and pure perfume oils.
          </p>
          <div className="pt-4">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-stone-900 text-amber-100 hover:bg-stone-800 text-xs font-semibold uppercase tracking-wider rounded transition-colors shadow-sm"
            >
              <span>Explore The Catalogue</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-10 sm:py-16 bg-[#FAF8F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumbs items={breadcrumbs} />

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-stone-200 mb-8">
          <div>
            <span className="text-xs font-semibold tracking-widest uppercase text-amber-800">
              Order Review
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl text-stone-900 font-normal">
              Your Shopping Cart ({itemCount} {itemCount === 1 ? "item" : "items"})
            </h1>
          </div>

          <button
            type="button"
            onClick={clearCart}
            className="text-xs text-stone-500 hover:text-red-700 underline underline-offset-4 self-start sm:self-auto"
          >
            Clear All Items
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Cart Items Table */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white rounded-lg border border-stone-200 divide-y divide-stone-200 overflow-hidden shadow-xs">
              {items.map((item) => (
                <div key={item.id} className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6">
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded bg-stone-100 border border-stone-200 overflow-hidden shrink-0">
                    <Image
                      src={item.image}
                      alt={item.productName}
                      fill
                      className="object-cover"
                      sizes="112px"
                    />
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/products/${item.productSlug}`}
                          className="font-serif text-base sm:text-lg font-medium text-stone-900 hover:text-amber-900 transition-colors"
                        >
                          {item.productName}
                        </Link>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="text-stone-400 hover:text-red-600 transition-colors p-1"
                          aria-label={`Remove ${item.productName}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="text-xs text-stone-500 mt-1 flex flex-wrap gap-2">
                        <span className="font-medium text-stone-700">{item.variantName}</span>
                        {item.sku && <span>• SKU: {item.sku}</span>}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-stone-100">
                      {/* Quantity Selector */}
                      <div className="flex items-center border border-stone-300 rounded bg-stone-50">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-2.5 py-1 text-stone-600 hover:bg-stone-200 transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-3 text-xs font-semibold text-stone-900 min-w-8 text-center">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-2.5 py-1 text-stone-600 hover:bg-stone-200 transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-right">
                        <div className="text-xs text-stone-500">
                          {formatLKR(item.priceLKR, true)} each
                        </div>
                        <div className="text-base font-semibold text-stone-900">
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
                className="text-xs font-semibold uppercase tracking-wider text-stone-800 hover:text-amber-900 flex items-center gap-1.5"
              >
                ← Continue Shopping Fragrances
              </Link>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-lg border border-stone-200 p-6 shadow-xs space-y-4">
              <h2 className="font-serif text-lg font-medium text-stone-900 pb-3 border-b border-stone-200">
                Order Summary
              </h2>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>Cart Subtotal ({itemCount} items)</span>
                  <span className="font-medium text-stone-900">{formatLKR(subtotalLKR, true)}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Estimated Courier Delivery</span>
                  <span className="text-stone-500">Calculated at checkout</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Taxes & Duties</span>
                  <span className="text-stone-500">Included (LKR)</span>
                </div>
              </div>

              <div className="pt-3 border-t border-stone-200 flex justify-between items-baseline">
                <div>
                  <span className="text-xs uppercase tracking-wider font-semibold text-stone-800 block">
                    Total (LKR)
                  </span>
                  <span className="text-[11px] text-stone-500">Pre-shipping subtotal</span>
                </div>
                <span className="font-serif text-2xl font-bold text-stone-900">
                  {formatLKR(subtotalLKR, true)}
                </span>
              </div>

              <Link
                href="/checkout"
                className="w-full py-3.5 bg-stone-900 text-amber-100 hover:bg-stone-800 text-xs font-semibold tracking-wider uppercase rounded transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <div className="pt-2 border-t border-stone-100 space-y-2 text-[11px] text-stone-500">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-800 shrink-0" />
                  <span>Authorized Dr. Scent Franchise Warranty</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-amber-800 shrink-0" />
                  <span>Doorstep delivery across all 9 provinces</span>
                </div>
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-amber-800 shrink-0" />
                  <span>7-Day Return & Replacement Guarantee</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Phase 2 Checkout Notice Modal */}
      {showCheckoutNotice && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-2xl border border-stone-200 text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-800 mx-auto flex items-center justify-center border border-amber-200">
              <Info className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-semibold text-stone-900">
              Phase 1 Preview Mode
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Your cart subtotal of <strong>{formatLKR(subtotalLKR, true)}</strong> has been calculated. In <strong>Phase 2</strong>, production database storage (PostgreSQL/Prisma), local digital payment gateways (Commercial Bank / PayHere / Visa / Mastercard), and automated order processing will be integrated.
            </p>
            <div className="pt-3 flex flex-col gap-2">
              <Link
                href="/business-scenting/request-quote"
                onClick={() => setShowCheckoutNotice(false)}
                className="w-full py-2.5 bg-stone-900 text-amber-100 text-xs font-semibold uppercase tracking-wider rounded hover:bg-stone-800 transition-colors"
              >
                Inquire Directly or Request Commercial Quote
              </Link>
              <button
                type="button"
                onClick={() => setShowCheckoutNotice(false)}
                className="w-full py-2 border border-stone-300 text-stone-700 text-xs uppercase tracking-wider rounded hover:bg-stone-100 transition-colors"
              >
                Return to Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
