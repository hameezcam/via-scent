import React from "react";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { QuoteRequestForm } from "@/components/b2b/QuoteRequestForm";
import { Building2, ShieldCheck, Phone, Mail, Clock } from "lucide-react";
import { BRAND_CONFIG } from "@/config/brand.config";
import type { IndustryType } from "@/types/enquiry";

const INDUSTRY_VALUES: IndustryType[] = [
  "hospitality",
  "corporate",
  "retail",
  "wellness-spa",
  "dining-nightlife",
  "healthcare",
  "real-estate",
  "other",
];

export const metadata = {
  title: "Book a Free Site Visit | Business Scenting | VIA Scent",
  description:
    "Tell us about your hotel, office, shop or spa and we'll visit for free, recommend the right Dr. Scent diffusers and bring scents to try.",
};

export default async function RequestQuotePage({
  searchParams,
}: {
  searchParams: Promise<{ industry?: string | string[] }>;
}) {
  const { industry } = await searchParams;
  const initialIndustry = INDUSTRY_VALUES.find((v) => v === industry) ?? "";
  const breadcrumbs = [
    { label: "Business Scenting", href: "/business-scenting" },
    { label: "Book a Site Visit" },
  ];

  return (
    <div className="py-10 sm:py-16 bg-[#FAF8F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumbs items={breadcrumbs} />

        <div className="pt-2 pb-10 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest uppercase text-amber-800 mb-2">
            <Building2 className="w-3.5 h-3.5" />
            <span>Free site visit</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-stone-900 font-normal tracking-tight">
            Tell us about your space
          </h1>
          <p className="text-xs sm:text-base text-stone-600 mt-3 leading-relaxed">
            Fill in a few details and we&apos;ll arrange a free visit. We&apos;ll measure your space, recommend the right machines and bring scents for you to try, then send you a quote.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Form */}
          <div className="lg:col-span-8">
            <QuoteRequestForm initialIndustry={initialIndustry} />
          </div>

          {/* Sidebar: Direct Support & Process Overview */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-xs space-y-4">
              <h2 className="font-serif text-lg font-semibold text-stone-900 pb-3 border-b border-stone-200">
                Prefer to talk?
              </h2>
              <p className="text-xs text-stone-600 leading-relaxed">
                Call, email or WhatsApp us and we&apos;ll help you straight away.
              </p>

              <div className="space-y-3 pt-2 text-xs text-stone-700">
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-amber-800 shrink-0" />
                  <span>{BRAND_CONFIG.contact.phone}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-amber-800 shrink-0" />
                  <span>{BRAND_CONFIG.contact.email}</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
                  <span>{BRAND_CONFIG.contact.hours}</span>
                </div>
              </div>
            </div>

            <div className="bg-amber-50/60 rounded-xl border border-amber-200/80 p-6 space-y-3 text-xs text-stone-700">
              <div className="flex items-center gap-2 text-amber-950 font-semibold uppercase tracking-wider text-[11px]">
                <ShieldCheck className="w-4 h-4 text-amber-700" />
                <span>What happens next</span>
              </div>
              <ul className="space-y-2 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-700 mt-1.5 shrink-0" />
                  <span>We call you within one business day to arrange a visit.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-700 mt-1.5 shrink-0" />
                  <span>We visit for free and bring scents for you to try in your space.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-700 mt-1.5 shrink-0" />
                  <span>You get a quote covering the machines, installation and monthly refills.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
