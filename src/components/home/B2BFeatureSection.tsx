"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Building2, Hotel, Store, UtensilsCrossed, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";
import { LUXURY_EASE } from "@/config/motion.config";

export function B2BFeatureSection() {
  const industries = [
    {
      icon: Hotel,
      title: "Hotels & Luxury Resorts",
      description: "Indelible welcome atmospheres in lobbies, oceanfront villas, and executive hospitality suites across Sri Lanka.",
      image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80",
    },
    {
      icon: Building2,
      title: "Corporate Towers & Boardrooms",
      description: "Airflow-integrated HVAC atomization that projects prestige, enhances mental clarity, and neutralizes transit fatigue.",
      image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80",
    },
    {
      icon: Store,
      title: "Flagship Retail & Showrooms",
      description: "Prolong client dwell time and reinforce luxury positioning with subtle, uniform signature olfactive merchandising.",
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80",
    },
    {
      icon: Sparkles,
      title: "Wellness Spas & Private Sanctuaries",
      description: "Hygienic, residue-free botanical micro-mists that induce restorative tranquility without synthetic heavy residues.",
      image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80",
    },
  ];

  return (
    <section className="py-24 sm:py-32 bg-[#EFEAE1]/60 border-b border-[#E7E2D8] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.8, ease: LUXURY_EASE }}
          className="max-w-3xl mb-16 text-left"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFFFFF] border border-[#B49A70]/40 text-[#B49A70] text-[10px] font-semibold tracking-[0.24em] uppercase mb-4 shadow-xs">
            <Building2 className="w-3.5 h-3.5 text-[#B49A70]" />
            <span>ARCHITECTURAL SCENTING FOR BUSINESS</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal text-[#151412] tracking-tight leading-[1.12]">
            Make your space unforgettable.
          </h2>

          <p className="text-sm sm:text-base text-[#57534E] mt-4 font-normal leading-relaxed">
            Professional scent architecture designed to contribute to a distinctive guest atmosphere and refined brand identity. We engineer complete HVAC duct integrations, high-capacity autonomous column nebulizers, and structured monthly replenishment programs for commercial environments across Sri Lanka.
          </p>
        </motion.div>

        {/* Commercial Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-14">
          {industries.map((ind, idx) => {
            const IconComponent = ind.icon;
            return (
              <motion.div
                key={ind.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.7, delay: idx * 0.08, ease: LUXURY_EASE }}
                className="group bg-[#FFFFFF] border border-[#E7E2D8] hover:border-[#B49A70]/80 rounded-2xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-500 flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-100">
                    <Image
                      src={ind.image}
                      alt={ind.title}
                      fill
                      sizes="300px"
                      className="object-cover group-hover:scale-105 transition-transform duration-700 brightness-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    <div className="absolute top-3 left-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-[#151412] shadow-xs">
                      <IconComponent className="w-4 h-4 text-[#B49A70]" />
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="font-serif text-lg font-semibold text-[#151412] group-hover:text-[#B49A70] transition-colors">
                      {ind.title}
                    </h3>
                    <p className="text-xs text-[#57534E] leading-relaxed mt-2">
                      {ind.description}
                    </p>
                  </div>
                </div>

                <div className="px-5 pb-5 pt-1">
                  <span className="text-[10px] tracking-[0.16em] uppercase font-bold text-[#B49A70] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Engineering Protocol</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Commercial Action Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.8, ease: LUXURY_EASE }}
          className="bg-[#151412] text-[#F8F6F1] border border-[#B49A70]/30 rounded-2xl p-8 sm:p-12 flex flex-col lg:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden"
        >
          <div className="space-y-2 text-center lg:text-left max-w-xl z-10">
            <div className="inline-flex items-center gap-1.5 text-[#B49A70] text-[10px] font-bold uppercase tracking-widest mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#B49A70]" />
              <span>Complimentary Spatial Airflow Evaluation</span>
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl font-normal text-[#FFFFFF]">
              Discuss your commercial space with our consultants.
            </h3>
            <p className="text-xs sm:text-sm text-[#D8D0C4] leading-relaxed">
              Schedule an on-site HVAC or floorplan diagnostic in Colombo or islandwide. We will evaluate air-exchange cubic volume and provide bespoke fragrance sampling.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto z-10">
            <Link
              href="/business-scenting/request-quote"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-[#B49A70] hover:bg-[#CBB694] text-[#151412] text-xs font-bold tracking-[0.2em] uppercase rounded transition-all shadow-md cursor-pointer"
            >
              <span>Discuss Your Space</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/business-scenting"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 border border-[#B49A70]/40 hover:border-[#B49A70] text-[#EFEAE1] hover:text-[#FFFFFF] text-xs font-semibold tracking-[0.18em] uppercase rounded transition-colors"
            >
              <span>View B2B Systems</span>
            </Link>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
