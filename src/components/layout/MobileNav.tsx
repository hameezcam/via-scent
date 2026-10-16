"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, ChevronRight, ShieldCheck, Phone, Mail, Building2, User } from "lucide-react";
import { BRAND_CONFIG } from "@/config/brand.config";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const pathname = usePathname();

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

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Shop All Products", href: "/shop" },
    { label: "Aroma Diffusers", href: "/shop/aroma-diffusers" },
    { label: "Fragrance Oils", href: "/shop/fragrance-oils" },
    { label: "Commercial Scenting", href: "/shop/commercial-scenting" },
    { label: "Home Fragrance", href: "/shop/home-fragrance" },
    { label: "Business Scenting (B2B)", href: "/business-scenting" },
    { label: "Our Story & Science", href: "/about" },
    { label: "Contact & Showroom", href: "/contact" },
  ];

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
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center justify-between px-3.5 py-3 rounded-lg text-xs font-semibold tracking-wider uppercase transition-colors ${
                  isActive
                    ? "bg-[#EFEAE1] text-[#151412] border border-[#B49A70]/30"
                    : "text-[#211C19] hover:bg-[#EFEAE1]/60"
                }`}
              >
                <span>{link.label}</span>
                <ChevronRight className={`w-3.5 h-3.5 ${isActive ? "text-[#B49A70]" : "text-[#8A8275]"}`} />
              </Link>
            );
          })}

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
