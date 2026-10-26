import React from "react";
import Link from "next/link";
import { ArrowRight, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="py-20 sm:py-32 bg-[#FAF8F5] min-h-[70vh] flex items-center justify-center">
      <div className="max-w-md mx-auto px-4 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 text-amber-800 mx-auto flex items-center justify-center">
          <Compass className="w-8 h-8 stroke-[1.5]" />
        </div>

        <div className="space-y-2">
          <span className="text-xs uppercase tracking-widest font-semibold text-amber-800">
            Error 404
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-stone-900 font-medium">
            We can&apos;t find that page
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            The page or product you are looking for may have moved or is no longer available.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/shop"
            className="w-full sm:w-auto px-6 py-3 bg-stone-900 text-amber-100 text-xs uppercase tracking-wider font-semibold rounded hover:bg-stone-800 transition-colors flex items-center justify-center gap-2"
          >
            <span>Browse the shop</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3 border border-stone-300 text-stone-700 text-xs uppercase tracking-wider font-semibold rounded hover:bg-stone-50 transition-colors"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
