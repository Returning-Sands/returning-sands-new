import { Stamp } from "@/components/motifs/Stamp";
import type { ResolvedEvent } from "@/lib/events";

// The per-event oval stamp (Req 7.3, 7.8). Server component.
//
// A thin wrapper over `Stamp`: the Event's `stampLabel` becomes the rectangular
// sub-label box and a resolved `past` status adds the "PAST" overprint as real
// text (never aria-hidden) so assistive technology hears it too.
export function EventStamp({ event, size }: { event: ResolvedEvent; size?: number }) {
  return (
    <Stamp subLabel={event.stampLabel} overprint={event.status === "past" ? "PAST" : undefined} size={size} />
  );
}
