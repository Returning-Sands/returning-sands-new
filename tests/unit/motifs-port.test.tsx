import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";

import { StampBadge } from "@/components/motifs/StampBadge";
import { StampWatermark } from "@/components/motifs/StampWatermark";
import { Postmark } from "@/components/motifs/Postmark";
import { PerfSeam } from "@/components/motifs/PerfSeam";
import { PaperTexture } from "@/components/motifs/PaperTexture";
import { Reveal } from "@/components/motion/Reveal";

// Req 13.12: every decorative image is hidden from assistive technology via
// `alt=""` or an `aria-hidden="true"` ancestor.
function expectDecorative(container: HTMLElement) {
  const imgs = Array.from(container.querySelectorAll("img"));
  for (const img of imgs) {
    const hiddenByAncestor = img.closest('[aria-hidden="true"]') !== null;
    expect(img.getAttribute("alt") === "" || hiddenByAncestor).toBe(true);
  }
  const svgs = Array.from(container.querySelectorAll("svg"));
  for (const svg of svgs) {
    const hidden =
      svg.getAttribute("aria-hidden") === "true" ||
      svg.closest('[aria-hidden="true"]') !== null;
    expect(hidden).toBe(true);
  }
}

describe("ported Old_Site motif components (Req 13.9, 13.12)", () => {
  it("StampBadge renders a next/image with alt='' and explicit sizes", () => {
    const { container } = render(<StampBadge size={96} />);
    const img = container.querySelector("img");
    expect(img).not.toBeNull();
    expect(img).toHaveAttribute("alt", "");
    expect(img).toHaveAttribute("sizes", "96px");
    expect(img?.getAttribute("src")).toContain("stamp-sudan.png");
    expect(container.querySelector(".stamp-sway")).not.toBeNull();
    expect(container.querySelector(".stamp-hover")).not.toBeNull();
    expectDecorative(container);
  });

  it("StampBadge honours sway/interactive flags and the magazine variant", () => {
    const { container } = render(
      <StampBadge variant="magazine" sway={false} interactive={false} />,
    );
    expect(container.querySelector(".stamp-sway")).toBeNull();
    expect(container.querySelector(".stamp-hover")).toBeNull();
    expect(container.querySelector("img")?.getAttribute("src")).toContain(
      "stamp-magazine.png",
    );
    expectDecorative(container);
  });

  it("StampWatermark is aria-hidden, non-interactive and uses alt=''", () => {
    const { container } = render(<StampWatermark size={320} mode="screen" />);
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper).toHaveAttribute("aria-hidden", "true");
    expect(wrapper.className).toContain("pointer-events-none");
    expect(wrapper.className).toContain("mix-blend-screen");
    const img = container.querySelector("img");
    expect(img).toHaveAttribute("alt", "");
    expect(img).toHaveAttribute("sizes", "320px");
    expectDecorative(container);
  });

  it("Postmark renders an aria-hidden SVG in currentColor with the label", () => {
    const { container } = render(<Postmark animate label="CAIRO" />);
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg?.getAttribute("class")).toContain("postmark-draw");
    expect(svg?.textContent).toContain("CAIRO");
    for (const el of Array.from(svg!.querySelectorAll("[stroke]"))) {
      expect(el.getAttribute("stroke")).toBe("currentColor");
    }
    expectDecorative(container);
  });

  it("Postmark gives each instance a unique textPath id", () => {
    const { container } = render(
      <>
        <Postmark />
        <Postmark />
      </>,
    );
    const ids = Array.from(container.querySelectorAll("path[id]")).map((p) =>
      p.getAttribute("id"),
    );
    expect(ids).toHaveLength(2);
    expect(new Set(ids).size).toBe(2);
  });

  it("PerfSeam renders the .perf-seam hook and toggles .on-dark", () => {
    const light = render(<PerfSeam />);
    const lightEl = light.container.firstElementChild as HTMLElement;
    expect(lightEl).toHaveAttribute("aria-hidden", "true");
    expect(lightEl.classList.contains("perf-seam")).toBe(true);
    expect(lightEl.classList.contains("on-dark")).toBe(false);

    const dark = render(<PerfSeam dark />);
    const darkEl = dark.container.firstElementChild as HTMLElement;
    expect(darkEl.classList.contains("on-dark")).toBe(true);
  });

  it("PaperTexture renders nothing (texture is the CSS .grain class)", () => {
    const { container } = render(<PaperTexture />);
    expect(container.innerHTML).toBe("");
  });
});

describe("Reveal (Req 13.11, 19.8)", () => {
  it("always renders its children and adds .is-visible without IntersectionObserver", () => {
    const { container, getByText } = render(
      <Reveal as="section" className="reveal" id="intro" delay={120}>
        <p>Always in the HTML</p>
      </Reveal>,
    );
    const el = container.firstElementChild as HTMLElement;
    expect(getByText("Always in the HTML")).toBeInTheDocument();
    expect(el.tagName).toBe("SECTION");
    expect(el.id).toBe("intro");
    expect(el.style.transitionDelay).toBe("120ms");
    // jsdom has no IntersectionObserver, so the effect's fallback path runs.
    expect(el.classList.contains("is-visible")).toBe(true);
  });
});
