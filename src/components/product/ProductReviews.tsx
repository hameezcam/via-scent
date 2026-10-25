"use client";

import React, { useState } from "react";
import { Star, BadgeCheck } from "lucide-react";
import type { PublicReview, ReviewSummary } from "@/types/review";

export function Stars({ rating, size = "w-4 h-4" }: { rating: number; size?: string }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`${size} ${n <= Math.round(rating) ? "fill-[var(--champagne)] text-[var(--champagne)]" : "text-[var(--warm-stone)]"}`}
          strokeWidth={1.5}
        />
      ))}
    </span>
  );
}

/** Compact rating line shown under the product name; links down to the reviews. */
export function ReviewSummaryLink({ summary }: { summary: ReviewSummary }) {
  return (
    <a href="#reviews" className="mt-3 inline-flex items-center gap-2 text-xs text-[var(--deep-espresso)]/80 hover:text-[var(--near-black)]">
      {summary.count > 0 ? (
        <>
          <Stars rating={summary.average} size="w-3.5 h-3.5" />
          <span>
            {summary.average.toFixed(1)} ({summary.count} {summary.count === 1 ? "review" : "reviews"})
          </span>
        </>
      ) : (
        <span className="underline underline-offset-4 decoration-[var(--warm-stone)]">Be the first to review</span>
      )}
    </a>
  );
}

const inputClass =
  "w-full px-3.5 py-3 bg-white border border-[var(--warm-stone)] text-sm focus:outline-none focus:border-[var(--near-black)]";

function ReviewForm({ productId, onDone }: { productId: string; onDone: () => void }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    if (!rating) {
      setStatus("error");
      setError("Please choose a star rating.");
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...Object.fromEntries(form.entries()), productId, rating }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "We couldn't save your review. Please try again.");
      onDone();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "We couldn't save your review. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 p-5 sm:p-8 bg-white border border-[var(--warm-stone)]/60 space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.16em] text-[var(--deep-espresso)]/70 mb-2">Your rating</p>
        <div className="flex gap-1" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              onMouseEnter={() => setHover(n)}
              aria-label={`${n} star${n > 1 ? "s" : ""}`}
              aria-pressed={rating === n}
              className="p-0.5 cursor-pointer"
            >
              <Star
                className={`w-7 h-7 ${n <= (hover || rating) ? "fill-[var(--champagne)] text-[var(--champagne)]" : "text-[var(--warm-stone)]"}`}
                strokeWidth={1.5}
              />
            </button>
          ))}
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <input name="authorName" required maxLength={60} placeholder="Your name" className={inputClass} />
        <input name="city" maxLength={60} placeholder="City (optional)" className={inputClass} />
      </div>
      <input name="title" maxLength={100} placeholder="Headline (optional)" className={inputClass} />
      <textarea name="body" required minLength={10} maxLength={2000} rows={4} placeholder="What did you like? How does it smell, how well does it fill the room?" className={inputClass} />
      <div className="grid sm:grid-cols-2 gap-4">
        <input name="authorEmail" type="email" maxLength={120} placeholder="Email (optional, never shown)" className={inputClass} />
        <input name="orderNumber" maxLength={40} placeholder="Order number, e.g. VIA-20261025-1234 (optional)" className={inputClass} />
      </div>
      <p className="text-xs text-[var(--deep-espresso)]/60">
        Add your email and order number to get a &quot;Verified buyer&quot; badge.
      </p>
      {/* Honeypot for bots; hidden from people and screen readers */}
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
      {status === "error" && <p className="text-sm text-[#932F2F]">{error}</p>}
      <button
        type="submit"
        disabled={status === "sending"}
        className="px-7 py-3.5 bg-[var(--near-black)] text-[var(--porcelain)] text-xs font-medium tracking-[0.18em] uppercase disabled:opacity-50 cursor-pointer"
      >
        {status === "sending" ? "Sending…" : "Submit review"}
      </button>
    </form>
  );
}

export function ProductReviews({
  productId,
  reviews,
  summary,
}: {
  productId: string;
  reviews: PublicReview[];
  summary: ReviewSummary;
}) {
  const [formOpen, setFormOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? reviews : reviews.slice(0, 5);

  return (
    <section id="reviews" className="mt-16 sm:mt-24 pt-12 border-t border-[var(--warm-stone)]/40 scroll-mt-28">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="font-serif text-[1.75rem] sm:text-4xl font-normal tracking-tight">Reviews</h2>
          {summary.count > 0 && (
            <div className="mt-3 flex items-center gap-3">
              <Stars rating={summary.average} size="w-5 h-5" />
              <span className="text-sm text-[var(--deep-espresso)]/80">
                {summary.average.toFixed(1)} out of 5 · {summary.count} {summary.count === 1 ? "review" : "reviews"}
              </span>
            </div>
          )}
        </div>
        {!formOpen && !submitted && (
          <button
            type="button"
            onClick={() => setFormOpen(true)}
            className="self-start sm:self-auto px-6 py-3 border border-[var(--near-black)] text-xs font-medium tracking-[0.18em] uppercase hover:bg-white transition-colors cursor-pointer"
          >
            Write a review
          </button>
        )}
      </div>

      {submitted && (
        <p className="mt-6 p-4 bg-[var(--ivory)] text-sm">
          Thank you! Your review has been sent and will appear here once we&apos;ve checked it.
        </p>
      )}
      {formOpen && !submitted && (
        <ReviewForm
          productId={productId}
          onDone={() => {
            setSubmitted(true);
            setFormOpen(false);
          }}
        />
      )}

      {reviews.length === 0 && !formOpen && !submitted && (
        <p className="mt-6 text-sm text-[var(--deep-espresso)]/70">No reviews yet. Bought this? Tell others what you think.</p>
      )}

      {reviews.length > 0 && (
        <ul className="mt-8 divide-y divide-[var(--warm-stone)]/50 border-y border-[var(--warm-stone)]/50">
          {visible.map((review) => (
            <li key={review.id} className="py-6 grid sm:grid-cols-[200px_1fr] gap-3 sm:gap-8">
              <div className="text-sm">
                <p className="font-medium text-[var(--near-black)]">{review.authorName}</p>
                {review.city && <p className="text-xs text-[var(--deep-espresso)]/60">{review.city}</p>}
                {review.verifiedPurchase && (
                  <p className="mt-1 inline-flex items-center gap-1 text-xs text-emerald-800">
                    <BadgeCheck className="w-3.5 h-3.5" /> Verified buyer
                  </p>
                )}
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <Stars rating={review.rating} />
                  <time className="text-xs text-[var(--deep-espresso)]/60" dateTime={review.createdAt}>
                    {new Date(review.createdAt).toLocaleDateString("en-LK", { day: "numeric", month: "short", year: "numeric" })}
                  </time>
                </div>
                {review.title && <p className="mt-2 font-serif text-lg text-[var(--near-black)]">{review.title}</p>}
                <p className="mt-1.5 text-sm text-[var(--deep-espresso)]/85 leading-relaxed whitespace-pre-line">{review.body}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
      {reviews.length > 5 && !showAll && (
        <button
          type="button"
          onClick={() => setShowAll(true)}
          className="mt-6 text-xs uppercase tracking-[0.18em] underline underline-offset-4 cursor-pointer"
        >
          Show all {reviews.length} reviews
        </button>
      )}
    </section>
  );
}
