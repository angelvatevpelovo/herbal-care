import type { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";

const baseUrl = "https://herbal-care-mbjc.vercel.app";

const staticRoutes = [
  "/",
  "/herbs",
  "/symptoms",
  "/categories",
  "/recipes",
  "/search",
  "/ai",
  "/about",
  "/safety",
  "/sources",
  "/contact",
  "/privacy",
  "/terms",
];

async function getDynamicRoutes() {
  if (!supabase) {
    return [];
  }

  const [{ data: herbs }, { data: categories }] = await Promise.all([
    supabase.from("herbs").select("slug"),
    supabase.from("categories").select("slug"),
  ]);

  const herbRoutes = (herbs ?? [])
    .filter((herb) => herb.slug)
    .map((herb) => `/herbs/${herb.slug}`);

  const categoryRoutes = (categories ?? [])
    .filter((category) => category.slug)
    .map((category) => `/categories/${category.slug}`);

  return [...herbRoutes, ...categoryRoutes];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const dynamicRoutes = await getDynamicRoutes();
  const now = new Date();

  return [...staticRoutes, ...dynamicRoutes].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
  }));
}
