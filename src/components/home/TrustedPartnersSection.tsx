"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { TrustedPartner } from "@/types/partner";

interface TrustedPartnersSectionProps {
  initialPartners?: TrustedPartner[];
}

export function TrustedPartnersSection({ initialPartners }: TrustedPartnersSectionProps) {
  const [partners, setPartners] = useState<TrustedPartner[]>(initialPartners || []);

  useEffect(() => {
    // Keep list synchronized with latest updates from admin panel
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
        // Fallback to initialPartners
      }
    };

    fetchPartners();
  }, []);

  // Ensure each track contains enough items to span beyond ultra-wide screens
  const trackItems = useMemo(() => {
    if (!partners || partners.length === 0) return [];
    let items = [...partners];
    while (items.length < 8) {
      items = [...items, ...partners];
    }
    return items;
  }, [partners]);

  if (!partners || partners.length === 0) {
    return null;
  }

  const renderPartnerItem = (partner: TrustedPartner, uniqueKey: string, isHidden = false) => {
    const cardContent = (
      <div
        className="flex items-center justify-center h-16 sm:h-20 min-w-[150px] sm:min-w-[190px] px-3 grayscale hover:grayscale-0 opacity-80 hover:opacity-100 transition-all duration-300 transform hover:scale-105"
        title={partner.name}
      >
        <div className="relative w-36 sm:w-44 h-12 sm:h-14 flex items-center justify-center">
          <Image
            src={partner.logoUrl}
            alt={partner.name}
            fill
            className="object-contain object-center"
            sizes="180px"
            unoptimized={partner.logoUrl.startsWith("data:") || partner.logoUrl.endsWith(".svg")}
          />
        </div>
      </div>
    );

    if (partner.websiteUrl) {
      return (
        <a
          key={uniqueKey}
          href={partner.websiteUrl}
          target="_blank"
          rel="noopener noreferrer"
          tabIndex={isHidden ? -1 : 0}
          className="shrink-0 block focus:outline-none focus:ring-1 focus:ring-amber-500 rounded"
        >
          {cardContent}
        </a>
      );
    }

    return (
      <div key={uniqueKey} className="shrink-0" aria-hidden={isHidden}>
        {cardContent}
      </div>
    );
  };

  return (
    <section className="py-12 sm:py-16 bg-[#FFFFFF] border-t border-b border-[#E7E2D8] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center mb-8 sm:mb-10">
          <h2 className="text-xs sm:text-sm font-bold tracking-[0.24em] uppercase text-[#151412] inline-block relative pb-1">
            OUR TRUSTED CLIENTS
          </h2>
        </div>

        {/* Seamless Infinite Marquee Track */}
        <div className="relative overflow-hidden w-full group py-2 select-none">
          {/* Subtle edge fade gradients */}
          <div className="absolute left-0 inset-y-0 w-16 sm:w-28 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 inset-y-0 w-16 sm:w-28 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none" />

          {/* Dual synchronized tracks for uninterrupted continuous looping */}
          <div className="flex w-max">
            {/* Track 1 */}
            <div className="animate-partner-marquee flex shrink-0 items-center gap-12 sm:gap-20 pr-12 sm:pr-20 group-hover:[animation-play-state:paused]">
              {trackItems.map((partner, index) =>
                renderPartnerItem(partner, `track1-${partner.id}-${index}`)
              )}
            </div>

            {/* Track 2 (Cloned for 100% gapless infinite loop) */}
            <div
              className="animate-partner-marquee flex shrink-0 items-center gap-12 sm:gap-20 pr-12 sm:pr-20 group-hover:[animation-play-state:paused]"
              aria-hidden="true"
            >
              {trackItems.map((partner, index) =>
                renderPartnerItem(partner, `track2-${partner.id}-${index}`, true)
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
