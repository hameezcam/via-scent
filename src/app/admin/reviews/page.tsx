"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { MessageSquareQuote, Check, X, Star, BadgeCheck, ExternalLink, Loader2, RotateCcw } from "lucide-react";
import type { ProductReview, ReviewStatus } from "@/types/review";

const TABS: { status: ReviewStatus; label: string }[] = [
  { status: "pending", label: "Waiting for approval" },
  { status: "approved", label: "Approved" },
  { status: "rejected", label: "Rejected" },
];

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [tab, setTab] = useState<ReviewStatus>("pending");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/reviews", { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error("Could not load reviews.");
        return res.json();
      })
      .then((data: ProductReview[]) => setReviews(data))
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load reviews."))
      .finally(() => setLoading(false));
  }, []);

  const setStatus = async (id: string, status: ReviewStatus) => {
    setBusyId(id);
    setError("");
    try {
      const res = await fetch("/api/admin/reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed.");
      setReviews((prev) => prev.map((r) => (r.id === id ? data.review : r)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed.");
    } finally {
      setBusyId(null);
    }
  };

  const shown = reviews.filter((r) => r.status === tab);
  const count = (status: ReviewStatus) => reviews.filter((r) => r.status === status).length;

  return (
    <div className="space-y-6">
      <div className="border-b border-stone-200 pb-4">
        <div className="flex items-center gap-2">
          <MessageSquareQuote className="w-5 h-5 text-amber-800" />
          <h1 className="font-serif text-3xl font-medium text-stone-900">Product Reviews</h1>
        </div>
        <p className="text-xs text-stone-500 mt-1">
          New reviews stay hidden until you approve them. Customer emails are never shown on the site.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.status}
            type="button"
            onClick={() => setTab(t.status)}
            className={`px-4 py-2 rounded text-xs font-medium transition-colors cursor-pointer ${
              tab === t.status ? "bg-stone-900 text-white" : "bg-white text-stone-700 border border-stone-200 hover:bg-stone-50"
            }`}
          >
            {t.label} ({count(t.status)})
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3">{error}</p>}

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-stone-500 py-10">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading reviews…
        </div>
      ) : shown.length === 0 ? (
        <p className="text-sm text-stone-500 bg-white border border-stone-200 rounded p-8 text-center">
          {tab === "pending" ? "No reviews waiting. You're all caught up." : "Nothing here yet."}
        </p>
      ) : (
        <ul className="space-y-3">
          {shown.map((review) => (
            <li key={review.id} className="bg-white border border-stone-200 rounded p-5">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="min-w-0 space-y-1.5">
                  <Link
                    href={`/products/${review.productSlug}#reviews`}
                    target="_blank"
                    className="inline-flex items-center gap-1 text-xs font-medium text-amber-800 hover:underline"
                  >
                    {review.productName} <ExternalLink className="w-3 h-3" />
                  </Link>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star key={n} className={`w-4 h-4 ${n <= review.rating ? "fill-amber-500 text-amber-500" : "text-stone-300"}`} />
                      ))}
                    </span>
                    {review.title && <span className="font-medium text-stone-900 text-sm">{review.title}</span>}
                  </div>
                  <p className="text-sm text-stone-700 whitespace-pre-line">{review.body}</p>
                  <p className="text-xs text-stone-500">
                    {review.authorName}
                    {review.city ? `, ${review.city}` : ""}
                    {review.authorEmail ? ` · ${review.authorEmail}` : ""} · {new Date(review.createdAt).toLocaleString("en-LK")}
                    {review.verifiedPurchase && (
                      <span className="ml-2 inline-flex items-center gap-1 text-emerald-700">
                        <BadgeCheck className="w-3.5 h-3.5" /> Verified buyer
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  {review.status !== "approved" && (
                    <button
                      type="button"
                      disabled={busyId === review.id}
                      onClick={() => setStatus(review.id, "approved")}
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-medium rounded disabled:opacity-50 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" /> Approve
                    </button>
                  )}
                  {review.status !== "rejected" && (
                    <button
                      type="button"
                      disabled={busyId === review.id}
                      onClick={() => setStatus(review.id, "rejected")}
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-medium rounded disabled:opacity-50 cursor-pointer"
                    >
                      {review.status === "approved" ? <RotateCcw className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                      {review.status === "approved" ? "Hide" : "Reject"}
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
