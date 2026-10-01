/**
 * Share_Card fonts for `ImageResponse` (design.md "Share_Cards", Req 16.5).
 *
 * Satori cannot use `next/font`, so the Display_Font (Bitter 700) and the
 * Mono_Font (IBM Plex Mono 400) are read as raw buffers from the `@fontsource`
 * packages installed in task 1.2. Only the `.woff` variants are used:
 * `ImageResponse` accepts ttf / otf / woff but **not** woff2
 * (docs/NEXT16_NOTES.md item 2). The two latin subsets total ~35 KB, well
 * inside the 500 KB per-route bundle cap.
 *
 * The read is done once per process and the promise cached at module scope,
 * so the thirteen `opengraph-image` routes share a single filesystem read.
 */
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export type OgFont = {
  name: string;
  data: Buffer;
  weight: 400 | 700;
  style: "normal";
};

const BITTER_700 = "node_modules/@fontsource/bitter/files/bitter-latin-700-normal.woff";
const PLEX_MONO_400 = "node_modules/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff";

/** Font family names as referenced from the card JSX `fontFamily` styles. */
export const OG_FONT_DISPLAY = "Bitter";
export const OG_FONT_MONO = "IBM Plex Mono";

function readFont(relPath: string): Promise<Buffer> {
  // The ignore comment stops Turbopack from tracing node_modules/@fontsource
  // into the route bundle; the file is read from disk at prerender time.
  return readFile(join(/*turbopackIgnore: true*/ process.cwd(), relPath));
}

let cached: Promise<OgFont[]> | undefined;

/** Bitter 700 and IBM Plex Mono 400 as `ImageResponse` `fonts` entries. */
export function loadOgFonts(): Promise<OgFont[]> {
  cached ??= Promise.all([readFont(BITTER_700), readFont(PLEX_MONO_400)]).then(([bitter, mono]) => [
    { name: OG_FONT_DISPLAY, data: bitter, weight: 700, style: "normal" },
    { name: OG_FONT_MONO, data: mono, weight: 400, style: "normal" },
  ]);
  return cached;
}
