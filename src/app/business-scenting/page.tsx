import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Building2,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
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
    { label: "Business Scenting Architecture" },
  ];

  const benefits = [
    {
      title: "Enhanced Brand Recall & Olfactory Memory",
      description: "Human memory retention linked to scent receptors is up to 100 times stronger than visual recall alone, anchoring your property in guest memories.",
    },
    {
      title: "Elevated Architectural Perception",
      description: "Carefully calibrated noble wood, white tea, and subtle amber notes signal hygiene, deliberate spatial curation, and five-star hospitality standards.",
    },
    {
      title: "Measured Dwell Time & Commerce",
      description: "In luxury retail environments, consistent ambient scent diffusion increases patron browsing duration and positive customer impressions.",
    },
    {
      title: "Active Malodor Neutralization",
      description: "Patented cold-air atomization counteracts ambient humidity and unwanted organic odor compounds rather than temporarily masking them.",
    },
  ];

  const systems = [
    {
      title: "HVAC Central Duct Diffusion System",
      subtitle: "For Whole-Property Invisible Dispersal",
      coverage: "5,000 to 50,000+ sq.ft",
      description:
        "Engineered to inject dry sub-micron aroma mist directly into Air Handling Units (AHU) or central ventilation ductwork. Entire hotel lobbies, multistory atriums, and convention centres are scented invisibly with zero wall-mounted clutter.",
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
      title: "On-Site Architectural Survey",
      desc: "Our scent consultants analyze your floor plans, ceiling heights, HVAC airflow directions, and traffic patterns in Greater Colombo or islandwide.",
    },
    {
      step: "02",
      title: "Fragrance Formulation Flight",
      desc: "We provide an on-site sample flight of authorized Dr. Scent formulations tailored to your brand identity and interior mood.",
    },
    {
      step: "03",
      title: "Precision Calibration",
      desc: "Discreet installation by trained technical staff, complete with digital scheduling aligned to your business operating hours.",
    },
    {
      step: "04",
      title: "Scheduled Franchise Refills",
      desc: "Hassle-free scheduled visits to restock pure fragrance oils, calibrate intensity, and maintain pumps under full franchise warranty.",
    },
  ];

  return (
    <div className="bg-[var(--porcelain)] text-[var(--near-black)]">
      {/* Hero Banner */}
      <section className="bg-[var(--near-black)] text-[var(--porcelain)] py-20 sm:py-28 border-b border-[var(--warm-stone)]/20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <Image
            src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=2000&q=80"
            alt="Luxury hotel lobby ambient lighting"
            fill
            className="object-cover filter grayscale contrast-125"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--deep-espresso)] border border-[var(--champagne)]/40 text-[var(--champagne)] text-[10px] uppercase tracking-[0.25em] font-medium">
              <Building2 className="w-3.5 h-3.5" />
              <span>Commercial Fragrance Architecture</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-[var(--porcelain)] leading-[1.12]">
              Transform your commercial environment into an indelible{" "}
              <span className="italic font-light text-[var(--champagne)]">sensory brand signature.</span>
            </h1>

            <p className="text-[var(--warm-stone)]/90 text-xs sm:text-sm leading-relaxed max-w-2xl font-light">
              As an authorized franchise partner for Dr. Scent in Sri Lanka, {BRAND_CONFIG.brandName} delivers commercial cold-air diffusion technology, IFRA-certified pure formulations, and comprehensive maintenance packages for five-star hotels, luxury villas, corporate headquarters, and flagship retail spaces.
            </p>

            <div className="pt-3 flex flex-col sm:flex-row gap-4">
              <Link
                href="/business-scenting/request-quote"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-[var(--porcelain)] text-[var(--near-black)] font-medium text-xs tracking-[0.2em] uppercase rounded-sm hover:bg-[var(--champagne)] hover:text-white transition-all duration-300 shadow-sm"
              >
                <span>Request B2B Consultation</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <a
                href="#systems"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-transparent border border-[var(--warm-stone)]/40 text-[var(--ivory)] font-light text-xs tracking-[0.2em] uppercase rounded-sm hover:border-[var(--champagne)] hover:text-[var(--champagne)] transition-colors"
              >
                <span>Explore Scent Systems</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="mb-8">
          <Breadcrumbs items={breadcrumbs} />
        </div>

        {/* Benefits Grid */}
        <section className="py-12 border-b border-[var(--warm-stone)]/40">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-[10px] font-medium tracking-[0.25em] uppercase text-[var(--champagne)] block mb-1.5">
              The Strategic Business Case
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[var(--near-black)] font-normal">
              Why Architectural Scent Engineering Matters
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {benefits.map((b) => (
              <div key={b.title} className="p-7 bg-white/80 backdrop-blur-sm rounded-sm border border-[var(--warm-stone)]/40 shadow-xs space-y-2 hover:border-[var(--champagne)]/60 transition-colors">
                <h3 className="font-serif text-lg font-medium text-[var(--near-black)] flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[var(--champagne)] shrink-0" />
                  <span>{b.title}</span>
                </h3>
                <p className="text-xs sm:text-sm text-[var(--deep-espresso)]/80 leading-relaxed pl-6 font-light">
                  {b.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Systems Section */}
        <section id="systems" className="py-16 border-b border-[var(--warm-stone)]/40">
          <div className="max-w-2xl mb-12">
            <span className="text-[10px] font-medium tracking-[0.25em] uppercase text-[var(--champagne)] block mb-1">
              Industrial Grade Nebulization
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[var(--near-black)] font-normal">
              Cold-Air Commercial Hardware
            </h2>
            <p className="text-xs sm:text-sm text-[var(--deep-espresso)]/80 mt-2 font-light">
              Engineered by Dr. Scent for continuous 24/7 commercial operation with sub-micron atomization and zero duct condensation.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {systems.map((sys) => (
              <div
                key={sys.title}
                className="bg-white rounded-sm border border-[var(--warm-stone)]/40 overflow-hidden shadow-xs flex flex-col justify-between"
              >
                <div className="relative aspect-[16/9] w-full bg-stone-100">
                  <Image
                    src={sys.image}
                    alt={sys.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                  <div className="absolute top-4 left-4 bg-[var(--near-black)]/90 backdrop-blur-sm text-[var(--champagne)] border border-[var(--champagne)]/40 text-[10px] uppercase tracking-wider font-mono px-3 py-1 rounded-sm">
                    Coverage: {sys.coverage}
                  </div>
                </div>

                <div className="p-6 sm:p-8 space-y-4 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--champagne)] block">
                      {sys.subtitle}
                    </span>
                    <h3 className="font-serif text-xl sm:text-2xl font-normal text-[var(--near-black)] mt-1.5">
                      {sys.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[var(--deep-espresso)]/80 leading-relaxed mt-2.5 font-light">
                      {sys.description}
                    </p>
                  </div>

                  <div className="pt-5 border-t border-[var(--warm-stone)]/30 flex items-center justify-between">
                    <Link
                      href={sys.link}
                      className="text-xs font-medium text-[var(--near-black)] hover:text-[var(--champagne)] uppercase tracking-[0.15em] flex items-center gap-1 transition-colors"
                    >
                      <span>Specifications</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>

                    <Link
                      href="/business-scenting/request-quote"
                      className="px-4 py-2 bg-[var(--near-black)] text-[var(--porcelain)] text-[10px] uppercase tracking-[0.2em] font-medium rounded-sm hover:bg-[var(--champagne)] transition-colors"
                    >
                      Enquire System
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4-Step Consultation Workflow */}
        <section className="py-16 border-b border-[var(--warm-stone)]/40">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-[10px] font-medium tracking-[0.25em] uppercase text-[var(--champagne)] block mb-1">
              Professional Engagement Model
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[var(--near-black)] font-normal">
              From Site Survey to Ongoing Scent Management
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {workflow.map((w) => (
              <div key={w.step} className="p-6 bg-white/70 backdrop-blur-sm rounded-sm border border-[var(--warm-stone)]/40 shadow-xs space-y-2">
                <span className="font-mono text-2xl text-[var(--champagne)] block">
                  {w.step}
                </span>
                <h3 className="font-serif text-base font-medium text-[var(--near-black)]">
                  {w.title}
                </h3>
                <p className="text-xs text-[var(--deep-espresso)]/70 leading-relaxed font-light">
                  {w.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA Banner */}
        <section className="py-16 text-center">
          <div className="max-w-3xl mx-auto bg-[var(--near-black)] text-[var(--porcelain)] rounded-sm p-8 sm:p-14 shadow-2xl border border-[var(--warm-stone)]/20 space-y-6">
            <ShieldCheck className="w-10 h-10 text-[var(--champagne)] mx-auto" />
            <h2 className="font-serif text-2xl sm:text-4xl font-normal leading-tight text-[var(--porcelain)]">
              Schedule Your Commercial Scenting Consultation
            </h2>
            <p className="text-xs sm:text-sm text-[var(--warm-stone)]/90 max-w-xl mx-auto leading-relaxed font-light">
              Our Colombo engineering and fragrance team will review your architectural floor plans and arrange an on-site demonstration at your property.
            </p>
            <div>
              <Link
                href="/business-scenting/request-quote"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-[var(--porcelain)] text-[var(--near-black)] font-medium text-xs tracking-[0.2em] uppercase rounded-sm hover:bg-[var(--champagne)] hover:text-white transition-all duration-300 shadow-sm"
              >
                <span>Complete Consultation Request</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
