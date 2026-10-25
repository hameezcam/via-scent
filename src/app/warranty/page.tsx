"use client";

import React, { useState } from "react";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { ShieldCheck, CheckCircle2, AlertCircle, Send, Wrench } from "lucide-react";

const inputClass =
  "w-full rounded border border-stone-300 bg-white px-3 py-2.5 text-sm focus:border-amber-700 focus:outline-none focus:ring-1 focus:ring-amber-700";
const labelClass = "block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5";

export default function WarrantyPage() {
  const breadcrumbs = [{ label: "Warranty Claims" }];

  const [form, setForm] = useState({
    orderNumber: "",
    productName: "",
    productSku: "",
    purchaseDate: "",
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    reportedIssue: "",
    evidenceNotes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [claimNumber, setClaimNumber] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const update = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/warranty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, productSku: form.productSku || "N/A" }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to submit warranty claim.");
      }
      setClaimNumber(data.claim.claimNumber);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Submission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="py-10 sm:py-16 bg-[#FAF8F5]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <Breadcrumbs items={breadcrumbs} />

        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Official Franchise Warranty</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-stone-900 font-normal">Warranty Claims</h1>
          <p className="text-sm text-stone-600 max-w-2xl leading-relaxed">
            Every Dr. Scent diffuser bought from VIA Scent is covered by our franchise warranty against pump, electrical
            and controller defects. Tell us what&apos;s wrong and a Colombo technician will be in touch within one
            business day.
          </p>
        </div>

        {claimNumber ? (
          <div className="bg-white rounded-xl border border-emerald-200 p-8 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h2 className="font-serif text-2xl text-stone-900">Claim received</h2>
            <p className="text-sm text-stone-600">
              Your reference is <strong className="font-mono text-stone-900">{claimNumber}</strong>. Keep it handy when
              our technician contacts you.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-stone-200 p-6 sm:p-10 space-y-6">
            <div className="flex items-center gap-2 text-stone-900">
              <Wrench className="w-5 h-5 text-amber-800" />
              <h2 className="font-serif text-xl">Submit a claim</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="w-order" className={labelClass}>Order number</label>
                <input id="w-order" required placeholder="VIA-20261014-1001" value={form.orderNumber} onChange={update("orderNumber")} className={inputClass} />
              </div>
              <div>
                <label htmlFor="w-date" className={labelClass}>Purchase date</label>
                <input id="w-date" type="date" required value={form.purchaseDate} onChange={update("purchaseDate")} className={inputClass} />
              </div>
              <div>
                <label htmlFor="w-product" className={labelClass}>Product</label>
                <input id="w-product" required placeholder="e.g. Smart Aroma Tower Pro" value={form.productName} onChange={update("productName")} className={inputClass} />
              </div>
              <div>
                <label htmlFor="w-sku" className={labelClass}>Serial number or SKU (optional)</label>
                <input id="w-sku" value={form.productSku} onChange={update("productSku")} className={inputClass} />
              </div>
              <div>
                <label htmlFor="w-name" className={labelClass}>Full name</label>
                <input id="w-name" required autoComplete="name" value={form.customerName} onChange={update("customerName")} className={inputClass} />
              </div>
              <div>
                <label htmlFor="w-phone" className={labelClass}>Phone</label>
                <input id="w-phone" type="tel" required autoComplete="tel" value={form.customerPhone} onChange={update("customerPhone")} className={inputClass} />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="w-email" className={labelClass}>Email</label>
                <input id="w-email" type="email" required autoComplete="email" value={form.customerEmail} onChange={update("customerEmail")} className={inputClass} />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="w-issue" className={labelClass}>What&apos;s wrong?</label>
                <textarea id="w-issue" required rows={4} value={form.reportedIssue} onChange={update("reportedIssue")} className={inputClass} />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="w-notes" className={labelClass}>Anything else we should know? (optional)</label>
                <textarea id="w-notes" rows={3} value={form.evidenceNotes} onChange={update("evidenceNotes")} className={inputClass} />
              </div>
            </div>

            {errorMessage && (
              <p role="alert" className="flex items-start gap-2 text-sm text-red-700">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{errorMessage}</span>
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded bg-stone-900 px-6 py-3 text-xs font-semibold uppercase tracking-widest text-amber-100 hover:bg-stone-800 disabled:opacity-60"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? "Submitting…" : "Submit claim"}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
