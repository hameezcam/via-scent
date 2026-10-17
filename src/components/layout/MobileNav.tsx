"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, ChevronRight, ShieldCheck, Phone, Mail, Building2, User } from "lucide-react";
import { BRAND_CONFIG } from "@/config/brand.config";

import { MAIN_NAV_ITEMS } from "./Header";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const pathname = usePathname();
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});

  const toggleMenu = (id: string) => {
    setExpandedMenus((prev: Record<string, boolean>) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Close on route change
  useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#151412]/75 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-[#FAF8F5] shadow-2xl flex flex-col z-50 border-r border-[#E7E2D8] animate-in slide-in-from-left duration-300">
        {/* Drawer Header */}
        <div className="p-5 border-b border-[#E7E2D8] flex items-center justify-between bg-[#FFFFFF]">
          <div>
            <span className="font-serif text-lg tracking-[0.2em] font-semibold text-[#151412] block">
              {BRAND_CONFIG.brandName}
            </span>
            <span className="text-[9px] tracking-widest text-[#B49A70] font-semibold uppercase block">
              {BRAND_CONFIG.franchiseStatement}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#8A8275] hover:text-[#151412] rounded-md transition-colors"
            aria-label="Close navigation menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-1.5">
          {MAIN_NAV_ITEMS.map((item) => {
            const hasSub = Boolean(item.items && item.items.length > 0);
            const isExpanded = Boolean(expandedMenus[item.id]);
            const isActive = pathname === item.href;

            if (!hasSub) {
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-3 rounded-lg text-xs font-semibold tracking-wider uppercase transition-colors ${
                    isActive
                      ? "bg-[#EFEAE1] text-[#151412] border border-[#B49A70]/30"
                      : "text-[#211C19] hover:bg-[#EFEAE1]/60"
                  }`}
                >
                  <span>{item.label}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#8A8275]" />
                </Link>
              );
            }

            return (
              <div key={item.id} className="rounded-lg overflow-hidden border border-[#E7E2D8]/60 bg-white">
                <button
                  type="button"
                  onClick={() => toggleMenu(item.id)}
                  className="w-full flex items-center justify-between px-3.5 py-3 text-xs font-semibold tracking-wider uppercase text-[#151412] hover:bg-[#FAF8F5] transition-colors"
                >
                  <span>{item.label}</span>
                  <ChevronRight
                    className={`w-3.5 h-3.5 text-[#8A8275] transition-transform duration-200 ${
                      isExpanded ? "rotate-90 text-[#B49A70]" : ""
                    }`}
                  />
                </button>

                {isExpanded && (
                  <div className="bg-[#FAF8F5] px-3.5 py-2 border-t border-[#E7E2D8]/50 space-y-1">
                    {item.items?.map((sub) => (
                      <Link
                        key={sub.label}
                        href={sub.href}
                        className="block px-2 py-2 text-xs text-[#57534E] hover:text-[#B49A70] hover:bg-[#EFEAE1]/50 rounded transition-colors"
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          <div className="pt-3 space-y-1">
            <Link
              href="/about"
              className="flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium tracking-wider uppercase text-[#57534E] hover:bg-[#EFEAE1]/60"
            >
              <span>Our Story & Science</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#8A8275]" />
            </Link>
            <Link
              href="/contact"
              className="flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium tracking-wider uppercase text-[#57534E] hover:bg-[#EFEAE1]/60"
            >
              <span>Contact & Showroom</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#8A8275]" />
            </Link>
          </div>

          <div className="pt-4 border-t border-[#E7E2D8] mt-4 space-y-2">
            <Link
              href="/business-scenting/request-quote"
              className="flex items-center gap-2 w-full text-center justify-center px-4 py-3 bg-[#151412] text-[#B49A70] hover:text-[#EFEAE1] rounded text-xs font-semibold tracking-widest uppercase transition-colors shadow-xs"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Request B2B Quote</span>
            </Link>

            <Link
              href="/admin"
              className="flex items-center gap-2 w-full text-center justify-center px-4 py-2.5 border border-[#D8D0C4] hover:bg-[#EFEAE1]/50 text-[#57534E] rounded text-[11px] font-medium tracking-wider uppercase transition-colors"
            >
              <User className="w-3.5 h-3.5" />
              <span>Staff Admin Portal</span>
            </Link>
          </div>
        </div>

        {/* Drawer Footer with Franchise Disclosures */}
        <div className="p-4 border-t border-[#E7E2D8] bg-[#EFEAE1]/50 text-[11px] text-[#57534E] space-y-1.5">
          <div className="flex items-center gap-1.5 text-[#151412] font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-[#B49A70]" />
            <span>Authorized Sri Lankan Franchise</span>
          </div>
          <p className="text-[10px] text-[#8A8275] leading-relaxed">
            Colombo Experience Lounge & Corporate Service Hub
          </p>
        </div>
      </div>
    </div>
  );
}
