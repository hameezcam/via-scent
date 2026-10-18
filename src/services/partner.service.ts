import fs from "fs";
import path from "path";
import { TrustedPartner, TrustedPartnerInput } from "@/types/partner";
import { isPostgresConfigured, getDb, ensureDbInitialized } from "@/lib/db";

const PARTNERS_FILE_PATH = path.join(process.cwd(), "src/data/partners.json");

const DEFAULT_PARTNERS: TrustedPartner[] = [
  {
    id: "partner-danube",
    name: "Danube Home",
    logoUrl: "/images/partners/danube-home.svg",
    websiteUrl: "https://danubehome.com",
    displayOrder: 1,
    isActive: true,
    createdAt: "2026-10-18T10:00:00.000Z",
    updatedAt: "2026-10-18T10:00:00.000Z",
  },
  {
    id: "partner-adcoop",
    name: "ADCOOP",
    logoUrl: "/images/partners/adcoop.svg",
    websiteUrl: "https://adcoop.com",
    displayOrder: 2,
    isActive: true,
    createdAt: "2026-10-18T10:00:00.000Z",
    updatedAt: "2026-10-18T10:00:00.000Z",
  },
  {
    id: "partner-sharjah-coop",
    name: "Sharjah Co-op",
    logoUrl: "/images/partners/sharjah-coop.svg",
    websiteUrl: "https://shjcoop.ae",
    displayOrder: 3,
    isActive: true,
    createdAt: "2026-10-18T10:00:00.000Z",
    updatedAt: "2026-10-18T10:00:00.000Z",
  },
  {
    id: "partner-pan-home",
    name: "PAN Home",
    logoUrl: "/images/partners/pan-home.svg",
    websiteUrl: "https://panhomestores.com",
    displayOrder: 4,
    isActive: true,
    createdAt: "2026-10-18T10:00:00.000Z",
    updatedAt: "2026-10-18T10:00:00.000Z",
  },
  {
    id: "partner-lulu",
    name: "LuLu Hypermarket",
    logoUrl: "/images/partners/lulu.svg",
    websiteUrl: "https://luluhypermarket.com",
    displayOrder: 5,
    isActive: true,
    createdAt: "2026-10-18T10:00:00.000Z",
    updatedAt: "2026-10-18T10:00:00.000Z",
  },
];

let memoryPartners: TrustedPartner[] | null = null;

function parsePartnerRow(row: Record<string, any>): TrustedPartner {
  if (row.data) {
    try {
      const parsed = typeof row.data === "string" ? JSON.parse(row.data) : row.data;
      return {
        ...parsed,
        id: row.id || parsed.id,
        name: row.name || parsed.name,
        logoUrl: row.logo_url || parsed.logoUrl,
        websiteUrl: row.website_url || parsed.websiteUrl,
        displayOrder: Number(row.display_order ?? parsed.displayOrder ?? 0),
        isActive: Boolean(row.is_active ?? parsed.isActive ?? true),
      };
    } catch {
      // fallback
    }
  }
  return {
    id: row.id,
    name: row.name,
    logoUrl: row.logo_url,
    websiteUrl: row.website_url,
    displayOrder: Number(row.display_order ?? 0),
    isActive: Boolean(row.is_active ?? true),
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : undefined,
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : undefined,
  };
}

class PartnerService {
  private readLocalJson(): TrustedPartner[] {
    if (memoryPartners) return memoryPartners;
    try {
      if (fs.existsSync(PARTNERS_FILE_PATH)) {
        const content = fs.readFileSync(PARTNERS_FILE_PATH, "utf-8");
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed) && parsed.length > 0) {
          memoryPartners = parsed;
          return parsed;
        }
      }
    } catch (err) {
      console.warn("[PartnerService] Failed to read partners.json, using defaults:", err);
    }
    memoryPartners = [...DEFAULT_PARTNERS];
    return memoryPartners;
  }

  private writeLocalJson(list: TrustedPartner[]): void {
    memoryPartners = list;
    try {
      const dir = path.dirname(PARTNERS_FILE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(PARTNERS_FILE_PATH, JSON.stringify(list, null, 2), "utf-8");
    } catch (err) {
      console.warn("[PartnerService] File write fallback warning (read-only filesystem):", err);
    }
  }

  private async ensurePartnerTable(): Promise<void> {
    if (!isPostgresConfigured()) return;
    try {
      await ensureDbInitialized();
      const sql = getDb()!;
      await sql`
        CREATE TABLE IF NOT EXISTS partners (
          id VARCHAR(100) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          logo_url TEXT NOT NULL,
          website_url TEXT,
          display_order INT DEFAULT 0,
          is_active BOOLEAN DEFAULT true,
          data TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `;

      // Seed if empty
      const rows = await sql`SELECT COUNT(*)::int as count FROM partners;`;
      const count = Number(rows[0]?.count ?? 0);
      if (count === 0) {
        const seedItems = this.readLocalJson();
        for (const item of seedItems) {
          await sql`
            INSERT INTO partners (
              id, name, logo_url, website_url, display_order, is_active, data, created_at, updated_at
            ) VALUES (
              ${item.id}, ${item.name}, ${item.logoUrl}, ${item.websiteUrl || null},
              ${item.displayOrder}, ${item.isActive}, ${JSON.stringify(item)},
              ${item.createdAt || new Date().toISOString()}, ${item.updatedAt || new Date().toISOString()}
            )
            ON CONFLICT (id) DO NOTHING;
          `;
        }
      }
    } catch (err) {
      console.error("[PartnerService] PostgreSQL table check error:", err);
    }
  }

  async getAll(onlyActive = false): Promise<TrustedPartner[]> {
    if (isPostgresConfigured()) {
      try {
        await this.ensurePartnerTable();
        const sql = getDb()!;
        const rows = onlyActive
          ? await sql`
              SELECT * FROM partners 
              WHERE is_active = true 
              ORDER BY display_order ASC, created_at ASC;
            `
          : await sql`
              SELECT * FROM partners 
              ORDER BY display_order ASC, created_at ASC;
            `;
        if (rows && rows.length > 0) {
          return rows.map(parsePartnerRow);
        }
      } catch (err) {
        console.error("[PartnerService] PostgreSQL getAll error, falling back to local JSON:", err);
      }
    }

    const localList = this.readLocalJson();
    const sorted = [...localList].sort((a, b) => a.displayOrder - b.displayOrder);
    return onlyActive ? sorted.filter((p) => p.isActive) : sorted;
  }

  async getById(id: string): Promise<TrustedPartner | null> {
    if (isPostgresConfigured()) {
      try {
        await this.ensurePartnerTable();
        const sql = getDb()!;
        const rows = await sql`
          SELECT * FROM partners 
          WHERE id = ${id} 
          LIMIT 1;
        `;
        if (rows && rows.length > 0) {
          return parsePartnerRow(rows[0]);
        }
      } catch (err) {
        console.error("[PartnerService] PostgreSQL getById error:", err);
      }
    }

    const item = this.readLocalJson().find((p) => p.id === id);
    return item ? { ...item } : null;
  }

  async create(input: TrustedPartnerInput, _adminUser = "admin@viascent.lk"): Promise<TrustedPartner> {
    const id = `partner-${Date.now()}`;
    const now = new Date().toISOString();
    const newPartner: TrustedPartner = {
      id,
      name: input.name.trim(),
      logoUrl: input.logoUrl.trim(),
      websiteUrl: input.websiteUrl?.trim() || undefined,
      displayOrder: typeof input.displayOrder === "number" ? input.displayOrder : 0,
      isActive: input.isActive !== undefined ? input.isActive : true,
      createdAt: now,
      updatedAt: now,
    };

    if (isPostgresConfigured()) {
      try {
        await this.ensurePartnerTable();
        const sql = getDb()!;
        await sql`
          INSERT INTO partners (
            id, name, logo_url, website_url, display_order, is_active, data, created_at, updated_at
          ) VALUES (
            ${newPartner.id}, ${newPartner.name}, ${newPartner.logoUrl}, ${newPartner.websiteUrl || null},
            ${newPartner.displayOrder}, ${newPartner.isActive}, ${JSON.stringify(newPartner)},
            ${newPartner.createdAt}, ${newPartner.updatedAt}
          );
        `;
      } catch (err) {
        console.error("[PartnerService] PostgreSQL create error:", err);
      }
    }

    const current = this.readLocalJson();
    current.push(newPartner);
    this.writeLocalJson(current);

    return newPartner;
  }

  async update(id: string, updates: Partial<TrustedPartner>, _adminUser = "admin@viascent.lk"): Promise<TrustedPartner> {
    const existing = await this.getById(id);
    if (!existing) {
      throw new Error(`Partner with id "${id}" not found.`);
    }

    const updated: TrustedPartner = {
      ...existing,
      ...updates,
      id: existing.id,
      name: updates.name !== undefined ? updates.name.trim() : existing.name,
      logoUrl: updates.logoUrl !== undefined ? updates.logoUrl.trim() : existing.logoUrl,
      websiteUrl: updates.websiteUrl !== undefined ? updates.websiteUrl.trim() : existing.websiteUrl,
      displayOrder: updates.displayOrder !== undefined ? Number(updates.displayOrder) : existing.displayOrder,
      isActive: updates.isActive !== undefined ? Boolean(updates.isActive) : existing.isActive,
      updatedAt: new Date().toISOString(),
    };

    if (isPostgresConfigured()) {
      try {
        await this.ensurePartnerTable();
        const sql = getDb()!;
        await sql`
          UPDATE partners SET
            name = ${updated.name},
            logo_url = ${updated.logoUrl},
            website_url = ${updated.websiteUrl || null},
            display_order = ${updated.displayOrder},
            is_active = ${updated.isActive},
            data = ${JSON.stringify(updated)},
            updated_at = ${updated.updatedAt}
          WHERE id = ${id};
        `;
      } catch (err) {
        console.error("[PartnerService] PostgreSQL update error:", err);
      }
    }

    const current = this.readLocalJson();
    const idx = current.findIndex((p) => p.id === id);
    if (idx !== -1) {
      current[idx] = updated;
      this.writeLocalJson(current);
    }

    return updated;
  }

  async delete(id: string, _adminUser = "admin@viascent.lk"): Promise<boolean> {
    if (isPostgresConfigured()) {
      try {
        await this.ensurePartnerTable();
        const sql = getDb()!;
        await sql`DELETE FROM partners WHERE id = ${id};`;
      } catch (err) {
        console.error("[PartnerService] PostgreSQL delete error:", err);
      }
    }

    const current = this.readLocalJson();
    const filtered = current.filter((p) => p.id !== id);
    this.writeLocalJson(filtered);

    return true;
  }

  async reorder(orderedIds: string[], _adminUser = "admin@viascent.lk"): Promise<TrustedPartner[]> {
    const all = await this.getAll();
    const updatedList: TrustedPartner[] = [];

    for (let i = 0; i < orderedIds.length; i++) {
      const id = orderedIds[i];
      const match = all.find((p) => p.id === id);
      if (match) {
        const updated = await this.update(id, { displayOrder: i + 1 }, _adminUser);
        updatedList.push(updated);
      }
    }

    return updatedList;
  }
}

export const partnerService = new PartnerService();
