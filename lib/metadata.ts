/**
 * Per-page Metadata API builder (Requirements 16.1, 16.2, 16.4, 16.13).
 *
 * Every `page.tsx` exports `metadata = pageMetadata("about", "/about")`;
 * the city page calls it from `generateMetadata` after `await params`.
 *
 * `openGraph.images` / `twitter.images` are deliberately NOT set here: the
 * co-located `opengraph-image.tsx` file convention supplies `og:image` and
 * `twitter:image`, and file-based metadata overrides the object for the same
 * field (docs/NEXT16_NOTES.md item 1). Setting both would make them fight.
 */
import type { Metadata } from "next";
import { site } from "@/content/site";
import type { PageKey } from "./types";

export const SITE_URL = "https://returningsands.org";

/**
 * Absolute canonical URL for a route path (16.2, design Property 18).
 *
 * Strips any query string or fragment and any trailing slash; the root path
 * yields the bare origin `https://returningsands.org`.
 */
export function canonicalFor(path: string): string {
  // Drop everything from the first `?` or `#` onward.
  const cut = path.search(/[?#]/);
  let clean = cut === -1 ? path : path.slice(0, cut);
  // Ensure a leading slash so `about` and `/about` canonicalise identically.
  if (!clean.startsWith("/")) clean = `/${clean}`;
  // Collapse trailing slashes; `/` itself becomes "" so the root is the origin.
  clean = clean.replace(/\/+$/, "");
  return `${SITE_URL}${clean}`;
}

/**
 * Build the Metadata object for a Page from `site.pages[key]`.
 *
 * - `title` / `description` straight from content (16.1)
 * - `alternates.canonical` via `canonicalFor` (16.2)
 * - `openGraph` title/description/url/type/siteName; `og:url` equals the
 *   canonical so the two never disagree (16.3)
 * - `twitter` `summary_large_image` with the same title/description (16.4)
 * - `robots: { index:false, follow:false }` only when `opts.noindex` (16.13)
 */
export function pageMetadata(key: PageKey, path: string, opts?: { noindex?: boolean }): Metadata {
  const { title, description } = site.pages[key];
  const canonical = canonicalFor(path);
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, type: "website", siteName: site.name },
    twitter: { card: "summary_large_image", title, description },
    ...(opts?.noindex ? { robots: { index: false, follow: false } } : {}),
  };
}

/**
 * Ellipsis-truncate a Share_Card title (16.5, design Property 19).
 *
 * Returns `title` unchanged when it has at most `max` characters; otherwise a
 * prefix of `title` plus "…" whose total length is exactly `max`. Counts
 * code points, not UTF-16 units, so Arabic and emoji are not split.
 */
export function truncateTitle(title: string, max = 60): string {
  const chars = Array.from(title);
  if (chars.length <= max) return title;
  return `${chars.slice(0, Math.max(0, max - 1)).join("")}…`;
}
