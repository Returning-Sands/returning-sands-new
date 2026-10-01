// The single font declaration file (Req 13.5, 13.6). The root layout applies
// `display.variable` and `mono.variable` on <html>; app/globals.css reads
// `var(--font-display)` and `var(--font-mono)` through the `font-display` and
// `font-mono` utilities. No other file knows which Display_Font is loaded.
//
// ── Switching the Display_Font (edit ONLY this file) ────────────────────
//
// next/font requires every loader call to be a bare `const x = Loader({...})`
// at module scope with literal options, so `USE_AVRO ? localFont() : Bitter()`
// is rejected at build time ("Font loaders must be called and assigned to a
// const in the module scope"). The two candidate declarations therefore live
// in sibling modules and this file picks one with a static import:
//
//   1. set USE_AVRO below to `true`
//   2. change the import line to "./fonts.display.avro"
//
// The `typeof IS_AVRO` annotation on USE_AVRO makes `tsc` fail if the flag
// and the imported module disagree, so a half-done switch cannot build. The
// unused sibling is never compiled by Next, which is what lets the AVRO module
// reference font files that are not yet in public/fonts/.
import { IBM_Plex_Mono } from "next/font/google";
import { display, IS_AVRO } from "./fonts.display.bitter";

// Display_Font: flip when the AVRO web licence is confirmed and the files are
// in public/fonts/ (see the steps above).
export const USE_AVRO: typeof IS_AVRO = false;

export { display };

// Mono_Font: IBM Plex Mono, weights 400 and 600 only (Req 13.2). Self-hosted
// at build time; no runtime request to a third-party font host.
export const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "600"],
  display: "swap",
  variable: "--font-mono",
});
