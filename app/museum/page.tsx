import Image from "next/image";

import { Prose } from "@/components/content/Prose";
import { Roadmap } from "@/components/museum/Roadmap";
import { AdmissionTicket } from "@/components/motifs/AdmissionTicket";
import { museum } from "@/content/museum";
import { site } from "@/content/site";
import { pageMetadata } from "@/lib/metadata";
import { present } from "@/lib/pending";
import type { ImageRef } from "@/lib/types";

// Virtual Museum teaser page (Req 8, 9). Five sections in fixed document order,
// each with a visible heading, all copy from content/museum.ts (8.1):
//   (a) hero — h1, intro, first Admission_Ticket
//   (b) What it is — paragraphs, work-of-Amer slot, funder block iff present
//   (c) What it will hold — <ul> of collections
//   (d) Roadmap — vertical timeline
//   (e) Reserve your ticket — second Admission_Ticket
//
// Both tickets read the single `site.pending.emailProvider` Placeholder so they
// are enabled/disabled together (8.2, 9.3). They are the only forms on the
// page; nothing here invites submissions to the archive (8.9) and nothing
// opens on load, delay or scroll (8.10).
export const metadata = pageMetadata("museum", "/museum");

// Structural section labels (Req 8.1), not editorial copy.
const HEADINGS = {
  whatItIs: "What it is",
  whatItWillHold: "What it will hold",
  roadmap: "Roadmap",
  reserve: "Reserve your ticket",
} as const;

// Exact wording required by Req 8.5 — rendered as a plain dashed `.pending`
// block (no brackets), unlike the generic Pending marker.
const WORK_OF_AMER_NOTE = "Copy on the work of Amer to follow";

const H2 = "font-mono text-sm uppercase tracking-widest text-ochre-600";

export default function MuseumPage() {
  const funder = site.pending.funderAcknowledgement;
  const workOfAmer = museum.pending.workOfAmer;

  return (
    <article className="mx-auto max-w-3xl px-4 py-16 md:py-24">
      {/* (a) Hero */}
      <header>
        <p className="kicker">A museum in planning</p>
        <h1 className="mt-4 font-display text-4xl font-bold tracking-tight md:text-6xl">Virtual Museum</h1>
        <Prose paragraphs={museum.intro} className="mt-8 max-w-prose text-lg" />
        <AdmissionTicket config={site.pending.emailProvider} id="ticket-hero" copy={museum.ticket} className="mt-10" />
      </header>

      <div className="perf-seam mt-14" aria-hidden="true" />

      {/* (b) What it is */}
      <section aria-labelledby="museum-what-it-is" className="mt-14">
        <h2 id="museum-what-it-is" className={H2}>
          {HEADINGS.whatItIs}
        </h2>
        <Prose paragraphs={museum.whatItIs} className="mt-6 max-w-prose text-lg" />

        {/* Req 8.5: the work-of-Amer paragraph, or its dashed note — never an empty <p>. */}
        {present(workOfAmer) ? (
          <p className="mt-4 max-w-prose text-lg leading-relaxed">{workOfAmer}</p>
        ) : (
          <div className="pending mt-4 max-w-prose" role="note">
            {WORK_OF_AMER_NOTE}
          </div>
        )}

        {/* Req 8.4, 17.5, 17.6: funder acknowledgement iff present; logo iff present. */}
        {present(funder) ? (
          <aside
            aria-label="Funder acknowledgement"
            className="mt-10 flex flex-wrap items-center gap-6 border-t border-ink pt-8"
          >
            {funder.logo ? <FunderLogo logo={funder.logo} /> : null}
            <p className="max-w-prose text-base leading-relaxed">{funder.wording}</p>
          </aside>
        ) : null}
      </section>

      <div className="divider-rule mt-14" aria-hidden="true" />

      {/* (c) What it will hold */}
      <section aria-labelledby="museum-what-it-will-hold" className="mt-14">
        <h2 id="museum-what-it-will-hold" className={H2}>
          {HEADINGS.whatItWillHold}
        </h2>
        <ul className="mt-6 grid list-none gap-8 p-0 sm:grid-cols-2">
          {museum.collections.map((c) => (
            <li key={c.title} className="flex flex-col gap-2 border-t-2 border-ink pt-4">
              <h3 className="font-display text-xl font-bold tracking-tight">{c.title}</h3>
              <p className="leading-relaxed">{c.description}</p>
            </li>
          ))}
        </ul>
      </section>

      <div className="divider-rule mt-14" aria-hidden="true" />

      {/* (d) Roadmap */}
      <section aria-labelledby="museum-roadmap" className="mt-14">
        <h2 id="museum-roadmap" className={H2}>
          {HEADINGS.roadmap}
        </h2>
        <Roadmap stages={museum.roadmap} className="mt-8" />
      </section>

      <div className="perf-seam mt-14" aria-hidden="true" />

      {/* (e) Closing ticket */}
      <section aria-labelledby="museum-reserve" className="mt-14">
        <h2 id="museum-reserve" className={H2}>
          {HEADINGS.reserve}
        </h2>
        <AdmissionTicket
          config={site.pending.emailProvider}
          id="ticket-footer"
          copy={museum.ticket}
          className="mt-6"
        />
      </section>
    </article>
  );
}

// Funder logo via next/image with an explicit `sizes` (Req 13.14, 19.4);
// mirrors the /donate treatment so both pages render the one Placeholder
// identically (17.4).
function FunderLogo({ logo }: { logo: ImageRef }) {
  const sized = logo.width !== undefined && logo.height !== undefined;
  if (sized) {
    return (
      <Image
        src={logo.src}
        alt={logo.alt}
        width={logo.width}
        height={logo.height}
        sizes="160px"
        className="h-16 w-auto"
      />
    );
  }
  return (
    <span className="relative block h-16 w-40">
      <Image src={logo.src} alt={logo.alt} fill sizes="160px" className="object-contain object-left" />
    </span>
  );
}
