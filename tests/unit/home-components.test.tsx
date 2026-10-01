import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

import { PassportHero } from "@/components/home/PassportHero";
import { CityStamp } from "@/components/home/CityStamp";
import { CityList } from "@/components/home/CityList";
import { HashRedirect } from "@/components/home/HashRedirect";
import { events } from "@/content/events";

// HashRedirect calls `useRouter().replace`; stub the router so each test can
// observe whether, and with what, it was called.
const { replaceMock } = vi.hoisted(() => ({ replaceMock: vi.fn<(href: string) => void>() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: replaceMock }) }));

beforeEach(() => {
  replaceMock.mockReset();
});

// Vitest runs without `globals: true`, so RTL cannot register its own
// afterEach cleanup; unmount explicitly or renders accumulate across tests.
afterEach(cleanup);

const CITY_NAMES = {
  london: events.cities.london.name,
  cairo: events.cities.cairo.name,
  nyc: events.cities.nyc.name,
};

describe("PassportHero (Req 2.3, 2.4, 2.5, 2.6, 2.8, 2.11)", () => {
  it("renders three City_Stamp anchors to London, Cairo, NYC in that order with the city in the name", () => {
    const { container } = render(<PassportHero />);
    const anchors = Array.from(container.querySelectorAll("a"));
    expect(anchors.map((a) => a.getAttribute("href"))).toEqual([
      "/campaign/london",
      "/campaign/cairo",
      "/campaign/nyc",
    ]);
    expect(screen.getByRole("link", { name: new RegExp(CITY_NAMES.london) })).toHaveAttribute(
      "href",
      "/campaign/london",
    );
    expect(screen.getByRole("link", { name: new RegExp(CITY_NAMES.cairo) })).toHaveAttribute(
      "href",
      "/campaign/cairo",
    );
    expect(screen.getByRole("link", { name: new RegExp(CITY_NAMES.nyc) })).toHaveAttribute(
      "href",
      "/campaign/nyc",
    );
  });

  it("shows the Returning Sands stamp on the left page", () => {
    render(<PassportHero />);
    expect(screen.getByText("RETURNING SANDS")).toBeInTheDocument();
    expect(screen.getByText("a documentary and impact campaign")).toBeInTheDocument();
  });

  it("gives every City_Stamp the tap size, token border, hover and focus classes", () => {
    const { container } = render(<PassportHero />);
    for (const a of Array.from(container.querySelectorAll("a"))) {
      expect(a.className).toContain("min-w-[44px]");
      expect(a.className).toContain("min-h-[44px]");
      expect(a.className).toContain("border-2");
      expect(a.className).toContain("border-stamp-600");
      expect(a.className).toContain("hover:border-stamp-700");
      expect(a.className).toContain("transition-colors");
      expect(a.className).toContain("duration-150");
      expect(a.className).toContain("focus-visible:outline-2");
      expect(a.className).toContain("focus-visible:outline-offset-2");
      expect(a.className).toContain("focus-visible:outline-nile-800");
      expect(a.className).toMatch(/-?rotate-\d/);
      // Stand_In mode (the default content flags): no background image.
      expect((a as HTMLElement).style.backgroundImage).toBe("");
    }
  });
});

describe("CityStamp", () => {
  it("renders the city name as the only link text", () => {
    render(<CityStamp city="cairo" name="Cairo" href="/campaign/cairo" />);
    const link = screen.getByRole("link", { name: "Cairo" });
    expect(link).toHaveAttribute("href", "/campaign/cairo");
    expect(link.textContent).toBe("Cairo");
  });
});

describe("CityList (Req 2.7)", () => {
  it("lists exactly London, Cairo, NYC with earliest dates from the real content and links to each City_Page", () => {
    render(<CityList />);
    const nav = screen.getByRole("navigation", { name: "Cities" });
    const items = Array.from(nav.querySelectorAll("li"));
    expect(items).toHaveLength(3);

    const expected: Array<[string, string, string]> = [
      [CITY_NAMES.london, "January 2027, day TBA", "/campaign/london"],
      [CITY_NAMES.cairo, "16 December 2026", "/campaign/cairo"],
      [CITY_NAMES.nyc, "22 November 2026", "/campaign/nyc"],
    ];
    items.forEach((li, i) => {
      const [name, date, href] = expected[i];
      expect(li.textContent).toContain(name);
      expect(li.textContent).toContain(date);
      const a = li.querySelector("a");
      expect(a).toHaveAttribute("href", href);
      expect(a?.textContent).toContain(name);
    });
  });
});

describe("HashRedirect (Req 21.10, 21.11)", () => {
  it("replaces the route with /donate when the hash is #donate", () => {
    window.history.replaceState(null, "", "/#donate");
    const { container } = render(<HashRedirect />);
    expect(container.innerHTML).toBe("");
    expect(replaceMock).toHaveBeenCalledTimes(1);
    expect(replaceMock).toHaveBeenCalledWith("/donate");
  });

  it("does nothing for an unknown hash", () => {
    window.history.replaceState(null, "", "/#nope");
    render(<HashRedirect />);
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("does nothing when there is no hash", () => {
    window.history.replaceState(null, "", "/");
    render(<HashRedirect />);
    expect(replaceMock).not.toHaveBeenCalled();
  });
});
