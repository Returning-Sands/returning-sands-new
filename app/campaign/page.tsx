import Link from "next/link";
import { events } from "@/content/events";
import { site } from "@/content/site";
import { Pending } from "@/components/content/Pending";
import { Prose } from "@/components/content/Prose";
import { CityCard } from "@/components/events/CityCard";
import { BoardingPass } from "@/components/motifs/BoardingPass";
import { BUILD_DATE } from "@/lib/buildInfo";
import { orderCampaignList, resolveEvents } from "@/lib/events";
import { pageMetadata } from "@/lib/metadata";
import { present } from "@/lib/pending";
import type { City } from "@/lib/types";

// Impact Campaign overview (Req 6). Pre-rendered from content/site.ts and
// content/events.ts at build time; nothing is fetched client-side (Req 6.1).
// Event status is resolved once against BUILD_DATE (Req 7.9) so the PAST
// overprint here agrees with the City_Pages built in the same run.
export const metadata = pageMetadata("campaign", "/campaign");

/** The three City_Pages in display order (Req 6.4). */
const CITY_ORDER: City[] = ["cairo", "london", "nyc"];

/** Split Content_File copy on blank lines into paragraphs, dropping empties. */
function paragraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
}

const H2 = "font-display text-2xl font-bold tracking-tight md:text-3xl";
const SECTION = "mt-12 flex flex-col gap-4";
const LINK = "font-mono text-sm underline underline-offset-4 hover:text-stamp-700";

export default function CampaignPage() {
  const overview = site.pending.campaignOverview;
  const resolved = resolveEvents(events.events, BUILD_DATE);
  const list = orderCampaignList(resolved);

  return (
    <article className="mx-auto max-w-3xl px-4 py-16 md:py-24">
      <h1 className="font-display text-4xl font-bold tracking-tight md:text-6xl">Impact Campaign</h1>

      {/* Req 6.2, 6.3: overview is the first content block; Pending marker while empty */}
      <section className="mt-8 flex flex-col gap-4" aria-label="Overview">
        {present(overview) ? (
          <Prose paragraphs={paragraphs(overview)} className="text-lg" />
        ) : (
          <Pending text="Campaign overview placeholder — copy to follow" />
        )}
      </section>

      {/* Req 6.4, 6.5: exactly three city cards, Cairo / London / NYC */}
      <section className={SECTION} aria-labelledby="campaign-cities">
        <h2 id="campaign-cities" className={H2}>
          Three cities
        </h2>
        <ul className="grid gap-4 md:grid-cols-3">
          {CITY_ORDER.map((city) => (
            <li key={city} className="flex">
              <CityCard
                city={city}
                name={events.cities[city].name}
                events={events.events}
                href={`/campaign/${city}`}
                className="w-full"
              />
            </li>
          ))}
        </ul>
      </section>

      {/* Req 6.6, 6.7, 6.8: all seven Events as compact Boarding_Passes */}
      <section className={SECTION} aria-labelledby="campaign-events">
        <h2 id="campaign-events" className={H2}>
          All events
        </h2>
        <ol className="flex flex-col gap-3">
          {list.map((e, index) => (
            <li key={e.id}>
              <BoardingPass
                compact
                heading={e.stampLabel}
                from={e.airportCodes.from}
                to={e.airportCodes.to}
                code={String(index + 1).padStart(3, "0")}
                dateText={e.date === null ? "Date TBA" : e.dateDisplay}
                title={`${e.title} · ${events.cities[e.city].name}`}
                href={`/campaign/${e.city}#${e.id}`}
                past={e.status === "past"}
              />
            </li>
          ))}
        </ol>
      </section>

      {/* Req 6.9: Virtual Museum teaser */}
      <section className={SECTION} aria-labelledby="campaign-museum">
        <h2 id="campaign-museum" className={H2}>
          The Virtual Museum
        </h2>
        <p className="text-lg leading-relaxed">{site.campaign.museumTeaser}</p>
        <p>
          <Link href="/museum" className={LINK}>
            Reserve a museum ticket
          </Link>
        </p>
      </section>

      {/* Req 6.10, 12.10: events as fundraising catalysts, link to /donate */}
      <section className={SECTION} aria-labelledby="campaign-donate">
        <h2 id="campaign-donate" className={H2}>
          Support the film
        </h2>
        <p className="text-lg leading-relaxed">{site.campaign.donateLine}</p>
        <p>
          <Link href="/donate" className={LINK}>
            Donate
          </Link>
        </p>
      </section>
    </article>
  );
}
