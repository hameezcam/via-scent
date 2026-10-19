export interface InteractiveRoomHotspot {
  id: string;
  productId: string;
  productSlug: string;
  productName: string;
  productPriceLKR: number;
  productImage: string;
  categoryName: string;
  x: number; // percentage (0 - 100)
  y: number; // percentage (0 - 100)
  placement: "top" | "top-left" | "top-right" | "left" | "right";
  label?: string;
  enabled: boolean;
}

export interface InteractiveRoomConfig {
  title: string;
  subtitle: string;
  badgeText: string;
  imageUrl: string;
  helperText: string;
  hotspots: InteractiveRoomHotspot[];
  lastGeneratedAt?: string;
  generatedPrompt?: string;
  sceneTheme?: string;
}

export interface ScenePreset {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  recommendedHotspots: Partial<InteractiveRoomHotspot>[];
}
