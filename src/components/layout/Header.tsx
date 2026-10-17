"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Search, ShoppingBag, User, Menu, ChevronDown, Sparkles, X, ArrowRight, ShieldCheck } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { BRAND_CONFIG } from "@/config/brand.config";
import { MobileNav } from "./MobileNav";

export interface NavDropdownItem {
  label: string;
  href: string;
}

export interface NavMenuItem {
  id: string;
  label: string;
  href: string;
  items?: NavDropdownItem[];
}

export const MAIN_NAV_ITEMS: NavMenuItem[] = [
  {
    id: "all",
    label: "ALL",
    href: "/shop",
  },
  {
    id: "aroma-oil",
    label: "AROMA OIL",
    href: "/shop/fragrance-oils",
    items: [
      { label: "Car Scent", href: "/shop/fragrance-oils?q=car" },
      { label: "Dr. Scent's Choice", href: "/shop/fragrance-oils?q=choice" },
      { label: "F&B", href: "/shop/fragrance-oils?q=f%26b" },
      { label: "Floral", href: "/shop/fragrance-oils?family=floral" },
      { label: "Fresh", href: "/shop/fragrance-oils?family=fresh" },
      { label: "Fruity", href: "/shop/fragrance-oils?family=fruity" },
      { label: "Oriental", href: "/shop/fragrance-oils?family=woody-oriental" },
      { label: "Premium Collection", href: "/shop/fragrance-oils?q=premium" },
    ],
  },
  {
    id: "diffuser",
    label: "DIFFUSER",
    href: "/shop/aroma-diffusers",
    items: [
      { label: "Diffuser", href: "/shop/aroma-diffusers" },
      { label: "Car Diffuser", href: "/shop/aroma-diffusers?q=car" },
      { label: "Dispenser", href: "/shop/aroma-diffusers?q=dispenser" },
      { label: "Reed Diffuser", href: "/shop/home-fragrance?q=reed" },
    ],
  },
  {
    id: "best-sellers",
    label: "BEST SELLERS",
    href: "/shop?sort=bestselling",
    items: [
      { label: "Diffusers", href: "/shop/aroma-diffusers?sort=bestselling" },
      { label: "Aroma Oils", href: "/shop/fragrance-oils?sort=bestselling" },
      { label: "Sprays", href: "/shop/home-fragrance?q=spray&sort=bestselling" },
      { label: "Reed Diffusers", href: "/shop/home-fragrance?q=reed&sort=bestselling" },
      { label: "Candles", href: "/shop/home-fragrance?q=candle&sort=bestselling" },
    ],
  },
  {
    id: "sprays",
    label: "SPRAYS",
    href: "/shop/home-fragrance?q=spray",
    items: [
      { label: "Fabric Spray", href: "/shop/home-fragrance?q=fabric+spray" },
      { label: "Odor Eliminator", href: "/shop/home-fragrance?q=odor+eliminator" },
      { label: "Aerosol", href: "/shop/home-fragrance?q=aerosol" },
    ],
  },
  {
    id: "services",
    label: "SERVICES",
    href: "/business-scenting",
    items: [
      { label: "B2B Sales", href: "/business-scenting" },
      { label: "Franchise", href: "/contact?topic=franchise" },
      { label: "Rental Services", href: "/business-scenting/request-quote" },
    ],
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
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
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
            <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8" aria-label="Main Navigation">
              {MAIN_NAV_ITEMS.map((item) => {
                const hasDropdown = Boolean(item.items && item.items.length > 0);
                const isOpen = activeDropdown === item.id;
                const isCurrent =
                  pathname === item.href ||
                  (item.href !== "/shop" && pathname.startsWith(item.href));

                if (!hasDropdown) {
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      className={`text-xs tracking-[0.16em] uppercase font-semibold transition-colors py-2 relative hover:text-[#B49A70] ${
                        pathname === item.href ? "text-[#B49A70] font-bold" : "text-[#211C19]"
                      }`}
                    >
                      <span>{item.label}</span>
                      {pathname === item.href && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#B49A70]" />
                      )}
                    </Link>
                  );
                }

                return (
                  <div
                    key={item.id}
                    className="relative py-2"
                    onMouseEnter={() => setActiveDropdown(item.id)}
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    <Link
                      href={item.href}
                      className={`inline-flex items-center gap-1 text-xs tracking-[0.16em] uppercase font-semibold transition-colors hover:text-[#B49A70] py-1 ${
                        isOpen || isCurrent ? "text-[#B49A70]" : "text-[#211C19]"
                      }`}
                    >
                      <span>{item.label}</span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          isOpen ? "rotate-180 text-[#B49A70]" : "text-[#8A8275]"
                        }`}
                      />
                    </Link>

                    {/* Luxury Dropdown Menu */}
                    {isOpen && (
                      <div className="absolute top-full left-0 pt-2 z-50 min-w-[220px]">
                        <div className="bg-[#FFFFFF] rounded-xl shadow-2xl border border-[#E7E2D8] py-2 animate-in fade-in slide-in-from-top-2 duration-150 overflow-hidden">
                          {item.items?.map((sub) => (
                            <Link
                              key={sub.label}
                              href={sub.href}
                              onClick={() => setActiveDropdown(null)}
                              className="block px-5 py-2.5 text-[13px] font-normal text-[#151412] hover:text-[#B49A70] hover:bg-[#FAF8F5] transition-all"
                            >
                              {sub.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
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
