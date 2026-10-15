"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, Building2, Phone, Mail, ChevronRight, ShieldCheck } from "lucide-react";
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
    { label: "All Fragrances & Diffusers", href: "/shop" },
    { label: "Aroma Diffusers", href: "/shop/aroma-diffusers" },
    { label: "Fragrance Oils", href: "/shop/fragrance-oils" },
    { label: "Commercial Scenting", href: "/business-scenting" },
    { label: "Gift Collections", href: "/shop/gift-collections" },
    { label: "About The Brand", href: "/about" },
    { label: "Contact & Showroom", href: "/contact" },
  ];

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-[#FAF8F5] shadow-2xl flex flex-col z-50 border-r border-stone-200 animate-in slide-in-from-left duration-300">
        {/* Drawer Header */}
        <div className="p-5 border-b border-stone-200/80 flex items-center justify-between">
          <div>
            <span className="font-serif text-lg tracking-widest font-semibold text-stone-900 block">
              {BRAND_CONFIG.brandName}
            </span>
            <span className="text-[10px] tracking-wider text-amber-800 font-medium uppercase block">
              {BRAND_CONFIG.franchiseStatement}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-500 hover:text-stone-900 rounded-md transition-colors"
            aria-label="Close navigation menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center justify-between px-3 py-3 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-amber-100/60 text-amber-950 font-semibold"
                    : "text-stone-700 hover:bg-stone-100 hover:text-stone-950"
                }`}
              >
                <span>{link.label}</span>
                <ChevronRight className="w-4 h-4 text-stone-400" />
              </Link>
            );
          })}

          <div className="pt-4 border-t border-stone-200/80 mt-4">
            <Link
              href="/business-scenting/request-quote"
              className="flex items-center gap-2 w-full text-center justify-center px-4 py-3 bg-stone-900 text-amber-100 rounded text-xs font-semibold tracking-wider uppercase hover:bg-stone-800 transition-colors shadow-sm"
            >
              <Building2 className="w-4 h-4 text-amber-400" />
              Request B2B Quote
            </Link>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-100/60 text-xs text-stone-600 space-y-2">
          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-stone-500" />
            <span>{BRAND_CONFIG.contact.phone}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-3.5 h-3.5 text-stone-500" />
            <span>{BRAND_CONFIG.contact.email}</span>
          </div>
          <div className="pt-2 text-[11px] text-stone-500 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-700 inline" />
            <span>Official Dr. Scent Franchise Supply</span>
          </div>
        </div>
      </div>
    </div>
  );
}
