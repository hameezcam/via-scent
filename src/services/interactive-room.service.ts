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
    "Discover the fragrances that transform your space. Explore our collection of home fragrances, diffusers and room sprays.",
  badgeText: "INTERACTIVE SHOWCASE",
  imageUrl: "/images/home/luxury-living-room.jpg",
  helperText: "Click any hotspot on the room to inspect and shop Dr. Scent instruments",
  sceneTheme: "Modern Luxury Penthouse",
  lastGeneratedAt: new Date().toISOString(),
  generatedPrompt:
    "Ultra-luxurious, modern minimalist penthouse living room with Dr. Scent cold-air aroma diffusers, artisanal soy candle, and botanical reed diffusers.",
  hotspots: [
    {
      id: "hotspot-sovereign-gold",
      productId: "prod-1792242015190",
      productSlug: "dr-scent-sovereign-gold-diffuser",
      productName: "Dr. Scent Sovereign Gold Diffuser",
      productPriceLKR: 89000,
      productImage: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=1200",
      categoryName: "Aroma Diffusers",
      x: 20.3,
      y: 64.0,
      placement: "top-right",
      label: "Floor Standing Scent Column",
      enabled: true,
    },
    {
      id: "hotspot-ceramic-nebulizer",
      productId: "prod-home-01",
      productSlug: "luxe-acoustic-ceramic-nebulizer",
      productName: "Architectural Ceramic Nebulizer",
      productPriceLKR: 34500,
      productImage: "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1000&q=85",
      categoryName: "Home Fragrance",
      x: 41.2,
      y: 76.5,
      placement: "top",
      label: "Coffee Table Ceramic Nebulizer",
      enabled: true,
    },
    {
      id: "hotspot-ceylon-oud-oil",
      productId: "prod-oil-01",
      productSlug: "ceylon-oud-and-smoky-amber-oil",
      productName: "Royal Oud & Amber Noir",
      productPriceLKR: 12500,
      productImage: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1000&q=85",
      categoryName: "Fragrance Oils",
      x: 45.2,
      y: 72.0,
      placement: "top-left",
      label: "Artisanal Pure Fragrance Oil",
      enabled: true,
    },
    {
      id: "hotspot-aura-halo",
      productId: "prod-1792237283061",
      productSlug: "dr-scent-aura-halo-diffuser",
      productName: "Dr. Scent Aura Halo Diffuser",
      productPriceLKR: 100000,
      productImage: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=1200",
      categoryName: "Aroma Diffusers",
      x: 86.8,
      y: 77.0,
      placement: "left",
      label: "Side Table Ambient Diffuser",
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
