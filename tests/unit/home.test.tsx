import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

import Home from "@/app/page";
import { site } from "@/content/site";

// Home page (Req 2.1, 2.2, 2.3, 2.7, 2.9, 2.10, 14.9). The first block renders
// against the real Content_File, where `film.pending.trailerUrl` is pending;
// the second swaps in a filled copy via `vi.doMock` + a fresh dynamic import
// (design Property 6 slice: disabled button iff pending, anchor iff present).

// `HashRedirect` calls `useRouter().replace`; stub the router.
const { replaceMock } = vi.hoisted(() => ({ replaceMock: vi.fn<(href: string) => void>() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: replaceMock }) }));

beforeEach(() => {
  replaceMock.mockReset();
  window.history.replaceState(null, "", "/");
});

afterEach(cleanup);

describe("/ with the real (pending) content", () => {
  it("renders the kicker, h1 and Arabic title with lang/dir (Req 2.1, 2.9)", () => {
    render(<Home />);
    expect(screen.getByText(site.kicker)).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Returning Sands");

    // The Stamp on the hero also carries the Arabic name; the title one is the
    // first `lang="ar"` element and sits before the h1's section ends.
    const arabic = screen.getAllByText(site.arabicName)[0];
    expect(arabic).toHaveAttribute("lang", "ar");
    expect(arabic).toHaveAttribute("dir", "rtl");
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1.parentElement?.contains(arabic)).toBe(true);
  });

  it("renders the single italic description from content/site.ts (Req 2.1)", () => {
    render(<Home />);
    const desc = screen.getByText(site.description);
    expect(desc.tagName).toBe("P");
    expect(desc.className).toContain("italic");
    expect(site.description.length).toBeLessThanOrEqual(160);
  });

  it("renders a filled Donate link to /donate (Req 2.1)", () => {
    render(<Home />);
    const donate = screen.getByRole("link", { name: "Donate" });
    expect(donate).toHaveAttribute("href", "/donate");
    expect(donate.className).toContain("bg-ochre-500");
  });

  it("renders the trailer control as a disabled, non-focusable button (Req 2.2, 14.9)", () => {
    render(<Home />);
    const button = screen.getByRole("button", { name: "Trailer coming soon" });
    expect(button.tagName).toBe("BUTTON");
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-disabled", "true");
    expect(button).toHaveAttribute("tabindex", "-1");
    expect(screen.queryByRole("link", { name: /Watch the Trailer/ })).toBeNull();
  });

  it("places the Passport_Hero with three City_Stamp anchors below the intro (Req 2.3)", () => {
    const { container } = render(<Home />);
    const h1 = screen.getByRole("heading", { level: 1 });
    const stampHrefs = ["/campaign/london", "/campaign/cairo", "/campaign/nyc"];
    const cityList = screen.getByRole("navigation", { name: "Cities" });

    // City_Stamp anchors are the hero links outside the city list.
    const heroAnchors = Array.from(container.querySelectorAll("a")).filter(
      (a) => stampHrefs.includes(a.getAttribute("href") ?? "") && !cityList.contains(a),
    );
    expect(heroAnchors.map((a) => a.getAttribute("href"))).toEqual(stampHrefs);
    for (const a of heroAnchors) {
      expect(h1.compareDocumentPosition(a) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    }
    expect(screen.getByText("RETURNING SANDS")).toBeInTheDocument();
  });

  it("renders the Cities list with exactly three entries directly after the hero (Req 2.7)", () => {
    render(<Home />);
    const nav = screen.getByRole("navigation", { name: "Cities" });
    const items = nav.querySelectorAll("li");
    expect(items).toHaveLength(3);
    expect(Array.from(nav.querySelectorAll("a")).map((a) => a.getAttribute("href"))).toEqual([
      "/campaign/london",
      "/campaign/cairo",
      "/campaign/nyc",
    ]);
    // The hero's stamp text precedes the list in document order.
    const stamp = screen.getByText("RETURNING SANDS");
    expect(stamp.compareDocumentPosition(nav) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("mounts HashRedirect without redirecting when there is no hash (Req 21.11)", () => {
    render(<Home />);
    expect(replaceMock).not.toHaveBeenCalled();
  });
});

describe("/ with the trailer URL Placeholder filled", () => {
  const TRAILER = "https://youtu.be/x";
  let Page: typeof Home;

  beforeEach(async () => {
    vi.resetModules();
    vi.doMock("@/content/film", async (importOriginal) => {
      const mod = await importOriginal<typeof import("@/content/film")>();
      return {
        film: { ...mod.film, pending: { ...mod.film.pending, trailerUrl: TRAILER } },
      };
    });
    Page = (await import("@/app/page")).default;
  });

  afterEach(() => {
    vi.doUnmock("@/content/film");
    vi.resetModules();
  });

  it("renders Watch the Trailer as an external anchor opening in a new tab (Req 2.10)", () => {
    render(<Page />);
    const link = screen.getByRole("link", { name: /Watch the Trailer/ });
    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("href", TRAILER);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(link).not.toHaveAttribute("aria-disabled");
    expect(screen.queryByRole("button", { name: "Trailer coming soon" })).toBeNull();
  });
});
