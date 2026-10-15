# Phase 2 Engineering Plan — Backend, Persistence, Payments & Administration

## Overview

Phase 1 established the design system, storefront components, responsive shell, cart state, and service abstractions. Phase 2 transitions the application from a client-side preview to a fully persistent, secure, production-grade e-commerce platform.

---

## 1. Database & Persistence Architecture (PostgreSQL & Prisma)

### Database Schema Design
- **Users & Auth:**
  - `User` (id, email, passwordHash, role: CUSTOMER | B2B_CLIENT | ADMIN)
  - `Address` (district, province, postalCode, street, city)
- **Product Catalogue:**
  - `Category` (id, name, slug, description, image)
  - `Product` (id, name, slug, sku, categoryId, basePriceLKR, inStock, specifications, scentNotes)
  - `ProductVariant` (id, productId, sku, name, priceLKR, stockQuantity)
- **Cart & Orders:**
  - `Order` (id, orderNumber, customerId, status: PENDING | PAID | DISPATCHED | DELIVERED, subtotalLKR, deliveryFeeLKR, totalLKR)
  - `OrderItem` (id, orderId, variantId, quantity, unitPriceLKR)
- **Commercial Inquiries:**
  - `CommercialEnquiry` (id, fullName, companyName, email, phone, industry, spaceSize, cityDistrict, status: NEW | CONTACTED | QUOTED | WON | ARCHIVED)

### Service Layer Migration
Because Phase 1 encapsulates all product access behind `IProductService` in `src/services/product.service.ts`, migrating to Prisma requires creating a `PrismaProductService` implementing `IProductService`:

```typescript
export class PrismaProductService implements IProductService {
  async getAll(params?: ProductFilterParams): Promise<Product[]> {
    return prisma.product.findMany({ /* filters & relations */ });
  }
  // ...
}
```
No UI components or page files will need rewrites.

---

## 2. Authentication & Customer Accounts

- Integrate NextAuth.js or Lucia Auth with session management.
- Support passwordless magic links or OTP verification for Sri Lankan mobile numbers.
- Provide a Customer Portal (`/account`) with order tracking, invoice downloads, and fragrance subscription preferences.

---

## 3. Sri Lankan Digital Payment Gateway Integration

- Integrate local Sri Lankan IPG providers (e.g. Commercial Bank of Ceylon IPG, PayHere, or HNB WebXPay).
- Support Visa, Mastercard, LankaQR, and Cash on Delivery (COD) for Greater Colombo.
- Webhook signature verification to prevent spoofed order completion.

---

## 4. B2B Commercial Lead Engine & Automated Notifications

- Connect `/business-scenting/request-quote` to a server action that:
  - Validates input with Zod
  - Persists record to `CommercialEnquiry` table
  - Triggers internal email notification to the Colombo sales desk via Resend or SMTP
  - Sends an automated branded PDF receipt and brochure to the inquiring client

---

## 5. Administrative Dashboard (`/admin`)

- Secure role-protected dashboard for store operators:
  - Inventory count adjustments and low-stock alerts
  - Commercial B2B quote pipeline management
  - Order status updates and automated dispatch SMS triggers
  - Price adjustments and seasonal collection curation
