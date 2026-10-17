import { neon, NeonQueryFunction } from "@neondatabase/serverless";
import { PRODUCTS } from "@/data/products";
import { Product } from "@/types/product";

/**
 * Universal Database Connection Helper for Vercel Postgres / Neon.
 * 
 * Works out-of-the-box with Vercel Postgres environment variables:
 * - POSTGRES_URL
 * - DATABASE_URL
 * - POSTGRES_PRISMA_URL
 * 
 * When running locally without database credentials, gracefully falls back
 * to in-memory / local JSON storage so development and testing never break.
 */

function getConnectionString(): string | null {
  return (
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    null
  );
}

export function isPostgresConfigured(): boolean {
  return Boolean(getConnectionString());
}

let sqlClient: NeonQueryFunction<false, false> | null = null;
let initPromise: Promise<void> | null = null;

export function getDb(): NeonQueryFunction<false, false> | null {
  const connectionString = getConnectionString();
  if (!connectionString) {
    return null;
  }
  if (!sqlClient) {
    sqlClient = neon(connectionString);
  }
  return sqlClient;
}

/**
 * Automatically creates all necessary tables and seeds the initial Dr. Scent
 * product catalogue on first run. Safe to call multiple times (idempotent).
 */
export async function ensureDbInitialized(): Promise<void> {
  const sql = getDb();
  if (!sql) return;

  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
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
          data JSONB NOT NULL,
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
          data JSONB NOT NULL,
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
          data JSONB NOT NULL,
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
          data JSONB NOT NULL,
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
          data JSONB NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `;

      // 6. Settings Table
      await sql`
        CREATE TABLE IF NOT EXISTS settings (
          id VARCHAR(50) PRIMARY KEY,
          data JSONB NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `;

      // 7. Seed Initial Master Catalogue if table is empty
      const rows = await sql`SELECT COUNT(*)::int as count FROM products`;
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
      // Allow caller to retry on next request if initialization failed
      initPromise = null;
      throw err;
    }
  })();

  return initPromise;
}
