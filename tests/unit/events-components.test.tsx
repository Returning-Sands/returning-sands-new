import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

import { EventStamp } from "@/components/events/EventStamp";
import { EventCard, EVENT_IMAGE_SIZES } from "@/components/events/EventCard";
import { CityCard } from "@/components/events/CityCard";
import { EventJsonLd } from "@/components/events/EventJsonLd";
import { events as content } from "@/content/events";
import { cityRange, eventCount, resolveEvents, type ResolvedEvent } from "@/lib/events";
import { eventJsonLd } from "@/lib/jsonld";
import type { Event, IsoDate } from "@/lib/types";

// Vitest runs without `globals: true`, so Testing Library's automatic
// unmount does not register; `screen` queries need an explicit cleanup.
afterEach(cleanup);

// Build date fixed well before every event in the real content, so none are past.
const BEFORE_ALL: IsoDate = "2026-09-30";
const resolved = resolveEvents(content.events, BEFORE_ALL);

function find(id: string): ResolvedEvent {
  const e = resolved.find((x) => x.id === id);
  if (!e) throw new Error(`no event ${id}`);
  return e;
}

function raw(id: string): Event {
  const e = content.events.find((x) => x.id === id);
  if (!e) throw new Error(`no event ${id}`);
  return e;
}

/** True when `el` or any ancestor is `aria-hidden="true"`. */
function isAriaHidden(el: Element): boolean {
  return el.closest('[aria-hidden="true"]') !== null;
}

// ---------------------------------------------------------------------------
// EventStamp (Req 7.3, 7.8)
// ---------------------------------------------------------------------------
describe("EventStamp", () => {
  it("shows the stampLabel and PAST iff the status is past", () => {
    const auc = find("cairo-auc-conversation");
    const { rerender } = render(<EventStamp event={auc} />);
    expect(screen.getByText(auc.stampLabel)).toBeInTheDocument();
    expect(screen.queryByText("PAST")).toBeNull();

    rerender(<EventStamp event={{ ...auc, status: "past" }} />);
    const past = screen.getByText("PAST");
    expect(isAriaHidden(past)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// EventCard (Req 7.3, 7.8, 6.6)
// ---------------------------------------------------------------------------
describe("EventCard", () => {
  it("renders id, title, venue, dateDisplay and blurb for a dated event", () => {
    const auc = find("cairo-auc-conversation");
    const { container } = render(<EventCard event={auc} />);
    expect(container.querySelector("article")).toHaveAttribute("id", "cairo-auc-conversation");
    expect(screen.getByRole("heading", { level: 3, name: auc.title })).toBeInTheDocument();
    expect(screen.getByText(auc.venue)).toBeInTheDocument();
    expect(screen.getByText(auc.dateDisplay)).toBeInTheDocument();
    expect(screen.getByText(auc.blurb)).toBeInTheDocument();
    expect(screen.getByText(auc.stampLabel)).toBeInTheDocument();
    expect(screen.queryByText("Date TBA")).toBeNull();
  });

  it("shows 'Date TBA' when the date is null, whatever dateDisplay says", () => {
    const tba = { ...find("nyc-exclusive-showcase"), dateDisplay: "something else" };
    render(<EventCard event={tba} />);
    expect(screen.getByText("Date TBA")).toBeInTheDocument();
    expect(screen.queryByText("something else")).toBeNull();
  });

  it("renders the sponsor line only for london-ruby-cruel in the real content", () => {
    for (const e of resolved) {
      const { container, unmount } = render(<EventCard event={e} />);
      const hasSponsor = container.textContent?.includes("Bermuda Arts Council") ?? false;
      expect(hasSponsor).toBe(e.id === "london-ruby-cruel");
      unmount();
    }
    render(<EventCard event={find("london-ruby-cruel")} />);
    expect(screen.getByText(raw("london-ruby-cruel").sponsorLine!).tagName).toBe("P");
  });

  it("renders PAST text iff status is past", () => {
    const auc = find("cairo-auc-conversation");
    const upcoming = render(<EventCard event={auc} />);
    expect(upcoming.queryByText("PAST")).toBeNull();
    upcoming.unmount();

    const past = render(<EventCard event={{ ...auc, status: "past" }} />);
    expect(isAriaHidden(past.getByText("PAST"))).toBe(false);
  });

  it("renders no img and no empty optional elements when images/link are absent", () => {
    const { container } = render(<EventCard event={find("cairo-auc-conversation")} />);
    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector("ul")).toBeNull();
    expect(container.querySelector("a")).toBeNull();
    for (const p of Array.from(container.querySelectorAll("p"))) {
      expect(p.textContent?.trim()).not.toBe("");
    }
  });

  it("renders an images grid (max 6) with alt and sizes, and the external link via SmartLink", () => {
    const base = find("cairo-access-art-exhibition");
    // Eight images supplied; the card must cap the grid at six.
    const images = Array.from({ length: 8 }, (_, i) => ({
      src: `/img/photo-${i}.jpg`,
      alt: `Photo ${i}`,
    }));
    const withExtras: ResolvedEvent = {
      ...base,
      images,
      externalLink: { label: "Book tickets", href: "https://example.com/tickets" },
    };
    const { container } = render(<EventCard event={withExtras} />);
    const imgs = Array.from(container.querySelectorAll("img"));
    expect(imgs).toHaveLength(6);
    for (const img of imgs) {
      expect(img.getAttribute("alt")).toMatch(/^Photo \d$/);
      expect(img).toHaveAttribute("sizes", EVENT_IMAGE_SIZES);
    }
    const link = screen.getByRole("link", { name: /Book tickets/ });
    expect(link).toHaveAttribute("href", "https://example.com/tickets");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });
});

// ---------------------------------------------------------------------------
// CityCard (Req 6.4, 6.5)
// ---------------------------------------------------------------------------
describe("CityCard", () => {
  it("renders Cairo's range, count and link from the real content", () => {
    render(<CityCard city="cairo" name="Cairo" events={content.events} href="/campaign/cairo" />);
    expect(screen.getByRole("heading", { level: 3, name: "Cairo" })).toBeInTheDocument();
    expect(screen.getByText(cityRange(content.events, "cairo"))).toBeInTheDocument();
    expect(screen.getByText("16–20 Dec 2026")).toBeInTheDocument();
    expect(screen.getByText(`${eventCount(content.events, "cairo")} events`)).toBeInTheDocument();
    expect(screen.getByText("2 events")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "See Cairo events" })).toHaveAttribute("href", "/campaign/cairo");
  });

  it("renders NYC's range with the TBA suffix and a 3-event count", () => {
    render(<CityCard city="nyc" name="New York" events={content.events} href="/campaign/nyc" />);
    const range = cityRange(content.events, "nyc");
    expect(range.endsWith(" + TBA")).toBe(true);
    expect(screen.getByText(range)).toBeInTheDocument();
    expect(screen.getByText("3 events")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "See New York events" })).toHaveAttribute("href", "/campaign/nyc");
  });

  it("uses the singular noun for exactly one event and 'Dates TBA' when none are dated", () => {
    const one: Event[] = [{ ...raw("nyc-exclusive-showcase") }];
    render(<CityCard city="nyc" name="New York" events={one} href="/campaign/nyc" />);
    expect(screen.getByText("1 event")).toBeInTheDocument();
    expect(screen.getByText("Dates TBA")).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// eventJsonLd + EventJsonLd (Req 16.11, 16.12) — Property 21 examples
// ---------------------------------------------------------------------------
describe("eventJsonLd", () => {
  it("returns null for a TBA event", () => {
    expect(eventJsonLd(raw("nyc-exclusive-showcase"), "New York")).toBeNull();
  });

  it("builds an Event block with start/end for a range", () => {
    const e = raw("london-ruby-cruel");
    const data = eventJsonLd(e, "London") as Record<string, unknown> | null;
    expect(data).not.toBeNull();
    expect(data).toMatchObject({
      "@context": "https://schema.org",
      "@type": "Event",
      name: e.title,
      startDate: "2027-01-16",
      endDate: "2027-02-06",
      eventStatus: "https://schema.org/EventScheduled",
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      description: e.blurb,
      location: {
        "@type": "Place",
        name: e.venue,
        address: { "@type": "PostalAddress", addressLocality: "London" },
      },
      organizer: { "@type": "Organization", name: "Returning Sands", url: "https://returningsands.org" },
    });
    expect(() => JSON.parse(JSON.stringify(data))).not.toThrow();
  });

  it("sets endDate equal to startDate for a single date", () => {
    const data = eventJsonLd(raw("cairo-auc-conversation"), "Cairo") as { startDate: string; endDate: string };
    expect(data.startDate).toBe("2026-12-16");
    expect(data.endDate).toBe(data.startDate);
  });
});

describe("EventJsonLd", () => {
  it("renders one ld+json script for a dated event", () => {
    const e = raw("nyc-performance-night");
    const { container } = render(<EventJsonLd event={e} cityName="New York" />);
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();
    const parsed = JSON.parse(script!.textContent ?? "");
    expect(parsed["@type"]).toBe("Event");
    expect(parsed.name).toBe(e.title);
    expect(parsed.startDate).toBe("2026-11-22");
    expect(parsed.location.address.addressLocality).toBe("New York");
  });

  it("renders nothing for a TBA event", () => {
    const { container } = render(<EventJsonLd event={raw("nyc-exclusive-showcase")} cityName="New York" />);
    expect(container.innerHTML).toBe("");
  });
});
