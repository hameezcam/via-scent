"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import { Product } from "@/types/product";
import { formatLKR } from "@/config/brand.config";
import { LUXURY_EASE } from "@/config/motion.config";

interface RecentlyAddedSectionProps {
  products: Product[];
}

export function RecentlyAddedSection({ products }: RecentlyAddedSectionProps) {
  // Display up to 4 recently added products
  const recentProducts = (products || []).slice(0, 4);

  if (recentProducts.length === 0) {
    return null;
  }

  return (
    <section className="py-16 sm:py-24 bg-[#FFFFFF] border-t border-[#E7E2D8] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading: RECENTLY ADDED PRODUCTS */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6, ease: LUXURY_EASE }}
          className="text-center mb-10 sm:mb-14"
        >
          <h2 className="font-sans font-bold text-xl sm:text-2xl lg:text-[26px] text-[#151412] tracking-[0.14em] uppercase">
            RECENTLY ADDED PRODUCTS
          </h2>
        </motion.div>

        {/* 4-Column Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-7">
          {recentProducts.map((product, idx) => {
            const hasDiscount =
              product.originalPriceLKR && product.originalPriceLKR > product.basePriceLKR;
            const discountPercent = hasDiscount
              ? Math.round(
                  ((product.originalPriceLKR! - product.basePriceLKR) /
                    product.originalPriceLKR!) *
                    100
                )
              : 0;

            const productImage =
              product.images?.[0] || "/images/categories/aroma-diffusers.jpg";

            return (
              <motion.div
                key={product.id || product.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.5, delay: idx * 0.08, ease: LUXURY_EASE }}
              >
                <Link
                  href={`/products/${product.slug}`}
                  className="group block bg-white border border-stone-200 transition-all duration-300 hover:border-stone-400 hover:shadow-lg h-full flex flex-col justify-between"
                >
                  {/* Square Image Box with Badges */}
                  <div className="relative aspect-square w-full overflow-hidden bg-stone-50">
                    <Image
                      src={productImage}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                    />

                    {/* Top Right Badges */}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10 pointer-events-none">
                      {product.isNew && (
                        <span className="px-2 py-0.5 border border-[#B49A70] bg-white/95 text-[#B49A70] text-[10.5px] font-semibold tracking-wider uppercase shadow-xs">
                          NEW
                        </span>
                      )}
                      {hasDiscount && discountPercent > 0 && (
                        <span className="px-2 py-0.5 border border-[#B49A70] bg-white/95 text-[#B49A70] text-[10.5px] font-semibold tracking-wider uppercase shadow-xs">
                          -{discountPercent}%
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Content Footer */}
                  <div className="p-4 sm:p-5 text-center flex-1 flex flex-col items-center justify-center border-t border-stone-100">
                    <h3 className="font-sans font-bold text-xs sm:text-[13px] text-[#151412] tracking-wider uppercase line-clamp-1 group-hover:text-[#B49A70] transition-colors w-full">
                      {product.name}
                    </h3>

                    {/* Price with VAT Included note */}
                    <div className="mt-2.5 flex flex-wrap items-baseline justify-center gap-1.5 text-xs sm:text-[13px] text-[#151412]">
                      <span className="font-semibold text-[#151412]">
                        {formatLKR(product.basePriceLKR)}
                      </span>
                      
                      <span className="text-[10px] text-stone-500 font-normal tracking-wide">
                        VAT Included
                      </span>

                      {hasDiscount && (
                        <span className="text-[11px] text-stone-400 line-through ml-1">
                          {formatLKR(product.originalPriceLKR!)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Centered VIEW ALL Button */}
        <div className="text-center mt-10 sm:mt-12">
          <Link
            href="/shop"
            className="inline-block border border-[#B49A70] text-[#8F764F] hover:bg-[#B49A70] hover:text-[#151412] text-xs font-semibold tracking-[0.2em] uppercase px-10 py-3 transition-colors duration-200 cursor-pointer shadow-xs"
          >
            VIEW ALL
          </Link>
        </div>

      </div>
    </section>
  );
}
