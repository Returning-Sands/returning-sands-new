/**
 * Default Share_Card: the Returning Sands stamp on paper (Req 16.5, 20.5).
 *
 * Returns Satori-compatible JSX for `renderOg`. Satori rules observed here:
 * only `div` / `img` / `span`, every element with more than one child declares
 * `display: "flex"`, no CSS variables (hex values come from `lib/tokens.ts`),
 * fonts referenced by the family names registered in `lib/og/fonts.ts`.
 *
 * Paper background: the designer file `public/design/share-bg.png` when it is
 * present (file-replacement swap, 20.5) embedded as a base64 data URI, else a
 * flat `sand-100` sheet with a `sand-200` inset border as the Stand_In.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { ReactElement } from "react";

import { site } from "@/content/site";
import { fileAsset } from "@/lib/assets";
import { truncateTitle } from "@/lib/metadata";
import { tokens } from "@/lib/tokens";

import { OG_FONT_DISPLAY, OG_FONT_MONO } from "./fonts";

/** Documented file-replacement path for the designer's paper texture (20.5). */
export const SHARE_BG_PATH = "public/design/share-bg.png";

/** Hostname printed in the card footer; derived from the canonical site URL. */
export const OG_FOOTER_HOST = new URL(site.url).hostname;

/** `data:image/png;base64,…` for the designer background, or `null` for the Stand_In. */
export function shareBackgroundDataUri(): string | null {
  if (fileAsset(SHARE_BG_PATH) === null) return null;
  const png = readFileSync(join(/*turbopackIgnore: true*/ process.cwd(), SHARE_BG_PATH));
  return `data:image/png;base64,${png.toString("base64")}`;
}

/**
 * The oval dashed Returning Sands stamp drawn with divs.
 *
 * Latin text only, unlike the web `Stamp`: Satori has no Arabic glyphs in the
 * two bundled fonts and its Google-Fonts fallback (Noto Sans Arabic) fails to
 * parse at build time ("lookupType: 5 - substFormat: 3 is not yet supported"),
 * which aborts `next build`. To add the Arabic line, drop an Arabic `.ttf`/
 * `.woff` under `public/fonts/`, register it in `lib/og/fonts.ts`, and render
 * `site.arabicName` in a second line here.
 */
export function StampOval({ rotate = -6 }: { rotate?: number }): ReactElement {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: 520,
        height: 200,
        border: `4px dashed ${tokens.ink}`,
        borderRadius: "50%",
        transform: `rotate(${rotate}deg)`,
        color: tokens.ink,
        fontFamily: OG_FONT_MONO,
      }}
    >
      <div style={{ fontSize: 34, letterSpacing: 6 }}>RETURNING SANDS</div>
      <div style={{ fontSize: 20, letterSpacing: 4, marginTop: 12 }}>{site.kicker}</div>
    </div>
  );
}

/**
 * The default Share_Card for a Page: stamp, ellipsis-truncated title at 56 px
 * (>= the 40 px minimum, 16.5), and the site host in the footer.
 */
export function defaultCard({ title }: { title: string }): ReactElement {
  const bg = shareBackgroundDataUri();
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        position: "relative",
        width: "100%",
        height: "100%",
        backgroundColor: tokens["sand-100"],
        color: tokens.ink,
      }}
    >
      {bg ? (
        // Satori renders plain <img>; next/image is not available inside ImageResponse.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={bg}
          alt=""
          style={{ position: "absolute", top: 0, left: 0, width: 1200, height: 630, objectFit: "cover" }}
        />
      ) : (
        <div
          style={{
            position: "absolute",
            top: 24,
            left: 24,
            width: 1152,
            height: 582,
            border: `2px solid ${tokens["sand-200"]}`,
          }}
        />
      )}

      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          padding: "64px 72px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "flex-start", paddingLeft: 12 }}>
          <StampOval />
        </div>

        <div
          style={{
            fontFamily: OG_FONT_DISPLAY,
            fontWeight: 700,
            fontSize: 56,
            lineHeight: 1.15,
            maxWidth: 1056,
          }}
        >
          {truncateTitle(title)}
        </div>

        <div
          style={{
            fontFamily: OG_FONT_MONO,
            fontSize: 22,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: tokens["ochre-600"],
          }}
        >
          {OG_FOOTER_HOST}
        </div>
      </div>
    </div>
  );
}
