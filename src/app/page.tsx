import { productService } from "@/services/product.service";
import { HeroSection } from "@/components/home/HeroSection";
import { FeaturedCategories } from "@/components/home/FeaturedCategories";
import { BestsellersSection } from "@/components/home/BestsellersSection";
import { BrandExperienceSection } from "@/components/home/BrandExperienceSection";
import { B2BFeatureSection } from "@/components/home/B2BFeatureSection";
import { CuratedCollectionsSection } from "@/components/home/CuratedCollectionsSection";
import { TrustSection } from "@/components/home/TrustSection";
import { NewsletterSection } from "@/components/home/NewsletterSection";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Luxury Home Fragrance & Architectural Scenting | Dr. Scent Franchisee Sri Lanka",
  description:
    "Discover authorized Dr. Scent cold-air aroma diffusers, pure fragrance oils, and commercial scenting installations across Sri Lanka. Residential elegance and B2B fragrance architecture.",
};

export default async function HomePage() {
  const bestsellers = await productService.getBestsellers(8);
  const allProducts = await productService.getAll();
  const productsToDisplay =
    bestsellers.length >= 4
      ? bestsellers.slice(0, 4)
      : [...bestsellers, ...allProducts.filter((p) => !bestsellers.some((b) => b.id === p.id))].slice(0, 4);

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

      {/* 4.H Newsletter */}
      <NewsletterSection />
    </div>
  );
}
