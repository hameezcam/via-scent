"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ShieldCheck, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { LUXURY_EASE } from "@/config/motion.config";

interface ProductGalleryProps {
  images: string[];
  productName: string;
  isBestseller?: boolean;
  isNew?: boolean;
  drScentAuthorized?: boolean;
}

export function ProductGallery({
  images,
  productName,
  isBestseller,
  isNew,
  drScentAuthorized,
}: ProductGalleryProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const displayImages = images && images.length > 0 ? images : ["/placeholder.jpg"];
  const safeIndex = activeImageIndex >= displayImages.length ? 0 : activeImageIndex;
  const currentImage = displayImages[safeIndex] || displayImages[0];

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
      className="space-y-4 focus:outline-none"
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
      {/* Main Image Frame */}
      <div className="relative group aspect-[4/5] sm:aspect-[1/1] w-full rounded-sm overflow-hidden bg-white border border-[var(--warm-stone)]/40 shadow-xs">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentImage}
            initial={{ opacity: 0.4, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0.2 }}
            transition={{ duration: 0.5, ease: LUXURY_EASE }}
            className="relative w-full h-full"
          >
            <Image
              src={currentImage}
              alt={`${productName} - View ${safeIndex + 1}`}
              fill
              priority
              unoptimized={typeof currentImage === "string" && currentImage.startsWith("data:")}
              sizes="(max-width: 768px) 100vw, 55vw"
              className="object-cover object-center"
            />
          </motion.div>
        </AnimatePresence>

        {/* Ambient Film Grain */}
        <div className="film-grain" />

        {/* Badges Overlay */}
        <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10">
          {isBestseller && (
            <span className="px-2.5 py-1 bg-[var(--near-black)]/90 backdrop-blur-sm text-[var(--champagne)] border border-[var(--champagne)]/40 rounded-sm text-[10px] uppercase tracking-[0.2em] font-medium">
              Considered Bestseller
            </span>
          )}
          {isNew && (
            <span className="px-2.5 py-1 bg-[var(--ivory)]/95 backdrop-blur-sm text-[var(--near-black)] border border-[var(--warm-stone)]/60 rounded-sm text-[10px] uppercase tracking-[0.2em] font-medium">
              New Formulation
            </span>
          )}
        </div>

        {drScentAuthorized && (
          <div className="absolute top-4 right-4 z-10 bg-[var(--porcelain)]/95 backdrop-blur-sm px-3 py-1 rounded-sm text-[10px] tracking-widest font-medium uppercase text-[var(--near-black)] border border-[var(--champagne)]/40 shadow-xs flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[var(--champagne)]" />
            <span>Authorized Supply</span>
          </div>
        )}

        {/* Navigation Arrows */}
        {displayImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-[var(--porcelain)]/90 hover:bg-white text-[var(--near-black)] border border-[var(--warm-stone)]/60 shadow-md backdrop-blur-sm flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[var(--champagne)]"
            >
              <ChevronLeft className="w-5 h-5 text-[var(--near-black)]" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next image"
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-[var(--porcelain)]/90 hover:bg-white text-[var(--near-black)] border border-[var(--warm-stone)]/60 shadow-md backdrop-blur-sm flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[var(--champagne)]"
            >
              <ChevronRight className="w-5 h-5 text-[var(--near-black)]" />
            </button>

            {/* Photo Counter Indicator */}
            <div className="absolute bottom-3 right-3 z-10 px-3 py-1 rounded-sm text-[10px] font-mono tracking-widest bg-[var(--near-black)]/75 text-[var(--ivory)] backdrop-blur-sm border border-[var(--warm-stone)]/20 select-none">
              {safeIndex + 1} / {displayImages.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {displayImages.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1" role="tablist" aria-label="Product image thumbnails">
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
                className={`relative w-20 h-20 rounded-sm border overflow-hidden flex-shrink-0 transition-all cursor-pointer ${
                  isSelected
                    ? "border-[var(--champagne)] ring-1 ring-[var(--champagne)] opacity-100 shadow-xs"
                    : "border-[var(--warm-stone)]/50 hover:border-[var(--champagne)]/60 opacity-60 hover:opacity-100"
                }`}
              >
                <Image
                  src={img}
                  alt={`${productName} thumbnail ${idx + 1}`}
                  fill
                  unoptimized={typeof img === "string" && img.startsWith("data:")}
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
