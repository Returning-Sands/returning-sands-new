/**
 * Designer_Asset swap-in (design.md "Designer_Asset swap-in mechanism",
 * Requirements 13.8, 20.5).
 *
 * Two mechanisms, chosen per asset:
 * 1. Content_File flag — `site.designAssets[key]` switches a motif component
 *    between its Stand_In rendering and the designer file at the documented
 *    path in `lib/assetPaths.ts`. `resolveAsset()` is the only entry point.
 * 2. File replacement at a fixed path — favicon, share-card background,
 *    wordmark. `fileAsset()` checks the filesystem at build time; no flag.
 *
 * Server-only: `fileAsset` reads the filesystem, so this module must not be
 * imported from a `"use client"` component.
 */
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { site } from "@/content/site";
import { DESIGN_ASSET_PATHS } from "./assetPaths";
import type { DesignAssetKey } from "./types";

export type ResolvedAsset = { kind: "designer"; src: string } | { kind: "standin" };

/** `"public/design/x.svg"` -> `"/design/x.svg"`. Directory paths keep their trailing slash. */
export function publicUrl(publicPath: string): string {
  const stripped = publicPath.replace(/^public/, "");
  return stripped.startsWith("/") ? stripped : `/${stripped}`;
}

/**
 * The designer file URL for `key` when its flag is `true`, else the Stand_In.
 * `flags` defaults to the real `site.designAssets`; tests pass their own.
 * Existence of the file is the validator's job (20.8), not this function's.
 */
export function resolveAsset(
  key: DesignAssetKey,
  flags: Record<DesignAssetKey, boolean> = site.designAssets,
): ResolvedAsset {
  return flags[key] ? { kind: "designer", src: publicUrl(DESIGN_ASSET_PATHS[key]) } : { kind: "standin" };
}

/**
 * File-replacement assets: returns the public URL if `publicPath` (relative to
 * the repository root, e.g. `"public/design/share-bg.png"`) exists at build
 * time, else `null` so the caller renders its Stand_In.
 */
export function fileAsset(publicPath: string): string | null {
  return existsSync(resolve(process.cwd(), publicPath)) ? publicUrl(publicPath) : null;
}
