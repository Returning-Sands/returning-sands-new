// Re-encode the Old_Site deck slides (public/deck/1.png … 15.png, 1–4.3 MB
// each) into website-new/public/deck/ at <= 400 KB apiece (design.md
// "Performance"; Req 19.3, 19.4). Run with `npx tsx scripts/compress-images.ts`.
//
// Strategy per slide:
//   1. resize to at most MAX_WIDTH px wide (never upscale)
//   2. palette PNG, walking colour count down 256 → 32 until under budget
//   3. if still over budget at 32 colours, shrink the width in steps and retry
//
// The source directory and output directory can be overridden with the
// SOURCE_DECK and TARGET_DECK environment variables.

import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const MAX_BYTES = 400 * 1024;
const MAX_WIDTH = 1600;
const MIN_WIDTH = 800;
const WIDTH_STEP = 200;
const COLOUR_STEPS = [256, 192, 128, 96, 64, 48, 32];
const SLIDE_COUNT = 15;

const SOURCE_DIR =
  process.env.SOURCE_DECK ??
  path.resolve(process.cwd(), "..", "website", "public", "deck");
const TARGET_DIR =
  process.env.TARGET_DECK ?? path.resolve(process.cwd(), "public", "deck");

function kb(bytes: number): string {
  return `${(bytes / 1024).toFixed(0)} KB`;
}

async function encode(
  input: Buffer,
  width: number,
  colours: number,
): Promise<Buffer> {
  return sharp(input)
    .resize({ width, withoutEnlargement: true })
    .png({
      palette: true,
      colours,
      compressionLevel: 9,
      effort: 10,
      dither: 0.5,
    })
    .toBuffer();
}

async function compress(
  input: Buffer,
): Promise<{ output: Buffer; width: number; colours: number }> {
  let best: { output: Buffer; width: number; colours: number } | null = null;

  for (let width = MAX_WIDTH; width >= MIN_WIDTH; width -= WIDTH_STEP) {
    for (const colours of COLOUR_STEPS) {
      const output = await encode(input, width, colours);
      if (!best || output.length < best.output.length) {
        best = { output, width, colours };
      }
      if (output.length <= MAX_BYTES) {
        return { output, width, colours };
      }
    }
  }

  if (!best) throw new Error("encoder produced no output");
  return best;
}

async function main(): Promise<void> {
  await mkdir(TARGET_DIR, { recursive: true });

  let totalBefore = 0;
  let totalAfter = 0;
  const overBudget: string[] = [];

  console.log(`source: ${SOURCE_DIR}`);
  console.log(`target: ${TARGET_DIR}`);
  console.log(`budget: ${kb(MAX_BYTES)} per file, max ${MAX_WIDTH}px wide\n`);
  console.log(
    "file      before      after      saved   width  colours",
  );

  for (let i = 1; i <= SLIDE_COUNT; i += 1) {
    const name = `${i}.png`;
    const source = path.join(SOURCE_DIR, name);
    const target = path.join(TARGET_DIR, name);

    const input = await readFile(source);
    const before = (await stat(source)).size;
    const { output, width, colours } = await compress(input);
    await writeFile(target, output);

    const after = output.length;
    totalBefore += before;
    totalAfter += after;
    if (after > MAX_BYTES) overBudget.push(name);

    const saved = `${(100 - (after / before) * 100).toFixed(0)}%`;
    console.log(
      `${name.padEnd(8)} ${kb(before).padStart(9)}  ${kb(after).padStart(9)}  ${saved.padStart(7)}  ${String(width).padStart(5)}  ${String(colours).padStart(7)}${after > MAX_BYTES ? "  OVER BUDGET" : ""}`,
    );
  }

  console.log(
    `\ntotal     ${kb(totalBefore).padStart(9)}  ${kb(totalAfter).padStart(9)}  ${`${(100 - (totalAfter / totalBefore) * 100).toFixed(0)}%`.padStart(7)}`,
  );

  if (overBudget.length > 0) {
    console.error(
      `\n${overBudget.length} file(s) still exceed ${kb(MAX_BYTES)}: ${overBudget.join(", ")}`,
    );
    process.exitCode = 1;
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
