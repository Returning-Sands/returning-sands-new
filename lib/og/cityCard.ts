/**
 * Props for a City_Page Boarding_Pass Share_Card (Req 16.6, 16.7). Pure, so
 * the unit tests can check the "TBA" rule without rendering an image.
 */
import type { BoardingPassCardProps } from "./boardingPassCard";
import { byCity, cityRange } from "@/lib/events";
import type { City, EventsContent, PageKey } from "@/lib/types";

export const CITY_PAGE_KEY: Record<City, PageKey> = {
  cairo: "campaignCairo",
  london: "campaignLondon",
  nyc: "campaignNyc",
};

/** Event code per city, matching the city's position in the campaign. */
const CITY_CODE: Record<City, string> = { cairo: "001", london: "002", nyc: "003" };

export function cityCardProps(
  city: City,
  content: EventsContent,
  pages: Record<PageKey, { title: string }>,
): BoardingPassCardProps {
  const { name, iata } = content.cities[city];
  const cityEvents = byCity(content.events, city);
  // Prefer the airport pair the city's own Events use; fall back to LHR → city.
  const codes = cityEvents[0]?.airportCodes ?? { from: "LHR", to: iata };
  const hasDated = cityEvents.some((e) => e.date !== null);
  return {
    heading: name.toUpperCase(),
    from: codes.from,
    to: codes.to,
    code: CITY_CODE[city],
    // 16.7: a city with no confirmed date prints exactly "TBA".
    dateText: hasDated ? cityRange(content.events, city) : "TBA",
    title: pages[CITY_PAGE_KEY[city]].title,
  };
}
