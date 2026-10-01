import { useId } from "react";

// Ported verbatim from Old_Site app/Stamp.tsx (Req 13.9). Server component
// (`useId` is permitted in React Server Components and gives the textPath a
// stable, unique id across multiple postmarks on one page).
//
// A circular cancellation mark drawn in `currentColor`, so it inherits the
// surrounding text colour token and carries no colour literal (Req 13.1).
// Decorative: `aria-hidden` (Req 13.12). The optional draw-in animation is
// CSS only (`.postmark-draw` in app/globals.css) and is disabled under
// `prefers-reduced-motion` (Req 13.11, 19.7).
export function Postmark({
  className = "",
  label = "RETURNING SANDS",
  animate = false,
}: {
  className?: string;
  label?: string;
  animate?: boolean;
}) {
  const id = `postmark-path-${useId()}`;
  return (
    <svg
      viewBox="0 0 120 120"
      width="56"
      height="56"
      className={`${animate ? "postmark-draw" : ""} ${className}`}
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="60" cy="60" r="42" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.8" />
      <circle cx="60" cy="60" r="35" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      {label && (
        <>
          <path
            id={id}
            fill="none"
            d="M 60,25 A 35,35 0 0 1 60,95 A 35,35 0 0 1 60,25"
          />
          <text fontSize="8.2" letterSpacing="2.4" fill="currentColor" opacity="0.85">
            <textPath href={`#${id}`} startOffset="2%">
              {label} • {label} •
            </textPath>
          </text>
        </>
      )}
      <line x1="20" y1="42" x2="100" y2="78" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.9" />
      <line x1="22" y1="55" x2="98" y2="88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}
