import Link from "next/link";
import Image from "next/image";
import { resolveAsset } from "@/lib/assets";
import { BOARDING_PASS_LABELS, eventCodeText, routeText } from "@/lib/boardingPass";

// Airline-ticket card for Event summaries (Req 6.6, 13.7) and the
// trailer-coming-soon card (Req 5.8). Server component.
//
// Two parts: the main leaf and a tear-off stub joined by a dashed seam; the
// `.perf` class punches the top and bottom edges. All fields are Mono_Font HTML
// text so they stay readable when the designer's template is layered behind
// (Req 20.9). `past` adds a "PAST" overprint as real text (Req 7.8). Labels
// come from `lib/boardingPass.ts`, shared with the Share_Card renderers.
export function BoardingPass({
  heading = BOARDING_PASS_LABELS.heading,
  from,
  to,
  code,
  dateText,
  title,
  href,
  past = false,
  compact = false,
  className = "",
}: {
  heading?: string;
  from: string;
  to: string;
  code?: string;
  dateText: string;
  title: string;
  href?: string;
  past?: boolean;
  compact?: boolean;
  className?: string;
}) {
  const asset = resolveAsset("boardingPass");
  const codeText = eventCodeText(code);
  const pad = compact ? "p-3" : "p-5";
  const titleSize = compact ? "text-sm" : "text-lg";

  const card = (
    <div
      className={`perf relative flex overflow-hidden border border-ink bg-sand-100 font-mono text-ink ${className}`}
    >
      {asset.kind === "designer" ? (
        <Image
          src={asset.src}
          alt=""
          aria-hidden="true"
          fill
          sizes="(min-width: 768px) 640px, 100vw"
          className="pointer-events-none object-cover"
        />
      ) : null}

      {/* Main leaf */}
      <div className={`relative grid flex-1 gap-2 ${pad}`}>
        <div className="flex items-baseline justify-between gap-4 text-[0.65rem] uppercase tracking-[0.18em]">
          <span>{heading}</span>
          <span>{BOARDING_PASS_LABELS.brand}</span>
        </div>
        <div className={`flex items-baseline justify-between gap-4 ${compact ? "text-base" : "text-2xl"} font-semibold`}>
          <span>{routeText(from, to)}</span>
          <span className="text-xs font-normal uppercase tracking-[0.18em]">{dateText}</span>
        </div>
        <p className={`${titleSize} leading-snug`}>{title}</p>
      </div>

      {/* Tear-off stub */}
      <div
        className={`relative flex shrink-0 flex-col items-center justify-center gap-1 border-s-2 border-dashed border-ink text-center text-[0.65rem] uppercase tracking-[0.18em] ${compact ? "w-20 p-2" : "w-28 p-4"}`}
      >
        {codeText ? <span className="font-semibold">{codeText}</span> : null}
        <span>{routeText(from, to)}</span>
      </div>

      {past ? (
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-12 border-4 border-stamp-700 px-3 py-1 text-base font-semibold uppercase tracking-[0.3em] text-stamp-700">
          PAST
        </span>
      ) : null}
    </div>
  );

  return href ? (
    <Link href={href} className="block no-underline">
      {card}
    </Link>
  ) : (
    card
  );
}
