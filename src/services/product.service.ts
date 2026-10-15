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

const CUSTOM_PRODUCTS_PATH = path.join(process.cwd(), "src/data/custom-products.json");

/**
 * Reusable Product Catalogue Service Layer
 * 
 * Supports storefront filtering as well as administrative CRUD:
 * Create, Edit, Publish/Unpublish, Archive, and Batch Import.
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
    // Storefront queries only return published, non-archived products
    let result = this.getMasterCatalogue().filter((p) => p.isPublished !== false && !p.isArchived);

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
    return [...this.getMasterCatalogue()];
  }

  async getBySlug(slug: string): Promise<Product | null> {
    const product = this.getMasterCatalogue().find(
      (p) => p.slug === slug && p.isPublished !== false && !p.isArchived
    );
    return product ? { ...product } : null;
  }

  async getById(id: string): Promise<Product | null> {
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
    return [...CATEGORIES];
  }

  async getCategoryById(id: ProductCategory): Promise<CategoryInfo | null> {
    const category = CATEGORIES.find((c) => c.id === id);
    return category ? { ...category } : null;
  }

  async createProduct(productInput: Omit<Product, "id">, _adminUser: string = "admin@viascent.lk"): Promise<Product> {
    void _adminUser;
    const catalog = this.getMasterCatalogue();
    const id = `prod-${Date.now()}`;
    const newProduct: Product = {
      ...productInput,
      id,
      isPublished: productInput.isPublished !== undefined ? productInput.isPublished : true,
      isArchived: false,
      inventoryCount: productInput.inventoryCount !== undefined ? productInput.inventoryCount : 10,
      warrantyDurationMonths: productInput.warrantyDurationMonths || 6,
    };

    catalog.unshift(newProduct);
    this.saveCatalogue(catalog);
    return newProduct;
  }

  async updateProduct(id: string, updates: Partial<Product>, _adminUser: string = "admin@viascent.lk"): Promise<Product> {
    void _adminUser;
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
