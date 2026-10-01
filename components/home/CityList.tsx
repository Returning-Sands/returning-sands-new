import Link from "next/link";
import { events } from "@/content/events";
import { earliestDateText } from "@/lib/events";
import { HERO_CITIES } from "./PassportHero";

// Plain-text city list directly below the Passport_Hero (Req 2.7). Server
// component. Exactly three entries, London, Cairo, NYC, each with the city
// name as a link to its City_Page and the `dateDisplay` of that city's
// earliest dated Event (or "TBA" when the city has none).

export function CityList({ className = "" }: { className?: string }) {
  return (
    <nav aria-label="Cities" className={`font-mono text-sm ${className}`}>
      <ul className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-x-8">
        {HERO_CITIES.map((city) => (
          <li key={city} className="flex items-baseline gap-2">
            <Link
              href={`/campaign/${city}`}
              className="font-semibold uppercase tracking-[0.15em] text-ink underline decoration-stamp-600 underline-offset-4 hover:decoration-stamp-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nile-800"
            >
              {events.cities[city].name}
            </Link>
            <span className="text-ink/80">{earliestDateText(events.events, city)}</span>
          </li>
        ))}
      </ul>
    </nav>
  );
}
