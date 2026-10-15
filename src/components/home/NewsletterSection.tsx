"use client";

import React, { useState } from "react";
import { Mail, ArrowRight, CheckCircle2 } from "lucide-react";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@") || !email.includes(".")) {
      setStatus("error");
      setMessage("Please provide a valid email address.");
      return;
    }

    setStatus("submitting");
    setTimeout(() => {
      setStatus("success");
      setMessage(
        "Thank you for your interest! In Phase 1 preview mode, emails are verified on the client and not yet stored in an external mailing list."
      );
      setEmail("");
    }, 600);
  };

  return (
    <section className="py-20 bg-[#F4EFEA] border-b border-[#E7E2D8]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-900 mx-auto flex items-center justify-center border border-amber-300">
          <Mail className="w-6 h-6" />
        </div>

        <div className="space-y-2">
          <h2 className="font-serif text-3xl sm:text-4xl text-stone-900 font-normal">
            Join The Olfactory Gazette
          </h2>
          <p className="text-sm text-stone-600 max-w-lg mx-auto leading-relaxed">
            Receive private notifications of limited seasonal fragrance releases, interior scenting guides, and exclusive franchise previews.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (status !== "idle") setStatus("idle");
              }}
              placeholder="Your preferred email address"
              aria-label="Email address for subscription"
              className="flex-1 px-4 py-3 bg-white border border-stone-300 rounded text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-800"
            />
            <button
              type="submit"
              disabled={status === "submitting"}
              className="px-6 py-3 bg-stone-900 text-amber-100 text-xs uppercase tracking-wider font-semibold rounded hover:bg-stone-800 transition-colors flex items-center justify-center gap-1.5 shrink-0"
            >
              <span>{status === "submitting" ? "Verifying..." : "Subscribe"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {status === "error" && (
            <p className="text-xs text-red-600 text-left font-medium">{message}</p>
          )}

          {status === "success" && (
            <div className="p-3 bg-amber-50 border border-amber-300 rounded text-left text-xs text-amber-950 flex items-start gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <span>{message}</span>
            </div>
          )}

          <p className="text-[11px] text-stone-400">
            We value your privacy. Unsubscribe at any time. No spam or third-party marketing.
          </p>
        </form>
      </div>
    </section>
  );
}
