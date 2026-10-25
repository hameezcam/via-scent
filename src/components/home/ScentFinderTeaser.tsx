import Link from "next/link";
import { ArrowRight } from "lucide-react";

/** Homepage prompt for shoppers who don't know where to start. */
export function ScentFinderTeaser() {
  return (
    <section className="bg-[var(--near-black)] text-[var(--porcelain)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="max-w-xl">
          <span className="text-[10px] font-semibold tracking-[0.24em] uppercase text-[var(--champagne)]">Not sure where to start?</span>
          <h2 className="mt-3 font-serif text-[1.75rem] sm:text-4xl font-normal tracking-tight leading-[1.15]">
            Find your scent in under a minute.
          </h2>
          <p className="mt-3 text-sm text-[var(--porcelain)]/70 leading-relaxed">
            Tell us where you want it and what you love, and we&apos;ll match you with the right diffuser, oil or spray.
          </p>
        </div>
        <Link
          href="/scent-finder"
          className="shrink-0 inline-flex items-center justify-center gap-3 px-8 py-4 bg-[var(--porcelain)] text-[var(--near-black)] text-xs font-semibold tracking-[0.2em] uppercase hover:bg-white transition-colors"
        >
          Take the scent finder <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}
