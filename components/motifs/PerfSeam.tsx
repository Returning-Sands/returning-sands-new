// Ported verbatim from Old_Site app/Stamp.tsx (Req 13.9). Server component.
//
// A one-pixel perforated seam between two sections, drawn by the
// `.perf-seam` / `.perf-seam.on-dark` rules in app/globals.css. Decorative,
// so `aria-hidden` (Req 13.12).
export function PerfSeam({ dark = false }: { dark?: boolean }) {
  return <div className={`perf-seam ${dark ? "on-dark" : ""}`} aria-hidden="true" />;
}
