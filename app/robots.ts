import type { MetadataRoute } from "next";

const baseUrl = "https://herbal-care-mbjc.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/profile", "/favorites", "/ai-history", "/auth"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
