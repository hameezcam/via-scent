import fs from "fs";
import path from "path";
import { getDb, ensureDbInitialized, isPostgresConfigured } from "@/lib/db";

/**
 * Durable JSON Document Store
 *
 * Orders, returns, warranty claims, settings, audit logs and newsletter
 * subscribers are stored as JSON documents keyed by (collection, id).
 *
 * - When Postgres is configured (Vercel / Neon / Prisma Postgres), documents
 *   live in the `app_documents` table, so they survive deploys and work on
 *   Vercel's read-only serverless filesystem.
 * - Without database credentials (local development and tests), documents
 *   fall back to a JSON file per collection inside the data directory.
 *   Set VIA_DATA_DIR to redirect those files (the test runner uses a temp dir).
 */

export interface DocumentStore<T> {
  /** All documents, newest first. */
  list(options?: { limit?: number }): Promise<T[]>;
  get(id: string): Promise<T | null>;
  /** Insert or replace a document. */
  put(id: string, doc: T): Promise<void>;
}

function getDataDir(): string {
  return process.env.VIA_DATA_DIR || path.join(process.cwd(), "src/data");
}

function parseDoc<T>(raw: unknown): T {
  return (typeof raw === "string" ? JSON.parse(raw) : raw) as T;
}

export function createDocumentStore<T>(options: {
  collection: string;
  fileName: string;
  getId: (doc: T) => string;
  /** Demo records used only in local file mode when no file exists yet. */
  seed?: () => T[];
}): DocumentStore<T> {
  const { collection, fileName, getId, seed } = options;
  let fileCache: T[] | null = null;

  const filePath = () => path.join(getDataDir(), fileName);

  function readFile(): T[] {
    if (fileCache) return fileCache;
    try {
      if (fs.existsSync(filePath())) {
        fileCache = JSON.parse(fs.readFileSync(filePath(), "utf-8"));
        return fileCache!;
      }
    } catch {
      // Fall through to seed
    }
    fileCache = seed ? seed() : [];
    return fileCache;
  }

  function writeFile(docs: T[]) {
    fileCache = docs;
    try {
      const dir = path.dirname(filePath());
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(filePath(), JSON.stringify(docs, null, 2), "utf-8");
    } catch {
      // In-memory fallback for local development only
    }
  }

  return {
    async list({ limit } = {}) {
      if (isPostgresConfigured()) {
        await ensureDbInitialized();
        const sql = getDb()!;
        const rows = limit
          ? await sql`SELECT data FROM app_documents WHERE collection = ${collection} ORDER BY created_at DESC LIMIT ${limit};`
          : await sql`SELECT data FROM app_documents WHERE collection = ${collection} ORDER BY created_at DESC;`;
        return rows.map((r) => parseDoc<T>(r.data));
      }
      const docs = readFile();
      return limit ? docs.slice(0, limit) : docs;
    },

    async get(id) {
      if (isPostgresConfigured()) {
        await ensureDbInitialized();
        const sql = getDb()!;
        const rows = await sql`SELECT data FROM app_documents WHERE collection = ${collection} AND id = ${id} LIMIT 1;`;
        return rows[0] ? parseDoc<T>(rows[0].data) : null;
      }
      return readFile().find((d) => getId(d) === id) || null;
    },

    async put(id, doc) {
      if (isPostgresConfigured()) {
        await ensureDbInitialized();
        const sql = getDb()!;
        await sql`
          INSERT INTO app_documents (collection, id, data)
          VALUES (${collection}, ${id}, ${JSON.stringify(doc)})
          ON CONFLICT (collection, id)
          DO UPDATE SET data = EXCLUDED.data, updated_at = NOW();
        `;
        return;
      }
      const docs = [...readFile()];
      const index = docs.findIndex((d) => getId(d) === id);
      if (index > -1) {
        docs[index] = doc;
      } else {
        docs.unshift(doc);
      }
      writeFile(docs);
    },
  };
}
