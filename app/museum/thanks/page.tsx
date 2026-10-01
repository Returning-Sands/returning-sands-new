import Link from "next/link";

import { Stamp } from "@/components/motifs/Stamp";
import { museum } from "@/content/museum";
import { pageMetadata } from "@/lib/metadata";

// Post-submission landing for the Admission_Ticket (Req 9.6, 9.8, 16.13).
//
// The Email_Provider redirects here after a successful signup. It is a fully
// static page: no form, no input, no provider script, and it builds whether or
// not `site.pending.emailProvider` is configured (9.8). `noindex` keeps it out
// of search results and the sitemap (16.13).
export const metadata = pageMetadata("museumThanks", "/museum/thanks", { noindex: true });

export default function MuseumThanksPage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16 md:py-24">
      {/* A stamped ticket: the `.perf` edge from the Admission_Ticket plus the
          oval stamp carrying an ADMITTED sub-label. */}
      <div className="perf relative flex flex-col items-center gap-8 border border-ink bg-sand-100 p-8 text-center text-ink md:flex-row md:text-start">
        <Stamp subLabel="ADMITTED" tilt="-6deg" size={200} className="shrink-0" />
        <div>
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em]">Admission ticket</p>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl">Ticket reserved</h1>
          <p className="mt-4 text-lg leading-relaxed">{museum.thanks.sentence}</p>
          <Link
            href="/museum"
            className="mt-6 inline-block font-mono text-sm uppercase tracking-wider underline decoration-2 underline-offset-4 hover:text-ochre-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nile-800"
          >
            {museum.thanks.backLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}
