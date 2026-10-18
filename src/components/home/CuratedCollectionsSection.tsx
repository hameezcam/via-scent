"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles, Compass, Check, Layers } from "lucide-react";
import { motion } from "motion/react";
import { LUXURY_EASE } from "@/config/motion.config";

interface DiscoveryProfile {
  id: string;
  name: string;
  family: string;
  notes: string[];
  idealSpace: string;
  coverage: string;
  tagline: string;
  image: string;
  productSlug: string;
}

const DISCOVERY_PROFILES: DiscoveryProfile[] = [
  {
    id: "morning-vitality",
    name: "Morning Vitality",
    family: "White Tea & Bergamot Thyme",
    notes: ["Italian Bergamot", "Mandarin Zest", "Silver Needle White Tea", "Morning Thyme"],
    idealSpace: "Sunlit Living Areas, Hotel Lobbies & Executive Boutiques",
    coverage: "Up to 1,200 sq.ft",
    tagline: "Ethereal, uplifting daylight serenity reminiscent of misty high-elevation tea estates.",
    image: "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1000&q=85",
    productSlug: "white-tea-and-thyme-botanical-oil",
  },
  {
    id: "evening-opulence",
    name: "Evening Opulence",
    family: "Royal Oud & Amber Noir",
    notes: ["Cardamom", "Smoked Agarwood", "Madagascan Vanilla", "Dark Musk"],
    idealSpace: "Grand Living Rooms, Private Libraries & Boardrooms",
    coverage: "Up to 1,500 sq.ft",
    tagline: "An opulent nocturnal sanctuary evoking ancient spice trade routes and warm cedar embers.",
    image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1000&q=85",
    productSlug: "ceylon-oud-and-smoky-amber-oil",
  },
  {
    id: "sanctuary-zen",
    name: "Sanctuary Zen",
    family: "Santal & Black Cardamom",
    notes: ["Black Cardamom", "Violet Leaf", "Australian Sandalwood", "Cashmere Wood"],
    idealSpace: "Master Suites, Private Wellness Spas & Executive Lounges",
    coverage: "Up to 800 sq.ft",
    tagline: "A meditative, grounding woody warmth crafted to quiet the mind and restore balance.",
    image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1000&q=85",
    productSlug: "santal-and-black-cardamom-oil",
  },
];

export function CuratedCollectionsSection() {
  const [selectedId, setSelectedId] = useState(DISCOVERY_PROFILES[0].id);
  const activeProfile = DISCOVERY_PROFILES.find((p) => p.id === selectedId) || DISCOVERY_PROFILES[0];

  return (
    <section className="py-24 sm:py-32 bg-[#FAF8F5] border-b border-[#E7E2D8] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFFFFF] border border-[#B49A70]/30 text-[#B49A70] text-[10px] font-semibold tracking-[0.24em] uppercase shadow-xs">
            <Compass className="w-3.5 h-3.5 text-[#B49A70]" />
            <span>OLFACTORY FINDER</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl font-normal text-[#151412] tracking-tight leading-[1.15]">
            Discover your spatial signature.
          </h2>
          <p className="text-sm sm:text-base text-[#57534E] leading-relaxed">
            Select an olfactive profile below to inspect how cold-air nebulization pairs note hierarchies with architectural dimensions.
          </p>
        </div>

        {/* Profile Selector Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
          {DISCOVERY_PROFILES.map((profile) => {
            const isSelected = profile.id === selectedId;
            return (
              <button
                key={profile.id}
                type="button"
                onClick={() => setSelectedId(profile.id)}
                className={`px-5 py-3 rounded-full text-xs font-semibold tracking-[0.16em] uppercase transition-all duration-300 cursor-pointer flex items-center gap-2 border ${
                  isSelected
                    ? "bg-[#151412] text-[#B49A70] border-[#151412] shadow-md"
                    : "bg-[#FFFFFF] text-[#211C19] border-[#E7E2D8] hover:border-[#B49A70]"
                }`}
              >
                <span>{profile.name}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-[#B49A70]" />}
              </button>
            );
          })}
        </div>

        {/* Dynamic Interactive Presentation Panel */}
        <motion.div
          key={activeProfile.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: LUXURY_EASE }}
          className="bg-[#FFFFFF] border border-[#E7E2D8] rounded-2xl overflow-hidden shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
        >
          {/* Visual Showcase */}
          <div className="lg:col-span-5 relative aspect-[4/3] lg:aspect-square w-full bg-stone-100 overflow-hidden">
            <Image
              src={activeProfile.image}
              alt={activeProfile.name}
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            <div className="absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#151412]/80 text-[#B49A70] backdrop-blur-xs border border-[#B49A70]/30">
              {activeProfile.family}
            </div>
          </div>

          {/* Detailed Olfactory Breakdown */}
          <div className="lg:col-span-7 p-6 sm:p-10 space-y-6 text-left">
            <div>
              <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-[#B49A70] block mb-1">
                Spatial Profile & Notes
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-[#151412]">
                {activeProfile.name}
              </h3>
              <p className="text-xs sm:text-sm text-[#57534E] leading-relaxed mt-2 max-w-xl">
                {activeProfile.tagline}
              </p>
            </div>

            {/* Note Pyramids */}
            <div className="space-y-3 pt-2">
              <span className="text-[10px] tracking-widest uppercase font-semibold text-[#8A8275] block">
                Olfactory Hierarchy
              </span>
              <div className="flex flex-wrap gap-2">
                {activeProfile.notes.map((note) => (
                  <span
                    key={note}
                    className="px-3 py-1.5 rounded-md bg-[#FAF8F5] border border-[#E7E2D8] text-xs font-medium text-[#151412]"
                  >
                    {note}
                  </span>
                ))}
              </div>
            </div>

            {/* Environmental Suitability */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-[#EFEAE1]">
              <div>
                <span className="text-[10px] text-[#8A8275] uppercase tracking-wider block">Recommended Setting</span>
                <span className="font-serif text-xs sm:text-sm font-semibold text-[#151412] mt-0.5 block">
                  {activeProfile.idealSpace}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#8A8275] uppercase tracking-wider block">Effective Coverage</span>
                <span className="font-serif text-xs sm:text-sm font-semibold text-[#151412] mt-0.5 block">
                  {activeProfile.coverage}
                </span>
              </div>
            </div>

            {/* Direct Action */}
            <div className="pt-2">
              <Link
                href={`/products/${activeProfile.productSlug}`}
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#151412] hover:bg-[#211C19] text-[#B49A70] text-xs font-semibold tracking-[0.2em] uppercase rounded transition-colors shadow-xs"
              >
                <span>View Product Formulation</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
