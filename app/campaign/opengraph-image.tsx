import { events } from "@/content/events";
import { boardingPassCard } from "@/lib/og/boardingPassCard";
import { campaignRange } from "@/lib/og/campaignRange";
import { OG_CONTENT_TYPE, OG_SIZE, renderOg } from "@/lib/og/render";

// Boarding_Pass Share_Card for /campaign (Req 16.6): CAI → JFK with the date
// span across all seven Events.
const from = events.cities.cairo.iata;
const to = events.cities.nyc.iata;
const dateText = campaignRange(events.events);

export const alt = `Boarding pass for the Returning Sands Impact Campaign, ${from} to ${to}, ${dateText}`;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return renderOg(
    boardingPassCard({
      heading: "IMPACT CAMPAIGN",
      from,
      to,
      code: "ALL",
      dateText,
      title: "Seven events in three cities",
    }),
  );
}
