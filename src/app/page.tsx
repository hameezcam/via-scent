import { productService } from "@/services/product.service";
import { withServedImagesAll } from "@/lib/product-images";
import { partnerService } from "@/services/partner.service";
import { categoryService } from "@/services/category.service";
import { interactiveRoomService } from "@/services/interactive-room.service";
import { HeroSection } from "@/components/home/HeroSection";
import { TrustedPartnersSection } from "@/components/home/TrustedPartnersSection";
import { FeaturedCategories } from "@/components/home/FeaturedCategories";
import { B2BFeatureSection } from "@/components/home/B2BFeatureSection";
import { TrustSection } from "@/components/home/TrustSection";
import { RecentlyAddedSection } from "@/components/home/RecentlyAddedSection";
import { InteractiveRoomSection } from "@/components/home/InteractiveRoomSection";
import { ScentFinderTeaser } from "@/components/home/ScentFinderTeaser";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Luxury Home Fragrance & Architectural Scenting | Dr. Scent Franchisee Sri Lanka",
  description:
    "Discover authorized Dr. Scent cold-air aroma diffusers, pure fragrance oils, and commercial scenting installations across Sri Lanka. Residential elegance and B2B fragrance architecture.",
};

export default async function HomePage() {
  const [allProducts, partners, featuredCategories, roomConfig] = await Promise.all([
    productService.getAll().then(withServedImagesAll),
    partnerService.getAll(true),
    categoryService.getFeaturedInHome(),
    interactiveRoomService.getConfig(),
  ]);
  const newProducts = allProducts.filter((p) => p.isNew);

  // Extract up to 4 recently added products (prioritizing isNew)
  const recentlyAddedToDisplay = [
    ...newProducts,
    ...allProducts.filter((p) => !newProducts.some((np) => np.id === p.id)),
  ].slice(0, 4);

  return (
    <div className="flex flex-col min-h-screen">
      {/* 4.A Hero */}
      <HeroSection />

      {/* 4.B Delivery, payment, warranty and returns at a glance */}
      <TrustSection />

      {/* 4.C Featured Categories ("Find your atmosphere.") */}
      <FeaturedCategories initialCategories={featuredCategories} />

      {/* Scent finder prompt */}
      <ScentFinderTeaser />

      {/* 4.D New Arrivals */}
      <RecentlyAddedSection products={recentlyAddedToDisplay} />

      {/* 4.E Interactive Room Collection with Product Hotspots */}
      <InteractiveRoomSection initialConfig={roomConfig} />

      {/* 4.F Business Scenting Feature */}
      <B2BFeatureSection />

      {/* 4.G Our Trusted Clients Slideshow */}
      <TrustedPartnersSection initialPartners={partners} />
    </div>
  );
}
