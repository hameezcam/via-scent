import React from "react";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { AlertCircle } from "lucide-react";
import { BRAND_CONFIG } from "@/config/brand.config";

export const metadata = {
  title: "Islandwide Shipping & Delivery Policy | Dr. Scent Franchisee Sri Lanka",
  description:
    "Delivery timelines, rates, and handling information for luxury aroma diffusers and fragrance oils across Sri Lanka.",
};

export default function ShippingPage() {
  const breadcrumbs = [{ label: "Shipping Policy" }];

  return (
    <div className="py-10 sm:py-16 bg-[#FAF8F5]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <Breadcrumbs items={breadcrumbs} />

        {/* Draft Notice Banner */}
        <div className="p-4 rounded-lg bg-amber-50 border border-amber-300 text-xs text-amber-950 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />
          <div>
            <strong className="block font-semibold">Draft Policy Placeholder</strong>
            <p className="mt-0.5 leading-relaxed">
              This document serves as an operational draft for Phase 1 demonstration. Official courier tariffs, logistics SLAs, and delivery contracts will be updated prior to commercial public launch.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <span className="text-xs font-semibold tracking-widest uppercase text-amber-800">
            Logistics & Delivery
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-stone-900 font-normal">
            Shipping & Islandwide Delivery Framework
          </h1>
          <p className="text-xs text-stone-500">
            Last updated: October 2026 • Franchise Supply Operations
          </p>
        </div>

        <div className="bg-white rounded-xl border border-stone-200 p-6 sm:p-10 shadow-xs space-y-8 text-xs sm:text-sm text-stone-700 leading-relaxed">
          <section className="space-y-3">
            <h2 className="font-serif text-lg font-semibold text-stone-900">
              1. Geographic Coverage in Sri Lanka
            </h2>
            <p>
              {BRAND_CONFIG.brandName} delivers to residential and commercial addresses across all nine provinces of Sri Lanka via contracted express courier partners.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded bg-stone-50 border border-stone-200">
                <strong className="block text-stone-900 font-medium">Greater Colombo (Zones 1-15 & Suburbs)</strong>
                <p className="text-xs text-stone-500 mt-1">
                  Standard delivery: 24 to 48 business hours. Same-day concierge delivery available for urgent orders upon request.
                </p>
              </div>
              <div className="p-4 rounded bg-stone-50 border border-stone-200">
                <strong className="block text-stone-900 font-medium">Outstation & Regional Provinces</strong>
                <p className="text-xs text-stone-500 mt-1">
                  Kandy, Galle, Matara, Negombo, Jaffna, Kurunegala, and all other regional centres: 2 to 4 business days.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-3 pt-4 border-t border-stone-100">
            <h2 className="font-serif text-lg font-semibold text-stone-900">
              2. Fragrance Oil Handling & Packaging Standards
            </h2>
            <p>
              All pure fragrance oils are packaged in heavy-gauge UV-filtering amber glass bottles sealed with tamper-evident caps. Shipments are packed with impact-resistant cushions to prevent leakage during tropical transit.
            </p>
          </section>

          <section className="space-y-3 pt-4 border-t border-stone-100">
            <h2 className="font-serif text-lg font-semibold text-stone-900">
              3. Order Tracking & Dispatch Notification
            </h2>
            <p>
              Upon dispatch from our Colombo fulfilment depot, clients receive an SMS and email notification with a digital courier tracking code to monitor real-time delivery status.
            </p>
          </section>

          <section className="space-y-3 pt-4 border-t border-stone-100">
            <h2 className="font-serif text-lg font-semibold text-stone-900">
              4. Commercial & High-Capacity HVAC Deliveries
            </h2>
            <p>
              Industrial units such as the HVAC 5000 and Commercial Column Towers are delivered and installed directly by our certified technicians to ensure correct duct integration and pneumatic calibration.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
