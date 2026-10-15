import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { CATEGORIES } from "@/data/products";

export function FeaturedCategories() {
  const featuredCategories = CATEGORIES.filter((c) => c.featuredInHome);

  return (
    <section className="py-16 sm:py-24 bg-white border-b border-[#E7E2D8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-xs font-semibold tracking-widest uppercase text-amber-800 block mb-2">
              Fragrance Architecture
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal text-stone-900 tracking-tight">
              Curated Collections & Instruments
            </h2>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold text-stone-800 hover:text-amber-900 transition-colors group"
          >
            <span>View All Categories</span>
            <ArrowRight className="w-4 h-4 text-stone-400 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Category Tiles Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredCategories.map((cat, idx) => (
            <Link
              key={cat.id}
              href={`/shop/${cat.id}`}
              className={`group relative overflow-hidden rounded-lg bg-stone-100 border border-stone-200 aspect-[4/3] flex flex-col justify-end p-6 hover:shadow-xl transition-all duration-300 ${
                idx === 0 ? "sm:col-span-2 lg:col-span-2 aspect-[16/9]" : ""
              }`}
            >
              {/* Background Photo */}
              <Image
                src={cat.image}
                alt={cat.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out brightness-90 group-hover:brightness-95"
              />

              {/* Gradient Scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/30 to-transparent group-hover:from-stone-950/90 transition-colors" />

              {/* Text Overlay */}
              <div className="relative z-10 text-white space-y-1">
                <span className="text-[11px] font-medium tracking-widest uppercase text-amber-300 block">
                  {cat.tagline}
                </span>
                <h3 className="font-serif text-2xl font-medium tracking-wide flex items-center justify-between">
                  <span>{cat.name}</span>
                  <span className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center text-white group-hover:bg-amber-400 group-hover:text-stone-950 transition-colors">
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </h3>
                <p className="text-xs text-stone-300 line-clamp-1 opacity-90 max-w-md pt-0.5">
                  {cat.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
