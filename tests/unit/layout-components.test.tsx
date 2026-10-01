import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import { ExternalLink } from "@/components/layout/ExternalLink";
import { Footer } from "@/components/layout/Footer";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { SkipLink } from "@/components/layout/SkipLink";
import { SmartLink } from "@/components/layout/SmartLink";
import { TopNav } from "@/components/layout/TopNav";
import { Pending } from "@/components/content/Pending";
import { JsonLd } from "@/components/seo/JsonLd";
import { site } from "@/content/site";

// TopNav reads the live pathname through next/navigation; swap it for a
// controllable stub so each test can pick the route it renders for.
const { pathnameMock } = vi.hoisted(() => ({ pathnameMock: vi.fn<() => string>(() => "/") }));
vi.mock("next/navigation", () => ({ usePathname: () => pathnameMock() }));

beforeEach(() => {
  pathnameMock.mockReturnValue("/");
});

// Vitest runs without `globals: true`, so RTL cannot register its own
// afterEach cleanup; unmount explicitly or renders accumulate across tests.
afterEach(cleanup);

describe("SkipLink (Req 15.4)", () => {
  it("links to #main and is screen-reader-only until focused", () => {
    render(<SkipLink />);
    const link = screen.getByRole("link", { name: "Skip to content" });
    expect(link).toHaveAttribute("href", "#main");
    expect(link.className).toContain("sr-only");
    expect(link.className).toContain("focus:not-sr-only");
  });
});

describe("Footer legal block (Req 17.1, 17.2, 17.3, 17.8, 1.8)", () => {
  it("renders the fallback line when the registration Placeholder is pending (default)", () => {
    const { container } = render(<Footer />);
    expect(screen.getByText("Returning Sands CIC · Company details to follow")).toBeInTheDocument();
    expect(container.textContent).not.toContain("Company no.");
    expect(container.textContent).toContain(`© ${new Date().getUTCFullYear()} Returning Sands CIC`);
  });

  it("renders all three fields when a full registration is supplied", () => {
    render(
      <Footer
        companyRegistration={{
          name: "Returning Sands CIC",
          number: "12345678",
          address: "1 Example Street, London",
        }}
      />,
    );
    expect(
      screen.getByText("Returning Sands CIC · Company no. 12345678 · 1 Example Street, London"),
    ).toBeInTheDocument();
    expect(screen.queryByText("Returning Sands CIC · Company details to follow")).toBeNull();
  });

  it("treats a partially filled registration as pending and leaks no field", () => {
    const { container } = render(
      <Footer companyRegistration={{ name: "Returning Sands CIC", number: "", address: "" }} />,
    );
    expect(screen.getByText("Returning Sands CIC · Company details to follow")).toBeInTheDocument();
    expect(container.textContent).not.toContain("Company no.");
  });

  it("has a Footer nav linking every Page, /museum and Privacy, plus social icon links", () => {
    render(<Footer />);
    const nav = screen.getByRole("navigation", { name: "Footer" });
    const hrefs = Array.from(nav.querySelectorAll("a")).map((a) => a.getAttribute("href"));
    expect(hrefs).toEqual([
      "/",
      "/about",
      "/at-stake",
      "/film",
      "/campaign",
      "/campaign/cairo",
      "/campaign/london",
      "/campaign/nyc",
      "/museum",
      "/team",
      "/support",
      "/donate",
      "/privacy",
    ]);
    expect(screen.getByRole("link", { name: "Privacy" })).toHaveAttribute("href", "/privacy");

    const ig = screen.getByRole("link", { name: "Instagram (opens in new tab)" });
    expect(ig).toHaveAttribute("href", site.social.instagram);
    expect(ig).toHaveAttribute("target", "_blank");
    const li = screen.getByRole("link", { name: "LinkedIn (opens in new tab)" });
    expect(li).toHaveAttribute("href", site.social.linkedin);
    expect(li).toHaveAttribute("rel", "noopener noreferrer");
    for (const svg of Array.from(ig.querySelectorAll("svg"))) {
      expect(svg).toHaveAttribute("aria-hidden", "true");
    }
  });
});

describe("ExternalLink (Req 1.10)", () => {
  it("opens in a new tab with the safe rel, an aria-hidden arrow and sr-only text", () => {
    render(<ExternalLink href="https://paypal.com/donate">Donate in USD</ExternalLink>);
    // dom-accessibility-api collapses the leading space of the sr-only span,
    // so accept the name with or without it.
    const link = screen.getByRole("link", { name: /^Donate in USD ?\(opens in new tab\)$/ });
    expect(link).toHaveAttribute("href", "https://paypal.com/donate");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    const svg = link.querySelector("svg");
    expect(svg).toHaveAttribute("aria-hidden", "true");
    const sr = link.querySelector("span.sr-only");
    expect(sr?.textContent).toBe(" (opens in new tab)");
  });

  it("passes className and aria-label through", () => {
    render(
      <ExternalLink href="https://example.org" className="icon" aria-label="Example (opens in new tab)">
        x
      </ExternalLink>,
    );
    const link = screen.getByRole("link", { name: "Example (opens in new tab)" });
    expect(link.className).toBe("icon");
  });
});

describe("SmartLink (Req 1.10)", () => {
  it("renders an internal path as a plain same-tab link", () => {
    render(<SmartLink href="/about">About</SmartLink>);
    const link = screen.getByRole("link", { name: "About" });
    expect(link).toHaveAttribute("href", "/about");
    expect(link).not.toHaveAttribute("target");
    expect(link.querySelector("svg")).toBeNull();
  });

  it("renders mailto: as a plain anchor without the new-tab affordance", () => {
    render(<SmartLink href="mailto:x@y">Email</SmartLink>);
    const link = screen.getByRole("link", { name: "Email" });
    expect(link).toHaveAttribute("href", "mailto:x@y");
    expect(link).not.toHaveAttribute("target");
    expect(link.querySelector(".sr-only")).toBeNull();
  });

  it("renders an external host through ExternalLink", () => {
    render(<SmartLink href="https://paypal.com">PayPal</SmartLink>);
    const link = screen.getByRole("link", { name: /^PayPal ?\(opens in new tab\)$/ });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });
});

describe("TopNav current-page marking (Req 1.2, 1.3, 1.5)", () => {
  function currentLinks(container: HTMLElement) {
    return Array.from(container.querySelectorAll('[aria-current="page"]'));
  }

  it("renders the Primary nav with Home, the seven links in order and a single filled Donate_CTA", () => {
    const { container } = render(<TopNav />);
    const nav = screen.getByRole("navigation", { name: "Primary" });
    expect(nav).toBeInTheDocument();
    const anchors = Array.from(nav.querySelectorAll("a"));
    expect(anchors.map((a) => a.getAttribute("href"))).toEqual([
      "/",
      "/about",
      "/at-stake",
      "/campaign",
      "/film",
      "/team",
      "/support",
      "/donate",
    ]);
    expect(anchors[0].textContent).toBe(site.name);
    const donate = anchors[anchors.length - 1];
    expect(donate.className).toContain("bg-ochre-500");
    expect(donate.className).toContain("text-sand-50");
    expect(donate.className).toContain("border-ink");
    expect(donate.className).toContain("hover:bg-ochre-600");
    for (const a of anchors.slice(0, -1)) {
      expect(a.className).not.toMatch(/\bbg-ochre|\bborder-ink/);
    }
    expect(container.querySelector("ul.nav-inline")?.className).toContain("hidden md:flex");
    expect(screen.getByRole("button", { name: "Menu" })).toBeInTheDocument();
  });

  it("marks exactly About on /about", () => {
    pathnameMock.mockReturnValue("/about");
    const { container } = render(<TopNav />);
    const marked = currentLinks(container);
    expect(marked).toHaveLength(1);
    expect(marked[0]).toHaveAttribute("href", "/about");
    expect(marked[0].className).toContain("underline");
  });

  it("marks exactly Impact Campaign on /campaign/cairo", () => {
    pathnameMock.mockReturnValue("/campaign/cairo");
    const { container } = render(<TopNav />);
    const marked = currentLinks(container);
    expect(marked).toHaveLength(1);
    expect(marked[0]).toHaveAttribute("href", "/campaign");
  });

  it("marks the Home wordmark on /", () => {
    pathnameMock.mockReturnValue("/");
    const { container } = render(<TopNav />);
    const marked = currentLinks(container);
    expect(marked).toHaveLength(1);
    expect(marked[0]).toHaveAttribute("href", "/");
  });

  it("marks nothing on /museum", () => {
    pathnameMock.mockReturnValue("/museum");
    const { container } = render(<TopNav />);
    expect(currentLinks(container)).toHaveLength(0);
  });
});

describe("MobileMenu (Req 1.6, 1.7, 15.7, 15.8)", () => {
  it("opens on click, lists the seven links in order, and Escape closes and refocuses the button", () => {
    render(<MobileMenu items={site.nav} current={null} />);
    const button = screen.getByRole("button", { name: "Menu" });
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(button).toHaveAttribute("aria-controls", "mobile-menu");
    expect(document.getElementById("mobile-menu")).toBeNull();

    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");
    const menu = document.getElementById("mobile-menu");
    expect(menu).not.toBeNull();
    expect(Array.from(menu!.querySelectorAll("a")).map((a) => a.textContent)).toEqual(
      site.nav.map((n) => n.label),
    );

    const first = menu!.querySelector("a")!;
    first.focus();
    fireEvent.keyDown(first, { key: "Escape" });
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(document.getElementById("mobile-menu")).toBeNull();
    expect(document.activeElement).toBe(button);
  });

  it("closes and refocuses the button when a link is activated", () => {
    render(<MobileMenu items={site.nav} current={null} />);
    const button = screen.getByRole("button", { name: "Menu" });
    fireEvent.click(button);
    const link = screen.getByRole("link", { name: "Team" });
    fireEvent.click(link);
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(document.activeElement).toBe(button);
  });

  it("wraps Tab from the last link back to the button and Shift+Tab from the button to the last link", () => {
    render(<MobileMenu items={site.nav} current={null} />);
    const button = screen.getByRole("button", { name: "Menu" });
    fireEvent.click(button);
    const links = Array.from(document.getElementById("mobile-menu")!.querySelectorAll("a"));
    const last = links[links.length - 1];

    last.focus();
    fireEvent.keyDown(last, { key: "Tab" });
    expect(document.activeElement).toBe(button);

    fireEvent.keyDown(button, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(last);
  });
});

describe("Pending and JsonLd", () => {
  it("Pending renders bracketed text with role note and the .pending class", () => {
    render(<Pending text="Logline to follow" />);
    const note = screen.getByRole("note");
    expect(note.textContent).toBe("[Logline to follow]");
    expect(note.className).toBe("pending");
    expect(note.tagName).toBe("DIV");
  });

  it("Pending honours as='p'", () => {
    render(<Pending text="x" as="p" />);
    expect(screen.getByRole("note").tagName).toBe("P");
  });

  it("JsonLd serialises its data into an application/ld+json script", () => {
    const data = { "@context": "https://schema.org", "@type": "Organization", name: "Returning Sands" };
    const { container } = render(<JsonLd data={data} />);
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();
    expect(JSON.parse(script!.textContent ?? "")).toEqual(data);
  });
});
