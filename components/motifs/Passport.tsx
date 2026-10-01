import type { ReactNode } from "react";
import Image from "next/image";
import { resolveAsset } from "@/lib/assets";

// Passport motif (Req 13.7): a dark cover or an open two-page spread. Server
// component. The bilingual title on the cover is HTML text; the designer's
// `passport-cover.svg` / `passport-spread.png` (switched via
// `site.designAssets`) sit behind the content as decorative images (Req 20.9).
// The spread stacks to one column below `md` (Req 2.8).
export function Passport({
  variant,
  left,
  right,
  children,
  className = "",
}: {
  variant: "cover" | "spread";
  /** Spread only: content of the left page. */
  left?: ReactNode;
  /** Spread only: content of the right page (falls back to `children`). */
  right?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  if (variant === "cover") {
    const asset = resolveAsset("passportCover");
    return (
      <div className={`relative overflow-hidden border border-sand-300 bg-nile-900 p-2 text-sand-100 ${className}`}>
        {asset.kind === "designer" ? (
          <Image
            src={asset.src}
            alt=""
            aria-hidden="true"
            fill
            sizes="(min-width: 768px) 480px, 100vw"
            className="pointer-events-none object-cover"
          />
        ) : null}
        <div className="relative flex flex-col items-center gap-3 border border-sand-300 px-6 py-10 text-center font-mono">
          <span lang="ar" dir="rtl" className="text-2xl">
            عودة الرمال
          </span>
          <span className="text-sm font-semibold uppercase tracking-[0.3em]">RETURNING SANDS</span>
          {children ? <div className="flex flex-col items-center">{children}</div> : null}
          <span className="mt-4 text-xs uppercase tracking-[0.3em]">PASSPORT</span>
        </div>
      </div>
    );
  }

  const asset = resolveAsset("passportSpread");
  return (
    <div className={`relative overflow-hidden border border-ink ${className}`}>
      {asset.kind === "designer" ? (
        <Image
          src={asset.src}
          alt=""
          aria-hidden="true"
          fill
          sizes="(min-width: 1024px) 960px, 100vw"
          className="pointer-events-none object-cover"
        />
      ) : null}
      <div className="relative grid md:grid-cols-2">
        <div className="bg-sand-100 p-6 md:p-10">{left}</div>
        <div className="bg-sand-100 p-6 md:p-10">{right ?? children}</div>
        {/* Centre gutter shadow — decorative, only on the two-page layout. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-8 -translate-x-1/2 bg-linear-to-r from-ink/15 via-transparent to-ink/15 md:block"
        />
      </div>
    </div>
  );
}
