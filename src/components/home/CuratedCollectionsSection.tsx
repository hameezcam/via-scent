import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";

export function CuratedCollectionsSection() {
  const collections = [
    {
      title: "The Sanctuary Residence",
      subtitle: "Master Suites & Living Lounges",
      description: "Gentle porcelain diffusers paired with white tea, morning bergamot, and delicate cashmere wood.",
      image: "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=800&q=85",
      link: "/shop/home-fragrance",
      tag: "Home Curation",
    },
    {
      title: "The Executive Nocturne",
      subtitle: "Boardrooms & Private Offices",
      description: "Architectural matte black columns dispensing rare agarwood, cardamom, and dark golden amber.",
      image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=85",
      link: "/shop/fragrance-oils",
      tag: "Executive Series",
    },
    {
      title: "The Grand Discovery Flight",
      subtitle: "Gift Coffers & Host Discovery",
      description: "Five signature 15ml flacons encased in rigid ivory linen with gold foil hot-stamping.",
      image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=85",
      link: "/shop/gift-collections",
      tag: "Gifting & Bundles",
    },
  ];

  return (
    <section className="py-20 sm:py-28 bg-[#FAF8F5] border-b border-[#E7E2D8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest uppercase text-amber-800">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Editorial Pairings</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-normal text-stone-900 tracking-tight">
            Curated Collections for Every Mood
          </h2>
          <p className="text-sm text-stone-600">
            Harmonious pairings of cold-air diffusion instruments and artisanal fragrance profiles.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {collections.map((col) => (
            <div
              key={col.title}
              className="group flex flex-col bg-white rounded-lg border border-stone-200 overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-100">
                <Image
                  src={col.image}
                  alt={col.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                />
                <div className="absolute top-3 left-3 bg-stone-900/80 backdrop-blur-xs text-amber-200 text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded">
                  {col.tag}
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-amber-800 font-semibold block mb-1">
                    {col.subtitle}
                  </span>
                  <h3 className="font-serif text-xl font-medium text-stone-900 group-hover:text-amber-900 transition-colors">
                    {col.title}
                  </h3>
                  <p className="text-xs text-stone-600 leading-relaxed mt-2">
                    {col.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-stone-100">
                  <Link
                    href={col.link}
                    className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold text-stone-900 hover:text-amber-800 transition-colors"
                  >
                    <span>Explore Collection</span>
                    <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
