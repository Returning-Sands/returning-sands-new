// Display_Font while no AVRO web licence is confirmed (Req 13.4). Bitter is
// chosen over Zilla Slab because it has a true italic (needed for the italic
// Home description, Req 2.1). next/font/google downloads the files at build
// time and self-hosts them, so no runtime request goes to Google.
//
// Do not import this file directly — lib/fonts.ts is the single switch.
import { Bitter } from "next/font/google";

export const IS_AVRO = false;

export const display = Bitter({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-display",
});
