import type { IsoDate } from "./types";

/**
 * The UTC calendar date of the build, `YYYY-MM-DD` (Requirement 7.9).
 *
 * Computed once at module load so every page in a single `next build` agrees
 * on which Events are past. Reading `new Date()` at module level does not make
 * a route dynamic; the value is simply baked into the static HTML.
 */
export const BUILD_DATE = new Date().toISOString().slice(0, 10) as IsoDate;
