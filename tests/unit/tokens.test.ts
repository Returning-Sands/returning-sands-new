// Guards the generated Design_Token table (design.md "Design_Tokens";
// Req 13.1). lib/tokens.ts is produced from app/globals.css by
// scripts/extract-tokens.ts and committed, so this also catches a stale copy.
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { tokens } from "@/lib/tokens";

const OLD_SITE_COLOURS = [
  "sand-50",
  "sand-100",
  "sand-200",
  "sand-300",
  "sand-400",
  "ochre-500",
  "ochre-600",
  "nile-700",
  "nile-800",
  "nile-900",
  "ink",
  "stamp-200",
  "stamp-400",
  "stamp-500",
  "stamp-600",
  "stamp-700",
] as const;

const ACCENTS = [
  "accent-ochre-yellow",
  "accent-deep-blue",
  "accent-brick-red",
  "accent-pale-pink",
  "accent-dusty-blue",
  "accent-terracotta",
] as const;

const HEX_COLOUR = /^#(?:[0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

describe("lib/tokens.ts", () => {
  it("contains the sixteen Old_Site colours", () => {
    expect(OLD_SITE_COLOURS).toHaveLength(16);
    for (const name of OLD_SITE_COLOURS) {
      expect(tokens, `missing token ${name}`).toHaveProperty(name);
    }
  });

  it("contains exactly the six accent tokens", () => {
    expect(ACCENTS).toHaveLength(6);
    for (const name of ACCENTS) {
      expect(tokens, `missing token ${name}`).toHaveProperty(name);
    }
    const accentNames = Object.keys(tokens).filter((k) => k.startsWith("accent-"));
    expect(accentNames.sort()).toEqual([...ACCENTS].sort());
  });

  it("every value is a hex colour", () => {
    for (const [name, value] of Object.entries(tokens)) {
      expect(value, `${name} = ${value}`).toMatch(HEX_COLOUR);
    }
  });

  it("matches the :root block of app/globals.css (not stale)", () => {
    const css = readFileSync(
      path.resolve(__dirname, "..", "..", "app", "globals.css"),
      "utf8",
    ).replace(/\/\*[\s\S]*?\*\//g, "");
    const root = /:root\s*\{([^}]*)\}/.exec(css);
    expect(root).not.toBeNull();

    const fromCss: Record<string, string> = {};
    for (const [, name, value] of root![1].matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)) {
      fromCss[name] = value.trim();
    }
    expect(tokens).toEqual(fromCss);
  });
});
