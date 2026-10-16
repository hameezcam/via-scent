"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, Mail, Phone, MapPin, Sparkles } from "lucide-react";
import { BRAND_CONFIG } from "@/config/brand.config";

export function Footer() {
  return (
    <footer className="bg-[var(--near-black)] text-[var(--ivory)] pt-20 pb-12 border-t border-[var(--warm-stone)]/20 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 pb-16 border-b border-[var(--warm-stone)]/20">
          {/* Col 1 & 2: Brand Identity & Franchise Disclosure */}
          <div className="lg:col-span-2 space-y-5">
            <div>
              <span className="font-serif text-2xl tracking-[0.25em] font-normal text-[var(--porcelain)] block">
                {BRAND_CONFIG.brandName}
              </span>
              <span className="inline-flex items-center gap-1.5 text-[10px] text-[var(--champagne)] tracking-[0.2em] font-medium uppercase mt-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[var(--champagne)]" />
                {BRAND_CONFIG.franchiseStatement}
              </span>
            </div>

            <p className="text-[var(--warm-stone)]/80 text-xs leading-relaxed max-w-sm font-light">
              Official Sri Lankan franchise partner offering certified Dr. Scent cold-air diffusion instruments, pure fragrance oils, and architectural scent installations across residential spaces, private villas, and commercial properties.
            </p>

            <div className="pt-2 space-y-2.5 text-xs text-[var(--warm-stone)]/90 font-light">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[var(--champagne)] shrink-0 mt-0.5" />
                <span>{BRAND_CONFIG.contact.address}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[var(--champagne)] shrink-0" />
                <span>{BRAND_CONFIG.contact.phone}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[var(--champagne)] shrink-0" />
                <span>{BRAND_CONFIG.contact.email}</span>
              </div>
            </div>
          </div>

          {/* Col 3: Fragrance Catalogue */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-medium tracking-[0.25em] uppercase text-[var(--champagne)]">
              Collections
            </h3>
            <ul className="space-y-2.5 text-xs text-[var(--warm-stone)]/80 font-light">
              <li>
                <Link href="/shop/aroma-diffusers" className="hover:text-[var(--porcelain)] transition-colors">
                  Aroma Diffusers
                </Link>
              </li>
              <li>
                <Link href="/shop/fragrance-oils" className="hover:text-[var(--porcelain)] transition-colors">
                  Fragrance Oils
                </Link>
              </li>
              <li>
                <Link href="/shop/commercial-scenting" className="hover:text-[var(--porcelain)] transition-colors">
                  Commercial Scenting
                </Link>
              </li>
              <li>
                <Link href="/shop/home-fragrance" className="hover:text-[var(--porcelain)] transition-colors">
                  Home Fragrance
                </Link>
              </li>
              <li>
                <Link href="/shop/gift-collections" className="hover:text-[var(--porcelain)] transition-colors">
                  Gift Collections
                </Link>
              </li>
              <li className="pt-1">
                <Link href="/shop" className="hover:text-[var(--champagne)] transition-colors font-medium text-[var(--porcelain)] flex items-center gap-1.5">
                  <span>View All Instruments</span>
                  <span aria-hidden="true">→</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Commercial & Service Support */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-medium tracking-[0.25em] uppercase text-[var(--champagne)]">
              Client Care & B2B
            </h3>
            <ul className="space-y-2.5 text-xs text-[var(--warm-stone)]/80 font-light">
              <li>
                <Link href="/business-scenting" className="hover:text-[var(--porcelain)] transition-colors">
                  Business Scent Architecture
                </Link>
              </li>
              <li>
                <Link href="/business-scenting/request-quote" className="hover:text-[var(--champagne)] transition-colors text-[var(--champagne)]">
                  Request Commercial Quote
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-[var(--porcelain)] transition-colors">
                  Islandwide Delivery Information
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-[var(--porcelain)] transition-colors">
                  Warranty & Returns Policy
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[var(--porcelain)] transition-colors">
                  About VIA Scent & Franchise
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[var(--porcelain)] transition-colors">
                  Colombo Showroom Concierge
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Franchise Verification */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-medium tracking-[0.25em] uppercase text-[var(--champagne)]">
              Franchise Authenticity
            </h3>
            <div className="p-4 bg-[var(--deep-espresso)]/60 border border-[var(--warm-stone)]/20 rounded-sm space-y-3">
              <div className="flex items-center gap-2 text-[var(--porcelain)] text-xs font-serif">
                <Sparkles className="w-3.5 h-3.5 text-[var(--champagne)]" />
                <span>Dr. Scent Sri Lanka</span>
              </div>
              <p className="text-[11px] text-[var(--warm-stone)]/80 leading-relaxed font-light">
                All diffusers and aroma solutions supplied by VIA Scent originate through official international franchise agreements with serial verification.
              </p>
              <div className="pt-1 border-t border-[var(--warm-stone)]/20 flex items-center justify-between text-[10px] text-[var(--champagne)] uppercase tracking-wider">
                <span>Certified Genuine</span>
                <span>IFRA Standard</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Legal, Policies, Currency, Copyright */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[var(--warm-stone)]/70 font-light">
          <div className="space-y-1 text-center md:text-left">
            <p>
              © 2026 {BRAND_CONFIG.brandName}. All rights reserved. Authorized Franchisee Partner for Dr. Scent in Sri Lanka.
            </p>
            <p className="text-[10px] text-[var(--warm-stone)]/50">
              {BRAND_CONFIG.disclaimer} All transactions processed in Sri Lankan Rupees ({BRAND_CONFIG.currency.code}).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-5 text-[11px]">
            <Link href="/privacy" className="hover:text-[var(--porcelain)] transition-colors">
              Privacy Notice
            </Link>
            <Link href="/terms" className="hover:text-[var(--porcelain)] transition-colors">
              Terms of Service
            </Link>
            <Link href="/shipping" className="hover:text-[var(--porcelain)] transition-colors">
              Shipping & Delivery
            </Link>
            <Link href="/returns" className="hover:text-[var(--porcelain)] transition-colors">
              Returns & Refunds
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
