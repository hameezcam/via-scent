import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Building2,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { BRAND_CONFIG } from "@/config/brand.config";

export const metadata = {
  title: "Commercial Scent Architecture for Businesses | Dr. Scent Sri Lanka Franchise",
  description:
    "Bespoke commercial ambient scenting solutions for hotels, resorts, corporate offices, and luxury retail across Sri Lanka. HVAC duct atomizers and scheduled servicing.",
};

export default function BusinessScentingPage() {
  const breadcrumbs = [
    { label: "Business Scenting" },
  ];

  const benefits = [
    {
      title: "Enhanced Guest Brand Recall",
      description: "Studies demonstrate that human memory retention linked to olfaction is 100 times higher than visual memory alone, creating enduring emotional bonds with your establishment.",
    },
    {
      title: "Elevated Perception of Luxury",
      description: "Carefully calibrated woody, amber, or crisp tea notes subconsciously signal superior cleanliness, architectural attention, and high executive caliber.",
    },
    {
      title: "Prolonged Dwell Time & Sales",
      description: "In luxury retail environments, pleasant ambient scenting has been shown to increase customer browsing duration by up to 20% and purchase intent.",
    },
    {
      title: "100% Odor Neutralization",
      description: "Active malodor counteraction technology chemically eliminates unwanted atmospheric odors rather than simply masking them with heavy perfumes.",
    },
  ];

  const systems = [
    {
      title: "HVAC Central Duct Scent Systems",
      subtitle: "For Whole-Building Uniform Dispersal",
      coverage: "5,000 to 50,000+ sq.ft",
      description:
        "Engineered to inject dry sub-micron aroma mist directly into your existing Air Handling Unit (AHU) or central ventilation ductwork. Entire hotel lobbies, multistory atriums, and convention centres are scented invisibly with zero wall-mounted clutter.",
      image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=85",
      link: "/products/dr-scent-hvac-commercial-system-5000",
    },
    {
      title: "Smart Commercial Column Towers",
      subtitle: "For Zoned Showrooms & Boutiques",
      coverage: "1,000 to 3,500 sq.ft",
      description:
        "Sculptural floor-standing columns designed to integrate seamlessly into high-end interior architecture. Equipped with Wi-Fi and Bluetooth cloud management to schedule morning-to-night intensity schedules.",
      image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=85",
      link: "/products/dr-scent-smart-tower-pro",
    },
  ];

  const workflow = [
    {
      step: "01",
      title: "On-Site Space Assessment",
      desc: "Our scent consultants analyze your floor plans, ceiling heights, HVAC airflow directions, and traffic patterns in Greater Colombo or islandwide.",
    },
    {
      step: "02",
      title: "Fragrance Curation & Trial",
      desc: "We provide an on-site sample flight of authorized Dr. Scent formulations tailored to your brand identity and interior mood.",
    },
    {
      step: "03",
      title: "Installation & Programming",
      desc: "Discreet installation by trained technical staff, complete with digital scheduling aligned to your business operating hours.",
    },
    {
      step: "04",
      title: "Monthly Replenishment Service",
      desc: "Hassle-free scheduled visits to restock pure fragrance oils, calibrate intensity, and maintain pumps under full franchise warranty.",
    },
  ];

  return (
    <div className="bg-[#FAF8F5]">
      {/* Hero Banner */}
      <section className="bg-stone-900 text-stone-100 py-16 sm:py-24 border-b border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-950/80 border border-amber-700/60 text-amber-300 text-xs font-semibold tracking-wider uppercase">
              <Building2 className="w-3.5 h-3.5" />
              <span>Commercial Fragrance Architecture</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-white leading-tight">
              Transform your commercial environment into an indelible{" "}
              <span className="italic font-normal text-amber-300">sensory brand experience.</span>
            </h1>

            <p className="text-stone-300 text-sm sm:text-base leading-relaxed max-w-2xl">
              As an authorized franchise partner for Dr. Scent in Sri Lanka, {BRAND_CONFIG.brandName} delivers medical-grade cold-air diffusion technology, IFRA-certified pure formulations, and comprehensive maintenance packages for five-star hotels, luxury residential developments, corporate headquarters, and flagship retail.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row gap-4">
              <Link
                href="/business-scenting/request-quote"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-amber-400 text-stone-950 font-semibold text-xs tracking-wider uppercase rounded hover:bg-amber-300 transition-colors shadow-sm"
              >
                <span>Request B2B Consultation & Quote</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#systems"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-stone-800 border border-stone-700 text-stone-200 font-medium text-xs tracking-wider uppercase rounded hover:bg-stone-700 transition-colors"
              >
                <span>Explore Scent Systems</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Breadcrumbs items={breadcrumbs} />

        {/* Benefits Grid */}
        <section className="py-12 border-b border-stone-200">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-semibold tracking-widest uppercase text-amber-800 block mb-1">
              The Strategic Business Case
            </span>
            <h2 className="font-serif text-3xl text-stone-900 font-medium">
              Why Architectural Scent Marketing Matters
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {benefits.map((b) => (
              <div key={b.title} className="p-6 bg-white rounded-lg border border-stone-200 shadow-xs space-y-2">
                <h3 className="font-serif text-lg font-medium text-stone-900 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-amber-800 shrink-0" />
                  <span>{b.title}</span>
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed pl-7">
                  {b.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Systems Section */}
        <section id="systems" className="py-16 border-b border-stone-200">
          <div className="max-w-2xl mb-12">
            <span className="text-xs font-semibold tracking-widest uppercase text-amber-800 block mb-1">
              Industrial Grade Nebulization
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-stone-900 font-medium">
              Cold-Air Commercial Hardware
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-2">
              Engineered by Dr. Scent for continuous 24/7 commercial operation with sub-micron atomization and zero duct condensation.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {systems.map((sys) => (
              <div
                key={sys.title}
                className="bg-white rounded-lg border border-stone-200 overflow-hidden shadow-xs flex flex-col justify-between"
              >
                <div className="relative aspect-[16/9] w-full bg-stone-100">
                  <Image
                    src={sys.image}
                    alt={sys.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                  <div className="absolute top-4 left-4 bg-stone-900/90 text-amber-200 text-xs font-semibold px-3 py-1 rounded">
                    Coverage: {sys.coverage}
                  </div>
                </div>

                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-800 block">
                      {sys.subtitle}
                    </span>
                    <h3 className="font-serif text-xl font-medium text-stone-900 mt-1">
                      {sys.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mt-2">
                      {sys.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                    <Link
                      href={sys.link}
                      className="text-xs font-semibold text-stone-900 hover:text-amber-900 uppercase tracking-wider flex items-center gap-1"
                    >
                      <span>View Specifications</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>

                    <Link
                      href="/business-scenting/request-quote"
                      className="px-3.5 py-1.5 bg-stone-900 text-amber-100 text-xs font-semibold uppercase tracking-wider rounded hover:bg-stone-800 transition-colors"
                    >
                      Inquire System
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4-Step Consultation Workflow */}
        <section className="py-16 border-b border-stone-200">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-semibold tracking-widest uppercase text-amber-800 block mb-1">
              Professional Engagement Model
            </span>
            <h2 className="font-serif text-3xl text-stone-900 font-medium">
              From Site Survey to Ongoing Scent Management
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {workflow.map((w) => (
              <div key={w.step} className="p-6 bg-white rounded-lg border border-stone-200 shadow-xs space-y-2">
                <span className="font-serif text-3xl font-bold text-amber-800/40 block">
                  {w.step}
                </span>
                <h3 className="font-serif text-base font-semibold text-stone-900">
                  {w.title}
                </h3>
                <p className="text-xs text-stone-500 leading-relaxed">
                  {w.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA Banner */}
        <section className="py-16 text-center">
          <div className="max-w-3xl mx-auto bg-stone-900 text-white rounded-2xl p-8 sm:p-12 shadow-2xl border border-stone-800 space-y-6">
            <ShieldCheck className="w-12 h-12 text-amber-400 mx-auto" />
            <h2 className="font-serif text-2xl sm:text-4xl font-normal leading-tight">
              Request Your Commercial Scenting Consultation
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 max-w-xl mx-auto leading-relaxed">
              Our Colombo engineering and fragrance team will review your architectural floor plans and arrange a tailored demonstration at your property.
            </p>
            <div>
              <Link
                href="/business-scenting/request-quote"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-amber-400 text-stone-950 font-semibold text-xs tracking-wider uppercase rounded hover:bg-amber-300 transition-colors shadow-sm"
              >
                <span>Complete Quote Request Form</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
