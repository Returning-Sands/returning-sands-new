import { describe, expect, it } from "vitest";
import { currentNavHref } from "@/lib/nav";
import { isExternalHref } from "@/lib/links";
import { SITE_URL, canonicalFor, pageMetadata, truncateTitle } from "@/lib/metadata";
import { INDEXABLE_ROUTES, KNOWN_PATHS, NOINDEX_ROUTES } from "@/lib/routes";
import { site } from "@/content/site";

describe("routes", () => {
  it("lists the twelve Pages plus /privacy as indexable and only /museum/thanks as noindex", () => {
    expect(INDEXABLE_ROUTES).toHaveLength(13);
    expect(INDEXABLE_ROUTES.map((r) => r.path)).toContain("/privacy");
    expect(NOINDEX_ROUTES).toEqual([{ path: "/museum/thanks", key: "museumThanks" }]);
    expect(KNOWN_PATHS.size).toBe(14);
    expect(KNOWN_PATHS.has("/museum/thanks")).toBe(true);
  });

  it("maps every route to a PageKey that exists in site.pages", () => {
    for (const r of [...INDEXABLE_ROUTES, ...NOINDEX_ROUTES]) {
      expect(site.pages[r.key]).toBeDefined();
    }
  });
});

describe("currentNavHref", () => {
  it("marks the Home wordmark on /", () => {
    expect(currentNavHref("/")).toBe("/");
  });

  it("collapses every /campaign path onto the Impact Campaign link", () => {
    expect(currentNavHref("/campaign")).toBe("/campaign");
    expect(currentNavHref("/campaign/cairo")).toBe("/campaign");
    expect(currentNavHref("/campaign/london")).toBe("/campaign");
  });

  it("returns null for pages without a nav link and for unknown paths", () => {
    expect(currentNavHref("/museum")).toBeNull();
    expect(currentNavHref("/museum/thanks")).toBeNull();
    expect(currentNavHref("/privacy")).toBeNull();
    expect(currentNavHref("/nope")).toBeNull();
  });

  it("returns every other known Page path unchanged", () => {
    expect(currentNavHref("/about")).toBe("/about");
    expect(currentNavHref("/donate")).toBe("/donate");
  });
});

describe("isExternalHref", () => {
  it("never treats relative paths, fragments or mailto links as external", () => {
    expect(isExternalHref("/about")).toBe(false);
    expect(isExternalHref("#x")).toBe(false);
    expect(isExternalHref("mailto:a@b")).toBe(false);
  });

  it("treats the site's own hosts as internal, case-insensitively", () => {
    expect(isExternalHref("https://returningsands.org/x")).toBe(false);
    expect(isExternalHref("https://WWW.returningsands.org/")).toBe(false);
  });

  it("treats any other absolute URL as external", () => {
    expect(isExternalHref("https://paypal.com")).toBe(true);
    expect(isExternalHref("https://www.instagram.com/returningsands")).toBe(true);
  });

  it("treats malformed strings as internal", () => {
    expect(isExternalHref("not a url")).toBe(false);
  });
});

describe("canonicalFor", () => {
  it("returns the bare origin for the root path", () => {
    expect(canonicalFor("/")).toBe("https://returningsands.org");
    expect(SITE_URL).toBe("https://returningsands.org");
  });

  it("strips trailing slashes, query strings and fragments", () => {
    expect(canonicalFor("/about/")).toBe("https://returningsands.org/about");
    expect(canonicalFor("/about")).toBe("https://returningsands.org/about");
    expect(canonicalFor("/campaign/cairo?utm=x#events")).toBe("https://returningsands.org/campaign/cairo");
  });
});

describe("pageMetadata", () => {
  it("sources title and description from site.pages and sets canonical, OG and Twitter fields", () => {
    const m = pageMetadata("about", "/about");
    expect(m.title).toBe(site.pages.about.title);
    expect(m.description).toBe(site.pages.about.description);
    expect(m.alternates?.canonical).toBe("https://returningsands.org/about");
    expect(m.openGraph).toMatchObject({
      title: site.pages.about.title,
      description: site.pages.about.description,
      url: "https://returningsands.org/about",
      type: "website",
      siteName: site.name,
    });
    expect(m.twitter).toMatchObject({
      card: "summary_large_image",
      title: site.pages.about.title,
      description: site.pages.about.description,
    });
    // og:image comes from the opengraph-image.tsx file convention, never here.
    expect(m.openGraph && "images" in m.openGraph).toBe(false);
  });

  it("omits robots by default and sets noindex/nofollow when asked", () => {
    expect(pageMetadata("about", "/about").robots).toBeUndefined();
    expect(pageMetadata("museumThanks", "/museum/thanks", { noindex: true }).robots).toEqual({
      index: false,
      follow: false,
    });
  });
});

describe("truncateTitle", () => {
  it("returns short titles unchanged", () => {
    expect(truncateTitle("Returning Sands")).toBe("Returning Sands");
    expect(truncateTitle("a".repeat(60))).toBe("a".repeat(60));
  });

  it("truncates long titles to the limit with an ellipsis", () => {
    const long = "a".repeat(61);
    const out = truncateTitle(long);
    expect(out.length).toBe(60);
    expect(out.endsWith("…")).toBe(true);
    expect(long.startsWith(out.slice(0, -1))).toBe(true);
  });

  it("honours a custom limit", () => {
    expect(truncateTitle("hello world", 5)).toBe("hell…");
  });
});
