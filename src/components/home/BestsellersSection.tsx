"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { Product } from "@/types/product";
import { ProductGrid } from "@/components/product/ProductGrid";
import { LUXURY_EASE } from "@/config/motion.config";

interface BestsellersSectionProps {
  products: Product[];
}

export function BestsellersSection({ products }: BestsellersSectionProps) {
  return (
    <section className="py-20 sm:py-28 bg-[#FFFFFF] border-b border-[#E7E2D8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.7, ease: LUXURY_EASE }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6"
        >
          <div className="max-w-2xl text-left">
            <div className="inline-flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.24em] uppercase text-[#B49A70] mb-3">
              <Sparkles className="w-3.5 h-3.5 text-[#B49A70]" />
              <span>CONSIDERED ESSENTIALS</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl font-normal text-[#151412] tracking-tight leading-[1.12]">
              Signature instruments & olfactive formulations.
            </h2>
            <p className="text-sm sm:text-base text-[#57534E] mt-3 font-normal leading-relaxed">
              Every instrument uses waterless sub-micron nebulization to disperse pure fragrance oil with architectural uniformity, leaving zero residue on furniture or fabrics.
            </p>
          </div>

          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-semibold text-[#151412] hover:text-[#B49A70] transition-colors pb-1 border-b border-[#151412]/30 hover:border-[#B49A70] shrink-0 self-start md:self-end"
          >
            <span>Explore All Fragrances</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </motion.div>

        {/* Product Merchandising Grid */}
        <ProductGrid products={products} columns={4} />

      </div>
    </section>
  );
}
