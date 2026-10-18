"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Building2, ShieldCheck, ChevronDown } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { formatLKR } from "@/config/brand.config";
import { LUXURY_EASE } from "@/config/motion.config";
import { PRODUCTS } from "@/data/products";
import { Product } from "@/types/product";

interface HeroSectionProps {
  featuredProduct?: Product;
}

export function HeroSection({ featuredProduct }: HeroSectionProps) {
  const shouldReduceMotion = useReducedMotion();

  // Resolve verified featured instrument from catalogue
  const defaultProduct =
    PRODUCTS.find((p) => p.slug === "dr-scent-smart-tower-pro") ||
    PRODUCTS.find((p) => p.featured) ||
    PRODUCTS[0];

  const product = featuredProduct || defaultProduct;
  // Use approved high-resolution cold-air diffuser imagery
  const productImage = "/images/categories/aroma-diffusers.jpg";

  // Animation transition presets
  const heroTransition = {
    duration: shouldReduceMotion ? 0.01 : 0.8,
    ease: LUXURY_EASE,
  };

  return (
    <section className="relative min-h-[calc(100vh-6.5rem)] lg:min-h-[calc(100svh-6.5rem)] flex flex-col justify-between overflow-hidden bg-[#151412] text-[#F8F6F1]">
      {/* Background Architectural Interior Visual with Layered Overlays */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div
          initial={{ scale: shouldReduceMotion ? 1 : 1.06, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.44 }}
          transition={{ duration: shouldReduceMotion ? 0.01 : 1.3, ease: LUXURY_EASE }}
          className="relative w-full h-full"
        >
          <Image
            src="https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=2400&q=85"
            alt="Atmospheric luxury interior with warm ambient illumination and fragrance dispersal"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center filter brightness-[0.88] contrast-[1.04]"
          />
        </motion.div>

        {/* Layer 1: Left Dark Gradient for Crisp Headline Contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#151412] via-[#151412]/90 to-[#151412]/40 lg:to-transparent z-10" />

        {/* Layer 2: Vertical Ambient Gradients (Top & Bottom Smooth Transition) */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#151412] via-transparent to-[#151412]/60 z-10" />

        {/* Layer 3: Subtle Radial Vignette to Ground the Composition */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(21,20,18,0.2)_0%,rgba(21,20,18,0.92)_100%)] z-10" />

        {/* Layer 4: Ambient Micro-Grain Texture */}
        <div className="absolute inset-0 bg-dark-grain opacity-40 z-10" />
      </div>

      {/* Main Campaign Hero Content Container */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 w-full flex-1 flex flex-col justify-center pt-8 sm:pt-12 lg:pt-14 pb-8 sm:pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-14 items-center">
          
          {/* Left Column: Brand Eyebrow, Editorial Headline, Supporting Copy, and CTAs */}
          <div className="lg:col-span-7 xl:col-span-7 space-y-5 sm:space-y-6 text-left">
            
            {/* 1. Brand Label Pill */}
            <motion.div
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...heroTransition, delay: 0.1 }}
              className="inline-flex items-center gap-2 sm:gap-2.5 px-3.5 py-1.5 rounded-full bg-[#211C19]/85 border border-[#B49A70]/35 backdrop-blur-md text-[#B49A70] text-[10px] sm:text-[11px] font-semibold tracking-[0.22em] uppercase shadow-xs max-w-full"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#B49A70] shrink-0" />
              <span className="truncate">THE ART OF ATMOSPHERE</span>
              <span className="text-[#8A8275]">•</span>
              <span className="text-[#F2EDE4]/90 font-normal truncate">Dr. Scent Sri Lanka</span>
            </motion.div>

            {/* 2. Editorial Headline (Single H1 with fluid clamp typography & ample descender headroom) */}
            <motion.h1
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...heroTransition, delay: 0.25 }}
              className="font-serif text-[clamp(2.35rem,4.7vw,5.25rem)] text-[#FFFFFF] tracking-[-0.02em] leading-[1.04] sm:leading-[1.02] pb-1"
            >
              <span className="block font-normal">Make space</span>
              <span className="block font-serif italic font-normal text-[#B49A70] tracking-[-0.015em] pt-0.5 sm:pt-1">
                for the extraordinary.
              </span>
            </motion.h1>

            {/* 3. Narrative Supporting Statement */}
            <motion.p
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...heroTransition, delay: 0.45 }}
              className="text-[#D6CEC2] text-sm sm:text-base lg:text-[17px] max-w-xl font-normal leading-relaxed tracking-normal"
            >
              Discover considered fragrances and refined scenting experiences for the spaces you call your own.
            </motion.p>

            {/* 4. Action CTA Group */}
            <motion.div
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...heroTransition, delay: 0.6 }}
              className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 sm:gap-4"
            >
              {/* Primary CTA */}
              <Link
                href="/shop"
                className="group relative inline-flex items-center justify-center gap-3 px-7 sm:px-8 py-3.5 sm:py-4 bg-[#B49A70] hover:bg-[#C5AD83] active:bg-[#A38960] text-[#151412] text-xs font-bold tracking-[0.2em] uppercase rounded-[2px] transition-all duration-300 shadow-lg hover:shadow-[#B49A70]/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B49A70] focus-visible:ring-offset-2 focus-visible:ring-offset-[#151412] cursor-pointer"
              >
                <span>Explore the Collection</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>

              {/* Secondary CTA */}
              <Link
                href="/business-scenting"
                className="group inline-flex items-center justify-center gap-2.5 px-6 sm:px-7 py-3.5 sm:py-4 bg-[#211C19]/60 hover:bg-[#2A2420] border border-[#B49A70]/35 hover:border-[#B49A70] text-[#F8F6F1] hover:text-[#FFFFFF] text-xs font-semibold tracking-[0.18em] uppercase rounded-[2px] backdrop-blur-xs transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B49A70] focus-visible:ring-offset-2 focus-visible:ring-offset-[#151412] cursor-pointer"
              >
                <Building2 className="w-4 h-4 text-[#B49A70] group-hover:text-[#C5AD83] transition-colors" />
                <span>Discover Business Scenting</span>
              </Link>
            </motion.div>

            {/* 5. Mobile Featured Instrument Spotlight (Rendered below CTAs on mobile/tablet) */}
            <div className="block lg:hidden pt-4">
              <FeaturedProductCard product={product} productImage={productImage} isCompact />
            </div>

          </div>

          {/* Right Column: Desktop Spotlight Card */}
          <div className="lg:col-span-5 xl:col-span-5 hidden lg:flex justify-end items-center">
            <motion.div
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...heroTransition, delay: 0.65 }}
              className="w-full max-w-[340px] xl:max-w-[370px]"
            >
              <FeaturedProductCard product={product} productImage={productImage} />
            </motion.div>
          </div>

        </div>
      </div>

      {/* 9. Understated Feature Strip (Substantiated Factual Statements & Scroll Cue) */}
      <div className="relative z-20 border-t border-[#B49A70]/20 bg-[#151412]/80 backdrop-blur-xs py-4 px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          
          {/* Trio of Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-8 lg:gap-14 text-left w-full md:w-auto">
            <div>
              <span className="font-serif text-sm sm:text-base font-semibold text-[#FFFFFF] block tracking-tight">
                Sub-Micron
              </span>
              <span className="text-[10px] text-[#A49C90] uppercase tracking-[0.16em] block mt-0.5">
                Waterless Cold Atomization
              </span>
            </div>
            <div>
              <span className="font-serif text-sm sm:text-base font-semibold text-[#FFFFFF] block tracking-tight">
                IFRA Compliant
              </span>
              <span className="text-[10px] text-[#A49C90] uppercase tracking-[0.16em] block mt-0.5">
                Pure Fragrance Formulations
              </span>
            </div>
            <div>
              <span className="font-serif text-sm sm:text-base font-semibold text-[#FFFFFF] block tracking-tight">
                Official Franchisee
              </span>
              <span className="text-[10px] text-[#A49C90] uppercase tracking-[0.16em] block mt-0.5">
                Hardware Warranty & Care
              </span>
            </div>
          </div>

          {/* Scroll Navigation Cue */}
          <a
            href="#featured-categories"
            className="hidden md:inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-[#8A8275] hover:text-[#B49A70] transition-colors cursor-pointer group shrink-0"
            aria-label="Scroll to explore featured categories"
          >
            <span>Scroll to explore</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#B49A70] transition-transform duration-300 group-hover:translate-y-0.5" />
          </a>

        </div>
      </div>
    </section>
  );
}

/**
 * Curated Featured Instrument Card
 * Formats verified product data from the catalogue into an editorial spotlight.
 */
function FeaturedProductCard({
  product,
  productImage,
  isCompact = false,
}: {
  product: Product;
  productImage: string;
  isCompact?: boolean;
}) {
  return (
    <div className="group relative bg-[#1D1815]/90 border border-[#B49A70]/25 hover:border-[#B49A70]/40 rounded-xl p-4 sm:p-5 xl:p-6 backdrop-blur-md shadow-[0_20px_50px_-10px_rgba(0,0,0,0.65)] space-y-3.5 transition-all duration-500">
      
      {/* Product Image Display */}
      <div className={`relative ${isCompact ? "aspect-[16/9] sm:aspect-[4/3]" : "aspect-[4/3]"} rounded-lg overflow-hidden bg-[#151412] border border-[#B49A70]/15`}>
        <Image
          src={productImage}
          alt={product.name}
          fill
          sizes={isCompact ? "(max-width: 768px) 100vw, 360px" : "360px"}
          className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-[3px] text-[9px] font-bold uppercase tracking-[0.16em] bg-[#151412]/85 text-[#B49A70] backdrop-blur-xs border border-[#B49A70]/30 shadow-xs">
          Featured Instrument
        </div>
      </div>

      {/* Product Taxonomy & Editorial Copy */}
      <div className="space-y-1">
        <span className="text-[10px] tracking-[0.22em] uppercase font-semibold text-[#B49A70] block">
          Architectural Scenting
        </span>
        <h3 className="font-serif text-[17px] sm:text-lg font-medium text-[#FFFFFF] leading-snug group-hover:text-[#F8F6F1] transition-colors">
          {product.name}
        </h3>
        <p className="text-xs text-[#C5BEB3] leading-relaxed line-clamp-2">
          Bluetooth 5.0 scheduling with sub-micron cold atomization. Engineered for residences and upscale spaces.
        </p>
      </div>

      {/* Price & Direct Details Link */}
      <div className="pt-3 border-t border-[#B49A70]/20 flex items-center justify-between text-xs">
        <div>
          <span className="text-[9px] text-[#8A8275] uppercase tracking-[0.18em] block">Price</span>
          <span className="font-semibold text-sm sm:text-[15px] text-[#F8F6F1]">
            LKR {Number(product.basePriceLKR || 68500).toLocaleString("en-LK")}
          </span>
        </div>
        
        <Link
          href={`/products/${product.slug}`}
          className="group/link inline-flex items-center gap-1.5 text-[#B49A70] hover:text-[#CBB694] font-semibold text-[11px] tracking-[0.16em] uppercase transition-colors"
        >
          <span>Explore Details</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover/link:translate-x-1" />
        </Link>
      </div>

    </div>
  );
}
