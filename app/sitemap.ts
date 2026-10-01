// Serves /sitemap.xml (Requirements 16.8, 16.13). Static: no request-time
// APIs are touched, so Next prerenders it once per build.
import type { MetadataRoute } from "next";
import { INDEXABLE_ROUTES } from "@/lib/routes";
import { buildSitemap } from "@/lib/sitemap";

export default function sitemap(): MetadataRoute.Sitemap {
  return buildSitemap(INDEXABLE_ROUTES);
}
