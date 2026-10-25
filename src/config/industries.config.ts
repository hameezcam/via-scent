import type { IndustryType } from "@/types/enquiry";

/** Business sectors shown on the homepage and at /business-scenting/[slug]. */
export interface IndustryPage {
  slug: string;
  title: string;
  /** Pre-selects the industry on the quote form. */
  quoteIndustry: IndustryType;
  cardText: string;
  image: string;
  headline: string;
  intro: string;
  spaces: string[];
  benefits: { title: string; text: string }[];
  setup: string;
}

export const INDUSTRIES: IndustryPage[] = [
  {
    slug: "hotels-resorts",
    title: "Hotels & Resorts",
    quoteIndustry: "hospitality",
    cardText: "A welcoming scent guests remember, from the lobby to the rooms.",
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1600&q=80",
    headline: "A scent your guests remember long after check-out.",
    intro:
      "The first thing guests notice when they walk in is how your hotel smells. We give your lobby, corridors and rooms one signature scent that feels calm, clean and unmistakably yours.",
    spaces: ["Lobby and reception", "Corridors and lifts", "Guest rooms and suites", "Spa, gym and pool areas", "Restaurants and lounges"],
    benefits: [
      { title: "A signature welcome", text: "The same scent greets every guest at the door, day and night." },
      { title: "Fresh, clean air", text: "Keeps damp, cooking and smoke smells out of shared spaces." },
      { title: "No work for your team", text: "We refill the oil and service the machines every month." },
    ],
    setup:
      "Most hotels use one large unit connected to the air-conditioning for the lobby and corridors, plus small standalone diffusers for rooms and the spa.",
  },
  {
    slug: "offices",
    title: "Offices",
    quoteIndustry: "corporate",
    cardText: "A fresh, consistent scent through the air-conditioning, floor by floor.",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80",
    headline: "A fresher office your team and clients will notice.",
    intro:
      "Closed windows and air-conditioning can leave offices feeling stale. A light, clean scent makes reception feel welcoming and keeps meeting rooms and workspaces fresh all day.",
    spaces: ["Reception and waiting areas", "Open-plan workspaces", "Meeting and board rooms", "Washrooms and pantries"],
    benefits: [
      { title: "First impressions", text: "Visitors walk into a reception that feels cared for." },
      { title: "Fresh all day", text: "Runs on a schedule that matches your office hours." },
      { title: "Floor by floor", text: "One unit on the air-conditioning can cover a whole floor." },
    ],
    setup:
      "Offices usually start with a unit connected to the air-conditioning for each floor, or a few standalone diffusers for reception and meeting rooms.",
  },
  {
    slug: "retail-showrooms",
    title: "Retail & Showrooms",
    quoteIndustry: "retail",
    cardText: "A signature scent that makes customers linger and remember your brand.",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=80",
    headline: "Make your store as memorable as what you sell.",
    intro:
      "A signature scent turns a shop into a place customers remember. It makes people feel at home, stay a little longer and connect the smell with your brand.",
    spaces: ["Shop floors", "Fitting rooms", "Car and furniture showrooms", "Pop-ups and exhibition stands"],
    benefits: [
      { title: "Your brand, in scent", text: "Choose a scent that matches your style, and use it in every branch." },
      { title: "Customers stay longer", text: "A pleasant space invites people to browse and come back." },
      { title: "Looks the part", text: "Sleek machines that sit discreetly on the floor or connect to the air-conditioning." },
    ],
    setup:
      "Stores and showrooms usually use one or two floor-standing diffusers sized to the shop floor, or a unit on the air-conditioning for larger spaces.",
  },
  {
    slug: "spas-clinics",
    title: "Spas & Clinics",
    quoteIndustry: "wellness-spa",
    cardText: "Calm, clean air with no residue on surfaces or fabrics.",
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1600&q=80",
    headline: "Calm the moment someone walks in.",
    intro:
      "In a spa or clinic, the air sets the mood before anyone says a word. Our cold-air diffusers fill the space with a soft, clean scent and leave no oily residue on towels, beds or equipment.",
    spaces: ["Reception and waiting rooms", "Treatment and therapy rooms", "Salons and beauty studios", "Dental and medical clinics"],
    benefits: [
      { title: "A calmer welcome", text: "Soft scents help nervous clients relax as they wait." },
      { title: "No residue", text: "A dry mist with no water or heat, so fabrics and surfaces stay clean." },
      { title: "Covers clinical smells", text: "Keeps waiting rooms smelling fresh rather than clinical." },
    ],
    setup:
      "Spas and clinics usually use small, quiet standalone diffusers in each room, with a larger one for the reception area.",
  },
];

export function getIndustry(slug: string): IndustryPage | undefined {
  return INDUSTRIES.find((i) => i.slug === slug);
}
