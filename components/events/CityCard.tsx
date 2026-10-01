import Link from "next/link";
import { cityRange, eventCount } from "@/lib/events";
import type { City, Event } from "@/lib/types";

// City summary card on `/campaign` (Req 6.4, 6.5). Server component.
//
// Everything shown is derived from the city's Events via `lib/events.ts`: the
// date range text (`"16–20 Dec 2026"`, `"… + TBA"` or `"Dates TBA"`) and the
// event count. The card links to the City_Page with the city name in the link
// text so the destination is clear out of context.
export function CityCard({
  city,
  name,
  events,
  href,
  className = "",
}: {
  city: City;
  name: string;
  events: Event[];
  href: string;
  className?: string;
}) {
  const count = eventCount(events, city);
  const noun = count === 1 ? "event" : "events";

  return (
    <article className={`flex flex-col gap-2 border border-ink bg-sand-100 p-5 text-ink ${className}`}>
      <h3 className="font-display text-xl font-bold leading-tight">{name}</h3>
      <p className="font-mono text-sm">{cityRange(events, city)}</p>
      <p className="font-mono text-xs uppercase tracking-[0.12em] text-nile-700">
        {count} {noun}
      </p>
      <Link href={href} className="mt-2 font-mono text-sm underline underline-offset-4 hover:text-stamp-700">
        See {name} events
      </Link>
    </article>
  );
}
