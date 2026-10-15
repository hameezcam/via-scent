"use client";

import React, { useState, useEffect } from "react";
import {
  CreditCard,
  RotateCcw,
  ShieldCheck,
  Save,
  CheckCircle2,
  AlertCircle,
  Banknote,
} from "lucide-react";
import { StoreSettings } from "@/types/settings";

export default function AdminGeneralSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [savingSection, setSavingSection] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );

  // Payments form
  const [codEnabled, setCodEnabled] = useState(true);
  const [onlineGatewayEnabled, setOnlineGatewayEnabled] = useState(true);
  const [defaultMethod, setDefaultMethod] = useState<"cod" | "online_gateway">("cod");

  // Returns form
  const [returnWindowDays, setReturnWindowDays] = useState(7);
  const [refundWindowDays, setRefundWindowDays] = useState(7);
  const [returnPolicyText, setReturnPolicyText] = useState("");

  // Warranty form
  const [warrantyMonths, setWarrantyMonths] = useState(6);
  const [warrantyTermsText, setWarrantyTermsText] = useState("");

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data: StoreSettings = await res.json();
          setCodEnabled(data.payments.codEnabled);
          setOnlineGatewayEnabled(data.payments.onlineGatewayEnabled);
          setDefaultMethod(data.payments.defaultMethod);
          setReturnWindowDays(data.returns.returnWindowDays);
          setRefundWindowDays(data.returns.refundWindowDays);
          setReturnPolicyText(data.returns.policyText);
          setWarrantyMonths(data.warranty.defaultDurationMonths);
          setWarrantyTermsText(data.warranty.termsText);
        }
      } catch (err) {
        console.error("Failed to fetch settings", err);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const saveSection = async (section: string, payload: unknown) => {
    setSavingSection(section);
    setFeedback(null);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-user": "admin@viascent.lk",
        },
        body: JSON.stringify({ section, data: payload }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Update failed.");
      }

      setFeedback({
        type: "success",
        message: `${section.toUpperCase()} settings saved and logged to audit trail.`,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error saving section.";
      setFeedback({ type: "error", message: msg });
    } finally {
      setSavingSection(null);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-10 h-10 border-2 border-stone-300 border-t-amber-800 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-stone-600 font-medium">Loading store policies...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="font-serif text-3xl font-medium text-stone-900">
          Store Policies, Payments & Warranty Settings
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Configure payment options, 7-day return eligibility, and 6-month diffuser warranty parameters.
        </p>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-lg text-xs flex items-start gap-3 border ${
            feedback.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          )}
          <div>
            <p className="font-semibold">{feedback.type === "success" ? "Updated" : "Error"}</p>
            <p className="mt-0.5">{feedback.message}</p>
          </div>
        </div>
      )}

      {/* 1. Payment Methods */}
      <div className="bg-white p-6 sm:p-8 rounded-xl border border-stone-200 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-amber-800" />
            <h2 className="font-serif text-lg font-medium text-stone-900">1. Payment Gateways & COD</h2>
          </div>
          <button
            type="button"
            disabled={savingSection === "payments"}
            onClick={() =>
              saveSection("payments", {
                codEnabled,
                onlineGatewayEnabled,
                defaultMethod,
              })
            }
            className="px-4 py-1.5 bg-stone-900 hover:bg-stone-800 text-amber-100 text-xs font-semibold uppercase tracking-wider rounded flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{savingSection === "payments" ? "Saving..." : "Save Payments"}</span>
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-stone-50 rounded-lg border border-stone-200">
            <div>
              <div className="flex items-center gap-2 font-semibold text-stone-900 text-sm">
                <Banknote className="w-4 h-4 text-emerald-700" />
                <span>Cash on Delivery (COD)</span>
              </div>
              <span className="text-xs text-stone-500">
                Allow customers to pay in cash upon doorstep delivery. Enabled by default.
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={codEnabled}
                onChange={(e) => setCodEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-stone-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-800"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-stone-50 rounded-lg border border-stone-200">
            <div>
              <div className="flex items-center gap-2 font-semibold text-stone-900 text-sm">
                <CreditCard className="w-4 h-4 text-amber-800" />
                <span>Online Digital Payment Gateway</span>
              </div>
              <span className="text-xs text-stone-500">
                Support digital cards via Sri Lankan IPG with server-side validation.
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={onlineGatewayEnabled}
                onChange={(e) => setOnlineGatewayEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-stone-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-800"></div>
            </label>
          </div>
        </div>
      </div>

      {/* 2. Returns and Refunds Settings */}
      <div className="bg-white p-6 sm:p-8 rounded-xl border border-stone-200 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-amber-800" />
            <h2 className="font-serif text-lg font-medium text-stone-900">
              2. Returns & Refunds Policy (7-Day Default)
            </h2>
          </div>
          <button
            type="button"
            disabled={savingSection === "returns"}
            onClick={() =>
              saveSection("returns", {
                returnWindowDays,
                refundWindowDays,
                policyText: returnPolicyText,
              })
            }
            className="px-4 py-1.5 bg-stone-900 hover:bg-stone-800 text-amber-100 text-xs font-semibold uppercase tracking-wider rounded flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{savingSection === "returns" ? "Saving..." : "Save Return Policy"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-stone-700 uppercase tracking-wider mb-1.5">
              Return Eligibility Window (Days) *
            </label>
            <input
              type="number"
              min="1"
              max="90"
              required
              value={returnWindowDays}
              onChange={(e) => setReturnWindowDays(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded text-sm text-stone-900 font-semibold"
            />
            <span className="text-[11px] text-stone-500 mt-1 block">
              Default business policy is 7 calendar days from courier delivery.
            </span>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 uppercase tracking-wider mb-1.5">
              Refund Processing Window (Days) *
            </label>
            <input
              type="number"
              min="1"
              max="90"
              required
              value={refundWindowDays}
              onChange={(e) => setRefundWindowDays(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded text-sm text-stone-900 font-semibold"
            />
            <span className="text-[11px] text-stone-500 mt-1 block">
              Default business rule is 7 days from warehouse return receipt.
            </span>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-stone-700 uppercase tracking-wider mb-1.5">
              Published Return Policy Text
            </label>
            <textarea
              rows={3}
              value={returnPolicyText}
              onChange={(e) => setReturnPolicyText(e.target.value)}
              className="w-full px-3.5 py-2 bg-stone-50 border border-stone-300 rounded text-xs text-stone-900"
            />
          </div>
        </div>
      </div>

      {/* 3. Warranty Terms */}
      <div className="bg-white p-6 sm:p-8 rounded-xl border border-stone-200 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-800" />
            <h2 className="font-serif text-lg font-medium text-stone-900">
              3. Hardware Warranty Terms (6-Month Default)
            </h2>
          </div>
          <button
            type="button"
            disabled={savingSection === "warranty"}
            onClick={() =>
              saveSection("warranty", {
                defaultDurationMonths: warrantyMonths,
                termsText: warrantyTermsText,
              })
            }
            className="px-4 py-1.5 bg-stone-900 hover:bg-stone-800 text-amber-100 text-xs font-semibold uppercase tracking-wider rounded flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{savingSection === "warranty" ? "Saving..." : "Save Warranty"}</span>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-stone-700 uppercase tracking-wider mb-1.5">
              Default Advertised Warranty Duration (Months) *
            </label>
            <input
              type="number"
              min="1"
              max="60"
              required
              value={warrantyMonths}
              onChange={(e) => setWarrantyMonths(Number(e.target.value))}
              className="w-full sm:w-1/2 px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded text-sm text-stone-900 font-semibold"
            />
            <span className="text-[11px] text-stone-500 mt-1 block">
              Default advertised warranty duration is 6 months on Dr. Scent hardware diffusers.
            </span>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 uppercase tracking-wider mb-1.5">
              Warranty Terms Statement
            </label>
            <textarea
              rows={3}
              value={warrantyTermsText}
              onChange={(e) => setWarrantyTermsText(e.target.value)}
              className="w-full px-3.5 py-2 bg-stone-50 border border-stone-300 rounded text-xs text-stone-900"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
