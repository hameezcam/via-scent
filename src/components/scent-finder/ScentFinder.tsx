"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Car,
  Flower2,
  Gift,
  Home,
  Leaf,
  MessageCircle,
  RotateCcw,
  SprayCan,
  Trees,
  Cherry,
  Wind,
  Droplet,
  Sparkles,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { Product } from "@/types/product";
import { BRAND_CONFIG } from "@/config/brand.config";
import { LUXURY_EASE } from "@/config/motion.config";
import { ProductCard } from "@/components/product/ProductCard";
import {
  FinderAnswers,
  FinderGoal,
  FinderMood,
  FinderSize,
  FinderSpace,
  MOOD_LABELS,
  recommendProducts,
} from "@/lib/scent-finder";

interface Option<T extends string> {
  value: T;
  label: string;
  hint: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}

type StepKey = "space" | "size" | "mood" | "goal";

const STEPS: Record<StepKey, { question: string; options: Option<string>[] }> = {
  space: {
    question: "Where would you like the scent?",
    options: [
      { value: "home", label: "At home", hint: "Living room, bedroom, anywhere", icon: Home },
      { value: "car", label: "In my car", hint: "A fresh drive, every day", icon: Car },
      { value: "business", label: "At my business", hint: "Office, shop, hotel or clinic", icon: Building2 },
      { value: "gift", label: "It's a gift", hint: "Something they'll love", icon: Gift },
    ] satisfies Option<FinderSpace>[],
  },
  size: {
    question: "How big is the space?",
    options: [
      { value: "small", label: "Small", hint: "A bedroom or study, up to about 400 sq ft", icon: Droplet },
      { value: "medium", label: "Medium", hint: "A living or dining area, up to about 1,200 sq ft", icon: Home },
      { value: "large", label: "Large", hint: "Open-plan, a whole floor or a lobby", icon: Building2 },
    ] satisfies Option<FinderSize>[],
  },
  mood: {
    question: "Which scents do you love?",
    options: [
      { value: "fresh", label: "Fresh & clean", hint: "Citrus, white tea, sea breeze", icon: Wind },
      { value: "floral", label: "Floral", hint: "Jasmine, rose, lily", icon: Flower2 },
      { value: "warm", label: "Warm & woody", hint: "Oud, sandalwood, amber, vanilla", icon: Trees },
      { value: "fruity", label: "Fruity & sweet", hint: "Berries, fig, papaya", icon: Cherry },
    ] satisfies Option<FinderMood>[],
  },
  goal: {
    question: "What are you looking for?",
    options: [
      { value: "diffuser", label: "A diffuser and oil", hint: "Silent, all-day scent at the touch of a button", icon: Sparkles },
      { value: "oil", label: "Oil for my diffuser", hint: "I already have a Dr. Scent machine", icon: Droplet },
      { value: "spray", label: "A room or fabric spray", hint: "Quick freshness, no machine needed", icon: SprayCan },
      { value: "odor", label: "To get rid of a smell", hint: "Pets, cooking, smoke or bathrooms", icon: Leaf },
    ] satisfies Option<FinderGoal>[],
  },
};

function stepsFor(answers: Partial<FinderAnswers>): StepKey[] {
  if (answers.space === "home") return ["space", "goal", ...(answers.goal === "diffuser" ? (["size"] as const) : []), "mood"];
  if (answers.space === "business") return ["space", "size", "mood"];
  return ["space", "mood"];
}

export function ScentFinder({ products }: { products: Product[] }) {
  const [answers, setAnswers] = useState<Partial<FinderAnswers>>({});
  const [stepIndex, setStepIndex] = useState(0);

  const steps = stepsFor(answers);
  const done = stepIndex >= steps.length;
  const currentKey = steps[Math.min(stepIndex, steps.length - 1)];
  const current = STEPS[currentKey];

  const picks = useMemo(
    () => (done && answers.space && answers.mood ? recommendProducts(products, answers as FinderAnswers) : []),
    [done, answers, products]
  );

  const choose = (key: StepKey, value: string) => {
    const next = { ...answers, [key]: value };
    // Changing an early answer can change which later questions apply
    if (key === "space") {
      delete next.goal;
      delete next.size;
    }
    if (key === "goal" && value !== "diffuser") delete next.size;
    setAnswers(next);
    setStepIndex(stepIndex + 1);
  };

  const restart = () => {
    setAnswers({});
    setStepIndex(0);
  };

  const whatsappHref = `https://wa.me/${BRAND_CONFIG.contact.whatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
    "Hi, I'd like help choosing a scent."
  )}`;

  return (
    <div className="bg-[var(--porcelain)] min-h-[70vh] py-12 sm:py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-[10px] font-semibold tracking-[0.24em] uppercase text-[var(--champagne)]">Scent finder</span>
          <h1 className="mt-3 font-serif text-[2rem] sm:text-5xl font-normal tracking-tight leading-[1.1]">
            {done ? "Your scent match" : "Find your scent in under a minute"}
          </h1>
          {done && answers.mood && (
            <p className="mt-4 text-sm sm:text-base text-[var(--deep-espresso)]/80 leading-relaxed">
              Based on your answers, here&apos;s what we&apos;d pick for a {MOOD_LABELS[answers.mood]} feel
              {answers.space === "car" ? " in your car" : answers.space === "business" ? " at your business" : answers.space === "gift" ? " as a gift" : " at home"}.
            </p>
          )}
        </div>

        {!done && (
          <div className="mt-10 sm:mt-14 max-w-3xl mx-auto">
            {/* Progress */}
            <div className="flex items-center justify-between text-xs text-[var(--deep-espresso)]/70 mb-3">
              <span>
                Question {stepIndex + 1}
                {stepIndex > 0 && ` of ${steps.length}`}
              </span>
              {stepIndex > 0 && (
                <button
                  type="button"
                  onClick={() => setStepIndex(stepIndex - 1)}
                  className="inline-flex items-center gap-1 hover:text-[var(--near-black)] cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
              )}
            </div>
            <div className="h-0.5 bg-[var(--warm-stone)] mb-10">
              <div
                className="h-full bg-[var(--near-black)] transition-all duration-500"
                style={{ width: `${(stepIndex / steps.length) * 100}%` }}
              />
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentKey}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease: LUXURY_EASE }}
              >
                <h2 className="font-serif text-2xl sm:text-3xl text-center">{current.question}</h2>
                <div className={`mt-8 grid gap-3 sm:gap-4 ${current.options.length === 3 ? "sm:grid-cols-3" : "grid-cols-2"}`}>
                  {current.options.map((option) => {
                    const Icon = option.icon;
                    const selected = answers[currentKey] === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => choose(currentKey, option.value)}
                        aria-pressed={selected}
                        className={`group text-left p-4 sm:p-6 bg-white border transition-colors cursor-pointer ${
                          selected ? "border-[var(--near-black)]" : "border-[var(--warm-stone)] hover:border-[var(--near-black)]"
                        }`}
                      >
                        <Icon className="w-6 h-6 text-[var(--champagne)]" strokeWidth={1.5} />
                        <span className="mt-4 block font-serif text-lg sm:text-xl text-[var(--near-black)]">{option.label}</span>
                        <span className="mt-1 block text-xs sm:text-sm text-[var(--deep-espresso)]/70 leading-snug">{option.hint}</span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        {done && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: LUXURY_EASE }}
            className="mt-10 sm:mt-14"
          >
            {picks.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                {picks.map(({ product, reason }) => (
                  <div key={product.id} className="flex flex-col gap-3">
                    <p className="text-xs sm:text-sm text-[var(--deep-espresso)]/80 leading-snug min-h-[2.5rem]">{reason}</p>
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-sm text-[var(--deep-espresso)]/80">
                We couldn&apos;t find a match in stock right now. Message us and we&apos;ll help you choose.
              </p>
            )}

            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6">
              {answers.space === "business" && (
                <Link
                  href="/business-scenting/request-quote"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 bg-[var(--near-black)] text-[var(--porcelain)] text-xs font-medium tracking-[0.18em] uppercase"
                >
                  Book a free site visit <ArrowRight className="w-4 h-4" />
                </Link>
              )}
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 border border-[var(--near-black)] text-xs font-medium tracking-[0.18em] uppercase hover:bg-white transition-colors"
              >
                <MessageCircle className="w-4 h-4" /> Ask us on WhatsApp
              </a>
              <button
                type="button"
                onClick={restart}
                className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[var(--deep-espresso)]/80 hover:text-[var(--near-black)] cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Start again
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
