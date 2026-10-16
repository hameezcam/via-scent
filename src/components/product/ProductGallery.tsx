"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/common/Badge";
import { ShieldCheck } from "lucide-react";

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

  const displayImages = images.length > 0 ? images : ["/placeholder.jpg"];
  const currentImage = displayImages[activeImageIndex] || displayImages[0];

  return (
    <div className="space-y-4">
      {/* Main Image Frame */}
      <div className="relative aspect-[4/5] sm:aspect-square w-full rounded-lg overflow-hidden bg-stone-100 border border-stone-200">
        <Image
          src={currentImage}
          alt={`${productName} - View ${activeImageIndex + 1}`}
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
      </div>

      {/* Thumbnails */}
      {displayImages.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1" role="tablist" aria-label="Product image thumbnails">
          {displayImages.map((img, idx) => {
            const isSelected = idx === activeImageIndex;
            return (
              <button
                key={idx}
                type="button"
                role="tab"
                aria-selected={isSelected}
                aria-label={`View image ${idx + 1}`}
                onClick={() => setActiveImageIndex(idx)}
                className={`relative w-20 h-20 rounded border-2 overflow-hidden flex-shrink-0 transition-all ${
                  isSelected
                    ? "border-amber-800 shadow-xs ring-1 ring-amber-800"
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
