import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

import MuseumPage from "@/app/museum/page";
import MuseumThanksPage, { metadata as thanksMetadata } from "@/app/museum/thanks/page";
import { Roadmap } from "@/components/museum/Roadmap";
import { museum } from "@/content/museum";
import type { EmailProviderConfig } from "@/lib/types";

// Virtual Museum page (Req 8, 9, 17.4–17.6) and the /museum/thanks landing
// (Req 9.6, 16.13). The first block renders against the real Content_Files
// (Email_Provider, funder acknowledgement and work-of-Amer all pending); the
// later blocks swap in filled copies via `vi.doMock` + a fresh dynamic import
// (design Property 6 slices).

afterEach(cleanup);

const WORK_OF_AMER_NOTE = "Copy on the work of Amer to follow";
const TICKET_DESK = "Ticket desk opening soon";

// Req 8.8: banned delivery-technology terms (word-bounded so "AR" does not
// match "ARchive", and "3D" does not match "23D").
const BANNED_TERMS = [/\b3D\b/i, /\bVR\b/, /\bvirtual reality\b/i, /\baugmented reality\b/i, /\bAR\b/, /\bmetaverse\b/i];

describe("/museum with the real (pending) content", () => {
  it("renders the h1 and the four h2s in document order (Req 8.1)", () => {
    render(<MuseumPage />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Virtual Museum");
    const h2s = screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent);
    expect(h2s).toEqual(["What it is", "What it will hold", "Roadmap", "Reserve your ticket"]);
  });

  it("renders the intro paragraphs in the hero before the first h2 (Req 8.1a)", () => {
    render(<MuseumPage />);
    const firstIntro = screen.getByText(museum.intro[0]);
    const firstH2 = screen.getAllByRole("heading", { level: 2 })[0];
    expect(firstIntro.compareDocumentPosition(firstH2) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("renders two disabled Admission_Tickets with distinct ids and no form (Req 8.2, 8.9, 9.4)", () => {
    const { container } = render(<MuseumPage />);
    expect(screen.getAllByText(TICKET_DESK)).toHaveLength(2);

    const inputs = container.querySelectorAll('input[type="email"]');
    expect(inputs).toHaveLength(2);
    for (const input of Array.from(inputs)) expect(input).toBeDisabled();
    const ids = Array.from(inputs).map((i) => i.id);
    expect(new Set(ids).size).toBe(2);
    expect(ids).toEqual(["ticket-hero", "ticket-footer"]);
    // Each input has a visible, associated label (Req 9.1).
    for (const id of ids) expect(container.querySelector(`label[for="${id}"]`)).toHaveTextContent(museum.ticket.label);

    expect(container.querySelectorAll("form")).toHaveLength(0);
    expect(container.querySelectorAll("button")).toHaveLength(0);
    expect(screen.queryByText(/mailto:/)).toBeNull();
    expect(container.querySelector('a[href^="mailto:"]')).toBeNull();
  });

  it("places the first ticket before 'What it is' and the second after 'Roadmap' (Req 8.1a, 8.1e)", () => {
    render(<MuseumPage />);
    const [first, second] = screen.getAllByText(TICKET_DESK);
    const whatItIs = screen.getByRole("heading", { level: 2, name: "What it is" });
    const roadmap = screen.getByRole("heading", { level: 2, name: "Roadmap" });
    expect(first.compareDocumentPosition(whatItIs) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(roadmap.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("uses the 'to be confirmed' privacy wording with no provider name (Req 17.11)", () => {
    render(<MuseumPage />);
    expect(screen.getAllByText(museum.ticket.privacyNoteProviderTbc)).toHaveLength(2);
    expect(screen.queryByText(/Handled by/)).toBeNull();
  });

  it("shows the work-of-Amer dashed note inside 'What it is' with no brackets (Req 8.5)", () => {
    render(<MuseumPage />);
    const note = screen.getByText(WORK_OF_AMER_NOTE);
    expect(note).toHaveClass("pending");
    expect(note).toHaveAttribute("role", "note");
    expect(note.textContent).toBe(WORK_OF_AMER_NOTE);
    expect(note.tagName).toBe("DIV");
    // Sits after the last "What it is" paragraph and before "What it will hold".
    const lastPara = screen.getByText(museum.whatItIs[museum.whatItIs.length - 1]);
    const nextH2 = screen.getByRole("heading", { level: 2, name: "What it will hold" });
    expect(lastPara.compareDocumentPosition(note) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(note.compareDocumentPosition(nextH2) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getAllByRole("note")).toHaveLength(1);
  });

  it("renders no funder block when the Placeholder is pending (Req 8.4, 17.6)", () => {
    const { container } = render(<MuseumPage />);
    expect(container.querySelector("aside")).toBeNull();
    expect(screen.queryByLabelText("Funder acknowledgement")).toBeNull();
  });

  it("lists every collection with the three required titles (Req 8.3)", () => {
    render(<MuseumPage />);
    const heading = screen.getByRole("heading", { level: 2, name: "What it will hold" });
    const list = heading.parentElement!.querySelector("ul")!;
    expect(list.children).toHaveLength(museum.collections.length);
    const titles = Array.from(list.querySelectorAll("h3")).map((h) => h.textContent);
    expect(titles).toEqual(museum.collections.map((c) => c.title));
    for (const required of ["Collections", "Archival materials", "Lost artefacts room"]) {
      expect(titles).toContain(required);
    }
    for (const c of museum.collections) expect(screen.getByText(c.description)).toBeInTheDocument();
  });

  it("renders the roadmap as an <ol> with one item per stage and one WE ARE HERE marker (Req 8.6)", () => {
    const { container } = render(<MuseumPage />);
    const ol = container.querySelector("ol")!;
    expect(ol).not.toBeNull();
    expect(ol.children).toHaveLength(museum.roadmap.length);
    expect(container.querySelectorAll('[aria-current="step"]')).toHaveLength(1);
    expect(screen.getAllByText("WE ARE HERE")).toHaveLength(1);

    const labels = Array.from(ol.querySelectorAll("h3")).map((h) => h.textContent);
    expect(labels).toEqual(museum.roadmap.map((s) => s.label));
    for (const stage of museum.roadmap) {
      expect(screen.getByText(stage.description)).toBeInTheDocument();
      if (stage.dateText) expect(screen.getAllByText(new RegExp(stage.dateText)).length).toBeGreaterThan(0);
    }

    // The marker lives inside the current <li>.
    const currentLi = container.querySelector('li[aria-current="step"]')!;
    expect(currentLi).toContainElement(screen.getByText("WE ARE HERE"));
    const currentIndex = museum.roadmap.findIndex((s) => s.current);
    expect(ol.children[currentIndex]).toBe(currentLi);
  });

  it("contains none of the banned technology terms (Req 8.8)", () => {
    const { container } = render(<MuseumPage />);
    const text = container.textContent ?? "";
    for (const re of BANNED_TERMS) expect(text).not.toMatch(re);
  });
});

describe("Roadmap component", () => {
  it("marks the current stage and attaches WE ARE HERE to it, with the dashed stamp styling", () => {
    const stages = [
      { label: "One", description: "First." },
      { label: "Two", description: "Second.", current: true, dateText: "2027" },
      { label: "Three", description: "Third." },
    ];
    const { container } = render(<Roadmap stages={stages} />);
    const items = container.querySelectorAll("ol > li");
    expect(items).toHaveLength(3);
    expect(items[1]).toHaveAttribute("aria-current", "step");
    expect(items[0]).not.toHaveAttribute("aria-current");
    expect(items[2]).not.toHaveAttribute("aria-current");
    const marker = screen.getByText("WE ARE HERE");
    expect(items[1]).toContainElement(marker);
    expect(marker.tagName).toBe("SPAN");
    for (const cls of ["border-2", "border-dashed", "border-stamp-700", "font-mono", "uppercase"]) {
      expect(marker).toHaveClass(cls);
    }
    expect(items[1]).toHaveTextContent("2027");
  });
});

describe("/museum with the Email_Provider and funder acknowledgement filled", () => {
  const PROVIDER: EmailProviderConfig = {
    provider: "Buttondown",
    actionUrl: "https://buttondown.com/api/emails/embed-subscribe/returningsands",
    hiddenFields: { redirect: "https://returningsands.org/museum/thanks" },
    emailFieldName: "email",
  };
  const WORDING = "Supported by the Cultural Protection Fund, in partnership with the British Council.";
  let Page: typeof MuseumPage;

  beforeEach(async () => {
    vi.resetModules();
    vi.doMock("@/content/site", async (importOriginal) => {
      const mod = await importOriginal<typeof import("@/content/site")>();
      return {
        site: {
          ...mod.site,
          pending: {
            ...mod.site.pending,
            emailProvider: PROVIDER,
            funderAcknowledgement: {
              wording: WORDING,
              logo: { src: "/img/stamp-sudan.png", alt: "Cultural Protection Fund logo", width: 160, height: 64 },
            },
          },
        },
      };
    });
    Page = (await import("@/app/museum/page")).default;
  });

  afterEach(() => {
    vi.doUnmock("@/content/site");
    vi.resetModules();
  });

  it("renders two live forms posting to the provider with redirect fields and submit buttons (Req 8.2, 9.2, 9.3)", () => {
    const { container } = render(<Page />);
    const forms = container.querySelectorAll("form");
    expect(forms).toHaveLength(2);
    for (const form of Array.from(forms)) {
      expect(form).toHaveAttribute("method", "post");
      expect(form).toHaveAttribute("action", PROVIDER.actionUrl);
      expect(form.querySelector('input[type="hidden"][name="redirect"]')).toHaveAttribute(
        "value",
        "https://returningsands.org/museum/thanks",
      );
      expect(form.querySelector('input[type="email"]')).toBeEnabled();
    }
    expect(screen.getAllByRole("button", { name: "Reserve my ticket" })).toHaveLength(2);
    expect(screen.queryByText(TICKET_DESK)).toBeNull();
    expect(container.querySelectorAll("script")).toHaveLength(0);
  });

  it("names the provider in both privacy notes (Req 17.10)", () => {
    render(<Page />);
    expect(screen.getAllByText(/Handled by Buttondown\./)).toHaveLength(2);
    expect(screen.queryByText(museum.ticket.privacyNoteProviderTbc)).toBeNull();
  });

  it("renders the funder wording and logo inside 'What it is' (Req 8.4, 17.5)", () => {
    render(<Page />);
    const block = screen.getByLabelText("Funder acknowledgement");
    expect(block).toHaveTextContent(WORDING);
    const img = block.querySelector("img");
    expect(img).not.toBeNull();
    expect(img?.getAttribute("alt")).toBe("Cultural Protection Fund logo");
    expect(img?.getAttribute("sizes")).toBe("160px");

    const whatItIs = screen.getByRole("heading", { level: 2, name: "What it is" });
    const nextH2 = screen.getByRole("heading", { level: 2, name: "What it will hold" });
    expect(whatItIs.compareDocumentPosition(block) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(block.compareDocumentPosition(nextH2) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});

describe("/museum with the work-of-Amer Placeholder filled", () => {
  const AMER = "Amer Matar's Prisons Museum shows how a community-led archive can hold memory for a displaced people.";
  let Page: typeof MuseumPage;

  beforeEach(async () => {
    vi.resetModules();
    vi.doMock("@/content/museum", async (importOriginal) => {
      const mod = await importOriginal<typeof import("@/content/museum")>();
      return { museum: { ...mod.museum, pending: { workOfAmer: AMER } } };
    });
    Page = (await import("@/app/museum/page")).default;
  });

  afterEach(() => {
    vi.doUnmock("@/content/museum");
    vi.resetModules();
  });

  it("renders the text as a plain paragraph and no note (Req 8.5)", () => {
    render(<Page />);
    const para = screen.getByText(AMER);
    expect(para.tagName).toBe("P");
    expect(para).not.toHaveClass("pending");
    expect(screen.queryByText(WORK_OF_AMER_NOTE)).toBeNull();
    expect(screen.queryAllByRole("note")).toHaveLength(0);
  });
});

describe("/museum/thanks", () => {
  it("is noindex and builds without a provider (Req 9.8, 16.13)", () => {
    expect(thanksMetadata.robots).toEqual({ index: false, follow: false });
    expect(thanksMetadata.alternates?.canonical).toBe("https://returningsands.org/museum/thanks");
  });

  it("renders a stamped ticket with the one-sentence confirmation and a link back (Req 9.6)", () => {
    const { container } = render(<MuseumThanksPage />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Ticket reserved");
    expect(screen.getByText(museum.thanks.sentence)).toBeInTheDocument();
    expect(screen.getByText("ADMITTED")).toBeInTheDocument();
    const back = screen.getByRole("link", { name: museum.thanks.backLabel });
    expect(back).toHaveAttribute("href", "/museum");
    expect(container.querySelector("form, input, button")).toBeNull();
  });
});
