"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, X, Sparkles } from "lucide-react";
import { formatLKR } from "@/config/brand.config";
import { Product } from "@/types/product";

export interface RoomHotspot {
  id: string;
  slug: string;
  x: number; // percentage from left
  y: number; // percentage from top
  defaultName: string;
  defaultPriceLKR: number;
  defaultImage: string;
  categoryName: string;
  placement: "top-right" | "top-left" | "top" | "left" | "right";
}

const ROOM_HOTSPOTS: RoomHotspot[] = [
  {
    id: "hotspot-tower",
    slug: "dr-scent-smart-tower-pro",
    x: 22.07,
    y: 56.51,
    defaultName: "Standalone Scent Diffuser Machine – Sleek Design & German Nano Technology",
    defaultPriceLKR: 68500,
    defaultImage: "/images/categories/aroma-diffusers.jpg",
    categoryName: "Aroma Diffusers",
    placement: "top-right",
  },
  {
    id: "hotspot-portable",
    slug: "dr-scent-luxe-portable-diffuser",
    x: 30.08,
    y: 47.67,
    defaultName: "Dr. Scent Portable Ambient Diffuser & Pure Oil",
    defaultPriceLKR: 28500,
    defaultImage: "/images/categories/fragrance-oils.jpg",
    categoryName: "Aroma Oils",
    placement: "top-right",
  },
  {
    id: "hotspot-candle",
    slug: "dr-scent-hand-poured-artisanal-candle",
    x: 40.43,
    y: 64.42,
    defaultName: "Dr. Scent Hand-Poured Artisanal Soy Candle & Reed Set",
    defaultPriceLKR: 9500,
    defaultImage: "/images/categories/candles.jpg",
    categoryName: "Candles",
    placement: "top",
  },
  {
    id: "hotspot-spray",
    slug: "dr-scent-continuous-aerosol-spray",
    x: 71.48,
    y: 47.67,
    defaultName: "Dr. Scent Continuous Ambient Aerosol Mist",
    defaultPriceLKR: 7900,
    defaultImage: "/images/categories/sprays.jpg",
    categoryName: "Sprays",
    placement: "top-left",
  },
  {
    id: "hotspot-commercial",
    slug: "dr-scent-hvac-commercial-system-5000",
    x: 94.53,
    y: 62.09,
    defaultName: "Dr. Scent Compact Commercial Scent System 5000",
    defaultPriceLKR: 145000,
    defaultImage: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80",
    categoryName: "Commercial Scenting",
    placement: "left",
  },
];

interface InteractiveRoomSectionProps {
  products?: Product[];
}

export function InteractiveRoomSection({ products = [] }: InteractiveRoomSectionProps) {
  const router = useRouter();
  // Hotspot 1 active by default as shown in reference design
  const [activeHotspotId, setActiveHotspotId] = useState<string | null>("hotspot-tower");
  const containerRef = useRef<HTMLDivElement>(null);

  // Close popover if user clicks outside the interactive container
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setActiveHotspotId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Helper to resolve live product details if available in catalog
  const getProductDetails = (hotspot: RoomHotspot) => {
    const matched = products.find((p) => p.slug === hotspot.slug);
    return {
      name: matched?.name || hotspot.defaultName,
      priceLKR: matched?.basePriceLKR || hotspot.defaultPriceLKR,
      image: matched?.images?.[0] || hotspot.defaultImage,
      categoryName: matched?.categoryName || hotspot.categoryName,
      href: `/products/${hotspot.slug}`,
    };
  };

  return (
    <section className="bg-white border-t border-[#E7E2D8] relative overflow-hidden py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Screen Reader & SEO Heading */}
        <h2 className="sr-only">New Collection – Interactive Living Room Fragrance Hotspots</h2>

        {/* Interactive Room Canvas Container */}
        <div
          ref={containerRef}
          className="relative w-full rounded-sm overflow-hidden border border-[#E7E2D8] bg-[#F7F5F0] shadow-md select-none"
          style={{ aspectRatio: "1024 / 430" }}
        >
          {/* Base Living Room Scene */}
          <Image
            src="/images/home/interactive-room.png"
            alt="Dr. Scent Living Room Interactive Collection"
            fill
            priority
            unoptimized
            className="object-cover object-center"
            sizes="(max-width: 1280px) 100vw, 1280px"
          />

          {/* Interactive Hotspot Pins & Popovers */}
          {ROOM_HOTSPOTS.map((hotspot) => {
            const isActive = activeHotspotId === hotspot.id;
            const details = getProductDetails(hotspot);

            return (
              <div
                key={hotspot.id}
                className="absolute z-20"
                style={{
                  left: `${hotspot.x}%`,
                  top: `${hotspot.y}%`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                {/* Hotspot Button with Animated Beacon Ping */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveHotspotId(isActive ? null : hotspot.id);
                  }}
                  className="relative group p-2 focus:outline-none cursor-pointer flex items-center justify-center"
                  aria-label={`View ${details.name}`}
                  aria-expanded={isActive}
                >
                  {/* Subtle pulsing beacon */}
                  <span className="absolute w-7 h-7 rounded-full bg-white/50 animate-ping pointer-events-none" />

                  {/* Main Pin Disc (White ring with black center dot) */}
                  <span
                    className={`relative w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white shadow-lg border flex items-center justify-center transition-all duration-300 ${
                      isActive
                        ? "scale-115 border-black ring-4 ring-black/15 shadow-xl"
                        : "border-neutral-300 group-hover:scale-110 group-hover:border-black"
                    }`}
                  >
                    <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-neutral-900" />
                  </span>
                </button>

                {/* Popover Product Card */}
                {isActive && (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(details.href);
                    }}
                    className={`absolute z-30 w-72 sm:w-80 p-3 sm:p-3.5 bg-white rounded-xs shadow-2xl border border-neutral-200 cursor-pointer animate-in fade-in zoom-in-95 duration-200 transition-transform hover:-translate-y-0.5 ${
                      hotspot.placement === "left"
                        ? "right-full mr-3 top-1/2 -translate-y-1/2"
                        : hotspot.placement === "top-left"
                        ? "right-full mr-2 bottom-full mb-2"
                        : hotspot.placement === "top"
                        ? "left-1/2 -translate-x-1/2 bottom-full mb-3"
                        : "left-full ml-3 bottom-1/2 translate-y-1/4 sm:translate-y-0"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Product Thumbnail */}
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-neutral-100 rounded-xs border border-neutral-200 p-1 shrink-0 overflow-hidden relative">
                        <Image
                          src={details.image}
                          alt={details.name}
                          fill
                          className="object-contain p-1"
                          sizes="80px"
                          unoptimized={details.image.startsWith("http") || details.image.startsWith("data:")}
                        />
                      </div>

                      {/* Product Text Details */}
                      <div className="flex-1 min-w-0 pr-1">
                        <h4 className="text-[11px] sm:text-xs font-semibold text-neutral-900 leading-snug line-clamp-2 hover:text-[#B49A70] transition-colors">
                          {details.name}
                        </h4>
                        
                        <div className="mt-1.5 flex items-baseline gap-1.5">
                          <span className="text-xs sm:text-[13px] font-bold text-neutral-900">
                            {formatLKR(details.priceLKR)}
                          </span>
                        </div>

                        <p className="text-[10px] text-neutral-400 font-light mt-0.5">
                          VAT Included
                        </p>

                        <div className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold tracking-wider uppercase text-[#B49A70] hover:text-[#8E744A]">
                          <span>View Product</span>
                          <ArrowRight className="w-2.5 h-2.5" />
                        </div>
                      </div>

                      {/* Close button for touch devices */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveHotspotId(null);
                        }}
                        className="p-1 text-neutral-400 hover:text-neutral-700 self-start"
                        aria-label="Close details"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Subtle helper note */}
        <div className="mt-3 text-center">
          <p className="text-[11px] text-neutral-500 font-light flex items-center justify-center gap-1.5">
            <Sparkles className="w-3 h-3 text-[#B49A70]" />
            <span>Click any hotspot on the room to inspect and shop Dr. Scent instruments</span>
          </p>
        </div>

      </div>
    </section>
  );
}
