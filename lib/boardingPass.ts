/**
 * Shared Boarding_Pass text constants (design.md "Components": `BoardingPass`).
 *
 * Imported by `components/motifs/BoardingPass.tsx` for the web card and by the
 * Share_Card `opengraph-image.tsx` renderers (Task 12) so the two layouts
 * always print the same labels. Pure data: no React, no filesystem.
 */
export const BOARDING_PASS_LABELS = {
  heading: "BOARDING PASS",
  brand: "RETURNING SANDS",
  eventPrefix: "EVENT",
} as const;

/** `"CAI → LHR"` — the origin/destination line (Req 6.6, IATA codes from Req 7.4). */
export function routeText(from: string, to: string): string {
  return `${from} → ${to}`;
}

/** `"EVENT 001"`; `undefined` when the pass carries no code (e.g. trailer card). */
export function eventCodeText(code: string | undefined): string | undefined {
  return code ? `${BOARDING_PASS_LABELS.eventPrefix} ${code}` : undefined;
}
