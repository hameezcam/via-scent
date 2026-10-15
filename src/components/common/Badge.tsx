import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "gold" | "stone" | "dark" | "outline" | "sale";
  className?: string;
}

export function Badge({ children, variant = "stone", className = "" }: BadgeProps) {
  const base = "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider";

  const variants = {
    gold: "bg-amber-100 text-amber-950 border border-amber-300/80",
    stone: "bg-stone-100 text-stone-700 border border-stone-200",
    dark: "bg-stone-900 text-stone-100 border border-stone-800",
    outline: "bg-transparent text-stone-700 border border-stone-300",
    sale: "bg-rose-50 text-rose-800 border border-rose-200",
  };

  return <span className={`${base} ${variants[variant]} ${className}`}>{children}</span>;
}
