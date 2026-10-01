import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

import { Stamp } from "@/components/motifs/Stamp";
import { BoardingPass } from "@/components/motifs/BoardingPass";
import { Passport } from "@/components/motifs/Passport";
import { PassportCard } from "@/components/motifs/PassportCard";
import { Silhouette } from "@/components/motifs/Silhouette";
import { AdmissionTicket } from "@/components/motifs/AdmissionTicket";
import { Prose } from "@/components/content/Prose";
import { Figure } from "@/components/content/Figure";
import { resolveAsset } from "@/lib/assets";
import { DESIGN_ASSET_PATHS } from "@/lib/assetPaths";
import { BOARDING_PASS_LABELS } from "@/lib/boardingPass";
import { museum } from "@/content/museum";
import type { DesignAssetKey, EmailProviderConfig, TeamMember } from "@/lib/types";

const ALL_KEYS = Object.keys(DESIGN_ASSET_PATHS) as DesignAssetKey[];
const allOff = Object.fromEntries(ALL_KEYS.map((k) => [k, false])) as Record<DesignAssetKey, boolean>;

// Vitest runs without `globals: true`, so Testing Library's automatic
// unmount does not register; `screen` queries need an explicit cleanup.
afterEach(cleanup);

/** True when `el` or any ancestor is `aria-hidden="true"`. */
function isAriaHidden(el: Element): boolean {
  return el.closest('[aria-hidden="true"]') !== null;
}

// ---------------------------------------------------------------------------
// Stamp (Req 13.7, 7.8, 13.12)
// ---------------------------------------------------------------------------
describe("Stamp", () => {
  it("renders the bilingual text with lang/dir on the Arabic span", () => {
    const { container } = render(<Stamp />);
    expect(screen.getByText("RETURNING SANDS")).toBeInTheDocument();
    const ar = screen.getByText("عودة الرمال");
    expect(ar).toHaveAttribute("lang", "ar");
    expect(ar).toHaveAttribute("dir", "rtl");
    expect(container.querySelector(".rounded-\\[50\\%\\]")).not.toBeNull();
  });

  it("renders the subLabel box only when given", () => {
    const { rerender } = render(<Stamp />);
    expect(screen.queryByText("THE DOCUMENTARY")).toBeNull();
    rerender(<Stamp subLabel="THE DOCUMENTARY" />);
    expect(screen.getByText("THE DOCUMENTARY")).toBeInTheDocument();
  });

  it("renders PAST iff overprint is set, as real text that is not aria-hidden", () => {
    const { rerender } = render(<Stamp />);
    expect(screen.queryByText("PAST")).toBeNull();

    rerender(<Stamp overprint="PAST" />);
    const past = screen.getByText("PAST");
    expect(past.tagName).toBe("SPAN");
    expect(isAriaHidden(past)).toBe(false);

    rerender(<Stamp overprint="DENIED" />);
    expect(screen.queryByText("PAST")).toBeNull();
    expect(isAriaHidden(screen.getByText("DENIED"))).toBe(false);
  });

  it("decorative stamps are hidden from assistive technology", () => {
    const { container } = render(<Stamp decorative subLabel="CAIRO" />);
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute("aria-hidden", "true");
    expect(isAriaHidden(screen.getByText("RETURNING SANDS"))).toBe(true);
  });

  it("applies the tilt as a rotation", () => {
    const { container } = render(<Stamp tilt="-4deg" />);
    expect((container.firstElementChild as HTMLElement).style.transform).toBe("rotate(-4deg)");
  });
});

// ---------------------------------------------------------------------------
// BoardingPass (Req 6.6, 7.8, 13.7)
// ---------------------------------------------------------------------------
describe("BoardingPass", () => {
  const props = { from: "CAI", to: "LHR", code: "001", dateText: "16 Dec 2026", title: "In Conversation at AUC" };

  it("renders heading, brand, route, code, date and title", () => {
    render(<BoardingPass {...props} />);
    expect(screen.getByText(BOARDING_PASS_LABELS.heading)).toBeInTheDocument();
    expect(screen.getByText(BOARDING_PASS_LABELS.brand)).toBeInTheDocument();
    expect(screen.getAllByText("CAI → LHR").length).toBeGreaterThan(0);
    expect(screen.getByText("EVENT 001")).toBeInTheDocument();
    expect(screen.getByText("16 Dec 2026")).toBeInTheDocument();
    expect(screen.getByText("In Conversation at AUC")).toBeInTheDocument();
    expect(screen.queryByText("PAST")).toBeNull();
  });

  it("renders PAST iff past, and omits EVENT when there is no code", () => {
    const { container } = render(<BoardingPass {...props} code={undefined} past />);
    const past = screen.getByText("PAST");
    expect(isAriaHidden(past)).toBe(false);
    expect(container.textContent).not.toContain("EVENT");
  });

  it("wraps the card in a link only when href is given", () => {
    const { container, rerender } = render(<BoardingPass {...props} />);
    expect(container.querySelector("a")).toBeNull();
    rerender(<BoardingPass {...props} href="/campaign/cairo#cairo-auc-conversation" />);
    expect(container.querySelector("a")).toHaveAttribute("href", "/campaign/cairo#cairo-auc-conversation");
    expect(container.querySelector(".perf")).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Passport (Req 13.7, 2.8)
// ---------------------------------------------------------------------------
describe("Passport", () => {
  it("cover shows the bilingual title and PASSPORT with children centred", () => {
    render(
      <Passport variant="cover">
        <span>child</span>
      </Passport>,
    );
    expect(screen.getByText("عودة الرمال")).toHaveAttribute("lang", "ar");
    expect(screen.getByText("RETURNING SANDS")).toBeInTheDocument();
    expect(screen.getByText("PASSPORT")).toBeInTheDocument();
    expect(screen.getByText("child")).toBeInTheDocument();
  });

  it("spread renders two pages in a grid with left/right slots", () => {
    const { container } = render(<Passport variant="spread" left={<p>Left</p>} right={<p>Right</p>} />);
    expect(container.querySelector(".md\\:grid-cols-2")).not.toBeNull();
    expect(screen.getByText("Left")).toBeInTheDocument();
    expect(screen.getByText("Right")).toBeInTheDocument();
    expect(container.querySelectorAll(".bg-sand-100")).toHaveLength(2);
  });
});

// ---------------------------------------------------------------------------
// PassportCard + Silhouette (Req 10.2, 10.4, 10.5)
// ---------------------------------------------------------------------------
describe("PassportCard", () => {
  const base: TeamMember = {
    name: "Jenna Khalil",
    role: "Cairo Impact Coordinator",
    group: "Core Team",
    order: 1,
  };

  it("with a photo renders next/image with alt equal to the name", () => {
    const { container } = render(<PassportCard member={{ ...base, photo: "/img/portrait.jpg" }} />);
    const img = container.querySelector("img");
    expect(img).toHaveAttribute("alt", "Jenna Khalil");
    expect(img).toHaveAttribute("sizes", "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw");
    expect(img?.className).toContain("object-cover");
    expect(container.querySelector(".aspect-\\[3\\/4\\]")).not.toBeNull();
    expect(screen.queryByLabelText("Portrait coming soon")).toBeNull();
  });

  it("without a photo renders the Silhouette and no empty base/bio nodes", () => {
    const { container } = render(<PassportCard member={base} />);
    expect(screen.getByRole("img", { name: "Portrait coming soon" })).toBeInTheDocument();
    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    const name = screen.getByText("Jenna Khalil");
    expect(name.className).toContain("font-mono");
    expect(name.className).toContain("font-semibold");
    expect(screen.getByText("Cairo Impact Coordinator")).toBeInTheDocument();
    // Only name + role paragraphs/headings: nothing rendered for base/bio.
    const textNodes = Array.from(container.querySelectorAll("p, h3"));
    expect(textNodes).toHaveLength(2);
    for (const el of textNodes) expect(el.textContent?.trim()).not.toBe("");
  });

  it("renders base and bio when non-empty, not when whitespace", () => {
    const full = render(<PassportCard member={{ ...base, base: "Cairo", bio: "Bio text." }} />);
    expect(full.getByText("Cairo")).toBeInTheDocument();
    expect(full.getByText("Bio text.")).toBeInTheDocument();
    expect(full.container.querySelectorAll("p, h3")).toHaveLength(4);

    const blank = render(<PassportCard member={{ ...base, base: "   ", bio: "" }} />);
    expect(blank.container.querySelectorAll("p, h3")).toHaveLength(2);
  });

  it("Silhouette exposes its text and hides the drawing", () => {
    const { container } = render(<Silhouette />);
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute("role", "img");
    expect(root).toHaveAttribute("aria-label", "Portrait coming soon");
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });
});

// ---------------------------------------------------------------------------
// AdmissionTicket (Req 9.1, 9.4, 9.7, 17.10, 17.11) — Property 6 slice
// ---------------------------------------------------------------------------
describe("AdmissionTicket", () => {
  const live: EmailProviderConfig = {
    provider: "Buttondown",
    actionUrl: "https://buttondown.com/api/emails/embed-subscribe/returningsands",
    hiddenFields: { redirect: "https://returningsands.org/museum/thanks", tag: "museum" },
    emailFieldName: "email",
  };

  it("pending → no form, disabled input, 'Ticket desk opening soon', TBC note", () => {
    const { container } = render(<AdmissionTicket config={null} id="ticket-hero" copy={museum.ticket} />);
    expect(container.querySelector("form")).toBeNull();
    expect(container.querySelector("button")).toBeNull();
    const input = screen.getByLabelText(museum.ticket.label);
    expect(input).toBeDisabled();
    expect(input).toHaveAttribute("id", "ticket-hero");
    expect(input).toHaveAttribute("type", "email");
    expect(screen.getByText("Ticket desk opening soon").tagName).toBe("P");
    expect(screen.getByText(museum.ticket.privacyNoteProviderTbc)).toBeInTheDocument();
    expect(container.textContent).not.toContain("Buttondown");
    expect(container.querySelector("script")).toBeNull();
  });

  it("a config whose actionUrl is empty is treated as pending (Req 9.4)", () => {
    const { container } = render(
      <AdmissionTicket config={{ ...live, actionUrl: "" }} id="t" copy={museum.ticket} />,
    );
    expect(container.querySelector("form")).toBeNull();
    expect(screen.getByLabelText(museum.ticket.label)).toBeDisabled();
  });

  it("present → form action, hidden fields, enabled input, button, provider in note", () => {
    const { container } = render(<AdmissionTicket config={live} id="ticket-footer" copy={museum.ticket} />);
    const form = container.querySelector("form");
    expect(form).toHaveAttribute("method", "post");
    expect(form).toHaveAttribute("action", live.actionUrl);

    const hidden = Array.from(container.querySelectorAll('input[type="hidden"]')).map((i) => [
      i.getAttribute("name"),
      i.getAttribute("value"),
    ]);
    expect(hidden).toEqual([
      ["redirect", "https://returningsands.org/museum/thanks"],
      ["tag", "museum"],
    ]);

    const input = screen.getByLabelText(museum.ticket.label);
    expect(input).toBeEnabled();
    expect(input).toBeRequired();
    expect(input).toHaveAttribute("name", "email");
    expect(input).toHaveAttribute("autocomplete", "email");

    expect(screen.getByRole("button", { name: "Reserve my ticket" })).toHaveAttribute("type", "submit");
    expect(screen.queryByText("Ticket desk opening soon")).toBeNull();
    expect(screen.getByText(`${museum.ticket.privacyNote} Handled by Buttondown.`)).toBeInTheDocument();
    expect(container.querySelector("script")).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Prose / Figure
// ---------------------------------------------------------------------------
describe("Prose", () => {
  it("renders one <p> per paragraph in order", () => {
    const paragraphs = ["First", "Second", "Third"];
    const { container } = render(<Prose paragraphs={paragraphs} />);
    const ps = Array.from(container.querySelectorAll("p")).map((p) => p.textContent);
    expect(ps).toEqual(paragraphs);
  });

  it("renders no paragraphs for an empty list", () => {
    const { container } = render(<Prose paragraphs={[]} />);
    expect(container.querySelectorAll("p")).toHaveLength(0);
  });
});

describe("Figure", () => {
  it("renders next/image with alt and sizes, and a caption when given", () => {
    const { container } = render(
      <Figure image={{ src: "/img/meroe.jpg", alt: "The pyramids at Meroë" }} sizes="100vw" caption="Meroë" />,
    );
    const img = container.querySelector("figure img");
    expect(img).toHaveAttribute("alt", "The pyramids at Meroë");
    expect(img).toHaveAttribute("sizes", "100vw");
    expect(container.querySelector("figcaption")).toHaveTextContent("Meroë");
  });

  it("omits the figcaption when there is no caption", () => {
    const { container } = render(
      <Figure image={{ src: "/img/meroe.jpg", alt: "Meroë", width: 800, height: 600 }} sizes="50vw" />,
    );
    expect(container.querySelector("figcaption")).toBeNull();
    expect(container.querySelector("img")).toHaveAttribute("width", "800");
  });
});

// ---------------------------------------------------------------------------
// resolveAsset — every DesignAssetKey with its flag on and off (Req 20.4, 20.5)
// ---------------------------------------------------------------------------
describe("resolveAsset per key", () => {
  it.each(ALL_KEYS)("%s → stand-in when off, designer URL when on", (key) => {
    expect(resolveAsset(key, allOff)).toEqual({ kind: "standin" });
    const on = resolveAsset(key, { ...allOff, [key]: true });
    expect(on.kind).toBe("designer");
    if (on.kind === "designer") {
      expect(on.src).toBe(DESIGN_ASSET_PATHS[key].replace(/^public/, ""));
      expect(on.src.startsWith("/design/")).toBe(true);
    }
  });
});
