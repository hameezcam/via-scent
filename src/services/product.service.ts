import fs from "fs";
import path from "path";
import { PRODUCTS, CATEGORIES } from "../data/products";
import {
  Product,
  CategoryInfo,
  ProductCategory,
  ProductFilterParams,
  SortOption,
} from "../types/product";
import { isPostgresConfigured, getDb, ensureDbInitialized } from "@/lib/db";

const CUSTOM_PRODUCTS_PATH = path.join(process.cwd(), "src/data/custom-products.json");

/**
 * Reusable Product Catalogue Service Layer
 * 
 * Supports storefront filtering as well as administrative CRUD:
 * Create, Edit, Publish/Unpublish, Archive, and Batch Import.
 * 
 * Dual-Mode Persistence:
 * - When Vercel Postgres / Neon is configured (POSTGRES_URL / DATABASE_URL),
 *   all products are saved and retrieved directly from PostgreSQL.
 * - When running locally without database credentials, gracefully falls back
 *   to local custom-products.json.
 */
export interface IProductService {
  getAll(params?: ProductFilterParams): Promise<Product[]>;
  getAllAdmin(): Promise<Product[]>;
  getBySlug(slug: string): Promise<Product | null>;
  getById(id: string): Promise<Product | null>;
  getByCategory(category: ProductCategory, params?: ProductFilterParams): Promise<Product[]>;
  getFeatured(limit?: number): Promise<Product[]>;
  getBestsellers(limit?: number): Promise<Product[]>;
  getRelated(productId: string, limit?: number): Promise<Product[]>;
  search(query: string): Promise<Product[]>;
  getCategories(): Promise<CategoryInfo[]>;
  getCategoryById(id: ProductCategory): Promise<CategoryInfo | null>;
  createProduct(product: Omit<Product, "id">, adminUser?: string): Promise<Product>;
  updateProduct(id: string, updates: Partial<Product>, adminUser?: string): Promise<Product>;
  togglePublishStatus(id: string, adminUser?: string): Promise<Product>;
  archiveProduct(id: string, adminUser?: string): Promise<Product>;
  deleteProduct(id: string, adminUser?: string): Promise<boolean>;
  importCatalogue(products: Product[], adminUser?: string): Promise<number>;
}

function parseProductRow(row: Record<string, any>): Product {
  if (!row || !row.data) {
    return row as unknown as Product;
  }
  if (typeof row.data === "string") {
    try {
      return JSON.parse(row.data);
    } catch {
      return row.data as unknown as Product;
    }
  }
  return row.data as Product;
}

class ProductServiceImpl implements IProductService {
  private inMemoryCatalogue: Product[] | null = null;

  private getMasterCatalogue(): Product[] {
    try {
      if (fs.existsSync(CUSTOM_PRODUCTS_PATH)) {
        const raw = fs.readFileSync(CUSTOM_PRODUCTS_PATH, "utf-8");
        this.inMemoryCatalogue = JSON.parse(raw);
        return this.inMemoryCatalogue!;
      }
    } catch {
      // Fallback
    }

    if (!this.inMemoryCatalogue) {
      this.inMemoryCatalogue = PRODUCTS.map((p) => ({
        ...p,
        isPublished: true,
        isArchived: false,
        inventoryCount: p.inStock ? 25 : 0,
        warrantyDurationMonths: p.warrantyPeriod?.includes("2 Year") ? 24 : 6,
      }));
      this.saveCatalogue(this.inMemoryCatalogue);
    }

    return this.inMemoryCatalogue;
  }

  private saveCatalogue(products: Product[]) {
    this.inMemoryCatalogue = products;
    try {
      const dir = path.dirname(CUSTOM_PRODUCTS_PATH);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(CUSTOM_PRODUCTS_PATH, JSON.stringify(products, null, 2), "utf-8");
    } catch {
      // In-memory fallback
    }
  }

  async getAll(params?: ProductFilterParams): Promise<Product[]> {
    let result: Product[] = [];

    if (isPostgresConfigured()) {
      try {
        await ensureDbInitialized();
        const sql = getDb()!;
        const rows = await sql`
          SELECT data FROM products 
          WHERE is_published = true AND is_archived = false 
          ORDER BY created_at DESC;
        `;
        result = rows.map(parseProductRow);
      } catch (err) {
        console.error("[ProductService] PostgreSQL query error, falling back to local catalogue:", err);
        result = this.getMasterCatalogue().filter((p) => p.isPublished !== false && !p.isArchived);
      }
    } else {
      result = this.getMasterCatalogue().filter((p) => p.isPublished !== false && !p.isArchived);
    }

    if (!params) return result;

    const { category, scentFamily, minPrice, maxPrice, inStockOnly, query, sort } = params;

    if (category && category !== "all") {
      result = result.filter((p) => p.category === category);
    }

    if (scentFamily && scentFamily !== "all") {
      result = result.filter((p) => p.scentFamily === scentFamily);
    }

    if (minPrice !== undefined) {
      result = result.filter((p) => p.basePriceLKR >= minPrice);
    }

    if (maxPrice !== undefined) {
      result = result.filter((p) => p.basePriceLKR <= maxPrice);
    }

    if (inStockOnly) {
      result = result.filter((p) => p.inStock);
    }

    if (query && query.trim() !== "") {
      const q = query.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tagline.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          (p.scentNotes &&
            [...p.scentNotes.top, ...p.scentNotes.heart, ...p.scentNotes.base].some((note) =>
              note.toLowerCase().includes(q)
            ))
      );
    }

    if (sort) {
      result = this.applySort(result, sort);
    }

    return result;
  }

  async getAllAdmin(): Promise<Product[]> {
    if (isPostgresConfigured()) {
      try {
        await ensureDbInitialized();
        const sql = getDb()!;
        const rows = await sql`
          SELECT data FROM products 
          ORDER BY created_at DESC;
        `;
        return rows.map(parseProductRow);
      } catch (err) {
        console.error("[ProductService] PostgreSQL query error, falling back to local catalogue:", err);
        return [...this.getMasterCatalogue()];
      }
    }
    return [...this.getMasterCatalogue()];
  }

  async getBySlug(slug: string): Promise<Product | null> {
    if (isPostgresConfigured()) {
      try {
        await ensureDbInitialized();
        const sql = getDb()!;
        const rows = await sql`
          SELECT data FROM products 
          WHERE slug = ${slug} AND is_published = true AND is_archived = false 
          LIMIT 1;
        `;
        if (rows && rows.length > 0) {
          return parseProductRow(rows[0]);
        }
      } catch (err) {
        console.error("[ProductService] PostgreSQL getBySlug error:", err);
      }
    }
    const product = this.getMasterCatalogue().find(
      (p) => p.slug === slug && p.isPublished !== false && !p.isArchived
    );
    return product ? { ...product } : null;
  }

  async getById(id: string): Promise<Product | null> {
    if (isPostgresConfigured()) {
      try {
        await ensureDbInitialized();
        const sql = getDb()!;
        const rows = await sql`
          SELECT data FROM products 
          WHERE id = ${id} 
          LIMIT 1;
        `;
        if (rows && rows.length > 0) {
          return parseProductRow(rows[0]);
        }
        return null;
      } catch (err) {
        console.error("[ProductService] PostgreSQL getById error:", err);
      }
    }
    const product = this.getMasterCatalogue().find((p) => p.id === id);
    return product ? { ...product } : null;
  }

  async getByCategory(
    category: ProductCategory,
    params?: ProductFilterParams
  ): Promise<Product[]> {
    return this.getAll({ ...params, category });
  }

  async getFeatured(limit: number = 4): Promise<Product[]> {
    const featured = (await this.getAll()).filter((p) => p.featured);
    return featured.slice(0, limit);
  }

  async getBestsellers(limit: number = 4): Promise<Product[]> {
    const bestsellers = (await this.getAll()).filter((p) => p.isBestseller);
    return bestsellers.slice(0, limit);
  }

  async getRelated(productId: string, limit: number = 3): Promise<Product[]> {
    const catalog = await this.getAll();
    const current = catalog.find((p) => p.id === productId);
    if (!current) return catalog.slice(0, limit);

    const related = catalog.filter(
      (p) => p.id !== productId && (p.category === current.category || p.scentFamily === current.scentFamily)
    );

    return related.length > 0 ? related.slice(0, limit) : catalog.filter((p) => p.id !== productId).slice(0, limit);
  }

  async search(query: string): Promise<Product[]> {
    return this.getAll({ query });
  }

  async getCategories(): Promise<CategoryInfo[]> {
    const { categoryService } = await import("./category.service");
    const categories = await categoryService.getAll();
    return categories.map((c) => ({
      id: c.id as ProductCategory,
      name: c.name,
      tagline: c.tagline,
      description: c.description,
      image: c.image,
      featuredInHome: c.featuredInHome,
    }));
  }

  async getCategoryById(id: string): Promise<CategoryInfo | null> {
    const { categoryService } = await import("./category.service");
    const category = await categoryService.getById(id);
    if (!category) return null;
    return {
      id: category.id as ProductCategory,
      name: category.name,
      tagline: category.tagline,
      description: category.description,
      image: category.image,
      featuredInHome: category.featuredInHome,
    };
  }

  async createProduct(productInput: Omit<Product, "id">, _adminUser: string = "admin@viascent.lk"): Promise<Product> {
    void _adminUser;
    const id = `prod-${Date.now()}`;
    const newProduct: Product = {
      ...productInput,
      id,
      isPublished: productInput.isPublished !== undefined ? productInput.isPublished : true,
      isArchived: false,
      inventoryCount: productInput.inventoryCount !== undefined ? productInput.inventoryCount : 10,
      warrantyDurationMonths: productInput.warrantyDurationMonths ?? 6,
    };

    if (isPostgresConfigured()) {
      try {
        await ensureDbInitialized();
        const sql = getDb()!;
        await sql`
          INSERT INTO products (
            id, slug, sku, name, category, base_price_lkr,
            is_published, is_archived, featured, is_bestseller, is_new, data
          ) VALUES (
            ${newProduct.id},
            ${newProduct.slug},
            ${newProduct.sku},
            ${newProduct.name},
            ${newProduct.category},
            ${newProduct.basePriceLKR},
            ${newProduct.isPublished ?? true},
            ${newProduct.isArchived ?? false},
            ${Boolean(newProduct.featured)},
            ${Boolean(newProduct.isBestseller)},
            ${Boolean(newProduct.isNew)},
            ${JSON.stringify(newProduct)}
          );
        `;
        // Also keep local file in sync if accessible
        try {
          const catalog = this.getMasterCatalogue();
          catalog.unshift(newProduct);
          this.saveCatalogue(catalog);
        } catch {
          // Non-critical local save warning
        }
        return newProduct;
      } catch (err) {
        console.error("[ProductService] PostgreSQL createProduct error:", err);
        throw new Error(`Failed to save product to database: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    const catalog = this.getMasterCatalogue();
    catalog.unshift(newProduct);
    this.saveCatalogue(catalog);
    return newProduct;
  }

  async updateProduct(id: string, updates: Partial<Product>, _adminUser: string = "admin@viascent.lk"): Promise<Product> {
    void _adminUser;
    if (isPostgresConfigured()) {
      try {
        await ensureDbInitialized();
        const sql = getDb()!;
        const existing = await this.getById(id);
        if (!existing) {
          throw new Error(`Product with ID ${id} not found.`);
        }
        const updated: Product = {
          ...existing,
          ...updates,
        };
        await sql`
          UPDATE products SET
            slug = ${updated.slug},
            sku = ${updated.sku},
            name = ${updated.name},
            category = ${updated.category},
            base_price_lkr = ${updated.basePriceLKR},
            is_published = ${updated.isPublished ?? true},
            is_archived = ${updated.isArchived ?? false},
            featured = ${Boolean(updated.featured)},
            is_bestseller = ${Boolean(updated.isBestseller)},
            is_new = ${Boolean(updated.isNew)},
            data = ${JSON.stringify(updated)},
            updated_at = NOW()
          WHERE id = ${id};
        `;
        try {
          const catalog = this.getMasterCatalogue();
          const index = catalog.findIndex((p) => p.id === id);
          if (index !== -1) {
            catalog[index] = updated;
            this.saveCatalogue(catalog);
          }
        } catch {
          // Non-critical local cache
        }
        return updated;
      } catch (err) {
        console.error("[ProductService] PostgreSQL updateProduct error:", err);
        throw new Error(`Failed to update product in database: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    const catalog = this.getMasterCatalogue();
    const index = catalog.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new Error(`Product with ID ${id} not found.`);
    }

    const updated = {
      ...catalog[index],
      ...updates,
    };

    catalog[index] = updated;
    this.saveCatalogue(catalog);
    return updated;
  }

  async togglePublishStatus(id: string, _adminUser: string = "admin@viascent.lk"): Promise<Product> {
    void _adminUser;
    if (isPostgresConfigured()) {
      try {
        await ensureDbInitialized();
        const sql = getDb()!;
        const existing = await this.getById(id);
        if (!existing) {
          throw new Error(`Product with ID ${id} not found.`);
        }
        const newStatus = !existing.isPublished;
        const updated: Product = { ...existing, isPublished: newStatus };
        await sql`
          UPDATE products SET
            is_published = ${newStatus},
            data = ${JSON.stringify(updated)},
            updated_at = NOW()
          WHERE id = ${id};
        `;
        try {
          const catalog = this.getMasterCatalogue();
          const index = catalog.findIndex((p) => p.id === id);
          if (index !== -1) {
            catalog[index] = updated;
            this.saveCatalogue(catalog);
          }
        } catch {
          // Non-critical
        }
        return updated;
      } catch (err) {
        console.error("[ProductService] PostgreSQL togglePublishStatus error:", err);
        throw new Error(`Failed to toggle publish status: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    const catalog = this.getMasterCatalogue();
    const product = catalog.find((p) => p.id === id);
    if (!product) {
      throw new Error(`Product with ID ${id} not found.`);
    }

    product.isPublished = !product.isPublished;
    this.saveCatalogue(catalog);
    return product;
  }

  async archiveProduct(id: string, _adminUser: string = "admin@viascent.lk"): Promise<Product> {
    void _adminUser;
    if (isPostgresConfigured()) {
      try {
        await ensureDbInitialized();
        const sql = getDb()!;
        const existing = await this.getById(id);
        if (!existing) {
          throw new Error(`Product with ID ${id} not found.`);
        }
        const updated: Product = { ...existing, isArchived: true, isPublished: false };
        await sql`
          UPDATE products SET
            is_archived = true,
            is_published = false,
            data = ${JSON.stringify(updated)},
            updated_at = NOW()
          WHERE id = ${id};
        `;
        try {
          const catalog = this.getMasterCatalogue();
          const index = catalog.findIndex((p) => p.id === id);
          if (index !== -1) {
            catalog[index] = updated;
            this.saveCatalogue(catalog);
          }
        } catch {
          // Non-critical
        }
        return updated;
      } catch (err) {
        console.error("[ProductService] PostgreSQL archiveProduct error:", err);
        throw new Error(`Failed to archive product: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    const catalog = this.getMasterCatalogue();
    const product = catalog.find((p) => p.id === id);
    if (!product) {
      throw new Error(`Product with ID ${id} not found.`);
    }

    product.isArchived = true;
    product.isPublished = false;
    this.saveCatalogue(catalog);
    return product;
  }

  async deleteProduct(id: string, _adminUser: string = "admin@viascent.lk"): Promise<boolean> {
    void _adminUser;
    if (isPostgresConfigured()) {
      try {
        await ensureDbInitialized();
        const sql = getDb()!;
        await sql`DELETE FROM products WHERE id = ${id};`;
        try {
          const catalog = this.getMasterCatalogue();
          const index = catalog.findIndex((p) => p.id === id);
          if (index !== -1) {
            catalog.splice(index, 1);
            this.saveCatalogue(catalog);
          }
        } catch {
          // Non-critical
        }
        return true;
      } catch (err) {
        console.error("[ProductService] PostgreSQL deleteProduct error:", err);
        throw new Error(`Failed to delete product: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    const catalog = this.getMasterCatalogue();
    const index = catalog.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new Error(`Product with ID ${id} not found.`);
    }

    catalog.splice(index, 1);
    this.saveCatalogue(catalog);
    return true;
  }

  async importCatalogue(newProducts: Product[], _adminUser: string = "admin@viascent.lk"): Promise<number> {
    void _adminUser;
    if (isPostgresConfigured()) {
      try {
        await ensureDbInitialized();
        const sql = getDb()!;
        let count = 0;
        for (const item of newProducts) {
          const prodId = item.id || `prod-import-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
          const full: Product = {
            ...item,
            id: prodId,
            isPublished: item.isPublished !== undefined ? item.isPublished : true,
            isArchived: false,
          };
          await sql`
            INSERT INTO products (
              id, slug, sku, name, category, base_price_lkr,
              is_published, is_archived, featured, is_bestseller, is_new, data
            ) VALUES (
              ${full.id}, ${full.slug}, ${full.sku}, ${full.name}, ${full.category},
              ${full.basePriceLKR}, ${full.isPublished ?? true}, false,
              ${Boolean(full.featured)}, ${Boolean(full.isBestseller)}, ${Boolean(full.isNew)},
              ${JSON.stringify(full)}
            )
            ON CONFLICT (id) DO UPDATE SET
              slug = EXCLUDED.slug,
              sku = EXCLUDED.sku,
              name = EXCLUDED.name,
              category = EXCLUDED.category,
              base_price_lkr = EXCLUDED.base_price_lkr,
              is_published = EXCLUDED.is_published,
              is_archived = EXCLUDED.is_archived,
              featured = EXCLUDED.featured,
              is_bestseller = EXCLUDED.is_bestseller,
              is_new = EXCLUDED.is_new,
              data = EXCLUDED.data,
              updated_at = NOW();
          `;
          count++;
        }
        return count;
      } catch (err) {
        console.error("[ProductService] PostgreSQL importCatalogue error:", err);
        throw new Error(`Failed to import catalogue: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    const catalog = this.getMasterCatalogue();
    let importedCount = 0;

    for (const item of newProducts) {
      const existingIdx = catalog.findIndex((p) => p.sku === item.sku || p.id === item.id);
      if (existingIdx > -1) {
        catalog[existingIdx] = { ...catalog[existingIdx], ...item };
      } else {
        catalog.push({
          ...item,
          id: item.id || `prod-import-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          isPublished: item.isPublished !== undefined ? item.isPublished : true,
          isArchived: false,
        });
      }
      importedCount++;
    }

    this.saveCatalogue(catalog);
    return importedCount;
  }

  private applySort(products: Product[], sort: SortOption): Product[] {
    const list = [...products];
    switch (sort) {
      case "price-asc":
        return list.sort((a, b) => a.basePriceLKR - b.basePriceLKR);
      case "price-desc":
        return list.sort((a, b) => b.basePriceLKR - a.basePriceLKR);
      case "name-asc":
        return list.sort((a, b) => a.name.localeCompare(b.name));
      case "name-desc":
        return list.sort((a, b) => b.name.localeCompare(a.name));
      case "newest":
        return list.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
      case "featured":
      default:
        return list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }
  }
}

export const productService = new ProductServiceImpl();
