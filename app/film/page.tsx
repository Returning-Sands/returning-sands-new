import { film } from "@/content/film";
import { Figure } from "@/components/content/Figure";
import { Pending } from "@/components/content/Pending";
import { Prose } from "@/components/content/Prose";
import { ExternalLink } from "@/components/layout/ExternalLink";
import { BoardingPass } from "@/components/motifs/BoardingPass";
import { Stamp } from "@/components/motifs/Stamp";
import { pageMetadata } from "@/lib/metadata";
import { present } from "@/lib/pending";

// The Documentary page (Req 5). Every string comes from content/film.ts; the
// three Placeholders (`logline`, `aboutFilm`, `trailerUrl`) render their
// documented fallback while pending (Req 5.3, 5.8, 14.9, design Property 6).
export const metadata = pageMetadata("film", "/film");

/** Split Content_File copy on blank lines into paragraphs, dropping empties. */
function paragraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
}

const H2 = "font-display text-2xl font-bold tracking-tight md:text-3xl";
const SECTION = "mt-12 flex flex-col gap-4";

export default function FilmPage() {
  const { headings, director, protagonist, backing, pending } = film;
  const trailerUrl = pending.trailerUrl;

  return (
    <article className="mx-auto max-w-3xl px-4 py-16 md:py-24">
      {/* Req 5.1: the stamp variant is the first content element, before any heading. */}
      <Stamp subLabel="THE DOCUMENTARY" tilt="-4deg" />

      <h1 className="mt-8 font-display text-4xl font-bold tracking-tight md:text-6xl">
        The Documentary
      </h1>

      {/* Req 5.2 (a): logline — Req 5.3 marker while pending */}
      <section className={SECTION} aria-labelledby="film-logline">
        <h2 id="film-logline" className={H2}>
          {headings.logline}
        </h2>
        {present(pending.logline) ? (
          <p className="text-2xl italic leading-snug">{pending.logline}</p>
        ) : (
          <Pending text="Logline to follow" />
        )}
      </section>

      {/* Req 5.2 (b): about the film — Req 5.3 marker while pending */}
      <section className={SECTION} aria-labelledby="film-about">
        <h2 id="film-about" className={H2}>
          {headings.about}
        </h2>
        {present(pending.aboutFilm) ? (
          <Prose paragraphs={paragraphs(pending.aboutFilm)} className="text-lg" />
        ) : (
          <Pending text="About the film to follow" />
        )}
      </section>

      {/* Req 5.2 (c), 5.4, 5.10: director */}
      <section className={SECTION} aria-labelledby="film-director">
        <h2 id="film-director" className={H2}>
          {headings.director}
        </h2>
        <p className="font-mono text-lg font-semibold">{director.name}</p>
        <p className="font-mono text-sm uppercase tracking-[0.18em] text-nile-700">
          {director.credential}
        </p>
        <Prose paragraphs={paragraphs(director.note)} className="text-lg" />
      </section>

      {/* Req 5.2 (d), 5.5, 5.9: protagonist */}
      <section className={SECTION} aria-labelledby="film-protagonist">
        <h2 id="film-protagonist" className={H2}>
          {headings.protagonist}
        </h2>
        <div className="flex flex-col gap-6 md:flex-row md:items-start">
          <Figure
            image={protagonist.image}
            sizes="(min-width: 768px) 40vw, 100vw"
            className="md:w-2/5 md:shrink-0"
          />
          <div className="flex flex-col gap-4">
            <p className="font-mono text-lg font-semibold">{protagonist.name}</p>
            <Prose paragraphs={paragraphs(protagonist.bio)} className="text-lg" />
          </div>
        </div>
      </section>

      {/* Req 5.2 (e), 5.6: backing and support — one item per backer */}
      <section className={SECTION} aria-labelledby="film-backing">
        <h2 id="film-backing" className={H2}>
          {headings.backing}
        </h2>
        <ul className="flex flex-col gap-4 text-lg leading-relaxed">
          {backing.map((item) => (
            <li key={item.name} className="border-l-2 border-ink pl-4">
              <strong className="font-mono font-semibold">{item.name}</strong> — {item.detail}
            </li>
          ))}
        </ul>
      </section>

      {/* Req 5.2 (f), 5.7, 5.8: trailer — iframe iff the URL Placeholder is present */}
      <section className={SECTION} aria-labelledby="film-trailer">
        <h2 id="film-trailer" className={H2}>
          {headings.trailer}
        </h2>
        {present(trailerUrl) ? (
          <>
            <div className="aspect-video w-full overflow-hidden border border-ink">
              <iframe
                src={trailerUrl}
                title="Returning Sands trailer"
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
            <p className="font-mono text-sm">
              <ExternalLink
                href={trailerUrl}
                className="underline decoration-2 underline-offset-4 hover:text-ochre-600"
              >
                Watch the trailer
              </ExternalLink>
            </p>
          </>
        ) : (
          <BoardingPass
            heading="TRAILER"
            from="CAI"
            to="LHR"
            dateText="Coming soon"
            title={film.trailerComingSoonText}
          />
        )}
      </section>
    </article>
  );
}
