import Link from "next/link";
import { notFound } from "next/navigation";

import { EventCard } from "@/components/events/EventCard";
import { EventJsonLd } from "@/components/events/EventJsonLd";
import { events } from "@/content/events";
import { BUILD_DATE } from "@/lib/buildInfo";
import { byCity, orderPast, orderUpcoming, resolveEvents, type ResolvedEvent } from "@/lib/events";
import { pageMetadata } from "@/lib/metadata";
import type { City, IsoDate, PageKey } from "@/lib/types";

// City_Page (Req 7). One static route per city from `generateStaticParams`;
// `dynamicParams = false` makes any other `/campaign/<x>` a 404 at the router
// level (docs/NEXT16_NOTES.md, route-segment-config/dynamicParams.md). The
// `isCity` guard in the page body is belt-and-braces and also narrows the
// awaited `params.city` string to `City` for the content lookups.

const CITIES: City[] = ["cairo", "london", "nyc"];

const KEY: Record<City, PageKey> = {
  cairo: "campaignCairo",
  london: "campaignLondon",
  nyc: "campaignNyc",
};

function isCity(value: string): value is City {
  return (CITIES as string[]).includes(value);
}

export function generateStaticParams(): { city: City }[] {
  return CITIES.map((city) => ({ city }));
}

export const dynamicParams = false;

type Params = { params: Promise<{ city: string }> };

// Next 16: `params` is a Promise (docs/NEXT16_NOTES.md item 1).
export async function generateMetadata({ params }: Params) {
  const { city } = await params;
  if (!isCity(city)) notFound();
  return pageMetadata(KEY[city], `/campaign/${city}`);
}

/**
 * Everything the City_Page renders, computed from the content and a build
 * date. Pure, so tests can check grouping/ordering (Req 7.1, 7.2, 7.8) without
 * rendering the async page.
 */
export function cityPageModel(
  city: City,
  buildDate: IsoDate,
): { name: string; framing: string; upcoming: ResolvedEvent[]; past: ResolvedEvent[] } {
  const { name, framing } = events.cities[city];
  const resolved = byCity(resolveEvents(events.events, buildDate), city);
  return { name, framing, upcoming: orderUpcoming(resolved), past: orderPast(resolved) };
}

const H2 = "font-mono text-sm uppercase tracking-widest text-ochre-600";
const LINK_CLASS =
  "inline-block font-mono text-sm uppercase tracking-wider underline decoration-2 underline-offset-4 hover:text-ochre-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nile-800";

export default async function CityPage({ params }: Params) {
  const { city } = await params;
  if (!isCity(city)) notFound();

  const { name, framing, upcoming, past } = cityPageModel(city, BUILD_DATE);
  const others = CITIES.filter((c) => c !== city);

  return (
    <article className="mx-auto max-w-5xl px-4 py-16 md:py-24">
      <header>
        <p className="kicker">Impact Campaign</p>
        <h1 className="mt-4 font-display text-4xl font-bold tracking-tight md:text-6xl">{name}</h1>
        {/* Req 7.2: one-line framing sentence from content/events.ts */}
        <p className="mt-6 max-w-prose text-lg leading-relaxed">{framing}</p>
      </header>

      <div className="perf-seam mt-12" aria-hidden="true" />

      {/* Req 7.2, 7.11: upcoming group, or the empty-state message in its place */}
      <section aria-labelledby="upcoming-heading" className="mt-12">
        <h2 id="upcoming-heading" className={H2}>
          Upcoming
        </h2>
        {upcoming.length > 0 ? (
          <ul className="mt-6 flex list-none flex-col gap-8 p-0">
            {upcoming.map((event) => (
              <li key={event.id}>
                <EventCard event={event} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-6 max-w-prose text-lg">No upcoming events are scheduled for {name} yet.</p>
        )}
      </section>

      {/* Req 7.8, 7.11: past group below all upcoming Events; omitted entirely when empty */}
      {past.length > 0 ? (
        <section aria-labelledby="past-heading" className="mt-14">
          <h2 id="past-heading" className={H2}>
            Past events
          </h2>
          <ul className="mt-6 flex list-none flex-col gap-8 p-0">
            {past.map((event) => (
              <li key={event.id}>
                <EventCard event={event} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* Req 16.11, 16.12: one Event JSON-LD per dated Event; TBA emits nothing */}
      {[...upcoming, ...past].map((event) => (
        <EventJsonLd key={event.id} event={event} cityName={name} />
      ))}

      <div className="perf-seam mt-14" aria-hidden="true" />

      {/* Req 7.12: the other two City_Pages and the campaign overview, named by destination */}
      <nav aria-label="Other cities" className="mt-10 flex flex-wrap gap-x-8 gap-y-4">
        {others.map((other) => (
          <Link key={other} href={`/campaign/${other}`} className={LINK_CLASS}>
            {events.cities[other].name}
          </Link>
        ))}
        <Link href="/campaign" className={LINK_CLASS}>
          All events
        </Link>
      </nav>
    </article>
  );
}
