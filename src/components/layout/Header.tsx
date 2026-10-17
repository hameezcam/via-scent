"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Search, ShoppingBag, User, Menu, ChevronDown, Sparkles, X, ArrowRight, ShieldCheck } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { BRAND_CONFIG } from "@/config/brand.config";
import { MobileNav } from "./MobileNav";

const MEGA_CATEGORIES = [
  {
    title: "Aroma Diffusers",
    slug: "aroma-diffusers",
    tagline: "Cold-Air Micro-Nebulization",
    image: "/images/categories/aroma-diffusers.jpg",
    href: "/shop/aroma-diffusers",
  },
  {
    title: "Fragrance Oils",
    slug: "fragrance-oils",
    tagline: "100% Pure Undiluted Blends",
    image: "/images/categories/fragrance-oils.jpg",
    href: "/shop/fragrance-oils",
  },
  {
    title: "Commercial Scenting",
    slug: "commercial-scenting",
    tagline: "HVAC & Architectural Systems",
    image: "/images/categories/commercial-scenting.jpg",
    href: "/business-scenting",
  },
  {
    title: "Home Fragrance",
    slug: "home-fragrance",
    tagline: "Atmospheric Living Collections",
    image: "/images/categories/home-fragrance.jpg",
    href: "/home-fragrance",
  },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { itemCount, openCart } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCollectionsOpen, setIsCollectionsOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          isScrolled
            ? "bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#E7E2D8] shadow-xs py-0"
            : "bg-[#FAF8F5]/90 backdrop-blur-xs border-b border-[#E7E2D8]/60 py-1"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Left: Mobile Toggle & Brand Identity */}
            <div className="flex items-center gap-5">
              <button
                type="button"
                onClick={() => setIsMobileNavOpen(true)}
                className="lg:hidden p-2 text-[#211C19] hover:text-[#B49A70] rounded-md focus:outline-none focus:ring-2 focus:ring-[#B49A70] transition-colors"
                aria-label="Open mobile navigation menu"
              >
                <Menu className="w-6 h-6" />
              </button>

              <Link href="/" className="flex flex-col group select-none">
                <span className="font-serif text-2xl sm:text-3xl tracking-[0.22em] font-semibold text-[#151412] group-hover:text-[#B49A70] transition-colors">
                  VIA SCENT
                </span>
                <span className="text-[9px] tracking-[0.24em] uppercase text-[#8A8275] font-medium -mt-1 group-hover:text-[#151412] transition-colors">
                  Dr. Scent Franchise Partner
                </span>
              </Link>
            </div>

            {/* Center: Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-7" aria-label="Main Navigation">
              <Link
                href="/shop"
                className={`text-xs tracking-[0.16em] uppercase font-medium transition-colors hover:text-[#B49A70] relative py-2 ${
                  pathname === "/shop" ? "text-[#B49A70] font-semibold" : "text-[#211C19]"
                }`}
              >
                Shop All
              </Link>

              {/* Collections Mega Menu Trigger */}
              <div
                className="relative"
                onMouseEnter={() => setIsCollectionsOpen(true)}
                onMouseLeave={() => setIsCollectionsOpen(false)}
              >
                <Link
                  href="/shop"
                  className={`inline-flex items-center gap-1.5 text-xs tracking-[0.16em] uppercase font-medium transition-colors hover:text-[#B49A70] py-2 ${
                    pathname.startsWith("/shop/") ? "text-[#B49A70] font-semibold" : "text-[#211C19]"
                  }`}
                >
                  <span>Collections</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-[#8A8275] transition-transform duration-200 ${
                      isCollectionsOpen ? "rotate-180 text-[#B49A70]" : ""
                    }`}
                  />
                </Link>

                {/* Wide Luxury Mega Menu */}
                {isCollectionsOpen && (
                  <div className="absolute top-full -left-20 w-[720px] pt-3 z-50">
                    <div className="bg-[#FFFFFF] rounded-xl shadow-2xl border border-[#E7E2D8] p-6 grid grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
                      {MEGA_CATEGORIES.map((cat) => (
                        <Link
                          key={cat.slug}
                          href={cat.href}
                          onClick={() => setIsCollectionsOpen(false)}
                          className="group/card flex flex-col rounded-lg overflow-hidden border border-[#EFEAE1] hover:border-[#B49A70]/60 transition-all bg-[#FAF8F5]"
                        >
                          <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-100">
                            <Image
                              src={cat.image}
                              alt={cat.title}
                              fill
                              sizes="160px"
                              className="object-cover group-hover/card:scale-105 transition-transform duration-500 ease-out"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                          </div>
                          <div className="p-3">
                            <h4 className="font-serif text-xs font-semibold text-[#151412] group-hover/card:text-[#B49A70] transition-colors">
                              {cat.title}
                            </h4>
                            <p className="text-[10px] text-[#8A8275] tracking-wide mt-0.5 line-clamp-1">
                              {cat.tagline}
                            </p>
                          </div>
                        </Link>
                      ))}
                      <div className="col-span-4 pt-3 border-t border-[#EFEAE1] flex items-center justify-between text-xs">
                        <span className="text-[#8A8275] tracking-wide">
                          Official Dr. Scent Franchise Supply for Sri Lanka
                        </span>
                        <Link
                          href="/shop"
                          onClick={() => setIsCollectionsOpen(false)}
                          className="text-[#B49A70] hover:text-[#8F764F] font-semibold uppercase tracking-wider flex items-center gap-1"
                        >
                          <span>View Complete Catalogue</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Link
                href="/home-fragrance"
                className={`text-xs tracking-[0.16em] uppercase font-medium transition-colors hover:text-[#B49A70] py-2 ${
                  pathname.startsWith("/home-fragrance") ? "text-[#B49A70] font-semibold" : "text-[#211C19]"
                }`}
              >
                Home Fragrance
              </Link>

              <Link
                href="/business-scenting"
                className={`inline-flex items-center gap-1.5 text-xs tracking-[0.16em] uppercase font-medium transition-colors hover:text-[#B49A70] py-2 ${
                  pathname.startsWith("/business-scenting") ? "text-[#B49A70] font-semibold" : "text-[#211C19]"
                }`}
              >
                <span>Business Scenting</span>
                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold tracking-wider bg-[#211C19] text-[#B49A70] uppercase">
                  B2B
                </span>
              </Link>

              <Link
                href="/about"
                className={`text-xs tracking-[0.16em] uppercase font-medium transition-colors hover:text-[#B49A70] py-2 ${
                  pathname === "/about" ? "text-[#B49A70] font-semibold" : "text-[#211C19]"
                }`}
              >
                Our Story
              </Link>
            </nav>

            {/* Right: Actions (Search, Account, Cart) */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Search Toggle */}
              <button
                type="button"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2.5 text-[#211C19] hover:text-[#B49A70] hover:bg-[#EFEAE1]/60 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#B49A70]"
                aria-label="Open search flyout"
              >
                <Search className="w-4 h-4" />
              </button>

              {/* Account Portal Modal Trigger */}
              <button
                type="button"
                onClick={() => setIsAccountModalOpen(true)}
                className="p-2.5 text-[#211C19] hover:text-[#B49A70] hover:bg-[#EFEAE1]/60 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#B49A70]"
                aria-label="Open client account portal"
              >
                <User className="w-4 h-4" />
              </button>

              {/* Shopping Bag Trigger */}
              <button
                type="button"
                onClick={openCart}
                className="relative p-2.5 text-[#211C19] hover:text-[#B49A70] hover:bg-[#EFEAE1]/60 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#B49A70]"
                aria-label={`Shopping bag containing ${itemCount} items`}
              >
                <ShoppingBag className="w-4 h-4" />
                {itemCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#151412] text-[#B49A70] text-[9px] font-bold flex items-center justify-center border border-[#B49A70]/50 animate-in zoom-in duration-200">
                    {itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Search Flyout Overlay */}
        {isSearchOpen && (
          <div className="border-t border-[#E7E2D8] bg-[#FAF8F5] py-4 px-4 sm:px-6 shadow-md animate-in slide-in-from-top-1 duration-200">
            <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto flex items-center gap-3">
              <Search className="w-5 h-5 text-[#8A8275]" />
              <input
                type="search"
                placeholder="Search diffusers, fragrance oils, olfactory notes (e.g., Oud, Amber, Vanilla)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="flex-1 bg-transparent border-b border-[#D8D0C4] py-2 text-sm text-[#151412] placeholder-[#8A8275] focus:outline-none focus:border-[#B49A70]"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#151412] text-[#EFEAE1] hover:bg-[#211C19] text-xs font-semibold tracking-wider uppercase rounded transition-colors"
              >
                Search
              </button>
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="p-1 text-[#8A8275] hover:text-[#151412]"
                aria-label="Close search"
              >
                <X className="w-5 h-5" />
              </button>
            </form>
          </div>
        )}
      </header>

      {/* Account Info Modal */}
      {isAccountModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setIsAccountModalOpen(false)}
        >
          <div
            className="bg-[#FFFFFF] border border-[#E7E2D8] rounded-xl max-w-md w-full p-6 shadow-2xl relative animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsAccountModalOpen(false)}
              className="absolute top-4 right-4 text-[#8A8275] hover:text-[#151412] p-1"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#FAF8F5] border border-[#B49A70]/30 flex items-center justify-center mx-auto text-[#B49A70]">
                <User className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-[#151412]">
                Client Olfactory Portal
              </h3>
              <p className="text-xs text-[#57534E] leading-relaxed">
                Guest checkout is enabled across VIA Scent with instant SMS and email tracking for all Sri Lankan orders.
              </p>
              <div className="pt-2 space-y-2">
                <Link
                  href="/admin"
                  onClick={() => setIsAccountModalOpen(false)}
                  className="block w-full py-2.5 px-4 bg-[#151412] hover:bg-[#211C19] text-[#B49A70] text-xs font-semibold tracking-widest uppercase rounded transition-colors"
                >
                  Staff & Administrative Portal
                </Link>
                <Link
                  href="/returns"
                  onClick={() => setIsAccountModalOpen(false)}
                  className="block w-full py-2 px-4 border border-[#E7E2D8] hover:bg-[#FAF8F5] text-[#211C19] text-xs font-medium tracking-wider uppercase rounded transition-colors"
                >
                  Check Return & Warranty Status
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Navigation Drawer */}
      <MobileNav isOpen={isMobileNavOpen} onClose={() => setIsMobileNavOpen(false)} />
    </>
  );
}
