"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, X, Sparkles, CheckCircle2 } from "lucide-react";
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

  // If no initialConfig passed from server, fetch live from API
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

  // Keyboard accessibility: Close with Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setActiveHotspotId(null);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!config) return null;

  const enabledHotspots = config.hotspots?.filter((h) => h.enabled) || [];
  const activeHotspot = enabledHotspots.find((h) => h.id === activeHotspotId);

  return (
    <section
      id="shop-the-room"
      aria-label="Interactive shoppable living room collection"
      className="bg-white border-t border-[#E7E2D8] relative overflow-hidden py-10 sm:py-16"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Editorial Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8 px-4">
          <div className="inline-block border border-stone-800 bg-white/95 px-6 sm:px-10 py-4 sm:py-5 shadow-xs">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-serif font-bold tracking-wider text-stone-900 uppercase">
              {config.title || "NEW COLLECTION"}
            </h2>
            <p className="text-xs sm:text-[13px] text-stone-600 font-light mt-2 leading-relaxed">
              {config.subtitle ||
                "Discover the fragrances that transform your space. Explore our collection of home fragrances, diffusers and room sprays."}
            </p>
          </div>
        </div>

        {/* Interactive Room Canvas Container */}
        <div
          ref={containerRef}
          className="relative w-full rounded-xs overflow-hidden border border-[#E7E2D8] bg-[#F7F5F0] shadow-md select-none"
          style={{ aspectRatio: "16 / 9" }}
        >
          {/* Base Lifestyle Living Room Photograph */}
          <Image
            src={config.imageUrl || "/images/home/luxury-living-room.jpg"}
            alt="Luxury modern living room with Dr. Scent fragrances and diffusers"
            fill
            priority
            unoptimized
            className="object-cover object-center"
            sizes="(max-width: 1280px) 100vw, 1280px"
          />

          {/* Hotspot Pins & Desktop Popovers */}
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
                {/* Hotspot Pin Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveHotspotId(isActive ? null : hotspot.id);
                  }}
                  className="relative group p-2 focus-visible:outline-none cursor-pointer flex items-center justify-center rounded-full"
                  aria-label={`View ${hotspot.productName}`}
                  aria-expanded={isActive}
                >
                  {/* Subtle pulsing beacon with reduced-motion support */}
                  <span className="absolute w-7 h-7 rounded-full bg-white/60 motion-safe:animate-ping pointer-events-none" />

                  {/* High-contrast pin disc (white disc with dark center dot) */}
                  <span
                    className={`relative w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white shadow-xl border flex items-center justify-center transition-all duration-300 ${
                      isActive
                        ? "scale-115 border-stone-900 ring-4 ring-stone-900/20 shadow-2xl"
                        : "border-stone-300 group-hover:scale-110 group-hover:border-stone-900 group-focus-visible:ring-2 group-focus-visible:ring-stone-900"
                    }`}
                  >
                    <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-stone-900" />
                  </span>
                </button>

                {/* Desktop Popover Card (hidden on mobile to prevent clipping) */}
                {isActive && (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/products/${hotspot.productSlug}`);
                    }}
                    className={`hidden sm:block absolute z-30 w-72 lg:w-80 p-3.5 bg-white rounded-xs shadow-2xl border border-stone-200 cursor-pointer animate-in fade-in zoom-in-95 duration-200 transition-transform hover:-translate-y-0.5 ${
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

                        <div className="mt-1 flex items-baseline gap-2">
                          <span className="text-xs sm:text-[13px] font-bold text-stone-900">
                            {formatLKR(hotspot.productPriceLKR)}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-medium bg-emerald-50 px-1.5 py-0.2 rounded">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                            <span>In Stock</span>
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

          {/* Mobile Bottom Sheet Card (Never clipped outside viewport) */}
          {activeHotspot && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/products/${activeHotspot.productSlug}`);
              }}
              className="sm:hidden absolute bottom-2 left-2 right-2 z-30 p-3 bg-white/95 backdrop-blur-md rounded-lg shadow-2xl border border-stone-200 cursor-pointer animate-in slide-in-from-bottom duration-200"
            >
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-stone-50 rounded border border-stone-200 p-0.5 shrink-0 overflow-hidden relative">
                  <Image
                    src={activeHotspot.productImage}
                    alt={activeHotspot.productName}
                    fill
                    className="object-contain p-0.5"
                    sizes="56px"
                    unoptimized={
                      activeHotspot.productImage.startsWith("http") ||
                      activeHotspot.productImage.startsWith("data:")
                    }
                  />
                </div>
                <div className="flex-1 min-w-0 pr-1">
                  <h4 className="text-xs font-semibold text-stone-900 truncate">
                    {activeHotspot.productName}
                  </h4>
                  <div className="mt-0.5 flex items-center gap-2">
                    <span className="text-xs font-bold text-stone-900">
                      {formatLKR(activeHotspot.productPriceLKR)}
                    </span>
                    <span className="text-[10px] text-stone-400">VAT Included</span>
                  </div>
                  <div className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold tracking-wider uppercase text-[#B49A70]">
                    <span>View Product</span>
                    <ArrowRight className="w-2.5 h-2.5" />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveHotspotId(null);
                  }}
                  className="p-1.5 text-stone-400 hover:text-stone-700 self-center"
                  aria-label="Close details"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
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

// Export both named aliases for flexibility
export { InteractiveRoomSection as ShoppableRoomSection };
