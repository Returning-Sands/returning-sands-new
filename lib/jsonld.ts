/**
 * Structured-data builders (Req 16.10 to 16.12).
 *
 * Pure functions over Content_Files; rendered through `components/seo/JsonLd`.
 */
import { endDate, startDate } from "./events";
import type { Event, SiteContent } from "./types";

/**
 * One Organization block for the root layout (16.10): name, url, logo and the
 * two social profiles as `sameAs`. The logo points at the Home Share_Card
 * route, which is always an absolute, build-time URL.
 */
export function organizationSchema(site: SiteContent) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.name,
    url: site.url,
    logo: `${site.url}/opengraph-image`,
    sameAs: [site.social.instagram, site.social.linkedin],
  } as const;
}

/**
 * One schema.org Event block for a City_Page (16.11, 16.12). Returns `null`
 * for a TBA Event (`date === null`) so nothing is emitted; otherwise
 * `startDate` and `endDate` are both set, equal to each other for a single-day
 * Event. `eventStatus` is always EventScheduled: a past Event is still a
 * scheduled one that has happened, not a cancelled or postponed one.
 */
export function eventJsonLd(event: Event, cityName: string): object | null {
  const start = startDate(event.date);
  const end = endDate(event.date);
  if (start === null || end === null) return null;
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    startDate: start,
    endDate: end,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: event.venue,
      address: { "@type": "PostalAddress", addressLocality: cityName },
    },
    description: event.blurb,
    organizer: { "@type": "Organization", name: "Returning Sands", url: "https://returningsands.org" },
  };
}
