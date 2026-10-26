import React from "react";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { AlertCircle } from "lucide-react";
import { BRAND_CONFIG } from "@/config/brand.config";

export const metadata = {
  title: "Terms of service",
  description:
    "Terms and conditions governing the retail and commercial supply of authorized Dr. Scent products in Sri Lanka.",
};

export default function TermsPage() {
  const breadcrumbs = [{ label: "Terms of Service" }];

  return (
    <div className="py-10 sm:py-16 bg-[#FAF8F5]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <Breadcrumbs items={breadcrumbs} />

        {/* Draft Notice Banner */}
        <div className="p-4 rounded-lg bg-amber-50 border border-amber-300 text-xs text-amber-950 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />
          <div>
            <strong className="block font-semibold">Draft Terms Placeholder</strong>
            <p className="mt-0.5 leading-relaxed">
              These terms represent an operational placeholder for Phase 1 demonstration. Formal commercial terms and consumer retail conditions will be legally verified prior to launch.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <span className="text-xs font-semibold tracking-widest uppercase text-amber-800">
            Legal Framework
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-stone-900 font-normal">
            Terms of Service & Commercial Conditions
          </h1>
          <p className="text-xs text-stone-500">
            Phase 1 Demonstration Version • Subject to final commercial sign-off
          </p>
        </div>

        <div className="bg-white rounded-xl border border-stone-200 p-6 sm:p-10 shadow-xs space-y-8 text-xs sm:text-sm text-stone-700 leading-relaxed">
          <section className="space-y-3">
            <h2 className="font-serif text-lg font-semibold text-stone-900">
              1. Business Identity & Franchise Authorization
            </h2>
            <p>
              {BRAND_CONFIG.brandName} operates as an authorized franchisee partner for Dr. Scent in Sri Lanka. All Dr. Scent trademarks, brand assets, proprietary diffusers, and formula patents are utilized pursuant to valid franchise authorization.
            </p>
          </section>

          <section className="space-y-3 pt-4 border-t border-stone-100">
            <h2 className="font-serif text-lg font-semibold text-stone-900">
              2. Product Descriptions & Demonstration Status
            </h2>
            <p>
              Prices listed on this storefront are quoted in Sri Lankan Rupees ({BRAND_CONFIG.currency.code}). Products shown represent demonstration models and verified specifications. Final commercial quotations for B2B installations are subject to site inspection and signed service contracts.
            </p>
          </section>

          <section className="space-y-3 pt-4 border-t border-stone-100">
            <h2 className="font-serif text-lg font-semibold text-stone-900">
              3. Commercial Scenting Service Agreements
            </h2>
            <p>
              All commercial HVAC installations, monthly refill subscriptions, and equipment leases are governed by separate, customized Master Service Agreements executed directly between {BRAND_CONFIG.brandName} and the client organization.
            </p>
          </section>

          <section className="space-y-3 pt-4 border-t border-stone-100">
            <h2 className="font-serif text-lg font-semibold text-stone-900">
              4. Governing Law & Jurisdiction
            </h2>
            <p>
              These terms and all commercial transactions shall be governed by and construed in accordance with the laws of the Democratic Socialist Republic of Sri Lanka.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
