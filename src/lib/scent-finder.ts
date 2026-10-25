import type { Product, ScentFamily } from "@/types/product";

/**
 * Scent finder: turns a few quiz answers into product picks from the live catalogue.
 * Pure functions so the logic can be tested without a browser.
 */

export type FinderSpace = "home" | "car" | "business" | "gift";
export type FinderSize = "small" | "medium" | "large";
export type FinderMood = "fresh" | "floral" | "warm" | "fruity";
export type FinderGoal = "diffuser" | "oil" | "spray" | "odor";

export interface FinderAnswers {
  space: FinderSpace;
  size?: FinderSize;
  mood: FinderMood;
  goal?: FinderGoal;
}

export interface FinderPick {
  product: Product;
  reason: string;
}

const MOOD_FAMILIES: Record<FinderMood, ScentFamily[]> = {
  fresh: ["fresh", "citrus"],
  floral: ["floral"],
  warm: ["woody", "oriental", "amber", "gourmand"],
  fruity: ["fruity", "fb"],
};

const MOOD_KEYWORDS: Record<FinderMood, RegExp> = {
  fresh: /citrus|lemon|lime|bergamot|mandarin|tea|marine|sea|ocean|fresh|mint|cotton|green|aquatic/i,
  floral: /floral|flower|jasmine|rose|lily|tulip|lavender|blossom|flora|peony|orchid/i,
  warm: /oud|amber|sandal|santal|wood|cedar|patchouli|vanilla|musk|leather|spice|cardamom|tonka/i,
  fruity: /fruit|berry|framboise|papaya|fig|apple|peach|mango|pear|cherry|melon/i,
};

export const MOOD_LABELS: Record<FinderMood, string> = {
  fresh: "fresh and clean",
  floral: "floral",
  warm: "warm and woody",
  fruity: "fruity and sweet",
};

const SIZE_SQFT: Record<FinderSize, { min: number; label: string }> = {
  small: { min: 0, label: "a bedroom or small room" },
  medium: { min: 400, label: "a living area" },
  large: { min: 1200, label: "a large open space" },
};

const isBuyable = (p: Product) => p.isPublished !== false && !p.isArchived && p.inStock !== false;
const hasPrice = (p: Product) => (p.variants[0]?.priceLKR ?? p.basePriceLKR) > 0;
const isCarProduct = (p: Product) => /\bcar\b|vehicle|vent/i.test(`${p.name} ${p.tagline} ${p.subCategory ?? ""}`);
const isMachine = (p: Product) =>
  ["aroma-diffusers", "home-fragrance", "commercial-scenting"].includes(p.category) &&
  !/oil\b/i.test(p.name) &&
  !/dispenser|aerosol/i.test(`${p.name} ${p.subCategory ?? ""}`);
const isOdorSpray = (p: Product) => p.category === "sprays" && /odou?r/i.test(`${p.name} ${p.subCategory ?? ""}`);

/** Square feet a diffuser covers, read from text like "Up to 8,611 sq.ft (800 m²)". */
export function coverageSqft(product: Product): number | null {
  const text = product.coverageArea ?? product.specifications.find((s) => /coverage/i.test(s.label))?.value ?? "";
  const sqft = /([\d,]+)\s*sq\.?\s*ft/i.exec(text);
  if (sqft) return Number(sqft[1].replace(/,/g, ""));
  const m2 = /([\d,]+)\s*m²|([\d,]+)\s*m2/i.exec(text);
  if (m2) return Math.round(Number((m2[1] ?? m2[2]).replace(/,/g, "")) * 10.764);
  return null;
}

function moodScore(product: Product, mood: FinderMood): number {
  let score = 0;
  if (product.scentFamily && MOOD_FAMILIES[mood].includes(product.scentFamily)) score += 3;
  const notes = product.scentNotes ? [...product.scentNotes.top, ...product.scentNotes.heart, ...product.scentNotes.base].join(" ") : "";
  const matches = `${product.name} ${product.tagline} ${notes}`.match(new RegExp(MOOD_KEYWORDS[mood].source, "gi"));
  score += Math.min(matches?.length ?? 0, 3);
  return score;
}

/** Small tie-breaker so priced, popular items come first. */
function appeal(product: Product): number {
  return (hasPrice(product) ? 2 : 0) + (product.isBestseller ? 1 : 0) + (product.featured ? 0.5 : 0);
}

function rankByMood(products: Product[], mood: FinderMood): Product[] {
  return [...products].sort((a, b) => moodScore(b, mood) - moodScore(a, mood) || appeal(b) - appeal(a));
}

function scentReason(product: Product, mood: FinderMood): string {
  return moodScore(product, mood) > 0
    ? `A ${MOOD_LABELS[mood]} scent: ${product.tagline}`.replace(/\.\s*$/, "")
    : product.tagline;
}

/** Picks the diffuser that covers the space with the least excess. */
function pickMachine(machines: Product[], size: FinderSize): FinderPick | null {
  const need = SIZE_SQFT[size].min;
  const sized = machines
    .map((p) => ({ p, sqft: coverageSqft(p) }))
    .filter((m): m is { p: Product; sqft: number } => m.sqft !== null && m.sqft >= need)
    .sort((a, b) => Number(hasPrice(b.p)) - Number(hasPrice(a.p)) || a.sqft - b.sqft);
  const choice = sized[0]?.p ?? [...machines].sort((a, b) => appeal(b) - appeal(a))[0];
  if (!choice) return null;
  const sqft = coverageSqft(choice);
  return {
    product: choice,
    reason: sqft
      ? `Covers up to ${sqft.toLocaleString("en-LK")} sq ft, right for ${SIZE_SQFT[size].label}.`
      : `A good fit for ${SIZE_SQFT[size].label}.`,
  };
}

export function recommendProducts(catalogue: Product[], answers: FinderAnswers, limit = 3): FinderPick[] {
  const products = catalogue.filter(isBuyable);
  const { mood } = answers;
  const oils = products.filter((p) => p.category === "fragrance-oils");
  const sprays = products.filter((p) => p.category === "sprays" && !isOdorSpray(p));
  const odorSprays = products.filter(isOdorSpray);
  const machines = products.filter((p) => isMachine(p) && !isCarProduct(p));
  const picks: FinderPick[] = [];
  const add = (items: Product[], reason: (p: Product) => string, max: number) => {
    for (const p of items) {
      if (picks.length >= limit || max <= 0) break;
      if (picks.some((pick) => pick.product.id === p.id)) continue;
      picks.push({ product: p, reason: reason(p) });
      max--;
    }
  };

  switch (answers.space) {
    case "car": {
      const car = products.filter((p) => isCarProduct(p) && p.category !== "sprays");
      add([...car].sort((a, b) => appeal(b) - appeal(a)), () => "Made for cars: clips on or plugs in and runs quietly while you drive.", 1);
      add(rankByMood(oils, mood), (p) => scentReason(p, mood), limit);
      break;
    }
    case "business": {
      const machine = pickMachine(machines, answers.size ?? "large");
      if (machine) picks.push(machine);
      add(rankByMood(oils, mood), (p) => scentReason(p, mood), limit);
      break;
    }
    case "gift": {
      const gifts = products.filter((p) => ["gift-collections", "candles", "reed-diffusers"].includes(p.category));
      add([...gifts].sort((a, b) => moodScore(b, mood) - moodScore(a, mood) || appeal(b) - appeal(a)), (p) =>
        p.category === "gift-collections" ? "A ready-made gift set, easy to love." : `No machine needed: ${p.tagline}`.replace(/\.\s*$/, ""), 2);
      add(rankByMood([...oils, ...sprays], mood), (p) => scentReason(p, mood), limit);
      break;
    }
    default: {
      const goal = answers.goal ?? "diffuser";
      if (goal === "diffuser") {
        const machine = pickMachine(machines, answers.size ?? "medium");
        if (machine) picks.push(machine);
        add(rankByMood(oils, mood), (p) => scentReason(p, mood), limit);
      } else if (goal === "oil") {
        add(rankByMood(oils, mood), (p) => scentReason(p, mood), limit);
      } else if (goal === "spray") {
        add(rankByMood(sprays, mood), (p) => scentReason(p, mood), limit);
      } else {
        add(rankByMood(odorSprays, mood), (p) => `${p.tagline}`.replace(/\.\s*$/, ""), limit);
      }
    }
  }

  // Never come back empty: fill with the closest scent matches across the range
  if (picks.length < limit) {
    add(rankByMood([...oils, ...sprays], mood), (p) => scentReason(p, mood), limit);
  }
  return picks.slice(0, limit);
}
