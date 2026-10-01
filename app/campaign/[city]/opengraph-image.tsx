import { notFound } from "next/navigation";

import { events } from "@/content/events";
import { site } from "@/content/site";
import { boardingPassCard } from "@/lib/og/boardingPassCard";
import { cityCardProps } from "@/lib/og/cityCard";
import { OG_CONTENT_TYPE, OG_SIZE, renderOg } from "@/lib/og/render";
import type { City } from "@/lib/types";

// Boarding_Pass Share_Card per City_Page (Req 16.6, 16.7). `params` is a
// Promise in Next 16 (docs/NEXT16_NOTES.md item 2).
//
// The image route needs its own `generateStaticParams`: the sibling page.tsx's
// does not carry over, and without it the route builds as ƒ (Dynamic). Next's
// metadata route loader re-exports every named export except `default`, so this
// (and `dynamicParams`) reach the generated Route Handler.

const CITIES: City[] = ["cairo", "london", "nyc"];

function isCity(value: string): value is City {
  return (CITIES as string[]).includes(value);
}

export function generateStaticParams(): { city: City }[] {
  return CITIES.map((city) => ({ city }));
}

export const dynamicParams = false;

export const alt = "Boarding pass for Returning Sands events in this city, with airport codes and dates";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image({ params }: { params: Promise<{ city: string }> }) {
  const { city } = await params;
  if (!isCity(city)) notFound();
  return renderOg(boardingPassCard(cityCardProps(city, events, site.pages)));
}
