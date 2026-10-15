import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      disallow: ["/cart", "/checkout", "/api/"],
    },
    sitemap: "https://example.lk/sitemap.xml",
  };
}
