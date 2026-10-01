// Feature: returning-sands-new-site, Req 13.17: logical CSS properties only.
// Second line of defence behind the ESLint rule: greps every component and
// page for physical-direction Tailwind utilities so an RTL (Arabic) edition
// mirrors the layout without per-component edits.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const DIRS = ["app", "components"].map((d) => join(ROOT, d));

// Same pattern as eslint.config.mjs. `left-1/2` (symmetric centring with
// -translate-x-1/2) is the one allowed physical utility.
const PHYSICAL_DIRECTION =
  /(?<![\w-])(?:(?:ml|mr|pl|pr|right|border-l|border-r|rounded-l|rounded-r|scroll-ml|scroll-mr|scroll-pl|scroll-pr)-|text-(?:left|right)(?![\w-])|left-(?!1\/2(?![\w/])))/g;

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.tsx?$/.test(name)) out.push(p);
  }
  return out;
}

// Only inspect string and template literals, not comments or identifiers,
// so prose like "left-to-right" in a comment doesn't trip the check.
function stringLiterals(source: string): string[] {
  const out: string[] = [];
  // [^] alternatives already span newlines, so no `s` flag is needed.
  const re = /"((?:[^"\\]|\\[^])*)"|'((?:[^'\\]|\\[^])*)'|`((?:[^`\\]|\\[^])*)`/g;
  for (const m of source.matchAll(re)) out.push(m[1] ?? m[2] ?? m[3] ?? "");
  return out;
}

describe("Req 13.17: no physical-direction Tailwind utilities", () => {
  const files = DIRS.flatMap((d) => walk(d));

  it("scans a meaningful number of files", () => {
    expect(files.length).toBeGreaterThan(20);
  });

  it("finds no physical-direction utility in any string literal", () => {
    const offenders: string[] = [];
    for (const file of files) {
      const src = readFileSync(file, "utf8");
      for (const lit of stringLiterals(src)) {
        const hits = [...lit.matchAll(PHYSICAL_DIRECTION)].map((m) => m[0]);
        if (hits.length) {
          offenders.push(`${relative(ROOT, file)}: ${hits.join(", ")}`);
        }
      }
    }
    expect(offenders, offenders.join("\n")).toEqual([]);
  });
});
