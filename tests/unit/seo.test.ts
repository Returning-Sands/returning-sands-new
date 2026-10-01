// Sitemap, robots, noindex metadata and the stand-in icons (Requirements
// 16.8, 16.13, 20.4, 20.5).
import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { SITE_URL, pageMetadata } from "@/lib/metadata";
import { INDEXABLE_ROUTES, NOINDEX_ROUTES } from "@/lib/routes";
import { buildRobots, buildSitemap } from "@/lib/sitemap";

const APP_DIR = path.resolve(__dirname, "..", "..", "app");

describe("buildSitemap(INDEXABLE_ROUTES)", () => {
  const entries = buildSitemap(INDEXABLE_ROUTES);
  const urls = entries.map((e) => e.url);

  it("has one entry per indexable route (13), all unique", () => {
    expect(entries).toHaveLength(13);
    expect(new Set(urls).size).toBe(13);
  });

  it("uses absolute URLs on the production origin", () => {
    for (const url of urls) {
      expect(url.startsWith(SITE_URL)).toBe(true);
    }
  });

  it("excludes every noindex route", () => {
    for (const { path: p } of NOINDEX_ROUTES) {
      expect(urls).not.toContain(`${SITE_URL}${p}`);
    }
    expect(urls.some((u) => u.includes("/museum/thanks"))).toBe(false);
  });

  it("gives the root the bare origin and priority 1; others 0.7 without trailing slash", () => {
    const root = entries.find((e) => e.url === SITE_URL);
    expect(root).toBeDefined();
    expect(root?.priority).toBe(1);
    for (const e of entries) {
      expect(e.url.endsWith("/")).toBe(false);
      expect(e.changeFrequency).toBe("monthly");
      expect(typeof e.lastModified).toBe("string");
      if (e.url !== SITE_URL) expect(e.priority).toBe(0.7);
    }
  });
});

describe("buildRobots()", () => {
  it("allows / for every user agent and references the sitemap", () => {
    const robots = buildRobots();
    expect(robots.rules).toEqual({ userAgent: "*", allow: "/" });
    expect(robots.sitemap).toBe(`${SITE_URL}/sitemap.xml`);
    expect(robots.host).toBe(SITE_URL);
  });
});

describe("noindex metadata", () => {
  it("sets index:false for /museum/thanks and the 404", () => {
    expect(pageMetadata("museumThanks", "/museum/thanks", { noindex: true }).robots).toEqual({
      index: false,
      follow: false,
    });
    expect(pageMetadata("notFound", "/404", { noindex: true }).robots).toEqual({
      index: false,
      follow: false,
    });
  });

  it("leaves robots undefined on an indexable page", () => {
    expect(pageMetadata("about", "/about").robots).toBeUndefined();
  });
});

describe("stand-in icons", () => {
  it("app/icon.svg exists and is a 64x64-viewBox SVG", () => {
    const file = path.join(APP_DIR, "icon.svg");
    expect(existsSync(file)).toBe(true);
    const svg = readFileSync(file, "utf8");
    expect(svg).toContain("<svg");
    expect(svg).toContain('viewBox="0 0 64 64"');
  });

  it("app/apple-icon.png exists and is 180x180", async () => {
    const file = path.join(APP_DIR, "apple-icon.png");
    expect(existsSync(file)).toBe(true);
    expect(statSync(file).size).toBeGreaterThan(0);
    const meta = await sharp(file).metadata();
    expect(meta.format).toBe("png");
    expect(meta.width).toBe(180);
    expect(meta.height).toBe(180);
  });
});
