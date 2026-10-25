"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { LUXURY_EASE } from "@/config/motion.config";

interface ProductGalleryProps {
  images: string[];
  productName: string;
  isBestseller?: boolean;
  isNew?: boolean;
}

export function ProductGallery({
  images,
  productName,
  isBestseller,
  isNew,
}: ProductGalleryProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const displayImages = images && images.length > 0 ? images : ["/placeholder.jpg"];
  const safeIndex = activeImageIndex >= displayImages.length ? 0 : activeImageIndex;
  const currentImage = displayImages[safeIndex] || displayImages[0];

  const touchStartX = useRef<number | null>(null);
  const badge = isBestseller ? "Bestseller" : isNew ? "New" : null;

  useEffect(() => {
    setActiveImageIndex(0);
  }, [images]);

  const handlePrev = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      setActiveImageIndex((prev) => (prev <= 0 ? displayImages.length - 1 : prev - 1));
    },
    [displayImages.length]
  );

  const handleNext = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      setActiveImageIndex((prev) => (prev >= displayImages.length - 1 ? 0 : prev + 1));
    },
    [displayImages.length]
  );

  return (
    <div
      className="space-y-3 focus:outline-none"
      tabIndex={0}
      onKeyDown={(e) => {
        if (displayImages.length <= 1) return;
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          handlePrev();
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          handleNext();
        }
      }}
      aria-label="Product image gallery (use arrow keys to change images)"
    >
      {/* Main image: contained on a light ground so studio shots are never cropped */}
      <div
        className="relative group aspect-square w-full overflow-hidden bg-white border border-[var(--warm-stone)]/30"
        onTouchStart={(e) => {
          touchStartX.current = e.touches[0].clientX;
        }}
        onTouchEnd={(e) => {
          if (touchStartX.current === null || displayImages.length <= 1) return;
          const delta = e.changedTouches[0].clientX - touchStartX.current;
          touchStartX.current = null;
          if (Math.abs(delta) < 40) return;
          if (delta < 0) handleNext();
          else handlePrev();
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentImage}
            initial={{ opacity: 0.4 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0.2 }}
            transition={{ duration: 0.35, ease: LUXURY_EASE }}
            className="relative w-full h-full"
          >
            <Image
              src={currentImage}
              alt={`${productName} - View ${safeIndex + 1}`}
              fill
              priority
              unoptimized={typeof currentImage === "string" && currentImage.startsWith("data:")}
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-contain object-center p-4 sm:p-8"
            />
          </motion.div>
        </AnimatePresence>

        {badge && (
          <span className="absolute top-3 left-3 z-10 px-2.5 py-1 bg-[var(--near-black)] text-[var(--porcelain)] text-[10px] uppercase tracking-[0.2em] font-medium">
            {badge}
          </span>
        )}

        {displayImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous image"
              className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-[var(--near-black)] border border-[var(--warm-stone)]/50 shadow-sm items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next image"
              className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-[var(--near-black)] border border-[var(--warm-stone)]/50 shadow-sm items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Dots on mobile, where swiping replaces the arrows */}
            <div className="sm:hidden absolute bottom-3 inset-x-0 flex justify-center gap-1.5 z-10">
              {displayImages.map((_, idx) => (
                <span
                  key={idx}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === safeIndex ? "w-4 bg-[var(--near-black)]" : "w-1.5 bg-[var(--near-black)]/25"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {displayImages.length > 1 && (
        <div className="hidden sm:flex gap-3 overflow-x-auto pb-1" role="tablist" aria-label="Product image thumbnails">
          {displayImages.map((img, idx) => {
            const isSelected = idx === safeIndex;
            return (
              <button
                key={idx}
                type="button"
                role="tab"
                aria-selected={isSelected}
                aria-label={`View image ${idx + 1}`}
                onClick={() => setActiveImageIndex(idx)}
                className={`relative w-20 h-20 bg-white border overflow-hidden flex-shrink-0 transition-all cursor-pointer ${
                  isSelected
                    ? "border-[var(--near-black)]"
                    : "border-[var(--warm-stone)]/40 opacity-60 hover:opacity-100"
                }`}
              >
                <Image
                  src={img}
                  alt={`${productName} thumbnail ${idx + 1}`}
                  fill
                  unoptimized={typeof img === "string" && img.startsWith("data:")}
                  sizes="80px"
                  className="object-contain p-1.5"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
