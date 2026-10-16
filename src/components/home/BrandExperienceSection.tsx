"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, Wind, Droplets, Sliders, ArrowRight, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { LUXURY_EASE } from "@/config/motion.config";

export function BrandExperienceSection() {
  const pillars = [
    {
      num: "01",
      icon: Wind,
      title: "Cold-Air Micro-Nebulization",
      description:
        "Unlike ultrasonic water humidifiers or thermal wax warmers that denature perfume molecules and generate damp condensation, our instruments atomize pure essential and fine fragrance oil into a sub-micron dry mist that remains buoyant in airflow naturally.",
    },
    {
      num: "02",
      icon: Droplets,
      title: "100% Pure Undiluted Fidelity",
      description:
        "Formulated without water, ethanol carriers, or synthetic phthalates. Every batch complies strictly with IFRA (International Fragrance Association) global purity codes, delivering exact olfactory fidelity from the first second to the final drop.",
    },
    {
      num: "03",
      icon: Sliders,
      title: "Architectural Space Calibration",
      description:
        "From an intimate 250 sq.ft private dressing suite to a 10,000 sq.ft five-star hotel lobby, our standalone column instruments and central HVAC duct modules maintain an effortlessly calibrated, uniform sensory presence.",
    },
  ];

  return (
    <section className="py-24 sm:py-32 bg-[#151412] text-[#F8F6F1] relative overflow-hidden border-b border-[#26221E]">
      {/* Subtle Ambient Grain Overlay */}
      <div className="absolute inset-0 bg-dark-grain opacity-50 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Editorial Top Headline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.8, ease: LUXURY_EASE }}
          className="max-w-3xl mb-16 sm:mb-24 text-left"
        >
          <div className="inline-flex items-center gap-2 text-[10px] font-semibold tracking-[0.24em] uppercase text-[#B49A70] mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#B49A70]" />
            <span>THE SCIENCE OF AMBIENT SCENTING</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal text-[#FFFFFF] tracking-tight leading-[1.1]">
            Scent is the invisible signature of a space.
          </h2>
          <p className="text-sm sm:text-base text-[#D8D0C4] mt-4 font-normal leading-relaxed max-w-2xl">
            As the authorized Sri Lankan franchise partner of Dr. Scent, VIA Scent merges medical-grade cold aerosolization engineering with world-class fine fragrance to shape unforgettable interior memories.
          </p>
        </motion.div>

        {/* Split Editorial Composition */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Visual Storytelling Asset */}
          <div className="lg:col-span-5 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.9, ease: LUXURY_EASE }}
              className="relative aspect-[4/5] w-full rounded-2xl overflow-hidden shadow-2xl border border-[#B49A70]/30 bg-[#211C19]"
            >
              <Image
                src="https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1200&q=85"
                alt="Cold air pure fragrance oil bottle in amber UV-filtering glass"
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover object-center filter brightness-90 hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#151412]/80 via-transparent to-transparent" />
            </motion.div>

            {/* Franchise Floating Seal */}
            <div className="absolute -bottom-6 right-4 sm:-right-4 bg-[#211C19]/95 backdrop-blur-md border border-[#B49A70]/40 p-5 rounded-xl shadow-2xl max-w-xs z-20">
              <div className="flex items-center gap-2 text-[#B49A70] text-xs font-bold uppercase tracking-wider mb-1">
                <ShieldCheck className="w-4 h-4 text-[#B49A70] shrink-0" />
                <span>Authorized Franchise Partner</span>
              </div>
              <p className="text-[11px] text-[#D8D0C4] leading-relaxed">
                Official franchise hardware warranty, genuine Dr. Scent replacement parts, and laboratory-tested fragrance safety certificates.
              </p>
            </div>
          </div>

          {/* Right Column: Three Engineering Pillars */}
          <div className="lg:col-span-7 space-y-10">
            {pillars.map((item, idx) => {
              const IconComp = item.icon;
              return (
                <motion.div
                  key={item.num}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-30px" }}
                  transition={{ duration: 0.7, delay: idx * 0.1, ease: LUXURY_EASE }}
                  className="flex items-start gap-5 border-b border-[#26221E] pb-8 last:border-b-0"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#211C19] border border-[#B49A70]/30 flex items-center justify-center shrink-0 text-[#B49A70]">
                    <IconComp className="w-5 h-5" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono tracking-widest text-[#B49A70] uppercase">
                        Phase {item.num}
                      </span>
                      <span className="text-[#8A8275]">•</span>
                      <h3 className="font-serif text-lg sm:text-xl font-semibold text-[#FFFFFF]">
                        {item.title}
                      </h3>
                    </div>
                    <p className="text-xs sm:text-sm text-[#D8D0C4] leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}

            <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-semibold text-[#B49A70] hover:text-[#CBB694] pb-1 border-b border-[#B49A70]/40 transition-colors"
              >
                <span>Read the Full Franchise Story & Science</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/shop/aroma-diffusers"
                className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-semibold text-[#EFEAE1] hover:text-[#FFFFFF] pb-1 border-b border-[#EFEAE1]/30 transition-colors"
              >
                <span>Browse Diffuser Instruments</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
