import React from "react";
import Link from "next/link";
import { Building2, Hotel, Sparkles, Store, UtensilsCrossed, HeartHandshake, ArrowRight } from "lucide-react";

export function B2BFeatureSection() {
  const industries = [
    {
      icon: Hotel,
      title: "Hotels & Luxury Resorts",
      description: "Welcome guests with an indelible signature aroma in lobbies, corridors, and private villas.",
    },
    {
      icon: Building2,
      title: "Corporate Offices & Boardrooms",
      description: "Enhance focus, reduce fatigue, and project executive prestige through calibrated HVAC diffusion.",
    },
    {
      icon: Store,
      title: "Showrooms & Flagship Retail",
      description: "Prolong customer dwell times and reinforce brand luxury through tailored olfactory merchandising.",
    },
    {
      icon: UtensilsCrossed,
      title: "Bespoke Dining & Lounges",
      description: "Complement gastronomic experiences with subtle entrance ambience without clashing with food aromas.",
    },
    {
      icon: Sparkles,
      title: "Wellness Spas & Health Clinics",
      description: "Cultivate deep relaxation and hygienic sensory tranquility with therapeutic botanicals.",
    },
    {
      icon: HeartHandshake,
      title: "Custom Scent Signatures",
      description: "Bespoke perfume development to craft an exclusive, proprietary olfactory identity for your brand.",
    },
  ];

  return (
    <section className="py-20 sm:py-28 bg-stone-900 text-stone-100 border-b border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-700/60 text-amber-300 text-xs font-semibold tracking-wider uppercase">
            <Building2 className="w-3.5 h-3.5" />
            <span>Commercial B2B Services</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-5xl font-normal text-stone-100 tracking-tight leading-tight">
            Commercial Scent Architecture for Sri Lanka’s Premier Spaces.
          </h2>

          <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
            From Colombo’s five-star hospitality suites to Southern luxury coastal resorts, we provide turn-key scent installations, high-capacity HVAC duct nebulizers, and comprehensive monthly oil replenishment programs.
          </p>
        </div>

        {/* Industry Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {industries.map((ind) => {
            const IconComponent = ind.icon;
            return (
              <div
                key={ind.title}
                className="bg-stone-800/60 border border-stone-700/80 rounded-lg p-6 hover:border-amber-400/50 hover:bg-stone-800 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-md bg-amber-950/70 border border-amber-800/50 text-amber-300 flex items-center justify-center mb-4">
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <h3 className="font-serif text-lg font-medium text-stone-100 mb-2">
                    {ind.title}
                  </h3>
                  <p className="text-xs text-stone-300 leading-relaxed">
                    {ind.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Panel */}
        <div className="bg-stone-800 border border-amber-900/60 rounded-xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="font-serif text-xl sm:text-2xl text-stone-100 font-medium">
              Ready to evaluate your commercial venue?
            </h3>
            <p className="text-xs sm:text-sm text-stone-300">
              Schedule an on-site airflow assessment and complimentary fragrance trial with our Colombo scent consultants.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Link
              href="/business-scenting/request-quote"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-amber-400 text-stone-950 font-semibold text-xs tracking-wider uppercase rounded hover:bg-amber-300 transition-colors shadow-sm"
            >
              <span>Request B2B Quote</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/business-scenting"
              className="inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-stone-700/60 border border-stone-600 text-stone-200 font-medium text-xs tracking-wider uppercase rounded hover:bg-stone-700 transition-colors"
            >
              <span>View System Specs</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
