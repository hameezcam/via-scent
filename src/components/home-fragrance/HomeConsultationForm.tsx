"use client";

import React, { useState } from "react";
import { Send, CheckCircle2, AlertCircle, Sparkles, MessageCircle, Phone, Home } from "lucide-react";
import { BRAND_CONFIG } from "@/config/brand.config";

interface ResidentialConsultationData {
  fullName: string;
  phone: string;
  email: string;
  cityDistrict: string;
  residenceType: string;
  targetSpaces: string[];
  preferredScentFamilies: string[];
  consultationType: "phone" | "onsite-flight" | "whatsapp";
  notes: string;
}

export function HomeConsultationForm() {
  const [formData, setFormData] = useState<ResidentialConsultationData>({
    fullName: "",
    phone: "",
    email: "",
    cityDistrict: "Colombo (Districts 1-15)",
    residenceType: "Luxury Apartment / Penthouse",
    targetSpaces: ["Master Suite", "Living Lounge & Foyer"],
    preferredScentFamilies: ["Woody & Noble Oud", "Fresh Mountain Tea & Bergamot"],
    consultationType: "whatsapp",
    notes: "",
  });

  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const spaceOptions = [
    "Living Lounge & Foyer",
    "Master Suite & Dressing Room",
    "Dining Room & Open Kitchen",
    "Executive Study / Library",
    "Guest Bedroom Suite",
    "Full Residence Scent Architecture",
  ];

  const scentOptions = [
    "Woody & Noble Oud (Royal Oud & Amber Noir)",
    "Fresh Mountain Tea & Bergamot (White Tea & Thyme)",
    "Warm Spiced Sandalwood (Santal & Black Cardamom)",
    "Coastal Marine & Fig Leaf (Coastal Fig & Cypress)",
    "Velvety Floral & Cashmere (Damask Rose & Veil)",
  ];

  const toggleSpace = (space: string) => {
    setFormData((prev) => ({
      ...prev,
      targetSpaces: prev.targetSpaces.includes(space)
        ? prev.targetSpaces.filter((s) => s !== space)
        : [...prev.targetSpaces, space],
    }));
  };

  const toggleScent = (scent: string) => {
    setFormData((prev) => ({
      ...prev,
      preferredScentFamilies: prev.preferredScentFamilies.includes(scent)
        ? prev.preferredScentFamilies.filter((s) => s !== scent)
        : [...prev.preferredScentFamilies, scent],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.phone.trim()) {
      setStatus("error");
      setErrorMessage("Please provide your full name and contact number.");
      return;
    }

    setStatus("submitting");
    setErrorMessage("");

    try {
      // Persist to localStorage for client audit/history
      const existing = JSON.parse(localStorage.getItem("via_scent_home_consultations") || "[]");
      const record = {
        ...formData,
        id: `HSC-${Date.now()}`,
        submittedAt: new Date().toISOString(),
      };
      localStorage.setItem("via_scent_home_consultations", JSON.stringify([...existing, record]));

      // Simulated network dispatch
      await new Promise((resolve) => setTimeout(resolve, 800));
      setStatus("success");
    } catch {
      setStatus("error");
      setErrorMessage("Unable to submit your request at this moment. Please reach out via WhatsApp.");
    }
  };

  if (status === "success") {
    return (
      <div className="bg-[#FFFFFF] p-8 sm:p-12 rounded-2xl border border-[#B49A70]/60 shadow-xl text-center space-y-6 animate-in fade-in zoom-in-95 duration-500">
        <div className="w-16 h-16 mx-auto rounded-full bg-[#B49A70]/10 flex items-center justify-center text-[#B49A70]">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#B49A70] block">
            REQUEST RECEIVED
          </span>
          <h3 className="font-serif text-2xl sm:text-3xl text-[#151412] font-normal">
            Thank you, {formData.fullName}
          </h3>
          <p className="text-sm text-[#57534E] max-w-md mx-auto leading-relaxed font-light">
            Our Senior Fragrance Stylist will contact you via{" "}
            <span className="font-semibold text-[#151412]">
              {formData.consultationType === "whatsapp" ? "WhatsApp" : "Phone"} ({formData.phone})
            </span>{" "}
            within 4 business hours to curate your residential fragrance profile.
          </p>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href={`https://wa.me/${BRAND_CONFIG.contact.whatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
              `Hello VIA Scent, I just requested an In-Home Scent Consultation for my residence (${formData.residenceType} in ${formData.cityDistrict}). My name is ${formData.fullName}.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#25D366] text-white rounded-xl text-xs uppercase tracking-[0.16em] font-semibold hover:bg-[#20ba5a] transition-colors shadow-sm"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chat on WhatsApp Directly</span>
          </a>
          <button
            type="button"
            onClick={() => setStatus("idle")}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-[#E7E2D8] text-[#151412] rounded-xl text-xs uppercase tracking-[0.16em] font-medium hover:border-[#B49A70] transition-colors"
          >
            <span>Submit Another Inquiry</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[#FFFFFF] p-6 sm:p-10 rounded-2xl border border-[#E7E2D8] shadow-lg space-y-7"
    >
      <div className="space-y-1.5 border-b border-[#E7E2D8] pb-5">
        <div className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#B49A70]">
          <Home className="w-3.5 h-3.5" />
          <span>BESPOKE RESIDENTIAL CONSULTATION</span>
        </div>
        <h3 className="font-serif text-2xl sm:text-3xl font-normal text-[#151412]">
          Request Private Home Scent Styling
        </h3>
        <p className="text-xs sm:text-sm text-[#78716C] font-light">
          Complimentary olfactory mapping and private fragrance flight demonstration for luxury residences across Sri Lanka.
        </p>
      </div>

      {status === "error" && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Row 1: Contact Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#292524] mb-2">
            Your Full Name *
          </label>
          <input
            type="text"
            required
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            placeholder="e.g. Dr. Priyantha Jayawardena"
            className="w-full px-4 py-3 rounded-xl border border-[#E7E2D8] bg-[#FAF8F5] text-sm text-[#151412] focus:outline-none focus:border-[#B49A70] focus:bg-white transition-colors"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#292524] mb-2">
            Phone / WhatsApp Number *
          </label>
          <input
            type="tel"
            required
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+94 77 123 4567"
            className="w-full px-4 py-3 rounded-xl border border-[#E7E2D8] bg-[#FAF8F5] text-sm text-[#151412] focus:outline-none focus:border-[#B49A70] focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* Row 2: Location & Residence Type */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#292524] mb-2">
            City / District *
          </label>
          <select
            value={formData.cityDistrict}
            onChange={(e) => setFormData({ ...formData, cityDistrict: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-[#E7E2D8] bg-[#FAF8F5] text-sm text-[#151412] focus:outline-none focus:border-[#B49A70] focus:bg-white transition-colors"
          >
            <option value="Colombo (Districts 1-15)">Colombo (Districts 1-15)</option>
            <option value="Colombo Suburbs (Rajagiriya, Battaramulla, Nawala, Kotte)">Colombo Suburbs (Rajagiriya, Battaramulla, Nawala)</option>
            <option value="Mount Lavinia & Dehiwala">Mount Lavinia & Dehiwala</option>
            <option value="Negombo & Gampaha">Negombo & Gampaha</option>
            <option value="Kandy & Central Highlands">Kandy & Central Highlands</option>
            <option value="Galle, Unawatuna & Southern Coast">Galle, Unawatuna & Southern Coast</option>
            <option value="Other Sri Lanka District">Other District (Islandwide)</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#292524] mb-2">
            Residence Type
          </label>
          <select
            value={formData.residenceType}
            onChange={(e) => setFormData({ ...formData, residenceType: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-[#E7E2D8] bg-[#FAF8F5] text-sm text-[#151412] focus:outline-none focus:border-[#B49A70] focus:bg-white transition-colors"
          >
            <option value="Luxury Apartment / Penthouse">Luxury Apartment / Penthouse</option>
            <option value="Private Detached Villa">Private Detached Villa</option>
            <option value="Multi-Story Modern Residence">Multi-Story Modern Residence</option>
            <option value="Coastal Vacation Villa / Estate">Coastal Vacation Villa / Estate</option>
            <option value="Heritage Bungalow">Heritage Bungalow</option>
          </select>
        </div>
      </div>

      {/* Target Spaces */}
      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#292524] mb-2">
          Target Living Spaces to Scent
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {spaceOptions.map((space) => {
            const isSelected = formData.targetSpaces.includes(space);
            return (
              <button
                key={space}
                type="button"
                onClick={() => toggleSpace(space)}
                className={`p-3 rounded-xl text-left text-xs flex items-center justify-between border transition-all ${
                  isSelected
                    ? "border-[#B49A70] bg-[#FAF8F5] text-[#151412] font-medium shadow-xs"
                    : "border-[#E7E2D8] bg-white text-[#78716C] hover:border-[#D8D0C4]"
                }`}
              >
                <span>{space}</span>
                <span
                  className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                    isSelected ? "border-[#B49A70] bg-[#B49A70] text-white" : "border-[#D8D0C4]"
                  }`}
                >
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Preferred Scent Families */}
      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#292524] mb-2">
          Fragrance Profiles of Interest
        </label>
        <div className="space-y-2">
          {scentOptions.map((scent) => {
            const isSelected = formData.preferredScentFamilies.includes(scent);
            return (
              <button
                key={scent}
                type="button"
                onClick={() => toggleScent(scent)}
                className={`w-full p-3 rounded-xl text-left text-xs flex items-center justify-between border transition-all ${
                  isSelected
                    ? "border-[#B49A70] bg-[#FAF8F5] text-[#151412] font-medium shadow-xs"
                    : "border-[#E7E2D8] bg-white text-[#78716C] hover:border-[#D8D0C4]"
                }`}
              >
                <span>{scent}</span>
                <span
                  className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                    isSelected ? "border-[#B49A70] bg-[#B49A70] text-white" : "border-[#D8D0C4]"
                  }`}
                >
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Consultation Delivery Type */}
      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#292524] mb-2">
          Preferred Consultation Method
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { id: "whatsapp", label: "WhatsApp Concierge", desc: "Instant scent notes & photos" },
            { id: "phone", label: "Phone Advisory", desc: "15-min specialist call" },
            { id: "onsite-flight", label: "In-Home Scent Flight", desc: "Private on-site sample flight" },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFormData({ ...formData, consultationType: item.id as any })}
              className={`p-3.5 rounded-xl text-left border transition-all ${
                formData.consultationType === item.id
                  ? "border-[#B49A70] bg-[#FAF8F5] text-[#151412] shadow-xs"
                  : "border-[#E7E2D8] bg-white text-[#78716C] hover:border-[#D8D0C4]"
              }`}
            >
              <span className="block text-xs font-semibold text-[#151412] mb-0.5">{item.label}</span>
              <span className="block text-[11px] text-[#78716C] leading-snug">{item.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Additional Notes */}
      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#292524] mb-2">
          Special Notes or Aesthetic Preferences (Optional)
        </label>
        <textarea
          rows={3}
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="e.g. Seeking discreet diffusers that match walnut wood and travertine finishes in our Colombo 07 penthouse."
          className="w-full px-4 py-3 rounded-xl border border-[#E7E2D8] bg-[#FAF8F5] text-sm text-[#151412] focus:outline-none focus:border-[#B49A70] focus:bg-white transition-colors resize-none"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full py-4 bg-[#151412] text-[#F8F6F1] hover:bg-[#B49A70] hover:text-[#151412] rounded-xl text-xs uppercase tracking-[0.22em] font-semibold transition-all duration-300 shadow-md hover:shadow-xl flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-50"
      >
        <Sparkles className="w-4 h-4 text-[#B49A70] group-hover:text-[#151412] transition-colors" />
        <span>{status === "submitting" ? "Sending Request..." : "Request In-Home Scent Consultation"}</span>
        <Send className="w-3.5 h-3.5" />
      </button>

      <p className="text-[11px] text-center text-[#78716C] font-light">
        Strict privacy guaranteed. We never share residential client details with third parties.
      </p>
    </form>
  );
}
