import Link from "next/link";

import { Figure } from "@/components/content/Figure";
import { Prose } from "@/components/content/Prose";
import { site } from "@/content/site";
import { pageMetadata } from "@/lib/metadata";

// What's at Stake (Req 4). Every string on the page comes from `site.atStake`
// so the copy has exactly one home (4.2, 4.4). The validator (lib/validate.ts)
// guarantees the quote, body paragraphs and stat are non-empty before this
// renders (4.7).
export const metadata = pageMetadata("atStake", "/at-stake");

// The page's only <h1> (Req 4.1). A structural label, not editorial copy.
const PAGE_HEADING = "What's at Stake";

// Archival images sit in a single column on phones and half-width from `md`
// up, so the srcset only needs to cover those two widths (Req 13.14, 19.4).
export const AT_STAKE_IMAGE_SIZES = "(min-width: 768px) 50vw, 100vw";

const LINK_CLASS =
  "inline-block font-mono text-sm uppercase tracking-wider underline decoration-2 underline-offset-4 hover:text-ochre-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nile-800";

export default function AtStakePage() {
  const { quote, quoteBy, body, stat, images } = site.atStake;

  return (
    <article className="mx-auto max-w-3xl px-4 py-16 md:py-24">
      <header>
        <p className="kicker">Why it matters</p>
        <h1 className="mt-4 font-display text-4xl font-bold tracking-tight md:text-6xl">
          {PAGE_HEADING}
        </h1>
      </header>

      {/* Framing quote: the first content element after the h1 (Req 4.1). The
          attribution lives in <figcaption><cite> so assistive tech reads it
          as the source of the blockquote, not as body copy. */}
      <figure className="mt-12 border-s-4 border-stamp-500 ps-6">
        <blockquote className="font-display text-xl italic leading-relaxed md:text-2xl">
          <p>{quote}</p>
        </blockquote>
        <figcaption className="mt-4 font-mono text-sm uppercase tracking-widest text-nile-700">
          — <cite className="not-italic">{quoteBy}</cite>
        </figcaption>
      </figure>

      <div className="divider-rule mt-14" aria-hidden="true" />

      {/* One <p> per Content_File paragraph, in file order (Req 4.2). */}
      <Prose paragraphs={body} className="mt-14 max-w-prose text-lg" />

      {/* Highlighted statistic (Req 4.3, 4.4): numeral at >= 2x the body size
          (text-5xl = 48px vs the 18px body) in the stamp palette, followed
          immediately by its label inside the same <p>. */}
      <p className="mt-14 flex flex-col gap-2 border border-ink bg-sand-100 px-6 py-8 md:flex-row md:items-baseline md:gap-5">
        <span className="font-mono text-5xl font-semibold text-stamp-700 md:text-6xl">{stat.value}</span>
        <span className="font-display text-lg leading-snug">{stat.label}</span>
      </p>

      {/* 1–5 archival images (Req 4.5). Only the first is above the fold, so it
          alone is preloaded; `preload` not `priority` (docs/NEXT16_NOTES.md 8). */}
      <div className="mt-14 grid gap-6 md:grid-cols-2">
        {images.map((image, i) => (
          <Figure key={image.src} image={image} sizes={AT_STAKE_IMAGE_SIZES} preload={i === 0} />
        ))}
      </div>

      <div className="perf-seam mt-14" aria-hidden="true" />

      {/* Closing links: last content element above the Footer (Req 4.6, 12.10). */}
      <nav aria-label="Where next" className="mt-10 flex flex-wrap gap-x-8 gap-y-4">
        <Link href="/film" className={LINK_CLASS}>
          Watch the documentary
        </Link>
        <Link href="/donate" className={LINK_CLASS}>
          Support the campaign
        </Link>
      </nav>
    </article>
  );
}
