import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";

import TeamPage, { metadata } from "@/app/team/page";
import { team } from "@/content/team";
import { site } from "@/content/site";
import { groupMembers, sortMembers } from "@/lib/team";
import type { TeamGroup, TeamMember } from "@/lib/types";

// Vitest runs without `globals: true`, so RTL cannot register its own
// afterEach cleanup; unmount explicitly or renders accumulate across tests.
afterEach(cleanup);

const member = (name: string, order: number, group: TeamGroup = "Core Team"): TeamMember => ({
  name,
  role: "Role",
  group,
  order,
});

// ---------------------------------------------------------------------------
// lib/team.ts (Req 10.8, 10.9)
// ---------------------------------------------------------------------------
describe("sortMembers", () => {
  it("sorts by order ascending and breaks ties by name A–Z (10.8)", () => {
    const input = [member("Zed", 2), member("Bea", 1), member("Amy", 2), member("Cal", 1)];
    const out = sortMembers(input);
    expect(out.map((m) => m.name)).toEqual(["Bea", "Cal", "Amy", "Zed"]);
    // Pure: input untouched.
    expect(input.map((m) => m.name)).toEqual(["Zed", "Bea", "Amy", "Cal"]);
  });

  it("returns an empty array for no members", () => {
    expect(sortMembers([])).toEqual([]);
  });
});

describe("groupMembers", () => {
  it("preserves the given group order and omits groups with zero members (10.9)", () => {
    const members = [
      member("Core Two", 5, "Core Team"),
      member("Producer", 1, "Producers & Co-Founders"),
      member("Core One", 4, "Core Team"),
    ];
    const grouped = groupMembers(members, team.groups);
    expect(grouped.map((g) => g.group)).toEqual(["Producers & Co-Founders", "Core Team"]);
    expect(grouped[1].members.map((m) => m.name)).toEqual(["Core One", "Core Two"]);
  });

  it("returns no groups when there are no members", () => {
    expect(groupMembers([], team.groups)).toEqual([]);
  });

  it("groups the real content into three groups of 3 / 2 / 5", () => {
    const grouped = groupMembers(team.members, team.groups);
    expect(grouped.map((g) => g.group)).toEqual(team.groups);
    expect(grouped.map((g) => g.members.length)).toEqual([3, 2, 5]);
  });
});

// ---------------------------------------------------------------------------
// app/team/page.tsx (Req 10.1, 10.2, 10.6, 10.7)
// ---------------------------------------------------------------------------
describe("Team page (Req 10)", () => {
  it("exports the Team metadata for /team", () => {
    expect(metadata.title).toBe(site.pages.team.title);
    expect(metadata.alternates?.canonical).toBe("https://returningsands.org/team");
  });

  it("has a single h1 'Team' and three Mono_Font h2s in team.groups order (10.1)", () => {
    render(<TeamPage />);
    const h1s = screen.getAllByRole("heading", { level: 1 });
    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toHaveTextContent("Team");

    const h2s = screen.getAllByRole("heading", { level: 2 });
    expect(h2s.map((h) => h.textContent)).toEqual(team.groups);
    for (const h2 of h2s) {
      expect(h2.className).toContain("font-mono");
      // Each heading labels its own section.
      const section = h2.closest("section");
      expect(section?.getAttribute("aria-labelledby")).toBe(h2.id);
    }
  });

  it("renders ten Passport_Cards, each with the Silhouette since no photos exist (10.2, 10.4)", () => {
    const { container } = render(<TeamPage />);
    const silhouettes = screen.getAllByRole("img", { name: "Portrait coming soon" });
    expect(silhouettes).toHaveLength(10);
    // The alternative text lives on aria-label (10.4): exactly ten occurrences.
    expect(container.querySelectorAll('[aria-label="Portrait coming soon"]')).toHaveLength(10);
    // No photo is set yet, so no <img> describes a member by name.
    expect(container.querySelectorAll("img")).toHaveLength(0);
    for (const m of team.members) {
      expect(screen.getByRole("heading", { level: 3, name: m.name })).toBeInTheDocument();
    }
  });

  it("uses a 1 / 2 / 4 column grid per group with one card per list item (10.7)", () => {
    render(<TeamPage />);
    const lists = screen.getAllByRole("list");
    expect(lists).toHaveLength(team.groups.length);
    let cards = 0;
    for (const ul of lists) {
      expect(ul.tagName).toBe("UL");
      for (const cls of ["grid", "grid-cols-1", "sm:grid-cols-2", "lg:grid-cols-4"]) {
        expect(ul.classList.contains(cls)).toBe(true);
      }
      const items = within(ul).getAllByRole("listitem");
      for (const li of items) {
        expect(li.querySelectorAll("article")).toHaveLength(1);
      }
      cards += items.length;
    }
    expect(cards).toBe(10);
  });

  it("renders bios only for the four members who have one (10.2)", () => {
    const { container } = render(<TeamPage />);
    const withBio = team.members.filter((m) => typeof m.bio === "string" && m.bio.trim() !== "");
    expect(withBio).toHaveLength(4);
    expect(withBio.map((m) => m.name).sort()).toEqual(
      ["Basma Khalifa", "Camilla Marchese González", "Paris Quetzal Sistilli", "Yusef Bushara"].sort(),
    );

    const bios = new Set(withBio.map((m) => m.bio as string));
    const bioParagraphs = Array.from(container.querySelectorAll("p")).filter((p) =>
      bios.has(p.textContent ?? ""),
    );
    expect(bioParagraphs).toHaveLength(4);
    for (const bio of bios) expect(screen.getByText(bio)).toBeInTheDocument();
  });
});
