/**
 * Date line for the `/campaign` Boarding_Pass Share_Card (Req 16.6): the span
 * from the earliest start to the latest end across every dated Event, or
 * `"TBA"` when no Event has a confirmed date. Pure; takes the Event list.
 */
import { endDate, formatRange, startDate } from "@/lib/events";
import type { Event, IsoDate } from "@/lib/types";

export function campaignRange(events: Event[]): string {
  const starts = events.map((e) => startDate(e.date)).filter((d): d is IsoDate => d !== null);
  const ends = events.map((e) => endDate(e.date)).filter((d): d is IsoDate => d !== null);
  if (starts.length === 0) return "TBA";
  const min = starts.reduce((a, b) => (b < a ? b : a));
  const max = ends.reduce((a, b) => (b > a ? b : a));
  return formatRange(min, max);
}
