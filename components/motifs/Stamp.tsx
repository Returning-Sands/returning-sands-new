import Image from "next/image";
import { resolveAsset } from "@/lib/assets";

// Oval Returning Sands stamp (Req 13.7). Server component.
//
// The text is always real HTML — bilingual "RETURNING SANDS / عودة الرمال" in
// the Mono_Font, an optional rectangular `subLabel` box and an optional
// "PAST" / "DENIED" overprint that is NOT aria-hidden because it carries
// meaning (Req 7.8). When the designer's `stamp-oval.svg` is switched on via
// `site.designAssets.stampOval` it is layered behind the text as a decorative
// image; the text stays HTML (Req 20.9). `decorative` hides the whole stamp
// from assistive technology for purely ornamental uses (Req 13.12).

export type StampOverprint = "PAST" | "DENIED";

const OVERPRINT_TONE: Record<StampOverprint, string> = {
  PAST: "border-stamp-700 text-stamp-700",
  DENIED: "border-accent-brick-red text-accent-brick-red",
};

export function Stamp({
  subLabel,
  size = 160,
  tilt,
  overprint,
  decorative = false,
  className = "",
}: {
  subLabel?: string;
  /** Width of the oval in CSS pixels; height follows at a 3:2 ratio. */
  size?: number;
  /** CSS angle, e.g. `"-4deg"`, applied as a resting rotation. */
  tilt?: string;
  overprint?: StampOverprint;
  decorative?: boolean;
  className?: string;
}) {
  const asset = resolveAsset("stampOval");
  const height = Math.round(size * 0.66);

  return (
    <div
      className={`relative inline-flex flex-col items-center font-mono text-ink ${className}`}
      style={tilt ? { transform: `rotate(${tilt})` } : undefined}
      aria-hidden={decorative ? "true" : undefined}
    >
      <div
        className="relative flex items-center justify-center overflow-hidden rounded-[50%] border-2 border-dashed border-ink text-center"
        style={{ width: size, height }}
      >
        {asset.kind === "designer" ? (
          <Image
            src={asset.src}
            alt=""
            aria-hidden="true"
            fill
            sizes={`${size}px`}
            className="pointer-events-none object-contain"
          />
        ) : null}
        <span className="relative flex flex-col items-center gap-0.5 px-3 text-[0.65rem] font-semibold uppercase leading-tight tracking-[0.18em]">
          <span>RETURNING SANDS</span>
          <span lang="ar" dir="rtl" className="normal-case tracking-normal">
            عودة الرمال
          </span>
        </span>
      </div>

      {subLabel ? (
        <span className="mt-2 inline-block border-2 border-ink px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.18em]">
          {subLabel}
        </span>
      ) : null}

      {overprint ? (
        <span
          className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-12 border-4 px-3 py-1 text-base font-semibold uppercase tracking-[0.3em] ${OVERPRINT_TONE[overprint]}`}
        >
          {overprint}
        </span>
      ) : null}
    </div>
  );
}
