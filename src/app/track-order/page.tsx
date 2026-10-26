import React from "react";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { TrackOrderForm } from "@/components/orders/TrackOrderForm";

export const metadata = {
  title: "Track your order",
  description: "Check where your VIA Scent order is with your order number and phone number.",
};

export default function TrackOrderPage() {
  return (
    <div className="bg-[var(--porcelain)] text-[var(--near-black)] py-12 sm:py-16 min-h-[60vh]">
      <div className="max-w-xl mx-auto px-4 sm:px-6">
        <Breadcrumbs items={[{ label: "Track your order" }]} />
        <h1 className="mt-6 font-serif text-3xl sm:text-5xl font-normal tracking-tight">Track your order</h1>
        <p className="mt-3 text-sm sm:text-base text-[var(--deep-espresso)]/80 leading-relaxed">
          Enter your order number (it&apos;s in your confirmation email) and the phone number you ordered with.
        </p>
        <TrackOrderForm />
      </div>
    </div>
  );
}
