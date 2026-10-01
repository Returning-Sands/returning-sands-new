import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";

import CampaignPage, { metadata } from "@/app/campaign/page";
import { events } from "@/content/events";
import { site } from "@/content/site";
import { BUILD_DATE } from "@/lib/buildInfo";
import { orderCampaignList, resolveEvents } from "@/lib/events";

// Impact Campaign overview page (Req 6). The first block renders against the
// real Content_File (overview Placeholder pending, real BUILD_DATE); the
// second swaps in a build date after every Event via `vi.doMock` so each
// compact Boarding_Pass carries the PAST overprint (Req 6.8, 7.9).

afterEach(cleanup);

/** The compact list's <li>s, in DOM order. */
function listItems(container: HTMLElement): HTMLElement[] {
  const ol = container.querySelector("ol");
  if (!ol) throw new Error("no <ol> compact list");
  return Array.from(ol.querySelectorAll(":scope > li")) as HTMLElement[];
}

describe("/campaign with the real content", () => {
  it("exports page metadata for the campaign route (Req 6.1, 16.1)", () => {
    expect(metadata.title).toBe(site.pages.campaign.title);
    expect(metadata.alternates?.canonical).toBe("https://returningsands.org/campaign");
  });

  it("renders the Pending overview marker as the first block after the h1 (Req 6.2, 6.3)", () => {
    render(<CampaignPage />);
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1).toHaveTextContent("Impact Campaign");

    const note = screen.getByRole("note");
    expect(note.textContent?.toLowerCase()).toContain("placeholder");

    // The overview section directly follows the h1 and the note is its first element.
    const overview = h1.nextElementSibling as HTMLElement;
    expect(overview.tagName).toBe("SECTION");
    expect(overview.firstElementChild).toBe(note);
  });

  it("shows exactly three city cards in the order Cairo, London, New York (Req 6.4)", () => {
    render(<CampaignPage />);
    const h3s = screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent);
    expect(h3s).toEqual(["Cairo", "London", "New York"]);

    for (const city of ["cairo", "london", "nyc"] as const) {
      const link = screen.getByRole("link", { name: `See ${events.cities[city].name} events` });
      expect(link).toHaveAttribute("href", `/campaign/${city}`);
    }
  });

  it("lists all seven Events as compact passes in orderCampaignList order with deep links (Req 6.6, 6.7)", () => {
    const { container } = render(<CampaignPage />);
    const items = listItems(container);
    expect(items).toHaveLength(7);
    expect(events.events).toHaveLength(7);

    const expected = orderCampaignList(resolveEvents(events.events, BUILD_DATE));
    const hrefs = items.map((li) => li.querySelector("a")?.getAttribute("href"));
    expect(hrefs).toEqual(expected.map((e) => `/campaign/${e.city}#${e.id}`));

    // Each pass carries stampLabel, title and city name (Req 6.6).
    expected.forEach((e, i) => {
      const li = items[i];
      expect(within(li).getByText(e.stampLabel)).toBeInTheDocument();
      expect(within(li).getByText(`${e.title} · ${events.cities[e.city].name}`)).toBeInTheDocument();
    });
  });

  it("shows Date TBA for the undated New York showcase (Req 6.6, 7.7)", () => {
    const { container } = render(<CampaignPage />);
    const li = listItems(container).find(
      (el) => el.querySelector("a")?.getAttribute("href") === "/campaign/nyc#nyc-exclusive-showcase",
    );
    expect(li).toBeDefined();
    expect(within(li as HTMLElement).getByText("Date TBA")).toBeInTheDocument();
  });

  it("links to the Virtual Museum and to Donate with the content copy (Req 6.9, 6.10, 12.10)", () => {
    render(<CampaignPage />);
    expect(screen.getByText(site.campaign.museumTeaser)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Reserve a museum ticket" })).toHaveAttribute("href", "/museum");
    expect(screen.getByText(site.campaign.donateLine)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Donate" })).toHaveAttribute("href", "/donate");
  });
});

describe("/campaign built after every Event has ended", () => {
  let Page: typeof CampaignPage;

  beforeEach(async () => {
    vi.resetModules();
    vi.doMock("@/lib/buildInfo", () => ({ BUILD_DATE: "2027-03-01" }));
    Page = (await import("@/app/campaign/page")).default;
  });

  afterEach(() => {
    vi.doUnmock("@/lib/buildInfo");
    vi.resetModules();
  });

  it("keeps all seven passes in the list and overprints every dated one with PAST (Req 6.8)", () => {
    const { container } = render(<Page />);
    const items = listItems(container);
    expect(items).toHaveLength(7);

    // The six dated Events are past; the TBA showcase has no end date and so
    // stays upcoming (Req 7.9) — it is kept in the list without an overprint.
    const expected = orderCampaignList(resolveEvents(events.events, "2027-03-01"));
    expect(expected.filter((e) => e.status === "past")).toHaveLength(6);
    expected.forEach((e, i) => {
      const past = within(items[i]).queryByText("PAST");
      if (e.status === "past") expect(past).toBeInTheDocument();
      else expect(past).toBeNull();
    });
  });
});
