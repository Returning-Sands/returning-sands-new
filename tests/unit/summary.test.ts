import { describe, expect, it } from "vitest";
import {
  NO_PLACEHOLDERS_LINE,
  PARTIAL_SUFFIX,
  summarizePending,
} from "@/lib/summary";
import { site } from "@/content/site";
import { events } from "@/content/events";
import { team } from "@/content/team";
import { partners } from "@/content/partners";
import { donate } from "@/content/donate";
import { film } from "@/content/film";
import { museum } from "@/content/museum";

describe("summarizePending", () => {
  it("returns exactly the single no-placeholders line when everything is present", () => {
    const out = summarizePending({
      site: {
        campaignOverview: "Copy.",
        emailProvider: { name: "Buttondown", action: "https://x.test/f" },
        contactEmails: { general: "info@returningsands.org" },
      },
      film: { trailerUrl: "https://youtu.be/abc" },
      team: {},
    });
    expect(out).toEqual([NO_PLACEHOLDERS_LINE]);
  });

  it("returns an empty-group summary as the no-placeholders line", () => {
    expect(summarizePending({})).toEqual([NO_PLACEHOLDERS_LINE]);
  });

  it("lists pending keys in input order with a matching header count", () => {
    const out = summarizePending({
      film: { logline: "", aboutFilm: "About.", trailerUrl: "   " },
      donate: { stripePaymentLink: "", bankDetails: null },
      events: { exclusiveShowcaseDate: "2026-11-20", cultureHouseDay: undefined },
    });
    expect(out).toEqual([
      "Outstanding Placeholders (5):",
      "  content/film.ts   pending.logline",
      "  content/film.ts   pending.trailerUrl",
      "  content/donate.ts   pending.stripePaymentLink",
      "  content/donate.ts   pending.bankDetails",
      "  content/events.ts   pending.cultureHouseDay",
    ]);
  });

  it("marks a partially filled group as treated-as-empty", () => {
    const out = summarizePending({
      donate: {
        bankDetails: { accountName: "Returning Sands CIC", sortCode: "", accountNumber: "" },
      },
      site: {
        companyRegistration: { number: "12345678", registeredOffice: "1 Street", icoNumber: "ICO1" },
      },
    });
    expect(out).toEqual([
      "Outstanding Placeholders (1):",
      `  content/donate.ts   pending.bankDetails   ${PARTIAL_SUFFIX}`,
    ]);
    expect(out[1]).toContain("partially filled — treated as empty");
  });

  it("reports contactEmails field by field rather than as a group", () => {
    const out = summarizePending({
      site: {
        contactEmails: { general: "info@returningsands.org", yusef: "", paris: null },
      },
    });
    expect(out).toEqual([
      "Outstanding Placeholders (2):",
      "  content/site.ts   pending.contactEmails.yusef",
      "  content/site.ts   pending.contactEmails.paris",
    ]);
  });

  it("lists the known outstanding Placeholders of the real content", () => {
    const out = summarizePending({
      site: site.pending,
      events: events.pending,
      team: team.pending,
      partners: partners.pending,
      donate: donate.pending,
      film: film.pending,
      museum: museum.pending,
    });
    expect(out[0]).toMatch(/^Outstanding Placeholders \(\d+\):$/);
    expect(out).toContain("  content/donate.ts   pending.stripePaymentLink");
    expect(out).toContain("  content/film.ts   pending.trailerUrl");
    expect(out).toContain("  content/site.ts   pending.emailProvider");
    // Header count matches the number of item lines.
    const n = Number(/\((\d+)\)/.exec(out[0])?.[1]);
    expect(out.length).toBe(n + 1);
  });
});
