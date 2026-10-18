"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { LUXURY_EASE } from "@/config/motion.config";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@") || !email.includes(".")) {
      setStatus("error");
      setMessage("Please enter a valid email address.");
      return;
    }

    setStatus("submitting");
    setMessage("");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatus("success");
        setMessage(data.message || "Thank you for subscribing to The Olfactory Gazette.");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error || "Unable to complete subscription. Please try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Network error occurred. Please check your connection and try again.");
    }
  };

  return (
    <section className="relative overflow-hidden bg-[var(--near-black)] text-[var(--ivory)] py-28 lg:py-36 border-t border-[var(--warm-stone)]/20">
      {/* Ambient background image with soft cinematic overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-25">
        <Image
          src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=2000&q=80"
          alt="Atmospheric architectural living space with subtle ambient lighting"
          fill
          className="object-cover object-center filter grayscale contrast-125 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--near-black)] via-[var(--near-black)]/80 to-[var(--near-black)]" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.9, ease: LUXURY_EASE }}
          className="space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--champagne)]/30 bg-[var(--champagne)]/5 text-[var(--champagne)] text-[10px] uppercase tracking-[0.3em]">
            <Sparkles className="w-3 h-3 text-[var(--champagne)]" />
            <span>The Olfactory Conclusion</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-[var(--porcelain)] font-normal tracking-tight leading-[1.15]">
            Your space. <span className="italic font-light text-[var(--champagne)]">Your signature.</span>
          </h2>

          <p className="max-w-xl mx-auto text-xs sm:text-sm text-[var(--warm-stone)] font-light leading-relaxed">
            From intimate residences to grand architectural hospitality suites, discover the precise scenting instrument to define your environment.
          </p>

          {/* Quick Route to Catalogue */}
          <div className="pt-2 pb-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-[var(--porcelain)] text-[var(--near-black)] text-xs uppercase tracking-[0.2em] font-medium rounded-sm hover:bg-[var(--champagne)] hover:text-white transition-all duration-300 shadow-sm"
            >
              <span>Explore The Full Catalogue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/business-scenting/request-quote"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-transparent text-[var(--ivory)] border border-[var(--warm-stone)]/40 text-xs uppercase tracking-[0.2em] font-light rounded-sm hover:border-[var(--champagne)] hover:text-[var(--champagne)] transition-all duration-300"
            >
              <span>Request B2B Architecture</span>
            </Link>
          </div>

          {/* Integrated Gazette Newsletter Subscription */}
          <div className="pt-10 border-t border-[var(--warm-stone)]/20 max-w-md mx-auto">
            <span className="text-[10px] uppercase tracking-[0.25em] text-[var(--champagne)] font-medium block mb-2">
              The Olfactory Gazette
            </span>
            <p className="text-[11px] text-[var(--warm-stone)]/80 mb-5 font-light">
              Receive private invitations to limited franchise releases and spatial design guides.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (status !== "idle") setStatus("idle");
                  }}
                  placeholder="Enter your email address"
                  aria-label="Email address for subscription"
                  className="flex-1 px-4 py-3 bg-[var(--deep-espresso)]/80 border border-[var(--warm-stone)]/30 rounded-sm text-xs text-[var(--porcelain)] placeholder-[var(--warm-stone)]/50 focus:outline-none focus:border-[var(--champagne)] transition-colors"
                />
                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="px-6 py-3 bg-[var(--champagne)] text-[var(--near-black)] text-[11px] uppercase tracking-[0.2em] font-semibold rounded-sm hover:bg-white transition-colors duration-200 flex items-center justify-center gap-1.5 shrink-0 disabled:opacity-50"
                >
                  <span>{status === "submitting" ? "Enrolling..." : "Subscribe"}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {status === "error" && (
                <p className="text-[11px] text-red-400 text-left font-light">{message}</p>
              )}

              {status === "success" && (
                <div className="p-3 bg-[var(--deep-espresso)] border border-[var(--champagne)]/40 rounded-sm text-left text-xs text-[var(--champagne)] flex items-start gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-[var(--champagne)] shrink-0 mt-0.5" />
                  <span className="font-light text-[11px] text-[var(--porcelain)]">{message}</span>
                </div>
              )}

              <p className="text-[10px] text-[var(--warm-stone)]/60 font-light">
                Discreet correspondence only. Unsubscribe at any time.
              </p>
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
