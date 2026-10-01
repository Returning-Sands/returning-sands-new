import { expect, test, type Page } from "@playwright/test";

import { events } from "@/content/events";
import { INDEXABLE_ROUTES, NOINDEX_ROUTES } from "@/lib/routes";
import type { City } from "@/lib/types";

// Metadata, canonical, robots and JSON-LD as rendered (Req 16.2, 16.3, 16.4,
// 16.10, 16.11, 16.13).

const ORIGIN = "https://returningsands.org";
const CITIES: readonly City[] = ["cairo", "london", "nyc"];

async function meta(page: Page, selector: string): Promise<string | null> {
  const el = page.locator(`head ${selector}`);
  if ((await el.count()) === 0) return null;
  return el.first().getAttribute("content");
}

async function jsonLdBlocks(page: Page): Promise<Record<string, unknown>[]> {
  const raw = await page.locator('script[type="application/ld+json"]').allTextContents();
  return raw.map((text) => JSON.parse(text) as Record<string, unknown>);
}

test.describe("Open Graph and Twitter cards", () => {
  for (const { path } of INDEXABLE_ROUTES) {
    test(`${path}: og:* and twitter:* title/description/image agree`, async ({ page }) => {
      await page.goto(path);

      const ogTitle = await meta(page, 'meta[property="og:title"]');
      const ogDescription = await meta(page, 'meta[property="og:description"]');
      const ogImage = await meta(page, 'meta[property="og:image"]');
      const twTitle = await meta(page, 'meta[name="twitter:title"]');
      const twDescription = await meta(page, 'meta[name="twitter:description"]');
      const twImage = await meta(page, 'meta[name="twitter:image"]');
      const twCard = await meta(page, 'meta[name="twitter:card"]');

      expect(ogTitle, "og:title").toBeTruthy();
      expect(ogDescription, "og:description").toBeTruthy();
      expect(ogImage, "og:image").toBeTruthy();
      expect(twImage, "twitter:image").toBeTruthy();

      expect(twTitle).toBe(ogTitle);
      expect(twDescription).toBe(ogDescription);
      expect(twImage).toBe(ogImage);
      expect(twCard).toBe("summary_large_image");

      // The share card lives on the production origin (16.3).
      expect(ogImage!.startsWith(`${ORIGIN}/`)).toBe(true);
    });
  }
});

test.describe("canonical", () => {
  for (const { path } of [...INDEXABLE_ROUTES, ...NOINDEX_ROUTES]) {
    test(`${path}: absolute canonical without trailing slash`, async ({ page }) => {
      await page.goto(path);
      const canonical = page.locator('head link[rel="canonical"]');
      await expect(canonical).toHaveCount(1);
      const href = await canonical.getAttribute("href");
      expect(href).toBeTruthy();

      if (path === "/") {
        // The bare origin; a URL serialiser may add the single root slash.
        expect(href).toMatch(/^https:\/\/returningsands\.org\/?$/);
      } else {
        expect(href).toBe(`${ORIGIN}${path}`);
      }
      expect(href).not.toMatch(/[?#]/);
    });
  }
});

test.describe("robots", () => {
  const NOINDEX_PATHS = [...NOINDEX_ROUTES.map((r) => r.path), "/this-page-does-not-exist"];

  for (const path of NOINDEX_PATHS) {
    test(`${path} carries noindex`, async ({ page }) => {
      await page.goto(path);
      const contents = await page.locator('head meta[name="robots"]').evaluateAll((els) =>
        els.map((el) => el.getAttribute("content") ?? ""),
      );
      expect(contents.some((c) => /noindex/i.test(c)), `robots metas: ${JSON.stringify(contents)}`).toBe(true);
    });
  }

  for (const { path } of INDEXABLE_ROUTES) {
    test(`${path} carries no noindex`, async ({ page }) => {
      await page.goto(path);
      const contents = await page.locator('head meta[name="robots"]').evaluateAll((els) =>
        els.map((el) => el.getAttribute("content") ?? ""),
      );
      expect(contents.some((c) => /noindex/i.test(c)), `robots metas: ${JSON.stringify(contents)}`).toBe(false);
    });
  }
});

test.describe("JSON-LD", () => {
  test("Home has one Organization block that parses", async ({ page }) => {
    await page.goto("/");
    const blocks = await jsonLdBlocks(page);
    const orgs = blocks.filter((b) => b["@type"] === "Organization");
    expect(orgs).toHaveLength(1);
    const org = orgs[0];
    expect(org["@context"]).toBe("https://schema.org");
    expect(typeof org.name).toBe("string");
    expect(typeof org.url).toBe("string");
  });

  for (const city of CITIES) {
    test(`/campaign/${city}: one Event block per dated event`, async ({ page }) => {
      const dated = events.events.filter((e) => e.city === city && e.date !== null);

      await page.goto(`/campaign/${city}`);
      const blocks = await jsonLdBlocks(page);
      const eventBlocks = blocks.filter((b) => b["@type"] === "Event");

      expect(eventBlocks).toHaveLength(dated.length);
      const names = eventBlocks.map((b) => b.name).sort();
      expect(names).toEqual(dated.map((e) => e.title).sort());
      for (const b of eventBlocks) {
        expect(typeof b.startDate).toBe("string");
      }
    });
  }
});
