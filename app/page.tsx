import Link from "next/link";
import { film } from "@/content/film";
import { site } from "@/content/site";
import { CityList } from "@/components/home/CityList";
import { HashRedirect } from "@/components/home/HashRedirect";
import { PassportHero } from "@/components/home/PassportHero";
import { ExternalLink } from "@/components/layout/ExternalLink";
import { pageMetadata } from "@/lib/metadata";
import { present } from "@/lib/pending";

// Home (Req 2). Server component apart from `HashRedirect`.
//
// Above the fold (Req 2.1): kicker, bilingual title, one italic description,
// a filled Donate CTA and the trailer control. The trailer control reads the
// single `film.pending.trailerUrl` Placeholder (14.3): an `ExternalLink` when
// present (2.10), otherwise a disabled, non-focusable "Trailer coming soon"
// button (2.2, 14.9, design Property 6). Vertical rhythm is deliberately
// tight so the whole block clears the fold at 1280x800 and 375x667 before
// the Passport_Hero (2.3) and the plain-text city list (2.7) begin.
export const metadata = pageMetadata("home", "/");

const BUTTON =
  "inline-flex min-h-[44px] items-center justify-center px-5 py-2 font-mono text-sm uppercase tracking-wider focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nile-800";
const FILLED = `${BUTTON} border border-ink bg-ochre-500 text-sand-50 hover:bg-ochre-600`;
const OUTLINED = `${BUTTON} border border-ink bg-transparent text-ink hover:bg-sand-100`;
const DISABLED = `${OUTLINED} cursor-not-allowed opacity-60 hover:bg-transparent`;

export default function Home() {
  const trailerUrl = film.pending.trailerUrl;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:py-16">
      <section aria-labelledby="home-title">
        <p className="kicker">{site.kicker}</p>
        <h1 id="home-title" className="mt-3 font-display text-5xl font-bold tracking-tight md:text-7xl">
          {site.name}
        </h1>
        {/* Req 2.9: Arabic title with its own language and direction. */}
        <p lang="ar" dir="rtl" className="mt-1 text-2xl md:text-4xl">
          {site.arabicName}
        </p>
        <p className="mt-4 max-w-prose text-lg italic leading-relaxed">{site.description}</p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/donate" className={FILLED}>
            Donate
          </Link>
          {present(trailerUrl) ? (
            <ExternalLink href={trailerUrl} className={OUTLINED}>
              Watch the Trailer
            </ExternalLink>
          ) : (
            <button type="button" disabled aria-disabled="true" tabIndex={-1} className={DISABLED}>
              {film.trailerComingSoonText}
            </button>
          )}
        </div>
      </section>

      <PassportHero className="mt-12" />
      <CityList className="mt-8" />
      <HashRedirect />
    </div>
  );
}
