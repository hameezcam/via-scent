import { MetadataRoute } from "next";
import { productService } from "@/services/product.service";
import { categoryService } from "@/services/category.service";
import { getSiteUrl } from "@/lib/site-url";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/shop",
    "/home-fragrance",
    "/business-scenting",
    "/business-scenting/request-quote",
    "/about",
    "/contact",
    "/shipping",
    "/returns",
    "/warranty",
    "/privacy",
    "/terms",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1.0 : 0.7,
  }));

  // Built from the live catalogue so products added in the admin are discoverable
  const [products, categories] = await Promise.all([
    productService.getAll().catch(() => []),
    categoryService.getAll().catch(() => []),
  ]);

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${baseUrl}/shop/${cat.id}`,
    lastModified: cat.updatedAt ? new Date(cat.updatedAt) : now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${baseUrl}/products/${product.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
