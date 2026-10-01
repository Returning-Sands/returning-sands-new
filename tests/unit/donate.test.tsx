import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";

import DonatePage from "@/app/donate/page";
import { COPY_FAILED_MESSAGE, CopyButton } from "@/components/content/CopyButton";
import { donate } from "@/content/donate";
import { ukPanelState } from "@/lib/donate";

// Donate page (Req 12, 17.5, 17.6). The pure decision function gets a truth
// table; the page is rendered once against the real Content_File (both UK
// Placeholders pending, funder acknowledgement pending) and once with a filled
// copy of `content/donate.ts` swapped in via `vi.doMock`.

afterEach(cleanup);

const BANK = { accountName: "Returning Sands CIC", sortCode: "12-34-56", accountNumber: "12345678" };
const STRIPE = "https://donate.stripe.com/test_abc";

describe("ukPanelState (Req 12.3, 12.4, 12.5, 12.12)", () => {
  it("neither present -> fallback only", () => {
    expect(ukPanelState("", null)).toEqual({ showStripe: false, showBank: false, showFallback: true });
    expect(ukPanelState("   ", null)).toEqual({ showStripe: false, showBank: false, showFallback: true });
  });

  it("stripe only -> stripe, no bank, no fallback", () => {
    expect(ukPanelState(STRIPE, null)).toEqual({ showStripe: true, showBank: false, showFallback: false });
  });

  it("bank only -> bank, no stripe, no fallback", () => {
    expect(ukPanelState("", BANK)).toEqual({ showStripe: false, showBank: true, showFallback: false });
  });

  it("both present -> stripe and bank, no fallback", () => {
    expect(ukPanelState(STRIPE, BANK)).toEqual({ showStripe: true, showBank: true, showFallback: false });
  });

  it("a partially filled bank group counts as empty (Req 12.12)", () => {
    for (const key of ["accountName", "sortCode", "accountNumber"] as const) {
      const partial = { ...BANK, [key]: "" };
      expect(ukPanelState("", partial)).toEqual({ showStripe: false, showBank: false, showFallback: true });
      expect(ukPanelState(STRIPE, { ...BANK, [key]: "  " })).toEqual({
        showStripe: true,
        showBank: false,
        showFallback: false,
      });
    }
  });
});

describe("/donate with the real (pending) content", () => {
  it("renders the h1 and both panel headings with the US panel first (Req 12.1)", () => {
    render(<DonatePage />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Donate");
    const h2s = screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent);
    expect(h2s).toEqual([donate.us.title, donate.uk.title]);
    expect(h2s[0]).toBe("United States");
    expect(h2s[1]).toBe("United Kingdom & elsewhere");
  });

  it("lays the panels out in a two-column grid from md up (Req 12.1)", () => {
    const { container } = render(<DonatePage />);
    const grid = container.querySelector(".grid");
    expect(grid).not.toBeNull();
    expect(grid!.className).toContain("md:grid-cols-2");
    expect(grid!.children).toHaveLength(2);
  });

  it("links the US buttons to PayPal and SIMA in a new tab (Req 12.2)", () => {
    render(<DonatePage />);
    expect(screen.getByText(donate.us.tagline)).toBeInTheDocument();

    const usd = screen.getByRole("link", { name: /Donate in USD/ });
    expect(usd).toHaveAttribute("href", "https://www.paypal.com/donate/?hosted_button_id=CU7JMGF3GWH2J");
    expect(usd).toHaveAttribute("target", "_blank");
    expect(usd).toHaveAttribute("rel", "noopener noreferrer");

    const sima = screen.getByRole("link", { name: /Our SIMA page/ });
    expect(sima).toHaveAttribute("href", "https://simastudios.org/fiscal-sponsorship/returning-sands/");
    expect(sima).toHaveAttribute("target", "_blank");
  });

  it("shows the UK fallback text and a single /support button, no GBP link, no <dl> (Req 12.3, 12.5)", () => {
    const { container } = render(<DonatePage />);
    expect(screen.getByText(donate.uk.fallbackText)).toBeInTheDocument();
    const support = screen.getByRole("link", { name: donate.uk.fallbackButtonLabel });
    expect(support).toHaveAttribute("href", "/support");

    expect(screen.queryByRole("link", { name: /Donate in GBP/ })).toBeNull();
    expect(container.querySelector("dl")).toBeNull();
    expect(screen.queryAllByRole("button", { name: /^Copy/ })).toHaveLength(0);
    expect(screen.queryByText(donate.uk.referenceInstruction)).toBeNull();
  });

  it("renders both statements in order below the panels (Req 12.6, 12.7)", () => {
    render(<DonatePage />);
    const notForProfit = screen.getByText(donate.statements.notForProfit);
    const notACharity = screen.getByText(donate.statements.notACharity);
    expect(notForProfit.tagName).toBe("P");
    expect(notACharity.tagName).toBe("P");
    expect(
      notForProfit.compareDocumentPosition(notACharity) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    // Statements come after the UK heading.
    const ukHeading = screen.getByRole("heading", { level: 2, name: donate.uk.title });
    expect(ukHeading.compareDocumentPosition(notForProfit) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("contains no form, input or funder block (Req 12.9, 12.8, 17.6)", () => {
    const { container } = render(<DonatePage />);
    expect(container.querySelector("form")).toBeNull();
    expect(container.querySelector("input, textarea, select")).toBeNull();
    expect(container.querySelector("aside")).toBeNull();
    expect(screen.queryByLabelText("Funder acknowledgement")).toBeNull();
    // The last element of the article is the statements block, nothing after it.
    const article = container.querySelector("article")!;
    expect(article.lastElementChild?.contains(screen.getByText(donate.statements.notACharity))).toBe(true);
  });
});

describe("/donate with Stripe, bank details and funder acknowledgement filled", () => {
  const WORDING = "Supported by the Cultural Protection Fund, in partnership with the British Council.";
  let Page: typeof DonatePage;

  beforeEach(async () => {
    vi.resetModules();
    vi.doMock("@/content/donate", async (importOriginal) => {
      const mod = await importOriginal<typeof import("@/content/donate")>();
      return {
        donate: { ...mod.donate, pending: { stripePaymentLink: STRIPE, bankDetails: BANK } },
      };
    });
    vi.doMock("@/content/site", async (importOriginal) => {
      const mod = await importOriginal<typeof import("@/content/site")>();
      return {
        site: {
          ...mod.site,
          pending: {
            ...mod.site.pending,
            funderAcknowledgement: {
              wording: WORDING,
              logo: { src: "/img/stamp-sudan.png", alt: "Cultural Protection Fund logo", width: 160, height: 64 },
            },
          },
        },
      };
    });
    Page = (await import("@/app/donate/page")).default;
  });

  afterEach(() => {
    vi.doUnmock("@/content/donate");
    vi.doUnmock("@/content/site");
    vi.resetModules();
  });

  it("shows the GBP link, the three-row <dl> with Copy buttons and the reference line; no fallback (Req 12.3, 12.4)", () => {
    const { container } = render(<Page />);

    const gbp = screen.getByRole("link", { name: /Donate in GBP/ });
    expect(gbp).toHaveAttribute("href", STRIPE);
    expect(gbp).toHaveAttribute("target", "_blank");

    const dl = container.querySelector("dl");
    expect(dl).not.toBeNull();
    const dts = Array.from(dl!.querySelectorAll("dt")).map((d) => d.textContent);
    expect(dts).toEqual(["Account name", "Sort code", "Account number"]);
    const dds = dl!.querySelectorAll("dd");
    expect(dds).toHaveLength(3);
    expect(dds[0]).toHaveTextContent(BANK.accountName);
    expect(dds[1]).toHaveTextContent(BANK.sortCode);
    expect(dds[2]).toHaveTextContent(BANK.accountNumber);

    const copies = screen.getAllByRole("button", { name: /^Copy / });
    expect(copies).toHaveLength(3);
    expect(copies.map((b) => b.getAttribute("aria-label"))).toEqual([
      "Copy Account name",
      "Copy Sort code",
      "Copy Account number",
    ]);

    const reference = screen.getByText(donate.uk.referenceInstruction);
    expect(dl!.compareDocumentPosition(reference) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    expect(screen.queryByText(donate.uk.fallbackText)).toBeNull();
    expect(screen.queryByRole("link", { name: donate.uk.fallbackButtonLabel })).toBeNull();
    // Still no form or input of any kind (Req 12.9).
    expect(container.querySelector("form, input")).toBeNull();
  });

  it("renders the funder wording and logo below the statements (Req 12.8, 17.5)", () => {
    const { container } = render(<Page />);
    const block = screen.getByLabelText("Funder acknowledgement");
    expect(block).toHaveTextContent(WORDING);
    const img = block.querySelector("img");
    expect(img).not.toBeNull();
    expect(img?.getAttribute("alt")).toBe("Cultural Protection Fund logo");
    expect(img?.getAttribute("sizes")).toBe("160px");

    const notACharity = screen.getByText(donate.statements.notACharity);
    expect(notACharity.compareDocumentPosition(block) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(container.querySelector("article")!.lastElementChild).toBe(block);
  });
});

describe("CopyButton (Req 12.11, 12.13)", () => {
  const originalClipboard = navigator.clipboard;

  function installClipboard(writeText: (text: string) => Promise<void>) {
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
  }

  afterEach(() => {
    Object.defineProperty(navigator, "clipboard", { value: originalClipboard, configurable: true });
    vi.useRealTimers();
  });

  it("writes the exact value and shows Copied for 2 s before reverting to Copy", async () => {
    vi.useFakeTimers();
    const writeText = vi.fn().mockResolvedValue(undefined);
    installClipboard(writeText);

    render(<CopyButton value="12-34-56" label="Sort code" />);
    const button = screen.getByRole("button", { name: "Copy Sort code" });
    expect(button).toHaveTextContent("Copy");

    await act(async () => {
      fireEvent.click(button);
      // Let the resolved promise settle under fake timers.
      await Promise.resolve();
    });

    expect(writeText).toHaveBeenCalledTimes(1);
    expect(writeText).toHaveBeenCalledWith("12-34-56");
    expect(button).toHaveTextContent("Copied");
    expect(button).toHaveAttribute("aria-label", "Copied Sort code");
    expect(screen.getByRole("status")).toBeEmptyDOMElement();

    await act(async () => {
      vi.advanceTimersByTime(1999);
    });
    expect(button).toHaveTextContent("Copied");

    await act(async () => {
      vi.advanceTimersByTime(1);
    });
    expect(button).toHaveTextContent("Copy");
    expect(button).toHaveAttribute("aria-label", "Copy Sort code");
  });

  it("shows the role=status message when the clipboard write rejects, keeping the label on Copy", async () => {
    installClipboard(vi.fn().mockRejectedValue(new Error("denied")));

    render(<CopyButton value="12345678" label="Account number" />);
    const button = screen.getByRole("button", { name: "Copy Account number" });
    fireEvent.click(button);

    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent(COPY_FAILED_MESSAGE));
    expect(button).toHaveTextContent("Copy");
  });
});
