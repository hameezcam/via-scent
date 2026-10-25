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
  title: "Request a Commercial Scenting Quote | Dr. Scent Franchisee Sri Lanka",
  description:
    "Request a bespoke commercial fragrance quotation for your hotel, office, retail store, or wellness space in Sri Lanka. Tailored HVAC ducting and monthly maintenance.",
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
    { label: "Request a Quote" },
  ];

  return (
    <div className="py-10 sm:py-16 bg-[#FAF8F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumbs items={breadcrumbs} />

        <div className="pt-2 pb-10 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest uppercase text-amber-800 mb-2">
            <Building2 className="w-3.5 h-3.5" />
            <span>Commercial Inquiries</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-stone-900 font-normal tracking-tight">
            Request an Architectural Scenting Consultation
          </h1>
          <p className="text-xs sm:text-base text-stone-600 mt-3 leading-relaxed">
            Please furnish the key parameters of your property or development below. Our Colombo engineering team will analyze your space requirements and prepare an equipment proposal with customized fragrance options.
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
                Direct Commercial Desk
              </h2>
              <p className="text-xs text-stone-600 leading-relaxed">
                Prefer an immediate phone discussion or priority on-site demonstration in Colombo?
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
                <span>What to Expect</span>
              </div>
              <ul className="space-y-2 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-700 mt-1.5 shrink-0" />
                  <span>Initial review by certified Dr. Scent hardware specialists.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-700 mt-1.5 shrink-0" />
                  <span>Complimentary on-site scent flight demonstration.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-700 mt-1.5 shrink-0" />
                  <span>Comprehensive quotation covering hardware, installation, and monthly oil service.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
