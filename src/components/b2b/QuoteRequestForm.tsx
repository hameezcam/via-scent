"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Send,
  CheckCircle2,
  AlertCircle,
  Info,
  Clock,
  Sparkles,
} from "lucide-react";
import { B2BQuoteRequest, B2BFormState, IndustryType, SpaceSizeType, PreferredContactMethod } from "@/types/enquiry";
import { BRAND_CONFIG } from "@/config/brand.config";

export function QuoteRequestForm() {
  const [formData, setFormData] = useState<B2BQuoteRequest>({
    fullName: "",
    companyName: "",
    businessEmail: "",
    phoneNumber: "",
    industry: "",
    cityDistrict: "Colombo (Districts 1-15)",
    spaceSize: "",
    servicesOfInterest: [],
    requirementsDescription: "",
    preferredContact: "phone",
    privacyConsent: false,
  });

  const [formState, setFormState] = useState<B2BFormState>({
    status: "idle",
    errors: {},
  });

  const serviceOptions = [
    "HVAC Central Duct Scenting",
    "Standalone Architectural Columns",
    "Bespoke Brand Fragrance Formulation",
    "Monthly Franchise Refill Logistics",
    "Temporary Exhibition / Event Installation",
    "Executive Olfactory Sample Suite",
  ];

  const handleCheckboxChange = (service: string) => {
    setFormData((prev) => {
      const exists = prev.servicesOfInterest.includes(service);
      return {
        ...prev,
        servicesOfInterest: exists
          ? prev.servicesOfInterest.filter((s) => s !== service)
          : [...prev.servicesOfInterest, service],
      };
    });
  };

  const validate = (): boolean => {
    const errors: Partial<Record<keyof B2BQuoteRequest, string>> = {};

    if (!formData.fullName.trim()) {
      errors.fullName = "Please provide your full name.";
    }
    if (!formData.companyName.trim()) {
      errors.companyName = "Please provide your organization or establishment name.";
    }
    if (!formData.businessEmail.trim()) {
      errors.businessEmail = "Please provide a valid business email address.";
    } else if (!formData.businessEmail.includes("@") || !formData.businessEmail.includes(".")) {
      errors.businessEmail = "Please enter a valid corporate email format.";
    }
    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = "Please provide a telephone or mobile number.";
    }
    if (!formData.industry) {
      errors.industry = "Please select your primary industry sector.";
    }
    if (!formData.privacyConsent) {
      errors.privacyConsent = "Please review and accept our commercial confidentiality & privacy terms.";
    }

    setFormState({
      status: Object.keys(errors).length > 0 ? "error" : "idle",
      errors,
    });

    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setFormState({ status: "submitting", errors: {} });

    setTimeout(() => {
      setFormState({
        status: "success",
        errors: {},
        submittedData: { ...formData },
        message:
          "Commercial consultation brief received. A dedicated VIA Scent architectural specialist will review your space requirements within 24 hours.",
      });
    }, 700);
  };

  if (formState.status === "success") {
    return (
      <div className="bg-white rounded-sm border border-[var(--warm-stone)]/50 p-8 sm:p-14 shadow-sm text-center space-y-6 animate-in fade-in duration-300">
        <div className="w-16 h-16 rounded-full bg-[var(--ivory)] border border-[var(--warm-stone)]/60 text-[var(--champagne)] mx-auto flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 stroke-[1.5]" />
        </div>

        <div className="space-y-2.5 max-w-xl mx-auto">
          <span className="text-[10px] font-medium tracking-[0.25em] uppercase text-[var(--champagne)]">
            Consultation Brief Registered
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl text-[var(--near-black)] font-normal">
            Thank you, {formState.submittedData?.fullName}
          </h2>
          <p className="text-xs sm:text-sm text-[var(--deep-espresso)]/80 leading-relaxed font-light">
            Your commercial scenting brief for <strong>{formState.submittedData?.companyName}</strong> ({formState.submittedData?.industry}) has been assigned to our Colombo corporate scent engineering team.
          </p>
        </div>

        <div className="max-w-xl mx-auto p-4 bg-[var(--ivory)] rounded-sm border border-[var(--warm-stone)]/50 text-left text-xs text-[var(--deep-espresso)] space-y-1.5 font-light">
          <div className="flex items-center gap-2 font-medium text-[var(--near-black)]">
            <Sparkles className="w-4 h-4 text-[var(--champagne)] shrink-0" />
            <span>Next Steps in Architecture</span>
          </div>
          <p className="leading-relaxed">
            Our engineers will examine HVAC specifications and floorplans. We will contact you via {formState.submittedData?.preferredContact === "phone" ? "telephone" : formState.submittedData?.preferredContact} within 1 business day to schedule your complimentary scent demonstration.
          </p>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              setFormData({
                fullName: "",
                companyName: "",
                businessEmail: "",
                phoneNumber: "",
                industry: "",
                cityDistrict: "Colombo (Districts 1-15)",
                spaceSize: "",
                servicesOfInterest: [],
                requirementsDescription: "",
                preferredContact: "phone",
                privacyConsent: false,
              });
              setFormState({ status: "idle", errors: {} });
            }}
            className="px-6 py-3 border border-[var(--warm-stone)]/60 text-[var(--deep-espresso)] text-xs uppercase tracking-[0.15em] font-light rounded-sm hover:border-[var(--champagne)] transition-colors cursor-pointer"
          >
            Submit Another Brief
          </button>

          <Link
            href="/shop"
            className="px-6 py-3 bg-[var(--near-black)] text-[var(--porcelain)] text-xs uppercase tracking-[0.15em] font-medium rounded-sm hover:bg-[var(--champagne)] transition-colors"
          >
            Explore Retail Catalogue
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="bg-white rounded-sm border border-[var(--warm-stone)]/50 p-6 sm:p-12 shadow-xs space-y-9 text-[var(--near-black)]">
      {/* Top Banner */}
      <div className="p-4 bg-[var(--ivory)] rounded-sm border border-[var(--warm-stone)]/40 text-xs text-[var(--deep-espresso)]/80 flex items-start gap-3 font-light">
        <Info className="w-4 h-4 text-[var(--champagne)] shrink-0 mt-0.5" />
        <p>
          Fields marked with an asterisk (<span className="text-red-500 font-bold">*</span>) are essential for accurate spatial evaluation. All commercial layout plans remain strictly confidential.
        </p>
      </div>

      {/* General Validation Banner */}
      {formState.status === "error" && (
        <div className="p-4 bg-red-50 rounded-sm border border-red-200 text-xs text-red-800 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div>
            <strong className="block font-medium">Please review the required fields:</strong>
            <ul className="list-disc list-inside mt-1 space-y-0.5 font-light">
              {Object.values(formState.errors).map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Section 1: Contact Information */}
      <div className="space-y-4">
        <h3 className="font-serif text-lg font-normal text-[var(--near-black)] pb-2 border-b border-[var(--warm-stone)]/30 flex items-center gap-2">
          <span>1. Principal Contact</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="fullName" className="block text-[10px] font-medium text-[var(--deep-espresso)] uppercase tracking-[0.15em] mb-1.5">
              Contact Person <span className="text-red-500">*</span>
            </label>
            <input
              id="fullName"
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="e.g. Priyantha Perera"
              className={`w-full px-3.5 py-2.5 text-xs bg-[var(--porcelain)] border rounded-sm text-[var(--near-black)] focus:bg-white focus:outline-none focus:border-[var(--champagne)] transition-colors ${
                formState.errors.fullName ? "border-red-400" : "border-[var(--warm-stone)]/50"
              }`}
            />
            {formState.errors.fullName && (
              <p className="text-[10px] text-red-600 mt-1">{formState.errors.fullName}</p>
            )}
          </div>

          <div>
            <label htmlFor="companyName" className="block text-[10px] font-medium text-[var(--deep-espresso)] uppercase tracking-[0.15em] mb-1.5">
              Organization / Property Name <span className="text-red-500">*</span>
            </label>
            <input
              id="companyName"
              type="text"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              placeholder="e.g. Cinnamon Grand / Colombo Financial Centre"
              className={`w-full px-3.5 py-2.5 text-xs bg-[var(--porcelain)] border rounded-sm text-[var(--near-black)] focus:bg-white focus:outline-none focus:border-[var(--champagne)] transition-colors ${
                formState.errors.companyName ? "border-red-400" : "border-[var(--warm-stone)]/50"
              }`}
            />
            {formState.errors.companyName && (
              <p className="text-[10px] text-red-600 mt-1">{formState.errors.companyName}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="businessEmail" className="block text-[10px] font-medium text-[var(--deep-espresso)] uppercase tracking-[0.15em] mb-1.5">
              Corporate Email <span className="text-red-500">*</span>
            </label>
            <input
              id="businessEmail"
              type="email"
              value={formData.businessEmail}
              onChange={(e) => setFormData({ ...formData, businessEmail: e.target.value })}
              placeholder="e.g. p.perera@hotelgroup.lk"
              className={`w-full px-3.5 py-2.5 text-xs bg-[var(--porcelain)] border rounded-sm text-[var(--near-black)] focus:bg-white focus:outline-none focus:border-[var(--champagne)] transition-colors ${
                formState.errors.businessEmail ? "border-red-400" : "border-[var(--warm-stone)]/50"
              }`}
            />
            {formState.errors.businessEmail && (
              <p className="text-[10px] text-red-600 mt-1">{formState.errors.businessEmail}</p>
            )}
          </div>

          <div>
            <label htmlFor="phoneNumber" className="block text-[10px] font-medium text-[var(--deep-espresso)] uppercase tracking-[0.15em] mb-1.5">
              Direct Telephone / WhatsApp <span className="text-red-500">*</span>
            </label>
            <input
              id="phoneNumber"
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              placeholder="e.g. +94 77 123 4567"
              className={`w-full px-3.5 py-2.5 text-xs bg-[var(--porcelain)] border rounded-sm text-[var(--near-black)] focus:bg-white focus:outline-none focus:border-[var(--champagne)] transition-colors ${
                formState.errors.phoneNumber ? "border-red-400" : "border-[var(--warm-stone)]/50"
              }`}
            />
            {formState.errors.phoneNumber && (
              <p className="text-[10px] text-red-600 mt-1">{formState.errors.phoneNumber}</p>
            )}
          </div>
        </div>
      </div>

      {/* Section 2: Space & Venue Profile */}
      <div className="space-y-4">
        <h3 className="font-serif text-lg font-normal text-[var(--near-black)] pb-2 border-b border-[var(--warm-stone)]/30">
          2. Environment & Scale
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="industry" className="block text-[10px] font-medium text-[var(--deep-espresso)] uppercase tracking-[0.15em] mb-1.5">
              Industry Sector <span className="text-red-500">*</span>
            </label>
            <select
              id="industry"
              value={formData.industry}
              onChange={(e) => setFormData({ ...formData, industry: e.target.value as IndustryType })}
              className="w-full px-3.5 py-2.5 text-xs bg-[var(--porcelain)] border border-[var(--warm-stone)]/50 rounded-sm text-[var(--near-black)] focus:bg-white focus:outline-none focus:border-[var(--champagne)] cursor-pointer"
            >
              <option value="">Select industry category...</option>
              <option value="hospitality">Resorts & Boutique Hotels</option>
              <option value="corporate">Corporate Headquarters & Boardrooms</option>
              <option value="retail">Luxury Showrooms & Flagship Retail</option>
              <option value="wellness-spa">Wellness Spas & Aesthetic Clinics</option>
              <option value="dining-nightlife">Restaurants & Private Member Clubs</option>
              <option value="real-estate">High-Rise Residential Developments</option>
              <option value="other">Other Commercial Venue</option>
            </select>
            {formState.errors.industry && (
              <p className="text-[10px] text-red-600 mt-1">{formState.errors.industry}</p>
            )}
          </div>

          <div>
            <label htmlFor="cityDistrict" className="block text-[10px] font-medium text-[var(--deep-espresso)] uppercase tracking-[0.15em] mb-1.5">
              Location in Sri Lanka
            </label>
            <select
              id="cityDistrict"
              value={formData.cityDistrict}
              onChange={(e) => setFormData({ ...formData, cityDistrict: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs bg-[var(--porcelain)] border border-[var(--warm-stone)]/50 rounded-sm text-[var(--near-black)] focus:bg-white focus:outline-none focus:border-[var(--champagne)] cursor-pointer"
            >
              <option value="Colombo (Districts 1-15)">Colombo (Districts 1-15)</option>
              <option value="Greater Colombo & Suburbs">Greater Colombo & Suburbs</option>
              <option value="Galle & Southern Coast">Galle & Southern Coastal Belt</option>
              <option value="Kandy & Central Province">Kandy & Central Province</option>
              <option value="Negombo & Western Coastal">Negombo & Western Coast</option>
              <option value="Other Area">Other Region in Sri Lanka</option>
            </select>
          </div>

          <div>
            <label htmlFor="spaceSize" className="block text-[10px] font-medium text-[var(--deep-espresso)] uppercase tracking-[0.15em] mb-1.5">
              Estimated Total Area
            </label>
            <select
              id="spaceSize"
              value={formData.spaceSize}
              onChange={(e) => setFormData({ ...formData, spaceSize: e.target.value as SpaceSizeType })}
              className="w-full px-3.5 py-2.5 text-xs bg-[var(--porcelain)] border border-[var(--warm-stone)]/50 rounded-sm text-[var(--near-black)] focus:bg-white focus:outline-none focus:border-[var(--champagne)] cursor-pointer"
            >
              <option value="">Select space dimension...</option>
              <option value="compact">Under 500 sq.ft (Executive Suite)</option>
              <option value="medium">500 – 2,500 sq.ft (Boutique / Lounge)</option>
              <option value="large">2,500 – 10,000 sq.ft (Lobby / Multi-Zone)</option>
              <option value="hvac-enterprise">10,000+ sq.ft (Central HVAC Integration)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Section 3: Services of Interest */}
      <div className="space-y-4">
        <h3 className="font-serif text-lg font-normal text-[var(--near-black)] pb-2 border-b border-[var(--warm-stone)]/30">
          3. Scent Solutions of Interest
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {serviceOptions.map((service) => {
            const isChecked = formData.servicesOfInterest.includes(service);
            return (
              <label
                key={service}
                className={`flex items-start gap-3 p-3.5 rounded-sm border text-xs cursor-pointer transition-all ${
                  isChecked
                    ? "bg-[var(--ivory)] border-[var(--champagne)] text-[var(--near-black)] font-medium"
                    : "bg-white border-[var(--warm-stone)]/40 text-[var(--deep-espresso)]/80 hover:border-[var(--champagne)]/60"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleCheckboxChange(service)}
                  className="rounded-sm border-[var(--warm-stone)] text-[var(--champagne)] focus:ring-[var(--champagne)] w-4 h-4 mt-0.5 cursor-pointer"
                />
                <span>{service}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Section 4: Project Notes & Preferred Contact */}
      <div className="space-y-4">
        <h3 className="font-serif text-lg font-normal text-[var(--near-black)] pb-2 border-b border-[var(--warm-stone)]/30">
          4. Architectural Notes & Preferred Communication
        </h3>

        <div>
          <label htmlFor="requirementsDescription" className="block text-[10px] font-medium text-[var(--deep-espresso)] uppercase tracking-[0.15em] mb-1.5">
            Ventilation Characteristics or Target Atmosphere (Optional)
          </label>
          <textarea
            id="requirementsDescription"
            rows={4}
            value={formData.requirementsDescription}
            onChange={(e) => setFormData({ ...formData, requirementsDescription: e.target.value })}
            placeholder="Please detail ceiling heights, HVAC duct layout, target scent profile, or desired installation timeline..."
            className="w-full px-3.5 py-2.5 text-xs bg-[var(--porcelain)] border border-[var(--warm-stone)]/50 rounded-sm text-[var(--near-black)] placeholder-[var(--warm-stone)]/70 focus:bg-white focus:outline-none focus:border-[var(--champagne)] transition-colors font-light"
          />
        </div>

        <div>
          <label className="block text-[10px] font-medium text-[var(--deep-espresso)] uppercase tracking-[0.15em] mb-2">
            Preferred Method for Initial Consultation
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { id: "phone", label: "Phone Call" },
              { id: "whatsapp", label: "WhatsApp" },
              { id: "email", label: "Email Brief" },
              { id: "site-visit", label: "On-Site Survey" },
            ].map((method) => (
              <label
                key={method.id}
                className={`p-3 rounded-sm border text-xs text-center cursor-pointer transition-all ${
                  formData.preferredContact === method.id
                    ? "bg-[var(--near-black)] text-[var(--porcelain)] border-[var(--near-black)] font-medium"
                    : "bg-white border-[var(--warm-stone)]/40 text-[var(--deep-espresso)] hover:border-[var(--champagne)]"
                }`}
              >
                <input
                  type="radio"
                  name="preferredContact"
                  value={method.id}
                  checked={formData.preferredContact === method.id}
                  onChange={() =>
                    setFormData({ ...formData, preferredContact: method.id as PreferredContactMethod })
                  }
                  className="sr-only"
                />
                <span>{method.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Privacy Consent Checkbox */}
      <div className="pt-2">
        <label className="flex items-start gap-3 cursor-pointer text-xs text-[var(--deep-espresso)]/80 font-light">
          <input
            type="checkbox"
            checked={formData.privacyConsent}
            onChange={(e) => setFormData({ ...formData, privacyConsent: e.target.checked })}
            className="rounded-sm border-[var(--warm-stone)] text-[var(--champagne)] focus:ring-[var(--champagne)] w-4 h-4 mt-0.5 shrink-0 cursor-pointer"
          />
          <span>
            I consent to {BRAND_CONFIG.brandName} processing the provided information strictly for the purpose of this commercial scenting enquiry, in accordance with the{" "}
            <Link href="/privacy" className="text-[var(--near-black)] underline hover:text-[var(--champagne)]">
              Privacy Notice
            </Link>
            . <span className="text-red-500">*</span>
          </span>
        </label>
        {formState.errors.privacyConsent && (
          <p className="text-[10px] text-red-600 mt-1 pl-7">
            {formState.errors.privacyConsent}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <div className="pt-4 border-t border-[var(--warm-stone)]/40 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-[11px] text-[var(--deep-espresso)]/70 flex items-center gap-1.5 font-light">
          <Clock className="w-4 h-4 text-[var(--champagne)]" />
          <span>Our Colombo commercial engineering team responds within 1 business day.</span>
        </div>

        <button
          type="submit"
          disabled={formState.status === "submitting"}
          className="w-full sm:w-auto px-8 py-3.5 bg-[var(--near-black)] text-[var(--porcelain)] hover:bg-[var(--champagne)] hover:text-white disabled:opacity-50 text-xs font-medium tracking-[0.2em] uppercase rounded-sm transition-all duration-300 flex items-center justify-center gap-2 shadow-sm cursor-pointer"
        >
          {formState.status === "submitting" ? (
            <span>Registering Brief...</span>
          ) : (
            <>
              <Send className="w-3.5 h-3.5" />
              <span>Submit Commercial Brief</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
