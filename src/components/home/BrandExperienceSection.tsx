import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, Wind, Droplets, Sliders, ArrowRight } from "lucide-react";
import { BRAND_CONFIG } from "@/config/brand.config";

export function BrandExperienceSection() {
  const principles = [
    {
      icon: Wind,
      title: "Cold-Air Micro-Nebulization",
      description:
        "Unlike ultrasonic water diffusers or heat burners that compromise fragrance molecules and produce condensation, Dr. Scent technology atomizes pure oil into sub-micron dry droplets that stay suspended naturally.",
    },
    {
      icon: Droplets,
      title: "Pure Botanical & Perfume Integrity",
      description:
        "Formulated without alcohol, synthetic diluents, or water. Every fragrance oil maintains consistent olfactory fidelity from the first spray to the last drop.",
    },
    {
      icon: Sliders,
      title: "Precision Space Calibration",
      description:
        "From a 200 sq.ft private study to a 10,000 sq.ft resort lobby, our cold-air instruments and HVAC duct systems provide uniform olfactory coverage without ever overpowering the senses.",
    },
  ];

  return (
    <section className="py-20 sm:py-28 bg-[#F4EFEA] border-b border-[#E7E2D8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Image composition */}
          <div className="lg:col-span-5 relative order-2 lg:order-1">
            <div className="relative aspect-[3/4] w-full rounded-lg overflow-hidden shadow-xl border border-stone-300/80 bg-stone-200">
              <Image
                src="https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1000&q=85"
                alt="Cold air fragrance oil bottle with luxury amber glass"
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover object-center"
              />
            </div>
            {/* Authenticity floating badge */}
            <div className="absolute -bottom-6 -right-4 sm:right-6 bg-white p-4 rounded-lg shadow-xl border border-stone-200 max-w-xs">
              <div className="flex items-center gap-2 text-amber-900 font-semibold text-xs mb-1">
                <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
                <span>Authorized Franchisee Supply</span>
              </div>
              <p className="text-[11px] text-stone-500 leading-tight">
                All diffuser hardware and oils comply with international safety standards and official franchise guarantees.
              </p>
            </div>
          </div>

          {/* Editorial Content */}
          <div className="lg:col-span-7 space-y-8 order-1 lg:order-2">
            <div>
              <span className="text-xs font-semibold tracking-widest uppercase text-amber-800 block mb-2">
                The Science of Ambient Olfaction
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-stone-900 tracking-tight leading-tight">
                Architectural scenting designed for discerning environments.
              </h2>
              <p className="text-stone-600 text-sm sm:text-base leading-relaxed mt-4">
                Operating as an authorized franchise partner for Dr. Scent, {BRAND_CONFIG.brandName} introduces hospital-grade cold-air diffusion engineering and bespoke fragrance compositions to homes and businesses across Sri Lanka.
              </p>
            </div>

            {/* Principles list */}
            <div className="space-y-6">
              {principles.map((item) => {
                const IconComponent = item.icon;
                return (
                  <div key={item.title} className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-amber-100/80 text-amber-900 flex items-center justify-center shrink-0 border border-amber-200">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-serif text-base font-semibold text-stone-900">
                        {item.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mt-1">
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-semibold text-stone-900 hover:text-amber-900 underline underline-offset-8 transition-colors"
              >
                Learn More About Our Brand & Partnership
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
