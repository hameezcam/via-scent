"use client";

import React, { useState, useEffect } from "react";
import { Truck, Save, CheckCircle2, AlertCircle, RefreshCw, ShieldAlert } from "lucide-react";
import { StoreSettings, DeliverySettings } from "@/types/settings";

const SRI_LANKA_KEY_DISTRICTS = [
  "Colombo",
  "Gampaha",
  "Kalutara",
  "Kandy",
  "Galle",
  "Matara",
  "Kurunegala",
  "Jaffna",
  "Batticaloa",
  "Nuwara Eliya",
  "Ratnapura",
  "Anuradhapura",
];

export default function AdminDeliverySettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [islandwideEnabled, setIslandwideEnabled] = useState(true);
  const [defaultCourierFeeLKR, setDefaultCourierFeeLKR] = useState<number>(500);
  const [freeDeliveryThresholdLKR, setFreeDeliveryThresholdLKR] = useState<string>("");
  const [policyText, setPolicyText] = useState("");
  const [estimateText, setEstimateText] = useState("");
  const [districtFees, setDistrictFees] = useState<{ [district: string]: number }>({});
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );
  const [refreshIndex, setRefreshIndex] = useState(0);

  useEffect(() => {
    let ignore = false;
    async function fetchDeliverySettings() {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data: StoreSettings = await res.json();
          if (!ignore) {
            const del = data.delivery;
            setIslandwideEnabled(del.islandwideEnabled);
            setDefaultCourierFeeLKR(del.defaultCourierFeeLKR);
            setFreeDeliveryThresholdLKR(
              del.freeDeliveryThresholdLKR !== null && del.freeDeliveryThresholdLKR !== undefined
                ? String(del.freeDeliveryThresholdLKR)
                : ""
            );
            setPolicyText(del.policyText);
            setEstimateText(del.estimateText);
            setDistrictFees(del.districtFees || {});
          }
        }
      } catch (e) {
        console.error("Failed to load settings", e);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    fetchDeliverySettings();
    return () => {
      ignore = true;
    };
  }, [refreshIndex]);

  const handleDistrictFeeChange = (district: string, val: string) => {
    const num = Number(val);
    setDistrictFees((prev) => ({
      ...prev,
      [district]: isNaN(num) ? 500 : num,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    try {
      const parsedFee = Number(defaultCourierFeeLKR);
      if (isNaN(parsedFee) || parsedFee < 0) {
        throw new Error("Default courier fee must be a valid non-negative number.");
      }

      const parsedThreshold =
        freeDeliveryThresholdLKR.trim() !== "" ? Number(freeDeliveryThresholdLKR) : null;

      const payload: Partial<DeliverySettings> = {
        islandwideEnabled,
        defaultCourierFeeLKR: parsedFee,
        freeDeliveryThresholdLKR: parsedThreshold,
        policyText,
        estimateText,
        districtFees,
      };

      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-user": "admin@viascent.lk",
        },
        body: JSON.stringify({
          section: "delivery",
          data: payload,
        }),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to update delivery settings.");
      }

      setFeedback({
        type: "success",
        message: `Delivery fee successfully updated to LKR ${parsedFee}. All changes have been logged in the audit trail.`,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error saving settings.";
      setFeedback({ type: "error", message: msg });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-10 h-10 border-2 border-stone-300 border-t-amber-800 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-stone-600 font-medium">Loading administrative settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-800">
            <Truck className="w-4 h-4" />
            <span>Store Configuration</span>
          </div>
          <h1 className="font-serif text-3xl font-medium text-stone-900 mt-1">
            Delivery & Courier Settings
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Configure islandwide shipping fees, thresholds, and policy messaging. Updates take effect immediately at checkout.
          </p>
        </div>

        <button
          onClick={() => {
            setLoading(true);
            setRefreshIndex((i) => i + 1);
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900 bg-white border border-stone-300 rounded shadow-2xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reload</span>
        </button>
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
            <p className="font-semibold">{feedback.type === "success" ? "Success" : "Validation Error"}</p>
            <p className="mt-0.5">{feedback.message}</p>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Core Courier Settings */}
        <div className="bg-white p-6 sm:p-8 rounded-xl border border-stone-200 shadow-xs space-y-6">
          <h2 className="font-serif text-lg font-medium text-stone-900 border-b border-stone-100 pb-3">
            1. Islandwide Delivery & Standard Fee
          </h2>

          <div className="space-y-4">
            {/* Toggle Islandwide */}
            <div className="flex items-center justify-between p-4 bg-stone-50 rounded-lg border border-stone-200">
              <div>
                <span className="text-sm font-semibold text-stone-900 block">
                  Islandwide Sri Lanka Delivery
                </span>
                <span className="text-xs text-stone-500">
                  Allow checkout and courier delivery across all 25 administrative districts.
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={islandwideEnabled}
                  onChange={(e) => setIslandwideEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-stone-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-800"></div>
              </label>
            </div>

            {/* Default Courier Fee */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-stone-700 uppercase tracking-wider mb-1.5">
                  Default Courier Fee (LKR) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-stone-400 font-medium">
                    LKR
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    required
                    value={defaultCourierFeeLKR}
                    onChange={(e) => setDefaultCourierFeeLKR(Number(e.target.value))}
                    className="w-full pl-12 pr-4 py-2.5 bg-stone-50 border border-stone-300 rounded text-sm text-stone-900 font-semibold focus:bg-white"
                  />
                </div>
                <span className="text-[11px] text-stone-500 mt-1 block">
                  Initial requirement defaults to LKR 500 per order.
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 uppercase tracking-wider mb-1.5">
                  Optional Free Delivery Threshold (LKR)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-stone-400 font-medium">
                    LKR
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={freeDeliveryThresholdLKR}
                    onChange={(e) => setFreeDeliveryThresholdLKR(e.target.value)}
                    placeholder="e.g. 50000 (Leave empty to disable)"
                    className="w-full pl-12 pr-4 py-2.5 bg-stone-50 border border-stone-300 rounded text-sm text-stone-900 focus:bg-white"
                  />
                </div>
                <span className="text-[11px] text-stone-500 mt-1 block">
                  Orders exceeding this merchandise subtotal qualify for free courier shipping.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* District Overrides */}
        <div className="bg-white p-6 sm:p-8 rounded-xl border border-stone-200 shadow-xs space-y-4">
          <div className="border-b border-stone-100 pb-3">
            <h2 className="font-serif text-lg font-medium text-stone-900">
              2. District-Specific Delivery Fee Overrides
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Optionally configure different courier rates for specific Sri Lankan districts if regional line-haul costs differ.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {SRI_LANKA_KEY_DISTRICTS.map((district) => (
              <div key={district} className="bg-stone-50 p-2.5 rounded border border-stone-200">
                <label className="block text-[11px] font-medium text-stone-700 mb-1 truncate">
                  {district}
                </label>
                <div className="relative">
                  <span className="absolute left-2 top-1.5 text-[10px] text-stone-400">Rs.</span>
                  <input
                    type="number"
                    min="0"
                    value={districtFees[district] ?? defaultCourierFeeLKR}
                    onChange={(e) => handleDistrictFeeChange(district, e.target.value)}
                    className="w-full pl-7 pr-2 py-1 bg-white border border-stone-300 rounded text-xs text-stone-900 font-medium"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Policy & Estimate Texts */}
        <div className="bg-white p-6 sm:p-8 rounded-xl border border-stone-200 shadow-xs space-y-4">
          <h2 className="font-serif text-lg font-medium text-stone-900 border-b border-stone-100 pb-3">
            3. Customer-Facing Policy & Estimate Text
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-stone-700 uppercase tracking-wider mb-1.5">
                Delivery Policy Explanatory Text
              </label>
              <textarea
                rows={2}
                value={policyText}
                onChange={(e) => setPolicyText(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded text-xs text-stone-900 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 uppercase tracking-wider mb-1.5">
                Delivery Estimate Notice
              </label>
              <textarea
                rows={2}
                value={estimateText}
                onChange={(e) => setEstimateText(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded text-xs text-stone-900 focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-1.5 text-xs text-stone-500">
            <ShieldAlert className="w-4 h-4 text-amber-700" />
            <span>Changes are authenticated and saved to the immutable audit trail.</span>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 bg-stone-900 hover:bg-stone-800 text-amber-100 text-xs font-semibold uppercase tracking-wider rounded transition-all shadow-md flex items-center gap-2 disabled:opacity-60"
          >
            {saving ? (
              <span>Saving Changes...</span>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Delivery Configuration</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
