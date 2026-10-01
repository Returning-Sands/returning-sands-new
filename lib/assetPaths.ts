/**
 * Documented locations of flag-switched Designer_Assets (design.md "Designer
 * asset switch", Requirement 20.5, 20.7, 20.8).
 *
 * Shared by `lib/validate.ts` (flag `true` -> path must exist) and
 * `lib/assets.ts` (`resolveAsset()` picks the `src` to render). Paths are
 * relative to the repository root; entries ending in `/` are directories that
 * hold one file per city / event rather than a single file.
 */
import type { DesignAssetKey } from "./types";

export const DESIGN_ASSET_DIR = "public/design";

export const DESIGN_ASSET_PATHS: Record<DesignAssetKey, string> = {
  stampOval: `${DESIGN_ASSET_DIR}/stamp-oval.svg`,
  passportCover: `${DESIGN_ASSET_DIR}/passport-cover.svg`,
  passportSpread: `${DESIGN_ASSET_DIR}/passport-spread.png`,
  cityStamps: `${DESIGN_ASSET_DIR}/city-stamps/`,
  boardingPass: `${DESIGN_ASSET_DIR}/boarding-pass.svg`,
  admissionTicket: `${DESIGN_ASSET_DIR}/admission-ticket.svg`,
  passportCardFrame: `${DESIGN_ASSET_DIR}/passport-card-frame.svg`,
  silhouette: `${DESIGN_ASSET_DIR}/silhouette.svg`,
  eventStamps: `${DESIGN_ASSET_DIR}/event-stamps/`,
};

/** The URL a browser uses for an asset, i.e. the path with the `public` prefix removed. */
export function designAssetUrl(key: DesignAssetKey): string {
  return DESIGN_ASSET_PATHS[key].replace(/^public/, "");
}
