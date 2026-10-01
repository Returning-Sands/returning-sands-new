// Display_Font once the AVRO web licence is confirmed and AVRO-Regular.woff2
// and AVRO-Bold.woff2 are committed to public/fonts/ (Req 13.3). The paths
// resolve relative to this file. If either file is missing, next/font/local
// fails the build with an error naming the missing file (Req 13.15); it never
// silently falls back to another typeface.
//
// This module is only compiled when lib/fonts.ts imports it, so it can sit in
// the repository while the font files are still absent.
//
// Do not import this file directly — lib/fonts.ts is the single switch.
import localFont from "next/font/local";

export const IS_AVRO = true;

export const display = localFont({
  src: [
    { path: "../public/fonts/AVRO-Regular.woff2", weight: "400" },
    { path: "../public/fonts/AVRO-Bold.woff2", weight: "700" },
  ],
  display: "swap",
  variable: "--font-display",
});
