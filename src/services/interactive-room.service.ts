import fs from "fs";
import path from "path";
import { InteractiveRoomConfig, ScenePreset, InteractiveRoomHotspot } from "../types/interactive-room";
import { productService } from "./product.service";

const DATA_FILE_PATH = path.join(process.cwd(), "src/data/interactive-room.json");

export const SCENE_PRESETS: ScenePreset[] = [
  {
    id: "penthouse-living-room",
    name: "Modern Luxury Penthouse Living Room",
    description: "Spacious open living room with cream boucle curved sofa, oak coffee table, and city views.",
    imageUrl: "/images/home/luxury-living-room.jpg",
    recommendedHotspots: [
      { x: 20.3, y: 64.0, placement: "top-right", label: "Standing Scent Diffuser" },
      { x: 41.2, y: 76.5, placement: "top", label: "Artisanal Candle" },
      { x: 44.2, y: 72.0, placement: "top-left", label: "Reed Diffuser" },
      { x: 86.8, y: 77.0, placement: "left", label: "Side Table Diffuser" },
    ],
  },
  {
    id: "hotel-suite-lounge",
    name: "Architectural Hotel Suite & Bedroom Lounge",
    description: "Evening warm ambient lighting with platform bed, marble coffee table, and modern nebulizer.",
    imageUrl: "/images/home/luxury-bedroom-suite.jpg",
    recommendedHotspots: [
      { x: 25.8, y: 67.5, placement: "top", label: "Lounge Table Candle" },
      { x: 72.8, y: 56.5, placement: "left", label: "Nebulizer Mist Machine" },
      { x: 94.2, y: 67.0, placement: "left", label: "Nightstand Luxury Candle" },
    ],
  },
  {
    id: "minimalist-villa-lounge",
    name: "Travertine Minimalist Villa Lounge",
    description: "Warm daylight through wooden beams with low travertine tables and floor-standing aroma towers.",
    imageUrl: "/images/home/luxury-villa-lounge.jpg",
    recommendedHotspots: [
      { x: 37.5, y: 61.5, placement: "top-right", label: "Patio Stand Diffuser" },
      { x: 47.5, y: 72.5, placement: "top", label: "Reed Diffuser & Candle" },
      { x: 66.0, y: 47.0, placement: "left", label: "Console Diffuser Pedestal" },
      { x: 88.5, y: 65.0, placement: "left", label: "Fireplace Scent Column" },
    ],
  },
];

export const DEFAULT_ROOM_CONFIG: InteractiveRoomConfig = {
  title: "NEW COLLECTION",
  subtitle:
    "The latest arrivals at Dr. Scent fragrances include a variety of scents, sprays and diffuser machines for your home, office, car or commercial space.",
  badgeText: "INTERACTIVE SHOWCASE",
  imageUrl: "/images/home/luxury-living-room.jpg",
  helperText: "Click any hotspot on the room to inspect and shop Dr. Scent instruments",
  sceneTheme: "Modern Luxury Penthouse",
  lastGeneratedAt: new Date().toISOString(),
  generatedPrompt:
    "Ultra-luxurious, modern minimalist penthouse living room with Dr. Scent cold-air aroma diffusers, artisanal soy candle, and botanical reed diffusers.",
  hotspots: [
    {
      id: "hotspot-tower",
      productId: "dr-scent-smart-tower-pro",
      productSlug: "dr-scent-smart-tower-pro",
      productName: "Standalone Scent Diffuser Machine – Sleek Design & German Nano Technology",
      productPriceLKR: 68500,
      productImage: "/images/categories/aroma-diffusers.jpg",
      categoryName: "Aroma Diffusers",
      x: 20.3,
      y: 64.0,
      placement: "top-right",
      label: "Standing Diffuser Tower",
      enabled: true,
    },
    {
      id: "hotspot-candle",
      productId: "dr-scent-hand-poured-artisanal-candle",
      productSlug: "dr-scent-hand-poured-artisanal-candle",
      productName: "Dr. Scent Hand-Poured Artisanal Soy Candle & Reed Set",
      productPriceLKR: 9500,
      productImage: "/images/categories/candles.jpg",
      categoryName: "Candles",
      x: 41.2,
      y: 76.5,
      placement: "top",
      label: "Artisanal Candle",
      enabled: true,
    },
    {
      id: "hotspot-reed",
      productId: "dr-scent-continuous-aerosol-spray",
      productSlug: "dr-scent-continuous-aerosol-spray",
      productName: "Dr. Scent Continuous Ambient Aerosol Mist",
      productPriceLKR: 7900,
      productImage: "/images/categories/sprays.jpg",
      categoryName: "Sprays",
      x: 44.2,
      y: 72.0,
      placement: "top-left",
      label: "Reed Diffuser & Mist",
      enabled: true,
    },
    {
      id: "hotspot-portable",
      productId: "dr-scent-luxe-portable-diffuser",
      productSlug: "dr-scent-luxe-portable-diffuser",
      productName: "Dr. Scent Portable Ambient Diffuser & Pure Oil",
      productPriceLKR: 28500,
      productImage: "/images/categories/fragrance-oils.jpg",
      categoryName: "Aroma Diffusers",
      x: 86.8,
      y: 77.0,
      placement: "left",
      label: "Ultrasonic Aroma Diffuser",
      enabled: true,
    },
  ],
};

class InteractiveRoomService {
  private inMemoryConfig: InteractiveRoomConfig | null = null;

  public async getConfig(): Promise<InteractiveRoomConfig> {
    if (this.inMemoryConfig) {
      return this.syncWithProducts(this.inMemoryConfig);
    }

    try {
      if (fs.existsSync(DATA_FILE_PATH)) {
        const fileContent = fs.readFileSync(DATA_FILE_PATH, "utf-8");
        const parsed = JSON.parse(fileContent) as InteractiveRoomConfig;
        this.inMemoryConfig = parsed;
        return this.syncWithProducts(parsed);
      }
    } catch (error) {
      console.error("[InteractiveRoomService] Failed reading config file, using default:", error);
    }

    this.inMemoryConfig = DEFAULT_ROOM_CONFIG;
    return this.syncWithProducts(DEFAULT_ROOM_CONFIG);
  }

  public async updateConfig(partial: Partial<InteractiveRoomConfig>): Promise<InteractiveRoomConfig> {
    const current = await this.getConfig();
    const updated: InteractiveRoomConfig = {
      ...current,
      ...partial,
      hotspots: partial.hotspots ?? current.hotspots,
    };

    const synced = await this.syncWithProducts(updated);
    this.inMemoryConfig = synced;

    try {
      fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(synced, null, 2), "utf-8");
    } catch (error) {
      console.error("[InteractiveRoomService] Failed saving config file:", error);
    }

    return synced;
  }

  public async recreateWithProducts(
    productIds: string[],
    presetThemeId?: string,
    customInstructions?: string,
    geminiApiKey?: string
  ): Promise<InteractiveRoomConfig> {
    const allProducts = await productService.getAll();
    const selected = allProducts.filter((p) => productIds.includes(p.id) || productIds.includes(p.slug));

    // Dynamic generation using Gemini AI or Sharp visual compositor
    const { generateRoomWithProducts } = await import("./gemini-room-generator.service");
    const genResult = await generateRoomWithProducts({
      products: selected,
      presetId: presetThemeId,
      customPrompt: customInstructions,
      geminiApiKey,
    });

    return this.updateConfig({
      imageUrl: genResult.imageUrl,
      sceneTheme: presetThemeId || "Modern Luxury Penthouse",
      generatedPrompt: genResult.promptUsed,
      lastGeneratedAt: new Date().toISOString(),
      hotspots: genResult.hotspots,
    });
  }

  /**
   * Keep product prices, titles, and images in sync with the live catalog
   */
  private async syncWithProducts(config: InteractiveRoomConfig): Promise<InteractiveRoomConfig> {
    try {
      const allProducts = await productService.getAll();
      const updatedHotspots = config.hotspots.map((h) => {
        const matched = allProducts.find((p) => p.id === h.productId || p.slug === h.productSlug);
        if (!matched) return h;
        return {
          ...h,
          productId: matched.id,
          productSlug: matched.slug,
          productName: matched.name,
          productPriceLKR: matched.basePriceLKR,
          productImage: matched.images?.[0] || h.productImage,
          categoryName: matched.categoryName || h.categoryName,
        };
      });

      return {
        ...config,
        hotspots: updatedHotspots,
      };
    } catch {
      return config;
    }
  }
}

export const interactiveRoomService = new InteractiveRoomService();
