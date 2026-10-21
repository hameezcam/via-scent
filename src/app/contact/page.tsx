"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  Info,
} from "lucide-react";
import { BRAND_CONFIG } from "@/config/brand.config";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "Retail Inquiry",
    message: "",
  });

  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [feedback, setFeedback] = useState("");

  const breadcrumbs = [{ label: "Contact & Concierge" }];

  const [honeypot, setHoneypot] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setStatus("error");
      setFeedback("Please fill in all mandatory fields before sending.");
      return;
    }

    if (!formData.email.includes("@") || !formData.email.includes(".")) {
      setStatus("error");
      setFeedback("Please provide a valid email address.");
      return;
    }

    setStatus("submitting");
    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "contact", ...formData, website: honeypot }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus("error");
        setFeedback(data.error || "Something went wrong. Please try again or email info@vialk.com.");
        return;
      }
      setStatus("success");
      setFeedback("Thank you! Your message has been sent. Our team will get back to you shortly.");
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "Retail Inquiry",
        message: "",
      });
    } catch {
      setStatus("error");
      setFeedback("Network error. Please check your connection or email info@vialk.com.");
    }
  };

  return (
    <div className="py-10 sm:py-16 bg-[#FAF8F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumbs items={breadcrumbs} />

        <div className="max-w-3xl pt-2 pb-10 space-y-3">
          <span className="text-xs font-semibold tracking-widest uppercase text-amber-800">
            Colombo Showroom & Concierge
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-stone-900 font-normal">
            Connect With Our Scent Specialists
          </h1>
          <p className="text-xs sm:text-base text-stone-600 leading-relaxed">
            Whether inquiring about residential nebulizers, oil flacon refills, or scheduling a commercial on-site fragrance demonstration, our team is at your disposal.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Contact Details & Showroom */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="space-y-1">
                <span className="font-serif text-xl font-semibold text-stone-900 block">
                  {BRAND_CONFIG.brandName}
                </span>
                <span className="text-[11px] uppercase tracking-wider text-amber-800 font-medium block">
                  {BRAND_CONFIG.franchiseStatement}
                </span>
              </div>

              <div className="space-y-4 text-xs text-stone-600">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-stone-900 block font-semibold">Boutique & Showroom</strong>
                    <span>{BRAND_CONFIG.contact.address}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-stone-900 block font-semibold">Concierge Line</strong>
                    <span>{BRAND_CONFIG.contact.phone}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-stone-900 block font-semibold">General Inquiries</strong>
                    <span>{BRAND_CONFIG.contact.email}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-stone-900 block font-semibold">Operating Hours</strong>
                    <span>{BRAND_CONFIG.contact.hours}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-stone-100 space-y-2">
                <Link
                  href="/business-scenting/request-quote"
                  className="w-full py-2.5 bg-stone-900 text-amber-100 text-xs font-semibold uppercase tracking-wider rounded text-center block hover:bg-stone-800 transition-colors"
                >
                  Commercial B2B Quote Desk →
                </Link>
              </div>
            </div>

            {/* Demo Notice */}
            <div className="p-4 rounded-lg bg-amber-50/70 border border-amber-200/80 text-xs text-amber-950 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
              <span>
                Showroom address and contact details shown above are demonstration placeholders until official local showroom tenancy is finalized.
              </span>
            </div>
          </div>

          {/* Contact Message Form */}
          <div className="lg:col-span-7">
            <form
              onSubmit={handleSubmit}
              noValidate
              className="bg-white rounded-xl border border-stone-200 p-6 sm:p-10 shadow-xs space-y-6"
            >
              <h2 className="font-serif text-xl font-medium text-stone-900 pb-3 border-b border-stone-100">
                Send an Inquiry Message
              </h2>

              {/* Spam trap: hidden from people, filled in by bots */}
              <div aria-hidden="true" style={{ position: "absolute", left: "-10000px", width: 1, height: 1, overflow: "hidden" }}>
                <label htmlFor="contact-website">Website</label>
                <input
                  id="contact-website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                />
              </div>

              {status === "error" && (
                <div className="p-3 bg-red-50 rounded border border-red-200 text-xs text-red-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{feedback}</span>
                </div>
              )}

              {status === "success" && (
                <div className="p-4 bg-emerald-50 rounded border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2.5 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <span>{feedback}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contact-name" className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Your Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Anoma Silva"
                    className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-300 rounded text-stone-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-800"
                  />
                </div>

                <div>
                  <label htmlFor="contact-email" className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Email Address <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. anoma@example.lk"
                    className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-300 rounded text-stone-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contact-phone" className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Phone / WhatsApp Number
                  </label>
                  <input
                    id="contact-phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. +94 77 000 0000"
                    className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-300 rounded text-stone-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-800"
                  />
                </div>

                <div>
                  <label htmlFor="contact-subject" className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Nature of Inquiry
                  </label>
                  <select
                    id="contact-subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-300 rounded text-stone-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-800"
                  >
                    <option value="Retail Inquiry">Retail Fragrance or Diffuser Inquiry</option>
                    <option value="Commercial Inquiry">Commercial Scenting Consultation</option>
                    <option value="Hardware Service">Hardware Servicing / Spare Parts</option>
                    <option value="Corporate Gifts">Corporate Gifting & Discovery Sets</option>
                    <option value="Other">Other Query</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="contact-message" className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Message <span className="text-red-600">*</span>
                </label>
                <textarea
                  id="contact-message"
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="How can our concierge assist your scenting requirements today?"
                  className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-300 rounded text-stone-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-800 placeholder-stone-400"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <p className="text-[11px] text-stone-400">
                  Strictly confidential. No spam.
                </p>
                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="px-8 py-3 bg-stone-900 text-amber-100 hover:bg-stone-800 text-xs font-semibold tracking-wider uppercase rounded transition-colors flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{status === "submitting" ? "Sending..." : "Submit Message"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
