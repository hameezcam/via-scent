/**
 * Canonical site URL and indexing switch.
 *
 * - NEXT_PUBLIC_SITE_URL sets the canonical domain (e.g. https://viascent.lk).
 *   Falls back to the Vercel production domain, then localhost.
 * - NEXT_PUBLIC_ALLOW_INDEXING="true" lets search engines index the site.
 *   Leave it unset on previews so staging copies never compete with production.
 */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");
  const vercelProduction = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercelProduction) return `https://${vercelProduction}`;
  return "http://localhost:3000";
}

export function isIndexingAllowed(): boolean {
  return process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true";
}
