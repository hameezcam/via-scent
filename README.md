# VIA Scent — Luxury Fragrance & Scenting Solutions Storefront
### Authorized Franchisee Partner for Dr. Scent in Sri Lanka

A production-oriented, premium Next.js 16 e-commerce platform and commercial scent architecture portal built for **VIA Scent**, the authorized Sri Lankan franchisee partner of **Dr. Scent**.

The application supports both B2C retail purchases in Sri Lankan Rupees (LKR) and B2B commercial scenting consultations across Sri Lanka. It features full administrative portals for product catalogue management, orders, delivery configuration, warranty verification, and returns processing.

---

## Phase 1 Features

- **Luxury Design System:** Warm ivory surfaces, deep charcoal typography, brushed champagne gold accents, and refined serif editorial headings (`Playfair Display`).
- **Configurable Identity:** Centralized in `src/config/brand.config.ts`.
- **Responsive Application Shell:**
  - Announcement bar with Dr. Scent franchise verification badge
  - Sticky header with search flyout, account portal modal, and live shopping cart badge
  - Full-featured mobile navigation drawer
  - Comprehensive footer with franchise disclosures and honest demo newsletter interaction
- **8 Homepage Sections:**
  1. High-impact editorial Hero with dual B2C/B2B CTAs
  2. Featured category tiles
  3. Bestselling diffusers and oils in responsive grid with quick-view and add-to-cart
  4. Brand experience explaining cold-air micro-nebulization science
  5. Commercial B2B section for hotels, corporate towers, and spas
  6. Curated editorial collections for residences and executive suites
  7. Trust and service information (islandwide delivery, official warranty)
  8. Olfactory gazette newsletter
- **Shop & Discovery:**
  - `/shop` and `/shop/[category]` with live filtering by category, scent family, availability, and price sorting
  - Instant search at `/search`
- **Product Detail Experience:**
  - `/products/[slug]` with interactive gallery, variant selection, live stock badges, scent notes, specifications, usage instructions, and related products
- **Client-Side Shopping Cart:**
  - Slide-over CartDrawer + dedicated `/cart` page
  - Subtotal calculation in Sri Lankan Rupees (LKR)
  - Safe `localStorage` persistence (no sensitive data)
  - Clear preview mode notices for upcoming Phase 2 payment gateway
- **B2B Consultation Portal:**
  - `/business-scenting` landing page
  - `/business-scenting/request-quote` interactive form with client-side validation and accessible labels
- **Draft Policy Suite:**
  - `/shipping`, `/returns`, `/privacy`, `/terms`
- **Error Handling & SEO:**
  - Custom `not-found.tsx` and `error.tsx`
  - Automated `sitemap.ts` and `robots.ts`

---

## Quick Start & Running Locally

### 1. Install Dependencies
```bash
cd "C:\Users\ASUS TUF\.gemini\antigravity-ide\scratch\fragrance-store"
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Run Production Build Verification
```bash
npm run build
npm start
```

### 4. Run Linting & Type Checking
```bash
npm run lint
```

---

## Documentation

- **Brand Configuration:** [docs/BRAND_CONFIGURATION.md](docs/BRAND_CONFIGURATION.md)
- **Phase 1 Implementation Report:** [docs/PHASE_1_IMPLEMENTATION.md](docs/PHASE_1_IMPLEMENTATION.md)
- **Phase 2 Technical Roadmap:** [docs/PHASE_2_PLAN.md](docs/PHASE_2_PLAN.md)
