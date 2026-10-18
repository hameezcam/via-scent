import { productService } from "@/services/product.service";
import { partnerService } from "@/services/partner.service";
import { HeroSection } from "@/components/home/HeroSection";
import { TrustedPartnersSection } from "@/components/home/TrustedPartnersSection";
import { FeaturedCategories } from "@/components/home/FeaturedCategories";
import { BestsellersSection } from "@/components/home/BestsellersSection";
import { BrandExperienceSection } from "@/components/home/BrandExperienceSection";
import { B2BFeatureSection } from "@/components/home/B2BFeatureSection";
import { CuratedCollectionsSection } from "@/components/home/CuratedCollectionsSection";
import { TrustSection } from "@/components/home/TrustSection";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Luxury Home Fragrance & Architectural Scenting | Dr. Scent Franchisee Sri Lanka",
  description:
    "Discover authorized Dr. Scent cold-air aroma diffusers, pure fragrance oils, and commercial scenting installations across Sri Lanka. Residential elegance and B2B fragrance architecture.",
};

export default async function HomePage() {
  const [allProducts, partners] = await Promise.all([
    productService.getAll(),
    partnerService.getAll(true),
  ]);
  const newProducts = allProducts.filter((p) => p.isNew);
  const featured = allProducts.filter((p) => p.featured);
  const bestsellers = allProducts.filter((p) => p.isBestseller);

  // Combine uniquely preserving order: new arrivals first, then featured, then bestsellers, then remaining
  const seen = new Set<string>();
  const productsToDisplay = [];
  for (const p of [...newProducts, ...featured, ...bestsellers, ...allProducts]) {
    if (!seen.has(p.id)) {
      seen.add(p.id);
      productsToDisplay.push(p);
    }
    if (productsToDisplay.length >= 8) break;
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* 4.A Hero */}
      <HeroSection />

      {/* 4.B Featured Categories */}
      <FeaturedCategories />

      {/* 4.C Bestsellers */}
      <BestsellersSection products={productsToDisplay} />

      {/* 4.D Brand Experience */}
      <BrandExperienceSection />

      {/* 4.E Business Scenting Feature */}
      <B2BFeatureSection />

      {/* 4.F Curated Collections */}
      <CuratedCollectionsSection />

      {/* 4.G Trust & Service Information */}
      <TrustSection />

      {/* 4.H Our Trusted Partners Slideshow (placed just before the footer) */}
      <TrustedPartnersSection initialPartners={partners} />
    </div>
  );
}
