// Generates lib/tokens.ts from the `:root` block of app/globals.css.
//
// globals.css is the only hand-edited colour source (Req 13.1). The
// Share_Card renderers (app/**/opengraph-image.tsx) cannot read CSS custom
// properties from `ImageResponse`, so they import the same hex values from
// the generated lib/tokens.ts instead. Runs as the `prebuild` npm script and
// can be run by hand with `npx tsx scripts/extract-tokens.ts`.
//
// The generated file is committed so that editors, `tsc` and Vitest see it
// without a build step; tests/unit/tokens.test.ts fails if it goes stale.

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const CSS_PATH = path.join(ROOT, "app", "globals.css");
const OUT_PATH = path.join(ROOT, "lib", "tokens.ts");

/** Returns the body of the first top-level `:root { … }` rule. */
function rootBlock(css: string): string {
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const match = /:root\s*\{([^}]*)\}/.exec(withoutComments);
  if (!match) {
    throw new Error(`No :root block found in ${CSS_PATH}`);
  }
  return match[1];
}

/** Parses `--name: value;` declarations into an ordered name → value map. */
function parseCustomProperties(block: string): Record<string, string> {
  const tokens: Record<string, string> = {};
  const declaration = /--([\w-]+)\s*:\s*([^;]+);/g;
  for (const [, name, value] of block.matchAll(declaration)) {
    tokens[name] = value.trim();
  }
  return tokens;
}

function renderTokensModule(tokens: Record<string, string>): string {
  const entries = Object.entries(tokens)
    .map(([name, value]) => `  ${JSON.stringify(name)}: ${JSON.stringify(value)},`)
    .join("\n");
  return [
    "// generated, do not edit — produced by scripts/extract-tokens.ts from the",
    "// `:root` block of app/globals.css. Edit the CSS and run `npm run prebuild`.",
    "//",
    "// Used by the Share_Card renderers (app/**/opengraph-image.tsx), which",
    "// cannot read CSS custom properties from ImageResponse (design.md",
    "// \"Design_Tokens\"; Req 13.1).",
    "export const tokens = {",
    entries,
    "} as const;",
    "",
    "export type TokenName = keyof typeof tokens;",
    "",
  ].join("\n");
}

function main(): void {
  const css = readFileSync(CSS_PATH, "utf8");
  const tokens = parseCustomProperties(rootBlock(css));
  const count = Object.keys(tokens).length;
  if (count === 0) {
    throw new Error(`No custom properties found in the :root block of ${CSS_PATH}`);
  }

  const next = renderTokensModule(tokens);
  let previous: string | null = null;
  try {
    previous = readFileSync(OUT_PATH, "utf8");
  } catch {
    previous = null;
  }

  if (previous === next) {
    console.log(`lib/tokens.ts up to date (${count} tokens)`);
    return;
  }
  writeFileSync(OUT_PATH, next);
  console.log(`wrote lib/tokens.ts (${count} tokens)`);
}

main();
