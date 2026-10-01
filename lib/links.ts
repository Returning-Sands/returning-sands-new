/**
 * External-link detection (Requirement 1.10, design Property 2).
 *
 * `SmartLink` uses this to choose between `next/link` and `ExternalLink`
 * (which adds `target="_blank" rel="noopener noreferrer"` and the
 * "(opens in new tab)" affordance).
 */

const INTERNAL_HOSTS: ReadonlySet<string> = new Set(["returningsands.org", "www.returningsands.org"]);

/**
 * True iff `href` parses as an absolute URL whose hostname (case-insensitive)
 * is not one of the site's own hosts.
 *
 * Relative paths (`/`), fragments (`#`), and `mailto:` links are never
 * external; `mailto:` opens the mail client and renders as a plain `<a>`.
 * Anything `new URL` cannot parse is treated as internal.
 */
export function isExternalHref(href: string): boolean {
  if (href.startsWith("/") || href.startsWith("#") || href.startsWith("mailto:")) return false;
  try {
    return !INTERNAL_HOSTS.has(new URL(href).hostname.toLowerCase());
  } catch {
    return false; // relative or malformed -> treat as internal
  }
}
