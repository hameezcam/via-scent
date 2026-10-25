"use client";

import React from "react";
import { Truck, ShieldCheck, Banknote, RotateCcw } from "lucide-react";
import { motion } from "motion/react";
import { LUXURY_EASE } from "@/config/motion.config";

export function TrustSection() {
  const servicePillars = [
    {
      icon: Truck,
      eyebrow: "White-Glove Fulfillment",
      title: "Islandwide Delivery",
      description:
        "Prompt, transparent delivery rates across Greater Colombo, Kandy, Galle, and all 9 provinces of Sri Lanka. Real-time courier tracking provided.",
    },
    {
      icon: Banknote,
      eyebrow: "Flexible Settlement",
      title: "Cash on Delivery",
      description:
        "Pay the courier in cash when your order arrives, anywhere in Sri Lanka. Secure card checkout is coming soon.",
    },
    {
      icon: ShieldCheck,
      eyebrow: "Franchise Assurance",
      title: "6-Month Hardware Warranty",
      description:
        "Every Dr. Scent diffuser is covered by our local franchisee warranty with certified Colombo technician servicing and genuine spare parts.",
    },
    {
      icon: RotateCcw,
      eyebrow: "Client Protection",
      title: "7-Day Return Policy",
      description:
        "Guaranteed 7-day return and refund protection for unopened items or hardware defects in strict accordance with consumer guidelines.",
    },
  ];

  return (
    <section className="py-20 bg-[var(--porcelain)] border-t border-b border-[var(--warm-stone)]/40 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: LUXURY_EASE }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="text-[10px] tracking-[0.3em] uppercase text-[var(--champagne)] font-medium block mb-2">
            The Standards of VIA Scent
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl text-[var(--near-black)] font-normal tracking-tight">
            Service Crafted Without Compromise
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-[var(--deep-espresso)]/70 font-light leading-relaxed">
            Every instrument and fragrance formulation is backed by certified Sri Lankan franchise operations and customer care.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {servicePillars.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.7, delay: idx * 0.1, ease: LUXURY_EASE }}
                className="group relative p-6 bg-white/70 backdrop-blur-sm border border-[var(--warm-stone)]/40 rounded-sm hover:border-[var(--champagne)]/60 hover:bg-white transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="w-10 h-10 rounded-full bg-[var(--ivory)] text-[var(--deep-espresso)] flex items-center justify-center border border-[var(--warm-stone)]/60 group-hover:bg-[var(--near-black)] group-hover:text-[var(--champagne)] group-hover:border-transparent transition-colors duration-300">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono tracking-widest text-[var(--warm-stone)] group-hover:text-[var(--champagne)] transition-colors">
                    0{idx + 1}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[9px] uppercase tracking-[0.25em] text-[var(--champagne)] font-medium block">
                    {item.eyebrow}
                  </span>
                  <h3 className="font-serif text-base text-[var(--near-black)] font-medium">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[var(--deep-espresso)]/70 font-light leading-relaxed pt-1">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
