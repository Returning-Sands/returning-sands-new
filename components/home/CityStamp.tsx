import Link from "next/link";
import { resolveAsset } from "@/lib/assets";
import type { City } from "@/lib/types";

// One City_Stamp on the right-hand passport page (Req 2.4, 2.5, 2.6, 2.8,
// 2.11). Server component.
//
// The anchor is a `next/link` whose only text is the city name, so the
// accessible name always contains the city (2.4). It keeps a 44x44 CSS pixel
// minimum so it stays tappable when the spread stacks below `md` (2.8). The
// resting border is `stamp-600`; hover darkens it to `stamp-700` within the
// 150 ms transition (2.5) and keyboard focus draws a `nile-800` outline (2.6).
//
// When the designer's per-city stamps are switched on via
// `site.designAssets.cityStamps`, the SVG at `/design/city-stamps/{city}.svg`
// is layered in as a CSS background only; the anchor, its text and its focus
// behaviour are identical in both modes (2.11, 20.9).

/** Alternating resting tilt so the three stamps read as hand-applied. */
const TILT: Record<City, string> = {
  london: "-rotate-2",
  cairo: "rotate-1",
  nyc: "-rotate-1",
};

export function CityStamp({ city, name, href }: { city: City; name: string; href: string }) {
  const asset = resolveAsset("cityStamps");
  const style =
    asset.kind === "designer"
      ? { backgroundImage: `url(${asset.src}${city}.svg)`, backgroundSize: "contain", backgroundRepeat: "no-repeat" }
      : undefined;

  return (
    <Link
      href={href}
      style={style}
      className={`inline-flex min-h-[44px] min-w-[44px] items-center justify-center border-2 border-stamp-600 bg-sand-50 px-5 py-3 font-mono text-sm font-semibold uppercase tracking-[0.2em] text-ink transition-colors duration-150 hover:border-stamp-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nile-800 ${TILT[city]}`}
    >
      {name}
    </Link>
  );
}
