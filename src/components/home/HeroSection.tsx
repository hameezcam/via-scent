"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Building2, ShieldCheck, ChevronDown, Sparkles } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { BRAND_CONFIG } from "@/config/brand.config";
import { LUXURY_EASE } from "@/config/motion.config";

export function HeroSection() {
  const shouldReduceMotion = useReducedMotion();

  // Animation transition presets
  const heroTransition = {
    duration: shouldReduceMotion ? 0.01 : 0.9,
    ease: LUXURY_EASE,
  };

  return (
    <section className="relative min-h-[90vh] lg:min-h-[92vh] flex flex-col justify-between overflow-hidden bg-[#151412] text-[#F8F6F1]">
      {/* Background Campaign Visual with Controlled Parallax / Resolve */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <motion.div
          initial={{ scale: shouldReduceMotion ? 1 : 1.08, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.42 }}
          transition={{ duration: shouldReduceMotion ? 0.01 : 1.4, ease: LUXURY_EASE }}
          className="relative w-full h-full"
        >
          <Image
            src="https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=2400&q=85"
            alt="Atmospheric luxury interior with warm natural lighting and fragrance mist"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center filter brightness-[0.9] contrast-[1.05]"
          />
        </motion.div>

        {/* Ambient Vignette & Texture Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#151412] via-[#151412]/80 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#151412] via-transparent to-[#151412]/40 z-10" />
        <div className="absolute inset-0 bg-dark-grain opacity-60 z-10 pointer-events-none" />
      </div>

      {/* Main Campaign Hero Content */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-12 w-full flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Editorial Headline & Staged Reveal */}
          <div className="lg:col-span-8 space-y-6 text-left">
            {/* Eyebrow Label */}
            <motion.div
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...heroTransition, delay: 0.1 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#211C19]/80 border border-[#B49A70]/40 backdrop-blur-md text-[#B49A70] text-[10px] sm:text-[11px] font-semibold tracking-[0.24em] uppercase"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#B49A70]" />
              <span>THE ART OF ATMOSPHERE</span>
              <span className="text-[#8A8275]">•</span>
              <span className="text-[#EFEAE1]/90 font-normal">Dr. Scent Sri Lanka</span>
            </motion.div>

            {/* Masked Headline Lines */}
            <div className="space-y-1">
              <div className="overflow-hidden">
                <motion.h1
                  initial={{ y: shouldReduceMotion ? 0 : "105%", opacity: shouldReduceMotion ? 1 : 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ ...heroTransition, delay: 0.2 }}
                  className="font-serif text-4xl sm:text-6xl lg:text-7xl xl:text-8xl text-[#FFFFFF] tracking-[-0.02em] leading-[1.05]"
                >
                  Make space
                </motion.h1>
              </div>
              <div className="overflow-hidden">
                <motion.h1
                  initial={{ y: shouldReduceMotion ? 0 : "105%", opacity: shouldReduceMotion ? 1 : 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ ...heroTransition, delay: 0.35 }}
                  className="font-serif text-4xl sm:text-6xl lg:text-7xl xl:text-8xl tracking-[-0.02em] leading-[1.05] italic font-normal text-[#B49A70]"
                >
                  for the extraordinary.
                </motion.h1>
              </div>
            </div>

            {/* Narrative Supporting Statement */}
            <motion.p
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...heroTransition, delay: 0.5 }}
              className="text-[#D8D0C4] text-sm sm:text-base lg:text-lg max-w-xl font-normal leading-relaxed tracking-wide pt-1"
            >
              Discover considered fragrances and refined scenting experiences for the spaces you call your own.
            </motion.p>

            {/* Staged Call To Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...heroTransition, delay: 0.65 }}
              className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4"
            >
              <Link
                href="/shop"
                className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#B49A70] hover:bg-[#CBB694] text-[#151412] text-xs font-bold tracking-[0.2em] uppercase rounded transition-all duration-300 shadow-lg hover:shadow-[#B49A70]/20 cursor-pointer"
              >
                <span>Explore the Collection</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>

              <Link
                href="/business-scenting"
                className="inline-flex items-center justify-center gap-2.5 px-7 py-4 bg-[#211C19]/80 hover:bg-[#211C19] border border-[#B49A70]/30 hover:border-[#B49A70] text-[#EFEAE1] hover:text-[#FFFFFF] text-xs font-semibold tracking-[0.18em] uppercase rounded backdrop-blur-xs transition-all duration-300 cursor-pointer"
              >
                <Building2 className="w-4 h-4 text-[#B49A70]" />
                <span>Discover Business Scenting</span>
              </Link>
            </motion.div>
          </div>

          {/* Right Column: Instrumental Spotlight Card */}
          <div className="lg:col-span-4 hidden lg:block">
            <motion.div
              initial={{ opacity: 0, x: shouldReduceMotion ? 0 : 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ ...heroTransition, delay: 0.7 }}
              className="bg-[#211C19]/80 border border-[#B49A70]/30 rounded-2xl p-5 backdrop-blur-md shadow-2xl space-y-4 max-w-sm ml-auto"
            >
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-stone-900 border border-[#B49A70]/20">
                <Image
                  src="https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80"
                  alt="Dr. Scent Smart Aroma Tower Pro"
                  fill
                  sizes="320px"
                  className="object-cover hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-[#151412]/80 text-[#B49A70] backdrop-blur-xs border border-[#B49A70]/30">
                  Featured Instrument
                </div>
              </div>

              <div>
                <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-[#B49A70] block">
                  Architectural Scenting
                </span>
                <h3 className="font-serif text-base font-semibold text-[#FFFFFF] mt-0.5">
                  Dr. Scent Smart Aroma Tower Pro
                </h3>
                <p className="text-xs text-[#D8D0C4] mt-1 line-clamp-2 leading-relaxed">
                  Bluetooth 5.0 scheduling with sub-micron cold atomization. Engineered for residences and upscale retail.
                </p>
              </div>

              <div className="pt-2 border-t border-[#B49A70]/20 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-[#8A8275] uppercase tracking-wider block">Price</span>
                  <span className="font-semibold text-[#EFEAE1]">LKR 68,500</span>
                </div>
                <Link
                  href="/products/dr-scent-smart-tower-pro"
                  className="text-[#B49A70] hover:text-[#CBB694] font-semibold text-[11px] tracking-wider uppercase flex items-center gap-1"
                >
                  <span>Explore Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </motion.div>
          </div>

        </div>
      </div>

      {/* Understated Scroll Indicator & Metrics Bar */}
      <div className="relative z-20 border-t border-[#B49A70]/15 bg-[#151412]/60 backdrop-blur-xs py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          {/* Trio of Pillars */}
          <div className="grid grid-cols-3 gap-6 sm:gap-12 text-left">
            <div>
              <span className="font-serif text-sm sm:text-base font-semibold text-[#FFFFFF] block">
                Sub-Micron
              </span>
              <span className="text-[10px] text-[#8A8275] uppercase tracking-[0.16em] block">
                Waterless Atomization
              </span>
            </div>
            <div>
              <span className="font-serif text-sm sm:text-base font-semibold text-[#FFFFFF] block">
                100% Pure
              </span>
              <span className="text-[10px] text-[#8A8275] uppercase tracking-[0.16em] block">
                IFRA Safe Formulations
              </span>
            </div>
            <div>
              <span className="font-serif text-sm sm:text-base font-semibold text-[#FFFFFF] block">
                Islandwide
              </span>
              <span className="text-[10px] text-[#8A8275] uppercase tracking-[0.16em] block">
                Official Warranty & Care
              </span>
            </div>
          </div>

          {/* Understated Scroll Pulse Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="hidden md:flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-[#8A8275]"
          >
            <span>Scroll to explore</span>
            <motion.div
              animate={shouldReduceMotion ? {} : { y: [0, 4, 0] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
            >
              <ChevronDown className="w-3.5 h-3.5 text-[#B49A70]" />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
