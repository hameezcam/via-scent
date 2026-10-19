"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Sparkles,
  Save,
  Plus,
  Trash2,
  ExternalLink,
  Move,
  Eye,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Layers,
  ShoppingBag,
  Sliders,
  Check,
  ChevronRight,
  ArrowRight,
  X,
} from "lucide-react";
import { InteractiveRoomConfig, InteractiveRoomHotspot, ScenePreset } from "@/types/interactive-room";
import { formatLKR } from "@/config/brand.config";

interface CatalogProduct {
  id: string;
  slug: string;
  name: string;
  basePriceLKR: number;
  categoryName: string;
  image: string;
}

export default function AdminInteractiveRoomPage() {
  const [config, setConfig] = useState<InteractiveRoomConfig | null>(null);
  const [presets, setPresets] = useState<ScenePreset[]>([]);
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [recreating, setRecreating] = useState(false);
  const [selectedHotspotId, setSelectedHotspotId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Gemini AI Recreator modal / state
  const [selectedAiProductIds, setSelectedAiProductIds] = useState<string[]>([]);
  const [selectedPresetId, setSelectedPresetId] = useState<string>("penthouse-living-room");
  const [customAiPrompt, setCustomAiPrompt] = useState<string>("");
  const [geminiApiKey, setGeminiApiKey] = useState<string>("");
  const [showApiKeyInput, setShowApiKeyInput] = useState<boolean>(false);

  const canvasRef = useRef<HTMLDivElement>(null);

  // Load saved API key from localStorage if available
  useEffect(() => {
    try {
      const savedKey = localStorage.getItem("viascent_gemini_api_key");
      if (savedKey) setGeminiApiKey(savedKey);
    } catch {}
  }, []);

  // Fetch initial data
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await fetch("/api/admin/interactive-room");
        if (!res.ok) throw new Error("Failed to load room data");
        const data = await res.json();
        setConfig(data.config);
        setPresets(data.presets || []);
        setProducts(data.products || []);

        // Pre-select products currently assigned to hotspots
        if (data.config?.hotspots) {
          const initialIds = data.config.hotspots
            .map((h: InteractiveRoomHotspot) => h.productId)
            .filter(Boolean);
          setSelectedAiProductIds(initialIds);
          if (data.config.hotspots.length > 0) {
            setSelectedHotspotId(data.config.hotspots[0].id);
          }
        }
      } catch (err: any) {
        setFeedback({ type: "error", text: err.message || "Failed to load data" });
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Handle clicking on image canvas to position or create hotspot
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!canvasRef.current || !config) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const xPercent = Math.max(0, Math.min(100, Number(((clickX / rect.width) * 100).toFixed(1))));
    const yPercent = Math.max(0, Math.min(100, Number(((clickY / rect.height) * 100).toFixed(1))));

    if (selectedHotspotId) {
      // Reposition selected hotspot
      setConfig({
        ...config,
        hotspots: config.hotspots.map((h) =>
          h.id === selectedHotspotId ? { ...h, x: xPercent, y: yPercent } : h
        ),
      });
      setFeedback({
        type: "success",
        text: `Updated position for "${config.hotspots.find((h) => h.id === selectedHotspotId)?.label || "Hotspot"}" to (${xPercent}%, ${yPercent}%)`,
      });
    } else {
      // Create a new hotspot at clicked location
      const fallbackProd = products[0];
      const newHotspot: InteractiveRoomHotspot = {
        id: `hotspot-${Date.now()}`,
        productId: fallbackProd?.id || "",
        productSlug: fallbackProd?.slug || "",
        productName: fallbackProd?.name || "Dr. Scent Scent Instrument",
        productPriceLKR: fallbackProd?.basePriceLKR || 12500,
        productImage: fallbackProd?.image || "/images/categories/aroma-diffusers.jpg",
        categoryName: fallbackProd?.categoryName || "Diffuser",
        x: xPercent,
        y: yPercent,
        placement: "top",
        label: `Spot #${config.hotspots.length + 1}`,
        enabled: true,
      };

      setConfig({
        ...config,
        hotspots: [...config.hotspots, newHotspot],
      });
      setSelectedHotspotId(newHotspot.id);
      setFeedback({ type: "success", text: `Placed new hotspot pin at (${xPercent}%, ${yPercent}%)` });
    }
  };

  // Assign product to a hotspot
  const handleAssignProduct = (hotspotId: string, productId: string) => {
    if (!config) return;
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    setConfig({
      ...config,
      hotspots: config.hotspots.map((h) => {
        if (h.id !== hotspotId) return h;
        return {
          ...h,
          productId: prod.id,
          productSlug: prod.slug,
          productName: prod.name,
          productPriceLKR: prod.basePriceLKR,
          productImage: prod.image,
          categoryName: prod.categoryName,
          label: prod.name.split("–")[0].trim(),
        };
      }),
    });
  };

  // Add new hotspot
  const handleAddNewHotspot = () => {
    if (!config || products.length === 0) return;
    const defaultProduct = products[0];
    const newHotspot: InteractiveRoomHotspot = {
      id: `hotspot-${Date.now()}`,
      productId: defaultProduct.id,
      productSlug: defaultProduct.slug,
      productName: defaultProduct.name,
      productPriceLKR: defaultProduct.basePriceLKR,
      productImage: defaultProduct.image,
      categoryName: defaultProduct.categoryName,
      x: 50,
      y: 50,
      placement: "top",
      label: `Hotspot #${config.hotspots.length + 1}`,
      enabled: true,
    };

    setConfig({
      ...config,
      hotspots: [...config.hotspots, newHotspot],
    });
    setSelectedHotspotId(newHotspot.id);
  };

  // Remove hotspot
  const handleRemoveHotspot = (id: string) => {
    if (!config) return;
    setConfig({
      ...config,
      hotspots: config.hotspots.filter((h) => h.id !== id),
    });
    if (selectedHotspotId === id) {
      setSelectedHotspotId(null);
    }
  };

  // Save changes to backend
  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/admin/interactive-room", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      if (!res.ok) throw new Error("Failed to save changes");
      const data = await res.json();
      setConfig(data.config);
      setFeedback({ type: "success", text: "Interactive Living Room successfully updated and live on storefront!" });
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message || "Failed to save changes" });
    } finally {
      setSaving(false);
    }
  };

  // Gemini AI Recreate
  const handleGeminiRecreate = async () => {
    if (selectedAiProductIds.length === 0) {
      setFeedback({ type: "error", text: "Please select at least 1 product for Gemini AI to integrate into the room." });
      return;
    }

    // Persist API key to localStorage if entered
    if (geminiApiKey) {
      try {
        localStorage.setItem("viascent_gemini_api_key", geminiApiKey);
      } catch {}
    }

    setRecreating(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/admin/interactive-room/regenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productIds: selectedAiProductIds,
          presetThemeId: selectedPresetId,
          customInstructions: customAiPrompt,
          geminiApiKey: geminiApiKey || undefined,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Recreation failed");
      }

      const data = await res.json();
      setConfig(data.config);
      if (data.config.hotspots.length > 0) {
        setSelectedHotspotId(data.config.hotspots[0].id);
      }
      setFeedback({
        type: "success",
        text: "Living room scene successfully regenerated with your selected product photos and published live!",
      });
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message || "Failed to recreate scene with Gemini" });
    } finally {
      setRecreating(false);
    }
  };

  // Switch scene preset image
  const handleSelectPreset = (preset: ScenePreset) => {
    if (!config) return;
    setSelectedPresetId(preset.id);
    setConfig({
      ...config,
      imageUrl: preset.imageUrl,
      sceneTheme: preset.name,
    });
    setFeedback({
      type: "success",
      text: `Switched room scene to "${preset.name}". Adjust hotspots as needed and click Save.`,
    });
  };

  if (loading || !config) {
    return (
      <div className="p-8 max-w-7xl mx-auto flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-amber-700 animate-spin" />
          <p className="text-sm text-stone-600 font-medium">Loading Interactive Room Configuration...</p>
        </div>
      </div>
    );
  }

  const selectedHotspot = config.hotspots.find((h) => h.id === selectedHotspotId);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
              <Sparkles className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-serif font-bold text-stone-900 tracking-tight">
              Interactive Living Room Showcase
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-3xl">
            Manage the interactive &quot;Shop The Look&quot; living room on the homepage. Place hotspots on scent
            diffusers, candles, and sprays, or use Gemini AI to generate a scene integrated with your selected products.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/#shop-the-room"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-stone-300 text-stone-700 bg-white hover:bg-stone-50 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View Live Page</span>
            <ExternalLink className="w-3 h-3 text-stone-400" />
          </Link>

          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-amber-900 hover:bg-amber-800 text-amber-50 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? "Saving Changes..." : "Save & Publish Live"}</span>
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between text-xs sm:text-sm ${
            feedback.type === "success"
              ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
              : "bg-red-50 border border-red-200 text-red-800"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-stone-400 hover:text-stone-700 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* SECTION 1: Interactive Canvas Visual Editor */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-stone-200 bg-stone-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-stone-900 flex items-center gap-2">
              <Move className="w-4 h-4 text-amber-700" />
              <span>Interactive Room Scene &amp; Hotspot Pin Canvas</span>
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Click anywhere on the room image below to place or relocate a product hotspot pin.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-1 rounded-full bg-stone-200 text-stone-700 font-medium">
              Theme: {config.sceneTheme || "Penthouse"}
            </span>
            <button
              onClick={handleAddNewHotspot}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-stone-900 hover:bg-stone-800 text-white transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Hotspot Pin</span>
            </button>
          </div>
        </div>

        {/* Visual Room Preview Canvas */}
        <div className="p-4 sm:p-6 bg-stone-100 flex flex-col items-center">
          <div
            ref={canvasRef}
            onClick={handleCanvasClick}
            className="relative w-full rounded-xl overflow-hidden border-2 border-stone-300 shadow-md bg-stone-900 cursor-crosshair select-none group"
            style={{ aspectRatio: "16 / 9", maxWidth: "1080px" }}
          >
            {/* Background Living Room Image */}
            <Image
              src={config.imageUrl}
              alt="Room Scene"
              fill
              unoptimized
              priority
              className="object-cover object-center pointer-events-none"
            />

            {/* Hotspots Overlay */}
            {config.hotspots.map((hotspot, idx) => {
              const isSelected = selectedHotspotId === hotspot.id;
              return (
                <div
                  key={hotspot.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedHotspotId(hotspot.id);
                  }}
                  className="absolute z-20 transition-transform duration-200"
                  style={{
                    left: `${hotspot.x}%`,
                    top: `${hotspot.y}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <button
                    type="button"
                    className="relative group/pin focus:outline-none cursor-pointer flex items-center justify-center"
                    title={`${hotspot.label || hotspot.productName} (${hotspot.x}%, ${hotspot.y}%)`}
                  >
                    {/* Pulsing beacon */}
                    <span className="absolute w-8 h-8 rounded-full bg-amber-400/50 animate-ping pointer-events-none" />

                    {/* Main Pin Disc */}
                    <span
                      className={`relative w-8 h-8 rounded-full shadow-xl border flex items-center justify-center transition-all ${
                        isSelected
                          ? "bg-amber-500 border-white text-white ring-4 ring-amber-500/40 scale-125"
                          : hotspot.enabled
                          ? "bg-white border-stone-800 text-stone-900 hover:scale-110"
                          : "bg-stone-300 border-stone-400 text-stone-500 opacity-60"
                      }`}
                    >
                      <span className="text-[11px] font-bold font-mono">#{idx + 1}</span>
                    </span>
                  </button>

                  {/* Quick label tag */}
                  <span
                    className={`absolute left-1/2 -translate-x-1/2 mt-1 px-2 py-0.5 rounded text-[10px] font-medium whitespace-nowrap shadow-md pointer-events-none ${
                      isSelected
                        ? "bg-amber-900 text-amber-100"
                        : "bg-black/80 text-white backdrop-blur-xs"
                    }`}
                  >
                    {hotspot.label || hotspot.productName.split("–")[0].trim()}
                  </span>
                </div>
              );
            })}

            {/* Canvas Instructions Hint */}
            <div className="absolute bottom-3 left-3 right-3 bg-black/60 backdrop-blur-sm text-white/90 text-[11px] py-1.5 px-3 rounded-lg flex items-center justify-between pointer-events-none">
              <span>
                💡 Tip: Click anywhere to move selected pin or create new hotspot. Drag or click pins to inspect.
              </span>
              <span className="font-mono text-stone-300">
                {selectedHotspot
                  ? `Selected: #${config.hotspots.findIndex((h) => h.id === selectedHotspot.id) + 1} (${selectedHotspot.x}%, ${selectedHotspot.y}%)`
                  : "No pin selected"}
              </span>
            </div>
          </div>
        </div>

        {/* Selected Hotspot Quick Editor */}
        {selectedHotspot && (
          <div className="p-4 sm:p-6 border-t border-stone-200 bg-amber-50/30">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-lg border border-stone-200 p-1 shrink-0 overflow-hidden relative">
                  <Image
                    src={selectedHotspot.productImage}
                    alt={selectedHotspot.productName}
                    fill
                    className="object-contain p-0.5"
                    unoptimized
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-amber-900 font-mono bg-amber-100 px-2 py-0.5 rounded">
                      Editing Hotspot #{config.hotspots.findIndex((h) => h.id === selectedHotspot.id) + 1}
                    </span>
                    <span className="text-xs text-stone-500">
                      Position: ({selectedHotspot.x}%, {selectedHotspot.y}%)
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-stone-900 mt-0.5">
                    {selectedHotspot.productName}
                  </h3>
                  <p className="text-xs text-stone-600 font-medium mt-0.5">
                    Price: {formatLKR(selectedHotspot.productPriceLKR)} · Category: {selectedHotspot.categoryName}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end md:self-center">
                <button
                  type="button"
                  onClick={() => handleRemoveHotspot(selectedHotspot.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-red-600 hover:bg-red-50 border border-red-200 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove Pin</span>
                </button>
              </div>
            </div>

            {/* Inputs grid for this hotspot */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-4 border-t border-amber-200/50">
              {/* Product selector */}
              <div>
                <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Assign Product
                </label>
                <select
                  value={selectedHotspot.productId}
                  onChange={(e) => handleAssignProduct(selectedHotspot.id, e.target.value)}
                  className="w-full text-xs rounded-lg border-stone-300 bg-white py-1.5 px-2.5 text-stone-800 shadow-xs focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({formatLKR(p.basePriceLKR)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Label */}
              <div>
                <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Spot Label
                </label>
                <input
                  type="text"
                  value={selectedHotspot.label || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    setConfig({
                      ...config,
                      hotspots: config.hotspots.map((h) =>
                        h.id === selectedHotspot.id ? { ...h, label: val } : h
                      ),
                    });
                  }}
                  placeholder="e.g. Standing Diffuser Tower"
                  className="w-full text-xs rounded-lg border-stone-300 bg-white py-1.5 px-2.5 text-stone-800 shadow-xs focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>

              {/* Placement Direction */}
              <div>
                <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Popover Direction
                </label>
                <select
                  value={selectedHotspot.placement}
                  onChange={(e) => {
                    const val = e.target.value as any;
                    setConfig({
                      ...config,
                      hotspots: config.hotspots.map((h) =>
                        h.id === selectedHotspot.id ? { ...h, placement: val } : h
                      ),
                    });
                  }}
                  className="w-full text-xs rounded-lg border-stone-300 bg-white py-1.5 px-2.5 text-stone-800 shadow-xs focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                >
                  <option value="top">Top (Centered)</option>
                  <option value="top-left">Top Left</option>
                  <option value="top-right">Top Right</option>
                  <option value="left">Left</option>
                  <option value="right">Right</option>
                </select>
              </div>

              {/* Active Toggle */}
              <div>
                <label className="block text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Status
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setConfig({
                      ...config,
                      hotspots: config.hotspots.map((h) =>
                        h.id === selectedHotspot.id ? { ...h, enabled: !h.enabled } : h
                      ),
                    });
                  }}
                  className={`w-full py-1.5 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    selectedHotspot.enabled
                      ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                      : "bg-stone-200 text-stone-600 hover:bg-stone-300"
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{selectedHotspot.enabled ? "Active on Room" : "Hidden"}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: Recreate Scene with Gemini AI */}
      <div className="bg-gradient-to-br from-stone-900 via-stone-850 to-amber-950 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-amber-900/40">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-stone-800">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-medium border border-amber-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Gemini AI Scene Recreator</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-white mt-2">
              Recreate Living Room with Selected Products
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 mt-1 max-w-2xl leading-relaxed">
              Select products from your catalog. Gemini AI and our architectural scene engine take the exact product photos,
              render them naturally into the living room interior with realistic scale and ambient lighting, and update the live page.
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <button
              onClick={handleGeminiRecreate}
              disabled={recreating || selectedAiProductIds.length === 0}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-900/30 transition-all disabled:opacity-50 cursor-pointer shrink-0"
            >
              {recreating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-stone-950" />
                  <span>Recreating Image with Product Photos...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-stone-950" />
                  <span>Regenerate Image with Product Photos</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setShowApiKeyInput(!showApiKeyInput)}
              className="text-[11px] text-amber-400 hover:text-amber-300 underline"
            >
              {showApiKeyInput ? "Hide API Key Settings" : "Configure Google Gemini API Key"}
            </button>
          </div>
        </div>

        {/* Optional Gemini API Key Drawer */}
        {showApiKeyInput && (
          <div className="mt-4 p-4 rounded-xl bg-stone-950/80 border border-amber-500/30 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-amber-200">Google Gemini / Imagen 3 API Key</span>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-amber-400 hover:underline flex items-center gap-1 text-[11px]"
              >
                <span>Get Free Key from Google AI Studio</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="flex gap-2">
              <input
                type="password"
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
                placeholder="AIzaSy... (leave blank to use built-in high-precision visual compositor)"
                className="flex-1 bg-stone-900 border border-stone-700 rounded-lg px-3 py-1.5 text-stone-200 text-xs focus:ring-1 focus:ring-amber-500"
              />
              <button
                type="button"
                onClick={() => {
                  try {
                    localStorage.setItem("viascent_gemini_api_key", geminiApiKey);
                    setFeedback({ type: "success", text: "Gemini API key saved to browser storage." });
                  } catch {}
                }}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded-lg text-xs"
              >
                Save Key
              </button>
            </div>
            <p className="text-[10px] text-stone-400">
              When an API key is provided, the request calls Google Imagen 3 directly. Without a key, the system uses the Sharp architectural compositor to integrate the product photos directly into the 8K room scene.
            </p>
          </div>
        )}

        {/* Step A: Select Products for the scene */}
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-200">
              Step 1: Select Products to Integrate into the Room ({selectedAiProductIds.length} selected)
            </h3>
            <span className="text-[11px] text-stone-400">
              Choose 2 to 5 products from your store catalog
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-72 overflow-y-auto p-1 pr-2">
            {products.map((prod) => {
              const isSelected = selectedAiProductIds.includes(prod.id);
              return (
                <div
                  key={prod.id}
                  onClick={() => {
                    if (isSelected) {
                      setSelectedAiProductIds(selectedAiProductIds.filter((id) => id !== prod.id));
                    } else {
                      if (selectedAiProductIds.length >= 5) {
                        setFeedback({ type: "error", text: "Maximum 5 products can be integrated into one room scene." });
                        return;
                      }
                      setSelectedAiProductIds([...selectedAiProductIds, prod.id]);
                    }
                  }}
                  className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                    isSelected
                      ? "bg-amber-500/20 border-amber-400 text-white ring-1 ring-amber-400"
                      : "bg-stone-800/60 border-stone-700/80 text-stone-300 hover:bg-stone-800 hover:border-stone-600"
                  }`}
                >
                  <div className="w-10 h-10 rounded-lg bg-stone-900 border border-stone-700 p-0.5 shrink-0 overflow-hidden relative">
                    <Image
                      src={prod.image}
                      alt={prod.name}
                      fill
                      className="object-contain p-0.5"
                      unoptimized
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-semibold truncate leading-tight">{prod.name}</h4>
                    <p className="text-[10px] text-stone-400 mt-0.5">{formatLKR(prod.basePriceLKR)}</p>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${
                      isSelected ? "bg-amber-500 text-stone-950 font-bold" : "border border-stone-600"
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Product Photos for Scene Placement */}
          {selectedAiProductIds.length > 0 && (
            <div className="p-3.5 rounded-xl bg-stone-950/70 border border-amber-500/20">
              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-amber-300 mb-2.5 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                <span>Product Photos Queued for Room Integration ({selectedAiProductIds.length})</span>
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {products
                  .filter((p) => selectedAiProductIds.includes(p.id))
                  .map((p, idx) => (
                    <div key={p.id} className="p-2 rounded-lg bg-stone-900 border border-stone-800 flex items-center gap-2.5">
                      <div className="w-12 h-12 bg-stone-950 rounded border border-stone-700 relative overflow-hidden shrink-0">
                        <Image src={p.image} alt={p.name} fill className="object-contain p-1" unoptimized />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-mono font-bold text-amber-400 block">Spot #{idx + 1}</span>
                        <p className="text-[11px] text-stone-200 truncate font-medium">{p.name}</p>
                        <p className="text-[10px] text-stone-400">{formatLKR(p.basePriceLKR)}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Step B: Choose Room Style Preset */}
        <div className="mt-6 pt-6 border-t border-stone-800">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-200 mb-3">
            Step 2: Choose Architectural Room Atmosphere
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {presets.map((preset) => {
              const isSelected = selectedPresetId === preset.id || config.imageUrl === preset.imageUrl;
              return (
                <div
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset)}
                  className={`rounded-xl border p-3 cursor-pointer transition-all ${
                    isSelected
                      ? "bg-amber-950/40 border-amber-400 ring-2 ring-amber-400/50"
                      : "bg-stone-800/40 border-stone-700 hover:bg-stone-800/80"
                  }`}
                >
                  <div className="relative w-full h-28 rounded-lg overflow-hidden border border-stone-700">
                    <Image
                      src={preset.imageUrl}
                      alt={preset.name}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                  <h4 className="text-xs font-bold text-white mt-2.5">{preset.name}</h4>
                  <p className="text-[11px] text-stone-400 mt-1 line-clamp-2 leading-relaxed">
                    {preset.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* SECTION 3: Section Text & Homepage Titles */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs">
        <h2 className="text-sm font-semibold text-stone-900 flex items-center gap-2 mb-4">
          <Sliders className="w-4 h-4 text-amber-700" />
          <span>Showcase Texts &amp; Homepage Section Content</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">
              Section Title (e.g. NEW COLLECTION)
            </label>
            <input
              type="text"
              value={config.title}
              onChange={(e) => setConfig({ ...config, title: e.target.value })}
              className="w-full text-xs rounded-lg border-stone-300 py-2 px-3 text-stone-900 shadow-xs focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">
              Badge Text
            </label>
            <input
              type="text"
              value={config.badgeText || "INTERACTIVE SHOWCASE"}
              onChange={(e) => setConfig({ ...config, badgeText: e.target.value })}
              className="w-full text-xs rounded-lg border-stone-300 py-2 px-3 text-stone-900 shadow-xs focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-stone-700 mb-1">
              Description Subtitle
            </label>
            <textarea
              rows={2}
              value={config.subtitle}
              onChange={(e) => setConfig({ ...config, subtitle: e.target.value })}
              className="w-full text-xs rounded-lg border-stone-300 py-2 px-3 text-stone-900 shadow-xs focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-stone-700 mb-1">
              Helper Note (Under Room Image)
            </label>
            <input
              type="text"
              value={config.helperText}
              onChange={(e) => setConfig({ ...config, helperText: e.target.value })}
              className="w-full text-xs rounded-lg border-stone-300 py-2 px-3 text-stone-900 shadow-xs focus:ring-1 focus:ring-amber-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
