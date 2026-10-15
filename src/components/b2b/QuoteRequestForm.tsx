"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Send,
  CheckCircle2,
  AlertCircle,
  Info,
  Clock,
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
    "Bespoke Brand Fragrance Creation",
    "Monthly Fragrance Oil Refill Subscription",
    "Event / Pop-up Temporary Scent Installation",
    "Trial Evaluation Kit for Executive Review",
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
      errors.companyName = "Please provide your organization or trading name.";
    }
    if (!formData.businessEmail.trim()) {
      errors.businessEmail = "Please provide a valid business email address.";
    } else if (!formData.businessEmail.includes("@") || !formData.businessEmail.includes(".")) {
      errors.businessEmail = "Please enter a valid email format.";
    }
    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = "Please provide a contact phone number.";
    }
    if (!formData.industry) {
      errors.industry = "Please select your primary industry.";
    }
    if (!formData.privacyConsent) {
      errors.privacyConsent = "You must review and consent to the privacy notice before submitting.";
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

    // Simulate typed client-side submission with honest Phase 1 demo feedback
    setTimeout(() => {
      setFormState({
        status: "success",
        errors: {},
        submittedData: { ...formData },
        message:
          "Enquiry validated successfully in Phase 1 Preview Mode. Note: This demonstration environment does not persist customer records to a production database yet.",
      });
    }, 800);
  };

  if (formState.status === "success") {
    return (
      <div className="bg-white rounded-xl border border-stone-200 p-8 sm:p-12 shadow-sm text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
        <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 mx-auto flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-2 max-w-xl mx-auto">
          <span className="text-xs font-semibold uppercase tracking-widest text-emerald-800">
            Form Validation Succeeded
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl text-stone-900 font-medium">
            Commercial Consultation Request Form Validated
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            All submitted fields have passed client-side type checking and validation rules.
          </p>
        </div>

        {/* Honest demo notification box */}
        <div className="max-w-xl mx-auto p-4 bg-amber-50/80 rounded-lg border border-amber-200 text-left text-xs text-amber-950 space-y-2">
          <div className="flex items-center gap-2 font-semibold">
            <Info className="w-4 h-4 text-amber-800 shrink-0" />
            <span>Phase 1 Demonstration Notice</span>
          </div>
          <p className="leading-relaxed">
            Your enquiry parameters (Contact: <strong>{formState.submittedData?.fullName}</strong> at <strong>{formState.submittedData?.companyName}</strong>, Industry: <strong>{formState.submittedData?.industry}</strong>) were validated locally. Because the production PostgreSQL backend is scheduled for <strong>Phase 2</strong>, no customer records or emails were transmitted or stored.
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
            className="px-6 py-3 border border-stone-300 text-stone-800 text-xs uppercase tracking-wider font-semibold rounded hover:bg-stone-50 transition-colors"
          >
            Submit Another Request
          </button>

          <Link
            href="/shop"
            className="px-6 py-3 bg-stone-900 text-amber-100 text-xs uppercase tracking-wider font-semibold rounded hover:bg-stone-800 transition-colors"
          >
            Return to Store Catalogue
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="bg-white rounded-xl border border-stone-200 p-6 sm:p-10 shadow-xs space-y-8">
      {/* Top Banner */}
      <div className="p-4 bg-stone-50 rounded-lg border border-stone-200 text-xs text-stone-600 flex items-start gap-3">
        <Info className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
        <p>
          Fields marked with an asterisk (<span className="text-red-600 font-bold">*</span>) are mandatory. Our scent engineers maintain strict confidentiality regarding all architectural plans and client data.
        </p>
      </div>

      {/* General Validation Banner */}
      {formState.status === "error" && (
        <div className="p-4 bg-red-50 rounded-lg border border-red-200 text-xs text-red-800 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div>
            <strong className="block font-semibold">Please correct the highlighted issues:</strong>
            <ul className="list-disc list-inside mt-1 space-y-0.5">
              {Object.values(formState.errors).map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Section 1: Contact Information */}
      <div className="space-y-4">
        <h3 className="font-serif text-lg font-medium text-stone-900 pb-2 border-b border-stone-100 flex items-center gap-2">
          <span>1. Contact Details</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="fullName" className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
              Contact Person <span className="text-red-600">*</span>
            </label>
            <input
              id="fullName"
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              aria-invalid={Boolean(formState.errors.fullName)}
              aria-describedby={formState.errors.fullName ? "fullName-error" : undefined}
              placeholder="e.g. Priyantha Perera"
              className={`w-full px-3.5 py-2.5 text-xs bg-stone-50 border rounded text-stone-900 focus:bg-white focus:outline-none focus:ring-1 ${
                formState.errors.fullName
                  ? "border-red-500 focus:ring-red-500"
                  : "border-stone-300 focus:ring-amber-800"
              }`}
            />
            {formState.errors.fullName && (
              <p id="fullName-error" className="text-[11px] text-red-600 mt-1">
                {formState.errors.fullName}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="companyName" className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
              Company / Property Name <span className="text-red-600">*</span>
            </label>
            <input
              id="companyName"
              type="text"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              aria-invalid={Boolean(formState.errors.companyName)}
              aria-describedby={formState.errors.companyName ? "companyName-error" : undefined}
              placeholder="e.g. Cinnamon Lakeside / Ceylon Corporate Towers"
              className={`w-full px-3.5 py-2.5 text-xs bg-stone-50 border rounded text-stone-900 focus:bg-white focus:outline-none focus:ring-1 ${
                formState.errors.companyName
                  ? "border-red-500 focus:ring-red-500"
                  : "border-stone-300 focus:ring-amber-800"
              }`}
            />
            {formState.errors.companyName && (
              <p id="companyName-error" className="text-[11px] text-red-600 mt-1">
                {formState.errors.companyName}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="businessEmail" className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
              Corporate Email <span className="text-red-600">*</span>
            </label>
            <input
              id="businessEmail"
              type="email"
              value={formData.businessEmail}
              onChange={(e) => setFormData({ ...formData, businessEmail: e.target.value })}
              aria-invalid={Boolean(formState.errors.businessEmail)}
              aria-describedby={formState.errors.businessEmail ? "businessEmail-error" : undefined}
              placeholder="e.g. p.perera@hotelgroup.lk"
              className={`w-full px-3.5 py-2.5 text-xs bg-stone-50 border rounded text-stone-900 focus:bg-white focus:outline-none focus:ring-1 ${
                formState.errors.businessEmail
                  ? "border-red-500 focus:ring-red-500"
                  : "border-stone-300 focus:ring-amber-800"
              }`}
            />
            {formState.errors.businessEmail && (
              <p id="businessEmail-error" className="text-[11px] text-red-600 mt-1">
                {formState.errors.businessEmail}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="phoneNumber" className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
              Direct Telephone / Mobile <span className="text-red-600">*</span>
            </label>
            <input
              id="phoneNumber"
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              aria-invalid={Boolean(formState.errors.phoneNumber)}
              aria-describedby={formState.errors.phoneNumber ? "phoneNumber-error" : undefined}
              placeholder="e.g. +94 77 123 4567"
              className={`w-full px-3.5 py-2.5 text-xs bg-stone-50 border rounded text-stone-900 focus:bg-white focus:outline-none focus:ring-1 ${
                formState.errors.phoneNumber
                  ? "border-red-500 focus:ring-red-500"
                  : "border-stone-300 focus:ring-amber-800"
              }`}
            />
            {formState.errors.phoneNumber && (
              <p id="phoneNumber-error" className="text-[11px] text-red-600 mt-1">
                {formState.errors.phoneNumber}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Section 2: Space & Venue Profile */}
      <div className="space-y-4">
        <h3 className="font-serif text-lg font-medium text-stone-900 pb-2 border-b border-stone-100">
          2. Venue Profile & Parameters
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="industry" className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
              Industry Sector <span className="text-red-600">*</span>
            </label>
            <select
              id="industry"
              value={formData.industry}
              onChange={(e) => setFormData({ ...formData, industry: e.target.value as IndustryType })}
              className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-300 rounded text-stone-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-800"
            >
              <option value="">Select industry category...</option>
              <option value="hospitality">Hospitality, Resorts & Boutique Hotels</option>
              <option value="corporate">Corporate Offices & Boardrooms</option>
              <option value="retail">High-End Retail & Showrooms</option>
              <option value="wellness-spa">Wellness Spas & Beauty Clinics</option>
              <option value="dining-nightlife">Restaurants, Bars & Member Clubs</option>
              <option value="healthcare">Healthcare & Private Clinics</option>
              <option value="real-estate">Luxury Residential Developments</option>
              <option value="other">Other Commercial Sector</option>
            </select>
            {formState.errors.industry && (
              <p className="text-[11px] text-red-600 mt-1">{formState.errors.industry}</p>
            )}
          </div>

          <div>
            <label htmlFor="cityDistrict" className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
              Location in Sri Lanka
            </label>
            <select
              id="cityDistrict"
              value={formData.cityDistrict}
              onChange={(e) => setFormData({ ...formData, cityDistrict: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-300 rounded text-stone-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-800"
            >
              <option value="Colombo (Districts 1-15)">Colombo (Districts 1-15)</option>
              <option value="Greater Colombo & Suburbs">Greater Colombo & Suburbs</option>
              <option value="Galle & Southern Coast">Galle & Southern Coastal Belt</option>
              <option value="Kandy & Central Province">Kandy & Central Province</option>
              <option value="Negombo & Western Coastal">Negombo & Western Coastal</option>
              <option value="Jaffna & Northern Province">Jaffna & Northern Province</option>
              <option value="Eastern Province (Trincomalee/Arugam)">Eastern Province</option>
              <option value="Other Area">Other Region in Sri Lanka</option>
            </select>
          </div>

          <div>
            <label htmlFor="spaceSize" className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
              Estimated Total Area
            </label>
            <select
              id="spaceSize"
              value={formData.spaceSize}
              onChange={(e) => setFormData({ ...formData, spaceSize: e.target.value as SpaceSizeType })}
              className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-300 rounded text-stone-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-800"
            >
              <option value="">Select space dimension...</option>
              <option value="compact">Under 500 sq.ft (Boutique Room / Office)</option>
              <option value="medium">500 – 2,500 sq.ft (Showroom / Restaurant)</option>
              <option value="large">2,500 – 10,000 sq.ft (Hotel Lobby / Multi-room)</option>
              <option value="hvac-enterprise">10,000+ sq.ft (Central HVAC / Whole Property)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Section 3: Services of Interest */}
      <div className="space-y-4">
        <h3 className="font-serif text-lg font-medium text-stone-900 pb-2 border-b border-stone-100">
          3. Scent Solutions of Interest
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {serviceOptions.map((service) => {
            const isChecked = formData.servicesOfInterest.includes(service);
            return (
              <label
                key={service}
                className={`flex items-start gap-3 p-3 rounded border text-xs cursor-pointer transition-all ${
                  isChecked
                    ? "bg-amber-50/80 border-amber-300 text-stone-900 font-medium"
                    : "bg-white border-stone-200 text-stone-700 hover:border-stone-300"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleCheckboxChange(service)}
                  className="rounded border-stone-300 text-amber-800 focus:ring-amber-800 w-4 h-4 mt-0.5"
                />
                <span>{service}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Section 4: Project Notes & Preferred Contact */}
      <div className="space-y-4">
        <h3 className="font-serif text-lg font-medium text-stone-900 pb-2 border-b border-stone-100">
          4. Specific Requirements & Contact Preference
        </h3>

        <div>
          <label htmlFor="requirementsDescription" className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
            Project Description or Special Architectural Considerations (Optional)
          </label>
          <textarea
            id="requirementsDescription"
            rows={4}
            value={formData.requirementsDescription}
            onChange={(e) => setFormData({ ...formData, requirementsDescription: e.target.value })}
            placeholder="Tell us about your ceiling heights, existing HVAC ventilation setup, current fragrance preferences, or target installation timeline..."
            className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-300 rounded text-stone-900 placeholder-stone-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-800"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
            Preferred Method for Initial Consultation
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { id: "phone", label: "Phone Call" },
              { id: "whatsapp", label: "WhatsApp" },
              { id: "email", label: "Email Brief" },
              { id: "site-visit", label: "On-Site Visit" },
            ].map((method) => (
              <label
                key={method.id}
                className={`p-3 rounded border text-xs text-center cursor-pointer transition-all ${
                  formData.preferredContact === method.id
                    ? "bg-stone-900 text-amber-100 border-stone-900 font-semibold"
                    : "bg-white border-stone-200 text-stone-700 hover:border-stone-300"
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
        <label className="flex items-start gap-3 cursor-pointer text-xs text-stone-600">
          <input
            type="checkbox"
            checked={formData.privacyConsent}
            onChange={(e) => setFormData({ ...formData, privacyConsent: e.target.checked })}
            className="rounded border-stone-300 text-amber-800 focus:ring-amber-800 w-4 h-4 mt-0.5 shrink-0"
          />
          <span>
            I consent to {BRAND_CONFIG.brandName} processing the provided information strictly for the purpose of this commercial scenting enquiry, in accordance with the{" "}
            <Link href="/privacy" className="text-amber-900 underline hover:text-amber-800">
              Privacy Notice
            </Link>
            . <span className="text-red-600">*</span>
          </span>
        </label>
        {formState.errors.privacyConsent && (
          <p className="text-[11px] text-red-600 mt-1 pl-7">
            {formState.errors.privacyConsent}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <div className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-[11px] text-stone-500 flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-stone-400" />
          <span>Our Colombo commercial team responds within 1 business day.</span>
        </div>

        <button
          type="submit"
          disabled={formState.status === "submitting"}
          className="w-full sm:w-auto px-8 py-3.5 bg-stone-900 text-amber-100 hover:bg-stone-800 disabled:opacity-50 text-xs font-semibold tracking-wider uppercase rounded transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          {formState.status === "submitting" ? (
            <span>Validating Enquiry...</span>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Submit Commercial Enquiry</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
