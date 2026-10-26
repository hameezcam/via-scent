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
    residenceType: "Apartment",
    targetSpaces: [],
    preferredScentFamilies: [],
    consultationType: "whatsapp",
    notes: "",
  });

  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const spaceOptions = [
    "Living room & entrance",
    "Bedroom",
    "Dining room & kitchen",
    "Study or home office",
    "Guest room",
    "The whole home",
  ];

  const scentOptions = [
    "Warm & woody (oud, sandalwood, amber)",
    "Fresh & clean (citrus, white tea)",
    "Floral (jasmine, rose, lily)",
    "Fruity & sweet (berries, fig)",
    "Not sure yet, help me choose",
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
      setErrorMessage("Please enter your name and phone number.");
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
      setErrorMessage("We couldn't send your request just now. Please message us on WhatsApp instead.");
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
            Request received
          </span>
          <h3 className="font-serif text-2xl sm:text-3xl text-[#151412] font-normal">
            Thank you, {formData.fullName}
          </h3>
          <p className="text-sm text-[#57534E] max-w-md mx-auto leading-relaxed font-light">
            We&apos;ll contact you on{" "}
            <span className="font-semibold text-[#151412]">
              {formData.consultationType === "whatsapp" ? "WhatsApp" : "Phone"} ({formData.phone})
            </span>{" "}
            within one business day to help you choose.
          </p>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href={`https://wa.me/${BRAND_CONFIG.contact.whatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
              `Hi VIA Scent, I just asked for help choosing a scent for my home (${formData.residenceType} in ${formData.cityDistrict}). My name is ${formData.fullName}.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#25D366] text-white rounded-xl text-xs uppercase tracking-[0.16em] font-semibold hover:bg-[#20ba5a] transition-colors shadow-sm"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chat on WhatsApp</span>
          </a>
          <button
            type="button"
            onClick={() => setStatus("idle")}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-[#E7E2D8] text-[#151412] rounded-xl text-xs uppercase tracking-[0.16em] font-medium hover:border-[#B49A70] transition-colors"
          >
            <span>Send another request</span>
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
          <span>Free advice</span>
        </div>
        <h3 className="font-serif text-2xl sm:text-3xl font-normal text-[#151412]">
          Get help choosing
        </h3>
        <p className="text-xs sm:text-sm text-[#78716C] font-light">
          Tell us about your home and we&apos;ll recommend the right diffuser and scents. It&apos;s free.
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
            Your name *
          </label>
          <input
            type="text"
            required
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            placeholder="e.g. Priyantha Jayawardena"
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

      {/* Row 2: Location & Type of home */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#292524] mb-2">
            Area *
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
            Type of home
          </label>
          <select
            value={formData.residenceType}
            onChange={(e) => setFormData({ ...formData, residenceType: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-[#E7E2D8] bg-[#FAF8F5] text-sm text-[#151412] focus:outline-none focus:border-[#B49A70] focus:bg-white transition-colors"
          >
            <option value="Apartment">Apartment</option>
            <option value="House">House</option>
            <option value="Villa">Villa</option>
            <option value="Holiday home">Holiday home</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Target Spaces */}
      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#292524] mb-2">
          Which rooms?
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
          Which scents do you like?
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
          How should we help?
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { id: "whatsapp", label: "WhatsApp", desc: "Chat with us and get suggestions" },
            { id: "phone", label: "Phone call", desc: "A quick call to talk it through" },
            { id: "onsite-flight", label: "Home visit", desc: "We bring scents for you to try" },
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
          Anything else? (optional)
        </label>
        <textarea
          rows={3}
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="e.g. we have a cat, or we'd like something that fits a wooden interior"
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
        <span>{status === "submitting" ? "Sending..." : "Get free advice"}</span>
        <Send className="w-3.5 h-3.5" />
      </button>

      <p className="text-[11px] text-center text-[#78716C] font-light">
        We keep your details private and never share them.
      </p>
    </form>
  );
}
