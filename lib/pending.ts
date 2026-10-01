/**
 * Placeholder helpers (Requirement 14.4, 12.12, 17.2).
 *
 * A Placeholder is "not yet available" when it is `""`, `null`, `undefined`,
 * or whitespace-only. Grouped Placeholders (bank details, company registration)
 * are all-or-nothing: the group counts as pending unless every field is present.
 */

/** A content value that may still be unfilled. */
export type Pending<T extends string | object> = T | "" | null;

/**
 * True when `v` is "not yet available":
 * - `null` / `undefined` -> true
 * - string -> true iff empty after trimming
 * - object -> true iff every field is itself pending (all-or-nothing group)
 * - anything else (numbers, booleans, …) -> false
 */
export function isPending(v: unknown): boolean {
  if (v === null || v === undefined) return true;
  if (typeof v === "string") return v.trim() === "";
  if (typeof v === "object") return Object.values(v).every(isPending);
  return false;
}

/** Type guard: narrows a `Pending<T>` to `T` when the value is present. */
export function present<T extends string | object>(v: Pending<T>): v is T {
  return !isPending(v);
}
