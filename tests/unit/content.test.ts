// Unit tests for the real Content_Files under content/ (Task 3.5).
// Req 3.3 (Mission typo fix), 7.6 (seven Events), 7.7 (sponsor line),
// 10.3 (ten team members), 11.5 (thirteen partners in order), 14.3 (trailerUrl
// defined once, in content/film.ts).
import { describe, expect, it } from "vitest";
import { validateAll } from "@/lib/validate";
import { site } from "@/content/site";
import { events } from "@/content/events";
import { team } from "@/content/team";
import { partners } from "@/content/partners";
import { film } from "@/content/film";
import type { City, EventDate } from "@/lib/types";

describe("real content passes the validator", () => {
  it("validateAll() does not throw", () => {
    expect(() => validateAll()).not.toThrow();
  });
});

describe("content/events.ts — the seven Events (Req 7.6, 7.7)", () => {
  const expected: { id: string; city: City; date: EventDate }[] = [
    { id: "cairo-auc-conversation", city: "cairo", date: "2026-12-16" },
    { id: "cairo-access-art-exhibition", city: "cairo", date: { start: "2026-12-18", end: "2026-12-20" } },
    { id: "nyc-exclusive-showcase", city: "nyc", date: null },
    { id: "nyc-performance-night", city: "nyc", date: "2026-11-22" },
    { id: "london-ruby-cruel", city: "london", date: { start: "2027-01-16", end: "2027-02-06" } },
  ];

  it("has exactly seven events with unique ids", () => {
    expect(events.events).toHaveLength(7);
    expect(new Set(events.events.map((e) => e.id)).size).toBe(7);
  });

  it.each(expected)("$id is in $city with the stated date", ({ id, city, date }) => {
    const event = events.events.find((e) => e.id === id);
    expect(event).toBeDefined();
    expect(event?.city).toBe(city);
    expect(event?.date).toEqual(date);
  });

  it("nyc-space-360-exhibition is a February 2027 range", () => {
    const event = events.events.find((e) => e.id === "nyc-space-360-exhibition");
    expect(event?.city).toBe("nyc");
    expect(event?.date).toMatchObject({ start: expect.stringMatching(/^2027-02-/), end: expect.stringMatching(/^2027-02-/) });
  });

  it("london-culture-house is a January 2027 range with a day-TBA display", () => {
    const event = events.events.find((e) => e.id === "london-culture-house");
    expect(event?.city).toBe("london");
    expect(event?.date).toMatchObject({ start: expect.stringMatching(/^2027-01-/), end: expect.stringMatching(/^2027-01-/) });
    expect(event?.dateDisplay).toBe("January 2027, day TBA");
  });

  it("carries the Bermuda Arts Council sponsor line only on london-ruby-cruel", () => {
    const sponsored = events.events.filter((e) => e.sponsorLine !== undefined);
    expect(sponsored.map((e) => e.id)).toEqual(["london-ruby-cruel"]);
    expect(sponsored[0].sponsorLine).toBe(
      "This activation has been generously sponsored by the Bermuda Arts Council.",
    );
  });
});

describe("content/team.ts — ten members in three groups (Req 10.3)", () => {
  const byGroup = (group: string) =>
    team.members.filter((m) => m.group === group).sort((a, b) => a.order - b.order).map((m) => m.name);

  it("lists exactly ten members", () => {
    expect(team.members).toHaveLength(10);
  });

  it("declares the three groups in order", () => {
    expect(team.groups).toEqual(["Producers & Co-Founders", "Director & Executive Producer", "Core Team"]);
  });

  it("places three Producers & Co-Founders", () => {
    expect(byGroup("Producers & Co-Founders")).toEqual([
      "Paris Quetzal Sistilli",
      "Yusef Bushara",
      "Camilla Marchese González",
    ]);
  });

  it("places two in Director & Executive Producer", () => {
    expect(byGroup("Director & Executive Producer")).toEqual(["Aicha Cherif", "Basma Khalifa"]);
  });

  it("places five in Core Team", () => {
    expect(byGroup("Core Team")).toEqual([
      "Jenna Khalil",
      "Afra Elagab",
      "Anisa Estrada",
      "Cillian Lavelle",
      "Micheal Isaak",
    ]);
  });
});

describe("content/site.ts", () => {
  it("Mission contains \"written, painted, produced\" exactly once and never the source typo (Req 3.3)", () => {
    const mission = site.about.mission.join("\n");
    expect(mission.split("written, painted, produced")).toHaveLength(2);
    expect(mission).not.toContain("painted, painted");
  });

  it("keeps the home description at or under 160 characters (Req 2.1)", () => {
    expect(site.description.length).toBeGreaterThan(0);
    expect(site.description.length).toBeLessThanOrEqual(160);
  });

  it("has the seven nav links in Req 1.2 order, ending with Donate", () => {
    expect(site.nav).toEqual([
      { label: "About", href: "/about" },
      { label: "What's at Stake", href: "/at-stake" },
      { label: "Impact Campaign", href: "/campaign" },
      { label: "The Documentary", href: "/film" },
      { label: "Team", href: "/team" },
      { label: "Support", href: "/support" },
      { label: "Donate", href: "/donate" },
    ]);
    expect(site.nav.at(-1)?.label).toBe("Donate");
  });
});

describe("content/partners.ts — thirteen partners in Req 11.5 order", () => {
  it("lists the partners in the stated order", () => {
    expect(partners.heading).toBe("Partners & Supporters");
    expect(partners.partners.map((p) => p.name)).toEqual([
      "SIMA",
      "Ruby Cruel",
      "Bermuda Arts Council",
      "Kalam Aflam",
      "Sundance Institute",
      "The Muse multi studios",
      "Sudan Human Rights Hub",
      "Culture House",
      "The American University in Cairo",
      "SUDAAK",
      "Blue Shield International",
      "Access Art Space",
      "British Council",
    ]);
  });
});

describe("trailerUrl is defined only in content/film.ts (Req 14.3)", () => {
  it("lives in film.pending and nowhere in site.pending", () => {
    expect("trailerUrl" in film.pending).toBe(true);
    expect("trailerUrl" in site.pending).toBe(false);
    expect("trailerUrl" in site).toBe(false);
  });
});
