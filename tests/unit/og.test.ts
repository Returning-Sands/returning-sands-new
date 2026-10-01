import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { events } from "@/content/events";
import { site } from "@/content/site";
import { routeText } from "@/lib/boardingPass";
import { truncateTitle } from "@/lib/metadata";
import { boardingPassCard } from "@/lib/og/boardingPassCard";
import { campaignRange } from "@/lib/og/campaignRange";
import { cityCardProps } from "@/lib/og/cityCard";
import { defaultCard, OG_FOOTER_HOST } from "@/lib/og/defaultCard";
import { OG_CONTENT_TYPE, OG_SIZE } from "@/lib/og/render";
import type { EventsContent } from "@/lib/types";

// Share_Card renderers (Req 16.3, 16.5, 16.6, 16.7). The JSX is rendered to
// static markup here; `ImageResponse` itself is exercised by the build and by
// the optional task 12.4 byte-size test, not by these unit tests.

const LONG_TITLE = "A".repeat(45) + " " + "B".repeat(44); // 90 chars

describe("renderOg constants", () => {
  it("exports the 1200x630 PNG contract every route re-exports", () => {
    expect(OG_SIZE).toEqual({ width: 1200, height: 630 });
    expect(OG_CONTENT_TYPE).toBe("image/png");
  });
});

describe("defaultCard", () => {
  it("renders the title, the stamp text and the site host", () => {
    const html = renderToStaticMarkup(defaultCard({ title: site.pages.about.title }));
    expect(html).toContain(site.pages.about.title);
    expect(html).toContain("RETURNING SANDS");
    expect(html).toContain(site.kicker.replace("&", "&amp;"));
    expect(html).toContain(OG_FOOTER_HOST);
  });

  it("truncates a 90-character title to 60 characters with an ellipsis", () => {
    const html = renderToStaticMarkup(defaultCard({ title: LONG_TITLE }));
    const expected = truncateTitle(LONG_TITLE);
    expect(Array.from(expected)).toHaveLength(60);
    expect(expected.endsWith("…")).toBe(true);
    expect(html).toContain(expected);
    expect(html).not.toContain(LONG_TITLE);
  });

  it("gives every multi-child div an explicit display:flex (Satori rule)", () => {
    const html = renderToStaticMarkup(defaultCard({ title: "Satori layout check" }));
    // Any <div> whose immediate content is a nested <div> must be a flex box.
    const nestedParents = html.match(/<div[^>]*>(?=\s*<div)/g) ?? [];
    expect(nestedParents.length).toBeGreaterThan(0);
    for (const tag of nestedParents) expect(tag).toMatch(/display:\s*flex/);
  });
});

describe("boardingPassCard", () => {
  const props = {
    heading: "IMPACT CAMPAIGN",
    from: "CAI",
    to: "JFK",
    code: "ALL",
    dateText: "22 Nov 2026 – 28 Feb 2027",
    title: "Seven events in three cities",
  };

  it("prints heading, route, event code, date text and title", () => {
    const html = renderToStaticMarkup(boardingPassCard(props));
    expect(html).toContain("BOARDING PASS");
    expect(html).toContain(props.heading);
    expect(html).toContain(routeText("CAI", "JFK"));
    expect(html).toContain("EVENT ALL");
    expect(html).toContain(props.dateText);
    expect(html).toContain(props.title);
  });

  it("omits the event code line when no code is given", () => {
    const html = renderToStaticMarkup(boardingPassCard({ ...props, code: undefined }));
    expect(html).not.toContain("EVENT ");
  });

  it("truncates a 90-character stub title to 60 characters", () => {
    const html = renderToStaticMarkup(boardingPassCard({ ...props, title: LONG_TITLE }));
    expect(html).toContain(truncateTitle(LONG_TITLE));
    expect(html).not.toContain(LONG_TITLE);
  });
});

describe("campaignRange", () => {
  it("spans the earliest start to the latest end across the real Events", () => {
    expect(campaignRange(events.events)).toBe("22 Nov 2026 – 28 Feb 2027");
  });

  it("returns TBA when no Event is dated", () => {
    expect(campaignRange(events.events.map((e) => ({ ...e, date: null })))).toBe("TBA");
  });
});

describe("cityCardProps", () => {
  it("builds each real city's card from its Events and page title", () => {
    const cairo = cityCardProps("cairo", events, site.pages);
    expect(cairo.heading).toBe("CAIRO");
    expect(cairo.to).toBe("CAI");
    expect(cairo.dateText).toBe("16–20 Dec 2026");
    expect(cairo.title).toBe(site.pages.campaignCairo.title);

    const nyc = cityCardProps("nyc", events, site.pages);
    expect(nyc.heading).toBe("NEW YORK");
    expect(nyc.dateText).toContain("+ TBA");
  });

  it("prints exactly TBA when a city has no confirmed date (16.7)", () => {
    const undated: EventsContent = {
      ...events,
      events: events.events.map((e) => (e.city === "london" ? { ...e, date: null } : e)),
    };
    expect(cityCardProps("london", undated, site.pages).dateText).toBe("TBA");
  });

  it("falls back to LHR → city IATA when a city has no Events", () => {
    const empty: EventsContent = { ...events, events: events.events.filter((e) => e.city !== "cairo") };
    const card = cityCardProps("cairo", empty, site.pages);
    expect(card.from).toBe("LHR");
    expect(card.to).toBe("CAI");
    expect(card.dateText).toBe("TBA");
  });
});
