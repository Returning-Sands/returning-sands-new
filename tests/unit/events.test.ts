import { describe, expect, it } from "vitest";
import { events as content } from "@/content/events";
import { BUILD_DATE } from "@/lib/buildInfo";
import {
  byCity,
  cityRange,
  deriveStatus,
  earliestDateText,
  endDate,
  eventCount,
  formatRange,
  orderCampaignList,
  orderPast,
  orderUpcoming,
  resolveEvents,
  startDate,
  type ResolvedEvent,
} from "@/lib/events";
import { OLD_HASH_MAP, redirectFor } from "@/lib/redirects";
import { fileAsset, resolveAsset } from "@/lib/assets";
import type { DesignAssetKey, Event, IsoDate } from "@/lib/types";

// Build date fixed well before every event in the real content, so none are past.
const BEFORE_ALL: IsoDate = "2026-09-30";

function mk(id: string, city: Event["city"], date: Event["date"], extra: Partial<Event> = {}): Event {
  return {
    id,
    title: id,
    stampLabel: id.toUpperCase(),
    city,
    venue: "Venue",
    date,
    dateDisplay: date === null ? "Date TBA" : "display " + id,
    blurb: "Blurb.",
    airportCodes: { from: "LHR", to: "CAI" },
    ...extra,
  };
}

const ids = (list: Event[]) => list.map((e) => e.id);

describe("buildInfo", () => {
  it("BUILD_DATE is a YYYY-MM-DD string", () => {
    expect(BUILD_DATE).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("startDate / endDate", () => {
  it("handle single, range and TBA", () => {
    expect(startDate("2026-12-16")).toBe("2026-12-16");
    expect(endDate("2026-12-16")).toBe("2026-12-16");
    expect(startDate({ start: "2026-12-18", end: "2026-12-20" })).toBe("2026-12-18");
    expect(endDate({ start: "2026-12-18", end: "2026-12-20" })).toBe("2026-12-20");
    expect(startDate(null)).toBeNull();
    expect(endDate(null)).toBeNull();
  });
});

describe("deriveStatus", () => {
  const range = mk("r", "cairo", { start: "2026-12-18", end: "2026-12-20" });

  it("is upcoming when the build date is before the end", () => {
    expect(deriveStatus(range, "2026-12-19")).toBe("upcoming");
  });

  it("is upcoming when the build date equals the end (last day still counts)", () => {
    expect(deriveStatus(range, "2026-12-20")).toBe("upcoming");
  });

  it("is past when the build date is after the end", () => {
    expect(deriveStatus(range, "2026-12-21")).toBe("past");
  });

  it("never marks a TBA event past from dates alone", () => {
    expect(deriveStatus(mk("t", "nyc", null), "2099-01-01")).toBe("upcoming");
  });

  it("lets a declared status override the date-derived one", () => {
    expect(deriveStatus({ ...range, status: "past" }, "2020-01-01")).toBe("past");
    expect(deriveStatus({ ...range, status: "upcoming" }, "2099-01-01")).toBe("upcoming");
  });

  it("resolveEvents keeps file order and adds status", () => {
    const resolved = resolveEvents(content.events, BEFORE_ALL);
    expect(ids(resolved)).toEqual(ids(content.events));
    expect(resolved.every((e) => e.status === "upcoming")).toBe(true);
    const later = resolveEvents(content.events, "2026-12-31");
    expect(later.find((e) => e.id === "cairo-auc-conversation")?.status).toBe("past");
    expect(later.find((e) => e.id === "london-ruby-cruel")?.status).toBe("upcoming");
  });
});

describe("orderUpcoming / orderPast", () => {
  it("orders dated events by start ascending and puts TBA last in file order", () => {
    const list = resolveEvents(
      [
        mk("tba-1", "nyc", null),
        mk("late", "nyc", "2027-03-01"),
        mk("early", "nyc", { start: "2026-11-22", end: "2026-11-22" }),
        mk("tba-2", "nyc", null),
      ],
      BEFORE_ALL,
    );
    expect(ids(orderUpcoming(list))).toEqual(["early", "late", "tba-1", "tba-2"]);
  });

  it("is stable for equal start dates", () => {
    const list = resolveEvents([mk("a", "cairo", "2026-12-16"), mk("b", "cairo", "2026-12-16")], BEFORE_ALL);
    expect(ids(orderUpcoming(list))).toEqual(["a", "b"]);
  });

  it("orderUpcoming excludes past events and orderPast lists them end-desc", () => {
    const list = resolveEvents(
      [
        mk("p1", "cairo", "2026-12-16"),
        mk("p2", "cairo", { start: "2026-12-18", end: "2026-12-20" }),
        mk("u", "cairo", "2027-01-05"),
      ],
      "2026-12-31",
    );
    expect(ids(orderUpcoming(list))).toEqual(["u"]);
    expect(ids(orderPast(list))).toEqual(["p2", "p1"]);
  });

  it("real london events: culture-house starts before ruby-cruel", () => {
    const london = byCity(resolveEvents(content.events, BEFORE_ALL), "london");
    expect(ids(orderUpcoming(london))).toEqual(["london-culture-house", "london-ruby-cruel"]);
  });
});

describe("orderCampaignList", () => {
  it("places nyc-exclusive-showcase right after the last dated NYC event (real content, 2026-09-30)", () => {
    const ordered = orderCampaignList(resolveEvents(content.events, BEFORE_ALL));
    expect(ordered).toHaveLength(7);
    expect(ids(ordered)).toEqual([
      "nyc-performance-night",
      "cairo-auc-conversation",
      "cairo-access-art-exhibition",
      "london-culture-house",
      "london-ruby-cruel",
      "nyc-space-360-exhibition",
      "nyc-exclusive-showcase",
    ]);
  });

  it("puts a TBA event whose city has no dated event at the end", () => {
    const list = resolveEvents(
      [mk("tba-london", "london", null), mk("cairo-1", "cairo", "2026-12-16"), mk("nyc-1", "nyc", "2026-11-22")],
      BEFORE_ALL,
    );
    expect(ids(orderCampaignList(list))).toEqual(["nyc-1", "cairo-1", "tba-london"]);
  });

  it("keeps multiple TBA events of one city together, in file order", () => {
    const list = resolveEvents(
      [mk("tba-a", "nyc", null), mk("nyc-1", "nyc", "2026-11-22"), mk("tba-b", "nyc", null), mk("cairo-1", "cairo", "2026-12-16")],
      BEFORE_ALL,
    );
    expect(ids(orderCampaignList(list))).toEqual(["nyc-1", "tba-a", "tba-b", "cairo-1"]);
  });
});

describe("formatRange", () => {
  it("collapses the repeated parts of the range", () => {
    expect(formatRange("2026-12-16", "2026-12-16")).toBe("16 Dec 2026");
    expect(formatRange("2026-12-18", "2026-12-20")).toBe("18–20 Dec 2026");
    expect(formatRange("2027-01-01", "2027-02-06")).toBe("1 Jan – 6 Feb 2027");
    expect(formatRange("2026-11-22", "2027-02-28")).toBe("22 Nov 2026 – 28 Feb 2027");
  });
});

describe("cityRange", () => {
  const real = content.events;

  it("cairo spans 16–20 Dec 2026 with no TBA suffix", () => {
    const text = cityRange(real, "cairo");
    expect(text).toBe("16–20 Dec 2026");
    expect(text).toContain("16");
    expect(text).toContain("20 Dec 2026");
    expect(text).not.toContain("TBA");
  });

  it("nyc spans Nov 2026 to Feb 2027 and appends + TBA", () => {
    expect(cityRange(real, "nyc")).toBe("22 Nov 2026 – 28 Feb 2027 + TBA");
  });

  it("london spans Jan to Feb 2027", () => {
    expect(cityRange(real, "london")).toBe("1 Jan – 6 Feb 2027");
  });

  it("returns Dates TBA when the city has no dated event", () => {
    expect(cityRange([mk("x", "london", null)], "london")).toBe("Dates TBA");
    expect(cityRange([], "cairo")).toBe("Dates TBA");
  });
});

describe("earliestDateText / eventCount", () => {
  it("london shows the Culture House dateDisplay (earliest start)", () => {
    expect(earliestDateText(content.events, "london")).toBe("January 2027, day TBA");
  });

  it("cairo and nyc show their earliest dated event", () => {
    expect(earliestDateText(content.events, "cairo")).toBe("16 December 2026");
    expect(earliestDateText(content.events, "nyc")).toBe("22 November 2026");
  });

  it("returns TBA when a city has no dated event", () => {
    expect(earliestDateText([mk("x", "nyc", null)], "nyc")).toBe("TBA");
  });

  it("counts every event in the city including TBA ones", () => {
    expect(eventCount(content.events, "cairo")).toBe(2);
    expect(eventCount(content.events, "nyc")).toBe(3);
    expect(eventCount(content.events, "london")).toBe(2);
  });
});

describe("redirectFor", () => {
  it("maps each of the seven Old_Site fragments", () => {
    expect(redirectFor("#stake")).toBe("/at-stake");
    expect(redirectFor("#campaign")).toBe("/campaign");
    expect(redirectFor("#documentary")).toBe("/film");
    expect(redirectFor("#events")).toBe("/campaign");
    expect(redirectFor("#team")).toBe("/team");
    expect(redirectFor("#donate")).toBe("/donate");
    expect(redirectFor("#contact")).toBe("/support");
    expect(Object.keys(OLD_HASH_MAP)).toHaveLength(7);
  });

  it("returns null for empty, unknown, case-mismatched and prototype keys", () => {
    expect(redirectFor("")).toBeNull();
    expect(redirectFor("#nope")).toBeNull();
    expect(redirectFor("#Donate")).toBeNull();
    expect(redirectFor("donate")).toBeNull();
    expect(redirectFor("toString")).toBeNull();
  });
});

describe("resolveAsset / fileAsset", () => {
  const allFalse: Record<DesignAssetKey, boolean> = {
    stampOval: false,
    passportCover: false,
    passportSpread: false,
    cityStamps: false,
    boardingPass: false,
    admissionTicket: false,
    passportCardFrame: false,
    silhouette: false,
    eventStamps: false,
  };

  it("returns the stand-in for every key when all flags are false", () => {
    for (const key of Object.keys(allFalse) as DesignAssetKey[]) {
      expect(resolveAsset(key, allFalse)).toEqual({ kind: "standin" });
    }
  });

  it("returns the designer URL (public prefix stripped) when the flag is true", () => {
    expect(resolveAsset("stampOval", { ...allFalse, stampOval: true })).toEqual({
      kind: "designer",
      src: "/design/stamp-oval.svg",
    });
    expect(resolveAsset("cityStamps", { ...allFalse, cityStamps: true })).toEqual({
      kind: "designer",
      src: "/design/city-stamps/",
    });
  });

  it("uses the real site flags by default (currently all false)", () => {
    expect(resolveAsset("stampOval")).toEqual({ kind: "standin" });
  });

  it("fileAsset returns the URL for an existing file and null otherwise", () => {
    expect(fileAsset("public/img/ali.jpg")).toBe("/img/ali.jpg");
    expect(fileAsset("public/design/does-not-exist.png")).toBeNull();
  });
});

// Type-level check that ResolvedEvent is assignable where Event is expected.
const _typeCheck: Event = { ...mk("t", "cairo", null), status: "upcoming" } satisfies ResolvedEvent;
void _typeCheck;
