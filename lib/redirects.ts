/**
 * Old_Site hash-fragment redirects (Requirements 21.10, 21.11).
 *
 * The Old_Site was a single page with in-page anchors. Inbound links such as
 * `returningsands.org/#donate` land on the new Home page, where `HashRedirect`
 * (client, Home only) looks the fragment up here and calls `router.replace`.
 * Kept as a plain map so it can be unit-tested without React.
 */
export const OLD_HASH_MAP: Readonly<Record<string, string>> = {
  "#stake": "/at-stake",
  "#campaign": "/campaign",
  "#documentary": "/film",
  "#events": "/campaign",
  "#team": "/team",
  "#donate": "/donate",
  "#contact": "/support",
};

/**
 * Returns the new path for an Old_Site hash fragment, or `null` when the
 * fragment is empty or unknown. Matching is case-sensitive and exact; the
 * value must include the leading `#` exactly as `window.location.hash` does.
 */
export function redirectFor(hash: string): string | null {
  if (!hash) return null;
  return Object.prototype.hasOwnProperty.call(OLD_HASH_MAP, hash) ? OLD_HASH_MAP[hash] : null;
}
