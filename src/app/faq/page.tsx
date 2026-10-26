import React from "react";
import Link from "next/link";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { BRAND_CONFIG } from "@/config/brand.config";

export const metadata = {
  title: "Frequently asked questions",
  description: "Delivery, payment, warranty and how Dr. Scent diffusers work, answered in plain words.",
};

const FAQS = [
  {
    q: "How long does delivery take?",
    a: "Greater Colombo usually takes 1 to 2 working days. The rest of Sri Lanka takes 2 to 4 working days. See the delivery page for fees.",
    link: { href: "/shipping", label: "Delivery info" },
  },
  {
    q: "How can I pay?",
    a: "Cash on delivery works across Sri Lanka. Card payment is coming soon, so for now please choose cash on delivery.",
  },
  {
    q: "Where is my order?",
    a: "Enter your order number and phone number on the order status page to see where it is.",
    link: { href: "/track-order", label: "Track your order" },
  },
  {
    q: "How does a Dr. Scent diffuser work?",
    a: "It breaks the fragrance oil into a fine, dry mist using cold air. There is no water and no heat, so the scent stays true and nothing gets damp.",
  },
  {
    q: "How much oil will I use?",
    a: "It depends on the room size and how long the machine runs. Call us with your room size and we'll tell you before you buy.",
  },
  {
    q: "Is there a warranty?",
    a: "Our air freshener machines come with a 6-month hardware warranty. Oils, sprays and candles are not covered by it.",
    link: { href: "/warranty", label: "Warranty claims" },
  },
  {
    q: "Can I return something?",
    a: "Yes. You have 7 days from delivery, and if it arrives damaged or defective we cover the return and replace it for free. The returns policy has the details.",
    link: { href: "/returns", label: "Returns policy" },
  },
  {
    q: "Do you scent hotels, offices and shops?",
    a: "Yes. We visit your space for free, install the machines and refill the oil every month.",
    link: { href: "/business-scenting", label: "Scenting for business" },
  },
];

export default function FaqPage() {
  const phone = BRAND_CONFIG.contact.phone;
  return (
    <div className="bg-[var(--porcelain)] text-[var(--near-black)] py-12 sm:py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <Breadcrumbs items={[{ label: "FAQ" }]} />
        <h1 className="mt-6 font-serif text-3xl sm:text-5xl font-normal tracking-tight">Frequently asked questions</h1>
        <div className="mt-10 border-t border-[var(--warm-stone)]">
          {FAQS.map((item) => (
            <details key={item.q} className="group border-b border-[var(--warm-stone)] py-5">
              <summary className="cursor-pointer list-none flex items-start justify-between gap-4 font-serif text-lg sm:text-xl">
                {item.q}
                <span className="mt-1 text-[var(--champagne)] transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm sm:text-base text-[var(--deep-espresso)]/80 leading-relaxed">{item.a}</p>
              {item.link && (
                <Link href={item.link.href} className="mt-3 inline-block text-xs font-semibold tracking-[0.16em] uppercase underline underline-offset-4">
                  {item.link.label}
                </Link>
              )}
            </details>
          ))}
        </div>
        <p className="mt-10 text-sm text-[var(--deep-espresso)]/80">
          Still have a question? Call us on{" "}
          <a href={`tel:${phone.replace(/\s/g, "")}`} className="underline underline-offset-4">
            {phone}
          </a>{" "}
          or <Link href="/contact" className="underline underline-offset-4">send us a message</Link>.
        </p>
      </div>
    </div>
  );
}
