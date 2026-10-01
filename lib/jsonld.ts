/**
 * Structured-data builders (Req 16.10 to 16.12).
 *
 * Pure functions over Content_Files; rendered through `components/seo/JsonLd`.
 * `eventJsonLd(event, cityName)` is added in Task 8.1.
 */
import type { SiteContent } from "./types";

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
