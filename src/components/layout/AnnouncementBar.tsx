"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { X, Sparkles, ShieldCheck } from "lucide-react";
import { BRAND_CONFIG } from "@/config/brand.config";

const ANNOUNCEMENTS = [
  {
    prefix: "An atmosphere, uniquely yours.",
    highlight: "Official Dr. Scent Franchise Partner in Sri Lanka",
    href: "/about",
    linkText: "Our Story",
  },
  {
    prefix: "Complimentary Delivery",
    highlight: "Islandwide White-Glove Shipping on orders over LKR 100,000",
    href: "/shipping",
    linkText: "Delivery Terms",
  },
  {
    prefix: "Architectural Scenting",
    highlight: "Private B2B Olfactory Consultations for Hotels, Spas & Retail",
    href: "/business-scenting/request-quote",
    linkText: "Request Quote",
  },
];

export function AnnouncementBar() {
  const [isOpen, setIsOpen] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ANNOUNCEMENTS.length);
    }, 6500);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const current = ANNOUNCEMENTS[currentIndex];

  return (
    <aside
      aria-label="Announcement"
      className="bg-[#151412] text-[#EFEAE1] text-[10px] sm:text-[11px] tracking-[0.16em] uppercase py-2.5 px-4 transition-colors relative border-b border-[#26221E] z-50 select-none"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex-1 flex items-center justify-center gap-2 text-center flex-wrap min-h-[20px]">
          <span className="inline-flex items-center gap-1.5 text-[#B49A70] font-semibold bg-[#211C19] border border-[#B49A70]/30 px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] tracking-wider">
            <ShieldCheck className="w-3 h-3 text-[#B49A70]" />
            Franchise Certified
          </span>
          <span className="text-[#8A8275] hidden sm:inline">•</span>
          <span className="text-[#ECE7DE] font-medium transition-opacity duration-500">
            {current.prefix} <span className="text-[#D8D0C4] font-normal normal-case sm:uppercase"> — {current.highlight}</span>
          </span>
          <Link
            href={current.href}
            className="text-[#B49A70] hover:text-[#CBB694] underline underline-offset-4 ml-1 transition-colors font-semibold inline-flex items-center gap-1 lowercase first-letter:uppercase tracking-wider"
          >
            <span>{current.linkText}</span>
            <Sparkles className="w-2.5 h-2.5 text-[#B49A70]" />
          </Link>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          aria-label="Dismiss announcement bar"
          className="text-[#8A8275] hover:text-[#F8F6F1] p-1 -mr-1 rounded transition-colors focus:outline-none focus:ring-1 focus:ring-[#B49A70]"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
}
