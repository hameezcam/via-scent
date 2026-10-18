"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  FolderTree,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  Upload,
  Check,
  X,
  AlertCircle,
  Eye,
  Star,
  Search,
  Loader2,
  Sparkles,
  Layers,
  ArrowUpDown,
  Tag,
  ImageIcon,
} from "lucide-react";
import { Category, SubCategoryItem } from "@/types/category";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterFeatured, setFilterFeatured] = useState<"all" | "featured" | "standard">("all");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form Fields
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [displayOrder, setDisplayOrder] = useState<number>(1);
  const [featuredInHome, setFeaturedInHome] = useState(true);
  const [subCategories, setSubCategories] = useState<SubCategoryItem[]>([]);
  const [newSubCategoryInput, setNewSubCategoryInput] = useState("");

  // Delete State
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch categories
  const loadCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/categories", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setCategories(json.data.sort((a: Category, b: Category) => (a.displayOrder || 0) - (b.displayOrder || 0)));
        }
      } else {
        setFeedback({ type: "error", message: "Failed to load categories." });
      }
    } catch {
      setFeedback({ type: "error", message: "Network error loading categories." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // Auto-hide alerts
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  // Open modal for Create
  const handleOpenCreateModal = () => {
    setEditingCategory(null);
    setName("");
    setSlug("");
    setTagline("");
    setDescription("");
    setImageUrl("");
    setDisplayOrder(categories.length + 1);
    setFeaturedInHome(true);
    setSubCategories([]);
    setNewSubCategoryInput("");
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setTagline(cat.tagline || "");
    setDescription(cat.description || "");
    setImageUrl(cat.image);
    setDisplayOrder(cat.displayOrder || 1);
    setFeaturedInHome(Boolean(cat.featuredInHome));
    setSubCategories(cat.subCategories ? [...cat.subCategories] : []);
    setNewSubCategoryInput("");
    setIsModalOpen(true);
  };

  // Generate slug on name change
  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingCategory) {
      const autoSlug = val
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      setSlug(autoSlug);
    }
  };

  // Add subcategory item
  const handleAddSubCategory = () => {
    const trimmed = newSubCategoryInput.trim();
    if (!trimmed) return;
    const subId = trimmed.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    if (subCategories.some((sc) => sc.id === subId || sc.label.toLowerCase() === trimmed.toLowerCase())) {
      return;
    }
    setSubCategories([...subCategories, { id: subId, label: trimmed }]);
    setNewSubCategoryInput("");
  };

  // Remove subcategory item
  const handleRemoveSubCategory = (id: string) => {
    setSubCategories(subCategories.filter((sc) => sc.id !== id));
  };

  // Handle image file upload
  const handleFileUpload = async (file: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setFeedback({ type: "error", message: "Please select an image file (PNG, JPG, WebP)." });
      return;
    }

    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        setImageUrl(data.url);
        setFeedback({ type: "success", message: "Category image uploaded successfully!" });
      } else {
        setFeedback({ type: "error", message: data.error || "Failed to upload image." });
      }
    } catch {
      setFeedback({ type: "error", message: "Network error uploading image." });
    } finally {
      setUploadingImage(false);
    }
  };

  // Toggle Featured status directly
  const handleToggleFeatured = async (cat: Category) => {
    try {
      const updatedStatus = !cat.featuredInHome;
      const res = await fetch(`/api/admin/categories/${cat.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featuredInHome: updatedStatus }),
      });

      if (res.ok) {
        setCategories((prev) =>
          prev.map((c) => (c.id === cat.id ? { ...c, featuredInHome: updatedStatus } : c))
        );
        setFeedback({
          type: "success",
          message: `Category "${cat.name}" is now ${updatedStatus ? "featured on the homepage" : "hidden from homepage featured section"}.`,
        });
      } else {
        setFeedback({ type: "error", message: "Failed to update category featured status." });
      }
    } catch {
      setFeedback({ type: "error", message: "Error updating category featured status." });
    }
  };

  // Submit modal (Create or Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFeedback({ type: "error", message: "Category name is required." });
      return;
    }

    const finalSlug = slug.trim()
      ? slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-")
      : name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");

    try {
      setSubmitting(true);
      const payload = {
        name: name.trim(),
        slug: finalSlug,
        tagline: tagline.trim(),
        description: description.trim(),
        image: imageUrl.trim() || "/images/categories/candles.jpg",
        displayOrder: Number(displayOrder) || 1,
        featuredInHome,
        subCategories,
        href: `/shop/${finalSlug}`,
      };

      if (editingCategory) {
        // Update
        const res = await fetch(`/api/admin/categories/${editingCategory.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setFeedback({ type: "success", message: `Category "${data.data.name}" updated successfully.` });
          setIsModalOpen(false);
          loadCategories();
        } else {
          setFeedback({ type: "error", message: data.error || "Failed to update category." });
        }
      } else {
        // Create
        const res = await fetch("/api/admin/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setFeedback({ type: "success", message: `Category "${data.data.name}" created and published to storefront.` });
          setIsModalOpen(false);
          loadCategories();
        } else {
          setFeedback({ type: "error", message: data.error || "Failed to create category." });
        }
      }
    } catch {
      setFeedback({ type: "error", message: "Network error saving category." });
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Category
  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;
    try {
      setDeleting(true);
      const res = await fetch(`/api/admin/categories/${categoryToDelete.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setFeedback({ type: "success", message: `Category "${categoryToDelete.name}" was removed successfully.` });
        setCategoryToDelete(null);
        loadCategories();
      } else {
        setFeedback({ type: "error", message: data.error || "Failed to delete category." });
      }
    } catch {
      setFeedback({ type: "error", message: "Network error deleting category." });
    } finally {
      setDeleting(false);
    }
  };

  // Filtered categories
  const filteredCategories = categories.filter((cat) => {
    const matchesSearch =
      cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cat.tagline && cat.tagline.toLowerCase().includes(searchTerm.toLowerCase()));

    if (filterFeatured === "featured") return matchesSearch && cat.featuredInHome;
    if (filterFeatured === "standard") return matchesSearch && !cat.featuredInHome;
    return matchesSearch;
  });

  const totalFeatured = categories.filter((c) => c.featuredInHome).length;
  const totalSubCategories = categories.reduce((acc, c) => acc + (c.subCategories?.length || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-amber-100 text-amber-900 rounded-lg">
              <FolderTree className="w-5 h-5" />
            </span>
            <span className="text-xs uppercase tracking-widest text-amber-800 font-semibold font-mono">
              Storefront Architecture
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
            Category Management
          </h1>
          <p className="text-sm text-stone-600 mt-1 max-w-2xl">
            Create, edit, curate and order product categories. Changes immediately reflect across storefront navigation, home showcase grids, shop filters, and catalog routes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/shop"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 text-xs font-medium transition shadow-sm"
          >
            <Eye className="w-4 h-4 text-stone-400" />
            <span>View Storefront Shop</span>
            <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
          </Link>
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-amber-100 text-xs font-semibold tracking-wide uppercase shadow hover:shadow-md transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* Alert Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between gap-3 text-sm animate-in fade-in duration-200 ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
              : "bg-red-50 text-red-900 border border-red-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <Check className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-stone-400 hover:text-stone-600 text-xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Total Categories</span>
            <FolderTree className="w-4 h-4 text-stone-400" />
          </div>
          <div className="text-2xl font-serif font-bold text-stone-900">{categories.length}</div>
          <div className="text-[11px] text-stone-500 mt-1">Live in store catalog</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between text-amber-700 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Featured on Home</span>
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
          <div className="text-2xl font-serif font-bold text-amber-900">{totalFeatured}</div>
          <div className="text-[11px] text-stone-500 mt-1">Shown in homepage grid</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Sub-Categories</span>
            <Layers className="w-4 h-4 text-stone-400" />
          </div>
          <div className="text-2xl font-serif font-bold text-stone-900">{totalSubCategories}</div>
          <div className="text-[11px] text-stone-500 mt-1">Filter facets & tags</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between text-emerald-700 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Store Sync</span>
            <Sparkles className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-serif font-bold text-emerald-900">Active</div>
          <div className="text-[11px] text-emerald-700 mt-1">Dynamic routing enabled</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search by category name, slug, tagline..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-stone-500 font-medium">Filter:</span>
          <button
            onClick={() => setFilterFeatured("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              filterFeatured === "all"
                ? "bg-stone-900 text-white"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            All ({categories.length})
          </button>
          <button
            onClick={() => setFilterFeatured("featured")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
              filterFeatured === "featured"
                ? "bg-amber-600 text-white"
                : "bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200"
            }`}
          >
            <Star className="w-3 h-3 fill-current" />
            <span>Featured ({totalFeatured})</span>
          </button>
          <button
            onClick={() => setFilterFeatured("standard")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              filterFeatured === "standard"
                ? "bg-stone-800 text-white"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            Standard ({categories.length - totalFeatured})
          </button>
        </div>
      </div>

      {/* Categories Cards / Table */}
      {loading ? (
        <div className="bg-white rounded-xl border border-stone-200 p-16 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
          <span className="text-xs uppercase tracking-widest text-stone-500 font-mono">
            Loading Categories...
          </span>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="bg-white rounded-xl border border-stone-200 p-12 text-center space-y-3">
          <FolderTree className="w-12 h-12 text-stone-300 mx-auto" />
          <h3 className="text-base font-serif font-bold text-stone-800">No categories found</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            {searchTerm ? "No categories match your search criteria." : "Start by adding your first luxury product category."}
          </p>
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-stone-900 text-amber-100 text-xs font-medium hover:bg-stone-800 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create Category</span>
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-600 divide-y divide-stone-200">
              <thead className="bg-stone-50 text-[10px] uppercase font-mono tracking-wider text-stone-500">
                <tr>
                  <th className="py-3.5 px-4">Order</th>
                  <th className="py-3.5 px-4">Image</th>
                  <th className="py-3.5 px-4">Category Details</th>
                  <th className="py-3.5 px-4">Route & Slug</th>
                  <th className="py-3.5 px-4">Sub-Categories</th>
                  <th className="py-3.5 px-4 text-center">Featured on Home</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredCategories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-stone-50/70 transition-colors group">
                    {/* Order */}
                    <td className="py-4 px-4 font-mono font-semibold text-stone-400">
                      #{cat.displayOrder || 1}
                    </td>

                    {/* Image */}
                    <td className="py-4 px-4">
                      <div className="w-14 h-14 rounded-lg bg-stone-100 border border-stone-200 overflow-hidden relative group/img shadow-sm">
                        {cat.image ? (
                          <Image
                            src={cat.image}
                            alt={cat.name}
                            fill
                            className="object-cover"
                            sizes="56px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-stone-400">
                            <ImageIcon className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Details */}
                    <td className="py-4 px-4 max-w-xs">
                      <div className="font-serif font-bold text-stone-900 text-sm">{cat.name}</div>
                      {cat.tagline && (
                        <div className="text-[11px] text-amber-800 font-medium truncate mt-0.5">
                          {cat.tagline}
                        </div>
                      )}
                      {cat.description && (
                        <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                          {cat.description}
                        </p>
                      )}
                    </td>

                    {/* Slug & Link */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5">
                        <code className="bg-stone-100 text-stone-800 px-2 py-0.5 rounded font-mono text-[11px]">
                          {cat.slug}
                        </code>
                        <Link
                          href={`/shop/${cat.slug}`}
                          target="_blank"
                          title="Open category page on storefront"
                          className="text-stone-400 hover:text-amber-700 transition"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </td>

                    {/* Subcategories */}
                    <td className="py-4 px-4 max-w-[200px]">
                      {cat.subCategories && cat.subCategories.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {cat.subCategories.slice(0, 3).map((sub) => (
                            <span
                              key={sub.id}
                              className="px-2 py-0.5 bg-stone-100 border border-stone-200 text-stone-700 rounded text-[10px]"
                            >
                              {sub.label}
                            </span>
                          ))}
                          {cat.subCategories.length > 3 && (
                            <span className="px-1.5 py-0.5 text-stone-400 font-mono text-[10px]">
                              +{cat.subCategories.length - 3} more
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-stone-400 italic text-[11px]">None defined</span>
                      )}
                    </td>

                    {/* Featured toggle */}
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => handleToggleFeatured(cat)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition ${
                          cat.featuredInHome
                            ? "bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200"
                            : "bg-stone-100 text-stone-500 border border-stone-200 hover:bg-stone-200"
                        }`}
                        title="Click to toggle featured status on storefront homepage"
                      >
                        <Star
                          className={`w-3 h-3 ${
                            cat.featuredInHome ? "fill-amber-500 text-amber-600" : "text-stone-400"
                          }`}
                        />
                        <span>{cat.featuredInHome ? "Featured" : "Hidden"}</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(cat)}
                          className="p-1.5 rounded-md hover:bg-amber-50 text-stone-500 hover:text-amber-800 transition"
                          title="Edit Category"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setCategoryToDelete(cat)}
                          className="p-1.5 rounded-md hover:bg-red-50 text-stone-400 hover:text-red-700 transition"
                          title="Delete Category"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-stone-200 overflow-hidden my-8 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-stone-900 text-white px-6 py-4 flex items-center justify-between border-b border-stone-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-500/20 text-amber-300 rounded-lg">
                  <FolderTree className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-amber-100">
                    {editingCategory ? "Edit Category" : "Add New Category"}
                  </h3>
                  <p className="text-xs text-stone-400">
                    {editingCategory
                      ? `Updating "${editingCategory.name}"`
                      : "Create a new luxury category for the storefront"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Category Name & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                    Category Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Luxury Candles"
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-600/20 focus:border-amber-600 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                    URL Slug <span className="text-stone-400 font-normal">(auto-generated)</span>
                  </label>
                  <div className="flex items-center">
                    <span className="text-stone-400 bg-stone-100 px-2.5 py-2.5 border border-r-0 border-stone-300 rounded-l-lg text-[11px] font-mono">
                      /shop/
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="luxury-candles"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-r-lg border border-stone-300 text-xs font-mono text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-600/20 focus:border-amber-600 transition"
                    />
                  </div>
                </div>
              </div>

              {/* Tagline */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                  Artisanal Tagline
                </label>
                <input
                  type="text"
                  placeholder="e.g. Hand-Poured Botanical & Pure Soy Wax"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-600/20 focus:border-amber-600 transition"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                  Editorial Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Atmospheric fragrance description displayed in the category showcase header..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-stone-300 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-600/20 focus:border-amber-600 transition resize-none"
                />
              </div>

              {/* Image Upload Component */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                  Category Image
                </label>

                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  {/* Preview Box */}
                  <div className="w-32 h-32 rounded-xl bg-stone-100 border border-stone-300 overflow-hidden relative shrink-0 shadow-inner group">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt="Category preview"
                        fill
                        className="object-cover"
                        sizes="128px"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-stone-400 p-2 text-center">
                        <ImageIcon className="w-8 h-8 mb-1 opacity-50" />
                        <span className="text-[10px]">No image</span>
                      </div>
                    )}
                  </div>

                  {/* Upload Controls */}
                  <div className="flex-1 space-y-2.5 w-full">
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-stone-300 hover:border-amber-600 rounded-xl p-4 text-center cursor-pointer bg-stone-50 hover:bg-amber-50/30 transition group"
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file);
                        }}
                      />
                      <div className="flex flex-col items-center justify-center space-y-1">
                        {uploadingImage ? (
                          <>
                            <Loader2 className="w-6 h-6 text-amber-600 animate-spin" />
                            <span className="text-xs text-stone-600 font-medium">Uploading image...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-6 h-6 text-stone-400 group-hover:text-amber-600 transition" />
                            <span className="text-xs font-semibold text-stone-800">
                              Click to upload image
                            </span>
                            <span className="text-[10px] text-stone-400">
                              JPG, PNG, WebP up to 10MB
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-stone-500 whitespace-nowrap">Or Image URL:</span>
                      <input
                        type="text"
                        placeholder="/images/categories/my-photo.jpg or https://..."
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        className="flex-1 px-3 py-1.5 rounded-lg border border-stone-300 text-xs font-mono text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-600/20 focus:border-amber-600 transition"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Display Order & Homepage Featured Toggle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-stone-100">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 1)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-600/20 focus:border-amber-600 transition"
                  />
                  <p className="text-[11px] text-stone-500 mt-1">Lower numbers display first.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                    Homepage Featured
                  </label>
                  <div className="flex items-center gap-3 pt-2">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={featuredInHome}
                        onChange={(e) => setFeaturedInHome(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                    </label>
                    <span className="text-xs text-stone-700">
                      {featuredInHome ? "Show on Homepage Grid" : "Hidden from Homepage Grid"}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 mt-1">Displays on the luxury curated category showcase.</p>
                </div>
              </div>

              {/* Sub-Categories Manager */}
              <div className="pt-2 border-t border-stone-100 space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700">
                  Sub-Categories & Facets
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Soy Wax Candle, Car Scent, 3-Wick..."
                    value={newSubCategoryInput}
                    onChange={(e) => setNewSubCategoryInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddSubCategory();
                      }
                    }}
                    className="flex-1 px-3.5 py-2 rounded-lg border border-stone-300 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-600/20 focus:border-amber-600 transition"
                  />
                  <button
                    type="button"
                    onClick={handleAddSubCategory}
                    className="px-3.5 py-2 rounded-lg bg-stone-800 hover:bg-stone-900 text-white text-xs font-medium transition"
                  >
                    Add Facet
                  </button>
                </div>

                {/* Subcategory Pills */}
                {subCategories.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {subCategories.map((sub) => (
                      <span
                        key={sub.id}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-xs"
                      >
                        <Tag className="w-3 h-3 text-amber-600" />
                        <span>{sub.label}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSubCategory(sub.id)}
                          className="hover:text-red-700 text-amber-700 transition"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 text-xs font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-amber-100 text-xs font-semibold tracking-wider uppercase transition shadow"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingCategory ? "Save Changes" : "Publish Category"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {categoryToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 animate-in zoom-in-95 duration-200 space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-serif font-bold text-lg text-stone-900">
                Remove &quot;{categoryToDelete.name}&quot;?
              </h3>
              <p className="text-xs text-stone-500">
                This category will be deleted from the storefront navigation, homepage showcase, and category routes.
              </p>
            </div>

            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-[11px] text-amber-800">
              Note: Existing products currently tagged with this category will retain their category ID, but the category navigation page may be removed.
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCategoryToDelete(null)}
                className="flex-1 px-4 py-2 rounded-lg border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 text-xs font-medium transition"
              >
                Keep Category
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDeleteConfirm}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-semibold tracking-wide transition shadow"
              >
                {deleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Delete Now</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
