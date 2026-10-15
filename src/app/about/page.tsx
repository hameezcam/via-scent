import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { ShieldCheck, Building2, Droplets, Wind } from "lucide-react";
import { BRAND_CONFIG } from "@/config/brand.config";

export const metadata = {
  title: "About Our Brand & Franchise Partnership | Dr. Scent Sri Lanka",
  description:
    "Learn about our partnership as an authorized franchisee for Dr. Scent in Sri Lanka, introducing architectural cold-air nebulization and artisanal fragrance oils.",
};

export default function AboutPage() {
  const breadcrumbs = [{ label: "About" }];

  return (
    <div className="bg-[#FAF8F5] py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumbs items={breadcrumbs} />

        {/* Hero Banner */}
        <div className="max-w-3xl pt-2 pb-12 space-y-4">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest uppercase text-amber-800">
            <ShieldCheck className="w-4 h-4 text-amber-700" />
            <span>Official Franchise Partnership</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl text-stone-900 font-normal tracking-tight leading-tight">
            The Art of Architectural Scenting & Ambient Elegance
          </h1>
          <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
            Operating as an independent authorized franchisee partner for Dr. Scent, {BRAND_CONFIG.brandName} introduces hospital-grade cold-air micro-nebulization engineering and IFRA-certified botanical perfumery to Sri Lanka.
          </p>
        </div>

        {/* Story Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center py-12 border-t border-b border-stone-200">
          <div className="lg:col-span-6 relative aspect-[4/3] rounded-xl overflow-hidden bg-stone-100 border border-stone-200 shadow-lg">
            <Image
              src="https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1000&q=85"
              alt="Fragrance flacon and amber oil craftsmanship"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>

          <div className="lg:col-span-6 space-y-6">
            <h2 className="font-serif text-2xl sm:text-3xl font-normal text-stone-900">
              Our Franchise Mandate in Sri Lanka
            </h2>
            <div className="space-y-4 text-xs sm:text-sm text-stone-600 leading-relaxed">
              <p>
                Our mission is simple yet uncompromising: to provide discerning homeowners, hoteliers, corporate directors, and interior architects across Sri Lanka with legitimate access to world-class scent diffusion technology.
              </p>
              <p>
                Under our franchise agreement with Dr. Scent, every diffusion instrument supplied in Sri Lanka is 100% genuine, backed by official warranties, trained local technicians, and certified replacement parts.
              </p>
              <p>
                Unlike generic consumer diffusers that rely on heat or water dilution, Dr. Scent instruments utilize cold-air micro-nebulization. This preserves the delicate chemical structure of the fragrance oil, producing an invisible dry mist that leaves zero residue on furniture, artwork, or floors.
              </p>
            </div>
          </div>
        </div>

        {/* Pillars */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 bg-white rounded-lg border border-stone-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center">
              <Wind className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-medium text-stone-900">
              Zero Water, Zero Heat
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Cold-air atomization preserves pure oil integrity without fostering bacteria in stagnant water tanks or altering fragrance notes through heating.
            </p>
          </div>

          <div className="p-6 bg-white rounded-lg border border-stone-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center">
              <Droplets className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-medium text-stone-900">
              IFRA Certified Safety
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Every fragrance oil batch complies with the International Fragrance Association (IFRA) 51st Amendment, ensuring safe inhalation in occupied environments.
            </p>
          </div>

          <div className="p-6 bg-white rounded-lg border border-stone-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-medium text-stone-900">
              Local Technical Support
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Our Colombo-based technical crew handles on-site room measurement, HVAC duct tapping, routine oil replenishment, and factory servicing.
            </p>
          </div>
        </div>

        {/* CTA Bar */}
        <div className="p-8 sm:p-12 bg-stone-900 rounded-xl text-stone-100 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="font-serif text-xl sm:text-2xl text-stone-100">
              Explore Our Collection or Inquire for Your Property
            </h3>
            <p className="text-xs text-stone-400">
              Browse retail instruments or schedule a tailored commercial site assessment in Greater Colombo.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/shop"
              className="px-6 py-3 bg-white text-stone-900 text-xs uppercase tracking-wider font-semibold rounded hover:bg-stone-100 transition-colors"
            >
              Shop Fragrances
            </Link>
            <Link
              href="/business-scenting/request-quote"
              className="px-6 py-3 bg-amber-400 text-stone-950 text-xs uppercase tracking-wider font-semibold rounded hover:bg-amber-300 transition-colors"
            >
              B2B Consultation
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
