/**
 * Centralized Brand Configuration for VIA Scent
 * 
 * Official franchise partner for Dr. Scent in Sri Lanka.
 * Centralized settings ensure brand consistency, local market alignment,
 * and seamless adaptability across the application.
 */

export interface BrandConfig {
  brandName: string;
  brandShortName: string;
  franchiseStatement: string;
  brandTagline: string;
  brandDescription: string;
  announcementText: string;
  currency: {
    code: string;
    symbol: string;
    locale: string;
  };
  contact: {
    email: string;
    phone: string;
    whatsapp: string;
    address: string;
    hours: string;
  };
  social: {
    instagram: string;
    facebook: string;
    linkedin: string;
  };
  disclaimer: string;
  demoNotice: string;
}

export const BRAND_CONFIG: BrandConfig = {
  brandName: "VIA Scent",
  brandShortName: "VIA Scent",
  franchiseStatement: "Authorized Franchisee Partner for Dr. Scent in Sri Lanka",
  brandTagline: "The Art of Architectural Scenting & Luxury Fragrance",
  brandDescription:
    "VIA Scent is an authorized franchisee partner in Sri Lanka selling authentic Dr. Scent cold-air diffusion instruments, artisanal fragrance oils, and commercial scent architecture.",
  announcementText: "Islandwide Delivery across Sri Lanka • Standard Courier Fee LKR 500 • Complimentary B2B Consultation in Colombo",
  currency: {
    code: "LKR",
    symbol: "Rs.",
    locale: "en-LK",
  },
  contact: {
    email: "info@vialk.com",
    phone: "+94 71 019 3193",
    whatsapp: "+94 71 019 3193",
    address: "267, 17 Galle Rd, Colombo 03, Sri Lanka",
    hours: "Monday – Saturday: 10:00 AM – 7:30 PM | Sunday: 11:00 AM – 5:00 PM",
  },
  social: {
    instagram: "https://instagram.com/viascent.lk",
    facebook: "https://facebook.com/viascent.lk",
    linkedin: "https://linkedin.com/company/viascent-srilanka",
  },
  disclaimer:
    "VIA Scent operates as an independent authorized franchisee of Dr. Scent in Sri Lanka. All Dr. Scent marks, technologies, and formulations are used under authorized franchise rights.",
  demoNotice:
    "VIA Scent Online Storefront & Commercial Portal. Demonstrating authorized Dr. Scent catalogue, islandwide LKR 500 courier calculation, Cash on Delivery, and online digital payment workflows.",
};

/**
 * Format numerical prices into Sri Lankan Rupee standard presentation
 * e.g., 24500 -> "Rs. 24,500.00"
 */
export function formatLKR(amount: number, showDecimals: boolean = false): string {
  const formatted = new Intl.NumberFormat("en-LK", {
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(amount);

  return `${BRAND_CONFIG.currency.symbol} ${formatted}`;
}

/** Products without a price are sold by quotation rather than online. */
export function isPriceOnRequest(amount: number | undefined | null): boolean {
  return !amount || amount <= 0;
}

export function formatProductPrice(amount: number | undefined | null): string {
  return isPriceOnRequest(amount) ? "Price on request" : formatLKR(amount!);
}

/**
 * e.g. 6 -> "6-Month Official Franchise Warranty", 24 -> "2-Year Official Franchise Warranty".
 * Returns null when the product has no warranty (0 months, e.g. oils and sprays).
 */
export function formatWarranty(months: number | undefined | null): string | null {
  if (months === 0) return null;
  const m = months && months > 0 ? months : 6;
  const duration = m % 12 === 0 ? `${m / 12}-Year` : `${m}-Month`;
  return `${duration} Official Franchise Warranty`;
}
