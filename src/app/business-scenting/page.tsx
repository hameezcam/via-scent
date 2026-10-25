import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MessageCircle } from "lucide-react";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { ProductCard } from "@/components/product/ProductCard";
import { BRAND_CONFIG } from "@/config/brand.config";
import { INDUSTRIES } from "@/config/industries.config";
import { productService } from "@/services/product.service";
import { withServedImagesAll } from "@/lib/product-images";
import { coverageSqft } from "@/lib/scent-finder";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Scenting for Businesses in Sri Lanka | Hotels, Offices, Retail & Spas | VIA Scent",
  description:
    "Dr. Scent diffusers for hotels, offices, shops and spas across Sri Lanka. Free site visit, professional installation and monthly oil refills.",
};

const BENEFITS = [
  {
    title: "A scent people remember",
    text: "Customers and guests connect the smell of your space with your brand, and notice it every time they come back.",
  },
  {
    title: "Fresh air, all day",
    text: "Keeps cooking, damp, smoke and bathroom smells out of shared spaces, rather than masking them for a few minutes.",
  },
  {
    title: "The same in every branch",
    text: "Use one signature scent across all your locations, so every branch feels like part of the same brand.",
  },
  {
    title: "Nothing for you to manage",
    text: "We install the machines, set them to your opening hours and come back every month to refill the oil.",
  },
];

const STEPS = [
  { title: "Free site visit", text: "We visit your space anywhere in Sri Lanka and measure the areas you want scented." },
  { title: "Choose your scent", text: "We bring a selection of scents so you can smell them in your own space before deciding." },
  { title: "Installation", text: "We install the right machines, standalone or connected to your air-conditioning, and set the schedule." },
  { title: "Monthly refills", text: "We come back every month to refill the oil, check the machines and adjust the strength." },
];

export default async function BusinessScentingPage() {
  const products = await productService.getAll().then(withServedImagesAll);
  // Largest machines first: these are the ones businesses usually need
  const machines = products
    .filter((p) => p.isPublished !== false && !p.isArchived)
    .filter((p) => ["aroma-diffusers", "commercial-scenting"].includes(p.category))
    .filter((p) => !/\bcar\b/i.test(p.name))
    .sort((a, b) => (coverageSqft(b) ?? 0) - (coverageSqft(a) ?? 0))
    .slice(0, 4);

  const whatsappHref = `https://wa.me/${BRAND_CONFIG.contact.whatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
    "Hi, I'd like to know more about scenting for my business."
  )}`;

  return (
    <div className="bg-[var(--porcelain)] text-[var(--near-black)]">
      {/* Hero */}
      <section className="relative min-h-[520px] sm:min-h-[580px] flex items-end overflow-hidden bg-[var(--near-black)]">
        <Image
          src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=2000&q=80"
          alt="Hotel lobby"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10" />
        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16 text-[var(--porcelain)]">
          <span className="text-[10px] font-semibold tracking-[0.24em] uppercase text-[var(--champagne)]">
            Scenting for business
          </span>
          <h1 className="mt-3 max-w-3xl font-serif text-[2.25rem] sm:text-6xl font-normal tracking-tight leading-[1.05]">
            Make your space unforgettable.
          </h1>
          <p className="mt-5 max-w-2xl text-sm sm:text-base text-[var(--porcelain)]/80 leading-relaxed">
            Hotels, offices, shops and clinics across Sri Lanka use Dr. Scent diffusers to give their spaces a signature
            scent. We visit, install and refill. You just enjoy it.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link
              href="/business-scenting/request-quote"
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
          <Breadcrumbs items={[{ label: "Business Scenting" }]} />
        </div>

        {/* Industries */}
        <section className="py-12 sm:py-20">
          <h2 className="font-serif text-[1.75rem] sm:text-4xl font-normal tracking-tight">Who we scent for</h2>
          <div className="mt-8 grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4">
            {INDUSTRIES.map((industry) => (
              <Link key={industry.slug} href={`/business-scenting/${industry.slug}`} className="group block">
                <div className="relative aspect-[4/5] overflow-hidden bg-[var(--warm-stone)]">
                  <Image
                    src={industry.image}
                    alt={industry.title}
                    fill
                    sizes="(max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 text-[var(--porcelain)]">
                    <p className="font-serif text-lg sm:text-2xl leading-tight">{industry.title}</p>
                    <p className="mt-1 hidden sm:block text-xs text-[var(--porcelain)]/80 leading-snug">{industry.cardText}</p>
                    <span className="mt-3 inline-flex items-center gap-1 text-[10px] font-semibold tracking-[0.18em] uppercase text-[var(--champagne)]">
                      Learn more <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Benefits */}
        <section className="pb-12 sm:pb-20">
          <h2 className="font-serif text-[1.75rem] sm:text-4xl font-normal tracking-tight">Why businesses use scent</h2>
          <div className="mt-8 grid gap-8 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {BENEFITS.map((benefit) => (
              <div key={benefit.title} className="border-t border-[var(--near-black)] pt-6">
                <h3 className="font-serif text-xl">{benefit.title}</h3>
                <p className="mt-2 text-sm text-[var(--deep-espresso)]/80 leading-relaxed">{benefit.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Machines */}
        {machines.length > 0 && (
          <section className="pb-12 sm:pb-20">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div>
                <h2 className="font-serif text-[1.75rem] sm:text-4xl font-normal tracking-tight">Machines we install</h2>
                <p className="mt-2 text-sm text-[var(--deep-espresso)]/80 max-w-xl">
                  From compact units for a reception desk to large machines that connect to your air-conditioning. We&apos;ll
                  recommend the right one after the site visit.
                </p>
              </div>
              <Link
                href="/shop/aroma-diffusers"
                className="text-xs font-medium tracking-[0.18em] uppercase inline-flex items-center gap-1 hover:text-[var(--champagne)]"
              >
                See all diffusers <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              {machines.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* How it works */}
      <section className="bg-[var(--near-black)] text-[var(--porcelain)] py-14 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-[1.75rem] sm:text-4xl font-normal tracking-tight">How it works</h2>
          <ol className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, idx) => (
              <li key={step.title} className="border-t border-white/15 pt-6">
                <span className="font-serif text-sm text-[var(--champagne)]">0{idx + 1}</span>
                <h3 className="mt-2 font-serif text-xl">{step.title}</h3>
                <p className="mt-2 text-sm text-[var(--porcelain)]/70 leading-relaxed">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
        <h2 className="font-serif text-[1.75rem] sm:text-5xl font-normal tracking-tight">Tell us about your space.</h2>
        <p className="mt-4 mx-auto max-w-xl text-sm sm:text-base text-[var(--deep-espresso)]/80 leading-relaxed">
          We&apos;ll visit, recommend the right machines for your floor area and bring scents for you to try. There&apos;s
          no charge for the visit.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
          <Link
            href="/business-scenting/request-quote"
            className="inline-flex items-center justify-center gap-2 px-7 py-4 bg-[var(--near-black)] text-[var(--porcelain)] text-xs font-semibold tracking-[0.18em] uppercase hover:opacity-90 transition-opacity"
          >
            Book a free site visit <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href={`tel:${BRAND_CONFIG.contact.phone.replace(/\s/g, "")}`}
            className="inline-flex items-center justify-center px-7 py-4 border border-[var(--near-black)] text-xs font-medium tracking-[0.18em] uppercase hover:bg-white transition-colors"
          >
            Call {BRAND_CONFIG.contact.phone}
          </a>
        </div>
      </section>
    </div>
  );
}
