"use client";

import React, { useState, useEffect } from "react";
import {
  RotateCcw,
  Eye,
  X,
} from "lucide-react";
import { ReturnRequest, ReturnStatus } from "@/types/order";

const RETURN_STATUSES: ReturnStatus[] = [
  "REQUESTED",
  "UNDER_REVIEW",
  "APPROVED",
  "REJECTED",
  "RETURN_IN_TRANSIT",
  "RECEIVED",
  "REFUND_PENDING",
  "REFUNDED",
];

export default function AdminReturnsPage() {
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReturn, setSelectedReturn] = useState<ReturnRequest | null>(null);

  // Status update modal state
  const [updatingStatus, setUpdatingStatus] = useState<ReturnStatus>("UNDER_REVIEW");
  const [adminNote, setAdminNote] = useState("");
  const [refundAmount, setRefundAmount] = useState<string>("");
  useEffect(() => {
    let ignore = false;
    async function fetchReturns() {
      try {
        const res = await fetch("/api/admin/returns");
        if (res.ok) {
          const data = await res.json();
          if (!ignore) {
            setReturns(Array.isArray(data) ? data : []);
          }
        }
      } catch (e) {
        console.error("Failed to load returns", e);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    fetchReturns();
    return () => {
      ignore = true;
    };
  }, []);

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReturn) return;

    try {
      const res = await fetch("/api/admin/returns", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          returnId: selectedReturn.id,
          status: updatingStatus,
          notes: adminNote || `Status updated to ${updatingStatus}`,
          refundAmountLKR: refundAmount ? Number(refundAmount) : undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setReturns((prev) =>
          prev.map((r) => (r.id === selectedReturn.id ? data.returnRequest : r))
        );
        setSelectedReturn(data.returnRequest);
        setAdminNote("");
        setRefundAmount("");
      }
    } catch (err) {
      console.error("Failed to update return", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
        <div>
          <h1 className="font-serif text-3xl font-medium text-stone-900">
            Returns & Refunds Lifecycle
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Manage customer return requests through the required 8-stage franchise resolution workflow.
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs text-stone-500">
            <div className="w-8 h-8 border-2 border-stone-300 border-t-amber-800 rounded-full animate-spin mx-auto mb-2" />
            <span>Loading return requests...</span>
          </div>
        ) : returns.length === 0 ? (
          <div className="py-20 text-center text-xs text-stone-500 space-y-2">
            <RotateCcw className="w-10 h-10 text-stone-300 mx-auto" />
            <p>No customer return requests logged yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-700">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 font-medium">Return Ref</th>
                  <th className="py-3 px-4 font-medium">Order #</th>
                  <th className="py-3 px-4 font-medium">Customer</th>
                  <th className="py-3 px-4 font-medium">Reason</th>
                  <th className="py-3 px-4 font-medium">7-Day Window</th>
                  <th className="py-3 px-4 font-medium">Refund Method</th>
                  <th className="py-3 px-4 font-medium">Current Status</th>
                  <th className="py-3 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {returns.map((ret) => (
                  <tr key={ret.id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-stone-900">
                      {ret.returnNumber}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-stone-600">{ret.orderNumber}</td>
                    <td className="py-3.5 px-4">
                      <p className="font-medium text-stone-900">{ret.customerName}</p>
                      <p className="text-[11px] text-stone-500">{ret.customerPhone}</p>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate">{ret.reason}</td>
                    <td className="py-3.5 px-4">
                      {ret.isWithin7Days ? (
                        <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                          Eligible (≤7 Days)
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                          Late Request
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="capitalize text-[11px] text-stone-600">
                        {ret.refundMethod.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-[10px] bg-stone-100 border border-stone-200 px-2 py-0.5 rounded uppercase font-semibold text-stone-800">
                        {ret.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedReturn(ret);
                          setUpdatingStatus(ret.status);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-stone-700 bg-stone-100 hover:bg-stone-200 rounded text-xs transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Manage</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Manage Return Modal */}
      {selectedReturn && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-2xl border border-stone-200 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-800">
                  Return Request #{selectedReturn.returnNumber}
                </span>
                <h2 className="font-serif text-xl font-semibold text-stone-900 mt-0.5">
                  Order {selectedReturn.orderNumber}
                </h2>
              </div>
              <button
                onClick={() => setSelectedReturn(null)}
                className="text-stone-400 hover:text-stone-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Details Box */}
            <div className="p-4 bg-stone-50 rounded border border-stone-200 text-xs space-y-2">
              <p>
                <strong>Customer:</strong> {selectedReturn.customerName} ({selectedReturn.customerEmail})
              </p>
              <p>
                <strong>Phone:</strong> {selectedReturn.customerPhone}
              </p>
              <p>
                <strong>Item:</strong> {selectedReturn.itemName} ({selectedReturn.itemSku})
              </p>
              <p>
                <strong>Reason:</strong> {selectedReturn.reason}
              </p>
              <p>
                <strong>Customer Notes:</strong> {selectedReturn.details}
              </p>
              <p>
                <strong>Preferred Refund Channel:</strong> {selectedReturn.refundMethod}
              </p>
            </div>

            {/* Update Status Form */}
            <form onSubmit={handleUpdateStatus} className="space-y-4 pt-2 border-t border-stone-100">
              <h3 className="font-serif font-semibold text-stone-900 text-sm">
                Transition Return Workflow Status:
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-medium text-stone-700 uppercase tracking-wider mb-1">
                    Select New Status *
                  </label>
                  <select
                    value={updatingStatus}
                    onChange={(e) => setUpdatingStatus(e.target.value as ReturnStatus)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded text-stone-900 font-semibold"
                  >
                    {RETURN_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-stone-700 uppercase tracking-wider mb-1">
                    Refund Amount Settled (LKR)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                    placeholder="e.g. 45000"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded text-stone-900"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-medium text-stone-700 uppercase tracking-wider mb-1">
                    Administrative Assessment Notes *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    placeholder="e.g. Unit inspected at Colombo boutique. Atomizer replaced and refund approved."
                    className="w-full px-3 py-1.5 bg-stone-50 border border-stone-300 rounded text-stone-900"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="submit"
                  className="px-6 py-2 bg-stone-900 hover:bg-stone-800 text-amber-100 uppercase font-semibold text-xs rounded transition-colors"
                >
                  Record Status Transition
                </button>
              </div>
            </form>

            {/* History */}
            <div className="space-y-2 pt-2 border-t border-stone-100 text-xs">
              <h3 className="font-serif font-semibold text-stone-900 text-sm">Return Audit Trail:</h3>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {selectedReturn.history.map((h, idx) => (
                  <div key={idx} className="p-2 bg-stone-50 rounded text-[11px] text-stone-600">
                    <div className="flex justify-between font-mono text-[10px] text-stone-500">
                      <span>{new Date(h.timestamp).toLocaleString("en-GB")}</span>
                      <span>By: {h.updatedBy}</span>
                    </div>
                    <p className="font-semibold text-stone-800 mt-0.5">{h.status}</p>
                    <p>{h.note}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
