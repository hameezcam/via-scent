"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Store,
  Plus,
  Search,
  Archive,
  Edit,
  X,
  ExternalLink,
  Trash2,
  ImageIcon,
  Sparkles,
  Layers,
  FileText,
  Sliders,
  ShieldCheck,
  Check,
  ArrowUpRight,
  UploadCloud,
  Upload,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Link2,
  AlertCircle,
} from "lucide-react";
import {
  Product,
  ProductCategory,
  ScentFamily,
  Specification,
  ProductVariant,
} from "@/types/product";
import { Category } from "@/types/category";
import { formatLKR } from "@/config/brand.config";

type ModalTab = "basic" | "images" | "specs" | "content" | "variants";

/**
 * Safely parse API responses preventing SyntaxError on HTML / plain text error pages (e.g. 413, 502).
 */
async function parseApiResponse<T = any>(
  res: Response
): Promise<{ ok: boolean; data: T | null; error: string | null }> {
  let text = "";
  try {
    text = await res.text();
  } catch {
    return { ok: false, data: null, error: "Unable to read server response." };
  }

  let parsed: any = null;
  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch {
      // Body is not JSON (e.g. "Request Entity Too Large", HTML error, etc.)
    }
  }

  if (res.ok) {
    return { ok: true, data: parsed, error: null };
  }

  // Handle payload too large / 413 specifically
  if (
    res.status === 413 ||
    text.toLowerCase().includes("request entity too large") ||
    text.toLowerCase().includes("payload too large")
  ) {
    return {
      ok: false,
      data: parsed,
      error:
        "The uploaded images or product payload exceed the server payload limit. High-resolution images are automatically compressed, but please try uploading fewer images at once.",
    };
  }

  const errorMsg =
    parsed?.error ||
    parsed?.message ||
    (text.length < 150 && text.trim()
      ? text.trim()
      : `Server request failed with status ${res.status} (${res.statusText || "Error"})`);

  return { ok: false, data: parsed, error: errorMsg };
}

/**
 * Compress and downscale an image file client-side before uploading.
 * Reduces 5MB-12MB camera/phone photos to ~150KB-250KB WebP/JPEG,
 * preventing HTTP 413 errors and dramatically accelerating uploads.
 */
/** Photo strip for one variant: shows its photos and lets the admin add or remove them. */
function VariantPhotos({
  photos,
  busy,
  onAdd,
  onRemove,
}: {
  photos: string[];
  busy: boolean;
  onAdd: (files: FileList | null) => void;
  onRemove: (index: number) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {photos.map((src, index) => (
        <div key={`${index}-${src.slice(-24)}`} className="relative w-14 h-14 rounded overflow-hidden border border-stone-200 bg-stone-100">
          <Image
            src={src}
            alt={`Variant photo ${index + 1}`}
            fill
            unoptimized={src.startsWith("data:")}
            className="object-cover"
            sizes="56px"
          />
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="absolute top-0.5 right-0.5 bg-white/90 rounded p-0.5 text-stone-600 hover:text-red-700"
            title="Remove photo"
            aria-label={`Remove photo ${index + 1}`}
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      ))}
      <label
        className={`inline-flex items-center gap-1.5 px-3 py-2 border border-dashed border-stone-300 rounded text-[11px] font-semibold uppercase tracking-wider text-stone-700 cursor-pointer hover:bg-white ${
          busy ? "opacity-60 pointer-events-none" : ""
        }`}
      >
        {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ImageIcon className="w-3.5 h-3.5" />}
        <span>{busy ? "Uploading..." : photos.length === 0 ? "Add photos" : "Add more"}</span>
        <input
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={(e) => {
            onAdd(e.target.files);
            e.target.value = "";
          }}
        />
      </label>
    </div>
  );
}

/** Compresses and uploads photos, returning the stored URL for each one. */
async function uploadPhotos(files: File[]): Promise<string[]> {
  const compressed = await Promise.all(files.map((f) => compressImageFile(f)));
  const urls: string[] = [];
  for (const file of compressed) {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
    const parsed = await parseApiResponse<{ url?: string; urls?: string[]; error?: string }>(res);
    if (!parsed.ok || !parsed.data) {
      throw new Error(parsed.error || `Failed to upload "${file.name}".`);
    }
    if (parsed.data.url) {
      urls.push(parsed.data.url);
    } else if (parsed.data.urls && parsed.data.urls.length > 0) {
      urls.push(...parsed.data.urls);
    }
  }
  return urls;
}

async function compressImageFile(file: File, maxDimension = 1600, quality = 0.85): Promise<File> {
  if (typeof window === "undefined") return file;
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml" || file.type === "image/gif") {
    return file;
  }

  // If already under 250KB, keep as is
  if (file.size < 250 * 1024) {
    return file;
  }

  return new Promise((resolve) => {
    try {
      const img = new window.Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        let { width, height } = img;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);

        const outputMime = file.type === "image/png" ? "image/webp" : file.type;
        canvas.toBlob(
          (blob) => {
            if (!blob || blob.size >= file.size) {
              resolve(file);
            } else {
              const ext = outputMime === "image/webp" ? ".webp" : ".jpg";
              const newName = file.name.replace(/\.[^/.]+$/, "") + ext;
              const compressedFile = new File([blob], newName, {
                type: blob.type || outputMime,
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            }
          },
          outputMime,
          quality
        );
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(file);
      };

      img.src = objectUrl;
    } catch {
      resolve(file);
    }
  });
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [availableCategories, setAvailableCategories] = useState<Category[]>([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ModalTab>("basic");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [productToDelete, setProductToDelete] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Tab 1: Basic & Pricing
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [slug, setSlug] = useState("");
  const [sku, setSku] = useState("");
  const [category, setCategory] = useState<ProductCategory>("aroma-diffusers");
  const [subCategory, setSubCategory] = useState<string>("");
  const [basePriceLKR, setBasePriceLKR] = useState<number>(30000);
  const [originalPriceLKR, setOriginalPriceLKR] = useState<number | undefined>(undefined);
  const [inventoryCount, setInventoryCount] = useState<number>(15);
  const [stockStatus, setStockStatus] = useState<"In Stock" | "Low Stock" | "Made to Order" | "Backorder">("In Stock");
  const [isPublished, setIsPublished] = useState(true);
  const [featured, setFeatured] = useState(false);
  const [isBestseller, setIsBestseller] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [drScentAuthorized, setDrScentAuthorized] = useState(true);

  // Tab 2: Images Gallery
  const [images, setImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  // Tab 3: Olfactory & Specs
  const [scentFamily, setScentFamily] = useState<ScentFamily | "">("");
  const [scentIntensity, setScentIntensity] = useState<"Delicate" | "Moderate" | "Opulent" | "Intense">("Moderate");
  const [topNotes, setTopNotes] = useState("");
  const [heartNotes, setHeartNotes] = useState("");
  const [baseNotes, setBaseNotes] = useState("");
  const [coverageArea, setCoverageArea] = useState("");
  const [bottleVolume, setBottleVolume] = useState("");
  const [specifications, setSpecifications] = useState<Specification[]>([]);
  const [newSpecLabel, setNewSpecLabel] = useState("");
  const [newSpecValue, setNewSpecValue] = useState("");

  // Tab 4: Content & Protocol
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [features, setFeatures] = useState<string[]>([]);
  const [newFeature, setNewFeature] = useState("");
  const [usageInstructions, setUsageInstructions] = useState<string[]>([]);
  const [newInstruction, setNewInstruction] = useState("");
  const [warrantyPeriod, setWarrantyPeriod] = useState("6 Month Official Franchisee Warranty");
  const [warrantyMonths, setWarrantyMonths] = useState<number>(6);

  // Tab 5: Variants
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [newVarName, setNewVarName] = useState("");
  const [newVarSku, setNewVarSku] = useState("");
  const [newVarPrice, setNewVarPrice] = useState<number>(0);
  const [newVarSize, setNewVarSize] = useState("");
  const [newVarColor, setNewVarColor] = useState("");
  const [newVarImages, setNewVarImages] = useState<string[]>([]);
  const [variantPhotoBusy, setVariantPhotoBusy] = useState<string | null>(null);
  const [variantPhotoError, setVariantPhotoError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    async function fetchProducts() {
      try {
        const [prodRes, catRes] = await Promise.all([
          fetch("/api/admin/products"),
          fetch("/api/categories"),
        ]);
        const parsed = await parseApiResponse<Product[]>(prodRes);
        if (parsed.ok && parsed.data && !ignore) {
          setProducts(parsed.data);
        }
        if (catRes.ok) {
          const catJson = await catRes.json();
          if (catJson.success && Array.isArray(catJson.data) && !ignore) {
            setAvailableCategories(catJson.data);
          }
        }
      } catch (e) {
        console.error("Failed to load products or categories", e);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    fetchProducts();
    return () => {
      ignore = true;
    };
  }, []);

  const openCreateModal = () => {
    setEditingProduct(null);
    setActiveTab("basic");
    setFeedback(null);

    const randomNum = Math.floor(100 + Math.random() * 900);
    setName("");
    setTagline("");
    setSlug(`dr-scent-new-${randomNum}`);
    setSku(`DSC-NEW-${randomNum}`);
    setCategory("aroma-diffusers");
    setSubCategory("");
    setBasePriceLKR(28500);
    setOriginalPriceLKR(undefined);
    setInventoryCount(20);
    setStockStatus("In Stock");
    setIsPublished(true);
    setFeatured(false);
    setIsBestseller(false);
    setIsNew(true);
    setDrScentAuthorized(true);

    setImages([
      "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=1000&q=85",
    ]);
    setNewImageUrl("");
    setUploadError(null);
    setIsUploading(false);
    setIsDragActive(false);

    setScentFamily("");
    setScentIntensity("Moderate");
    setTopNotes("");
    setHeartNotes("");
    setBaseNotes("");
    setCoverageArea("Up to 300 sq.ft (30 m²)");
    setBottleVolume("10ml - 15ml");
    setSpecifications([
      { label: "Coverage", value: "Up to 300 sq.ft" },
      { label: "Origin", value: "Authorized Dr. Scent Franchise Supply" },
    ]);
    setNewSpecLabel("");
    setNewSpecValue("");

    setShortDescription("Crafted with precision cold-air nebulization technology.");
    setDescription("Engineered to atomize 100% pure fragrance oil into an invisible, residue-free micro-mist without heat or dilution.");
    setFeatures([
      "Patented cold-air micro-droplet nebulization",
      "No water or heat required — 100% oil integrity",
    ]);
    setNewFeature("");
    setUsageInstructions([
      "Insert fragrance oil bottle directly into the quick-lock nozzle.",
      "Power on using touch sensor and select desired interval intensity.",
    ]);
    setNewInstruction("");
    setWarrantyPeriod("6 Month Official Franchisee Warranty");
    setWarrantyMonths(6);

    setVariants([
      {
        id: `var-${Date.now()}-1`,
        sku: `DSC-NEW-${randomNum}-STD`,
        name: "Standard Edition",
        priceLKR: 28500,
        inStock: true,
        attributes: { finish: "Matte Anodized" },
      },
    ]);

    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setActiveTab("basic");
    setFeedback(null);

    setName(p.name);
    setTagline(p.tagline || "");
    setSlug(p.slug);
    setSku(p.sku);
    setCategory(p.category);
    setSubCategory(p.subCategory || (p.category === "fragrance-oils" ? p.scentFamily || "" : ""));
    setBasePriceLKR(p.basePriceLKR);
    setOriginalPriceLKR(p.originalPriceLKR);
    setInventoryCount(p.inventoryCount ?? 15);
    setStockStatus(p.stockStatus || (p.inStock ? "In Stock" : "Backorder"));
    setIsPublished(p.isPublished !== false);
    setFeatured(Boolean(p.featured));
    setIsBestseller(Boolean(p.isBestseller));
    setIsNew(Boolean(p.isNew));
    setDrScentAuthorized(p.drScentAuthorized !== false);

    setImages(p.images ? [...p.images] : []);
    setNewImageUrl("");
    setUploadError(null);
    setIsUploading(false);
    setIsDragActive(false);

    setScentFamily(p.scentFamily || "");
    setScentIntensity(p.scentNotes?.intensity || "Moderate");
    setTopNotes(p.scentNotes?.top?.join(", ") || "");
    setHeartNotes(p.scentNotes?.heart?.join(", ") || "");
    setBaseNotes(p.scentNotes?.base?.join(", ") || "");
    setCoverageArea(p.coverageArea || "");
    setBottleVolume(p.bottleVolume || "");
    setSpecifications(p.specifications ? [...p.specifications] : []);
    setNewSpecLabel("");
    setNewSpecValue("");

    setShortDescription(p.shortDescription || "");
    setDescription(p.description || "");
    setFeatures(p.features ? [...p.features] : []);
    setNewFeature("");
    setUsageInstructions(p.usageInstructions ? [...p.usageInstructions] : []);
    setNewInstruction("");
    setWarrantyPeriod(p.warrantyPeriod || "6 Month Official Franchisee Warranty");
    setWarrantyMonths(p.warrantyDurationMonths ?? 6);

    setVariants(p.variants ? [...p.variants] : []);
    setVariantPhotoError(null);
    setNewVarImages([]);
    setNewVarName("");
    setNewVarSku("");
    setNewVarPrice(p.basePriceLKR);
    setNewVarSize("");
    setNewVarColor("");

    setIsModalOpen(true);
  };

  // Image helpers
  const handleAddImage = () => {
    if (!newImageUrl.trim()) return;
    setImages((prev) => [...prev, newImageUrl.trim()]);
    setNewImageUrl("");
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleMakeImagePrimary = (indexToPrimary: number) => {
    setImages((prev) => {
      const selected = prev[indexToPrimary];
      const remainder = prev.filter((_, idx) => idx !== indexToPrimary);
      return [selected, ...remainder];
    });
  };

  const handleMoveImage = (index: number, direction: "left" | "right") => {
    setImages((prev) => {
      const targetIndex = direction === "left" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
  };

  const handleFileUpload = async (files: FileList | File[] | null) => {
    if (!files || files.length === 0) return;
    setUploadError(null);
    setIsUploading(true);

    try {
      const uploadedUrls = await uploadPhotos(Array.from(files));
      if (uploadedUrls.length > 0) {
        setImages((prev) => [...prev, ...uploadedUrls]);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error uploading image from computer.";
      setUploadError(message);
    } finally {
      setIsUploading(false);
    }
  };

  // Specs helpers
  const handleAddSpec = () => {
    if (!newSpecLabel.trim() || !newSpecValue.trim()) return;
    setSpecifications((prev) => [
      ...prev,
      { label: newSpecLabel.trim(), value: newSpecValue.trim() },
    ]);
    setNewSpecLabel("");
    setNewSpecValue("");
  };

  const handleRemoveSpec = (index: number) => {
    setSpecifications((prev) => prev.filter((_, i) => i !== index));
  };

  // Feature helpers
  const handleAddFeature = () => {
    if (!newFeature.trim()) return;
    setFeatures((prev) => [...prev, newFeature.trim()]);
    setNewFeature("");
  };

  const handleRemoveFeature = (index: number) => {
    setFeatures((prev) => prev.filter((_, i) => i !== index));
  };

  // Instruction helpers
  const handleAddInstruction = () => {
    if (!newInstruction.trim()) return;
    setUsageInstructions((prev) => [...prev, newInstruction.trim()]);
    setNewInstruction("");
  };

  const handleRemoveInstruction = (index: number) => {
    setUsageInstructions((prev) => prev.filter((_, i) => i !== index));
  };

  // Variant helpers
  const handleAddVariant = () => {
    const size = newVarSize.trim();
    const color = newVarColor.trim();
    const name = newVarName.trim() || [size, color].filter(Boolean).join(" / ");
    if (!name) return;
    const variantId = `var-${Date.now()}-${variants.length + 1}`;
    const newVariant: ProductVariant = {
      id: variantId,
      sku: newVarSku.trim() || `${sku}-VAR${variants.length + 1}`,
      name,
      priceLKR: Number(newVarPrice) || basePriceLKR,
      inStock: true,
      images: newVarImages.length > 0 ? newVarImages : undefined,
      attributes: {
        ...(size ? { size } : {}),
        ...(color ? { color } : {}),
      },
    };
    setVariants((prev) => [...prev, newVariant]);
    setNewVarName("");
    setNewVarSku("");
    setNewVarSize("");
    setNewVarColor("");
    setNewVarImages([]);
  };

  const handleRemoveVariant = (id: string) => {
    setVariants((prev) => prev.filter((v) => v.id !== id));
  };

  /** Uploads photos for a variant that is still being added. */
  const handleNewVariantPhotos = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setVariantPhotoError(null);
    setVariantPhotoBusy("new");
    try {
      const urls = await uploadPhotos(Array.from(files));
      setNewVarImages((prev) => [...prev, ...urls]);
    } catch (err: unknown) {
      setVariantPhotoError(err instanceof Error ? err.message : "Could not upload the photo.");
    } finally {
      setVariantPhotoBusy(null);
    }
  };

  /** Uploads photos for a variant already in the list. */
  const handleVariantPhotos = async (variantId: string, files: FileList | null) => {
    if (!files || files.length === 0) return;
    setVariantPhotoError(null);
    setVariantPhotoBusy(variantId);
    try {
      const urls = await uploadPhotos(Array.from(files));
      setVariants((prev) =>
        prev.map((v) => (v.id === variantId ? { ...v, images: [...(v.images ?? []), ...urls] } : v))
      );
    } catch (err: unknown) {
      setVariantPhotoError(err instanceof Error ? err.message : "Could not upload the photo.");
    } finally {
      setVariantPhotoBusy(null);
    }
  };

  const handleRemoveVariantPhoto = (variantId: string, photoIndex: number) => {
    setVariants((prev) =>
      prev.map((v) =>
        v.id === variantId ? { ...v, images: (v.images ?? []).filter((_, i) => i !== photoIndex) } : v
      )
    );
  };

  const handleRemoveNewVariantPhoto = (photoIndex: number) => {
    setNewVarImages((prev) => prev.filter((_, i) => i !== photoIndex));
  };

  const handleTogglePublish = async (id: string) => {
    try {
      const res = await fetch("/api/admin/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "toggle_publish" }),
      });
      const parsed = await parseApiResponse<{ product: Product }>(res);
      if (parsed.ok && parsed.data?.product) {
        setProducts((prev) => prev.map((p) => (p.id === id ? parsed.data!.product : p)));
      }
    } catch (e) {
      console.error("Failed to toggle publish", e);
    }
  };

  const handleArchive = async (id: string) => {
    if (!confirm("Are you sure you want to archive this product?")) return;
    try {
      const res = await fetch("/api/admin/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "archive" }),
      });
      const parsed = await parseApiResponse<{ product: Product }>(res);
      if (parsed.ok && parsed.data?.product) {
        setProducts((prev) => prev.map((p) => (p.id === id ? parsed.data!.product : p)));
      }
    } catch (e) {
      console.error("Failed to archive product", e);
    }
  };

  const confirmDeleteProduct = (id: string, name: string) => {
    setProductToDelete({ id, name });
  };

  const executeDelete = async () => {
    if (!productToDelete) return;
    setDeleting(true);
    const { id, name } = productToDelete;
    try {
      const res = await fetch(`/api/admin/products?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });

      const parsed = await parseApiResponse<{ message?: string }>(res);
      if (parsed.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        if (editingProduct?.id === id) {
          setIsModalOpen(false);
        }
        setProductToDelete(null);
        setFeedback({ type: "success", text: `Product "${name}" was permanently deleted.` });
      } else {
        setFeedback({ type: "error", text: parsed.error || "Failed to delete product." });
        setProductToDelete(null);
      }
    } catch (e) {
      console.error("Failed to delete product", e);
      setFeedback({ type: "error", text: "Network error while deleting product." });
      setProductToDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  const handleAutoSlug = () => {
    if (!name) return;
    const generated = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    setSlug(generated);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    const categoryNamesMap: Record<ProductCategory, string> = {
      "aroma-diffusers": "Diffusers",
      "fragrance-oils": "Aroma Oils",
      "sprays": "Sprays",
      "reed-diffusers": "Reed Diffusers",
      "candles": "Candles",
      "best-sellers": "Best Sellers",
      "commercial-scenting": "Commercial Scenting",
      "home-fragrance": "Home Fragrance",
      "gift-collections": "Gift Collections",
    };

    const isBestsellerValue = category === "best-sellers" ? true : isBestseller;

    const hasScentNotes = topNotes || heartNotes || baseNotes;
    const scentNotesPayload = hasScentNotes
      ? {
          intensity: scentIntensity,
          top: topNotes
            ? topNotes.split(",").map((s) => s.trim()).filter(Boolean)
            : [],
          heart: heartNotes
            ? heartNotes.split(",").map((s) => s.trim()).filter(Boolean)
            : [],
          base: baseNotes
            ? baseNotes.split(",").map((s) => s.trim()).filter(Boolean)
            : [],
        }
      : undefined;

    const payload: Partial<Product> = {
      name,
      tagline,
      slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      sku,
      category,
      categoryName: categoryNamesMap[category] || "Fragrance Creations",
      subCategory: subCategory.trim() || undefined,
      basePriceLKR: Number(basePriceLKR),
      originalPriceLKR: originalPriceLKR ? Number(originalPriceLKR) : undefined,
      images: images.length > 0 ? images : [
        "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=1000&q=85",
      ],
      featured,
      isBestseller: isBestsellerValue,
      isNew,
      inStock: stockStatus === "In Stock" || stockStatus === "Low Stock",
      stockStatus,
      inventoryCount: Number(inventoryCount),
      drScentAuthorized,
      scentFamily: scentFamily ? (scentFamily as ScentFamily) : undefined,
      scentNotes: scentNotesPayload,
      coverageArea: coverageArea || undefined,
      bottleVolume: bottleVolume || undefined,
      shortDescription,
      description,
      features,
      usageInstructions,
      specifications,
      variants: variants.length > 0 ? variants : [
        {
          id: `var-${Date.now()}-std`,
          sku,
          name: "Standard Edition",
          priceLKR: Number(basePriceLKR),
          inStock: true,
          attributes: {},
        },
      ],
      warrantyPeriod,
      warrantyDurationMonths: Number(warrantyMonths),
      isPublished,
    };

    try {
      if (editingProduct) {
        // Update
        const res = await fetch("/api/admin/products", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingProduct.id,
            updates: payload,
          }),
        });

        const parsed = await parseApiResponse<{ product: Product }>(res);

        if (parsed.ok && parsed.data?.product) {
          setProducts((prev) => prev.map((p) => (p.id === editingProduct.id ? parsed.data!.product : p)));
          setFeedback({ type: "success", text: "Product updated successfully and synced to storefront." });
          setTimeout(() => setIsModalOpen(false), 900);
        } else {
          setFeedback({ type: "error", text: parsed.error || "Failed to update product." });
        }
      } else {
        // Create
        const res = await fetch("/api/admin/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const parsed = await parseApiResponse<{ product: Product }>(res);

        if (parsed.ok && parsed.data?.product) {
          setProducts((prev) => [parsed.data!.product, ...prev]);
          setFeedback({ type: "success", text: "New product created and published to catalogue." });
          setTimeout(() => setIsModalOpen(false), 900);
        } else {
          setFeedback({ type: "error", text: parsed.error || "Failed to create product." });
        }
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Network error";
      setFeedback({ type: "error", text: msg });
    } finally {
      setSaving(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat =
      categoryFilter === "ALL" ||
      p.category === categoryFilter ||
      (categoryFilter === "best-sellers" && (p.isBestseller || p.category === "best-sellers")) ||
      (categoryFilter === "candles" && (p.category === "candles" || p.name.toLowerCase().includes("candle"))) ||
      (categoryFilter === "reed-diffusers" && (p.category === "reed-diffusers" || p.name.toLowerCase().includes("reed")));
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
        <div>
          <h1 className="font-serif text-3xl font-medium text-stone-900">
            Dr. Scent Catalogue Management
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Manage product images, pricing in LKR, specifications, olfactory notes, and storefront publication states.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-amber-100 text-xs font-semibold uppercase tracking-wider rounded transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center text-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search catalogue by name or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-300 rounded text-stone-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-800"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-stone-500">Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 bg-stone-50 border border-stone-300 rounded text-stone-800 text-xs focus:outline-none focus:ring-1 focus:ring-amber-800"
          >
            <option value="ALL">All Categories</option>
            {availableCategories.length > 0 ? (
              availableCategories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))
            ) : (
              <>
                <option value="aroma-diffusers">Diffusers</option>
                <option value="fragrance-oils">Aroma Oils</option>
                <option value="sprays">Sprays</option>
                <option value="reed-diffusers">Reed Diffusers</option>
                <option value="candles">Candles</option>
                <optgroup label="Other Categories">
                  <option value="best-sellers">Best Sellers</option>
                  <option value="commercial-scenting">Commercial Scent Systems</option>
                  <option value="home-fragrance">Home Fragrance</option>
                  <option value="gift-collections">Gift Collections</option>
                </optgroup>
              </>
            )}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs text-stone-500">
            <div className="w-8 h-8 border-2 border-stone-300 border-t-amber-800 rounded-full animate-spin mx-auto mb-2" />
            <span>Loading product catalogue...</span>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-20 text-center text-xs text-stone-500">
            <Store className="w-10 h-10 text-stone-300 mx-auto mb-2" />
            <p>No products found matching your search.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-700">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 font-medium">Product & Images</th>
                  <th className="py-3 px-4 font-medium">SKU</th>
                  <th className="py-3 px-4 font-medium">Category</th>
                  <th className="py-3 px-4 font-medium">Base Price (LKR)</th>
                  <th className="py-3 px-4 font-medium">Stock</th>
                  <th className="py-3 px-4 font-medium">Warranty</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded bg-stone-100 overflow-hidden shrink-0 border border-stone-200">
                          {p.images && p.images[0] ? (
                            <Image
                              src={p.images[0]}
                              alt={p.name}
                              fill
                              unoptimized={p.images[0]?.startsWith("data:")}
                              className="object-cover"
                              sizes="48px"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-stone-400">
                              <Store className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="font-semibold text-stone-900">{p.name}</p>
                            {p.drScentAuthorized && (
                              <span title="Authorized Franchise Supply">
                                <ShieldCheck className="w-3.5 h-3.5 text-amber-800" />
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-stone-500 line-clamp-1">{p.tagline}</p>
                          <div className="flex items-center gap-2 mt-0.5 text-[10px] text-stone-400 font-mono">
                            <span>{p.images?.length || 0} photos</span>
                            <span>•</span>
                            <span>{p.variants?.length || 1} variants</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-stone-800">{p.sku}</td>
                    <td className="py-3 px-4 capitalize">
                      <div>{p.categoryName || p.category}</div>
                      {p.subCategory && (
                        <span className="inline-block px-1.5 py-0.5 text-[9px] font-medium bg-amber-50 text-amber-900 border border-amber-200/60 rounded mt-0.5">
                          {p.subCategory}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-bold text-stone-900">
                      <div>{formatLKR(p.basePriceLKR)}</div>
                      {p.originalPriceLKR && p.originalPriceLKR > p.basePriceLKR && (
                        <div className="text-[10px] text-stone-400 line-through">
                          {formatLKR(p.originalPriceLKR)}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`font-semibold ${
                          (p.inventoryCount ?? 10) > 5 ? "text-emerald-700" : "text-amber-800"
                        }`}
                      >
                        {p.inventoryCount ?? 15} units
                      </span>
                      <div className="text-[10px] text-stone-400">{p.stockStatus || "In Stock"}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-stone-600">
                        {p.warrantyDurationMonths === 0 ? "None" : `${p.warrantyDurationMonths ?? 6} Mos`}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {p.isArchived ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-stone-200 text-stone-700">
                          ARCHIVED
                        </span>
                      ) : p.isPublished !== false ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                          PUBLISHED
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-900">
                          DRAFT
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <Link
                          href={`/products/${p.slug}`}
                          target="_blank"
                          title="View on Storefront"
                          className="p-1.5 text-stone-500 hover:text-amber-800 rounded hover:bg-stone-100 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handleTogglePublish(p.id)}
                          title={p.isPublished !== false ? "Unpublish" : "Publish"}
                          className="px-2 py-1 text-[11px] rounded bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium transition-colors"
                        >
                          {p.isPublished !== false ? "Unpublish" : "Publish"}
                        </button>
                        <button
                          onClick={() => openEditModal(p)}
                          title="Edit Full Product Details"
                          className="p-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded transition-colors shadow-2xs"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        {!p.isArchived && (
                          <button
                            onClick={() => handleArchive(p.id)}
                            title="Archive"
                            className="p-1.5 text-stone-400 hover:text-amber-700 rounded hover:bg-amber-50 transition-colors"
                          >
                            <Archive className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => confirmDeleteProduct(p.id, p.name)}
                          title="Permanently Delete Product"
                          className="p-1.5 text-stone-400 hover:text-red-700 rounded hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Comprehensive Product Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-6 max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-stone-100 pb-3 shrink-0">
              <div>
                <h2 className="font-serif text-xl sm:text-2xl font-medium text-stone-900">
                  {editingProduct ? `Edit "${editingProduct.name}"` : "Add New Franchise Product"}
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Full control over gallery images, pricing, specifications, and presentation fields.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 p-1.5 rounded-full hover:bg-stone-100 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {feedback && (
              <div
                className={`p-3 rounded-lg text-xs font-medium shrink-0 ${
                  feedback.type === "success"
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}
              >
                {feedback.text}
              </div>
            )}

            {/* Modal Tabs Navigation */}
            <div className="flex border-b border-stone-200 gap-2 sm:gap-4 overflow-x-auto shrink-0 pb-1 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab("basic")}
                className={`flex items-center gap-1.5 pb-2.5 px-2 font-semibold uppercase tracking-wider transition-colors border-b-2 whitespace-nowrap ${
                  activeTab === "basic"
                    ? "border-amber-800 text-amber-900"
                    : "border-transparent text-stone-500 hover:text-stone-800"
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>1. Core & Pricing</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("images")}
                className={`flex items-center gap-1.5 pb-2.5 px-2 font-semibold uppercase tracking-wider transition-colors border-b-2 whitespace-nowrap ${
                  activeTab === "images"
                    ? "border-amber-800 text-amber-900"
                    : "border-transparent text-stone-500 hover:text-stone-800"
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>2. Image Gallery ({images.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("specs")}
                className={`flex items-center gap-1.5 pb-2.5 px-2 font-semibold uppercase tracking-wider transition-colors border-b-2 whitespace-nowrap ${
                  activeTab === "specs"
                    ? "border-amber-800 text-amber-900"
                    : "border-transparent text-stone-500 hover:text-stone-800"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>3. Olfactory & Specs</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("content")}
                className={`flex items-center gap-1.5 pb-2.5 px-2 font-semibold uppercase tracking-wider transition-colors border-b-2 whitespace-nowrap ${
                  activeTab === "content"
                    ? "border-amber-800 text-amber-900"
                    : "border-transparent text-stone-500 hover:text-stone-800"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>4. Details & Protocol</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("variants")}
                className={`flex items-center gap-1.5 pb-2.5 px-2 font-semibold uppercase tracking-wider transition-colors border-b-2 whitespace-nowrap ${
                  activeTab === "variants"
                    ? "border-amber-800 text-amber-900"
                    : "border-transparent text-stone-500 hover:text-stone-800"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>5. Variants ({variants.length})</span>
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSaveProduct} className="flex-1 overflow-y-auto space-y-6 text-xs pr-1">
              {/* TAB 1: BASIC & PRICING */}
              {activeTab === "basic" && (
                <div className="space-y-4">
                  <div>
                    <label className="block font-semibold text-stone-700 uppercase tracking-wider mb-1">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Dr. Scent Portable Ambient Diffuser"
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded text-stone-900 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-800"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 uppercase tracking-wider mb-1">
                      Tagline / Short Catchphrase
                    </label>
                    <input
                      type="text"
                      value={tagline}
                      onChange={(e) => setTagline(e.target.value)}
                      placeholder="e.g. Wireless waterless nebulization for cars, desks, and private suites"
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded text-stone-900 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-800"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="font-semibold text-stone-700 uppercase tracking-wider">
                          URL Slug *
                        </label>
                        <button
                          type="button"
                          onClick={handleAutoSlug}
                          className="text-[10px] text-amber-800 hover:underline font-semibold"
                        >
                          Generate from Title
                        </button>
                      </div>
                      <input
                        type="text"
                        required
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        placeholder="e.g. dr-scent-portable-ambient-diffuser"
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded text-stone-900 font-mono text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-800"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-stone-700 uppercase tracking-wider mb-1">
                        SKU Identifier *
                      </label>
                      <input
                        type="text"
                        required
                        value={sku}
                        onChange={(e) => setSku(e.target.value)}
                        placeholder="e.g. DSC-PORT-01"
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded text-stone-900 font-mono text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-800"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-stone-700 uppercase tracking-wider mb-1">
                        Catalogue Category *
                      </label>
                      <select
                        value={category}
                        onChange={(e) => {
                          const newCat = e.target.value as ProductCategory;
                          setCategory(newCat);
                          setSubCategory("");
                          if (newCat === "best-sellers") {
                            setIsBestseller(true);
                          }
                        }}
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded text-stone-900 text-xs focus:outline-none focus:ring-1 focus:ring-amber-800"
                      >
                        {availableCategories.length > 0 ? (
                          availableCategories.map((c) => (
                            <option key={c.id} value={c.slug || c.id}>
                              {c.name}
                            </option>
                          ))
                        ) : (
                          <>
                            <option value="aroma-diffusers">Diffusers</option>
                            <option value="fragrance-oils">Aroma Oils</option>
                            <option value="sprays">Sprays</option>
                            <option value="reed-diffusers">Reed Diffusers</option>
                            <option value="candles">Candles</option>
                            <optgroup label="Other Categories">
                              <option value="best-sellers">Best Sellers</option>
                              <option value="commercial-scenting">Commercial Scent Systems</option>
                              <option value="home-fragrance">Home Fragrance</option>
                              <option value="gift-collections">Gift Collections</option>
                            </optgroup>
                          </>
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-stone-700 uppercase tracking-wider mb-1">
                        Product Type / Sub-Category
                      </label>
                      {(() => {
                        const matchedCat = availableCategories.find(
                          (c) => c.slug === category || c.id === category
                        );
                        const dynamicSubs = matchedCat?.subCategories || [];

                        return (
                          <div className="space-y-1">
                            <select
                              value={subCategory}
                              onChange={(e) => {
                                const val = e.target.value;
                                setSubCategory(val);
                                if (
                                  category === "fragrance-oils" &&
                                  ["floral", "fresh", "fruity", "oriental", "woody", "amber", "gourmand"].includes(val)
                                ) {
                                  setScentFamily(val as ScentFamily);
                                }
                              }}
                              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded text-stone-900 text-xs focus:outline-none focus:ring-1 focus:ring-amber-800"
                            >
                              <option value="">-- Select Product Type --</option>
                              {dynamicSubs.length > 0 ? (
                                dynamicSubs.map((sub) => (
                                  <option key={sub.id} value={sub.id}>
                                    {sub.label}
                                  </option>
                                ))
                              ) : (
                                <>
                                  {category === "aroma-diffusers" && (
                                    <>
                                      <option value="diffuser">Diffuser</option>
                                      <option value="car-diffuser">Car Diffuser</option>
                                      <option value="dispenser">Dispenser</option>
                                      <option value="reed-diffuser">Reed Diffuser</option>
                                    </>
                                  )}
                                  {category === "fragrance-oils" && (
                                    <>
                                      <option value="car-scent">Car Scent</option>
                                      <option value="choice">Dr. Scent&apos;s Choice</option>
                                      <option value="fb">F&amp;B</option>
                                      <option value="floral">Floral</option>
                                      <option value="fresh">Fresh</option>
                                      <option value="fruity">Fruity</option>
                                      <option value="oriental">Oriental</option>
                                      <option value="premium">Premium Collection</option>
                                    </>
                                  )}
                                  {category === "candles" && (
                                    <>
                                      <option value="scented-candle">Scented Candle</option>
                                      <option value="soy-wax">Soy Wax Candle</option>
                                      <option value="luxury-3-wick">Luxury 3-Wick Candle</option>
                                    </>
                                  )}
                                  {category === "sprays" && (
                                    <>
                                      <option value="fabric-spray">Fabric Spray</option>
                                      <option value="odor-eliminator">Odor Eliminator</option>
                                      <option value="aerosol">Aerosol</option>
                                    </>
                                  )}
                                </>
                              )}
                              {subCategory && !dynamicSubs.some((s) => s.id === subCategory) && (
                                <option value={subCategory}>{subCategory}</option>
                              )}
                            </select>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-stone-700 uppercase tracking-wider mb-1">
                        Selling Price (LKR) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="100"
                        required
                        value={basePriceLKR}
                        onChange={(e) => setBasePriceLKR(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded text-stone-900 font-bold text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-800"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-stone-700 uppercase tracking-wider mb-1">
                        Original / Strike Price (LKR)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="100"
                        value={originalPriceLKR ?? ""}
                        onChange={(e) =>
                          setOriginalPriceLKR(e.target.value ? Number(e.target.value) : undefined)
                        }
                        placeholder="Optional sale comparison"
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded text-stone-900 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-800"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-stone-700 uppercase tracking-wider mb-1">
                        Inventory Count (Physical units)
                      </label>
                      <input
                        type="number"
                        min="0"
                        required
                        value={inventoryCount}
                        onChange={(e) => setInventoryCount(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded text-stone-900 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-800"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-stone-700 uppercase tracking-wider mb-1">
                        Stock Display Status
                      </label>
                      <select
                        value={stockStatus}
                        onChange={(e) =>
                          setStockStatus(
                            e.target.value as "In Stock" | "Low Stock" | "Made to Order" | "Backorder"
                          )
                        }
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded text-stone-900 text-xs focus:outline-none focus:ring-1 focus:ring-amber-800"
                      >
                        <option value="In Stock">In Stock</option>
                        <option value="Low Stock">Low Stock</option>
                        <option value="Made to Order">Made to Order</option>
                        <option value="Backorder">Backorder</option>
                      </select>
                    </div>
                  </div>

                  {/* Badges & Flags */}
                  <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
                    <span className="font-semibold text-stone-900 uppercase tracking-wider block text-[11px]">
                      Storefront Badges & Merchandising Attributes
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <label className="flex items-center gap-2 cursor-pointer text-stone-800">
                        <input
                          type="checkbox"
                          checked={isPublished}
                          onChange={(e) => setIsPublished(e.target.checked)}
                          className="rounded text-amber-800 focus:ring-amber-800 w-4 h-4"
                        />
                        <span>Published to Storefront</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer text-stone-800">
                        <input
                          type="checkbox"
                          checked={featured}
                          onChange={(e) => setFeatured(e.target.checked)}
                          className="rounded text-amber-800 focus:ring-amber-800 w-4 h-4"
                        />
                        <span>Featured on Homepage</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer text-stone-800">
                        <input
                          type="checkbox"
                          checked={isBestseller}
                          onChange={(e) => setIsBestseller(e.target.checked)}
                          className="rounded text-amber-800 focus:ring-amber-800 w-4 h-4"
                        />
                        <span>Bestseller Badge</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer text-stone-800">
                        <input
                          type="checkbox"
                          checked={isNew}
                          onChange={(e) => setIsNew(e.target.checked)}
                          className="rounded text-amber-800 focus:ring-amber-800 w-4 h-4"
                        />
                        <span>New Arrival Badge</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer text-stone-800">
                        <input
                          type="checkbox"
                          checked={drScentAuthorized}
                          onChange={(e) => setDrScentAuthorized(e.target.checked)}
                          className="rounded text-amber-800 focus:ring-amber-800 w-4 h-4"
                        />
                        <span>Official Dr. Scent Franchise Supply</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: IMAGES GALLERY */}
              {activeTab === "images" && (
                <div className="space-y-6">
                  {/* Upload from Local Computer */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsDragActive(true);
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsDragActive(false);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsDragActive(false);
                      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                        handleFileUpload(e.dataTransfer.files);
                      }
                    }}
                    className={`relative p-6 rounded-xl border-2 border-dashed transition-all text-center ${
                      isDragActive
                        ? "border-amber-700 bg-amber-50/80 ring-2 ring-amber-700/20"
                        : "border-stone-300 bg-stone-50/80 hover:border-amber-700/50 hover:bg-stone-50"
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/avif,image/gif,image/svg+xml"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          handleFileUpload(e.target.files);
                          e.target.value = "";
                        }
                      }}
                    />

                    {isUploading ? (
                      <div className="py-6 flex flex-col items-center justify-center gap-2 text-stone-700">
                        <Loader2 className="w-8 h-8 text-amber-800 animate-spin" />
                        <span className="text-xs font-semibold uppercase tracking-wider text-stone-900">
                          Uploading image from your computer...
                        </span>
                        <span className="text-[11px] text-stone-500">
                          Processing and appending to product gallery
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-amber-900/10 border border-amber-800/20 flex items-center justify-center text-amber-800">
                          <UploadCloud className="w-6 h-6 text-amber-800" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-stone-900 uppercase tracking-wider">
                            Upload Images from Local Computer
                          </p>
                          <p className="text-[11px] text-stone-500 mt-0.5">
                            Drag and drop photos here, or click the button below to browse files
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-4 py-2 bg-amber-900 hover:bg-amber-950 text-amber-100 text-xs font-semibold rounded uppercase tracking-wider flex items-center gap-2 transition-colors shadow-xs cursor-pointer"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Choose Photos from Computer</span>
                        </button>
                        <span className="text-[10px] text-stone-400">
                          Supports PNG, JPG, JPEG, WebP, AVIF up to 10MB each. Select multiple files at once.
                        </span>
                      </div>
                    )}
                  </div>

                  {uploadError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-xs flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                        <span>{uploadError}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setUploadError(null)}
                        className="text-red-600 hover:text-red-900 text-xs font-bold px-1"
                        title="Dismiss error"
                      >
                        ✕
                      </button>
                    </div>
                  )}

                  {/* Add Image URL fallback */}
                  <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                    <span className="font-semibold text-stone-900 uppercase tracking-wider block text-[11px] flex items-center gap-1.5">
                      <Link2 className="w-3.5 h-3.5 text-stone-500" />
                      <span>Or Add Web Image URL (Unsplash / CDN)</span>
                    </span>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/... or /images/..."
                        value={newImageUrl}
                        onChange={(e) => setNewImageUrl(e.target.value)}
                        className="flex-1 px-3 py-2 bg-white border border-stone-300 rounded text-stone-900 text-xs focus:outline-none focus:ring-1 focus:ring-amber-800"
                      />
                      <button
                        type="button"
                        onClick={handleAddImage}
                        disabled={!newImageUrl.trim()}
                        className="px-4 py-2 bg-stone-900 text-amber-100 hover:bg-stone-800 disabled:opacity-50 text-xs font-semibold rounded uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add URL</span>
                      </button>
                    </div>
                  </div>

                  {/* Gallery Grid */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-semibold text-stone-900 uppercase tracking-wider text-[11px]">
                        Current Product Images ({images.length})
                      </span>
                      <span className="text-stone-500 text-[11px]">
                        The first image is used as the cover photo throughout the storefront.
                      </span>
                    </div>

                    {images.length === 0 ? (
                      <div className="p-8 text-center border-2 border-dashed border-stone-200 rounded-xl text-stone-400">
                        <ImageIcon className="w-10 h-10 mx-auto mb-2 text-stone-300" />
                        <p className="text-xs">No images in gallery. Upload from your computer or enter an image URL above.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {images.map((imgUrl, index) => {
                          const isLocal = imgUrl.startsWith("/uploads/") || imgUrl.startsWith("data:");
                          return (
                            <div
                              key={index}
                              className="relative group bg-stone-100 rounded-lg overflow-hidden border border-stone-200 shadow-2xs aspect-[4/5] flex flex-col justify-between"
                            >
                              <div className="relative w-full h-full">
                                <Image
                                  src={imgUrl}
                                  alt={`Product preview ${index + 1}`}
                                  fill
                                  unoptimized={imgUrl.startsWith("data:")}
                                  className="object-cover"
                                  sizes="200px"
                                />
                              </div>

                              {/* Badges */}
                              <div className="absolute top-2 left-2 z-10 flex flex-col gap-1 items-start">
                                {index === 0 ? (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-900 text-amber-100 uppercase tracking-wider shadow-xs">
                                    Cover Photo
                                  </span>
                                ) : (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-black/60 text-white backdrop-blur-xs">
                                    Photo #{index + 1}
                                  </span>
                                )}
                                {isLocal && (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-emerald-900/80 text-emerald-100 backdrop-blur-xs">
                                    Local File
                                  </span>
                                )}
                              </div>

                              {/* Action Bar */}
                              <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-stone-950/90 via-stone-950/60 to-transparent flex items-center justify-between gap-1 z-10">
                                <div className="flex items-center gap-1">
                                  {index > 0 && (
                                    <button
                                      type="button"
                                      onClick={() => handleMoveImage(index, "left")}
                                      className="p-1 bg-white/80 hover:bg-white text-stone-900 rounded transition-colors"
                                      title="Move Left (Earlier in gallery)"
                                    >
                                      <ChevronLeft className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                  {index < images.length - 1 && (
                                    <button
                                      type="button"
                                      onClick={() => handleMoveImage(index, "right")}
                                      className="p-1 bg-white/80 hover:bg-white text-stone-900 rounded transition-colors"
                                      title="Move Right (Later in gallery)"
                                    >
                                      <ChevronRight className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                  {index !== 0 && (
                                    <button
                                      type="button"
                                      onClick={() => handleMakeImagePrimary(index)}
                                      className="text-[10px] bg-amber-100 hover:bg-white text-amber-950 px-2 py-1 rounded font-semibold transition-colors"
                                      title="Make this the cover photo"
                                    >
                                      Make Cover
                                    </button>
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveImage(index)}
                                  className="p-1 text-red-300 hover:text-red-100 hover:bg-red-950/60 rounded transition-colors ml-auto"
                                  title="Remove photo"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: OLFACTORY & SPECS */}
              {activeTab === "specs" && (
                <div className="space-y-6">
                  {/* Scent notes & profile */}
                  <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-4">
                    <span className="font-semibold text-stone-900 uppercase tracking-wider block text-[11px]">
                      Fragrance Profile & Olfactory Notes
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-medium text-stone-700 uppercase tracking-wider mb-1">
                          Olfactive Family
                        </label>
                        <select
                          value={scentFamily}
                          onChange={(e) => setScentFamily(e.target.value as ScentFamily | "")}
                          className="w-full px-3 py-2 bg-white border border-stone-300 rounded text-stone-900 text-xs focus:outline-none focus:ring-1 focus:ring-amber-800"
                        >
                          <option value="">Not Applicable (Hardware Only)</option>
                          <option value="woody">Woody & Amber</option>
                          <option value="fresh">Fresh & Green</option>
                          <option value="citrus">Citrus & Aromatic</option>
                          <option value="floral">Floral & Botanical</option>
                          <option value="oriental">Oriental & Spice</option>
                          <option value="amber">Amber</option>
                          <option value="gourmand">Gourmand</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-medium text-stone-700 uppercase tracking-wider mb-1">
                          Diffusion Intensity
                        </label>
                        <select
                          value={scentIntensity}
                          onChange={(e) =>
                            setScentIntensity(
                              e.target.value as "Delicate" | "Moderate" | "Opulent" | "Intense"
                            )
                          }
                          className="w-full px-3 py-2 bg-white border border-stone-300 rounded text-stone-900 text-xs focus:outline-none focus:ring-1 focus:ring-amber-800"
                        >
                          <option value="Delicate">Delicate</option>
                          <option value="Moderate">Moderate</option>
                          <option value="Opulent">Opulent</option>
                          <option value="Intense">Intense</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block font-medium text-stone-700 uppercase tracking-wider mb-1">
                          Top Notes (comma-separated)
                        </label>
                        <input
                          type="text"
                          value={topNotes}
                          onChange={(e) => setTopNotes(e.target.value)}
                          placeholder="e.g. Cardamom, Bergamot, Saffron"
                          className="w-full px-3 py-2 bg-white border border-stone-300 rounded text-stone-900 text-xs"
                        />
                      </div>

                      <div>
                        <label className="block font-medium text-stone-700 uppercase tracking-wider mb-1">
                          Heart Notes (comma-separated)
                        </label>
                        <input
                          type="text"
                          value={heartNotes}
                          onChange={(e) => setHeartNotes(e.target.value)}
                          placeholder="e.g. Smoked Agarwood, Rose, Cedar"
                          className="w-full px-3 py-2 bg-white border border-stone-300 rounded text-stone-900 text-xs"
                        />
                      </div>

                      <div>
                        <label className="block font-medium text-stone-700 uppercase tracking-wider mb-1">
                          Base Notes (comma-separated)
                        </label>
                        <input
                          type="text"
                          value={baseNotes}
                          onChange={(e) => setBaseNotes(e.target.value)}
                          placeholder="e.g. Golden Amber, Vanilla, Musk"
                          className="w-full px-3 py-2 bg-white border border-stone-300 rounded text-stone-900 text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Hardware Dimensions & Coverage */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-stone-700 uppercase tracking-wider mb-1">
                        Coverage Area
                      </label>
                      <input
                        type="text"
                        value={coverageArea}
                        onChange={(e) => setCoverageArea(e.target.value)}
                        placeholder="e.g. Up to 500 sq.ft (50 m²)"
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded text-stone-900 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-stone-700 uppercase tracking-wider mb-1">
                        Bottle / Reservoir Capacity
                      </label>
                      <input
                        type="text"
                        value={bottleVolume}
                        onChange={(e) => setBottleVolume(e.target.value)}
                        placeholder="e.g. 100ml / 500ml standard flacon"
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded text-stone-900 text-xs"
                      />
                    </div>
                  </div>

                  {/* Key-Value Specifications */}
                  <div className="space-y-3">
                    <span className="font-semibold text-stone-900 uppercase tracking-wider block text-[11px]">
                      Specifications Table (Shown on PDP Specs Tab)
                    </span>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Label (e.g. Dimensions)"
                        value={newSpecLabel}
                        onChange={(e) => setNewSpecLabel(e.target.value)}
                        className="w-1/3 px-3 py-2 bg-stone-50 border border-stone-300 rounded text-stone-900 text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Value (e.g. 70mm diameter x 133mm height)"
                        value={newSpecValue}
                        onChange={(e) => setNewSpecValue(e.target.value)}
                        className="flex-1 px-3 py-2 bg-stone-50 border border-stone-300 rounded text-stone-900 text-xs"
                      />
                      <button
                        type="button"
                        onClick={handleAddSpec}
                        disabled={!newSpecLabel.trim() || !newSpecValue.trim()}
                        className="px-4 py-2 bg-stone-900 text-amber-100 hover:bg-stone-800 disabled:opacity-50 text-xs font-semibold rounded uppercase tracking-wider"
                      >
                        Add Spec
                      </button>
                    </div>

                    {specifications.length > 0 && (
                      <div className="border border-stone-200 rounded-lg overflow-hidden divide-y divide-stone-100 bg-white">
                        {specifications.map((spec, i) => (
                          <div key={i} className="flex items-center justify-between p-2.5 text-xs">
                            <span className="font-medium text-stone-600 w-1/3">{spec.label}</span>
                            <span className="text-stone-900 flex-1">{spec.value}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveSpec(i)}
                              className="text-stone-400 hover:text-red-700 p-1"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: CONTENT & PROTOCOL */}
              {activeTab === "content" && (
                <div className="space-y-5">
                  <div>
                    <label className="block font-semibold text-stone-700 uppercase tracking-wider mb-1">
                      Short Description (Shown Under Title on PDP)
                    </label>
                    <textarea
                      rows={2}
                      value={shortDescription}
                      onChange={(e) => setShortDescription(e.target.value)}
                      placeholder="Anodized aluminum compact cold-air nebulizer for luxury ambience..."
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded text-stone-900 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 uppercase tracking-wider mb-1">
                      Full Detailed Description (Shown Under Description Tab)
                    </label>
                    <textarea
                      rows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Crafted with precision-machined brushed aluminum, this cordless cold-air diffuser transforms 100% pure fragrance oil..."
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded text-stone-900 text-xs"
                    />
                  </div>

                  {/* Highlights / Features */}
                  <div className="space-y-3">
                    <span className="font-semibold text-stone-900 uppercase tracking-wider block text-[11px]">
                      Key Highlights & Technology Bullet Points
                    </span>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. Patented cold-air micro-droplet nebulization"
                        value={newFeature}
                        onChange={(e) => setNewFeature(e.target.value)}
                        className="flex-1 px-3 py-2 bg-stone-50 border border-stone-300 rounded text-stone-900 text-xs"
                      />
                      <button
                        type="button"
                        onClick={handleAddFeature}
                        disabled={!newFeature.trim()}
                        className="px-4 py-2 bg-stone-900 text-amber-100 hover:bg-stone-800 disabled:opacity-50 text-xs font-semibold rounded uppercase tracking-wider"
                      >
                        Add Feature
                      </button>
                    </div>

                    {features.length > 0 && (
                      <div className="border border-stone-200 rounded-lg overflow-hidden divide-y divide-stone-100 bg-white">
                        {features.map((f, i) => (
                          <div key={i} className="flex items-center justify-between p-2.5 text-xs">
                            <div className="flex items-center gap-2">
                              <Check className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                              <span className="text-stone-800">{f}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveFeature(i)}
                              className="text-stone-400 hover:text-red-700 p-1"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Operating Instructions */}
                  <div className="space-y-3">
                    <span className="font-semibold text-stone-900 uppercase tracking-wider block text-[11px]">
                      Recommended Operating Protocol Steps
                    </span>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. Insert the 10ml fragrance oil bottle directly into nozzle."
                        value={newInstruction}
                        onChange={(e) => setNewInstruction(e.target.value)}
                        className="flex-1 px-3 py-2 bg-stone-50 border border-stone-300 rounded text-stone-900 text-xs"
                      />
                      <button
                        type="button"
                        onClick={handleAddInstruction}
                        disabled={!newInstruction.trim()}
                        className="px-4 py-2 bg-stone-900 text-amber-100 hover:bg-stone-800 disabled:opacity-50 text-xs font-semibold rounded uppercase tracking-wider"
                      >
                        Add Step
                      </button>
                    </div>

                    {usageInstructions.length > 0 && (
                      <div className="border border-stone-200 rounded-lg overflow-hidden divide-y divide-stone-100 bg-white">
                        {usageInstructions.map((ins, i) => (
                          <div key={i} className="flex items-center justify-between p-2.5 text-xs">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-stone-400 text-[10px]">{i + 1}.</span>
                              <span className="text-stone-800">{ins}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveInstruction(i)}
                              className="text-stone-400 hover:text-red-700 p-1"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Warranty Terms */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block font-semibold text-stone-700 uppercase tracking-wider mb-1">
                        Warranty Description Text
                      </label>
                      <input
                        type="text"
                        value={warrantyPeriod}
                        onChange={(e) => setWarrantyPeriod(e.target.value)}
                        placeholder="e.g. 6 Month Official Franchisee Warranty"
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded text-stone-900 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-stone-700 uppercase tracking-wider mb-1">
                        Warranty Duration (Months)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="60"
                        value={warrantyMonths}
                        onChange={(e) => setWarrantyMonths(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded text-stone-900 text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: VARIANTS */}
              {activeTab === "variants" && (
                <div className="space-y-6">
                  {/* Add New Variant */}
                  <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
                    <span className="font-semibold text-stone-900 uppercase tracking-wider block text-[11px]">
                      Add Product Variant / Finish / Size
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="Variant Name (optional, e.g. Small / White)"
                        value={newVarName}
                        onChange={(e) => setNewVarName(e.target.value)}
                        className="px-3 py-2 bg-white border border-stone-300 rounded text-stone-900 text-xs"
                      />
                      <input
                        type="text"
                        placeholder="SKU (optional)"
                        value={newVarSku}
                        onChange={(e) => setNewVarSku(e.target.value)}
                        className="px-3 py-2 bg-white border border-stone-300 rounded text-stone-900 font-mono text-xs"
                      />
                      <input
                        type="number"
                        placeholder="Price (LKR)"
                        value={newVarPrice || ""}
                        onChange={(e) => setNewVarPrice(Number(e.target.value))}
                        className="px-3 py-2 bg-white border border-stone-300 rounded text-stone-900 text-xs font-semibold"
                      />
                      <input
                        type="text"
                        placeholder="Size (e.g. Small, Medium)"
                        value={newVarSize}
                        onChange={(e) => setNewVarSize(e.target.value)}
                        className="px-3 py-2 bg-white border border-stone-300 rounded text-stone-900 text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Colour (e.g. White, Black)"
                        value={newVarColor}
                        onChange={(e) => setNewVarColor(e.target.value)}
                        className="px-3 py-2 bg-white border border-stone-300 rounded text-stone-900 text-xs"
                      />
                    </div>
                    <div className="space-y-2">
                      <span className="text-[11px] text-stone-500">
                        Photos for this variant. Shoppers see these when they choose it.
                      </span>
                      <VariantPhotos
                        photos={newVarImages}
                        busy={variantPhotoBusy === "new"}
                        onAdd={handleNewVariantPhotos}
                        onRemove={handleRemoveNewVariantPhoto}
                      />
                    </div>
                    {variantPhotoError && <p className="text-[11px] text-red-700">{variantPhotoError}</p>}
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={handleAddVariant}
                        disabled={!newVarName.trim()}
                        className="px-4 py-2 bg-stone-900 text-amber-100 hover:bg-stone-800 disabled:opacity-50 text-xs font-semibold rounded uppercase tracking-wider flex items-center gap-1.5"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Variant</span>
                      </button>
                    </div>
                  </div>

                  {/* Variants List */}
                  <div>
                    <span className="font-semibold text-stone-900 uppercase tracking-wider block text-[11px] mb-3">
                      Configured Product Variants ({variants.length})
                    </span>

                    {variants.length === 0 ? (
                      <div className="p-6 text-center border-2 border-dashed border-stone-200 rounded-xl text-stone-400">
                        <Layers className="w-8 h-8 mx-auto mb-2 text-stone-300" />
                        <p>No extra variants configured. Base price will apply.</p>
                      </div>
                    ) : (
                      <div className="border border-stone-200 rounded-xl overflow-hidden divide-y divide-stone-100 bg-white">
                        {variants.map((v, i) => (
                          <div key={v.id || i} className="flex flex-col gap-3 p-3 text-xs">
                            <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <p className="font-semibold text-stone-900">{v.name}</p>
                              <p className="text-[10px] text-stone-400 font-mono">
                                SKU: {v.sku}
                                {[v.attributes?.size, v.attributes?.color].filter(Boolean).length > 0 &&
                                  ` • ${[v.attributes?.size, v.attributes?.color].filter(Boolean).join(" / ")}`}
                              </p>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="font-bold text-stone-900">
                                {formatLKR(v.priceLKR)}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                  v.inStock ? "bg-emerald-50 text-emerald-800" : "bg-stone-100 text-stone-500"
                                }`}
                              >
                                {v.inStock ? "In Stock" : "Sold Out"}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemoveVariant(v.id)}
                                className="text-stone-400 hover:text-red-700 p-1"
                                title="Remove variant"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            </div>
                            <VariantPhotos
                              photos={v.images ?? []}
                              busy={variantPhotoBusy === v.id}
                              onAdd={(files) => handleVariantPhotos(v.id, files)}
                              onRemove={(index) => handleRemoveVariantPhoto(v.id, index)}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Bottom Fixed Action Bar */}
              <div className="pt-4 border-t border-stone-200 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  {editingProduct && (
                    <button
                      type="button"
                      onClick={() => confirmDeleteProduct(editingProduct.id, editingProduct.name)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 border border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300 uppercase font-semibold text-[11px] rounded transition-colors"
                      title="Permanently delete this product from catalogue"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Product</span>
                    </button>
                  )}
                  <span className="text-[11px] text-stone-400">
                    {editingProduct ? `SKU: ${sku}` : "Creating new franchise entry"}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-stone-300 text-stone-700 hover:bg-stone-50 uppercase font-semibold text-[11px] rounded transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2 bg-stone-900 hover:bg-stone-800 text-amber-100 uppercase font-semibold text-[11px] rounded shadow-xs transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {saving && <div className="w-3.5 h-3.5 border-2 border-amber-200 border-t-amber-900 rounded-full animate-spin" />}
                    <span>{editingProduct ? "Save Changes" : "Create Product"}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation In-App Modal (Bypasses browser native dialog restrictions) */}
      {productToDelete && (
        <div className="fixed inset-0 z-60 bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-700 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="font-serif text-lg font-medium text-stone-900">
                Delete Product Permanently?
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Are you sure you want to delete <span className="font-semibold text-stone-900">&ldquo;{productToDelete.name}&rdquo;</span>?
                This will permanently remove the product and its configuration from the catalogue and live storefront. This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setProductToDelete(null)}
                className="px-4 py-2 border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-semibold rounded uppercase tracking-wider transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={executeDelete}
                className="px-5 py-2 bg-red-700 hover:bg-red-800 text-white text-xs font-semibold rounded uppercase tracking-wider transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
              >
                {deleting && <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
                <span>{deleting ? "Deleting..." : "Yes, Delete Product"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
