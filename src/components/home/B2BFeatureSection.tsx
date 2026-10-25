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
      title: "Hotels & Resorts",
      description: "A welcoming scent guests remember, from the lobby to the rooms.",
      image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80",
    },
    {
      icon: Building2,
      title: "Offices",
      description: "A fresh, consistent scent through the air-conditioning, floor by floor.",
      image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80",
    },
    {
      icon: Store,
      title: "Retail & Showrooms",
      description: "A signature scent that makes customers linger and remember your brand.",
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80",
    },
    {
      icon: Sparkles,
      title: "Spas & Clinics",
      description: "Calm, clean air with no residue on surfaces or fabrics.",
      image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80",
    },
  ];

  return (
    <section className="py-16 sm:py-28 bg-[#EFEAE1]/60 border-b border-[#E7E2D8] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.8, ease: LUXURY_EASE }}
          className="max-w-3xl mb-10 sm:mb-14 text-left"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFFFFF] border border-[#B49A70]/40 text-[#B49A70] text-[10px] font-semibold tracking-[0.24em] uppercase mb-4 shadow-xs">
            <Building2 className="w-3.5 h-3.5 text-[#B49A70]" />
            <span>Scenting for business</span>
          </div>

          <h2 className="font-serif text-[2rem] sm:text-5xl font-normal text-[#151412] tracking-tight leading-[1.12]">
            Make your space unforgettable.
          </h2>

          <p className="text-sm sm:text-base text-[#57534E] mt-4 font-normal leading-relaxed">
            Hotels, offices, showrooms and clinics across Sri Lanka use our diffusers to give their spaces a signature scent. We install the machines, connect them to your air-conditioning if needed, and refill the oil every month.
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
                    <span>Learn more</span>
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
              <span>Free site visit</span>
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl font-normal text-[#FFFFFF]">
              Tell us about your space.
            </h3>
            <p className="text-xs sm:text-sm text-[#D8D0C4] leading-relaxed">
              We visit anywhere in Sri Lanka, recommend the right machine for your floor area, and bring scents for you to try.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto z-10">
            <Link
              href="/business-scenting/request-quote"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-[#B49A70] hover:bg-[#CBB694] text-[#151412] text-xs font-bold tracking-[0.2em] uppercase rounded transition-all shadow-md cursor-pointer"
            >
              <span>Get a quote</span>
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
