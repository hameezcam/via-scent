"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Wind, Droplets, Timer } from "lucide-react";
import { motion } from "motion/react";
import { LUXURY_EASE } from "@/config/motion.config";

/** Plain-language explainer of cold-air diffusion for shoppers new to it. */
export function HowItWorksSection() {
  const steps = [
    {
      num: "01",
      icon: Droplets,
      title: "Pure oil, nothing added",
      description:
        "Pour a fragrance oil straight into the machine. No water, no heat and no wax, so the scent smells exactly as it should.",
    },
    {
      num: "02",
      icon: Wind,
      title: "Cold air turns it into a fine mist",
      description:
        "The diffuser breaks the oil into a dry mist that stays in the air. It spreads evenly across the room and leaves no residue on furniture.",
    },
    {
      num: "03",
      icon: Timer,
      title: "Set it once, enjoy it all day",
      description:
        "Choose when it runs and how strong it is. One machine can fill anything from a bedroom to a hotel lobby, quietly.",
    },
  ];

  return (
    <section
      aria-labelledby="how-it-works-heading"
      className="py-16 sm:py-24 bg-[var(--porcelain)] border-t border-[var(--warm-stone)]/40"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.7, ease: LUXURY_EASE }}
          className="max-w-2xl"
        >
          <span className="text-[10px] font-semibold tracking-[0.24em] uppercase text-[var(--champagne)]">
            How it works
          </span>
          <h2
            id="how-it-works-heading"
            className="mt-3 font-serif text-[1.75rem] sm:text-5xl font-normal tracking-tight leading-[1.1] text-[var(--near-black)]"
          >
            Why a cold-air diffuser?
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[var(--deep-espresso)]/80 leading-relaxed">
            Candles burn out and sprays fade in minutes. A Dr. Scent diffuser keeps a room smelling the same from morning to night.
          </p>
        </motion.div>

        <ol className="mt-10 sm:mt-14 grid gap-8 sm:gap-6 md:grid-cols-3">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.li
                key={step.num}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.6, delay: idx * 0.1, ease: LUXURY_EASE }}
                className="border-t border-[var(--near-black)] pt-6"
              >
                <div className="flex items-center justify-between">
                  <span className="font-serif text-sm text-[var(--deep-espresso)]/60">{step.num}</span>
                  <Icon className="w-5 h-5 text-[var(--champagne)]" strokeWidth={1.5} />
                </div>
                <h3 className="mt-4 font-serif text-xl sm:text-2xl text-[var(--near-black)]">{step.title}</h3>
                <p className="mt-2 text-sm text-[var(--deep-espresso)]/80 leading-relaxed">{step.description}</p>
              </motion.li>
            );
          })}
        </ol>

        <div className="mt-12 flex flex-col sm:flex-row gap-3 sm:gap-4">
          <Link
            href="/shop/aroma-diffusers"
            className="inline-flex items-center justify-center gap-2 px-7 py-4 bg-[var(--near-black)] text-[var(--porcelain)] text-xs font-medium tracking-[0.18em] uppercase hover:opacity-90 transition-opacity"
          >
            Shop diffusers <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/scent-finder"
            className="inline-flex items-center justify-center gap-2 px-7 py-4 border border-[var(--near-black)] text-xs font-medium tracking-[0.18em] uppercase hover:bg-white transition-colors"
          >
            Help me choose
          </Link>
        </div>
      </div>
    </section>
  );
}
