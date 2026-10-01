/**
 * Placeholder build summary (Requirements 14.7, 14.10, 12.12, 17.2).
 *
 * `summarizePending` is the pure core of `scripts/placeholder-summary.ts`,
 * the `postbuild` step that lists every Placeholder still "not yet
 * available". It takes the `pending` object of each Content_File and returns
 * the lines to print, so it can be unit- and property-tested without touching
 * the file system or the real content.
 */

import { OPTIONAL_BANK_FIELDS } from "./donate";
import { isPending } from "./pending";

/** `pending` objects keyed by Content_File name, e.g. `{ site: site.pending }`. */
export type PendingGroups = Record<string, Record<string, unknown>>;

/** Exact output when every Placeholder is filled. */
export const NO_PLACEHOLDERS_LINE = "No Placeholders are outstanding.";

/** Suffix for grouped Placeholders where some but not all fields are filled. */
export const PARTIAL_SUFFIX = "(partially filled — treated as empty)";

/**
 * Keys whose object value is a map of independent Placeholders (one per
 * field) rather than an all-or-nothing group. Each field is reported on its
 * own line as `pending.<key>.<field>`.
 */
const PER_FIELD_KEYS: ReadonlySet<string> = new Set(["contactEmails"]);

/**
 * Optional fields inside a grouped Placeholder. Absent or blank, they do not
 * make the group "partially filled" (mirrors `partialGroupWarnings`).
 */
const OPTIONAL_GROUP_FIELDS: Readonly<Record<string, readonly string[]>> = { bankDetails: OPTIONAL_BANK_FIELDS };

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function line(file: string, path: string, suffix?: string): string {
  const base = `  content/${file}.ts   pending.${path}`;
  return suffix ? `${base}   ${suffix}` : base;
}

/**
 * Lists every outstanding Placeholder across the given `pending` objects.
 *
 * - A key whose value `isPending` is reported as `pending.<key>`.
 * - A grouped object value with some (not all) fields pending is treated as
 *   empty and reported with the "partially filled" suffix (Req 12.12, 17.2).
 * - Keys in `PER_FIELD_KEYS` (`contactEmails`) are walked field by field.
 *
 * Returns exactly `[NO_PLACEHOLDERS_LINE]` when nothing is pending; otherwise
 * a header `Outstanding Placeholders (<n>):` followed by one line per item,
 * in input order (files, then keys, then fields).
 */
export function summarizePending(groups: PendingGroups): string[] {
  const items: string[] = [];

  for (const [file, pending] of Object.entries(groups)) {
    for (const [key, value] of Object.entries(pending)) {
      if (PER_FIELD_KEYS.has(key) && isRecord(value)) {
        for (const [field, email] of Object.entries(value)) {
          if (isPending(email)) items.push(line(file, `${key}.${field}`));
        }
        continue;
      }

      if (isPending(value)) {
        items.push(line(file, key));
      } else if (isRecord(value)) {
        const optional = OPTIONAL_GROUP_FIELDS[key] ?? [];
        const partial = Object.entries(value).some(([k, v]) => !optional.includes(k) && isPending(v));
        if (partial) items.push(line(file, key, PARTIAL_SUFFIX));
      }
    }
  }

  if (items.length === 0) return [NO_PLACEHOLDERS_LINE];
  return [`Outstanding Placeholders (${items.length}):`, ...items];
}
