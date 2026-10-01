import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";

import SupportPage, { metadata } from "@/app/support/page";
import { PARTNER_LOGO_SIZES, PartnerTile, showsLogo } from "@/components/support/PartnerTile";
import { partners } from "@/content/partners";
import { site } from "@/content/site";
import { generalMailto, mailtoFor } from "@/lib/contacts";
import type { Contact, ContactKey, Partner } from "@/lib/types";

// Vitest runs without `globals: true`, so RTL cannot register its own
// afterEach cleanup; unmount explicitly or renders accumulate across tests.
afterEach(cleanup);

const EMAILS: Record<ContactKey, string> = {
  general: "info@example.org",
  yusef: "yusef@example.org",
  paris: "paris@example.org",
  camilla: "camilla@example.org",
  cillian: "cillian@example.org",
};

const contact = (key: ContactKey, confirmed: boolean): Contact => ({
  key,
  name: "Name",
  role: "Role",
  confirmed,
});

const LOGO = { src: "/img/meroe.jpg", alt: "ignored", width: 200, height: 100 };

// ---------------------------------------------------------------------------
// lib/contacts.ts (Req 11.1, 11.3, 11.10)
// ---------------------------------------------------------------------------
describe("mailtoFor / generalMailto", () => {
  it("routes a confirmed contact to its own address (11.3)", () => {
    expect(mailtoFor(contact("yusef", true), EMAILS)).toBe("mailto:yusef@example.org");
    expect(mailtoFor(contact("cillian", true), EMAILS)).toBe("mailto:cillian@example.org");
  });

  it("routes an unconfirmed contact to the general address (11.10)", () => {
    expect(mailtoFor(contact("yusef", false), EMAILS)).toBe("mailto:info@example.org");
    expect(mailtoFor(contact("paris", false), EMAILS)).toBe("mailto:info@example.org");
  });

  it("builds the general mailto from the general key (11.1)", () => {
    expect(generalMailto(EMAILS)).toBe("mailto:info@example.org");
  });
});

// ---------------------------------------------------------------------------
// components/support/PartnerTile.tsx (Req 11.7, 11.8, 11.9)
// ---------------------------------------------------------------------------
describe("PartnerTile", () => {
  it("renders a typographic tile with no <img> when the logo is missing (11.7)", () => {
    const { container } = render(<PartnerTile partner={{ name: "SIMA", permission: "granted" }} />);
    expect(container.querySelectorAll("img")).toHaveLength(0);
    const tile = screen.getByText("SIMA");
    expect(tile.className).toContain("font-mono");
    expect(tile.className).toContain("border-dashed");
    expect(container.querySelectorAll("a")).toHaveLength(0);
  });

  it("renders a typographic tile with no <img> when permission is pending even with a logo (11.7)", () => {
    const partner: Partner = { name: "Ruby Cruel", logo: LOGO, permission: "pending" };
    expect(showsLogo(partner)).toBe(false);
    const { container } = render(<PartnerTile partner={partner} />);
    expect(container.querySelectorAll("img")).toHaveLength(0);
    expect(screen.getByText("Ruby Cruel")).toBeInTheDocument();
  });

  it("renders the logo with alt = name when permission is granted or not-required (11.8)", () => {
    for (const permission of ["granted", "not-required"] as const) {
      const partner: Partner = { name: "Sundance Institute", logo: LOGO, permission };
      expect(showsLogo(partner)).toBe(true);
      const { container, unmount } = render(<PartnerTile partner={partner} />);
      const imgs = container.querySelectorAll("img");
      expect(imgs).toHaveLength(1);
      expect(imgs[0]).toHaveAttribute("alt", "Sundance Institute");
      expect(imgs[0]).toHaveAttribute("sizes", PARTNER_LOGO_SIZES);
      expect(imgs[0].className).toContain("object-contain");
      unmount();
    }
  });

  it("wraps the whole tile in exactly one anchor when href is set (11.9)", () => {
    const { container } = render(
      <PartnerTile partner={{ name: "British Council", href: "/campaign", permission: "pending" }} />,
    );
    const anchors = container.querySelectorAll("a");
    expect(anchors).toHaveLength(1);
    expect(anchors[0]).toHaveAttribute("href", "/campaign");
    expect(anchors[0]).toContainElement(screen.getByText("British Council"));
  });

  it("wraps an external href in one new-tab anchor (11.9, 1.10)", () => {
    const { container } = render(
      <PartnerTile
        partner={{ name: "SIMA", href: "https://www.simastudios.org", permission: "pending" }}
      />,
    );
    const anchors = container.querySelectorAll("a");
    expect(anchors).toHaveLength(1);
    expect(anchors[0]).toHaveAttribute("target", "_blank");
    expect(anchors[0]).toContainElement(screen.getByText("SIMA"));
  });
});

// ---------------------------------------------------------------------------
// app/support/page.tsx (Req 11.1, 11.2, 11.4, 11.5, 11.10, 11.11, 11.12, 12.10)
// ---------------------------------------------------------------------------
describe("Support page (Req 11)", () => {
  it("exports the support metadata for /support", () => {
    expect(metadata.title).toBe(site.pages.support.title);
    expect(metadata.alternates?.canonical).toBe("https://returningsands.org/support");
  });

  it("has a single h1 'Support & Contact'", () => {
    render(<SupportPage />);
    const h1s = screen.getAllByRole("heading", { level: 1 });
    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toHaveTextContent("Support & Contact");
  });

  it("puts Get in Touch then Support Us as the first interactive elements (11.1, 12.10)", () => {
    const { container } = render(<SupportPage />);
    const article = container.querySelector("article")!;
    const interactive = Array.from(
      article.querySelectorAll<HTMLElement>("a, button, input, select, textarea, [tabindex]"),
    );
    expect(interactive.length).toBeGreaterThanOrEqual(2);

    const [first, second] = interactive;
    expect(first.tagName).toBe("A");
    expect(first).toHaveTextContent("Get in Touch");
    expect(first).toHaveAttribute("href", `mailto:${site.pending.contactEmails.general}`);
    expect(first).toHaveAttribute("href", "mailto:info@returningsands.org");

    expect(second.tagName).toBe("A");
    expect(second).toHaveTextContent("Support Us");
    expect(second).toHaveAttribute("href", "/donate");

    // Only the h1 sits above the CTA row: the h1 precedes the first CTA and
    // the CTA row is the h1's immediate next sibling.
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1.compareDocumentPosition(first) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(h1.nextElementSibling).toContainElement(first);
    expect(h1.nextElementSibling).toContainElement(second);
  });

  it("lists every contact in content order as one mailto each, with name and role (11.2, 11.10)", () => {
    render(<SupportPage />);
    const emails = site.pending.contactEmails;
    const contacts = site.support.contacts;
    expect(contacts).toHaveLength(5);
    expect(contacts.map((c) => c.key)).toEqual(["general", "yusef", "paris", "camilla", "cillian"]);

    const section = screen.getByRole("heading", { level: 2, name: "Contact" }).closest("section")!;
    const items = within(section).getAllByRole("listitem");
    expect(items).toHaveLength(contacts.length);

    items.forEach((li, i) => {
      const c = contacts[i];
      const anchors = li.querySelectorAll("a");
      expect(anchors).toHaveLength(1);
      expect(anchors[0]).toHaveAttribute("href", mailtoFor(c, emails));
      expect(anchors[0].textContent).toContain(c.name);
      expect(anchors[0].textContent).toContain(c.role);
    });

    // In the current content every named contact is unconfirmed, so all five
    // mailto: targets (general included) point at the general inbox.
    const hrefs = Array.from(section.querySelectorAll("a")).map((a) => a.getAttribute("href"));
    expect(hrefs).toHaveLength(5);
    expect(new Set(hrefs)).toEqual(new Set(["mailto:info@returningsands.org"]));
  });

  it("shows Instagram and LinkedIn as new-tab links with an icon and visible text (11.4)", () => {
    render(<SupportPage />);
    const section = screen.getByRole("heading", { level: 2, name: "Follow" }).closest("section")!;

    const checks: [string, string][] = [
      ["Instagram", site.social.instagram],
      ["LinkedIn", site.social.linkedin],
    ];
    for (const [label, href] of checks) {
      const link = within(section).getByRole("link", { name: new RegExp(`^${label}`) });
      expect(link).toHaveAttribute("href", href);
      expect(link).toHaveAttribute("target", "_blank");
      expect(link.getAttribute("rel")).toContain("noopener");
      // Visible text label (not only an aria-label) plus a decorative icon.
      expect(link.textContent).toContain(label);
      expect(link).not.toHaveAttribute("aria-label");
      const icons = link.querySelectorAll('svg[aria-hidden="true"]');
      expect(icons.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("renders the Partners & Supporters heading and 13 typographic tiles in file order (11.5, 11.7, 11.11)", () => {
    const { container } = render(<SupportPage />);
    expect(partners.partners).toHaveLength(13);

    const h2 = screen.getByRole("heading", { level: 2, name: partners.heading });
    expect(h2).toHaveTextContent("Partners & Supporters");
    const section = h2.closest("section")!;
    const ul = within(section).getByRole("list");
    for (const cls of ["grid", "grid-cols-2", "gap-4", "md:grid-cols-4"]) {
      expect(ul.classList.contains(cls)).toBe(true);
    }

    const items = within(ul).getAllByRole("listitem");
    expect(items).toHaveLength(13);
    expect(items.map((li) => li.textContent)).toEqual(partners.partners.map((p) => p.name));

    // Permission is pending everywhere, so no logo image renders anywhere on the page.
    expect(container.querySelectorAll("img")).toHaveLength(0);
    for (const li of items) {
      const tile = li.firstElementChild!;
      expect(tile.className).toContain("h-24");
      expect(tile.className).toContain("font-mono");
      expect(tile.className).toContain("border-dashed");
      // No partner has an href yet, so no tile is a link.
      expect(li.querySelectorAll("a")).toHaveLength(0);
    }
  });

  it("omits the Partners & Supporters heading and grid when the list is empty (11.12)", async () => {
    vi.resetModules();
    vi.doMock("@/content/partners", () => ({
      partners: { heading: "Partners & Supporters", partners: [], pending: {} },
    }));
    try {
      const { default: Page } = await import("@/app/support/page");
      render(<Page />);
      expect(screen.queryByRole("heading", { name: "Partners & Supporters" })).toBeNull();
      expect(screen.queryByText("Partners & Supporters")).toBeNull();
      // The other two sections are unaffected.
      expect(screen.getByRole("heading", { level: 2, name: "Contact" })).toBeInTheDocument();
      expect(screen.getByRole("heading", { level: 2, name: "Follow" })).toBeInTheDocument();
      expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(2);
    } finally {
      vi.doUnmock("@/content/partners");
      vi.resetModules();
    }
  });
});
