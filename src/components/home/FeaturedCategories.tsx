"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { CATEGORIES } from "@/data/products";
import { LUXURY_EASE } from "@/config/motion.config";

export function FeaturedCategories() {
  const featuredCategories = CATEGORIES.filter((c) => c.featuredInHome);

  return (
    <section className="py-20 sm:py-28 bg-[#FAF8F5] border-b border-[#E7E2D8] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Editorial Section Header */}
        <div className="max-w-2xl mb-14 text-left">
          <div className="inline-flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.24em] uppercase text-[#B49A70] mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#B49A70]" />
            <span>OLFACTORY ARCHITECTURE</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl font-normal text-[#151412] tracking-tight leading-[1.12]">
            Find your atmosphere.
          </h2>
          <p className="text-sm sm:text-base text-[#57534E] mt-3 font-normal leading-relaxed">
            From intimate residential sanctuaries to multi-zone luxury hospitality spaces, discover cold-air diffusion instruments and pure fragrance formulations engineered without water or heat.
          </p>
        </div>

        {/* Editorial Asymmetric Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {featuredCategories.map((cat, idx) => {
            const isWide = idx === 0;
            const isMedium = idx === 1 || idx === 2;
            const colSpan = isWide
              ? "md:col-span-8 aspect-[16/10] md:aspect-[16/9]"
              : isMedium
              ? "md:col-span-4 aspect-[4/5]"
              : "md:col-span-6 aspect-[16/10]";

            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.7, delay: idx * 0.08, ease: LUXURY_EASE }}
                className={colSpan}
              >
                <Link
                  href={`/shop/${cat.id}`}
                  className="group relative block w-full h-full rounded-2xl overflow-hidden border border-[#E7E2D8] hover:border-[#B49A70]/80 shadow-xs hover:shadow-xl transition-all duration-500 bg-[#151412]"
                >
                  {/* Category Atmospheric Image */}
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out brightness-[0.82] group-hover:brightness-[0.9]"
                  />

                  {/* Gradient Scrim */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#151412]/90 via-[#151412]/40 to-transparent group-hover:from-[#151412]/95 transition-colors" />

                  {/* Content Container */}
                  <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-end text-[#F8F6F1] z-10">
                    <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#B49A70] block mb-1">
                      {cat.tagline}
                    </span>
                    <h3 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight flex items-center justify-between">
                      <span>{cat.name}</span>
                      <span className="w-9 h-9 rounded-full bg-white/10 group-hover:bg-[#B49A70] text-[#FFFFFF] group-hover:text-[#151412] backdrop-blur-xs flex items-center justify-center transition-all duration-300 group-hover:translate-x-1">
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </h3>
                    <p className="text-xs sm:text-sm text-[#D8D0C4] line-clamp-2 max-w-md mt-2 leading-relaxed opacity-90 group-hover:opacity-100 transition-opacity">
                      {cat.description}
                    </p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Route Link */}
        <div className="mt-12 text-center">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-semibold text-[#151412] hover:text-[#B49A70] transition-colors pb-1 border-b border-[#151412]/30 hover:border-[#B49A70]"
          >
            <span>Explore All Fragrance Creations & Instruments</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>
    </section>
  );
}
