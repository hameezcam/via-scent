"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RotateCcw } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Note: Do not log sensitive user info
    console.error("Storefront Application Error caught by boundary:", error.message);
  }, [error]);

  return (
    <div className="py-20 sm:py-32 bg-[#FAF8F5] min-h-[70vh] flex items-center justify-center">
      <div className="max-w-md mx-auto px-4 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-red-50 border border-red-200 text-red-700 mx-auto flex items-center justify-center">
          <AlertCircle className="w-8 h-8 stroke-[1.5]" />
        </div>

        <div className="space-y-2">
          <span className="text-xs uppercase tracking-widest font-semibold text-red-700">
            System Notice
          </span>
          <h1 className="font-serif text-3xl font-medium text-stone-900">
            An Unexpected Disruption Occurred
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            We apologize for the inconvenience. Our technical team has been alerted. Please try refreshing the view.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto px-6 py-3 bg-stone-900 text-amber-100 text-xs uppercase tracking-wider font-semibold rounded hover:bg-stone-800 transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3 border border-stone-300 text-stone-700 text-xs uppercase tracking-wider font-semibold rounded hover:bg-stone-50 transition-colors"
          >
            Return to Storefront
          </Link>
        </div>
      </div>
    </div>
  );
}
