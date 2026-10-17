import { Pool } from "pg";
import { PRODUCTS } from "@/data/products";
import { Product } from "@/types/product";

/**
 * Universal Database Connection Layer for PostgreSQL:
 * - Prisma Postgres (db.prisma.io)
 * - Vercel Postgres / Neon
 * - Standard PostgreSQL (Supabase, AWS RDS, Docker, etc.)
 * 
 * Automatically detects:
 * - DATABASE_POSTGRES_URL
 * - DATABASE_PRISMA_DATABASE_URL
 * - POSTGRES_URL
 * - DATABASE_URL
 * - POSTGRES_PRISMA_URL
 */

export type SqlFunction = (
  strings: TemplateStringsArray,
  ...values: any[]
) => Promise<any[]>;

function getConnectionString(): string | null {
  const raw = (
    process.env.DATABASE_POSTGRES_URL ||
    process.env.DATABASE_PRISMA_DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    null
  );
  if (!raw) return null;
  const trimmed = raw.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    const errorMsg =
      "Invalid DATABASE_URL: The connection string must start with 'postgres://' or 'postgresql://' (e.g. postgresql://user:pass@host/db?sslmode=require).";
    console.error(`[Database] ${errorMsg}`);
    throw new Error(errorMsg);
  }
  return trimmed;
}

export function isPostgresConfigured(): boolean {
  try {
    return Boolean(getConnectionString());
  } catch {
    return true;
  }
}

const globalForDb = globalThis as unknown as {
  postgresPool?: Pool;
  sqlClient?: SqlFunction;
  initPromise?: Promise<void> | null;
};

export function getDb(): SqlFunction | null {
  const connectionString = getConnectionString();
  if (!connectionString) {
    return null;
  }

  if (!globalForDb.postgresPool) {
    globalForDb.postgresPool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
    });
  }

  if (!globalForDb.sqlClient) {
    const pool = globalForDb.postgresPool;
    globalForDb.sqlClient = async (strings: TemplateStringsArray, ...values: any[]) => {
      let text = "";
      for (let i = 0; i < strings.length; i++) {
        text += strings[i];
        if (i < values.length) {
          text += `$${i + 1}`;
        }
      }
      const res = await pool.query(text, values);
      return res.rows;
    };
  }

  return globalForDb.sqlClient;
}

/**
 * Automatically creates all necessary tables and seeds the initial Dr. Scent
 * product catalogue on first run. Safe to call multiple times (idempotent).
 */
export async function ensureDbInitialized(): Promise<void> {
  const sql = getDb();
  if (!sql) return;

  if (globalForDb.initPromise) {
    return globalForDb.initPromise;
  }

  globalForDb.initPromise = (async () => {
    try {
      // 1. Products Table
      await sql`
        CREATE TABLE IF NOT EXISTS products (
          id VARCHAR(100) PRIMARY KEY,
          slug VARCHAR(255) UNIQUE NOT NULL,
          sku VARCHAR(100) UNIQUE NOT NULL,
          name VARCHAR(255) NOT NULL,
          category VARCHAR(100) NOT NULL,
          base_price_lkr NUMERIC(12, 2) NOT NULL,
          is_published BOOLEAN DEFAULT true,
          is_archived BOOLEAN DEFAULT false,
          featured BOOLEAN DEFAULT false,
          is_bestseller BOOLEAN DEFAULT false,
          is_new BOOLEAN DEFAULT false,
          data TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `;

      // 2. Orders Table
      await sql`
        CREATE TABLE IF NOT EXISTS orders (
          id VARCHAR(100) PRIMARY KEY,
          order_number VARCHAR(100) UNIQUE NOT NULL,
          customer_email VARCHAR(255),
          total_lkr NUMERIC(12, 2) NOT NULL,
          status VARCHAR(50) NOT NULL,
          payment_status VARCHAR(50) NOT NULL,
          data TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `;

      // 3. Returns Table
      await sql`
        CREATE TABLE IF NOT EXISTS returns (
          id VARCHAR(100) PRIMARY KEY,
          claim_number VARCHAR(100) UNIQUE NOT NULL,
          order_id VARCHAR(100) NOT NULL,
          status VARCHAR(50) NOT NULL,
          data TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `;

      // 4. Warranties Table
      await sql`
        CREATE TABLE IF NOT EXISTS warranties (
          id VARCHAR(100) PRIMARY KEY,
          registration_number VARCHAR(100) UNIQUE NOT NULL,
          serial_number VARCHAR(100),
          data TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `;

      // 5. Audit Logs Table
      await sql`
        CREATE TABLE IF NOT EXISTS audit_logs (
          id VARCHAR(100) PRIMARY KEY,
          category VARCHAR(100) NOT NULL,
          action VARCHAR(100) NOT NULL,
          performed_by VARCHAR(255),
          data TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `;

      // 6. Settings Table
      await sql`
        CREATE TABLE IF NOT EXISTS settings (
          id VARCHAR(50) PRIMARY KEY,
          data TEXT NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `;

      // Migration: convert any existing JSONB columns to TEXT to prevent driver type mismatch
      try {
        await sql`
          DO $$
          BEGIN
            IF EXISTS (
              SELECT 1 FROM information_schema.columns 
              WHERE table_name = 'products' AND column_name = 'data' AND data_type = 'jsonb'
            ) THEN
              ALTER TABLE products ALTER COLUMN data TYPE text;
            END IF;

            IF EXISTS (
              SELECT 1 FROM information_schema.columns 
              WHERE table_name = 'orders' AND column_name = 'data' AND data_type = 'jsonb'
            ) THEN
              ALTER TABLE orders ALTER COLUMN data TYPE text;
            END IF;

            IF EXISTS (
              SELECT 1 FROM information_schema.columns 
              WHERE table_name = 'returns' AND column_name = 'data' AND data_type = 'jsonb'
            ) THEN
              ALTER TABLE returns ALTER COLUMN data TYPE text;
            END IF;

            IF EXISTS (
              SELECT 1 FROM information_schema.columns 
              WHERE table_name = 'warranties' AND column_name = 'data' AND data_type = 'jsonb'
            ) THEN
              ALTER TABLE warranties ALTER COLUMN data TYPE text;
            END IF;

            IF EXISTS (
              SELECT 1 FROM information_schema.columns 
              WHERE table_name = 'audit_logs' AND column_name = 'data' AND data_type = 'jsonb'
            ) THEN
              ALTER TABLE audit_logs ALTER COLUMN data TYPE text;
            END IF;

            IF EXISTS (
              SELECT 1 FROM information_schema.columns 
              WHERE table_name = 'settings' AND column_name = 'data' AND data_type = 'jsonb'
            ) THEN
              ALTER TABLE settings ALTER COLUMN data TYPE text;
            END IF;
          END $$;
        `;
      } catch (migErr) {
        console.warn("[Database] Non-critical migration notice:", migErr);
      }

      // 7. Seed Initial Master Catalogue if table is empty
      const rows = await sql`SELECT COUNT(*)::int as count FROM products;`;
      const count = Number(rows[0]?.count ?? 0);

      if (count === 0) {
        for (const p of PRODUCTS) {
          const fullProduct: Product = {
            ...p,
            isPublished: true,
            isArchived: false,
            inventoryCount: p.inStock ? 25 : 0,
            warrantyDurationMonths: p.warrantyPeriod?.includes("2 Year") ? 24 : 6,
          };

          await sql`
            INSERT INTO products (
              id, slug, sku, name, category, base_price_lkr,
              is_published, is_archived, featured, is_bestseller, is_new, data
            ) VALUES (
              ${fullProduct.id},
              ${fullProduct.slug},
              ${fullProduct.sku},
              ${fullProduct.name},
              ${fullProduct.category},
              ${fullProduct.basePriceLKR},
              ${fullProduct.isPublished ?? true},
              ${fullProduct.isArchived ?? false},
              ${Boolean(fullProduct.featured)},
              ${Boolean(fullProduct.isBestseller)},
              ${Boolean(fullProduct.isNew)},
              ${JSON.stringify(fullProduct)}
            ) ON CONFLICT (id) DO NOTHING;
          `;
        }
      }
    } catch (err) {
      console.error("[Database] Initialization warning:", err);
      globalForDb.initPromise = null;
      throw err;
    }
  })();

  return globalForDb.initPromise;
}
