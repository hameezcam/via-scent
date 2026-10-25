import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowRight, Check, MessageCircle } from "lucide-react";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { BRAND_CONFIG } from "@/config/brand.config";
import { INDUSTRIES, getIndustry } from "@/config/industries.config";

interface IndustryPageProps {
  params: Promise<{ industry: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return INDUSTRIES.map((i) => ({ industry: i.slug }));
}

export async function generateMetadata({ params }: IndustryPageProps): Promise<Metadata> {
  const industry = getIndustry((await params).industry);
  if (!industry) return {};
  return {
    title: `Scenting for ${industry.title} in Sri Lanka | VIA Scent`,
    description: `${industry.intro.split(". ")[0]}. Dr. Scent diffusers installed and refilled monthly across Sri Lanka.`,
  };
}

const STEPS = [
  { title: "Free site visit", text: "We visit your space, measure it and bring scents for you to try." },
  { title: "Installation", text: "We install the right machines and set them to run during your opening hours." },
  { title: "Monthly refills", text: "We come back every month to refill the oil and check everything works." },
];

export default async function IndustryPage({ params }: IndustryPageProps) {
  const industry = getIndustry((await params).industry);
  if (!industry) notFound();

  const quoteHref = `/business-scenting/request-quote?industry=${industry.quoteIndustry}`;
  const whatsappHref = `https://wa.me/${BRAND_CONFIG.contact.whatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
    `Hi, I'd like to know more about scenting for ${industry.title.toLowerCase()}.`
  )}`;
  const others = INDUSTRIES.filter((i) => i.slug !== industry.slug);

  return (
    <div className="bg-[var(--porcelain)] text-[var(--near-black)]">
      {/* Hero */}
      <section className="relative min-h-[500px] sm:min-h-[540px] flex items-end overflow-hidden bg-[var(--near-black)]">
        <Image src={industry.image} alt={industry.title} fill priority sizes="100vw" className="object-cover opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16 text-[var(--porcelain)]">
          <span className="text-[10px] font-semibold tracking-[0.24em] uppercase text-[var(--champagne)]">
            Scenting for {industry.title}
          </span>
          <h1 className="mt-3 max-w-3xl font-serif text-[2.25rem] sm:text-6xl font-normal tracking-tight leading-[1.05]">
            {industry.headline}
          </h1>
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link
              href={quoteHref}
              className="inline-flex items-center justify-center gap-2 px-7 py-4 bg-[var(--porcelain)] text-[var(--near-black)] text-xs font-semibold tracking-[0.18em] uppercase hover:bg-white transition-colors"
            >
              Book a free site visit <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-7 py-4 border border-white/40 text-xs font-medium tracking-[0.18em] uppercase hover:border-white transition-colors"
            >
              <MessageCircle className="w-4 h-4" /> Chat on WhatsApp
            </a>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="pt-6">
          <Breadcrumbs
            items={[
              { label: "Business Scenting", href: "/business-scenting" },
              { label: industry.title },
            ]}
          />
        </div>

        {/* Intro + where we scent */}
        <section className="py-12 sm:py-20 grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="font-serif text-2xl sm:text-3xl leading-snug text-[var(--near-black)]">{industry.intro}</p>
            <p className="mt-6 text-sm sm:text-base text-[var(--deep-espresso)]/80 leading-relaxed">{industry.setup}</p>
          </div>
          <div className="lg:col-span-4 lg:col-start-9">
            <h2 className="text-[10px] font-semibold tracking-[0.24em] uppercase text-[var(--champagne)]">Where we scent</h2>
            <ul className="mt-4 border-t border-[var(--warm-stone)]">
              {industry.spaces.map((space) => (
                <li key={space} className="flex items-center gap-3 py-3.5 border-b border-[var(--warm-stone)] text-sm">
                  <Check className="w-4 h-4 text-[var(--champagne)] shrink-0" strokeWidth={1.5} />
                  {space}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Benefits */}
        <section className="pb-12 sm:pb-20 grid gap-8 sm:gap-6 md:grid-cols-3">
          {industry.benefits.map((benefit) => (
            <div key={benefit.title} className="border-t border-[var(--near-black)] pt-6">
              <h3 className="font-serif text-xl sm:text-2xl">{benefit.title}</h3>
              <p className="mt-2 text-sm text-[var(--deep-espresso)]/80 leading-relaxed">{benefit.text}</p>
            </div>
          ))}
        </section>
      </div>

      {/* How it works */}
      <section className="bg-[var(--near-black)] text-[var(--porcelain)] py-14 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-[1.75rem] sm:text-4xl font-normal tracking-tight">How it works</h2>
          <ol className="mt-10 grid gap-8 md:grid-cols-3">
            {STEPS.map((step, idx) => (
              <li key={step.title}>
                <span className="font-serif text-sm text-[var(--champagne)]">0{idx + 1}</span>
                <h3 className="mt-2 font-serif text-xl">{step.title}</h3>
                <p className="mt-2 text-sm text-[var(--porcelain)]/70 leading-relaxed">{step.text}</p>
              </li>
            ))}
          </ol>
          <Link
            href={quoteHref}
            className="mt-12 inline-flex items-center justify-center gap-2 px-7 py-4 bg-[var(--champagne)] text-[var(--near-black)] text-xs font-semibold tracking-[0.18em] uppercase hover:opacity-90 transition-opacity"
          >
            Get a free quote <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Other industries */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        <h2 className="font-serif text-2xl sm:text-3xl font-normal">Other spaces we scent</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {others.map((other) => (
            <Link key={other.slug} href={`/business-scenting/${other.slug}`} className="group block">
              <div className="relative aspect-[16/10] overflow-hidden bg-[var(--warm-stone)]">
                <Image
                  src={other.image}
                  alt={other.title}
                  fill
                  sizes="(max-width: 640px) 100vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <p className="mt-3 font-serif text-lg flex items-center gap-2">
                {other.title} <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
