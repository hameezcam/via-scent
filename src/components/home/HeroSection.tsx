import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles, Building2, ShieldCheck } from "lucide-react";
import { BRAND_CONFIG } from "@/config/brand.config";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#FAF8F5] border-b border-[#E7E2D8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Editorial Headline & Copy */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200/80 text-amber-950 text-xs font-medium tracking-wide">
              <ShieldCheck className="w-4 h-4 text-amber-700" />
              <span>{BRAND_CONFIG.franchiseStatement}</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-stone-900 leading-[1.12] tracking-tight">
              Elevating everyday spaces through the{" "}
              <span className="italic font-normal text-amber-900">
                subtle art of scent.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-stone-600 max-w-xl font-normal leading-relaxed">
              Experience cold-air micro-nebulization technology and artisanal fragrance formulations designed to transform Sri Lankan residences, boutique hotels, and executive workspaces into memorable sensory sanctuaries.
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-stone-900 text-amber-50 hover:bg-stone-800 text-xs font-semibold tracking-widest uppercase rounded shadow-sm transition-all"
              >
                <span>Shop Fragrances</span>
                <ArrowRight className="w-4 h-4 text-amber-300" />
              </Link>

              <Link
                href="/business-scenting"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white border border-stone-300 text-stone-800 hover:bg-stone-50 hover:border-stone-400 text-xs font-semibold tracking-widest uppercase rounded transition-all"
              >
                <Building2 className="w-4 h-4 text-amber-800" />
                <span>Explore Business Scenting</span>
              </Link>
            </div>

            {/* Micro Highlights */}
            <div className="pt-6 grid grid-cols-3 gap-4 border-t border-stone-200/80 text-left">
              <div>
                <span className="font-serif text-xl sm:text-2xl font-semibold text-stone-900 block">
                  Cold-Air
                </span>
                <span className="text-[11px] text-stone-500 uppercase tracking-wider block mt-0.5">
                  Micro-Nebulization
                </span>
              </div>
              <div>
                <span className="font-serif text-xl sm:text-2xl font-semibold text-stone-900 block">
                  100% Pure
                </span>
                <span className="text-[11px] text-stone-500 uppercase tracking-wider block mt-0.5">
                  Residue-Free Oils
                </span>
              </div>
              <div>
                <span className="font-serif text-xl sm:text-2xl font-semibold text-stone-900 block">
                  Islandwide
                </span>
                <span className="text-[11px] text-stone-500 uppercase tracking-wider block mt-0.5">
                  Delivery & Service
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto aspect-[4/5] max-w-md lg:max-w-none rounded-xl overflow-hidden shadow-2xl border border-stone-200/80 bg-stone-100">
              <Image
                src="https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=1200&q=85"
                alt="Luxury Dr. Scent aroma diffuser placed in an architectural living room"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/60 via-transparent to-transparent" />
              
              <div className="absolute bottom-5 left-5 right-5 p-4 rounded bg-white/95 backdrop-blur-md border border-stone-200/90 shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-amber-900 block">
                      Featured Instrument
                    </span>
                    <h3 className="font-serif text-sm font-semibold text-stone-900">
                      Dr. Scent Portable Ambient Diffuser
                    </h3>
                  </div>
                  <Link
                    href="/products/dr-scent-luxe-portable-diffuser"
                    className="p-2 rounded-full bg-stone-900 text-amber-200 hover:bg-stone-800 transition-colors"
                    aria-label="View featured diffuser details"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Decorative subtle ambient badge */}
            <div className="hidden sm:flex absolute -bottom-4 -left-6 bg-stone-900 text-amber-100 px-4 py-3 rounded-lg shadow-xl border border-amber-900/40 items-center gap-3">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <div>
                <span className="text-xs font-semibold block">Architectural Diffusion</span>
                <span className="text-[10px] text-stone-400 block">Zero heat • Zero water dilution</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
