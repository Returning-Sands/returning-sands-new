import { site } from "@/content/site";
import { defaultCard } from "@/lib/og/defaultCard";
import { OG_CONTENT_TYPE, OG_SIZE, renderOg } from "@/lib/og/render";

// Default Share_Card for Home (Req 16.3, 16.5). Next's file convention adds
// og:image / twitter:image from this route (docs/NEXT16_NOTES.md item 2).
const title = site.pages.home.title;

export const alt = `Returning Sands stamp on paper with the title "${title}"`;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return renderOg(defaultCard({ title }));
}
