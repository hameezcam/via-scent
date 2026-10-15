"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShieldCheck, Mail, Phone, MapPin, ArrowRight, CheckCircle2 } from "lucide-react";
import { BRAND_CONFIG } from "@/config/brand.config";

export function Footer() {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState<"idle" | "success" | "error">("idle");
  const [newsletterFeedback, setNewsletterFeedback] = useState("");

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes("@")) {
      setNewsletterStatus("error");
      setNewsletterFeedback("Please enter a valid email address.");
      return;
    }

    // Honest demo mode handling
    setNewsletterStatus("success");
    setNewsletterFeedback(
      "Thank you for your interest! In Phase 1 preview mode, email addresses are verified locally and not yet persisted to a production mailing list."
    );
    setNewsletterEmail("");
  };

  return (
    <footer className="bg-stone-900 text-stone-300 pt-16 pb-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-stone-800">
          {/* Col 1 & 2: Brand Identity & Franchise Disclosure */}
          <div className="lg:col-span-2 space-y-4">
            <div>
              <span className="font-serif text-2xl tracking-[0.2em] font-semibold text-stone-100 block">
                {BRAND_CONFIG.brandName}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-amber-300 tracking-wider font-medium uppercase mt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                {BRAND_CONFIG.franchiseStatement}
              </span>
            </div>

            <p className="text-stone-400 text-xs leading-relaxed max-w-sm">
              Official Sri Lankan franchise partner offering Dr. Scent cold-air diffusion instruments, pure fragrance oils, and architectural scent installations across residential and commercial properties.
            </p>

            <div className="pt-2 space-y-2 text-xs text-stone-400">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{BRAND_CONFIG.contact.address}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{BRAND_CONFIG.contact.phone}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{BRAND_CONFIG.contact.email}</span>
              </div>
            </div>
          </div>

          {/* Col 3: Fragrance Catalogue */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold tracking-widest uppercase text-stone-100">
              Collections
            </h3>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <Link href="/shop/aroma-diffusers" className="hover:text-amber-300 transition-colors">
                  Aroma Diffusers
                </Link>
              </li>
              <li>
                <Link href="/shop/fragrance-oils" className="hover:text-amber-300 transition-colors">
                  Fragrance Oils
                </Link>
              </li>
              <li>
                <Link href="/shop/commercial-scenting" className="hover:text-amber-300 transition-colors">
                  Commercial Scenting
                </Link>
              </li>
              <li>
                <Link href="/shop/home-fragrance" className="hover:text-amber-300 transition-colors">
                  Home Fragrance
                </Link>
              </li>
              <li>
                <Link href="/shop/gift-collections" className="hover:text-amber-300 transition-colors">
                  Gift Collections
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-amber-300 transition-colors font-medium text-stone-300">
                  View Full Catalogue →
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Commercial & Service Support */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold tracking-widest uppercase text-stone-100">
              Client Care & B2B
            </h3>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <Link href="/business-scenting" className="hover:text-amber-300 transition-colors">
                  Business Scent Architecture
                </Link>
              </li>
              <li>
                <Link href="/business-scenting/request-quote" className="hover:text-amber-300 transition-colors text-amber-200">
                  Request B2B Quote
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-amber-300 transition-colors">
                  Islandwide Delivery Information
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-amber-300 transition-colors">
                  Warranty & Returns Policy
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-amber-300 transition-colors">
                  About Our Partnership
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-amber-300 transition-colors">
                  Colombo Showroom Concierge
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Editorial Newsletter */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold tracking-widest uppercase text-stone-100">
              The Olfactory Gazette
            </h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              Curated notes on ambient scenting, seasonal formulations, and architectural design insights.
            </p>

            <form onSubmit={handleNewsletterSubmit} className="space-y-2">
              <div className="relative">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => {
                    setNewsletterEmail(e.target.value);
                    if (newsletterStatus !== "idle") setNewsletterStatus("idle");
                  }}
                  placeholder="Enter your email address"
                  aria-label="Email address for fragrance newsletter"
                  className="w-full bg-stone-800/80 border border-stone-700 text-stone-100 px-3 py-2 text-xs rounded placeholder-stone-500 focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
                <button
                  type="submit"
                  aria-label="Subscribe to newsletter"
                  className="absolute right-1 top-1 bottom-1 px-2.5 bg-amber-400/90 text-stone-950 text-xs font-semibold rounded hover:bg-amber-300 transition-colors"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {newsletterStatus === "error" && (
                <p className="text-[11px] text-red-400">{newsletterFeedback}</p>
              )}
              {newsletterStatus === "success" && (
                <div className="flex items-start gap-1.5 text-[11px] text-amber-200 bg-amber-950/60 p-2 rounded border border-amber-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span>{newsletterFeedback}</span>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Bottom Bar: Legal, Policies, Currency, Copyright */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-stone-400">
          <div className="space-y-1 text-center md:text-left">
            <p>
              © 2026 {BRAND_CONFIG.brandName}. All rights reserved. Authorized Franchisee Partner for Dr. Scent in Sri Lanka.
            </p>
            <p className="text-stone-400 text-[11px]">
              {BRAND_CONFIG.disclaimer} All prices quoted in Sri Lankan Rupees ({BRAND_CONFIG.currency.code}).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px]">
            <Link href="/privacy" className="hover:text-stone-300 underline underline-offset-2 transition-colors">
              Privacy Notice
            </Link>
            <Link href="/terms" className="hover:text-stone-300 underline underline-offset-2 transition-colors">
              Terms of Service
            </Link>
            <Link href="/shipping" className="hover:text-stone-300 underline underline-offset-2 transition-colors">
              Shipping & Delivery
            </Link>
            <Link href="/returns" className="hover:text-stone-300 underline underline-offset-2 transition-colors">
              Returns & Refunds
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
