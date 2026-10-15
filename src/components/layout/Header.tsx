"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, ShoppingBag, User, Menu, ChevronDown, Building2, X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { BRAND_CONFIG } from "@/config/brand.config";
import { MobileNav } from "./MobileNav";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { itemCount, openCart } = useCart();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Shop All", href: "/shop" },
    {
      label: "Collections",
      href: "/shop",
      children: [
        { label: "Aroma Diffusers", href: "/shop/aroma-diffusers" },
        { label: "Fragrance Oils", href: "/shop/fragrance-oils" },
        { label: "Commercial Scenting", href: "/shop/commercial-scenting" },
        { label: "Home Fragrance", href: "/shop/home-fragrance" },
        { label: "Gift Sets", href: "/shop/gift-collections" },
      ],
    },
    { label: "Business Scenting", href: "/business-scenting", badge: "B2B" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#E7E2D8] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Left: Mobile Menu Toggle & Brand Wordmark */}
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setIsMobileNavOpen(true)}
                className="lg:hidden p-2 text-stone-700 hover:text-stone-900 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-800"
                aria-label="Open mobile navigation menu"
              >
                <Menu className="w-6 h-6" />
              </button>

              <Link href="/" className="flex flex-col group">
                <span className="font-serif text-2xl tracking-[0.2em] font-semibold text-stone-900 group-hover:text-amber-900 transition-colors">
                  {BRAND_CONFIG.brandName}
                </span>
                <span className="text-[9px] tracking-[0.18em] uppercase text-stone-500 font-medium -mt-1 group-hover:text-amber-800 transition-colors">
                  {BRAND_CONFIG.franchiseStatement}
                </span>
              </Link>
            </div>

            {/* Center: Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1" aria-label="Main Navigation">
              {navLinks.map((link) => {
                const isActive =
                  pathname === link.href ||
                  (link.href !== "/" && pathname.startsWith(link.href));

                if (link.children) {
                  return (
                    <div key={link.label} className="relative group">
                      <Link
                        href={link.href}
                        className={`inline-flex items-center gap-1 px-3 py-2 text-xs tracking-wider uppercase font-medium transition-colors ${
                          isActive
                            ? "text-amber-900 font-semibold"
                            : "text-stone-700 hover:text-stone-950"
                        }`}
                      >
                        {link.label}
                        <ChevronDown className="w-3.5 h-3.5 text-stone-400 group-hover:rotate-180 transition-transform duration-200" />
                      </Link>

                      {/* Dropdown Menu */}
                      <div className="absolute top-full left-0 w-56 pt-2 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-200 z-50">
                        <div className="bg-white rounded-md shadow-xl border border-stone-200 p-2 space-y-1">
                          {link.children.map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              className="block px-3 py-2 text-xs text-stone-700 hover:bg-stone-50 hover:text-amber-900 rounded font-medium transition-colors"
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs tracking-wider uppercase font-medium transition-colors ${
                      isActive
                        ? "text-amber-900 font-semibold border-b-2 border-amber-800 -mb-[2px]"
                        : "text-stone-700 hover:text-stone-950"
                    }`}
                  >
                    {link.label}
                    {link.badge && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Right: Actions (Search, Account, Cart, B2B CTA) */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Quick Search Trigger */}
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                aria-label="Search fragrance catalogue"
                className="p-2 text-stone-700 hover:text-amber-900 rounded-full hover:bg-stone-100/60 transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Customer Account Button (Phase 2 Preview modal) */}
              <button
                type="button"
                onClick={() => setIsAccountModalOpen(true)}
                aria-label="Account entry point"
                className="p-2 text-stone-700 hover:text-amber-900 rounded-full hover:bg-stone-100/60 transition-colors"
              >
                <User className="w-5 h-5" />
              </button>

              {/* Shopping Cart Trigger */}
              <button
                type="button"
                onClick={openCart}
                aria-label={`Open shopping cart with ${itemCount} items`}
                className="relative p-2 text-stone-700 hover:text-amber-900 rounded-full hover:bg-stone-100/60 transition-colors"
              >
                <ShoppingBag className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-amber-800 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-in zoom-in">
                    {itemCount}
                  </span>
                )}
              </button>

              {/* B2B Enquiry Desktop Button */}
              <Link
                href="/business-scenting/request-quote"
                className="hidden xl:inline-flex items-center gap-1.5 px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-amber-100 rounded text-xs font-semibold tracking-wider uppercase transition-colors ml-2 shadow-xs"
              >
                <Building2 className="w-3.5 h-3.5 text-amber-400" />
                <span>B2B Consultation</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Search Bar Flyout */}
        {isSearchOpen && (
          <div className="border-t border-stone-200 bg-white p-4 shadow-lg animate-in slide-in-from-top-2 duration-200">
            <div className="max-w-3xl mx-auto">
              <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                <Search className="absolute left-3.5 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  placeholder="Search diffusers, fragrance oils, scent notes (e.g. Oud, Bergamot, HVAC)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full pl-10 pr-24 py-2.5 text-sm bg-stone-50 border border-stone-300 rounded focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-800 text-stone-900"
                />
                <div className="absolute right-2 flex items-center gap-1">
                  <button
                    type="submit"
                    className="px-3 py-1 bg-stone-900 text-stone-100 text-xs font-medium rounded hover:bg-stone-800 transition-colors uppercase tracking-wider"
                  >
                    Search
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsSearchOpen(false)}
                    className="p-1.5 text-stone-400 hover:text-stone-700 rounded"
                    aria-label="Close search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </header>

      {/* Account Info Modal (Honest Phase 2 notification) */}
      {isAccountModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-sm w-full p-6 shadow-2xl border border-stone-200 text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-800 mx-auto flex items-center justify-center border border-amber-200">
              <User className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-semibold text-stone-900">
              Customer Accounts & Portals
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Customer authentication, passwordless login, order history, and recurring scent cartridge subscriptions will be enabled in <strong>Phase 2</strong> alongside the PostgreSQL / Prisma database architecture.
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <Link
                href="/shop"
                onClick={() => setIsAccountModalOpen(false)}
                className="w-full py-2.5 bg-stone-900 text-amber-100 text-xs font-semibold uppercase tracking-wider rounded hover:bg-stone-800 transition-colors"
              >
                Continue Shopping
              </Link>
              <button
                type="button"
                onClick={() => setIsAccountModalOpen(false)}
                className="w-full py-2 border border-stone-300 text-stone-700 text-xs uppercase tracking-wider rounded hover:bg-stone-100 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Navigation Drawer */}
      <MobileNav isOpen={isMobileNavOpen} onClose={() => setIsMobileNavOpen(false)} />
    </>
  );
}
