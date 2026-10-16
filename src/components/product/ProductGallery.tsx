"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Badge } from "@/components/common/Badge";
import { ShieldCheck, ChevronLeft, ChevronRight } from "lucide-react";

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

  // Reset to first image if images prop changes
  useEffect(() => {
    setActiveImageIndex(0);
  }, [images]);

  const handlePrev = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveImageIndex((prev) => (prev <= 0 ? displayImages.length - 1 : prev - 1));
  }, [displayImages.length]);

  const handleNext = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveImageIndex((prev) => (prev >= displayImages.length - 1 ? 0 : prev + 1));
  }, [displayImages.length]);

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
      <div className="relative group aspect-[4/5] sm:aspect-square w-full rounded-lg overflow-hidden bg-stone-100 border border-stone-200">
        <Image
          src={currentImage}
          alt={`${productName} - View ${safeIndex + 1}`}
          fill
          priority
          unoptimized={typeof currentImage === "string" && currentImage.startsWith("data:")}
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover object-center transition-all duration-300"
        />

        {/* Badges Overlay */}
        <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10">
          {isBestseller && <Badge variant="gold">Bestseller</Badge>}
          {isNew && <Badge variant="dark">New Arrival</Badge>}
        </div>

        {drScentAuthorized && (
          <div className="absolute top-4 right-4 z-10 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-full text-[11px] font-medium text-amber-900 border border-amber-200/80 shadow-xs flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
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
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-stone-900 border border-stone-200/90 shadow-md backdrop-blur-xs flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-800"
            >
              <ChevronLeft className="w-5 h-5 text-stone-800" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next image"
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-stone-900 border border-stone-200/90 shadow-md backdrop-blur-xs flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-800"
            >
              <ChevronRight className="w-5 h-5 text-stone-800" />
            </button>

            {/* Photo Counter Indicator */}
            <div className="absolute bottom-3 right-3 z-10 px-2.5 py-1 rounded-full text-[11px] font-medium bg-black/60 text-white backdrop-blur-xs tracking-wider select-none">
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
                className={`relative w-20 h-20 rounded border-2 overflow-hidden flex-shrink-0 transition-all cursor-pointer ${
                  isSelected
                    ? "border-amber-800 shadow-xs ring-2 ring-amber-800/40 opacity-100"
                    : "border-stone-200 hover:border-stone-400 opacity-70 hover:opacity-100"
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
