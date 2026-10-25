import { MetadataRoute } from "next";
import { getSiteUrl, isIndexingAllowed } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  if (!isIndexingAllowed()) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: {
      userAgent: "*",
      disallow: ["/cart", "/checkout", "/api/", "/admin", "/admin-login"],
    },
    sitemap: `${getSiteUrl()}/sitemap.xml`,
  };
}
