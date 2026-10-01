import { JsonLd } from "@/components/seo/JsonLd";
import { eventJsonLd } from "@/lib/jsonld";
import type { Event } from "@/lib/types";

// One schema.org Event block per dated Event on a City_Page (Req 16.11,
// 16.12). Server component. TBA Events (`date === null`) emit nothing at all.
export function EventJsonLd({ event, cityName }: { event: Event; cityName: string }) {
  const data = eventJsonLd(event, cityName);
  return data ? <JsonLd data={data} /> : null;
}
