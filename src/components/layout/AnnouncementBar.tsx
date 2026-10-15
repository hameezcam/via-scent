"use client";

import React, { useState } from "react";
import Link from "next/link";
import { X, Sparkles, ShieldCheck } from "lucide-react";
import { BRAND_CONFIG } from "@/config/brand.config";

export function AnnouncementBar() {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) return null;

  return (
    <aside
      aria-label="Announcement"
      className="bg-stone-900 text-stone-200 text-xs tracking-wide py-2 px-4 transition-all duration-300 relative border-b border-stone-800"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex-1 flex items-center justify-center gap-2 text-center flex-wrap">
          <span className="inline-flex items-center gap-1 text-amber-300 font-medium bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded-full text-[11px]">
            <ShieldCheck className="w-3 h-3 text-amber-400" />
            {BRAND_CONFIG.franchiseStatement}
          </span>
          <span className="text-stone-300 hidden sm:inline">•</span>
          <span className="text-stone-200">{BRAND_CONFIG.announcementText}</span>
          <Link
            href="/business-scenting/request-quote"
            className="text-amber-300 hover:text-amber-200 underline underline-offset-2 ml-1 transition-colors font-medium inline-flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3" />
            Enquire Now
          </Link>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          aria-label="Dismiss announcement bar"
          className="text-stone-400 hover:text-stone-100 p-1 -mr-1 rounded transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
}
