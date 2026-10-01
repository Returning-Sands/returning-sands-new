/**
 * Current-page marking for the Top_Nav (Requirement 1.5, design Property 1).
 *
 * Pure: no React, no `usePathname()`. `TopNav` (a thin client component)
 * calls this with the live pathname and sets `aria-current="page"` on the
 * single link whose href matches the result.
 */
import { KNOWN_PATHS } from "./routes";

/** Known paths that have no Top_Nav link, so they never mark a current item. */
const UNLINKED_PATHS: ReadonlySet<string> = new Set(["/museum", "/museum/thanks", "/privacy"]);

/**
 * Map a pathname to the Top_Nav href that should read as current.
 *
 * - any path beginning `/campaign` (overview or a City_Page) -> `/campaign`
 * - `/museum`, `/museum/thanks`, `/privacy`, and anything unknown (404) -> `null`
 * - `/` -> `/` (the Home wordmark)
 * - every other known Page path -> itself
 */
export function currentNavHref(pathname: string): string | null {
  if (pathname.startsWith("/campaign")) return "/campaign";
  if (UNLINKED_PATHS.has(pathname)) return null;
  if (!KNOWN_PATHS.has(pathname)) return null;
  return pathname;
}
