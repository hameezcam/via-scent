"use client";

import React, { useState, useEffect } from "react";
import { History, ShieldAlert, Search, RefreshCw, User, Clock } from "lucide-react";
import { AuditLogEntry } from "@/types/settings";

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [refreshIndex, setRefreshIndex] = useState(0);

  useEffect(() => {
    let ignore = false;
    async function fetchAuditLogs() {
      try {
        const res = await fetch("/api/admin/audit");
        if (res.ok) {
          const data = await res.json();
          if (!ignore) {
            setLogs(Array.isArray(data.logs) ? data.logs : []);
          }
        }
      } catch (e) {
        console.error("Failed to load audit logs", e);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    fetchAuditLogs();
    return () => {
      ignore = true;
    };
  }, [refreshIndex]);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.details.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.performedBy.toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter === "ALL" || log.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-800">
            <ShieldAlert className="w-4 h-4 text-amber-700" />
            <span>Compliance & Security</span>
          </div>
          <h1 className="font-serif text-3xl font-medium text-stone-900 mt-1">
            Store Audit Trail
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Immutable log of all delivery fee edits, payment toggles, returns adjustments, and order state mutations.
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
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Filter toolbar */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex flex-col sm:flex-row gap-4 justify-between items-center text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search audit trail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-300 rounded text-stone-900 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-stone-500">Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 bg-stone-50 border border-stone-300 rounded text-stone-800"
          >
            <option value="ALL">All Categories</option>
            <option value="DELIVERY">Delivery Settings</option>
            <option value="PAYMENTS">Payment Gateways</option>
            <option value="RETURNS">Returns & Refunds</option>
            <option value="WARRANTY">Warranty Terms</option>
            <option value="ORDERS">Orders & Cash Collections</option>
            <option value="PRODUCTS">Catalogue Mutations</option>
          </select>
        </div>
      </div>

      {/* Log list */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs text-stone-500">
            <div className="w-8 h-8 border-2 border-stone-300 border-t-amber-800 rounded-full animate-spin mx-auto mb-2" />
            <span>Loading audit records...</span>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="py-20 text-center text-xs text-stone-500 space-y-2">
            <History className="w-10 h-10 text-stone-300 mx-auto" />
            <p>No audit records logged yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {filteredLogs.map((log) => (
              <div key={log.id} className="p-4 sm:p-5 hover:bg-stone-50/60 transition-colors space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                      {log.category}
                    </span>
                    <strong className="text-stone-900 font-mono text-[11px]">{log.action}</strong>
                  </div>
                  <div className="flex items-center gap-3 text-stone-500 text-[11px]">
                    <span className="flex items-center gap-1 font-mono">
                      <User className="w-3.5 h-3.5 text-stone-400" />
                      {log.performedBy}
                    </span>
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3.5 h-3.5 text-stone-400" />
                      {new Date(log.timestamp).toLocaleString("en-GB")}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-stone-700 leading-relaxed">{log.details}</p>

                {Boolean(log.previousValue || log.newValue) && (
                  <div className="pt-1 flex flex-wrap gap-4 text-[10px] font-mono text-stone-500">
                    {log.previousValue !== undefined && (
                      <span className="bg-stone-100 px-2 py-0.5 rounded">
                        Prev: {JSON.stringify(log.previousValue)}
                      </span>
                    )}
                    {log.newValue !== undefined && (
                      <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded">
                        New: {JSON.stringify(log.newValue)}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
