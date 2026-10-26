"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  CheckCircle2,
  Clock,
  Truck,
  ShieldCheck,
  RotateCcw,
  ArrowRight,
  Package,
  FileText,
  Phone,
} from "lucide-react";
import { formatLKR } from "@/config/brand.config";
import { Order } from "@/types/order";
import { useCart } from "@/context/CartContext";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("orderNumber");
  const token = searchParams.get("token") || "";

  const { clearCart } = useCart();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(() => Boolean(orderNumber));

  useEffect(() => {
    if (!orderNumber) {
      return;
    }

    let cancelled = false;
    let attempts = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;

    async function fetchOrder() {
      try {
        const res = await fetch(
          `/api/orders/confirmation?orderNumber=${encodeURIComponent(orderNumber!)}&token=${encodeURIComponent(token)}`
        );
        if (res.ok && !cancelled) {
          const data: Order = await res.json();
          setOrder(data);
          if (data.payment.method === "online_gateway" && data.payment.status === "paid") {
            // Card payment confirmed, so the cart can finally be emptied
            clearCart();
          } else if (data.payment.method === "online_gateway" && data.payment.status !== "failed" && attempts < 10) {
            // PayHere confirms in the background, usually within a few seconds
            attempts += 1;
            timer = setTimeout(fetchOrder, 3000);
          }
        }
      } catch (err) {
        console.error("Failed to load order", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchOrder();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [orderNumber, token, clearCart]);

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-10 h-10 border-2 border-stone-300 border-t-amber-800 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-stone-600 font-medium">Retrieving order confirmation snapshot...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-24 max-w-xl mx-auto px-4 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 text-amber-800 mx-auto flex items-center justify-center">
          <Package className="w-8 h-8" />
        </div>
        <h1 className="font-serif text-3xl font-medium text-stone-900">Order Not Found</h1>
        <p className="text-sm text-stone-600">
          We could not locate the specified order reference ({orderNumber || "none"}).
        </p>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-stone-900 text-amber-100 text-xs font-semibold uppercase tracking-wider rounded"
        >
          <span>Return to Store</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const isCOD = order.payment.method === "cod";
  const snapshot = order.pricingSnapshot;

  return (
    <div className="py-12 sm:py-16 bg-[#FAF8F5] min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Alert */}
        <div className="bg-white p-6 sm:p-8 rounded-lg border border-stone-200 shadow-xs text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs uppercase tracking-widest font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 inline-block mb-2">
              {isCOD
                ? "Order Placed • Cash on Delivery"
                : order.payment.status === "paid"
                  ? "Payment Confirmed • Order Processing"
                  : "Order Received • Awaiting Payment"}
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-medium text-stone-900">
              Thank You for Your Order
            </h1>
            <p className="text-sm text-stone-600 mt-2 max-w-lg mx-auto">
              Your VIA Scent order has been successfully recorded. A confirmation email and SMS dispatch updates will be sent to your contact details.
            </p>
          </div>

          <div className="p-4 bg-stone-50 rounded border border-stone-200 inline-block text-left text-xs text-stone-700 space-y-1">
            <p>
              <strong className="text-stone-900">Order Reference:</strong> {order.orderNumber}
            </p>
            <p>
              <strong className="text-stone-900">Payment Status:</strong>{" "}
              <span className={order.payment.status === "paid" ? "text-emerald-700 font-bold" : "text-amber-800 font-bold"}>
                {order.payment.status.toUpperCase()} {isCOD ? "(Collect upon Delivery)" : ""}
              </span>
            </p>
            <p>
              <strong className="text-stone-900">Date Placed:</strong>{" "}
              {new Date(order.createdAt).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* COD Specific Instructions or Online Confirmation */}
        {isCOD ? (
          <div className="bg-amber-50/80 border border-amber-200 p-6 rounded-lg text-amber-950 space-y-3">
            <div className="flex items-center gap-2 font-medium text-amber-900 text-base">
              <Clock className="w-5 h-5 text-amber-800" />
              <span>Cash on Delivery (COD) Instructions</span>
            </div>
            <p className="text-xs leading-relaxed text-amber-900/90">
              Please have the exact sum of <strong>{formatLKR(snapshot.totalLKR, true)}</strong> prepared in Sri Lankan Rupees for the courier agent upon doorstep delivery. The delivery agent will issue a signed proof-of-delivery receipt.
            </p>
            <div className="text-[11px] text-amber-800 flex items-center gap-1.5 pt-1">
              <Phone className="w-3.5 h-3.5" />
              <span>Courier riders call ahead on {order.customer.phone} prior to dispatch.</span>
            </div>
          </div>
        ) : order.payment.status !== "paid" ? (
          <div className="bg-amber-50/80 border border-amber-200 p-6 rounded-lg text-amber-950 space-y-2">
            <div className="flex items-center gap-2 font-medium text-amber-900 text-base">
              <Clock className="w-5 h-5 text-amber-800" />
              <span>{order.payment.status === "failed" ? "Payment not completed" : "Confirming your payment"}</span>
            </div>
            <p className="text-xs leading-relaxed text-amber-900/90">
              {order.payment.status === "failed"
                ? "We haven't received your card payment, so you haven't been charged for this order. You can place the order again, or message us on WhatsApp and we'll help."
                : "We're waiting for PayHere to confirm your card payment. This usually takes a few seconds. If it doesn't update, message us on WhatsApp and we'll check for you."}
            </p>
            <Link
              href={order.payment.status === "failed" ? "/checkout" : "/shop"}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-900 underline underline-offset-4"
            >
              {order.payment.status === "failed" ? "Back to checkout" : "Continue shopping"}
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="bg-emerald-50/80 border border-emerald-200 p-6 rounded-lg text-emerald-950 space-y-2">
            <div className="flex items-center gap-2 font-medium text-emerald-900 text-base">
              <CheckCircle2 className="w-5 h-5 text-emerald-700" />
              <span>Card payment received</span>
            </div>
            <p className="text-xs leading-relaxed text-emerald-900/90">
              Payment ID: <code>{order.payment.transactionId || "Confirmed"}</code>. Your card payment was received through PayHere.
            </p>
          </div>
        )}

        {/* Pricing Breakdown & Delivery Fee Snapshot */}
        <div className="bg-white p-6 sm:p-8 rounded-lg border border-stone-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-stone-100 pb-4">
            <h2 className="font-serif text-xl font-medium text-stone-900">
              Purchased Items & Immutable Pricing
            </h2>
            <span className="text-xs text-stone-500">Locked Pricing Snapshot</span>
          </div>

          <div className="divide-y divide-stone-100">
            {order.items.map((item, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded bg-stone-100 overflow-hidden shrink-0 border border-stone-200">
                    <Image
                      src={item.image}
                      alt={item.productName}
                      fill
                      unoptimized={typeof item.image === "string" && item.image.startsWith("data:")}
                      className="object-cover"
                      sizes="48px"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-stone-900">{item.productName}</p>
                    <p className="text-xs text-stone-500">
                      {item.variantName} (SKU: {item.sku}) × {item.quantity}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-stone-900">
                    {formatLKR(item.lineTotalLKR)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-stone-200 space-y-2 text-xs text-stone-600">
            <div className="flex justify-between">
              <span>Merchandise Subtotal</span>
              <span className="font-medium text-stone-900">
                {formatLKR(snapshot.merchandiseSubtotalLKR)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="flex items-center gap-1.5">
                <span>Locked Delivery Fee</span>
                <span className="text-[10px] bg-stone-100 text-stone-600 px-1.5 py-0.2 rounded">
                  {order.customer.district} District
                </span>
              </span>
              <span className="font-medium text-stone-900">
                {snapshot.deliveryFeeLKR === 0 ? "FREE" : formatLKR(snapshot.deliveryFeeLKR)}
              </span>
            </div>
            <div className="flex justify-between text-stone-500">
              <span>Taxes</span>
              <span>LKR 0.00 (Inclusive)</span>
            </div>
            <div className="pt-3 border-t border-stone-200 flex justify-between items-baseline">
              <span className="text-sm uppercase tracking-wider font-bold text-stone-900">
                Final Order Total
              </span>
              <span className="font-serif text-2xl font-bold text-stone-900">
                {formatLKR(snapshot.totalLKR, true)}
              </span>
            </div>
          </div>
        </div>

        {/* Customer & Delivery Snapshot */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg border border-stone-200 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-stone-900 font-medium text-sm border-b border-stone-100 pb-2">
              <Truck className="w-4 h-4 text-amber-800" />
              <span>Courier Delivery Destination</span>
            </div>
            <div className="text-xs text-stone-600 space-y-1">
              <p className="font-semibold text-stone-900">{order.customer.fullName}</p>
              <p>{order.customer.addressLine1}</p>
              {order.customer.addressLine2 && <p>{order.customer.addressLine2}</p>}
              <p>
                {order.customer.city}, {order.customer.district} {order.customer.postalCode}
              </p>
              <p>Sri Lanka</p>
              <p className="pt-1 text-stone-500">Phone: {order.customer.phone}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-stone-200 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-stone-900 font-medium text-sm border-b border-stone-100 pb-2">
              <ShieldCheck className="w-4 h-4 text-amber-800" />
              <span>Customer Protection Guarantees</span>
            </div>
            <div className="text-xs text-stone-600 space-y-2">
              <div className="flex items-start gap-2">
                <RotateCcw className="w-3.5 h-3.5 text-amber-800 shrink-0 mt-0.5" />
                <span>
                  <strong>7-Day Return Window:</strong> Eligible for return or exchange within 7 days of package delivery.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-800 shrink-0 mt-0.5" />
                <span>
                  <strong>6-Month Franchise Warranty:</strong> Diffusers and cold-air nebulizers carry official 6-month pump and circuit coverage.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
          <Link
            href="/returns"
            className="text-xs text-stone-600 hover:text-stone-900 underline flex items-center gap-1"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Need assistance? Review our 7-Day Return Policy</span>
          </Link>

          <Link
            href="/shop"
            className="px-6 py-3 bg-stone-900 text-amber-100 text-xs font-semibold uppercase tracking-wider rounded hover:bg-stone-800 transition-colors inline-flex items-center gap-2"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center">
          <div className="w-10 h-10 border-2 border-stone-300 border-t-amber-800 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-stone-600 font-medium">Loading order confirmation...</p>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
