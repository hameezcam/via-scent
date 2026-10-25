import type { Metadata } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { BRAND_CONFIG } from "@/config/brand.config";
import { categoryService } from "@/services/category.service";
import type { Category } from "@/types/category";
import { getSiteUrl, isIndexingAllowed } from "@/lib/site-url";

const serifFont = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
});

const sansFont = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: `${BRAND_CONFIG.brandName} | Authorized Franchisee Partner for Dr. Scent Sri Lanka`,
    template: `%s | ${BRAND_CONFIG.brandName} Sri Lanka`,
  },
  description: BRAND_CONFIG.brandDescription,
  keywords: [
    "luxury fragrance Sri Lanka",
    "aroma diffusers Colombo",
    "commercial scenting Sri Lanka",
    "Dr. Scent Sri Lanka",
    "fragrance oils",
    "hotel scenting Colombo",
  ],
  authors: [{ name: BRAND_CONFIG.brandName }],
  openGraph: {
    title: `${BRAND_CONFIG.brandName} | Luxury Fragrance & Architectural Scenting`,
    description: BRAND_CONFIG.brandDescription,
    type: "website",
    locale: "en_LK",
    siteName: BRAND_CONFIG.brandName,
  },
  // Previews stay out of search results until NEXT_PUBLIC_ALLOW_INDEXING=true
  robots: {
    index: isIndexingAllowed(),
    follow: isIndexingAllowed(),
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let categories: Category[] = [];
  try {
    categories = await categoryService.getAll();
  } catch (err) {
    console.error("[RootLayout] Failed to load categories:", err);
  }

  return (
    <html lang="en" className={`${serifFont.variable} ${sansFont.variable} h-full scroll-smooth`}>
      <body className="min-h-full flex flex-col bg-stone-50 text-stone-900 font-sans antialiased selection:bg-amber-100 selection:text-amber-900">
        <CartProvider>
          <AnnouncementBar />
          <Header initialCategories={categories} />
          <main className="flex-1">{children}</main>
          <Footer initialCategories={categories} />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
