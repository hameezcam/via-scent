"use client";

import React, { useState } from "react";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import {
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Truck,
  Send,
  Clock,
} from "lucide-react";

export default function ReturnsPage() {
  const breadcrumbs = [{ label: "Returns & Refund Policy" }];

  // Return request form state
  const [orderNumber, setOrderNumber] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [itemName, setItemName] = useState("");
  const [reason, setReason] = useState("Damaged in transit");
  const [details, setDetails] = useState("");
  const [refundMethod, setRefundMethod] = useState<"original_gateway" | "bank_transfer_cod">("bank_transfer_cod");

  const [submitting, setSubmitting] = useState(false);
  const [submittedReturn, setSubmittedReturn] = useState<{
    returnNumber: string;
    isWithin7Days: boolean;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmitReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/returns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNumber,
          customerName,
          customerEmail,
          customerPhone,
          itemSku: "N/A",
          itemName: itemName || "Fragrance / Diffuser",
          reason,
          details,
          refundMethod,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to submit return request.");
      }

      setSubmittedReturn({
        returnNumber: data.returnRequest.returnNumber,
        isWithin7Days: data.returnRequest.isWithin7Days,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Submission failed.";
      setErrorMessage(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="py-10 sm:py-16 bg-[#FAF8F5]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <Breadcrumbs items={breadcrumbs} />

        {/* Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            <RotateCcw className="w-3.5 h-3.5" />
            <span>VIA Scent Policy & Support</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-stone-900 font-normal">
            Returns, Exchanges & Refund Policy
          </h1>
          <p className="text-sm text-stone-600 max-w-2xl leading-relaxed">
            Standard 7-Day Return Window & 7-Day Refund Policy under our authorized Dr. Scent Sri Lanka franchise terms.
          </p>
        </div>

        {/* Policy Highlights Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-lg border border-stone-200 shadow-xs space-y-2">
            <Clock className="w-6 h-6 text-amber-800" />
            <h3 className="font-serif font-semibold text-stone-900 text-sm">7-Day Eligibility Period</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Calculated starting exactly from the date and timestamp the delivery courier hands over the package to you.
            </p>
          </div>
          <div className="bg-white p-5 rounded-lg border border-stone-200 shadow-xs space-y-2">
            <Truck className="w-6 h-6 text-amber-800" />
            <h3 className="font-serif font-semibold text-stone-900 text-sm">Damaged or Defective Items</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              If an item is damaged in transit or atomizes defectively upon arrival, return shipping is 100% covered by VIA Scent with free replacement.
            </p>
          </div>
          <div className="bg-white p-5 rounded-lg border border-stone-200 shadow-xs space-y-2">
            <ShieldCheck className="w-6 h-6 text-amber-800" />
            <h3 className="font-serif font-semibold text-stone-900 text-sm">Fair Refund Procedures</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Online card refunds revert to the original payment source. Cash on Delivery orders are refunded via direct Sri Lankan bank transfer upon inspection.
            </p>
          </div>
        </div>

        {/* Detailed Comprehensive Policy Text */}
        <div className="bg-white rounded-xl border border-stone-200 p-6 sm:p-10 shadow-xs space-y-8 text-xs sm:text-sm text-stone-700 leading-relaxed">
          <section className="space-y-3">
            <h2 className="font-serif text-lg font-semibold text-stone-900">
              1. How Customers Request a Return
            </h2>
            <p>
              To initiate a return or exchange, complete the interactive Return Request Form below or contact our Colombo concierge at <code>concierge@viascent.lk</code>. You will need to provide your VIA Scent order number, contact phone, the specific item name or SKU, and the reason for the return.
            </p>
          </section>

          <section className="space-y-3 pt-4 border-t border-stone-100">
            <h2 className="font-serif text-lg font-semibold text-stone-900">
              2. Calculation of the 7-Day Eligibility Period
            </h2>
            <p>
              The 7-day eligibility window begins on the calendar day the courier records successful delivery at your address. Requests submitted within this 7-day window are evaluated according to our franchise standard return procedures.
            </p>
          </section>

          <section className="space-y-3 pt-4 border-t border-stone-100">
            <h2 className="font-serif text-lg font-semibold text-stone-900">
              3. Returned Product Assessment & Inspection
            </h2>
            <p>
              Once your return request is approved in principle (status <code>APPROVED</code>), the parcel is collected or shipped to our Colombo inspection workshop. Products must be returned in their original packaging, complete with user manuals, power adapters, and bottle seals intact. Items returned broken due to user negligence or diluted with water are not eligible for refunds.
            </p>
          </section>

          <section className="space-y-3 pt-4 border-t border-stone-100">
            <h2 className="font-serif text-lg font-semibold text-stone-900">
              4. Refund Approval & Settlement Process
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-xs">
              <li>
                <strong>Digital Online Payments:</strong> Once received and verified, refunds are remitted back to the originating credit/debit card via the payment gateway within 5-7 banking business days.
              </li>
              <li>
                <strong>Cash on Delivery (COD):</strong> For orders originally paid in cash upon delivery, refunds are settled via secure local electronic bank transfer (SLIPS/CEFT) to an account provided by the customer.
              </li>
            </ul>
          </section>

          <section className="space-y-3 pt-4 border-t border-stone-100">
            <h2 className="font-serif text-lg font-semibold text-stone-900">
              5. Return Courier Shipping Fees
            </h2>
            <p>
              If the return is due to an error on our part (incorrect item, transit damage, or factory defect), VIA Scent arranges courier pickup at no cost to you. For discretionary change-of-mind returns on unopened units, the customer is responsible for the standard LKR 500 return courier fee.
            </p>
          </section>
        </div>

        {/* Interactive Customer Return Submission Form */}
        <div className="bg-white rounded-xl border border-stone-200 p-6 sm:p-10 shadow-xs space-y-6">
          <div className="border-b border-stone-100 pb-4">
            <span className="text-[11px] font-mono tracking-widest text-amber-800 uppercase">
              Self-Service Portal
            </span>
            <h2 className="font-serif text-2xl font-medium text-stone-900 mt-1">
              Submit a Return or Refund Request
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              Enter your order details below to register your return into our administrative workflow.
            </p>
          </div>

          {submittedReturn ? (
            <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-950 space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-emerald-700" />
                <h3 className="font-semibold text-sm">Return Request Registered Successfully</h3>
              </div>
              <p className="text-xs leading-relaxed">
                Your return tracking reference is <strong>{submittedReturn.returnNumber}</strong>. Status:{" "}
                <code className="bg-emerald-100 px-1.5 py-0.5 rounded">REQUESTED</code>.
              </p>
              <p className="text-xs">
                {submittedReturn.isWithin7Days
                  ? "✓ Verified within the standard 7-day policy window. Our concierge will review and contact you within 24 hours."
                  : "Note: Submitted after the standard 7-day window. Our team will review this under our discretionary support guidelines."}
              </p>
              <button
                type="button"
                onClick={() => setSubmittedReturn(null)}
                className="mt-2 text-xs font-semibold text-emerald-800 underline block"
              >
                Submit another inquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitReturn} className="space-y-4">
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-stone-700 uppercase tracking-wider mb-1">
                    Order Reference Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    placeholder="e.g. VIA-20261014-1234"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded text-sm text-stone-900 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 uppercase tracking-wider mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Kasun Perera"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded text-sm text-stone-900 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 uppercase tracking-wider mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="kasun@example.com"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded text-sm text-stone-900 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 uppercase tracking-wider mb-1">
                    Contact Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+94 77 123 4567"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded text-sm text-stone-900 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 uppercase tracking-wider mb-1">
                    Item SKU / Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    placeholder="e.g. Dr. Scent Smart Diffuser or Oil"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded text-sm text-stone-900 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 uppercase tracking-wider mb-1">
                    Primary Reason *
                  </label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded text-sm text-stone-900 focus:bg-white"
                  >
                    <option value="Damaged in transit">Damaged in transit by courier</option>
                    <option value="Defective unit / atomization failure">Defective unit / atomization failure</option>
                    <option value="Incorrect product or size delivered">Incorrect product or size delivered</option>
                    <option value="Incomplete package / missing accessory">Incomplete package / missing accessory</option>
                    <option value="Unopened change of mind (Within 7 days)">Unopened change of mind (Within 7 days)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-stone-700 uppercase tracking-wider mb-1">
                    Preferred Refund / Exchange Method *
                  </label>
                  <select
                    value={refundMethod}
                    onChange={(e) =>
                      setRefundMethod(e.target.value as "original_gateway" | "bank_transfer_cod")
                    }
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded text-sm text-stone-900 focus:bg-white"
                  >
                    <option value="bank_transfer_cod">Local Bank Transfer (For COD or direct refunds)</option>
                    <option value="original_gateway">Original Payment Gateway (Card refund)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-stone-700 uppercase tracking-wider mb-1">
                    Additional Details / Description *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="Please describe the condition of the packaging, defect symptoms, or delivery details..."
                    className="w-full px-3.5 py-2 bg-stone-50 border border-stone-300 rounded text-sm text-stone-900 focus:bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 bg-stone-900 hover:bg-stone-800 text-amber-100 font-semibold text-xs uppercase tracking-wider rounded shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {submitting ? (
                  <span>Registering Request...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Return Request</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
