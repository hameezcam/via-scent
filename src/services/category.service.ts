import fs from "fs";
import path from "path";
import { Category, CategoryInput } from "@/types/category";
import { isPostgresConfigured, getDb, ensureDbInitialized } from "@/lib/db";

const CATEGORIES_FILE_PATH = path.join(process.cwd(), "src/data/categories.json");

const DEFAULT_CATEGORIES: Category[] = [
  {
    id: "aroma-diffusers",
    slug: "aroma-diffusers",
    name: "Diffuser",
    tagline: "Cold-Air Micro-Nebulization Technology",
    description: "Waterless, heatless cold-air diffusers, car nebulizers, automated dispensers, and architectural reed diffusers.",
    image: "/images/categories/aroma-diffusers.jpg",
    featuredInHome: true,
    displayOrder: 1,
    subCategories: [
      { id: "diffuser", label: "Diffuser" },
      { id: "car-diffuser", label: "Car Diffuser" },
      { id: "dispenser", label: "Dispenser" },
      { id: "reed-diffuser", label: "Reed Diffuser" },
    ],
    createdAt: "2026-10-18T10:00:00.000Z",
    updatedAt: "2026-10-18T10:00:00.000Z",
  },
  {
    id: "fragrance-oils",
    slug: "fragrance-oils",
    name: "Aroma Oil",
    tagline: "Pure Essential & Artisanal Perfume Blends",
    description: "Formulated for cold-air diffusion with verified IFRA standards, evoking timeless botanical, fresh, and oriental profiles.",
    image: "/images/categories/fragrance-oils.jpg",
    featuredInHome: true,
    displayOrder: 2,
    subCategories: [
      { id: "car-scent", label: "Car Scent" },
      { id: "choice", label: "Dr. Scent's Choice" },
      { id: "fb", label: "F&B" },
      { id: "floral", label: "Floral" },
      { id: "fresh", label: "Fresh" },
      { id: "fruity", label: "Fruity" },
      { id: "oriental", label: "Oriental" },
      { id: "premium", label: "Premium Collection" },
    ],
    createdAt: "2026-10-18T10:00:00.000Z",
    updatedAt: "2026-10-18T10:00:00.000Z",
  },
  {
    id: "best-sellers",
    slug: "best-sellers",
    name: "Best Sellers",
    tagline: "Iconic Signature Creations",
    description: "Our most celebrated cold-air diffusers, signature aroma oils, ambient sprays, reed diffusers, and luxury candles.",
    image: "/images/categories/bestsellers.jpg",
    featuredInHome: true,
    displayOrder: 3,
    subCategories: [
      { id: "diffusers", label: "Diffusers" },
      { id: "aroma-oils", label: "Aroma Oils" },
      { id: "sprays", label: "Sprays" },
      { id: "reed-diffusers", label: "Reed Diffusers" },
      { id: "candles", label: "Candles" },
    ],
    createdAt: "2026-10-18T10:00:00.000Z",
    updatedAt: "2026-10-18T10:00:00.000Z",
  },
  {
    id: "sprays",
    slug: "sprays",
    name: "Sprays",
    tagline: "Fine-Mist Ambient & Textile Scenting",
    description: "Instantaneous, residue-free fabric sprays, organic odor eliminators, and aerosol ambient mists with Dr. Scent fragrances.",
    image: "/images/categories/sprays.jpg",
    featuredInHome: true,
    displayOrder: 4,
    subCategories: [
      { id: "fabric-spray", label: "Fabric Spray" },
      { id: "odor-eliminator", label: "Odor Eliminator" },
      { id: "aerosol", label: "Aerosol" },
    ],
    createdAt: "2026-10-18T10:00:00.000Z",
    updatedAt: "2026-10-18T10:00:00.000Z",
  },
  {
    id: "candles",
    slug: "candles",
    name: "Candles",
    tagline: "Hand-Poured Botanical & Soy Wax Candles",
    description: "Artisanal scented candles crafted with pure soy and coconut wax, cotton wicks, and Dr. Scent fragrances for warm ambient illumination.",
    image: "/images/categories/candles.jpg",
    featuredInHome: true,
    displayOrder: 5,
    subCategories: [
      { id: "scented-candle", label: "Scented Candle" },
      { id: "soy-wax", label: "Soy Wax Candle" },
      { id: "luxury-3-wick", label: "Luxury 3-Wick" },
    ],
    createdAt: "2026-10-18T10:00:00.000Z",
    updatedAt: "2026-10-18T10:00:00.000Z",
  },
];

let memoryCategories: Category[] | null = null;

function parseCategoryRow(row: Record<string, any>): Category {
  if (row.data) {
    try {
      const parsed = typeof row.data === "string" ? JSON.parse(row.data) : row.data;
      return {
        ...parsed,
        id: row.id || parsed.id,
        name: row.name || parsed.name,
        slug: row.slug || parsed.slug,
      };
    } catch {
      // fallback
    }
  }
  return row as unknown as Category;
}

export class CategoryService {
  private async ensureCategoryTable(): Promise<void> {
    if (!isPostgresConfigured()) return;
    try {
      await ensureDbInitialized();
      const sql = getDb()!;
      await sql`
        CREATE TABLE IF NOT EXISTS categories (
          id VARCHAR(100) PRIMARY KEY,
          slug VARCHAR(120) NOT NULL,
          name VARCHAR(255) NOT NULL,
          tagline TEXT,
          description TEXT,
          image TEXT NOT NULL,
          featured_in_home BOOLEAN DEFAULT false,
          display_order INT DEFAULT 0,
          data JSONB NOT NULL,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
      `;
    } catch (err) {
      console.error("[CategoryService] PostgreSQL ensureCategoryTable error:", err);
    }
  }

  private readLocalJson(): Category[] {
    try {
      if (!fs.existsSync(CATEGORIES_FILE_PATH)) {
        this.writeLocalJson(DEFAULT_CATEGORIES);
        return [...DEFAULT_CATEGORIES];
      }
      const raw = fs.readFileSync(CATEGORIES_FILE_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        memoryCategories = parsed;
        return parsed;
      }
      return [...DEFAULT_CATEGORIES];
    } catch (err) {
      console.error("[CategoryService] Error reading categories.json:", err);
      if (memoryCategories && memoryCategories.length > 0) {
        return memoryCategories;
      }
      return [...DEFAULT_CATEGORIES];
    }
  }

  private writeLocalJson(data: Category[]): void {
    try {
      memoryCategories = data;
      const dir = path.dirname(CATEGORIES_FILE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(CATEGORIES_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
    } catch (err) {
      console.error("[CategoryService] Error writing categories.json:", err);
    }
  }

  async getAll(): Promise<Category[]> {
    if (isPostgresConfigured()) {
      try {
        await this.ensureCategoryTable();
        const sql = getDb()!;
        const rows = await sql`
          SELECT * FROM categories
          ORDER BY display_order ASC, name ASC;
        `;
        if (rows && rows.length > 0) {
          const loaded = rows.map(parseCategoryRow);
          this.writeLocalJson(loaded);
          return loaded;
        }
      } catch (err) {
        console.error("[CategoryService] PostgreSQL getAll error:", err);
      }
    }

    const current = this.readLocalJson();
    return current.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  }

  async getFeaturedInHome(): Promise<Category[]> {
    const all = await this.getAll();
    return all.filter((c) => c.featuredInHome);
  }

  async getById(idOrSlug: string): Promise<Category | null> {
    const normalized = idOrSlug.trim().toLowerCase();
    
    // Support known aliases
    const canonical =
      normalized === "aroma-oil"
        ? "fragrance-oils"
        : normalized === "diffuser"
        ? "aroma-diffusers"
        : normalized === "bestsellers"
        ? "best-sellers"
        : normalized;

    const all = await this.getAll();
    const found = all.find(
      (c) =>
        c.id.toLowerCase() === canonical ||
        c.slug.toLowerCase() === canonical ||
        c.id.toLowerCase() === normalized ||
        c.slug.toLowerCase() === normalized
    );

    return found ? { ...found } : null;
  }

  async create(input: CategoryInput, _adminUser = "admin@viascent.lk"): Promise<Category> {
    const rawSlug = input.slug?.trim() || input.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const slug = rawSlug.replace(/^-+|-+$/g, "");
    const id = input.id?.trim() || slug;

    const all = await this.getAll();
    if (all.some((c) => c.id.toLowerCase() === id.toLowerCase() || c.slug.toLowerCase() === slug.toLowerCase())) {
      throw new Error(`A category with ID or slug "${slug}" already exists. Please choose a unique name or slug.`);
    }

    const now = new Date().toISOString();
    const newCategory: Category = {
      id,
      slug,
      name: input.name.trim(),
      tagline: input.tagline?.trim() || "",
      description: input.description?.trim() || "",
      image: input.image?.trim() || "/images/categories/candles.jpg",
      featuredInHome: Boolean(input.featuredInHome),
      displayOrder: Number(input.displayOrder) || all.length + 1,
      subCategories: input.subCategories || [],
      href: input.href || `/shop/${slug}`,
      createdAt: now,
      updatedAt: now,
    };

    if (isPostgresConfigured()) {
      try {
        await this.ensureCategoryTable();
        const sql = getDb()!;
        await sql`
          INSERT INTO categories (
            id, slug, name, tagline, description, image,
            featured_in_home, display_order, data, created_at, updated_at
          ) VALUES (
            ${newCategory.id},
            ${newCategory.slug},
            ${newCategory.name},
            ${newCategory.tagline},
            ${newCategory.description},
            ${newCategory.image},
            ${newCategory.featuredInHome},
            ${newCategory.displayOrder},
            ${JSON.stringify(newCategory)},
            ${newCategory.createdAt},
            ${newCategory.updatedAt}
          );
        `;
      } catch (err) {
        console.error("[CategoryService] PostgreSQL create error:", err);
      }
    }

    const current = this.readLocalJson();
    current.push(newCategory);
    this.writeLocalJson(current);

    return newCategory;
  }

  async update(id: string, updates: Partial<Category>, _adminUser = "admin@viascent.lk"): Promise<Category> {
    const existing = await this.getById(id);
    if (!existing) {
      throw new Error(`Category with id "${id}" not found.`);
    }

    const updated: Category = {
      ...existing,
      ...updates,
      id: existing.id, // Immutable ID
      slug: updates.slug !== undefined ? updates.slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-") : existing.slug,
      name: updates.name !== undefined ? updates.name.trim() : existing.name,
      tagline: updates.tagline !== undefined ? updates.tagline.trim() : existing.tagline,
      description: updates.description !== undefined ? updates.description.trim() : existing.description,
      image: updates.image !== undefined ? updates.image.trim() : existing.image,
      featuredInHome: updates.featuredInHome !== undefined ? Boolean(updates.featuredInHome) : existing.featuredInHome,
      displayOrder: updates.displayOrder !== undefined ? Number(updates.displayOrder) : existing.displayOrder,
      subCategories: updates.subCategories !== undefined ? updates.subCategories : existing.subCategories,
      href: updates.href !== undefined ? updates.href : existing.href,
      updatedAt: new Date().toISOString(),
    };

    if (isPostgresConfigured()) {
      try {
        await this.ensureCategoryTable();
        const sql = getDb()!;
        await sql`
          UPDATE categories SET
            slug = ${updated.slug},
            name = ${updated.name},
            tagline = ${updated.tagline},
            description = ${updated.description},
            image = ${updated.image},
            featured_in_home = ${updated.featuredInHome},
            display_order = ${updated.displayOrder},
            data = ${JSON.stringify(updated)},
            updated_at = ${updated.updatedAt}
          WHERE id = ${existing.id};
        `;
      } catch (err) {
        console.error("[CategoryService] PostgreSQL update error:", err);
      }
    }

    const current = this.readLocalJson();
    const idx = current.findIndex((c) => c.id === existing.id || c.slug === existing.slug);
    if (idx !== -1) {
      current[idx] = updated;
      this.writeLocalJson(current);
    }

    return updated;
  }

  async delete(id: string, _adminUser = "admin@viascent.lk"): Promise<boolean> {
    const existing = await this.getById(id);
    if (!existing) {
      throw new Error(`Category with id "${id}" not found.`);
    }

    if (isPostgresConfigured()) {
      try {
        await this.ensureCategoryTable();
        const sql = getDb()!;
        await sql`DELETE FROM categories WHERE id = ${existing.id};`;
      } catch (err) {
        console.error("[CategoryService] PostgreSQL delete error:", err);
      }
    }

    const current = this.readLocalJson();
    const filtered = current.filter((c) => c.id !== existing.id && c.slug !== existing.slug);
    this.writeLocalJson(filtered);

    return true;
  }
}

export const categoryService = new CategoryService();
