"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Building2,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  ArrowUp,
  ArrowDown,
  Upload,
  Check,
  X,
  AlertCircle,
  Eye,
  EyeOff,
  Globe,
  Loader2,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { TrustedPartner, TrustedPartnerInput } from "@/types/partner";

export default function AdminPartnersPage() {
  const [partners, setPartners] = useState<TrustedPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<TrustedPartner | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Form Fields
  const [name, setName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [displayOrder, setDisplayOrder] = useState<number>(1);
  const [isActive, setIsActive] = useState(true);

  // Delete Confirmation State
  const [partnerToDelete, setPartnerToDelete] = useState<TrustedPartner | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Load partners on mount
  const loadPartners = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/partners", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setPartners(Array.isArray(data) ? data : []);
      } else {
        setFeedback({ type: "error", message: "Failed to load partners." });
      }
    } catch {
      setFeedback({ type: "error", message: "Network error loading partners." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPartners();
  }, []);

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingPartner(null);
    setName("");
    setLogoUrl("");
    setWebsiteUrl("");
    setDisplayOrder(partners.length + 1);
    setIsActive(true);
    setFeedback(null);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (partner: TrustedPartner) => {
    setEditingPartner(partner);
    setName(partner.name);
    setLogoUrl(partner.logoUrl);
    setWebsiteUrl(partner.websiteUrl || "");
    setDisplayOrder(partner.displayOrder);
    setIsActive(partner.isActive);
    setFeedback(null);
    setIsModalOpen(true);
  };

  // Handle Logo File Upload via /api/admin/upload
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingLogo(true);
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to upload image.");
      }

      const data = await res.json();
      const uploadedUrl = data.url || (data.urls && data.urls[0]);
      if (uploadedUrl) {
        setLogoUrl(uploadedUrl);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Image upload failed.";
      setFeedback({ type: "error", message: msg });
    } finally {
      setUploadingLogo(false);
    }
  };

  // Save Partner (Create or Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFeedback({ type: "error", message: "Please provide a partner name." });
      return;
    }
    if (!logoUrl.trim()) {
      setFeedback({ type: "error", message: "Please upload or specify a logo URL." });
      return;
    }

    try {
      setSubmitting(true);
      setFeedback(null);

      const payload: TrustedPartnerInput = {
        name: name.trim(),
        logoUrl: logoUrl.trim(),
        websiteUrl: websiteUrl.trim() || undefined,
        displayOrder: Number(displayOrder) || 1,
        isActive,
      };

      let res: Response;
      if (editingPartner) {
        res = await fetch("/api/admin/partners", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingPartner.id, ...payload }),
        });
      } else {
        res = await fetch("/api/admin/partners", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to save partner.");
      }

      setFeedback({
        type: "success",
        message: editingPartner
          ? `Partner "${name}" updated successfully. Homepage slideshow updated.`
          : `Partner "${name}" added successfully. Now active in slideshow.`,
      });

      setIsModalOpen(false);
      await loadPartners();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error saving partner.";
      setFeedback({ type: "error", message: msg });
    } finally {
      setSubmitting(false);
    }
  };

  // Quick Toggle Active State
  const handleToggleActive = async (partner: TrustedPartner) => {
    try {
      const updatedStatus = !partner.isActive;
      const res = await fetch("/api/admin/partners", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: partner.id, isActive: updatedStatus }),
      });

      if (!res.ok) throw new Error("Failed to update status");

      setPartners((prev) =>
        prev.map((p) => (p.id === partner.id ? { ...p, isActive: updatedStatus } : p))
      );

      setFeedback({
        type: "success",
        message: `Partner "${partner.name}" is now ${updatedStatus ? "visible in" : "hidden from"} slideshow.`,
      });
    } catch {
      setFeedback({ type: "error", message: "Failed to update partner status." });
    }
  };

  // Move Partner Position (Up / Down)
  const handleMoveOrder = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= partners.length) return;

    const newPartners = [...partners];
    const temp = newPartners[index];
    newPartners[index] = newPartners[targetIndex];
    newPartners[targetIndex] = temp;

    setPartners(newPartners);

    try {
      const orderedIds = newPartners.map((p) => p.id);
      await fetch("/api/admin/partners", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reorder", orderedIds }),
      });
    } catch {
      await loadPartners();
    }
  };

  // Delete Partner
  const handleDeleteConfirm = async () => {
    if (!partnerToDelete) return;
    try {
      setDeleting(true);
      const res = await fetch(`/api/admin/partners?id=${encodeURIComponent(partnerToDelete.id)}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete partner.");

      setPartners((prev) => prev.filter((p) => p.id !== partnerToDelete.id));
      setFeedback({
        type: "success",
        message: `Partner "${partnerToDelete.name}" removed from slideshow.`,
      });
      setPartnerToDelete(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error deleting partner.";
      setFeedback({ type: "error", message: msg });
    } finally {
      setDeleting(false);
    }
  };

  const activeCount = partners.filter((p) => p.isActive).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-amber-800" />
            <h1 className="font-serif text-3xl font-medium text-stone-900">
              Trusted Clients Management
            </h1>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Manage corporate clients and brand accounts displayed in the &quot;OUR TRUSTED CLIENTS&quot; homepage slideshow.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-medium rounded transition-colors"
          >
            <span>View on Homepage</span>
            <ExternalLink className="w-3.5 h-3.5 text-stone-500" />
          </Link>

          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-amber-100 text-xs font-semibold uppercase tracking-wider rounded transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Client</span>
          </button>
        </div>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div
          className={`p-4 rounded-lg text-xs flex items-center justify-between ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
              : "bg-red-50 text-red-900 border border-red-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-stone-400 hover:text-stone-600 ml-4"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <span className="text-[11px] font-semibold tracking-wider text-stone-500 uppercase block">
            Total Partners
          </span>
          <span className="font-serif text-2xl font-bold text-stone-900 mt-1 block">
            {partners.length}
          </span>
          <span className="text-[11px] text-stone-400 mt-1 block">
            Configured in system
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <span className="text-[11px] font-semibold tracking-wider text-stone-500 uppercase block">
            Active in Slideshow
          </span>
          <span className="font-serif text-2xl font-bold text-emerald-700 mt-1 block">
            {activeCount}
          </span>
          <span className="text-[11px] text-stone-400 mt-1 block">
            Live on homepage ticker
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <span className="text-[11px] font-semibold tracking-wider text-stone-500 uppercase block">
            Slideshow Speed &amp; Behavior
          </span>
          <span className="font-serif text-base font-bold text-amber-900 mt-1 block">
            Smooth Infinite Ticker
          </span>
          <span className="text-[11px] text-stone-400 mt-1 block">
            Pauses on hover with manual controls
          </span>
        </div>
      </div>

      {/* Partners List Table */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-stone-200 bg-stone-50/50 flex items-center justify-between">
          <h2 className="text-xs font-semibold tracking-wider uppercase text-stone-700">
            Partner Logos &amp; Display Sequence
          </h2>
          <span className="text-[11px] text-stone-500">
            Use arrows to reorder slideshow sequence
          </span>
        </div>

        {loading ? (
          <div className="py-20 text-center text-xs text-stone-500">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-800" />
            <span>Loading clients...</span>
          </div>
        ) : partners.length === 0 ? (
          <div className="py-16 text-center text-stone-500">
            <Building2 className="w-10 h-10 text-stone-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-stone-700">No clients added yet.</p>
            <p className="text-xs text-stone-400 mt-1">
              Click &quot;Add New Client&quot; to add your first client logo.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-stone-200">
            {partners.map((partner, index) => (
              <div
                key={partner.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-stone-50 transition-colors"
              >
                {/* Left: Reorder Arrows & Logo */}
                <div className="flex items-center gap-4">
                  {/* Reorder Buttons */}
                  <div className="flex flex-col gap-1 shrink-0">
                    <button
                      onClick={() => handleMoveOrder(index, "up")}
                      disabled={index === 0}
                      className="p-1 rounded text-stone-400 hover:text-stone-700 hover:bg-stone-200 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                      title="Move up in slideshow"
                      aria-label="Move up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMoveOrder(index, "down")}
                      disabled={index === partners.length - 1}
                      className="p-1 rounded text-stone-400 hover:text-stone-700 hover:bg-stone-200 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                      title="Move down in slideshow"
                      aria-label="Move down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Order Badge */}
                  <span className="w-6 text-center text-xs font-mono font-bold text-stone-400">
                    #{index + 1}
                  </span>

                  {/* Logo Preview Box */}
                  <div className="w-32 h-16 rounded-lg bg-stone-100 border border-stone-200 p-2 flex items-center justify-center shrink-0 overflow-hidden relative">
                    <Image
                      src={partner.logoUrl}
                      alt={partner.name}
                      fill
                      className="object-contain p-2"
                      sizes="128px"
                      unoptimized={partner.logoUrl.startsWith("data:")}
                    />
                  </div>

                  {/* Partner Details */}
                  <div>
                    <h3 className="text-sm font-semibold text-stone-900">{partner.name}</h3>
                    {partner.websiteUrl ? (
                      <a
                        href={partner.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-amber-900 hover:text-amber-700 mt-0.5"
                      >
                        <Globe className="w-3 h-3" />
                        <span>{partner.websiteUrl.replace(/^https?:\/\//, "")}</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    ) : (
                      <span className="text-[11px] text-stone-400 block mt-0.5">
                        No external link
                      </span>
                    )}
                  </div>
                </div>

                {/* Right: Status & Actions */}
                <div className="flex items-center gap-3 self-end sm:self-center">
                  {/* Status Toggle Badge */}
                  <button
                    onClick={() => handleToggleActive(partner)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                      partner.isActive
                        ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                        : "bg-stone-200 text-stone-600 hover:bg-stone-300"
                    }`}
                    title="Click to toggle active in slideshow"
                  >
                    {partner.isActive ? (
                      <>
                        <Eye className="w-3 h-3 text-emerald-600" />
                        <span>Active</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3 h-3 text-stone-500" />
                        <span>Hidden</span>
                      </>
                    )}
                  </button>

                  {/* Edit Button */}
                  <button
                    onClick={() => handleOpenEditModal(partner)}
                    className="p-1.5 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-200 transition-colors"
                    title="Edit Partner"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => setPartnerToDelete(partner)}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Delete Partner"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200">
              <h2 className="font-serif text-lg font-medium text-stone-900">
                {editingPartner ? "Edit Trusted Client" : "Add New Trusted Client"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              {/* Partner Name */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Client Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Danube Home, ADCOOP, PAN Home"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-800"
                />
              </div>

              {/* Logo Upload & URL */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Partner Logo *
                </label>
                
                {/* Preview Box */}
                {logoUrl && (
                  <div className="mb-3 p-3 bg-stone-100 rounded-lg border border-stone-200 flex items-center justify-between">
                    <div className="relative w-36 h-14 bg-white rounded border border-stone-200 p-2 flex items-center justify-center">
                      <Image
                        src={logoUrl}
                        alt="Logo Preview"
                        fill
                        className="object-contain p-1"
                        sizes="144px"
                        unoptimized={logoUrl.startsWith("data:")}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setLogoUrl("")}
                      className="text-xs text-red-600 hover:underline p-1"
                    >
                      Remove
                    </button>
                  </div>
                )}

                {/* Upload or URL options */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <label className="flex-1 cursor-pointer inline-flex items-center justify-center gap-2 px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-medium border border-stone-300 transition-colors">
                      {uploadingLogo ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-stone-600" />
                          <span>Uploading image...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 text-stone-600" />
                          <span>Upload Logo File (SVG, PNG, WebP, JPG)</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        disabled={uploadingLogo}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Or enter logo URL (e.g. /images/partners/danube-home.svg)"
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-800"
                    />
                  </div>
                </div>
              </div>

              {/* Website URL */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Partner Website Link (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://example.com"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-800"
                />
                <span className="text-[10px] text-stone-400 mt-1 block">
                  Clicking the partner logo in the slideshow will open this link in a new tab.
                </span>
              </div>

              {/* Display Order & Active */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-800"
                  />
                </div>

                <div className="flex flex-col justify-end">
                  <label className="inline-flex items-center gap-2 cursor-pointer pb-2">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="w-4 h-4 text-amber-800 rounded border-stone-300 focus:ring-amber-800"
                    />
                    <span className="text-xs font-medium text-stone-800">
                      Show in Slideshow
                    </span>
                  </label>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-stone-600 hover:bg-stone-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-stone-900 hover:bg-stone-800 text-amber-100 text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors shadow-xs disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingPartner ? "Save Changes" : "Add Partner"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {partnerToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-stone-200">
            <h3 className="font-serif text-lg font-medium text-stone-900">
              Delete Client Logo?
            </h3>
            <p className="text-xs text-stone-500 mt-2">
              Are you sure you want to remove &quot;{partnerToDelete.name}&quot; from the trusted clients slideshow? This action will immediately update the live homepage.
            </p>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setPartnerToDelete(null)}
                className="px-4 py-2 rounded-lg text-xs font-medium text-stone-600 hover:bg-stone-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
              >
                {deleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
