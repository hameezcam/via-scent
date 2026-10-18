"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { TrustedPartner } from "@/types/partner";

interface TrustedPartnersSectionProps {
  initialPartners?: TrustedPartner[];
}

export function TrustedPartnersSection({ initialPartners }: TrustedPartnersSectionProps) {
  const [partners, setPartners] = useState<TrustedPartner[]>(initialPartners || []);
  const [isPaused, setIsPaused] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // If not provided from SSR or to keep real-time fresh
    const fetchPartners = async () => {
      try {
        const res = await fetch("/api/partners", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setPartners(data);
          }
        }
      } catch {
        // fallback to initialPartners
      }
    };

    fetchPartners();
  }, []);

  // Smooth continuous auto-scroll ticker with pause on hover
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || isPaused || partners.length <= 1) return;

    let animId: number;
    let lastTime = performance.now();

    const step = (time: number) => {
      const delta = time - lastTime;
      lastTime = time;

      if (!isPaused && container) {
        // ~35px per second
        container.scrollLeft += (35 * delta) / 1000;
        if (container.scrollLeft >= container.scrollWidth / 2) {
          container.scrollLeft = 0;
        }
      }
      animId = requestAnimationFrame(step);
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [isPaused, partners.length]);

  if (!partners || partners.length === 0) {
    return null;
  }

  // Double items for seamless infinite scroll if 4 or more
  const displayItems = partners.length >= 4 ? [...partners, ...partners] : partners;

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -260, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 260, behavior: "smooth" });
    }
  };

  return (
    <section className="py-12 sm:py-16 bg-[#FFFFFF] border-b border-[#E7E2D8] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading matching screenshot */}
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-xs sm:text-sm font-bold tracking-[0.24em] uppercase text-[#151412] inline-block relative pb-1">
            OUR TRUSTED PARTNERS
          </h2>
        </div>

        {/* Marquee / Slideshow Track */}
        <div
          className="relative group"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Edge Fade Gradients */}
          <div className="absolute left-0 inset-y-0 w-12 sm:w-24 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 inset-y-0 w-12 sm:w-24 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none" />

          {/* Nav Controls for Desktop */}
          <button
            onClick={scrollLeft}
            type="button"
            aria-label="Scroll left"
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/90 border border-stone-200 text-stone-700 shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-stone-50 hover:text-black"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={scrollRight}
            type="button"
            aria-label="Scroll right"
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/90 border border-stone-200 text-stone-700 shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-stone-50 hover:text-black"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Scrolling Container */}
          <div
            ref={scrollContainerRef}
            className="flex items-center gap-8 sm:gap-14 lg:gap-18 overflow-x-auto scrollbar-none py-4 px-6 select-none"
            style={{
              scrollBehavior: "smooth",
            }}
          >
            {displayItems.map((partner, index) => {
              const content = (
                <div
                  className="flex items-center justify-center h-16 sm:h-20 min-w-[140px] sm:min-w-[180px] px-3 grayscale hover:grayscale-0 opacity-80 hover:opacity-100 transition-all duration-300 transform hover:scale-105"
                  title={partner.name}
                >
                  {partner.logoUrl.endsWith(".svg") || partner.logoUrl.startsWith("/images/") ? (
                    <div className="relative w-36 sm:w-44 h-12 sm:h-14 flex items-center justify-center">
                      <Image
                        src={partner.logoUrl}
                        alt={partner.name}
                        fill
                        className="object-contain object-center"
                        sizes="180px"
                      />
                    </div>
                  ) : (
                    // External or uploaded logo image
                    <div className="relative w-36 sm:w-44 h-12 sm:h-14 flex items-center justify-center">
                      <Image
                        src={partner.logoUrl}
                        alt={partner.name}
                        fill
                        className="object-contain object-center"
                        sizes="180px"
                        unoptimized={partner.logoUrl.startsWith("data:")}
                      />
                    </div>
                  )}
                </div>
              );

              return partner.websiteUrl ? (
                <a
                  key={`${partner.id}-${index}`}
                  href={partner.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 block focus:outline-none"
                >
                  {content}
                </a>
              ) : (
                <div key={`${partner.id}-${index}`} className="shrink-0">
                  {content}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
