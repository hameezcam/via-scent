"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Truck,
  RotateCcw,
  ShieldCheck,
  Sliders,
  History,
  Store,
  ExternalLink,
  Building2,
  FolderTree,
  Sparkles,
  LogOut,
} from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/admin-login");
    router.refresh();
  };

  const navItems = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
    { label: "Products Catalogue", href: "/admin/products", icon: Store },
    { label: "Interactive Living Room", href: "/admin/interactive-room", icon: Sparkles },
    { label: "Categories", href: "/admin/categories", icon: FolderTree },
    { label: "Trusted Clients", href: "/admin/partners", icon: Building2 },
    { label: "Delivery Settings (LKR 500)", href: "/admin/settings/delivery", icon: Truck },
    { label: "Store Policies & Payments", href: "/admin/settings", icon: Sliders },
    { label: "Returns & Refunds", href: "/admin/returns", icon: RotateCcw },
    { label: "Warranty Claims", href: "/admin/warranty", icon: ShieldCheck },
    { label: "Audit Logs", href: "/admin/audit", icon: History },
  ];

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col font-sans">
      {/* Top Admin Header */}
      <header className="bg-stone-900 text-white border-b border-stone-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="flex items-center gap-2">
              <span className="font-serif text-lg font-bold tracking-wider text-amber-100">
                VIA Scent
              </span>
              <span className="text-[10px] bg-amber-900/60 text-amber-200 border border-amber-800 px-2 py-0.5 rounded font-mono uppercase">
                Admin Console
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log out</span>
            </button>
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-stone-800 hover:bg-stone-700 text-amber-200 transition-colors"
            >
              <span>View Storefront</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Navigation Bar */}
        <div className="bg-stone-800 border-t border-stone-700 overflow-x-auto scrollbar-none">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center gap-2 px-3.5 py-2.5 text-xs font-medium whitespace-nowrap transition-colors border-b-2 ${
                    isActive
                      ? "border-amber-400 text-amber-300 bg-stone-900/50"
                      : "border-transparent text-stone-300 hover:text-white hover:bg-stone-700/50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Admin Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Admin Footer */}
      <footer className="bg-stone-200 border-t border-stone-300 py-4 text-center text-xs text-stone-600">
        <p>
          VIA Scent Operations & Storefront Admin • Authorized Dr. Scent Franchisee Sri Lanka
        </p>
      </footer>
    </div>
  );
}
