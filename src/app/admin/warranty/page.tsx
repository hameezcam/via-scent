"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Eye,
  X,
} from "lucide-react";
import { WarrantyClaim, WarrantyClaimStatus } from "@/types/order";

const WARRANTY_STATUSES: WarrantyClaimStatus[] = [
  "SUBMITTED",
  "UNDER_EVALUATION",
  "APPROVED_REPAIR",
  "APPROVED_REPLACEMENT",
  "REJECTED",
];

export default function AdminWarrantyPage() {
  const [claims, setClaims] = useState<WarrantyClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClaim, setSelectedClaim] = useState<WarrantyClaim | null>(null);

  // Form
  const [newStatus, setNewStatus] = useState<WarrantyClaimStatus>("UNDER_EVALUATION");
  const [resolutionNotes, setResolutionNotes] = useState("");

  useEffect(() => {
    let ignore = false;
    async function fetchClaims() {
      try {
        const res = await fetch("/api/admin/warranty");
        if (res.ok) {
          const data = await res.json();
          if (!ignore) {
            setClaims(Array.isArray(data) ? data : []);
          }
        }
      } catch (e) {
        console.error("Failed to load claims", e);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    fetchClaims();
    return () => {
      ignore = true;
    };
  }, []);

  const handleUpdateClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClaim) return;

    try {
      const res = await fetch("/api/admin/warranty", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          claimId: selectedClaim.id,
          status: newStatus,
          resolutionNotes: resolutionNotes || `Status updated to ${newStatus}`,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setClaims((prev) => prev.map((c) => (c.id === selectedClaim.id ? data.claim : c)));
        setSelectedClaim(data.claim);
        setResolutionNotes("");
      }
    } catch (err) {
      console.error("Failed to update claim", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
        <div>
          <h1 className="font-serif text-3xl font-medium text-stone-900">
            Hardware Warranty Claims & Service
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Track reported issues, technical assessments, and pump/electronics resolutions under the 6-month franchise warranty.
          </p>
        </div>
      </div>

      {/* Claims Table */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs text-stone-500">
            <div className="w-8 h-8 border-2 border-stone-300 border-t-amber-800 rounded-full animate-spin mx-auto mb-2" />
            <span>Loading warranty claims...</span>
          </div>
        ) : claims.length === 0 ? (
          <div className="py-20 text-center text-xs text-stone-500 space-y-2">
            <ShieldCheck className="w-10 h-10 text-stone-300 mx-auto" />
            <p>No warranty claims logged yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-700">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 font-medium">Claim Ref</th>
                  <th className="py-3 px-4 font-medium">Order Number</th>
                  <th className="py-3 px-4 font-medium">Customer</th>
                  <th className="py-3 px-4 font-medium">Product / SKU</th>
                  <th className="py-3 px-4 font-medium">Warranty Term</th>
                  <th className="py-3 px-4 font-medium">Eligibility</th>
                  <th className="py-3 px-4 font-medium">Claim Status</th>
                  <th className="py-3 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {claims.map((claim) => (
                  <tr key={claim.id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-stone-900">
                      {claim.claimNumber}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-stone-600">{claim.orderNumber}</td>
                    <td className="py-3.5 px-4">
                      <p className="font-medium text-stone-900">{claim.customerName}</p>
                      <p className="text-[11px] text-stone-500">{claim.customerPhone}</p>
                    </td>
                    <td className="py-3.5 px-4 font-medium">{claim.productName}</td>
                    <td className="py-3.5 px-4">{claim.warrantyDurationMonths} Months</td>
                    <td className="py-3.5 px-4">
                      {claim.isUnderWarranty ? (
                        <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                          Covered
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold bg-red-100 text-red-800 px-2 py-0.5 rounded">
                          Expired
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-[10px] bg-stone-100 border border-stone-200 px-2 py-0.5 rounded uppercase font-semibold text-stone-800">
                        {claim.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedClaim(claim);
                          setNewStatus(claim.status);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-stone-700 bg-stone-100 hover:bg-stone-200 rounded text-xs transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Assess</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Claim Modal */}
      {selectedClaim && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-2xl border border-stone-200 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-800">
                  Warranty Claim #{selectedClaim.claimNumber}
                </span>
                <h2 className="font-serif text-xl font-semibold text-stone-900 mt-0.5">
                  {selectedClaim.productName}
                </h2>
              </div>
              <button
                onClick={() => setSelectedClaim(null)}
                className="text-stone-400 hover:text-stone-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-stone-50 rounded border border-stone-200 text-xs space-y-1.5">
              <p>
                <strong>Customer:</strong> {selectedClaim.customerName} ({selectedClaim.customerPhone})
              </p>
              <p>
                <strong>Order Reference:</strong> {selectedClaim.orderNumber} (Date:{" "}
                {new Date(selectedClaim.purchaseDate).toLocaleDateString("en-GB")})
              </p>
              <p>
                <strong>Reported Symptom:</strong> {selectedClaim.issueDescription}
              </p>
              {selectedClaim.serialNumber && (
                <p>
                  <strong>Hardware Serial:</strong> {selectedClaim.serialNumber}
                </p>
              )}
            </div>

            {/* Assessment form */}
            <form onSubmit={handleUpdateClaim} className="space-y-4 pt-2 border-t border-stone-100">
              <h3 className="font-serif font-semibold text-stone-900 text-sm">
                Technician Resolution & Assessment:
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="sm:col-span-2">
                  <label className="block font-medium text-stone-700 uppercase tracking-wider mb-1">
                    Warranty Status *
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as WarrantyClaimStatus)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded text-stone-900 font-semibold"
                  >
                    {WARRANTY_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-medium text-stone-700 uppercase tracking-wider mb-1">
                    Technician Findings & Resolution Notes *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    placeholder="e.g. Cleaned nozzle atomization chamber with alcohol solvent and verified pump flow rate. Replaced silicon seal."
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded text-stone-900"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="submit"
                  className="px-6 py-2 bg-stone-900 hover:bg-stone-800 text-amber-100 uppercase font-semibold text-xs rounded transition-colors"
                >
                  Save Assessment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
