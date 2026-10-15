import React from "react";
import { Truck, ShieldCheck, Headphones, Award } from "lucide-react";

export function TrustSection() {
  const trustItems = [
    {
      icon: Truck,
      title: "Islandwide Delivery",
      description: "Express courier coverage across Greater Colombo, Kandy, Galle, and all provinces in Sri Lanka.",
    },
    {
      icon: ShieldCheck,
      title: "Authorized Franchise Supply",
      description: `Official franchisee supply chain ensuring genuine Dr. Scent hardware and verified IFRA-certified oils.`,
    },
    {
      icon: Headphones,
      title: "Scenting Concierge",
      description: "Dedicated advisors available to assess room dimensions and recommend optimal fragrance diffusion rates.",
    },
    {
      icon: Award,
      title: "Official Hardware Warranty",
      description: "1 to 2-year manufacturer-backed franchise warranty with local servicing and spare parts support.",
    },
  ];

  return (
    <section className="py-14 bg-white border-b border-[#E7E2D8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {trustItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <div key={item.title} className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200/80 text-amber-800 flex items-center justify-center shrink-0">
                  <IconComponent className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-sm font-semibold text-stone-900">
                    {item.title}
                  </h3>
                  <p className="text-xs text-stone-500 leading-relaxed mt-1">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
