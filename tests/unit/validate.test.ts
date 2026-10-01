// Example-based tests for lib/validate.ts (design.md "Build-time validation";
// Req 3.8, 4.5, 4.7, 5.11, 7.5, 8.7, 8.8, 10.10, 11.6, 14.8, 16.14, 20.8).
import { describe, expect, it } from "vitest";
import {
  bannedTermsIn,
  collectErrors,
  eventDateProblem,
  isIsoDate,
  partialGroupWarnings,
  realContent,
  validateAll,
  validateEvents,
  validateMetadata,
  validateMuseum,
  validateSite,
  validateTeam,
  type ContentSet,
} from "@/lib/validate";
import type { EventsContent, MuseumContent, SiteContent } from "@/lib/types";

/** Deep copy so each test can mutate freely without touching the real content. */
function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T;
}

const LINE_SHAPE = /^\[content\/(site|events|team|partners|donate|film|museum)\.ts\] .+: field ".+" .+$/;

describe("validateAll on the real content", () => {
  it("passes without throwing and returns a warnings array", () => {
    const result = validateAll();
    expect(Array.isArray(result.warnings)).toBe(true);
  });

  it("collectErrors returns an empty list", () => {
    expect(collectErrors(realContent)).toEqual([]);
  });

  it("reports no partial-group warnings while every grouped Placeholder is null", () => {
    expect(partialGroupWarnings(realContent)).toEqual([]);
  });
});

describe("validateEvents", () => {
  function mutated(fn: (events: EventsContent) => void): string[] {
    const events = clone(realContent.events);
    fn(events);
    return validateEvents(events);
  }

  it("names the file, the event id and the city field for a city outside the set", () => {
    const errors = mutated((ev) => {
      (ev.events[0] as { city: string }).city = "paris";
    });
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatch(LINE_SHAPE);
    expect(errors[0]).toContain("[content/events.ts]");
    expect(errors[0]).toContain('event "cairo-auc-conversation"');
    expect(errors[0]).toContain('field "city"');
    expect(errors[0]).toContain('"paris"');
  });

  it("flags a duplicate id on the second occurrence", () => {
    const errors = mutated((ev) => {
      ev.events[1].id = ev.events[0].id;
    });
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain('[content/events.ts] event "cairo-auc-conversation": field "id"');
    expect(errors[0]).toContain("unique");
  });

  it("flags a range whose end is before its start", () => {
    const errors = mutated((ev) => {
      ev.events[1].date = { start: "2026-12-20", end: "2026-12-18" };
    });
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain('event "cairo-access-art-exhibition"');
    expect(errors[0]).toContain('field "date"');
    expect(errors[0]).toContain("on or after start");
  });

  it("flags a lower-case IATA code", () => {
    const errors = mutated((ev) => {
      ev.events[2].airportCodes.to = "jfk";
    });
    expect(errors).toHaveLength(1);
    expect(errors[0]).toBe(
      '[content/events.ts] event "nyc-exclusive-showcase": field "airportCodes.to" must be 3 upper-case letters (got "jfk")',
    );
  });

  it("falls back to the list position when the id is missing", () => {
    const errors = mutated((ev) => {
      ev.events[3].id = "";
    });
    expect(errors.some((l) => l.includes("event at position 3") && l.includes('field "id"'))).toBe(true);
  });

  it("collects every error rather than stopping at the first", () => {
    const errors = mutated((ev) => {
      (ev.events[0] as { city: string }).city = "paris";
      ev.events[1].airportCodes.from = "lhr";
      ev.events[4].images = Array.from({ length: 7 }, () => ({ src: "/img/ali.jpg", alt: "Ali" }));
    });
    expect(errors).toHaveLength(3);
  });

  it("rejects an image with empty alt text", () => {
    const errors = mutated((ev) => {
      ev.events[0].images = [{ src: "/img/ali.jpg", alt: "" }];
    });
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain('field "images[0].alt"');
  });

  it("rejects an image whose file is not under public/", () => {
    const errors = mutated((ev) => {
      ev.events[0].images = [{ src: "/img/does-not-exist.jpg", alt: "Missing" }];
    });
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain('field "images[0].src"');
    expect(errors[0]).toContain("does not exist");
  });

  it("rejects a framing sentence over 200 characters", () => {
    const errors = mutated((ev) => {
      ev.cities.cairo.framing = "x".repeat(201);
    });
    expect(errors).toEqual([
      '[content/events.ts] cities.cairo: field "framing" must be 1–200 characters (got 201)',
    ]);
  });
});

describe("date helpers", () => {
  it("accepts real calendar dates only", () => {
    expect(isIsoDate("2026-12-16")).toBe(true);
    expect(isIsoDate("2027-02-29")).toBe(false);
    expect(isIsoDate("2026-13-01")).toBe(false);
    expect(isIsoDate("16-12-2026")).toBe(false);
    expect(isIsoDate("2026-12-16T00:00")).toBe(false);
  });

  it("accepts the three permitted EventDate forms", () => {
    expect(eventDateProblem(null)).toBeNull();
    expect(eventDateProblem("2026-12-16")).toBeNull();
    expect(eventDateProblem({ start: "2026-12-16", end: "2026-12-16" })).toBeNull();
    expect(eventDateProblem({ start: "2026-12-16", end: "2026-12-20" })).toBeNull();
  });

  it("rejects everything else", () => {
    expect(eventDateProblem(undefined)).not.toBeNull();
    expect(eventDateProblem("December 2026")).not.toBeNull();
    expect(eventDateProblem({ start: "2026-12-16" })).not.toBeNull();
    expect(eventDateProblem({ start: "2026-12-20", end: "2026-12-16" })).not.toBeNull();
  });
});

describe("validateMetadata", () => {
  it("accepts the real page metadata", () => {
    expect(validateMetadata(realContent.site.pages)).toEqual([]);
  });

  it("rejects a title shorter than 10 characters", () => {
    const pages = clone(realContent.site.pages);
    pages.team.title = "Team";
    const errors = validateMetadata(pages);
    expect(errors).toEqual(['[content/site.ts] pages.team: field "title" must be 10–60 characters (got 4)']);
  });

  it("rejects a description outside 50–160 characters", () => {
    const pages = clone(realContent.site.pages);
    pages.about.description = "Too short.";
    pages.film.description = "y".repeat(161);
    const errors = validateMetadata(pages);
    expect(errors).toHaveLength(2);
    expect(errors[0]).toContain('pages.about: field "description"');
    expect(errors[1]).toContain('pages.film: field "description"');
  });

  it("rejects duplicate titles and descriptions across pages", () => {
    const pages = clone(realContent.site.pages);
    pages.team.title = pages.about.title;
    pages.donate.description = pages.home.description;
    const errors = validateMetadata(pages);
    expect(errors).toHaveLength(2);
    expect(errors.some((l) => l.includes('pages.team: field "title"') && l.includes("duplicates pages.about"))).toBe(true);
    expect(
      errors.some((l) => l.includes('pages.donate: field "description"') && l.includes("duplicates pages.home")),
    ).toBe(true);
  });
});

describe("validateSite", () => {
  function mutated(fn: (site: SiteContent) => void): string[] {
    const site = clone(realContent.site);
    fn(site);
    return validateSite(site);
  }

  it("requires exactly five goals", () => {
    expect(mutated((s) => s.about.goals.pop())).toEqual([
      '[content/site.ts] about: field "goals" must list exactly 5 goals (got 4)',
    ]);
  });

  it("requires non-empty at-stake body paragraphs and stat fields", () => {
    const errors = mutated((s) => {
      s.atStake.body[1] = "   ";
      s.atStake.stat.label = "";
    });
    expect(errors).toHaveLength(2);
    expect(errors[0]).toContain('atStake: field "body[1]"');
    expect(errors[1]).toContain('atStake: field "stat.label"');
  });

  it("requires the home description to be at most 160 characters", () => {
    expect(mutated((s) => (s.description = "z".repeat(161)))).toEqual([
      '[content/site.ts] site: field "description" must be 1–160 characters (got 161)',
    ]);
  });

  it("requires the museum teaser to be 1–600 characters", () => {
    expect(mutated((s) => (s.campaign.museumTeaser = ""))).toEqual([
      '[content/site.ts] campaign: field "museumTeaser" must be 1–600 characters (got 0)',
    ]);
  });

  it("fails a Design_Asset flag whose file is missing", () => {
    const errors = mutated((s) => (s.designAssets.stampOval = true));
    expect(errors).toEqual([
      '[content/site.ts] designAssets: field "stampOval" is true but public/design/stamp-oval.svg does not exist',
    ]);
  });

  it("rejects an at-stake image that does not exist under public/", () => {
    const errors = mutated((s) => (s.atStake.images[0].src = "/img/nope.jpg"));
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain('atStake: field "images[0].src"');
  });
});

describe("validateMuseum", () => {
  function mutated(fn: (museum: MuseumContent) => void): string[] {
    const museum = clone(realContent.museum);
    fn(museum);
    return validateMuseum(museum);
  }

  it("rejects museum copy containing the term 3D", () => {
    const errors = mutated((m) => {
      m.intro[0] = "A 3D walkthrough of the galleries.";
    });
    expect(errors).toEqual([
      '[content/museum.ts] museum: field "intro[0]" must not name a delivery technology (found "3D")',
    ]);
  });

  it("scans every banned term on word boundaries, case-insensitively", () => {
    expect(bannedTermsIn("Explore in Virtual Reality or the Metaverse")).toEqual(["virtual reality", "metaverse"]);
    expect(bannedTermsIn("a vr headset")).toEqual(["VR"]);
    expect(bannedTermsIn("Augmented  reality overlays")).toEqual(["augmented reality"]);
    expect(bannedTermsIn("an AR layer")).toEqual(["AR"]);
    // The Virtual Museum itself, and words that merely contain the letters, are fine.
    expect(bannedTermsIn("The Virtual Museum opens; archives are catalogued.")).toEqual([]);
    expect(bannedTermsIn("Arabic artists")).toEqual([]);
  });

  it("requires exactly one current roadmap stage", () => {
    const none = mutated((m) => m.roadmap.forEach((s) => delete s.current));
    expect(none).toEqual([
      '[content/museum.ts] museum: field "roadmap" must flag exactly one stage with current: true (found 0)',
    ]);
    const two = mutated((m) => (m.roadmap[0].current = true));
    expect(two[0]).toContain("(found 2)");
  });

  it("requires 3–8 roadmap stages and 3–8 collections", () => {
    const errors = mutated((m) => {
      m.roadmap = m.roadmap.slice(0, 2);
      m.collections = m.collections.slice(0, 2);
    });
    expect(errors.some((l) => l.includes('field "roadmap" must list 3–8 stages (got 2)'))).toBe(true);
    expect(errors.some((l) => l.includes('field "collections" must list 3–8 collections (got 2)'))).toBe(true);
  });

  it("requires the three named collections", () => {
    const errors = mutated((m) => {
      m.collections[3].title = "Missing things";
    });
    expect(errors).toEqual([
      '[content/museum.ts] museum: field "collections" must include a collection titled "Lost artefacts room"',
    ]);
  });

  it("bounds collection and roadmap text lengths", () => {
    const errors = mutated((m) => {
      m.collections[2].title = "t".repeat(61); // "Oral histories" is not a required title
      m.roadmap[0].description = "d".repeat(301);
    });
    expect(errors).toHaveLength(2);
    expect(errors[0]).toContain('field "title" must be 1–60 characters (got 61)');
    expect(errors[1]).toContain('field "description" must be 1–300 characters (got 301)');
  });

  it("bounds the privacy notes at 160 characters", () => {
    const errors = mutated((m) => (m.ticket.privacyNote = "p".repeat(161)));
    expect(errors).toEqual([
      '[content/museum.ts] ticket: field "privacyNote" must be 1–160 characters (got 161)',
    ]);
  });
});

describe("validateTeam", () => {
  it("rejects an undeclared group and a non-positive order", () => {
    const team = clone(realContent.team);
    (team.members[0] as { group: string }).group = "Advisors";
    team.members[1].order = 0;
    const errors = validateTeam(team);
    expect(errors).toHaveLength(2);
    expect(errors[0]).toContain('[content/team.ts] member "Paris Quetzal Sistilli": field "group"');
    expect(errors[1]).toContain('[content/team.ts] member "Yusef Bushara": field "order"');
  });
});

describe("validateAll with corrupted content", () => {
  it("throws one Error that lists every problem", () => {
    const content: ContentSet = clone(realContent);
    (content.events.events[0] as { city: string }).city = "paris";
    (content.partners.partners[0] as { permission: string }).permission = "maybe";
    content.site.pages.team.title = "Team";
    expect(() => validateAll(content)).toThrowError(/Content validation failed with 3 errors/);
    try {
      validateAll(content);
    } catch (e) {
      const message = (e as Error).message;
      expect(message).toContain("[content/events.ts]");
      expect(message).toContain('[content/partners.ts] partner "SIMA": field "permission"');
      expect(message).toContain("[content/site.ts] pages.team");
    }
  });

  it("returns a warning for a partially filled grouped Placeholder instead of throwing", () => {
    const content: ContentSet = clone(realContent);
    content.site.pending.companyRegistration = { name: "Returning Sands CIC", number: "", address: "" };
    content.donate.pending.bankDetails = { accountName: "Returning Sands CIC", sortCode: "00-00-00", accountNumber: "" };
    const { warnings } = validateAll(content);
    expect(warnings).toHaveLength(2);
    expect(warnings[0]).toContain("[content/site.ts] pending.companyRegistration: partially filled");
    expect(warnings[0]).toContain('"number", "address"');
    expect(warnings[1]).toContain("[content/donate.ts] pending.bankDetails: partially filled");
  });
});
