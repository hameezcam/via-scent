"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Truck,
  CreditCard,
  Banknote,
  ArrowRight,
  ShoppingBag,
  Info,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatLKR } from "@/config/brand.config";
import { StoreSettings } from "@/types/settings";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";

const SRI_LANKA_DISTRICTS = [
  "Colombo",
  "Gampaha",
  "Kalutara",
  "Kandy",
  "Matale",
  "Nuwara Eliya",
  "Galle",
  "Matara",
  "Hambantota",
  "Jaffna",
  "Kilinochchi",
  "Mannar",
  "Vavuniya",
  "Mullaitivu",
  "Batticaloa",
  "Ampara",
  "Trincomalee",
  "Kurunegala",
  "Puttalam",
  "Anuradhapura",
  "Polonnaruwa",
  "Badulla",
  "Monaragala",
  "Ratnapura",
  "Kegalle",
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotalLKR, clearCart } = useCart();

  const [settings, setSettings] = useState<StoreSettings | null>(null);

  // Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("Colombo");
  const [district, setDistrict] = useState("Colombo");
  const [postalCode, setPostalCode] = useState("00300");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "online_gateway">("cod");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          setSettings(data);
          if (data.payments?.defaultMethod) {
            setPaymentMethod(data.payments.defaultMethod);
          }
        }
      } catch (e) {
        console.error("Failed to fetch settings", e);
      }
    }
    loadSettings();
  }, []);

  // Compute live delivery fee based on active settings and customer district
  let deliveryFeeLKR = 500; // Default LKR 500
  if (settings?.delivery) {
    if (settings.delivery.districtFees && settings.delivery.districtFees[district] !== undefined) {
      deliveryFeeLKR = settings.delivery.districtFees[district];
    } else {
      deliveryFeeLKR = settings.delivery.defaultCourierFeeLKR ?? 500;
    }

    if (
      settings.delivery.freeDeliveryThresholdLKR &&
      subtotalLKR >= settings.delivery.freeDeliveryThresholdLKR
    ) {
      deliveryFeeLKR = 0;
    }
  }

  const finalTotalLKR = subtotalLKR + deliveryFeeLKR;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (items.length === 0) {
      setErrorMessage("Your cart is empty. Please add items before checking out.");
      return;
    }

    if (!fullName.trim() || !email.trim() || !phone.trim() || !addressLine1.trim() || !city.trim()) {
      setErrorMessage("Please complete all required customer and delivery address fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        customer: {
          fullName,
          email,
          phone,
          addressLine1,
          addressLine2,
          city,
          district,
          postalCode,
        },
        items: items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          quantity: i.quantity,
        })),
        paymentMethod,
        notes,
      };

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Order creation failed. Please try again.");
      }

      // Clear the local cart
      clearCart();

      if (paymentMethod === "cod") {
        router.push(`/checkout/success?orderNumber=${encodeURIComponent(data.order.orderNumber)}`);
      } else {
        router.push(
          `/checkout/online-simulation?orderId=${encodeURIComponent(data.order.id)}&orderNumber=${encodeURIComponent(
            data.order.orderNumber
          )}`
        );
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to place order.";
      setErrorMessage(msg);
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="py-20 bg-[#FAF8F5] min-h-[70vh]">
        <div className="max-w-2xl mx-auto px-4 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 text-amber-800 mx-auto flex items-center justify-center">
            <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
          </div>
          <h1 className="font-serif text-3xl font-medium text-stone-900">Your Cart is Empty</h1>
          <p className="text-sm text-stone-600 max-w-md mx-auto">
            You must add Dr. Scent fragrances or diffusers to your cart before proceeding through checkout.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-8 py-3 bg-stone-900 text-amber-100 hover:bg-stone-800 text-xs font-semibold uppercase tracking-wider rounded transition-colors"
          >
            <span>Return to Boutique</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-10 sm:py-16 bg-[#FAF8F5] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: "Cart", href: "/cart" }, { label: "Secure Checkout" }]} />

        <div className="mt-4 mb-8">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-900 uppercase tracking-widest">
            <Lock className="w-3.5 h-3.5 text-amber-700" />
            <span>Authorized Dr. Scent Sri Lanka Storefront</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-medium text-stone-900 mt-1">
            VIA Scent Checkout
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            Complete your order with verified Sri Lankan doorstep courier delivery.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-800 rounded-md text-sm flex items-start gap-3">
            <Info className="w-5 h-5 shrink-0 text-red-600 mt-0.5" />
            <div>
              <p className="font-semibold">Checkout Error</p>
              <p className="text-xs text-red-700 mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Customer & Delivery Information */}
          <div className="lg:col-span-7 space-y-8">
            {/* Customer Details */}
            <div className="bg-white p-6 sm:p-8 rounded-lg border border-stone-200/80 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                <h2 className="font-serif text-xl font-medium text-stone-900 flex items-center gap-2">
                  <span>1. Contact Information</span>
                </h2>
                <span className="text-xs text-stone-400">Sri Lanka Courier Notification</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-stone-700 uppercase tracking-wider mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Kasun Perera"
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-300 rounded text-sm text-stone-900 focus:outline-hidden focus:ring-1 focus:ring-amber-800 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 uppercase tracking-wider mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="kasun@example.com"
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-300 rounded text-sm text-stone-900 focus:outline-hidden focus:ring-1 focus:ring-amber-800 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 uppercase tracking-wider mb-1.5">
                    Mobile Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+94 77 123 4567"
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-300 rounded text-sm text-stone-900 focus:outline-hidden focus:ring-1 focus:ring-amber-800 focus:bg-white"
                  />
                  <span className="text-[11px] text-stone-500 mt-1 block">Used by rider for delivery dispatch</span>
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-white p-6 sm:p-8 rounded-lg border border-stone-200/80 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                <h2 className="font-serif text-xl font-medium text-stone-900 flex items-center gap-2">
                  <span>2. Delivery Address</span>
                </h2>
                <div className="flex items-center gap-1.5 text-xs text-amber-900 bg-amber-50 px-2.5 py-1 rounded border border-amber-200">
                  <Truck className="w-3.5 h-3.5" />
                  <span>Islandwide Coverage</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-stone-700 uppercase tracking-wider mb-1.5">
                    Street Address / Building *
                  </label>
                  <input
                    type="text"
                    required
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                    placeholder="No. 42, Galle Road, Apt 4B"
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-300 rounded text-sm text-stone-900 focus:outline-hidden focus:ring-1 focus:ring-amber-800 focus:bg-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-stone-700 uppercase tracking-wider mb-1.5">
                    Address Line 2 (Optional)
                  </label>
                  <input
                    type="text"
                    value={addressLine2}
                    onChange={(e) => setAddressLine2(e.target.value)}
                    placeholder="Suite, landmark or floor"
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-300 rounded text-sm text-stone-900 focus:outline-hidden focus:ring-1 focus:ring-amber-800 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 uppercase tracking-wider mb-1.5">
                    City / Town *
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Colombo 03"
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-300 rounded text-sm text-stone-900 focus:outline-hidden focus:ring-1 focus:ring-amber-800 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 uppercase tracking-wider mb-1.5">
                    District (Sri Lanka) *
                  </label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-300 rounded text-sm text-stone-900 focus:outline-hidden focus:ring-1 focus:ring-amber-800 focus:bg-white"
                  >
                    {SRI_LANKA_DISTRICTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 uppercase tracking-wider mb-1.5">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="00300"
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-300 rounded text-sm text-stone-900 focus:outline-hidden focus:ring-1 focus:ring-amber-800 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 uppercase tracking-wider mb-1.5">
                    Country
                  </label>
                  <input
                    type="text"
                    disabled
                    value="Sri Lanka"
                    className="w-full px-4 py-2.5 bg-stone-100 border border-stone-200 rounded text-sm text-stone-500 cursor-not-allowed"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-stone-700 uppercase tracking-wider mb-1.5">
                    Special Delivery Instructions / Gate Code
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Call upon reaching security checkpoint"
                    className="w-full px-4 py-2 bg-stone-50 border border-stone-300 rounded text-sm text-stone-900 focus:outline-hidden focus:ring-1 focus:ring-amber-800 focus:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white p-6 sm:p-8 rounded-lg border border-stone-200/80 shadow-xs space-y-6">
              <div className="border-b border-stone-100 pb-4">
                <h2 className="font-serif text-xl font-medium text-stone-900 flex items-center gap-2">
                  <span>3. Payment Method</span>
                </h2>
                <p className="text-xs text-stone-500 mt-1">
                  Choose between Cash on Delivery across Sri Lanka or Secure Online Gateway payment.
                </p>
              </div>

              <div className="space-y-3">
                {/* Cash on Delivery (COD) */}
                <label
                  className={`flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition-all ${
                    paymentMethod === "cod"
                      ? "border-amber-800 bg-amber-50/40 shadow-xs"
                      : "border-stone-200 hover:border-stone-300 bg-stone-50/30"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={() => setPaymentMethod("cod")}
                    className="mt-1 text-amber-800 focus:ring-amber-800"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-medium text-stone-900 text-sm">
                        <Banknote className="w-4 h-4 text-emerald-700" />
                        <span>Cash on Delivery (COD)</span>
                      </div>
                      <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                        Available Islandwide
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                      Pay in cash directly to the courier agent when your package is delivered to your doorstep. Your order is registered in unpaid status and receipt confirmed upon collection.
                    </p>
                  </div>
                </label>

                {/* Online Payment Gateway */}
                <label
                  className={`flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition-all ${
                    paymentMethod === "online_gateway"
                      ? "border-amber-800 bg-amber-50/40 shadow-xs"
                      : "border-stone-200 hover:border-stone-300 bg-stone-50/30"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="online_gateway"
                    checked={paymentMethod === "online_gateway"}
                    onChange={() => setPaymentMethod("online_gateway")}
                    className="mt-1 text-amber-800 focus:ring-amber-800"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-medium text-stone-900 text-sm">
                        <CreditCard className="w-4 h-4 text-amber-800" />
                        <span>Online Digital Payment (Visa / Mastercard / PayHere)</span>
                      </div>
                      <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                        Instant Confirmation
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                      Pay securely using Sri Lankan or international credit/debit cards. Verified server-side with digital cryptographic signatures.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary & Immutable Snapshot Preview */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-lg border border-stone-200/80 shadow-xs space-y-6 sticky top-28">
              <h2 className="font-serif text-xl font-medium text-stone-900 border-b border-stone-100 pb-3">
                Order Summary
              </h2>

              {/* Items List */}
              <div className="divide-y divide-stone-100 max-h-72 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.id} className="py-3 flex items-center gap-3">
                    <div className="relative w-14 h-14 rounded bg-stone-100 overflow-hidden shrink-0 border border-stone-200">
                      <Image
                        src={item.image}
                        alt={item.productName}
                        fill
                        unoptimized={typeof item.image === "string" && item.image.startsWith("data:")}
                        className="object-cover"
                        sizes="56px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-stone-900 truncate">
                        {item.productName}
                      </p>
                      <p className="text-xs text-stone-500">
                        {item.variantName} × {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-stone-900">
                        {formatLKR(item.priceLKR * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Financial Calculations breakdown */}
              <div className="pt-4 border-t border-stone-200 space-y-2.5 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>Merchandise Subtotal</span>
                  <span className="font-medium text-stone-900">{formatLKR(subtotalLKR)}</span>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <span>Delivery Courier Fee</span>
                    <span className="text-[10px] bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded">
                      {district}
                    </span>
                  </div>
                  <span className="font-medium text-stone-900">
                    {deliveryFeeLKR === 0 ? "FREE" : formatLKR(deliveryFeeLKR)}
                  </span>
                </div>

                <div className="flex justify-between text-stone-500">
                  <span>Applicable Taxes</span>
                  <span>LKR 0.00 (Inclusive)</span>
                </div>

                <div className="pt-3 border-t border-stone-200 flex justify-between items-baseline">
                  <div>
                    <span className="text-xs uppercase tracking-wider font-bold text-stone-900 block">
                      Total Payable (LKR)
                    </span>
                    <span className="text-[11px] text-stone-500">
                      {paymentMethod === "cod" ? "Pay upon courier arrival" : "Charged at checkout"}
                    </span>
                  </div>
                  <span className="font-serif text-2xl font-bold text-stone-900">
                    {formatLKR(finalTotalLKR, true)}
                  </span>
                </div>
              </div>

              {/* Delivery policy notice */}
              <div className="bg-amber-50/60 p-3.5 rounded border border-amber-200/70 text-[11px] text-amber-950 space-y-1">
                <p className="font-semibold flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-amber-800" />
                  <span>Configured Islandwide Courier: LKR {deliveryFeeLKR}</span>
                </p>
                <p className="text-amber-900/80 leading-relaxed">
                  {settings?.delivery.policyText ||
                    "Standard islandwide delivery throughout Sri Lanka is charged at a flat rate of LKR 500 per order."}
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-stone-900 text-amber-100 hover:bg-stone-800 text-xs font-semibold tracking-wider uppercase rounded transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span>Processing Order...</span>
                ) : (
                  <>
                    <span>
                      {paymentMethod === "cod" ? "Confirm & Place COD Order" : "Proceed to Gateway Payment"}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="space-y-2 pt-2 text-[11px] text-stone-500 border-t border-stone-100">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>7-Day Return and Refund Policy guaranteed</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-800 shrink-0" />
                  <span>Official 6-Month Franchisee Warranty on diffusers</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
