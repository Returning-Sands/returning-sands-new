/**
 * The static route table (Requirements 16.2, 16.8, 16.13).
 *
 * Single source of truth for which paths exist, which `PageKey` owns each
 * path's SEO copy in `site.pages`, and which routes carry `noindex`.
 * Consumed by `lib/nav.ts`, `app/sitemap.ts`, and the metadata tests.
 */
import type { PageKey } from "./types";

export type Route = { path: string; key: PageKey };

/** The twelve Pages plus `/privacy`; every entry appears in the sitemap. */
export const INDEXABLE_ROUTES: readonly Route[] = [
  { path: "/", key: "home" },
  { path: "/about", key: "about" },
  { path: "/at-stake", key: "atStake" },
  { path: "/film", key: "film" },
  { path: "/campaign", key: "campaign" },
  { path: "/campaign/cairo", key: "campaignCairo" },
  { path: "/campaign/london", key: "campaignLondon" },
  { path: "/campaign/nyc", key: "campaignNyc" },
  { path: "/museum", key: "museum" },
  { path: "/team", key: "team" },
  { path: "/support", key: "support" },
  { path: "/donate", key: "donate" },
  { path: "/privacy", key: "privacy" },
] as const;

/** Routes that render but must carry `robots: noindex, nofollow` (16.13). */
export const NOINDEX_ROUTES: readonly Route[] = [{ path: "/museum/thanks", key: "museumThanks" }] as const;

/** Every path the site serves (indexable + noindex); the 404 is not a path. */
export const KNOWN_PATHS: ReadonlySet<string> = new Set(
  [...INDEXABLE_ROUTES, ...NOINDEX_ROUTES].map((r) => r.path),
);
