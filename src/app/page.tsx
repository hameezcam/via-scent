import { productService } from "@/services/product.service";
import { partnerService } from "@/services/partner.service";
import { categoryService } from "@/services/category.service";
import { HeroSection } from "@/components/home/HeroSection";
import { TrustedPartnersSection } from "@/components/home/TrustedPartnersSection";
import { FeaturedCategories } from "@/components/home/FeaturedCategories";
import { B2BFeatureSection } from "@/components/home/B2BFeatureSection";
import { TrustSection } from "@/components/home/TrustSection";
import { RecentlyAddedSection } from "@/components/home/RecentlyAddedSection";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Luxury Home Fragrance & Architectural Scenting | Dr. Scent Franchisee Sri Lanka",
  description:
    "Discover authorized Dr. Scent cold-air aroma diffusers, pure fragrance oils, and commercial scenting installations across Sri Lanka. Residential elegance and B2B fragrance architecture.",
};

export default async function HomePage() {
  const [allProducts, partners, featuredCategories] = await Promise.all([
    productService.getAll(),
    partnerService.getAll(true),
    categoryService.getFeaturedInHome(),
  ]);
  const newProducts = allProducts.filter((p) => p.isNew);

  const featuredHeroProduct =
    allProducts.find((p) => p.slug === "dr-scent-smart-tower-pro") ||
    allProducts.find((p) => p.featured) ||
    allProducts[0];

  // Extract up to 4 recently added products (prioritizing isNew)
  const recentlyAddedToDisplay = [
    ...newProducts,
    ...allProducts.filter((p) => !newProducts.some((np) => np.id === p.id)),
  ].slice(0, 4);

  return (
    <div className="flex flex-col min-h-screen">
      {/* 4.A Hero */}
      <HeroSection featuredProduct={featuredHeroProduct} />

      {/* 4.B Featured Categories ("Find your atmosphere.") */}
      <FeaturedCategories initialCategories={featuredCategories} />

      {/* 4.C Recently Added Products */}
      <RecentlyAddedSection products={recentlyAddedToDisplay} />

      {/* 4.D Business Scenting Feature */}
      <B2BFeatureSection />

      {/* 4.E Trust & Service Information */}
      <TrustSection />

      {/* 4.F Our Trusted Clients Slideshow */}
      <TrustedPartnersSection initialPartners={partners} />
    </div>
  );
}
