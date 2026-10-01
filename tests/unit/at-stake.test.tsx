import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

import AtStakePage, { AT_STAKE_IMAGE_SIZES, metadata } from "@/app/at-stake/page";
import { site } from "@/content/site";

// Vitest runs without `globals: true`, so RTL cannot register its own
// afterEach cleanup; unmount explicitly or renders accumulate across tests.
afterEach(cleanup);

// The body paragraphs are the <p>s inside the Prose block; the quote's <p>
// and the stat <p> are excluded by selecting only <p>s that carry body copy.
function bodyParagraphs(container: HTMLElement): HTMLParagraphElement[] {
  return Array.from(container.querySelectorAll("p")).filter((p) =>
    site.atStake.body.includes(p.textContent ?? ""),
  );
}

describe("What's at Stake page (Req 4)", () => {
  it("exports the atStake metadata for /at-stake", () => {
    expect(metadata.title).toBe(site.pages.atStake.title);
    expect(metadata.alternates?.canonical).toBe("https://returningsands.org/at-stake");
  });

  it("opens with a single h1 followed by the Ali Nour blockquote before any body copy (4.1)", () => {
    const { container } = render(<AtStakePage />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("What's at Stake");

    const blockquote = container.querySelector("blockquote");
    expect(blockquote).not.toBeNull();
    expect(blockquote).toHaveTextContent(site.atStake.quote);

    const cite = container.querySelector("figcaption cite");
    expect(cite).not.toBeNull();
    expect(cite).toHaveTextContent("Ali Nour");

    // The quote is the first content element after the h1: nothing but the
    // heading precedes it, and every body paragraph follows it.
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1.compareDocumentPosition(blockquote!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    const firstBody = bodyParagraphs(container)[0];
    expect(
      blockquote!.compareDocumentPosition(firstBody) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("renders one <p> per body paragraph, verbatim and in file order (4.2)", () => {
    const { container } = render(<AtStakePage />);
    const paragraphs = bodyParagraphs(container);
    expect(paragraphs).toHaveLength(site.atStake.body.length);
    expect(paragraphs.map((p) => p.textContent)).toEqual(site.atStake.body);
  });

  it("highlights the 60% statistic with its label in the same element (4.3, 4.4)", () => {
    render(<AtStakePage />);
    const value = screen.getByText(site.atStake.stat.value);
    expect(value.textContent).toBe("60%");
    // Numeral is >= 2x body size (text-5xl vs text-lg) in the stamp palette.
    expect(value.className).toContain("text-5xl");
    expect(value.className).toContain("text-stamp-700");
    expect(value.className).toContain("font-mono");
    // The label sits in the same containing element, immediately after.
    const figure = value.parentElement!;
    expect(figure.textContent).toContain(site.atStake.stat.label);
    expect(value.nextElementSibling).toHaveTextContent(site.atStake.stat.label);
  });

  it("renders every archival image with descriptive alt text, sizes, and preload on the first only (4.5, 19.4)", () => {
    const { container } = render(<AtStakePage />);
    const imgs = Array.from(container.querySelectorAll("img"));
    expect(imgs).toHaveLength(site.atStake.images.length);
    expect(imgs.length).toBeGreaterThanOrEqual(1);
    expect(imgs.length).toBeLessThanOrEqual(5);

    imgs.forEach((img, i) => {
      const alt = img.getAttribute("alt") ?? "";
      const filename = site.atStake.images[i].src.split("/").pop() ?? "";
      expect(alt.length).toBeGreaterThanOrEqual(10);
      expect(alt.length).toBeLessThanOrEqual(125);
      expect(alt).not.toBe(filename);
      expect(alt).not.toContain(filename);
      expect(img).toHaveAttribute("sizes", AT_STAKE_IMAGE_SIZES);
      // `preload` on next/image takes the first image out of lazy loading; the
      // rest keep the default `loading="lazy"`.
      if (i === 0) expect(img.getAttribute("loading")).not.toBe("lazy");
      else expect(img.getAttribute("loading")).toBe("lazy");
    });
  });

  it("closes with exactly one link to /film and one to /donate (4.6, 12.10)", () => {
    const { container } = render(<AtStakePage />);
    const links = screen.getAllByRole("link");
    const toFilm = links.filter((a) => a.getAttribute("href") === "/film");
    const toDonate = links.filter((a) => a.getAttribute("href") === "/donate");
    expect(toFilm).toHaveLength(1);
    expect(toDonate).toHaveLength(1);
    expect(toFilm[0]).toHaveTextContent("Watch the documentary");
    expect(toDonate[0]).toHaveTextContent("Support the campaign");

    // The closing nav is the last content element in the article.
    const article = container.querySelector("article")!;
    expect(article.lastElementChild?.tagName).toBe("NAV");
    expect(article.lastElementChild).toContainElement(toFilm[0]);
    expect(article.lastElementChild).toContainElement(toDonate[0]);
  });
});
