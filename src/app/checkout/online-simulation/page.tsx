"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, CreditCard, Lock, AlertCircle } from "lucide-react";
import { formatLKR } from "@/config/brand.config";
import { Order } from "@/types/order";

function OnlineSimulationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("orderNumber");
  const token = searchParams.get("token") || "";

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(() => Boolean(orderNumber));
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock card inputs
  const [cardNumber, setCardNumber] = useState("4111 •••• •••• 1111");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardCVV, setCardCVV] = useState("•••");
  const [cardHolder, setCardHolder] = useState("Kasun Perera");

  useEffect(() => {
    if (!orderNumber) {
      return;
    }

    async function fetchOrder() {
      try {
        const res = await fetch(
          `/api/orders/confirmation?orderNumber=${encodeURIComponent(orderNumber!)}&token=${encodeURIComponent(token)}`
        );
        if (res.ok) {
          const data = await res.json();
          setOrder(data);
          if (data.customer?.fullName) {
            setCardHolder(data.customer.fullName);
          }
        }
      } catch (e) {
        console.error("Failed to load order", e);
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [orderNumber, token]);

  const handleAuthorizePayment = async () => {
    if (!order) return;
    setProcessing(true);
    setError(null);

    try {
      // Simulate gateway authorization token generation
      const mockTxnId = `TXN-LK-${Date.now()}`;
      const mockSignature = `SIG_${Date.now()}_VERIFIED_SHA256`;

      const res = await fetch("/api/checkout/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          transactionId: mockTxnId,
          signature: mockSignature,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Gateway signature verification failed.");
      }

      // Redirect to confirmed success page
      router.push(
        `/checkout/success?orderNumber=${encodeURIComponent(order.orderNumber)}&token=${encodeURIComponent(token)}`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Payment failed.";
      setError(msg);
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-10 h-10 border-2 border-stone-300 border-t-amber-800 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-stone-600">Connecting to Sri Lankan Payment Gateway...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-24 max-w-md mx-auto px-4 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-600 mx-auto" />
        <h2 className="font-serif text-2xl font-medium text-stone-900">Payment Session Invalid</h2>
        <p className="text-xs text-stone-600">No active pending order found for this payment request.</p>
        <Link
          href="/shop"
          className="inline-block px-6 py-2.5 bg-stone-900 text-amber-100 text-xs uppercase tracking-wider rounded"
        >
          Return to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="py-12 sm:py-16 bg-[#FAF8F5] min-h-screen">
      <div className="max-w-xl mx-auto px-4 sm:px-6">
        {/* Gateway Simulation Container */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-xl overflow-hidden">
          {/* Header banner */}
          <div className="bg-stone-900 text-white p-6 sm:p-7">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-amber-300 uppercase">
                  Secure Sandbox IPG
                </span>
                <h1 className="font-serif text-2xl font-medium mt-0.5">PayHere Sri Lanka Gateway</h1>
              </div>
              <Lock className="w-6 h-6 text-amber-400" />
            </div>

            <div className="mt-4 pt-4 border-t border-stone-800 flex justify-between items-baseline">
              <div>
                <p className="text-xs text-stone-400">Order: {order.orderNumber}</p>
                <p className="text-xs text-stone-400">Merchant: VIA Scent Colombo</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-stone-400 block">Total Amount</span>
                <span className="font-serif text-2xl font-bold text-amber-200">
                  {formatLKR(order.pricingSnapshot.totalLKR, true)}
                </span>
              </div>
            </div>
          </div>

          {/* Card Simulation Body */}
          <div className="p-6 sm:p-8 space-y-6">
            <div className="bg-amber-50/70 border border-amber-200 rounded p-3 text-xs text-amber-900 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
              <p>
                This simulated gateway demonstrates secure server-side callback verification, cryptographic HMAC signature validation, and idempotent order state transition.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-stone-700 uppercase tracking-wider mb-1">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded text-sm text-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 uppercase tracking-wider mb-1">
                  Card Number (Visa / Mastercard)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded text-sm text-stone-900 pr-10 font-mono"
                  />
                  <CreditCard className="w-5 h-5 text-stone-400 absolute right-3 top-2.5" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-stone-700 uppercase tracking-wider mb-1">
                    Expires (MM/YY)
                  </label>
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded text-sm text-stone-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-700 uppercase tracking-wider mb-1">
                    CVV / CVC
                  </label>
                  <input
                    type="text"
                    value={cardCVV}
                    onChange={(e) => setCardCVV(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded text-sm text-stone-900 font-mono"
                  />
                </div>
              </div>
            </div>

            <button
              type="button"
              disabled={processing}
              onClick={handleAuthorizePayment}
              className="w-full py-4 bg-emerald-800 hover:bg-emerald-700 text-white font-semibold text-xs tracking-wider uppercase rounded shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {processing ? (
                <span>Verifying Cryptographic Signature...</span>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Authorize & Complete Payment (LKR {order.pricingSnapshot.totalLKR.toLocaleString()})</span>
                </>
              )}
            </button>

            <p className="text-center text-[11px] text-stone-400">
              Never store full card numbers or CVVs in merchant databases. Certified 256-Bit TLS IPG.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OnlineSimulationPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center">
          <div className="w-10 h-10 border-2 border-stone-300 border-t-amber-800 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-stone-600">Loading gateway session...</p>
        </div>
      }
    >
      <OnlineSimulationContent />
    </Suspense>
  );
}
