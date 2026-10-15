import React from "react";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { AlertCircle } from "lucide-react";
import { BRAND_CONFIG } from "@/config/brand.config";

export const metadata = {
  title: "Privacy Notice & Data Protection Policy | Dr. Scent Franchisee Sri Lanka",
  description:
    "Privacy and data protection notice regarding commercial inquiries and client records.",
};

export default function PrivacyPage() {
  const breadcrumbs = [{ label: "Privacy Notice" }];

  return (
    <div className="py-10 sm:py-16 bg-[#FAF8F5]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <Breadcrumbs items={breadcrumbs} />

        {/* Draft Notice Banner */}
        <div className="p-4 rounded-lg bg-amber-50 border border-amber-300 text-xs text-amber-950 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />
          <div>
            <strong className="block font-semibold">Draft Legal Notice Placeholder</strong>
            <p className="mt-0.5 leading-relaxed">
              This privacy policy is a draft template prepared for Phase 1 preview. Formal legal review and alignment with Sri Lanka Personal Data Protection Act (PDPA) No. 9 of 2022 will be executed prior to full commercial database deployment in Phase 2.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <span className="text-xs font-semibold tracking-widest uppercase text-amber-800">
            Compliance & Transparency
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-stone-900 font-normal">
            Privacy Notice & Client Confidentiality
          </h1>
          <p className="text-xs text-stone-500">
            Phase 1 Demonstration Version • Subject to final legal endorsement
          </p>
        </div>

        <div className="bg-white rounded-xl border border-stone-200 p-6 sm:p-10 shadow-xs space-y-8 text-xs sm:text-sm text-stone-700 leading-relaxed">
          <section className="space-y-3">
            <h2 className="font-serif text-lg font-semibold text-stone-900">
              1. Information We Collect
            </h2>
            <p>
              When submitting commercial scenting quote requests or contacting our concierge desk, we may collect your name, business name, corporate email address, contact telephone number, and building parameters. In Phase 1 demonstration mode, this information is validated client-side and not committed to a persistent database.
            </p>
          </section>

          <section className="space-y-3 pt-4 border-t border-stone-100">
            <h2 className="font-serif text-lg font-semibold text-stone-900">
              2. Commercial Confidentiality
            </h2>
            <p>
              We treat all client floor plans, HVAC duct schematics, and corporate branding details as strictly confidential proprietary information. We do not sell, rent, or lease client information to third-party marketing brokers.
            </p>
          </section>

          <section className="space-y-3 pt-4 border-t border-stone-100">
            <h2 className="font-serif text-lg font-semibold text-stone-900">
              3. Browser Storage & Cookies
            </h2>
            <p>
              Our storefront utilizes browser local storage solely to retain shopping cart items and quantities between page views. No credit card information, bank details, or passwords are ever held in local storage.
            </p>
          </section>

          <section className="space-y-3 pt-4 border-t border-stone-100">
            <h2 className="font-serif text-lg font-semibold text-stone-900">
              4. Contact the Data Controller
            </h2>
            <p>
              For inquiries regarding data practices or to request removal of client information, please contact our concierge desk at <strong>{BRAND_CONFIG.contact.email}</strong>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
