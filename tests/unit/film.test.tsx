import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

import FilmPage from "@/app/film/page";
import { film } from "@/content/film";

// The Documentary page (Req 5). The first block renders against the real
// Content_File, where all three Placeholders are pending; the second swaps in
// a filled copy of `content/film.ts` via `vi.doMock` + a fresh dynamic import
// (design Property 6 slices: markers iff pending, iframe iff trailer present).

afterEach(cleanup);

describe("/film with the real (pending) content", () => {
  it("renders the THE DOCUMENTARY stamp before the h1 and any section heading (Req 5.1)", () => {
    const { container } = render(<FilmPage />);
    const stampLabel = screen.getByText("THE DOCUMENTARY");
    const h1 = screen.getByRole("heading", { level: 1 });
    // DOCUMENT_POSITION_FOLLOWING (4): h1 comes after the stamp label.
    expect(stampLabel.compareDocumentPosition(h1) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    // The stamp is the very first content element of the page.
    const root = container.firstElementChild as HTMLElement;
    expect(root.firstElementChild?.contains(stampLabel)).toBe(true);
  });

  it("renders the six h2 headings in content order (Req 5.2)", () => {
    render(<FilmPage />);
    const h2s = screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent);
    expect(h2s).toEqual(Object.values(film.headings));
    expect(h2s).toHaveLength(6);
  });

  it("shows two bracketed Pending markers and no iframe (Req 5.3, 5.8, 14.9)", () => {
    const { container } = render(<FilmPage />);
    const notes = screen.getAllByRole("note");
    expect(notes).toHaveLength(2);
    expect(notes[0]).toHaveTextContent("[Logline to follow]");
    expect(notes[1]).toHaveTextContent("[About the film to follow]");
    expect(container.querySelector("iframe")).toBeNull();
  });

  it("shows the Boarding_Pass coming-soon card in the trailer section (Req 5.8)", () => {
    render(<FilmPage />);
    expect(screen.getByText(film.trailerComingSoonText)).toBeInTheDocument();
    expect(screen.getByText("TRAILER")).toBeInTheDocument();
    expect(screen.getAllByText("CAI → LHR").length).toBeGreaterThan(0);
  });

  it("identifies the director and her fellowship (Req 5.4, 5.10)", () => {
    render(<FilmPage />);
    expect(screen.getByText(film.director.name)).toBeInTheDocument();
    expect(screen.getByText(film.director.credential)).toHaveTextContent(
      "Director · 2026 Sundance x Adobe Ignite Fellow",
    );
    // The two-paragraph Old_Site director's note renders as two <p>s.
    expect(screen.getByText(/With Returning Sands I venture/)).toBeInTheDocument();
    expect(screen.getByText(/forthcoming feature documentary HEAT/)).toBeInTheDocument();
  });

  it("renders ali.jpg with alt text naming Ali Nour, plus his biography (Req 5.5, 5.9)", () => {
    const { container } = render(<FilmPage />);
    const img = container.querySelector("figure img");
    expect(img).not.toBeNull();
    expect(img?.getAttribute("alt")).toContain("Ali Nour");
    expect(img?.getAttribute("sizes")).toBe("(min-width: 768px) 40vw, 100vw");
    expect(screen.getByText(/Secretary General of Blue Shield Sudan and rapporteur/)).toBeInTheDocument();
  });

  it("lists the two backers as separately named items (Req 5.6)", () => {
    const { container } = render(<FilmPage />);
    const items = container.querySelectorAll("ul li");
    expect(items).toHaveLength(2);
    expect(items[0].querySelector("strong")).toHaveTextContent("Sundance x Adobe Ignite Fellowship");
    expect(items[1].querySelector("strong")).toHaveTextContent("SIMA Studios fiscal sponsorship");
  });
});

describe("/film with every Placeholder filled", () => {
  const TRAILER = "https://www.youtube.com/embed/x";
  let Page: typeof FilmPage;

  beforeEach(async () => {
    vi.resetModules();
    vi.doMock("@/content/film", async (importOriginal) => {
      const mod = await importOriginal<typeof import("@/content/film")>();
      return {
        film: {
          ...mod.film,
          pending: {
            logline: "One man's journey back to the museum he could not leave behind.",
            aboutFilm: "First paragraph about the film.\n\nSecond paragraph about the film.",
            trailerUrl: TRAILER,
          },
        },
      };
    });
    Page = (await import("@/app/film/page")).default;
  });

  afterEach(() => {
    vi.doUnmock("@/content/film");
    vi.resetModules();
  });

  it("embeds the trailer iframe with the fallback link and no Pending markers (Req 5.7, 5.3)", () => {
    const { container } = render(<Page />);
    expect(screen.queryAllByRole("note")).toHaveLength(0);

    const iframe = container.querySelector("iframe");
    expect(iframe).not.toBeNull();
    expect(iframe).toHaveAttribute("title", "Returning Sands trailer");
    expect(iframe).toHaveAttribute("src", TRAILER);
    expect(iframe?.parentElement?.className).toContain("aspect-video");
    expect(iframe?.parentElement?.className).toContain("w-full");

    const link = screen.getByRole("link", { name: /Watch the trailer/ });
    expect(link).toHaveAttribute("href", TRAILER);
    expect(link).toHaveAttribute("target", "_blank");

    // The coming-soon Boarding_Pass is gone.
    expect(screen.queryByText(film.trailerComingSoonText)).toBeNull();
  });

  it("renders the logline in italics and the about copy as one <p> per paragraph", () => {
    render(<Page />);
    const logline = screen.getByText(/journey back to the museum/);
    expect(logline.tagName).toBe("P");
    expect(logline.className).toContain("italic");
    expect(screen.getByText("First paragraph about the film.").tagName).toBe("P");
    expect(screen.getByText("Second paragraph about the film.").tagName).toBe("P");
  });
});
