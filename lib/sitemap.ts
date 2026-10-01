/**
 * Pure builders behind `app/sitemap.ts` and `app/robots.ts`
 * (Requirements 16.8, 16.13; docs/NEXT16_NOTES.md item 4).
 *
 * Kept free of Next runtime imports (only the `MetadataRoute` type) so the
 * unit tests can call them directly with the real `INDEXABLE_ROUTES` table.
 */
import type { MetadataRoute } from "next";
import { BUILD_DATE } from "./buildInfo";
import { SITE_URL, canonicalFor } from "./metadata";
import type { Route } from "./routes";

/**
 * One sitemap entry per route, in table order. Every URL is the absolute
 * canonical (no trailing slash except the bare origin for `/`). The root gets
 * priority 1, everything else 0.7. `lastModified` is the UTC build date so a
 * single `next build` emits one consistent value.
 */
export function buildSitemap(routes: readonly Route[]): MetadataRoute.Sitemap {
  const lastModified = new Date(BUILD_DATE).toISOString();
  return routes.map(({ path }) => ({
    url: canonicalFor(path),
    lastModified,
    changeFrequency: "monthly",
    priority: path === "/" ? 1 : 0.7,
  }));
}

/** Allow every crawler everywhere and point at the generated sitemap. */
export function buildRobots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
