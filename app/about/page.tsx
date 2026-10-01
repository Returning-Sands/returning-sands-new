import Link from "next/link";

import { Prose } from "@/components/content/Prose";
import { site } from "@/content/site";
import { pageMetadata } from "@/lib/metadata";

// About page (Req 3). Three sections in fixed order, every body string pulled
// from `site.about` so the copy has exactly one home (3.7). The validator
// (lib/validate.ts) guarantees the arrays are non-empty and goals.length === 5
// before this ever renders (3.4, 3.8).
export const metadata = pageMetadata("about", "/about");

// The page's only <h1>; reuses the SEO title so the tab and the headline agree.
const PAGE_HEADING = site.pages.about.title;

// Section headings are structural labels (Req 3.1), not editorial copy, so
// they live here rather than in the Content_File.
const HEADINGS = { aboutUs: "About us", mission: "Mission", goals: "Goals" } as const;

// Passport-page-style numeral: "01" … "05" (Req 3.5).
function entryNumber(index: number): string {
  return String(index + 1).padStart(2, "0");
}

const LINK_CLASS =
  "inline-block font-mono text-sm uppercase tracking-wider underline decoration-2 underline-offset-4 hover:text-ochre-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nile-800";

export default function AboutPage() {
  const { aboutUs, mission, goals } = site.about;

  return (
    <article className="mx-auto max-w-3xl px-4 py-16 md:py-24">
      <header>
        <p className="kicker">Who we are</p>
        <h1 className="mt-4 font-display text-4xl font-bold tracking-tight md:text-6xl">
          {PAGE_HEADING}
        </h1>
      </header>

      <div className="perf-seam mt-12" aria-hidden="true" />

      <section aria-labelledby="about-us-heading" className="mt-12">
        <h2 id="about-us-heading" className="font-mono text-sm uppercase tracking-widest text-ochre-600">
          {HEADINGS.aboutUs}
        </h2>
        <Prose paragraphs={aboutUs} className="mt-6 max-w-prose text-lg" />
      </section>

      <div className="divider-rule mt-14" aria-hidden="true" />

      <section aria-labelledby="mission-heading" className="mt-14">
        <h2 id="mission-heading" className="font-mono text-sm uppercase tracking-widest text-ochre-600">
          {HEADINGS.mission}
        </h2>
        <Prose paragraphs={mission} className="mt-6 max-w-prose text-lg" />
      </section>

      <div className="divider-rule mt-14" aria-hidden="true" />

      <section aria-labelledby="goals-heading" className="mt-14">
        <h2 id="goals-heading" className="font-mono text-sm uppercase tracking-widest text-ochre-600">
          {HEADINGS.goals}
        </h2>
        {/* `list-none` hides the browser marker; the <ol> keeps its semantics
            and the visible numeral is the aria-hidden span (Req 3.4, 3.5). */}
        <ol className="mt-6 flex max-w-prose list-none flex-col gap-6 p-0">
          {goals.map((goal, i) => (
            <li key={goal} className="flex items-baseline gap-5">
              <span
                aria-hidden="true"
                className="shrink-0 font-mono text-sm font-medium tracking-widest text-stamp-600"
              >
                {entryNumber(i)}
              </span>
              <span className="font-display text-lg leading-relaxed">{goal}</span>
            </li>
          ))}
        </ol>
      </section>

      <div className="perf-seam mt-14" aria-hidden="true" />

      <nav aria-label="Where next" className="mt-10 flex flex-wrap gap-x-8 gap-y-4">
        <Link href="/team" className={LINK_CLASS}>
          Meet the team
        </Link>
        <Link href="/donate" className={LINK_CLASS}>
          Support the mission
        </Link>
      </nav>
    </article>
  );
}
