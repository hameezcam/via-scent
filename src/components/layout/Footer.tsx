"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, Mail, Phone, MapPin, Sparkles } from "lucide-react";
import { BRAND_CONFIG } from "@/config/brand.config";

export function Footer() {
  return (
    <footer className="bg-[#151412] text-[#EFEAE1] pt-20 pb-12 border-t border-[#2A2622] relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 pb-16 border-b border-[#2A2622]">
          {/* Col 1 & 2: Brand Identity & Franchise Disclosure */}
          <div className="lg:col-span-2 space-y-5">
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
              <span className="flex items-center gap-1.5 text-[10px] text-[#B49A70] tracking-[0.2em] font-medium uppercase mt-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#B49A70]" />
                {BRAND_CONFIG.franchiseStatement}
              </span>
            </div>

            <p className="text-[#A8A196] text-xs leading-relaxed max-w-sm font-light">
              Official Sri Lankan franchise partner offering certified Dr. Scent cold-air diffusion instruments, pure fragrance oils, and architectural scent installations across residential spaces, private villas, and commercial properties.
            </p>

            <div className="pt-2 space-y-2.5 text-xs text-[#C5BEB3] font-light">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#B49A70] shrink-0 mt-0.5" />
                <span>{BRAND_CONFIG.contact.address}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#B49A70] shrink-0" />
                <span>{BRAND_CONFIG.contact.phone}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#B49A70] shrink-0" />
                <span>{BRAND_CONFIG.contact.email}</span>
              </div>
            </div>
          </div>

          {/* Col 3: Fragrance Catalogue */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-medium tracking-[0.25em] uppercase text-[#B49A70]">
              Collections
            </h3>
            <ul className="space-y-2.5 text-xs text-[#A8A196] font-light">
              <li>
                <Link href="/shop/aroma-diffusers" className="hover:text-[#F8F6F1] transition-colors">
                  Aroma Diffusers
                </Link>
              </li>
              <li>
                <Link href="/shop/fragrance-oils" className="hover:text-[#F8F6F1] transition-colors">
                  Fragrance Oils
                </Link>
              </li>
              <li>
                <Link href="/business-scenting" className="hover:text-[#F8F6F1] transition-colors">
                  Commercial Scenting
                </Link>
              </li>
              <li>
                <Link href="/home-fragrance" className="hover:text-[#F8F6F1] transition-colors">
                  Home Fragrance
                </Link>
              </li>
              <li>
                <Link href="/shop/gift-collections" className="hover:text-[#F8F6F1] transition-colors">
                  Gift Collections
                </Link>
              </li>
              <li className="pt-1">
                <Link href="/shop" className="hover:text-[#B49A70] transition-colors font-medium text-[#F8F6F1] flex items-center gap-1.5">
                  <span>View All Instruments</span>
                  <span aria-hidden="true">→</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Commercial & Service Support */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-medium tracking-[0.25em] uppercase text-[#B49A70]">
              Client Care & B2B
            </h3>
            <ul className="space-y-2.5 text-xs text-[#A8A196] font-light">
              <li>
                <Link href="/business-scenting" className="hover:text-[#F8F6F1] transition-colors">
                  Business Scent Architecture
                </Link>
              </li>
              <li>
                <Link href="/business-scenting/request-quote" className="hover:text-[#B49A70] transition-colors text-[#B49A70]">
                  Request Commercial Quote
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-[#F8F6F1] transition-colors">
                  Islandwide Delivery Information
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-[#F8F6F1] transition-colors">
                  Warranty & Returns Policy
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#F8F6F1] transition-colors">
                  About VIA Scent & Franchise
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#F8F6F1] transition-colors">
                  Colombo Showroom Concierge
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Franchise Verification */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-medium tracking-[0.25em] uppercase text-[#B49A70]">
              Franchise Authenticity
            </h3>
            <div className="p-4 bg-[#211C19]/80 border border-[#2A2622] rounded-sm space-y-3">
              <div className="flex items-center gap-2 text-[#F8F6F1] text-xs font-serif">
                <Sparkles className="w-3.5 h-3.5 text-[#B49A70]" />
                <span>Dr. Scent Sri Lanka</span>
              </div>
              <p className="text-[11px] text-[#A8A196] leading-relaxed font-light">
                All diffusers and aroma solutions supplied by VIA Scent originate through official international franchise agreements with serial verification.
              </p>
              <div className="pt-1 border-t border-[#2A2622] flex items-center justify-between text-[10px] text-[#B49A70] uppercase tracking-wider">
                <span>Certified Genuine</span>
                <span>IFRA Standard</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Legal, Policies, Currency, Copyright */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#8A8275] font-light">
          <div className="space-y-1 text-center md:text-left">
            <p>
              © 2026 {BRAND_CONFIG.brandName}. All rights reserved. Authorized Franchisee Partner for Dr. Scent in Sri Lanka.
            </p>
            <p className="text-[10px] text-[#716B61]">
              {BRAND_CONFIG.disclaimer} All transactions processed in Sri Lankan Rupees ({BRAND_CONFIG.currency.code}).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-5 text-[11px]">
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
          </div>
        </div>
      </div>
    </footer>
  );
}
