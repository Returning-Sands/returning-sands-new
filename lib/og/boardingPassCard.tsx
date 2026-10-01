/**
 * Boarding_Pass Share_Card for `/campaign`, each City_Page and `/film`
 * (Req 16.6, 16.7). Satori-compatible JSX for `renderOg`; same conventions as
 * `defaultCard.tsx` (flex divs only, hex from `lib/tokens.ts`).
 *
 * Text labels come from `lib/boardingPass.ts` so the web `BoardingPass`
 * component and these images always print the same strings.
 */
import type { ReactElement } from "react";

import { BOARDING_PASS_LABELS, eventCodeText, routeText } from "@/lib/boardingPass";
import { truncateTitle } from "@/lib/metadata";
import { tokens } from "@/lib/tokens";

import { OG_FOOTER_HOST } from "./defaultCard";
import { OG_FONT_DISPLAY, OG_FONT_MONO } from "./fonts";

export type BoardingPassCardProps = {
  /** Stub heading, e.g. `"IMPACT CAMPAIGN"`, `"CAIRO"`, `"THE DOCUMENTARY"`. */
  heading: string;
  /** Origin IATA code. */
  from: string;
  /** Destination IATA code. */
  to: string;
  /** Event code printed as `EVENT <code>`; omitted when undefined. */
  code?: string;
  /** Date line, e.g. `"16 Dec – 20 Dec 2026"`, `"TBA"`, `"COMING SOON"`. */
  dateText: string;
  /** Page or event title shown on the stub; ellipsis-truncated at 60 chars. */
  title: string;
};

// 1200 px canvas, 40 px outer padding each side -> 1120 px for the two columns.
// Explicit widths (not flex-grow) so a long date line can never push the stub
// past the right edge of the image (16.6 "all text fully visible").
const OUTER_PADDING = 40;
const STUB_WIDTH = 380;
const MAIN_WIDTH = 1200 - OUTER_PADDING * 2 - STUB_WIDTH;

const LABEL = {
  fontFamily: OG_FONT_MONO,
  fontSize: 18,
  letterSpacing: 4,
  textTransform: "uppercase" as const,
  color: tokens["ochre-600"],
};

/** Two-column pass: large route on the left, tear-off stub on the right. */
export function boardingPassCard({ heading, from, to, code, dateText, title }: BoardingPassCardProps): ReactElement {
  const eventCode = eventCodeText(code);
  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        backgroundColor: tokens["sand-200"],
        color: tokens.ink,
        padding: OUTER_PADDING,
      }}
    >
      {/* Main pass */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: MAIN_WIDTH,
          backgroundColor: tokens["sand-50"],
          border: `2px solid ${tokens.ink}`,
          borderRight: `4px dashed ${tokens.ink}`,
          padding: "48px 56px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ ...LABEL, fontSize: 24, letterSpacing: 6, color: tokens.ink }}>
              {BOARDING_PASS_LABELS.heading}
            </div>
            <div style={{ ...LABEL, marginTop: 8 }}>{BOARDING_PASS_LABELS.brand}</div>
          </div>
          {eventCode ? (
            <div style={{ fontFamily: OG_FONT_MONO, fontSize: 24, letterSpacing: 4 }}>{eventCode}</div>
          ) : null}
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={LABEL}>Route</div>
          <div style={{ fontFamily: OG_FONT_MONO, fontSize: 72, lineHeight: 1.1, marginTop: 8 }}>
            {routeText(from, to)}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={LABEL}>Date</div>
          <div style={{ fontFamily: OG_FONT_MONO, fontSize: 30, marginTop: 8 }}>{dateText}</div>
        </div>
      </div>

      {/* Tear-off stub */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: STUB_WIDTH,
          backgroundColor: tokens["sand-100"],
          borderTop: `2px solid ${tokens.ink}`,
          borderRight: `2px solid ${tokens.ink}`,
          borderBottom: `2px solid ${tokens.ink}`,
          padding: "48px 40px",
        }}
      >
        <div style={{ ...LABEL, color: tokens.ink, fontSize: 22 }}>{heading}</div>

        <div
          style={{
            fontFamily: OG_FONT_DISPLAY,
            fontWeight: 700,
            fontSize: 34,
            lineHeight: 1.2,
          }}
        >
          {truncateTitle(title)}
        </div>

        <div style={{ ...LABEL, fontSize: 16 }}>{OG_FOOTER_HOST}</div>
      </div>
    </div>
  );
}
