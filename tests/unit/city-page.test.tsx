import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

import CityPage, { cityPageModel, generateMetadata, generateStaticParams } from "@/app/campaign/[city]/page";
import { events } from "@/content/events";
import { site } from "@/content/site";

// City_Page (Req 7, 16.11, 16.12). `cityPageModel` is pure, so grouping and
// ordering are checked directly against the real content with fixed build
// dates. The render test awaits the async Server Component and mounts the
// returned element; `BUILD_DATE` is pinned so the real calendar never flips a
// Cairo Event into the past group.

vi.mock("@/lib/buildInfo", () => ({ BUILD_DATE: "2026-09-30" }));

afterEach(cleanup);

const ids = (list: { id: string }[]) => list.map((e) => e.id);

describe("generateStaticParams", () => {
  it("returns exactly the three cities", () => {
    expect(generateStaticParams()).toEqual([{ city: "cairo" }, { city: "london" }, { city: "nyc" }]);
  });
});

describe("cityPageModel", () => {
  it("london before any event: both upcoming by start asc, no past (Req 7.1, 7.2)", () => {
    const m = cityPageModel("london", "2026-09-30");
    expect(m.name).toBe("London");
    expect(m.framing).toBe(events.cities.london.framing);
    // Culture House starts 2027-01-01, Ruby Cruel 2027-01-16.
    expect(ids(m.upcoming)).toEqual(["london-culture-house", "london-ruby-cruel"]);
    expect(m.past).toEqual([]);
  });

  it("nyc after Feb 2027: TBA stays upcoming, past ordered by end desc (Req 7.8, 7.9)", () => {
    const m = cityPageModel("nyc", "2027-03-01");
    expect(ids(m.upcoming)).toEqual(["nyc-exclusive-showcase"]);
    expect(ids(m.past)).toEqual(["nyc-space-360-exhibition", "nyc-performance-night"]);
    for (const e of m.past) expect(e.status).toBe("past");
  });

  it("includes only the city's own events (Req 7.1)", () => {
    for (const city of ["cairo", "london", "nyc"] as const) {
      const m = cityPageModel(city, "2026-09-30");
      const all = [...m.upcoming, ...m.past];
      expect(all.length).toBe(events.events.filter((e) => e.city === city).length);
      for (const e of all) expect(e.city).toBe(city);
    }
  });
});

describe("generateMetadata", () => {
  it("uses the campaignNyc page metadata and canonical path", async () => {
    const meta = await generateMetadata({ params: Promise.resolve({ city: "nyc" }) });
    expect(meta.title).toBe(site.pages.campaignNyc.title);
    expect(meta.description).toBe(site.pages.campaignNyc.description);
    expect(meta.alternates?.canonical).toBe("https://returningsands.org/campaign/nyc");
  });
});

describe("/campaign/cairo rendered", () => {
  it("renders h1, two EventCards, no past group, two JSON-LD blocks and the nav links", async () => {
    const element = await CityPage({ params: Promise.resolve({ city: "cairo" }) });
    const { container } = render(element);

    expect(screen.getByRole("heading", { level: 1, name: "Cairo" })).toBeInTheDocument();
    expect(screen.getByText(events.cities.cairo.framing)).toBeInTheDocument();

    expect(screen.getByRole("heading", { level: 2, name: "Upcoming" })).toBeInTheDocument();
    const cards = container.querySelectorAll("article[id]");
    expect(Array.from(cards).map((c) => c.id)).toEqual([
      "cairo-auc-conversation",
      "cairo-access-art-exhibition",
    ]);
    expect(screen.queryByText(/No upcoming events/)).toBeNull();

    // Req 7.11: no past events, so no "Past events" heading at all.
    expect(screen.queryByRole("heading", { level: 2, name: "Past events" })).toBeNull();
    expect(screen.queryByText("PAST")).toBeNull();

    // Req 16.11: one Event JSON-LD per dated Event (both Cairo Events are dated).
    const scripts = container.querySelectorAll('script[type="application/ld+json"]');
    expect(scripts).toHaveLength(2);
    const names = Array.from(scripts).map((s) => JSON.parse(s.textContent ?? "").name);
    expect(names).toEqual([
      "In Conversation at the American University in Cairo",
      "Exhibition at Access Art Space",
    ]);

    // Req 7.12: other two City_Pages named by city, plus the overview.
    expect(screen.getByRole("link", { name: "London" })).toHaveAttribute("href", "/campaign/london");
    expect(screen.getByRole("link", { name: "New York" })).toHaveAttribute("href", "/campaign/nyc");
    expect(screen.getByRole("link", { name: "All events" })).toHaveAttribute("href", "/campaign");
    expect(screen.queryByRole("link", { name: "Cairo" })).toBeNull();
  });
});
