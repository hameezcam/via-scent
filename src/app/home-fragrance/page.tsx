import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MessageCircle, PhoneCall } from "lucide-react";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { BRAND_CONFIG } from "@/config/brand.config";
import { productService } from "@/services/product.service";
import { withServedImagesAll } from "@/lib/product-images";
import { coverageSqft } from "@/lib/scent-finder";
import { ProductCard } from "@/components/product/ProductCard";
import { HomeConsultationForm } from "@/components/home-fragrance/HomeConsultationForm";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Home fragrance and diffusers for your home",
  description:
    "Fill your home with scent using Dr. Scent cold-air diffusers and pure fragrance oils. No water, no heat, no residue. Islandwide delivery across Sri Lanka.",
};

const REASONS = [
  {
    title: "No water, no heat",
    text: "The diffuser turns pure oil into a fine, dry mist, so the scent smells exactly as it should and doesn't add damp to the air.",
  },
  {
    title: "No residue",
    text: "The mist is so fine it stays in the air, leaving no oily film on furniture, curtains or floors.",
  },
  {
    title: "Quiet, on a timer",
    text: "Set when it runs and how strong it is. It works quietly in the background, morning to night.",
  },
  {
    title: "One room or the whole home",
    text: "Small diffusers for a bedroom or study, and larger ones that can fill an open-plan living area.",
  },
];

const ROOMS = [
  {
    room: "Living room & entrance",
    mood: "Warm & woody",
    text: "Oud, amber or sandalwood make a welcoming first impression when guests arrive.",
    image: "/images/categories/home-fragrance.jpg",
  },
  {
    room: "Bedroom",
    mood: "Soft & floral",
    text: "Gentle florals like jasmine or rose help the room feel calm at the end of the day.",
    image: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=800&q=85",
  },
  {
    room: "Dining room & kitchen",
    mood: "Fresh & clean",
    text: "Citrus or white tea keeps cooking smells away without overpowering your food.",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=85",
  },
  {
    room: "Study or home office",
    mood: "Fresh or woody",
    text: "Clean, grounding scents help the space feel focused and calm.",
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=85",
  },
];

const FAQS = [
  {
    question: "How is this different from candles or reed diffusers?",
    answer:
      "Candles use a flame and heat, and reed diffusers only scent the area right around them. A cold-air diffuser spreads pure oil evenly through the whole room as a dry mist, with no flame, heat or water, and you can set it to run on a schedule.",
  },
  {
    question: "Will it leave marks on my furniture or curtains?",
    answer:
      "No. The mist is dry and very fine, so it stays in the air instead of settling on surfaces. Place the diffuser on a flat surface and point it into the room rather than at a wall.",
  },
  {
    question: "How long does a bottle of oil last?",
    answer:
      "It depends on the bottle size, how many hours a day the diffuser runs and how strong you set it. Tell us how you plan to use it and we'll tell you roughly how long a bottle will last.",
  },
  {
    question: "Is it OK with children and pets?",
    answer:
      "Use the diffuser in a room with some airflow, keep the oil bottles out of reach and start on a low setting. If you have pets or anyone sensitive to scents at home, ask us and we'll suggest gentler options.",
  },
];

export default async function HomeFragrancePage() {
  const [oils, homeFragrance, diffusers] = await Promise.all([
    productService.getByCategory("fragrance-oils").then(withServedImagesAll),
    productService.getByCategory("home-fragrance").then(withServedImagesAll),
    productService.getByCategory("aroma-diffusers").then(withServedImagesAll),
  ]);

  // Home-sized machines first; car diffusers have their own page
  const homeDiffusers = [...diffusers, ...homeFragrance.filter((h) => !diffusers.some((d) => d.id === h.id))]
    .filter((p) => !/\bcar\b/i.test(p.name))
    .sort((a, b) => (coverageSqft(a) ?? Infinity) - (coverageSqft(b) ?? Infinity))
    .slice(0, 4);
  const featuredOils = oils.slice(0, 4);

  const whatsappHref = `https://wa.me/${BRAND_CONFIG.contact.whatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
    "Hi, I'd like help choosing a diffuser for my home."
  )}`;

  return (
    <div className="bg-[var(--porcelain)] text-[var(--near-black)]">
      {/* Hero */}
      <section className="relative min-h-[520px] sm:min-h-[580px] flex items-end overflow-hidden bg-[var(--near-black)]">
        <Image
          src="/images/categories/home-fragrance.jpg"
          alt="A living room scented with a Dr. Scent diffuser"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10" />
        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16 text-[var(--porcelain)]">
          <span className="text-[10px] font-semibold tracking-[0.24em] uppercase text-[var(--champagne)]">
            Home fragrance
          </span>
          <h1 className="mt-3 max-w-3xl font-serif text-[2.25rem] sm:text-6xl font-normal tracking-tight leading-[1.05]">
            Your home, beautifully scented.
          </h1>
          <p className="mt-5 max-w-2xl text-sm sm:text-base text-[var(--porcelain)]/80 leading-relaxed">
            Dr. Scent diffusers fill your rooms with pure fragrance oil as a fine, dry mist. No water, no heat and no
            residue, just a home that smells wonderful all day.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link
              href="#diffusers"
              className="inline-flex items-center justify-center gap-2 px-7 py-4 bg-[var(--porcelain)] text-[var(--near-black)] text-xs font-semibold tracking-[0.18em] uppercase hover:bg-white transition-colors"
            >
              Shop home diffusers <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/scent-finder"
              className="inline-flex items-center justify-center gap-2 px-7 py-4 border border-white/40 text-xs font-medium tracking-[0.18em] uppercase hover:border-white transition-colors"
            >
              Help me choose
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="pt-6">
          <Breadcrumbs items={[{ label: "Home Fragrance" }]} />
        </div>

        {/* Why */}
        <section className="py-12 sm:py-20">
          <h2 className="font-serif text-[1.75rem] sm:text-4xl font-normal tracking-tight">Why a cold-air diffuser?</h2>
          <div className="mt-8 grid gap-8 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {REASONS.map((reason) => (
              <div key={reason.title} className="border-t border-[var(--near-black)] pt-6">
                <h3 className="font-serif text-xl">{reason.title}</h3>
                <p className="mt-2 text-sm text-[var(--deep-espresso)]/80 leading-relaxed">{reason.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Room by room */}
        <section className="pb-12 sm:pb-20">
          <h2 className="font-serif text-[1.75rem] sm:text-4xl font-normal tracking-tight">A scent for every room</h2>
          <p className="mt-2 text-sm text-[var(--deep-espresso)]/80 max-w-xl">
            Not sure where to start? Here&apos;s what tends to work well in each part of the home.
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {ROOMS.map((room) => (
              <div key={room.room}>
                <div className="relative aspect-[4/3] overflow-hidden bg-[var(--warm-stone)]">
                  <Image
                    src={room.image}
                    alt={room.room}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover"
                  />
                </div>
                <p className="mt-4 text-[10px] font-semibold tracking-[0.2em] uppercase text-[var(--champagne)]">{room.mood}</p>
                <h3 className="mt-1 font-serif text-xl">{room.room}</h3>
                <p className="mt-1.5 text-sm text-[var(--deep-espresso)]/80 leading-relaxed">{room.text}</p>
              </div>
            ))}
          </div>
          <Link
            href="/scent-finder"
            className="mt-8 inline-flex items-center gap-1 text-xs font-medium tracking-[0.18em] uppercase hover:text-[var(--champagne)]"
          >
            Find your scent in under a minute <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </section>

        {/* Diffusers */}
        {homeDiffusers.length > 0 && (
          <section id="diffusers" className="pb-12 sm:pb-20 scroll-mt-28">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <h2 className="font-serif text-[1.75rem] sm:text-4xl font-normal tracking-tight">Diffusers for the home</h2>
              <Link
                href="/shop/aroma-diffusers"
                className="text-xs font-medium tracking-[0.18em] uppercase inline-flex items-center gap-1 hover:text-[var(--champagne)]"
              >
                See all diffusers <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              {homeDiffusers.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* Oils */}
        {featuredOils.length > 0 && (
          <section className="pb-12 sm:pb-20">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div>
                <h2 className="font-serif text-[1.75rem] sm:text-4xl font-normal tracking-tight">Fragrance oils</h2>
                <p className="mt-2 text-sm text-[var(--deep-espresso)]/80">Pure oils made for Dr. Scent diffusers.</p>
              </div>
              <Link
                href="/shop/fragrance-oils"
                className="text-xs font-medium tracking-[0.18em] uppercase inline-flex items-center gap-1 hover:text-[var(--champagne)]"
              >
                See all oils <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              {featuredOils.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Advice */}
      <section id="consultation" className="bg-[var(--ivory)] py-14 sm:py-20 scroll-mt-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid gap-10 lg:grid-cols-12 items-start">
          <div className="lg:col-span-5">
            <span className="text-[10px] font-semibold tracking-[0.24em] uppercase text-[var(--champagne)]">Free advice</span>
            <h2 className="mt-3 font-serif text-[1.75rem] sm:text-4xl font-normal tracking-tight">
              Not sure which diffuser or scent?
            </h2>
            <p className="mt-4 text-sm sm:text-base text-[var(--deep-espresso)]/80 leading-relaxed">
              Tell us about your home and we&apos;ll recommend the right diffuser and a few scents to try. We can chat on
              WhatsApp, give you a call, or visit and bring samples.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-3">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[var(--near-black)] text-[var(--porcelain)] text-xs font-medium tracking-[0.16em] uppercase"
              >
                <MessageCircle className="w-4 h-4" /> WhatsApp us
              </a>
              <a
                href={`tel:${BRAND_CONFIG.contact.phone.replace(/\s+/g, "")}`}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 border border-[var(--near-black)] text-xs font-medium tracking-[0.16em] uppercase hover:bg-white transition-colors"
              >
                <PhoneCall className="w-4 h-4" /> {BRAND_CONFIG.contact.phone}
              </a>
            </div>
          </div>
          <div className="lg:col-span-7">
            <HomeConsultationForm />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        <h2 className="font-serif text-[1.75rem] sm:text-4xl font-normal tracking-tight text-center">Common questions</h2>
        <div className="mt-8 border-t border-[var(--warm-stone)]">
          {FAQS.map((faq) => (
            <details key={faq.question} className="group border-b border-[var(--warm-stone)] [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex items-center justify-between gap-4 py-5 cursor-pointer list-none">
                <h3 className="font-serif text-lg">{faq.question}</h3>
                <span className="text-xl leading-none text-[var(--deep-espresso)]/60 group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="pb-5 text-sm text-[var(--deep-espresso)]/80 leading-relaxed">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
