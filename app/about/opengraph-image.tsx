import { site } from "@/content/site";
import { defaultCard } from "@/lib/og/defaultCard";
import { OG_CONTENT_TYPE, OG_SIZE, renderOg } from "@/lib/og/render";

// Default Share_Card for /about (Req 16.3, 16.5).
const title = site.pages.about.title;

export const alt = `Returning Sands stamp on paper with the title "${title}"`;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return renderOg(defaultCard({ title }));
}
