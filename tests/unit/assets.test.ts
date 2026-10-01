// Guards the static assets ported from the Old_Site (design.md "Repository
// layout" and "Performance"; Req 13.14, 19.3, 19.4).
import { existsSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const PUBLIC_DIR = path.resolve(__dirname, "..", "..", "public");
const DECK_DIR = path.join(PUBLIC_DIR, "deck");
const MAX_DECK_BYTES = 400 * 1024;

// Every image path the design document lists under public/.
const IMG_FILES = [
  "ali.jpg",
  "barbers.jpg",
  "bridge.jpg",
  "gateway.jpg",
  "meroe.jpg",
  "portrait.jpg",
  "woman.jpg",
  "stamp-magazine.png",
  "stamp-sudan.png",
];
const DECK_FILES = Array.from({ length: 15 }, (_, i) => `${i + 1}.png`);
const EXPECTED_PATHS = [
  ...IMG_FILES.map((f) => `/img/${f}`),
  ...DECK_FILES.map((f) => `/deck/${f}`),
];

describe("public assets", () => {
  it.each(EXPECTED_PATHS)("%s exists under public/", (urlPath) => {
    expect(existsSync(path.join(PUBLIC_DIR, urlPath))).toBe(true);
  });

  it("deck/ contains exactly the fifteen slides", () => {
    const files = readdirSync(DECK_DIR).sort();
    expect(files).toEqual([...DECK_FILES].sort());
  });

  it("every deck slide is <= 400 KB", () => {
    const oversized = readdirSync(DECK_DIR)
      .map((name) => ({ name, size: statSync(path.join(DECK_DIR, name)).size }))
      .filter(({ size }) => size > MAX_DECK_BYTES)
      .map(({ name, size }) => `${name} (${(size / 1024).toFixed(0)} KB)`);
    expect(oversized).toEqual([]);
  });

  it("design/ and fonts/ directories are present for Designer_Assets and AVRO", () => {
    expect(existsSync(path.join(PUBLIC_DIR, "design", ".gitkeep"))).toBe(true);
    expect(existsSync(path.join(PUBLIC_DIR, "fonts", ".gitkeep"))).toBe(true);
  });
});
