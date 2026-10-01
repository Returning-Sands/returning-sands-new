import Image from "next/image";
import { SmartLink } from "@/components/layout/SmartLink";
import type { ResolvedEvent } from "@/lib/events";
import { isPending } from "@/lib/pending";
import { EventStamp } from "./EventStamp";

// Full Event entry on a City_Page (Req 7.3, 7.8). Server component.
//
// The `<article>` carries `id={event.id}` so `/campaign` can deep-link to it
// (`/campaign/london#london-ruby-cruel`, Req 6.6). Required fields always
// render: stamp, title, venue, date (or "Date TBA") and blurb. Optional fields
// — sponsor line, images, external link — render only when present, leaving no
// empty element behind. Images go through next/image with an explicit `sizes`
// (three columns from `md` up, full width below) and each carries its own alt.

/** Validator caps `images` at six; the slice is belt-and-braces for tests. */
const MAX_IMAGES = 6;

/** Grid is single-column below `md` and three columns from `md` up. */
export const EVENT_IMAGE_SIZES = "(min-width: 768px) 33vw, 100vw";

export function EventCard({ event, className = "" }: { event: ResolvedEvent; className?: string }) {
  const dateText = event.date === null ? "Date TBA" : event.dateDisplay;
  const hasSponsor = !isPending(event.sponsorLine);
  const images = event.images?.slice(0, MAX_IMAGES) ?? [];
  const link = event.externalLink;

  return (
    <article
      id={event.id}
      className={`flex flex-col gap-4 border border-ink bg-sand-100 p-5 text-ink md:flex-row md:gap-8 ${className}`}
    >
      <div className="shrink-0 self-start">
        <EventStamp event={event} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <h3 className="font-display text-2xl font-bold leading-tight">{event.title}</h3>
        <p className="font-mono text-xs uppercase tracking-[0.12em]">{event.venue}</p>
        <p className="font-mono text-sm text-nile-700">{dateText}</p>
        <p className="leading-relaxed">{event.blurb}</p>

        {hasSponsor ? <p className="text-sm italic text-nile-700">{event.sponsorLine}</p> : null}

        {images.length > 0 ? (
          <ul className="grid list-none grid-cols-1 gap-3 p-0 md:grid-cols-3">
            {images.map((image) => (
              <li key={image.src} className="relative aspect-[4/3] overflow-hidden border border-ink">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes={EVENT_IMAGE_SIZES}
                  className="object-cover"
                />
              </li>
            ))}
          </ul>
        ) : null}

        {link ? (
          <p className="font-mono text-sm">
            <SmartLink href={link.href} className="underline underline-offset-4 hover:text-stamp-700">
              {link.label}
            </SmartLink>
          </p>
        ) : null}
      </div>
    </article>
  );
}
