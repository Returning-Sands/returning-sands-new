/**
 * The one place that constructs `ImageResponse` (design.md "Share_Cards").
 *
 * Every `app/**\/opengraph-image.tsx` builds its JSX with `defaultCard` or
 * `boardingPassCard` and hands it to `renderOg`, so the size, content type and
 * font set are identical across all thirteen Share_Card routes (Req 16.3).
 */
import type { ReactElement } from "react";
import { ImageResponse } from "next/og";

import { loadOgFonts } from "./fonts";

/** Exported as `size` by every opengraph-image route (Req 16.3). */
export const OG_SIZE = { width: 1200, height: 630 } as const;

/** Exported as `contentType` by every opengraph-image route (Req 16.3). */
export const OG_CONTENT_TYPE = "image/png";

/** Render a Satori-compatible element tree to a 1200x630 PNG response. */
export async function renderOg(node: ReactElement): Promise<ImageResponse> {
  return new ImageResponse(node, { ...OG_SIZE, fonts: await loadOgFonts() });
}
