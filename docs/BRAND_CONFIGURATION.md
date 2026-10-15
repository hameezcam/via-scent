# Brand Configuration Guide

## Overview

The fragrance store is designed around a **franchise-ready architecture**. Because the final local business name is pending corporate registration, all branding parameters, contact numbers, showroom addresses, and franchise statements are strictly centralized in a single configuration file:

`src/config/brand.config.ts`

No brand names or contact details are hardcoded across components or pages.

---

## 1. Modifying the Brand Identity

To change the business name once finalized, open `src/config/brand.config.ts` and update the `BRAND_CONFIG` object:

```typescript
export const BRAND_CONFIG: BrandConfig = {
  // Replace placeholder with the official selected business name:
  brandName: "CEYLON SCENT ATELIER", 
  brandShortName: "CEYLON SCENT",
  
  // Official franchise authorization statement:
  franchiseStatement: "Authorized Franchisee Partner for Dr. Scent",
  
  // Refined tagline:
  brandTagline: "The Art of Architectural Scenting & Luxury Fragrance",
  
  // ...
};
```

Updating this single object will automatically cascade across:
- Browser `<title>` and metadata
- Header wordmark and franchise subtext
- Footer copyright and disclosures
- Announcement bar
- About page narratives
- Policy documents and email placeholders

---

## 2. Currency Formatting

Sri Lankan Rupee (`LKR` / `Rs.`) formatting is handled by the helper function in `src/config/brand.config.ts`:

```typescript
formatLKR(amount: number, showDecimals?: boolean): string
```

Example usage:
- `formatLKR(28500)` produces `Rs. 28,500`
- `formatLKR(28500, true)` produces `Rs. 28,500.00`

---

## 3. Contact & Showroom Placeholders

All contact values are clearly labelled as demonstration placeholders until physical showroom lease and telecom numbers are officially secured:

```typescript
contact: {
  email: "concierge@localbrand.lk (Demo Placeholder)",
  phone: "+94 11 200 0000 (Demo Placeholder)",
  whatsapp: "+94 77 000 0000 (Demo Placeholder)",
  address: "Boutique Suite 4, Crescat Boulevard / One Galle Face, Colombo, Sri Lanka (Demo Placeholder)",
  hours: "Monday – Saturday: 10:00 AM – 7:30 PM | Sunday: 11:00 AM – 5:00 PM",
}
```

---

## 4. Visual Identity Guidelines

- **Primary Canvas Surfaces:** Warm Ivory (`#FAF8F5`) and Soft Alabaster (`#F4EFEA`)
- **Typography:**
  - Headings: Refined Serif (`Playfair Display`, `Georgia`)
  - Body Text: Clean Geometric Sans (`Plus Jakarta Sans`, `Geist`)
- **Accent Colours:** Brushed Brass / Champagne Gold (`#B89758`, `#CBB079`, `#96783E`)
- **Text & Contrast:** Charcoal / Deep Espresso (`#1C1917`, `#292524`)
- **Border Tones:** Subtle Linen / Stone (`#E7E2D8`)
