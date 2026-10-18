"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Search, ShoppingBag, User, Menu, ChevronDown, Sparkles, X, ArrowRight, ShieldCheck } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { BRAND_CONFIG } from "@/config/brand.config";
import { MobileNav } from "./MobileNav";
import { Product } from "@/types/product";

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
      { label: "Car Scent", href: "/shop/fragrance-oils?sub=car-scent" },
      { label: "Dr. Scent's Choice", href: "/shop/fragrance-oils?sub=choice" },
      { label: "F&B", href: "/shop/fragrance-oils?sub=fb" },
      { label: "Floral", href: "/shop/fragrance-oils?sub=floral" },
      { label: "Fresh", href: "/shop/fragrance-oils?sub=fresh" },
      { label: "Fruity", href: "/shop/fragrance-oils?sub=fruity" },
      { label: "Oriental", href: "/shop/fragrance-oils?sub=oriental" },
      { label: "Premium Collection", href: "/shop/fragrance-oils?sub=premium" },
    ],
  },
  {
    id: "diffuser",
    label: "DIFFUSER",
    href: "/shop/aroma-diffusers",
    items: [
      { label: "Diffuser", href: "/shop/aroma-diffusers?sub=diffuser" },
      { label: "Car Diffuser", href: "/shop/aroma-diffusers?sub=car-diffuser" },
      { label: "Dispenser", href: "/shop/aroma-diffusers?sub=dispenser" },
      { label: "Reed Diffuser", href: "/shop/aroma-diffusers?sub=reed-diffuser" },
    ],
  },
  {
    id: "best-sellers",
    label: "BEST SELLERS",
    href: "/shop?category=bestsellers",
    items: [
      { label: "Diffusers", href: "/shop?category=bestsellers&sub=diffusers" },
      { label: "Aroma Oils", href: "/shop?category=bestsellers&sub=aroma-oils" },
      { label: "Sprays", href: "/shop?category=bestsellers&sub=sprays" },
      { label: "Reed Diffusers", href: "/shop?category=bestsellers&sub=reed-diffusers" },
      { label: "Candles", href: "/shop?category=bestsellers&sub=candles" },
    ],
  },
  {
    id: "sprays",
    label: "SPRAYS",
    href: "/shop?category=sprays",
    items: [
      { label: "Fabric Spray", href: "/shop?category=sprays&sub=fabric-spray" },
      { label: "Odor Eliminator", href: "/shop?category=sprays&sub=odor-eliminator" },
      { label: "Aerosol", href: "/shop?category=sprays&sub=aerosol" },
    ],
  },
  {
    id: "candles",
    label: "CANDLES",
    href: "/shop/candles",
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

  const [liveResults, setLiveResults] = useState<Product[]>([]);
  const [isLoadingLive, setIsLoadingLive] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch live search results when user types 2 or more characters
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!isSearchOpen || trimmed.length < 2) {
      setLiveResults([]);
      setIsLoadingLive(false);
      return;
    }

    setIsLoadingLive(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
            setLiveResults(json.data.slice(0, 5));
          }
        }
      } catch (err) {
        console.error("Live search failed:", err);
      } finally {
        setIsLoadingLive(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery, isSearchOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery("");
      setLiveResults([]);
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

              <Link href="/" className="flex items-center group select-none py-1">
                <div className="relative h-11 w-44 sm:h-13 sm:w-52 transition-transform duration-200 group-hover:scale-[1.02]">
                  <Image
                    src="/images/via-scent-logo.png"
                    alt="VIA SCENT Sri Lanka - Fragrances • Aroma • Lifestyle"
                    fill
                    priority
                    unoptimized
                    className="object-contain object-left"
                    sizes="(max-width: 640px) 176px, 208px"
                  />
                </div>
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
          <div className="border-t border-[#E7E2D8] bg-[#FAF8F5] py-4 px-4 sm:px-6 shadow-xl animate-in slide-in-from-top-1 duration-200">
            <div className="max-w-2xl mx-auto">
              <form onSubmit={handleSearchSubmit} className="flex items-center gap-3">
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
                  className="px-4 py-2 bg-[#151412] text-[#EFEAE1] hover:bg-[#211C19] text-xs font-semibold tracking-wider uppercase rounded transition-colors cursor-pointer"
                >
                  Search
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsSearchOpen(false);
                    setSearchQuery("");
                    setLiveResults([]);
                  }}
                  className="p-1 text-[#8A8275] hover:text-[#151412] cursor-pointer"
                  aria-label="Close search"
                >
                  <X className="w-5 h-5" />
                </button>
              </form>

              {/* Live search results popup */}
              {searchQuery.trim().length >= 2 && (
                <div className="mt-3 bg-white rounded-md border border-[#E7E2D8] shadow-xl overflow-hidden animate-in fade-in duration-150">
                  {isLoadingLive ? (
                    <div className="py-4 text-center text-xs text-[#8A8275]">
                      Searching franchise collection...
                    </div>
                  ) : liveResults.length > 0 ? (
                    <div>
                      <div className="px-4 py-2 bg-[#FAF8F5] border-b border-[#E7E2D8] text-[10px] font-semibold uppercase tracking-wider text-[#8A8275] flex justify-between items-center">
                        <span>Matching Creations</span>
                        <Link
                          href={`/shop?q=${encodeURIComponent(searchQuery.trim())}`}
                          onClick={() => {
                            setIsSearchOpen(false);
                            setSearchQuery("");
                            setLiveResults([]);
                          }}
                          className="text-[#B49A70] hover:underline"
                        >
                          View all in catalogue →
                        </Link>
                      </div>
                      <div className="divide-y divide-[#E7E2D8]/60 max-h-80 overflow-y-auto">
                        {liveResults.map((product) => (
                          <Link
                            key={product.id}
                            href={`/product/${product.slug}`}
                            onClick={() => {
                              setIsSearchOpen(false);
                              setSearchQuery("");
                              setLiveResults([]);
                            }}
                            className="flex items-center gap-3 p-3 hover:bg-[#FAF8F5] transition-colors group"
                          >
                            <div className="w-12 h-12 relative rounded bg-stone-100 overflow-hidden shrink-0 border border-stone-200">
                              <Image
                                src={product.images[0] || "/images/products/placeholder.jpg"}
                                alt={product.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-medium text-[#151412] group-hover:text-[#B49A70] truncate transition-colors">
                                {product.name}
                              </div>
                              <div className="text-[10px] text-[#8A8275] truncate">
                                {product.categoryName || product.category}
                              </div>
                            </div>
                            <div className="text-xs font-serif font-medium text-[#151412] shrink-0">
                              LKR {product.basePriceLKR.toLocaleString()}
                            </div>
                          </Link>
                        ))}
                      </div>
                      <div className="p-2.5 bg-[#FAF8F5] border-t border-[#E7E2D8] text-center">
                        <Link
                          href={`/shop?q=${encodeURIComponent(searchQuery.trim())}`}
                          onClick={() => {
                            setIsSearchOpen(false);
                            setSearchQuery("");
                            setLiveResults([]);
                          }}
                          className="text-xs font-medium text-[#151412] hover:text-[#B49A70] transition-colors inline-flex items-center gap-1.5"
                        >
                          <span>Explore all creations matching &ldquo;{searchQuery}&rdquo;</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="py-6 text-center text-xs text-[#8A8275]">
                      No matching creations found for &ldquo;{searchQuery}&rdquo;. Press Search or Enter to view full catalogue.
                    </div>
                  )}
                </div>
              )}
            </div>
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
                Guest checkout is enabled across VIA Scent. Order confirmations, dispatch notices, and tracking links are delivered directly via email and SMS.
              </p>
              <div className="pt-3 space-y-2">
                <Link
                  href="/returns"
                  onClick={() => setIsAccountModalOpen(false)}
                  className="block w-full py-2.5 px-4 bg-[#151412] hover:bg-[#211C19] text-[#B49A70] text-xs font-semibold tracking-widest uppercase rounded transition-colors"
                >
                  Track Order & Warranty
                </Link>
                <Link
                  href="/contact"
                  onClick={() => setIsAccountModalOpen(false)}
                  className="block w-full py-2 px-4 border border-[#E7E2D8] hover:bg-[#FAF8F5] text-[#211C19] text-xs font-medium tracking-wider uppercase rounded transition-colors"
                >
                  Contact Colombo Concierge
                </Link>
                <div className="pt-2 border-t border-[#E7E2D8]">
                  <Link
                    href="/admin"
                    onClick={() => setIsAccountModalOpen(false)}
                    className="text-[10px] text-[#8A8275] hover:text-[#151412] tracking-wider uppercase underline underline-offset-2"
                  >
                    Staff Management Access
                  </Link>
                </div>
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
