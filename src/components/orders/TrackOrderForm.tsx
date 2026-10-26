"use client";

import React, { useState } from "react";
import { formatLKR } from "@/config/brand.config";

interface TrackResult {
  orderNumber: string;
  placedAt: string;
  status: string;
  paymentMethod: "cod" | "online_gateway";
  paymentStatus: string;
  totalLKR: number;
  items: { name: string; quantity: number }[];
}

const STATUS_TEXT: Record<string, string> = {
  pending_payment: "Waiting for your card payment",
  placed_cod: "Order received. We'll confirm it with you shortly",
  confirmed: "Confirmed. We're getting it ready",
  processing: "Being packed",
  dispatched: "On its way to you",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export function TrackOrderForm() {
  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<TrackResult | null>(null);

  async function lookUp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/orders/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber, phone }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || "Something went wrong. Please try again.");
      else setResult(data);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const input =
    "w-full px-4 py-3 bg-white border border-[var(--warm-stone)] text-sm focus:outline-none focus:border-[var(--near-black)]";

  return (
    <div className="mt-8">
      <form onSubmit={lookUp} className="space-y-4">
        <label className="block text-xs font-medium uppercase tracking-wider">
          Order number
          <input
            required
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="VIA-20261025-1234"
            className={`${input} mt-1.5 normal-case tracking-normal`}
          />
        </label>
        <label className="block text-xs font-medium uppercase tracking-wider">
          Phone number
          <input
            required
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+94 77 123 4567"
            className={`${input} mt-1.5 normal-case tracking-normal`}
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="w-full px-7 py-4 bg-[var(--near-black)] text-[var(--porcelain)] text-xs font-semibold tracking-[0.18em] uppercase disabled:opacity-60"
        >
          {loading ? "Checking..." : "Check my order"}
        </button>
      </form>

      {error && (
        <p role="alert" className="mt-6 text-sm text-red-800 bg-red-50 border border-red-200 p-4">
          {error}
        </p>
      )}

      {result && (
        <div className="mt-8 border border-[var(--warm-stone)] bg-white p-6">
          <p className="text-[10px] font-semibold tracking-[0.24em] uppercase text-[var(--champagne)]">{result.orderNumber}</p>
          <p className="mt-2 font-serif text-2xl">{STATUS_TEXT[result.status] ?? result.status}</p>
          <p className="mt-1 text-xs text-[var(--deep-espresso)]/70">
            Placed on {new Date(result.placedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
          </p>
          <ul className="mt-5 border-t border-[var(--warm-stone)] divide-y divide-[var(--warm-stone)] text-sm">
            {result.items.map((item, i) => (
              <li key={i} className="py-2.5 flex justify-between gap-4">
                <span>{item.name}</span>
                <span className="text-[var(--deep-espresso)]/70">× {item.quantity}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm flex justify-between">
            <span>
              {result.paymentMethod === "cod" ? "Pay on delivery" : result.paymentStatus === "paid" ? "Paid by card" : "Card payment pending"}
            </span>
            <strong>{formatLKR(result.totalLKR, true)}</strong>
          </p>
        </div>
      )}
    </div>
  );
}
