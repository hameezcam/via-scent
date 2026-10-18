"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ShieldCheck,
  Mail,
  Phone,
  MapPin,
  Sparkles,
  Clock,
  ArrowRight,
  Check,
  Loader2,
  MessageSquare,
  Award,
  Truck,
  RotateCcw,
} from "lucide-react";
import { BRAND_CONFIG } from "@/config/brand.config";
import type { Category } from "@/types/category";

function InstagramIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function FacebookIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function LinkedinIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

interface FooterProps {
  initialCategories?: Category[];
}

export function Footer({ initialCategories }: FooterProps = {}) {
  const [categories, setCategories] = useState<Category[]>(initialCategories || []);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const fetchLiveCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/categories", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setCategories(json.data);
        }
      }
    } catch (err) {
      console.error("[Footer] Live category fetch failed:", err);
    }
  }, []);

  useEffect(() => {
    fetchLiveCategories();

    const handleCategoryUpdate = () => {
      fetchLiveCategories();
    };

    window.addEventListener("viascent_categories_updated", handleCategoryUpdate);
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "viascent_categories_updated") {
        fetchLiveCategories();
      }
    };
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("viascent_categories_updated", handleCategoryUpdate);
      window.removeEventListener("storage", handleStorage);
    };
  }, [fetchLiveCategories]);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), source: "footer" }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatus("success");
        setMessage("Welcome to the VIA Scent Privilege Club. Your confirmation has been sent.");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error || "Subscription failed. Please verify your email.");
      }
    } catch {
      setStatus("error");
      setMessage("Unable to connect. Please try again later.");
    }
  };

  return (
    <footer className="bg-[#121110] text-[#EFEAE1] pt-16 pb-12 border-t border-[#26221D] relative z-10 overflow-hidden">
      {/* Decorative ambient subtle background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-radial from-[#B49A70]/10 to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Top Section: Privilege Club & Olfactory Newsletter */}
        <div className="pb-14 border-b border-[#26221D]">
          <div className="bg-gradient-to-r from-[#1B1916] via-[#201D19] to-[#1B1916] border border-[#312B24] rounded-sm p-6 sm:p-10 flex flex-col lg:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden">
            <div className="space-y-2 text-center lg:text-left max-w-xl">
              <span className="text-[10px] font-semibold tracking-[0.25em] uppercase text-[#B49A70] flex items-center justify-center lg:justify-start gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#B49A70]" />
                The Scent Privilege Club
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl text-[#F8F6F1] font-normal tracking-tight">
                Subscribe to our newsletter
              </h3>
              <p className="text-xs sm:text-sm text-[#A8A196] font-light leading-relaxed">
                Receive private invitations to seasonal fragrance releases, bespoke architectural scent consultations, and exclusive franchise editions in Sri Lanka.
              </p>
            </div>

            <div className="w-full lg:w-auto max-w-md">
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1">
                  <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-[#8A8275]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address..."
                    required
                    aria-label="Email address for scent newsletter"
                    className="w-full pl-10 pr-4 py-3 text-xs bg-[#121110] border border-[#3A332B] rounded-sm focus:outline-none focus:border-[#B49A70] text-[#F8F6F1] placeholder-[#736B60] transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="px-6 py-3 bg-[#B49A70] hover:bg-[#C5AA7F] text-[#121110] text-xs font-semibold tracking-[0.18em] uppercase rounded-sm transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer disabled:opacity-50"
                >
                  {status === "loading" ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Subscribing...</span>
                    </>
                  ) : (
                    <>
                      <span>Subscribe</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>

              {message && (
                <div
                  className={`mt-2.5 text-xs flex items-center gap-1.5 ${
                    status === "success" ? "text-emerald-400" : "text-amber-400"
                  }`}
                >
                  {status === "success" && <Check className="w-3.5 h-3.5 shrink-0" />}
                  <span>{message}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main 4-Column Navigation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12 py-16 border-b border-[#26221D]">
          {/* Column 1: Brand Identity & Boutique Concierge (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <Link href="/" className="inline-block group py-1">
                <div className="relative h-12 w-48 sm:h-14 sm:w-56 transition-transform duration-200 group-hover:scale-[1.02]">
                  <Image
                    src="/images/via-scent-logo-white.png"
                    alt="VIA SCENT Sri Lanka - Fragrances • Aroma • Lifestyle"
                    fill
                    unoptimized
                    className="object-contain object-left"
                    sizes="(max-width: 640px) 192px, 224px"
                  />
                </div>
              </Link>
              <div className="flex items-center gap-2 text-[10px] text-[#B49A70] tracking-[0.2em] font-medium uppercase mt-2.5">
                <ShieldCheck className="w-4 h-4 text-[#B49A70] shrink-0" />
                <span>{BRAND_CONFIG.franchiseStatement}</span>
              </div>
            </div>

            <p className="text-[#A8A196] text-xs leading-relaxed max-w-md font-light">
              Official Sri Lankan franchise partner offering certified Dr. Scent cold-air diffusion instruments, pure fragrance oils, and architectural scent installations across residential spaces, private villas, and commercial properties.
            </p>

            {/* Concierge Contact Details */}
            <div className="space-y-3 text-xs text-[#C5BEB3] font-light">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#B49A70] shrink-0 mt-0.5" />
                <span className="leading-relaxed">{BRAND_CONFIG.contact.address}</span>
              </div>
              <div className="flex flex-wrap items-center gap-y-2 gap-x-6">
                <a
                  href={`tel:${BRAND_CONFIG.contact.phone.replace(/\s+/g, "")}`}
                  className="flex items-center gap-2 hover:text-[#B49A70] transition-colors"
                >
                  <Phone className="w-4 h-4 text-[#B49A70] shrink-0" />
                  <span>{BRAND_CONFIG.contact.phone}</span>
                </a>
                <a
                  href={`https://wa.me/${BRAND_CONFIG.contact.whatsapp.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-[#B49A70] transition-colors text-emerald-400/90"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>WhatsApp Concierge</span>
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#B49A70] shrink-0" />
                <a
                  href={`mailto:${BRAND_CONFIG.contact.email}`}
                  className="hover:text-[#B49A70] transition-colors"
                >
                  {BRAND_CONFIG.contact.email}
                </a>
              </div>
              <div className="flex items-start gap-3 pt-1 text-[11px] text-[#8A8275]">
                <Clock className="w-4 h-4 text-[#B49A70] shrink-0 mt-0.5" />
                <span>Showroom: {BRAND_CONFIG.contact.hours}</span>
              </div>
            </div>

            {/* Social Network Presence */}
            <div className="pt-2 flex items-center gap-3">
              <span className="text-[10px] tracking-[0.2em] uppercase text-[#8A8275]">Follow VIA Scent:</span>
              <a
                href={BRAND_CONFIG.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-[#1F1C18] border border-[#2D2821] flex items-center justify-center text-[#A8A196] hover:text-[#B49A70] hover:border-[#B49A70] transition-colors"
                aria-label="VIA Scent Instagram"
              >
                <InstagramIcon className="w-3.5 h-3.5" />
              </a>
              <a
                href={BRAND_CONFIG.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-[#1F1C18] border border-[#2D2821] flex items-center justify-center text-[#A8A196] hover:text-[#B49A70] hover:border-[#B49A70] transition-colors"
                aria-label="VIA Scent Facebook"
              >
                <FacebookIcon className="w-3.5 h-3.5" />
              </a>
              <a
                href={BRAND_CONFIG.social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-[#1F1C18] border border-[#2D2821] flex items-center justify-center text-[#A8A196] hover:text-[#B49A70] hover:border-[#B49A70] transition-colors"
                aria-label="VIA Scent LinkedIn"
              >
                <LinkedinIcon className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Column 2: Curated Collections (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-[10px] font-semibold tracking-[0.25em] uppercase text-[#B49A70]">
              Collections
            </h3>
            <ul className="space-y-2.5 text-xs text-[#A8A196] font-light">
              {categories.length > 0 ? (
                categories.map((cat) => {
                  let href = cat.href;
                  if (!href) {
                    const slug = cat.slug || cat.id;
                    if (slug === "bestsellers" || slug === "best-sellers") {
                      href = "/shop?category=bestsellers";
                    } else if (slug === "business-scenting" || slug === "commercial-scenting") {
                      href = "/business-scenting";
                    } else {
                      href = `/shop/${slug}`;
                    }
                  }

                  return (
                    <li key={cat.id || cat.slug}>
                      <Link href={href} className="hover:text-[#F8F6F1] transition-colors">
                        {cat.name}
                      </Link>
                    </li>
                  );
                })
              ) : (
                <>
                  <li>
                    <Link href="/shop/fragrance-oils" className="hover:text-[#F8F6F1] transition-colors">
                      Aroma Oils
                    </Link>
                  </li>
                  <li>
                    <Link href="/shop/aroma-diffusers" className="hover:text-[#F8F6F1] transition-colors">
                      Cold-Air Diffusers
                    </Link>
                  </li>
                  <li>
                    <Link href="/shop?category=bestsellers" className="hover:text-[#F8F6F1] transition-colors">
                      Best Sellers
                    </Link>
                  </li>
                  <li>
                    <Link href="/shop/sprays" className="hover:text-[#F8F6F1] transition-colors">
                      Ambient Sprays
                    </Link>
                  </li>
                  <li>
                    <Link href="/shop/candles" className="hover:text-[#F8F6F1] transition-colors">
                      Artisanal Candles
                    </Link>
                  </li>
                </>
              )}
              <li className="pt-2">
                <Link
                  href="/shop"
                  className="hover:text-[#B49A70] transition-colors font-medium text-[#F8F6F1] flex items-center gap-1.5"
                >
                  <span>Explore All Fragrances</span>
                  <ArrowRight className="w-3 h-3 text-[#B49A70]" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Client Care & B2B (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-[10px] font-semibold tracking-[0.25em] uppercase text-[#B49A70]">
              Client Care & B2B
            </h3>
            <ul className="space-y-2.5 text-xs text-[#A8A196] font-light">
              <li>
                <Link href="/business-scenting" className="hover:text-[#F8F6F1] transition-colors">
                  Business Scent Architecture
                </Link>
              </li>
              <li>
                <Link
                  href="/business-scenting/request-quote"
                  className="hover:text-[#B49A70] transition-colors text-[#B49A70] font-medium"
                >
                  Request Commercial Quote
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-[#F8F6F1] transition-colors">
                  Islandwide Delivery Info
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-[#F8F6F1] transition-colors">
                  Warranty & Returns Policy
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#F8F6F1] transition-colors">
                  About VIA Scent Franchise
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#F8F6F1] transition-colors">
                  Colombo Showroom Concierge
                </Link>
              </li>
              <li>
                <Link href="/warranty" className="hover:text-[#F8F6F1] transition-colors">
                  Warranty Registration
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Franchise Authenticity Card & Security (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="text-[10px] font-semibold tracking-[0.25em] uppercase text-[#B49A70]">
              Franchise Authenticity
            </h3>
            <div className="p-5 bg-gradient-to-b from-[#1C1916] to-[#151412] border border-[#2D2821] rounded-sm space-y-3.5 shadow-lg">
              <div className="flex items-center gap-2 text-[#F8F6F1] text-xs font-serif">
                <Sparkles className="w-3.5 h-3.5 text-[#B49A70]" />
                <span className="font-medium tracking-wide">Dr. Scent Sri Lanka</span>
              </div>
              <p className="text-[11px] text-[#A8A196] leading-relaxed font-light">
                All cold-air diffusers and pure fragrance oils supplied by VIA Scent originate through authorized international franchise channels with serialized authenticity.
              </p>
              <div className="space-y-1.5 pt-2 border-t border-[#2A251F] text-[10px] text-[#B49A70]">
                <div className="flex items-center gap-1.5">
                  <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span>100% Certified Genuine Franchise Supply</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span>IFRA Standard Certified Fragrance Oils</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span>Official 6-Month Franchise Warranty</span>
                </div>
              </div>
            </div>

            {/* Payment & Security Trust Seals */}
            <div className="pt-2">
              <span className="text-[9px] font-medium tracking-[0.2em] uppercase text-[#736B60] block mb-2">
                Accepted Payment Methods:
              </span>
              <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-[#A8A196]">
                <span className="px-2 py-1 bg-[#1C1A17] border border-[#2D2924] rounded-xs">Visa</span>
                <span className="px-2 py-1 bg-[#1C1A17] border border-[#2D2924] rounded-xs">Mastercard</span>
                <span className="px-2 py-1 bg-[#1C1A17] border border-[#2D2924] rounded-xs">AMEX</span>
                <span className="px-2 py-1 bg-[#1C1A17] border border-[#2D2924] rounded-xs">Koko (BNPL)</span>
                <span className="px-2 py-1 bg-[#1C1A17] border border-[#2D2924] rounded-xs">Mintpay</span>
                <span className="px-2 py-1 bg-[#1C1A17] border border-[#2D2924] rounded-xs">Cash on Delivery</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Legal, Policies, Currency & Copyright */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-5 text-xs text-[#8A8275] font-light">
          <div className="space-y-1 text-center md:text-left">
            <p>
              © 2026 {BRAND_CONFIG.brandName}. All rights reserved. Authorized Franchisee Partner for Dr. Scent in Sri Lanka.
            </p>
            <p className="text-[10px] text-[#716B61] leading-relaxed">
              {BRAND_CONFIG.disclaimer} All transactions processed in Sri Lankan Rupees ({BRAND_CONFIG.currency.code}).
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-end gap-x-5 gap-y-2 text-[11px]">
            <Link href="/privacy" className="hover:text-[#F8F6F1] transition-colors">
              Privacy Notice
            </Link>
            <Link href="/terms" className="hover:text-[#F8F6F1] transition-colors">
              Terms of Service
            </Link>
            <Link href="/shipping" className="hover:text-[#F8F6F1] transition-colors">
              Shipping & Delivery
            </Link>
            <Link href="/returns" className="hover:text-[#F8F6F1] transition-colors">
              Returns & Refunds
            </Link>
            <Link href="/contact" className="hover:text-[#F8F6F1] transition-colors">
              Concierge Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
