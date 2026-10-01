/**
 * Event logic (design.md "Event logic").
 *
 * Every function here is pure and takes explicit inputs: the Event list and,
 * where relevant, the build date. Nothing reads `content/events.ts` or
 * `lib/buildInfo.ts` directly, so the same functions serve the real content
 * at build time and synthetic lists in unit / property tests.
 *
 * Requirements: 7.9, 7.10 (status), 7.2, 7.8 (city ordering), 6.7 (campaign
 * list), 6.4, 6.5 (city range), 2.7 (earliest date), 16.7 (share cards).
 */
import type { City, Event, EventDate, IsoDate } from "./types";

// ---------------------------------------------------------------------------
// Dates
// ---------------------------------------------------------------------------

/** First day of an Event: the single date, the range start, or `null` for TBA. */
export function startDate(d: EventDate): IsoDate | null {
  if (d === null) return null;
  return typeof d === "string" ? d : d.start;
}

/** Last day of an Event: the single date, the range end, or `null` for TBA. */
export function endDate(d: EventDate): IsoDate | null {
  if (d === null) return null;
  return typeof d === "string" ? d : d.end;
}

// ---------------------------------------------------------------------------
// Status
// ---------------------------------------------------------------------------

export type EventStatus = "upcoming" | "past";

/** An Event with its status resolved against the build date. */
export type ResolvedEvent = Event & { status: EventStatus };

/**
 * A declared `status` always wins (7.10). Otherwise an Event is `past` iff it
 * has an end date and the build date is strictly after it (7.9); an Event
 * whose last day is the build date is still `upcoming`. `YYYY-MM-DD` strings
 * compare correctly as plain strings, so no Date parsing is involved.
 */
export function deriveStatus(e: Event, buildDate: IsoDate): EventStatus {
  if (e.status) return e.status;
  const end = endDate(e.date);
  return end !== null && buildDate > end ? "past" : "upcoming";
}

/** Adds `status` to every Event, preserving file order. */
export function resolveEvents(events: Event[], buildDate: IsoDate): ResolvedEvent[] {
  return events.map((e) => ({ ...e, status: deriveStatus(e, buildDate) }));
}

// ---------------------------------------------------------------------------
// Ordering
// ---------------------------------------------------------------------------

/** Stable sort of dated Events by start ascending. TBA Events are excluded. */
function datedByStartAsc<T extends Event>(events: T[]): T[] {
  return events
    .filter((e) => e.date !== null)
    .sort((a, b) => compareIso(startDate(a.date)!, startDate(b.date)!));
}

function compareIso(a: IsoDate, b: IsoDate): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

/**
 * City page "Upcoming" order (7.2): only `upcoming` Events; dated ones by start
 * ascending (stable), then TBA ones in file order. Callers filter by city first
 * (see `byCity`).
 */
export function orderUpcoming(events: ResolvedEvent[]): ResolvedEvent[] {
  const upcoming = events.filter((e) => e.status === "upcoming");
  return [...datedByStartAsc(upcoming), ...upcoming.filter((e) => e.date === null)];
}

/**
 * City page "Past events" order (7.8): only `past` Events, by end date
 * descending (most recent first, stable). A TBA Event can only be past through
 * a declared `status` override; such Events go last, in file order.
 */
export function orderPast(events: ResolvedEvent[]): ResolvedEvent[] {
  const past = events.filter((e) => e.status === "past");
  const dated = past
    .filter((e) => e.date !== null)
    .sort((a, b) => compareIso(endDate(b.date)!, endDate(a.date)!));
  return [...dated, ...past.filter((e) => e.date === null)];
}

/**
 * `/campaign` compact list order (6.7): every Event, dated ones by start
 * ascending across all cities; each TBA Event is placed immediately after the
 * last Event of its city already in the list (which is that city's last dated
 * Event, or an earlier TBA from the same city), or at the end if its city has
 * no dated Event. TBA Events are processed in file order.
 */
export function orderCampaignList(events: ResolvedEvent[]): ResolvedEvent[] {
  const result: ResolvedEvent[] = datedByStartAsc(events);
  for (const tba of events) {
    if (tba.date !== null) continue;
    let insertAt = -1;
    for (let i = result.length - 1; i >= 0; i--) {
      if (result[i].city === tba.city) {
        insertAt = i + 1;
        break;
      }
    }
    if (insertAt === -1) result.push(tba);
    else result.splice(insertAt, 0, tba);
  }
  return result;
}

// ---------------------------------------------------------------------------
// Per-city summaries
// ---------------------------------------------------------------------------

/** The Events belonging to one city, in the order given. */
export function byCity<T extends Event>(events: T[], city: City): T[] {
  return events.filter((e) => e.city === city);
}

/** How many Events a city has, dated or not (6.4). */
export function eventCount(events: Event[], city: City): number {
  return byCity(events, city).length;
}

/**
 * City card date range text (6.4, 6.5):
 * - `formatRange(minStart, maxEnd)` over the city's dated Events,
 * - plus `" + TBA"` iff the city also has at least one TBA Event,
 * - or exactly `"Dates TBA"` when the city has no dated Event at all.
 */
export function cityRange(events: Event[], city: City): string {
  const cityEvents = byCity(events, city);
  const starts = cityEvents.map((e) => startDate(e.date)).filter((d): d is IsoDate => d !== null);
  const ends = cityEvents.map((e) => endDate(e.date)).filter((d): d is IsoDate => d !== null);
  if (starts.length === 0) return "Dates TBA";
  const min = starts.reduce((a, b) => (b < a ? b : a));
  const max = ends.reduce((a, b) => (b > a ? b : a));
  const hasTba = cityEvents.some((e) => e.date === null);
  return formatRange(min, max) + (hasTba ? " + TBA" : "");
}

/**
 * Home city list text (2.7): the `dateDisplay` of the city's dated Event with
 * the earliest start (first in file order on a tie), or `"TBA"` when the city
 * has no dated Event.
 */
export function earliestDateText(events: Event[], city: City): string {
  const dated = datedByStartAsc(byCity(events, city));
  return dated.length === 0 ? "TBA" : dated[0].dateDisplay;
}

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** `"2026-12-16"` -> `{ y: 2026, m: 12, d: 16 }`. Pure string parsing, no time zones. */
function parts(d: IsoDate): { y: number; m: number; d: number } {
  const [y, m, day] = d.split("-").map(Number);
  return { y, m, d: day };
}

/** `"16 Dec 2026"`. Day is not zero-padded. */
export function formatDate(d: IsoDate): string {
  const p = parts(d);
  return `${p.d} ${MONTHS[p.m - 1]} ${p.y}`;
}

/**
 * Human-readable inclusive range, repeating only what changes. The dash is an
 * en dash (U+2013) with spaces on both sides except when only the day differs:
 *
 * - same day              -> `"16 Dec 2026"`
 * - same month and year   -> `"18–20 Dec 2026"`
 * - same year, diff month -> `"1 Jan – 6 Feb 2027"`
 * - different years       -> `"22 Nov 2026 – 28 Feb 2027"`
 *
 * `end` is expected to be on or after `start`; the validator enforces that for
 * content, and this function does not re-order the pair.
 */
export function formatRange(start: IsoDate, end: IsoDate): string {
  if (start === end) return formatDate(start);
  const s = parts(start);
  const e = parts(end);
  if (s.y === e.y && s.m === e.m) return `${s.d}–${e.d} ${MONTHS[s.m - 1]} ${s.y}`;
  if (s.y === e.y) return `${s.d} ${MONTHS[s.m - 1]} – ${e.d} ${MONTHS[e.m - 1]} ${e.y}`;
  return `${formatDate(start)} – ${formatDate(end)}`;
}
