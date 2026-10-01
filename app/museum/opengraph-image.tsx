import { site } from "@/content/site";
import { defaultCard } from "@/lib/og/defaultCard";
import { OG_CONTENT_TYPE, OG_SIZE, renderOg } from "@/lib/og/render";

// Default Share_Card for /museum (Req 16.3, 16.5). Not duplicated under
// /museum/thanks: that noindex page inherits this image from its parent segment.
const title = site.pages.museum.title;

export const alt = `Returning Sands stamp on paper with the title "${title}"`;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return renderOg(defaultCard({ title }));
}
