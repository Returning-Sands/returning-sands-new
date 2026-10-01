import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";

import AboutPage, { metadata } from "@/app/about/page";
import { site } from "@/content/site";

// Vitest runs without `globals: true`, so RTL cannot register its own
// afterEach cleanup; unmount explicitly or renders accumulate across tests.
afterEach(cleanup);

describe("About page (Req 3)", () => {
  it("exports the About metadata for /about", () => {
    expect(metadata.title).toBe(site.pages.about.title);
    expect(metadata.alternates?.canonical).toBe("https://returningsands.org/about");
  });

  it("has a single h1 and the three section headings in order (3.1)", () => {
    render(<AboutPage />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    const h2s = screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent);
    expect(h2s).toEqual(["About us", "Mission", "Goals"]);
  });

  it("renders the About us and Mission copy verbatim from content/site.ts (3.2, 3.3)", () => {
    render(<AboutPage />);
    for (const paragraph of [...site.about.aboutUs, ...site.about.mission]) {
      expect(screen.getByText(paragraph)).toBeInTheDocument();
    }
    // Arabic name survives as script, not substituted characters.
    expect(screen.getByText(/عودة الرمال/)).toBeInTheDocument();
    const mission = site.about.mission.join(" ");
    expect(mission.split("written, painted, produced")).toHaveLength(2);
    expect(mission).not.toContain("painted, painted");
    expect(screen.getByText(/written, painted, produced/)).toBeInTheDocument();
  });

  it("renders the five goals as an ordered list with 01–05 numerals (3.4, 3.5)", () => {
    render(<AboutPage />);
    const list = screen.getByRole("list");
    expect(list.tagName).toBe("OL");
    const items = within(list).getAllByRole("listitem");
    expect(items).toHaveLength(5);
    items.forEach((li, i) => {
      const numeral = li.querySelector("span[aria-hidden]");
      expect(numeral?.textContent).toBe(String(i + 1).padStart(2, "0"));
      expect(numeral?.className).toContain("font-mono");
      expect(li.textContent).toContain(site.about.goals[i]);
    });
  });

  it("closes with exactly one link to /team and one to /donate (3.6, 12.10)", () => {
    render(<AboutPage />);
    const links = screen.getAllByRole("link");
    const toTeam = links.filter((a) => a.getAttribute("href") === "/team");
    const toDonate = links.filter((a) => a.getAttribute("href") === "/donate");
    expect(toTeam).toHaveLength(1);
    expect(toDonate).toHaveLength(1);
    expect(toTeam[0]).toHaveTextContent("Meet the team");
    expect(toDonate[0]).toHaveTextContent("Support the mission");
  });
});
