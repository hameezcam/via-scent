"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowRight, X, Sparkles } from "lucide-react";
import { formatLKR } from "@/config/brand.config";
import { InteractiveRoomConfig, InteractiveRoomHotspot } from "@/types/interactive-room";

interface InteractiveRoomSectionProps {
  initialConfig?: InteractiveRoomConfig;
}

export function InteractiveRoomSection({ initialConfig }: InteractiveRoomSectionProps) {
  const router = useRouter();
  const [config, setConfig] = useState<InteractiveRoomConfig | null>(initialConfig || null);
  const [activeHotspotId, setActiveHotspotId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // If no initialConfig, fetch live
  useEffect(() => {
    if (!initialConfig) {
      fetch("/api/interactive-room")
        .then((res) => res.json())
        .then((data) => {
          setConfig(data);
          const firstEnabled = data?.hotspots?.find((h: InteractiveRoomHotspot) => h.enabled);
          if (firstEnabled) {
            setActiveHotspotId(firstEnabled.id);
          }
        })
        .catch((err) => console.error("Error loading interactive room:", err));
    } else {
      const firstEnabled = initialConfig?.hotspots?.find((h) => h.enabled);
      if (firstEnabled) {
        setActiveHotspotId(firstEnabled.id);
      }
    }
  }, [initialConfig]);

  // Close popover when clicking outside the canvas
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setActiveHotspotId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!config) return null;

  const enabledHotspots = config.hotspots?.filter((h) => h.enabled) || [];

  return (
    <section id="shop-the-room" className="bg-white border-t border-[#E7E2D8] relative overflow-hidden py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Floating/Top Collection Header Card */}
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8 px-4">
          <div className="inline-block border border-stone-800 bg-white/95 px-6 sm:px-10 py-4 sm:py-5 shadow-xs">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-serif font-bold tracking-wider text-stone-900 uppercase">
              {config.title || "NEW COLLECTION"}
            </h2>
            <p className="text-xs sm:text-[13px] text-stone-600 font-light mt-2 leading-relaxed">
              {config.subtitle ||
                "The latest arrivals at Dr. Scent fragrances include a variety of scents, sprays and diffuser machines for your home, office, car or commercial space."}
            </p>
          </div>
        </div>

        {/* Interactive Room Canvas Container */}
        <div
          ref={containerRef}
          className="relative w-full rounded-xs overflow-hidden border border-[#E7E2D8] bg-[#F7F5F0] shadow-md select-none"
          style={{ aspectRatio: "16 / 9" }}
        >
          {/* Base High-Resolution Living Room Scene */}
          <Image
            src={config.imageUrl || "/images/home/luxury-living-room.jpg"}
            alt="Dr. Scent Living Room Interactive Showcase"
            fill
            priority
            unoptimized
            className="object-cover object-center"
            sizes="(max-width: 1280px) 100vw, 1280px"
          />

          {/* Hotspot Pins & Popovers */}
          {enabledHotspots.map((hotspot) => {
            const isActive = activeHotspotId === hotspot.id;

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
                {/* Hotspot Pin with Animated Beacon Ping */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveHotspotId(isActive ? null : hotspot.id);
                  }}
                  className="relative group p-2 focus:outline-none cursor-pointer flex items-center justify-center"
                  aria-label={`View ${hotspot.productName}`}
                  aria-expanded={isActive}
                >
                  {/* Subtle pulsing beacon */}
                  <span className="absolute w-7 h-7 rounded-full bg-white/60 animate-ping pointer-events-none" />

                  {/* Main Pin Disc (Concentric ring matching the reference design) */}
                  <span
                    className={`relative w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white shadow-xl border flex items-center justify-center transition-all duration-300 ${
                      isActive
                        ? "scale-115 border-stone-900 ring-4 ring-stone-900/20 shadow-2xl"
                        : "border-stone-300 group-hover:scale-110 group-hover:border-stone-900"
                    }`}
                  >
                    <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-stone-900" />
                  </span>
                </button>

                {/* Popover Product Card */}
                {isActive && (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/products/${hotspot.productSlug}`);
                    }}
                    className={`absolute z-30 w-64 sm:w-80 p-3 sm:p-4 bg-white rounded-xs shadow-2xl border border-stone-200 cursor-pointer animate-in fade-in zoom-in-95 duration-200 transition-transform hover:-translate-y-0.5 ${
                      hotspot.placement === "left"
                        ? "right-full mr-3 top-1/2 -translate-y-1/2"
                        : hotspot.placement === "top-left"
                        ? "right-full mr-2 bottom-full mb-2"
                        : hotspot.placement === "top"
                        ? "left-1/2 -translate-x-1/2 bottom-full mb-3"
                        : "left-full ml-3 bottom-1/2 translate-y-1/4 sm:translate-y-0"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Product Thumbnail */}
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-stone-50 rounded-xs border border-stone-200 p-1 shrink-0 overflow-hidden relative">
                        <Image
                          src={hotspot.productImage}
                          alt={hotspot.productName}
                          fill
                          className="object-contain p-1"
                          sizes="80px"
                          unoptimized={
                            hotspot.productImage.startsWith("http") ||
                            hotspot.productImage.startsWith("data:")
                          }
                        />
                      </div>

                      {/* Product Text Details */}
                      <div className="flex-1 min-w-0 pr-1">
                        <h4 className="text-xs sm:text-sm font-semibold text-stone-900 leading-snug line-clamp-2 hover:text-[#B49A70] transition-colors">
                          {hotspot.productName}
                        </h4>

                        <div className="mt-1 flex items-baseline gap-1.5">
                          <span className="text-xs sm:text-[13px] font-bold text-stone-900">
                            {formatLKR(hotspot.productPriceLKR)}
                          </span>
                        </div>

                        <p className="text-[10px] text-stone-400 font-light mt-0.5">
                          VAT Included
                        </p>

                        <div className="mt-2 inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold tracking-wider uppercase text-[#B49A70] hover:text-[#8E744A]">
                          <span>View Product</span>
                          <ArrowRight className="w-3 h-3" />
                        </div>
                      </div>

                      {/* Close button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveHotspotId(null);
                        }}
                        className="p-1 text-stone-400 hover:text-stone-700 self-start"
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

        {/* Helper Note */}
        <div className="mt-3 text-center">
          <p className="text-[11px] sm:text-xs text-stone-500 font-light flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#B49A70]" />
            <span>{config.helperText || "Click any hotspot on the room to inspect and shop Dr. Scent instruments"}</span>
          </p>
        </div>

      </div>
    </section>
  );
}
