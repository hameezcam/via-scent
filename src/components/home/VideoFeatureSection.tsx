"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import { motion } from "motion/react";
import { LUXURY_EASE } from "@/config/motion.config";

const YOUTUBE_ID = "dTJE8x7mR7w";

const POINTS = [
  { title: "Whisper quiet", text: "Runs silently in the background" },
  { title: "No water, no heat", text: "Pure oil, turned into a dry mist" },
  { title: "Any size of space", text: "From a bedroom to a hotel lobby" },
];

/**
 * Homepage film of a Dr. Scent diffuser. Shows the YouTube thumbnail with a play
 * button and only loads the player when clicked, so the page stays fast.
 */
export function VideoFeatureSection() {
  const [playing, setPlaying] = useState(false);
  const [poster, setPoster] = useState(`https://i.ytimg.com/vi/${YOUTUBE_ID}/maxresdefault.jpg`);
  const fallbackPoster = `https://i.ytimg.com/vi/${YOUTUBE_ID}/hqdefault.jpg`;

  return (
    <section
      aria-labelledby="video-feature-heading"
      className="relative overflow-hidden bg-[var(--near-black)] text-[var(--porcelain)]"
    >
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 grid gap-10 lg:gap-16 lg:grid-cols-12 lg:items-center">
        {/* Film */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8, ease: LUXURY_EASE }}
          className="lg:col-span-7 lg:order-2"
        >
          <div className="relative aspect-video overflow-hidden bg-black ring-1 ring-[var(--champagne)]/25 shadow-2xl">
            {playing ? (
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${YOUTUBE_ID}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
                title="Dr. Scent diffuser in action"
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            ) : (
              <button
                type="button"
                onClick={() => setPlaying(true)}
                aria-label="Play the film"
                className="group absolute inset-0 w-full h-full cursor-pointer"
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- YouTube thumbnail, swapped on error */}
                <img
                  src={poster}
                  alt=""
                  loading="lazy"
                  onLoad={(e) => {
                    // YouTube answers a missing HD thumbnail with a 120px placeholder
                    if (e.currentTarget.naturalWidth <= 120 && poster !== fallbackPoster) setPoster(fallbackPoster);
                  }}
                  onError={() => poster !== fallbackPoster && setPoster(fallbackPoster)}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.03]"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/20" />
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="relative flex items-center justify-center">
                    <span className="absolute w-24 h-24 sm:w-28 sm:h-28 rounded-full border border-white/40 animate-ping [animation-duration:2.4s]" />
                    <span className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/95 text-[var(--near-black)] flex items-center justify-center shadow-xl transition-transform duration-500 group-hover:scale-105">
                      <Play className="w-7 h-7 sm:w-8 sm:h-8 ml-1 fill-current" strokeWidth={1} />
                    </span>
                  </span>
                </span>
                <span className="absolute left-4 bottom-4 sm:left-6 sm:bottom-6 text-[10px] sm:text-xs font-medium tracking-[0.24em] uppercase text-white/90">
                  Watch the film
                </span>
              </button>
            )}
          </div>
        </motion.div>

        {/* Pitch */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8, delay: 0.1, ease: LUXURY_EASE }}
          className="lg:col-span-5 lg:order-1"
        >
          <span className="text-[10px] font-semibold tracking-[0.24em] uppercase text-[var(--champagne)]">
            See it in action
          </span>
          <h2
            id="video-feature-heading"
            className="mt-3 font-serif text-[2rem] sm:text-5xl font-normal tracking-tight leading-[1.08]"
          >
            Effortless scent, <em className="italic text-[var(--champagne)]">all day long.</em>
          </h2>
          <p className="mt-5 text-sm sm:text-base text-[var(--porcelain)]/70 leading-relaxed max-w-md">
            A Dr. Scent diffuser turns pure fragrance oil into a fine, dry mist that fills the whole room evenly. Set it once and it looks after itself.
          </p>

          <ul className="mt-8 border-t border-white/10">
            {POINTS.map((point) => (
              <li key={point.title} className="flex items-baseline justify-between gap-4 py-4 border-b border-white/10">
                <span className="font-serif text-lg">{point.title}</span>
                <span className="text-xs text-[var(--porcelain)]/60 text-right">{point.text}</span>
              </li>
            ))}
          </ul>

          <div className="mt-10 flex flex-col sm:flex-row gap-3">
            <Link
              href="/shop/aroma-diffusers"
              className="inline-flex items-center justify-center gap-2 px-7 py-4 bg-[var(--porcelain)] text-[var(--near-black)] text-xs font-semibold tracking-[0.18em] uppercase hover:bg-white transition-colors"
            >
              Shop diffusers <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/scent-finder"
              className="inline-flex items-center justify-center px-7 py-4 border border-white/30 text-xs font-medium tracking-[0.18em] uppercase hover:border-white transition-colors"
            >
              Help me choose
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
