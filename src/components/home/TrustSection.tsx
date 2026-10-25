"use client";

import React from "react";
import { Truck, ShieldCheck, Banknote, RotateCcw } from "lucide-react";
import { motion } from "motion/react";
import { LUXURY_EASE } from "@/config/motion.config";

export function TrustSection() {
  const servicePillars = [
    {
      icon: Truck,
      title: "Islandwide delivery",
      description: "To every province, with tracking.",
    },
    {
      icon: Banknote,
      title: "Cash on delivery",
      description: "Pay when your order arrives.",
    },
    {
      icon: ShieldCheck,
      title: "6-month warranty",
      description: "On diffuser machines, serviced in Colombo.",
    },
    {
      icon: RotateCcw,
      title: "7-day returns",
      description: "On unopened items and faulty machines.",
    },
  ];

  return (
    <section
      aria-label="Delivery, payment, warranty and returns"
      className="py-10 sm:py-14 bg-[var(--porcelain)] border-t border-b border-[var(--warm-stone)]/40"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-8 lg:divide-x lg:divide-[var(--warm-stone)]/40">
          {servicePillars.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.6, delay: idx * 0.08, ease: LUXURY_EASE }}
                className="flex flex-col sm:flex-row items-start gap-3 lg:px-6 first:lg:pl-0"
              >
                <Icon className="w-5 h-5 shrink-0 text-[var(--champagne)] mt-0.5" strokeWidth={1.5} />
                <div>
                  <h3 className="font-serif text-base text-[var(--near-black)]">{item.title}</h3>
                  <p className="text-xs text-[var(--deep-espresso)]/70 leading-relaxed mt-1">{item.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
