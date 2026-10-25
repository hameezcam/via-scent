"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { LUXURY_EASE } from "@/config/motion.config";

/**
 * Full-bleed editorial hero: one lifestyle image, one headline, one primary action.
 */
export function HeroSection() {
  const shouldReduceMotion = useReducedMotion();

  const heroTransition = {
    duration: shouldReduceMotion ? 0.01 : 0.8,
    ease: LUXURY_EASE,
  };

  return (
    <section className="relative h-[78svh] min-h-[520px] lg:h-[calc(100svh-6.5rem)] lg:max-h-[880px] overflow-hidden bg-[#151412] text-[#F8F6F1]">
      {/* Lifestyle image */}
      <motion.div
        initial={{ scale: shouldReduceMotion ? 1 : 1.04 }}
        animate={{ scale: 1 }}
        transition={{ duration: shouldReduceMotion ? 0.01 : 1.6, ease: LUXURY_EASE }}
        className="absolute inset-0"
      >
        <Image
          src="/images/home/luxury-villa-lounge.jpg"
          alt="Sunlit lounge scented by a Dr. Scent cold-air diffuser"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[60%_center]"
        />
      </motion.div>

      {/* Gradient so the headline stays legible over a bright photo */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#151412]/85 via-[#151412]/25 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#151412]/45 via-transparent to-transparent" />

      <div className="relative z-10 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 flex flex-col justify-end pb-12 sm:pb-16 lg:pb-20">
        <motion.span
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...heroTransition, delay: 0.1 }}
          className="text-[10px] sm:text-[11px] tracking-[0.3em] uppercase text-[#E6D5B8] font-medium"
        >
          Dr. Scent · Sri Lanka
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...heroTransition, delay: 0.2 }}
          className="mt-3 font-serif text-[clamp(2.5rem,6vw,5.5rem)] leading-[1.02] tracking-[-0.02em] text-white max-w-3xl"
        >
          Make space <span className="italic text-[#E6D5B8]">for the extraordinary.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...heroTransition, delay: 0.35 }}
          className="mt-4 sm:mt-5 text-sm sm:text-base lg:text-lg text-[#EFE9DF] max-w-xl leading-relaxed"
        >
          Fragrance oils and silent, waterless diffusers that fill your home with scent, room by room.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...heroTransition, delay: 0.5 }}
          className="mt-7 sm:mt-8 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8"
        >
          <Link
            href="/shop"
            className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#F8F6F1] hover:bg-white text-[#151412] text-xs font-semibold tracking-[0.2em] uppercase rounded-[2px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E6D5B8] focus-visible:ring-offset-2 focus-visible:ring-offset-[#151412]"
          >
            <span>Shop the collection</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
          <Link
            href="/business-scenting"
            className="inline-flex items-center justify-center sm:justify-start gap-2 text-xs font-medium tracking-[0.18em] uppercase text-[#F8F6F1] underline underline-offset-[6px] decoration-[#E6D5B8]/60 hover:decoration-[#E6D5B8] transition-colors"
          >
            Scenting for business
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
