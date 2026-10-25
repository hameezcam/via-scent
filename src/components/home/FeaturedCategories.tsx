"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { LUXURY_EASE } from "@/config/motion.config";

import { Category } from "@/types/category";

interface SubCategoryPill {
  label: string;
  href: string;
}

interface CollectionCard {
  id: string;
  name: string;
  tagline: string;
  description: string;
  image: string;
  href: string;
  subItems: SubCategoryPill[];
  colSpan: string;
}

interface FeaturedCategoriesProps {
  initialCategories?: Category[];
}

const FEATURED_COLLECTIONS: CollectionCard[] = [
  {
    id: "aroma-oil",
    name: "Aroma Oil",
    tagline: "Pure Essential & Artisanal Perfume Blends",
    description:
      "IFRA-certified cold-air diffusion oils. Spanning Car Scent, Dr. Scent's Choice, F&B, Floral, Fresh, Fruity, Oriental, and Premium lines.",
    image: "/images/categories/fragrance-oils.jpg",
    href: "/shop/fragrance-oils",
    colSpan: "col-span-2 md:col-span-7 h-[230px] sm:h-[420px] lg:h-[460px]",
    subItems: [
      { label: "Car Scent", href: "/shop/fragrance-oils?sub=car-scent" },
      { label: "Dr. Scent's Choice", href: "/shop/fragrance-oils?sub=choice" },
      { label: "F&B", href: "/shop/fragrance-oils?sub=fb" },
      { label: "Floral", href: "/shop/fragrance-oils?sub=floral" },
      { label: "Fresh", href: "/shop/fragrance-oils?sub=fresh" },
      { label: "Fruity", href: "/shop/fragrance-oils?sub=fruity" },
      { label: "Oriental", href: "/shop/fragrance-oils?sub=oriental" },
      { label: "Premium Collection", href: "/shop/fragrance-oils?sub=premium" },
    ],
  },
  {
    id: "diffusers",
    name: "Diffuser",
    tagline: "Cold-Air Micro-Nebulization Technology",
    description:
      "Waterless, heatless cold-air diffusers engineered to atomize pure fragrance oil into an invisible, residue-free ambient mist.",
    image: "/images/categories/aroma-diffusers.jpg",
    href: "/shop/aroma-diffusers",
    colSpan: "md:col-span-5 h-[230px] sm:h-[420px] lg:h-[460px]",
    subItems: [
      { label: "Diffuser", href: "/shop/aroma-diffusers?sub=diffuser" },
      { label: "Car Diffuser", href: "/shop/aroma-diffusers?sub=car-diffuser" },
      { label: "Dispenser", href: "/shop/aroma-diffusers?sub=dispenser" },
      { label: "Reed Diffuser", href: "/shop/aroma-diffusers?sub=reed-diffuser" },
    ],
  },
  {
    id: "best-sellers",
    name: "Best Sellers",
    tagline: "Iconic Signature Creations",
    description:
      "Our most celebrated cold-air diffusers, signature aroma oils, ambient sprays, reed diffusers, and luxury candles.",
    image: "/images/categories/bestsellers.jpg",
    href: "/shop?category=bestsellers",
    colSpan: "md:col-span-6 lg:col-span-4 h-[230px] sm:h-[420px] lg:h-[460px]",
    subItems: [
      { label: "Diffusers", href: "/shop?category=bestsellers&sub=diffusers" },
      { label: "Aroma Oils", href: "/shop?category=bestsellers&sub=aroma-oils" },
      { label: "Sprays", href: "/shop?category=bestsellers&sub=sprays" },
      { label: "Reed Diffusers", href: "/shop?category=bestsellers&sub=reed-diffusers" },
      { label: "Candles", href: "/shop?category=bestsellers&sub=candles" },
    ],
  },
  {
    id: "sprays",
    name: "Sprays",
    tagline: "Fine-Mist Ambient & Textile Scenting",
    description:
      "Instantaneous, residue-free sprays designed to refresh fine fabrics, linens, and living spaces with Dr. Scent fragrances.",
    image: "/images/categories/sprays.jpg",
    href: "/shop?category=sprays",
    colSpan: "md:col-span-6 lg:col-span-4 h-[230px] sm:h-[420px] lg:h-[460px]",
    subItems: [
      { label: "Fabric Spray", href: "/shop?category=sprays&sub=fabric-spray" },
      { label: "Odor Eliminator", href: "/shop?category=sprays&sub=odor-eliminator" },
      { label: "Aerosol", href: "/shop?category=sprays&sub=aerosol" },
    ],
  },
  {
    id: "candles",
    name: "Candles",
    tagline: "Hand-Poured Botanical & Soy Wax",
    description:
      "Artisanal scented candles crafted with pure soy and coconut wax, cotton wicks, and Dr. Scent fragrances for warm ambient illumination.",
    image: "/images/categories/candles.jpg",
    href: "/shop/candles",
    colSpan: "col-span-2 md:col-span-12 lg:col-span-4 h-[230px] sm:h-[420px] lg:h-[460px]",
    subItems: [
      { label: "Scented Candle", href: "/shop/candles?sub=scented-candle" },
      { label: "Soy Wax Candle", href: "/shop/candles?sub=soy-wax" },
      { label: "Luxury 3-Wick", href: "/shop/candles?sub=luxury-3-wick" },
    ],
  },
];

function getColSpan(idx: number, total: number): string {
  if (total === 1) return "col-span-2 md:col-span-12 h-[230px] sm:h-[420px] lg:h-[460px]";
  if (total === 2) return "md:col-span-6 h-[230px] sm:h-[420px] lg:h-[460px]";
  if (total === 5) {
    if (idx === 0) return "col-span-2 md:col-span-7 h-[230px] sm:h-[420px] lg:h-[460px]";
    if (idx === 1) return "md:col-span-5 h-[230px] sm:h-[420px] lg:h-[460px]";
    return "md:col-span-6 lg:col-span-4 h-[230px] sm:h-[420px] lg:h-[460px]";
  }
  const remaining = total - idx;
  if (idx % 3 === 0 && remaining === 1) return "col-span-2 md:col-span-12 h-[230px] sm:h-[420px] lg:h-[460px]";
  if (idx % 3 === 0 && remaining === 2) return "md:col-span-6 h-[230px] sm:h-[420px] lg:h-[460px]";
  if (idx % 3 === 1 && remaining === 1) return "md:col-span-6 h-[230px] sm:h-[420px] lg:h-[460px]";
  return "md:col-span-6 lg:col-span-4 h-[230px] sm:h-[420px] lg:h-[460px]";
}

export function FeaturedCategories({ initialCategories }: FeaturedCategoriesProps) {
  const dynamicCollections: CollectionCard[] =
    initialCategories && initialCategories.length > 0
      ? initialCategories.map((cat, idx) => ({
          id: cat.id,
          name: cat.name,
          tagline: cat.tagline || "Collection",
          description: cat.description || "",
          image: cat.image || "/images/categories/candles.jpg",
          href: cat.href || `/shop/${cat.slug}`,
          colSpan: getColSpan(idx, initialCategories.length),
          subItems:
            cat.subCategories && cat.subCategories.length > 0
              ? cat.subCategories.map((sub) => ({
                  label: sub.label,
                  href: `${cat.href || `/shop/${cat.slug}`}?sub=${sub.id}`,
                }))
              : [],
        }))
      : FEATURED_COLLECTIONS;

  return (
    <section id="featured-categories" className="py-14 sm:py-28 bg-[#FAF8F5] border-b border-[#E7E2D8] relative scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Editorial Section Header */}
        <div className="max-w-2xl mb-8 sm:mb-14 text-left">
          <div className="inline-flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.24em] uppercase text-[#B49A70] mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#B49A70]" />
            <span>Shop by category</span>
          </div>
          <h2 className="font-serif text-[2rem] sm:text-5xl font-normal text-[#151412] tracking-tight leading-[1.12]">
            Find your atmosphere.
          </h2>
          <p className="text-sm sm:text-base text-[#57534E] mt-3 font-normal leading-relaxed">
            Fragrance oils, diffusers, sprays and candles for every room, from a small apartment to a hotel lobby.
          </p>
        </div>

        {/* Editorial Balanced Asymmetric Grid */}
        <div className="grid grid-cols-2 md:grid-cols-12 gap-3 sm:gap-6">
          {dynamicCollections.map((col, idx) => {
            return (
              <motion.div
                key={col.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.7, delay: idx * 0.08, ease: LUXURY_EASE }}
                className={col.colSpan}
              >
                <div className="group relative w-full h-full rounded-2xl overflow-hidden border border-[#E7E2D8] hover:border-[#B49A70]/80 shadow-xs hover:shadow-2xl transition-all duration-500 bg-[#151412] flex flex-col justify-end">
                  {/* Category Atmospheric Image */}
                  <Image
                    src={col.image}
                    alt={col.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 60vw"
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out brightness-[0.78] group-hover:brightness-[0.88]"
                  />

                  {/* Gradient Scrim for Contrast & Readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#151412]/95 via-[#151412]/50 to-transparent group-hover:from-[#151412]/90 transition-colors duration-500 pointer-events-none" />

                  {/* Overlay Content */}
                  <div className="relative p-4 sm:p-8 flex flex-col justify-end text-[#F8F6F1] z-10">
                    <span className="hidden sm:block text-[10px] font-semibold tracking-[0.22em] uppercase text-[#B49A70] mb-1.5 drop-shadow-xs">
                      {col.tagline}
                    </span>

                    <div className="flex items-center justify-between gap-4">
                      <Link href={col.href} className="group-hover:text-[#F8F6F1]">
                        <h3 className="font-serif text-xl sm:text-3xl lg:text-4xl font-medium tracking-tight text-white transition-colors hover:text-[#B49A70]">
                          {col.name}
                        </h3>
                      </Link>

                      <Link
                        href={col.href}
                        className="hidden sm:flex w-10 h-10 shrink-0 rounded-full bg-white/15 backdrop-blur-sm group-hover:bg-[#B49A70] text-[#FFFFFF] group-hover:text-[#151412] items-center justify-center transition-all duration-300 group-hover:translate-x-1 group-hover:scale-105 shadow-sm"
                        aria-label={`Explore ${col.name}`}
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>

                    <p className="hidden sm:block text-sm text-[#D8D0C4] line-clamp-2 max-w-lg mt-2 leading-relaxed opacity-90">
                      {col.description}
                    </p>

                    {/* Sub-Collection Quick Filter Pills */}
                    <div className="hidden sm:flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-white/15">
                      {col.subItems.map((sub) => (
                        <Link
                          key={sub.label}
                          href={sub.href}
                          className="text-[10px] tracking-wide uppercase px-2.5 py-1 rounded-full bg-black/40 hover:bg-[#B49A70] text-[#EFEAE1] hover:text-[#151412] border border-white/15 hover:border-[#B49A70] backdrop-blur-xs transition-all duration-200"
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
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
            <span>Shop everything</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
