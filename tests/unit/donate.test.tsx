import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";

import DonatePage from "@/app/donate/page";
import { COPY_FAILED_MESSAGE, CopyButton } from "@/components/content/CopyButton";
import { donate } from "@/content/donate";
import { site } from "@/content/site";
import { ukPanelState } from "@/lib/donate";

// Donate page (Req 12, 17.5, 17.6). The pure decision function gets a truth
// table; the page is rendered once against the real Content_File (Stripe and
// bank details filled, funder acknowledgement pending) and once with a copy of
// `content/donate.ts` whose two Placeholders are emptied again via `vi.doMock`.

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

  it("optional iban / bic never influence the decision", () => {
    expect(ukPanelState("", { ...BANK, iban: "", bic: "" })).toEqual({
      showStripe: false,
      showBank: true,
      showFallback: false,
    });
    expect(ukPanelState("", { ...BANK, iban: "GB00 TEST 0000 0000 0000 00", bic: "TESTGB22" }).showBank).toBe(true);
    // Only the extras filled -> still a partial (empty) group.
    expect(ukPanelState("", { accountName: "", sortCode: "", accountNumber: "", iban: "GB00", bic: "X" })).toEqual({
      showStripe: false,
      showBank: false,
      showFallback: true,
    });
  });
});

describe("/donate with the real content (Stripe and bank details filled)", () => {
  const bank = donate.pending.bankDetails!;

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

  it("shows the intro sentence and the 'Donate by card' Stripe link in a new tab (Req 12.3)", () => {
    render(<DonatePage />);
    expect(donate.uk.stripeLabel).toBe("Donate by card");
    const intro = screen.getByText(donate.uk.intro);
    const card = screen.getByRole("link", { name: /Donate by card/ });
    expect(card).toHaveAttribute("href", "https://donate.stripe.com/bJeaEW9qC7Kudizgvw8EM00");
    expect(card).toHaveAttribute("target", "_blank");
    expect(card).toHaveAttribute("rel", "noopener noreferrer");
    expect(intro.compareDocumentPosition(card) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.queryByText(donate.uk.fallbackText)).toBeNull();
    expect(screen.queryByRole("link", { name: donate.uk.fallbackButtonLabel })).toBeNull();
  });

  it("shows the five-row <dl> (incl. IBAN and BIC) with Copy buttons and the reference line (Req 12.4)", () => {
    const { container } = render(<DonatePage />);
    const dl = container.querySelector("dl");
    expect(dl).not.toBeNull();
    const dts = Array.from(dl!.querySelectorAll("dt")).map((d) => d.textContent);
    expect(dts).toEqual(["Account name", "Sort code", "Account number", "IBAN", "BIC"]);
    const dds = dl!.querySelectorAll("dd");
    expect(dds).toHaveLength(5);
    expect(dds[0]).toHaveTextContent("Returning Sands Community Interest Company");
    expect(dds[1]).toHaveTextContent("08-92-99");
    expect(dds[2]).toHaveTextContent("67540396");
    expect(dds[3]).toHaveTextContent("GB83 CPBK 0892 9967 5403 96");
    expect(dds[4]).toHaveTextContent("CPBKGB22");
    expect(bank).toMatchObject({ sortCode: "08-92-99", accountNumber: "67540396", bic: "CPBKGB22" });

    const copies = screen.getAllByRole("button", { name: /^Copy / });
    expect(copies.map((b) => b.getAttribute("aria-label"))).toEqual([
      "Copy Account name",
      "Copy Sort code",
      "Copy Account number",
      "Copy IBAN",
      "Copy BIC",
    ]);

    const reference = screen.getByText(donate.uk.referenceInstruction);
    expect(dl!.compareDocumentPosition(reference) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    // Still no form or input of any kind (Req 12.9).
    expect(container.querySelector("form, input, textarea, select")).toBeNull();
  });

  it("renders both statements in order below the panels, then the donations line (Req 12.6, 12.7)", () => {
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

    const mail = screen.getByRole("link", { name: "donations@returningsands.org" });
    expect(mail).toHaveAttribute("href", `mailto:${site.pending.contactEmails.donations}`);
    expect(mail).toHaveAttribute("href", "mailto:donations@returningsands.org");
    expect(mail.closest("p")).toHaveTextContent("Questions about giving? Email donations@returningsands.org.");
    expect(notACharity.compareDocumentPosition(mail) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("contains no funder block while that Placeholder is pending (Req 12.8, 17.6)", () => {
    const { container } = render(<DonatePage />);
    expect(container.querySelector("aside")).toBeNull();
    expect(screen.queryByLabelText("Funder acknowledgement")).toBeNull();
    // The last element of the article is the statements block, nothing after it.
    const article = container.querySelector("article")!;
    expect(article.lastElementChild?.contains(screen.getByText(donate.statements.notACharity))).toBe(true);
  });
});

describe("/donate with Stripe and bank details emptied again", () => {
  let Page: typeof DonatePage;

  beforeEach(async () => {
    vi.resetModules();
    vi.doMock("@/content/donate", async (importOriginal) => {
      const mod = await importOriginal<typeof import("@/content/donate")>();
      return { donate: { ...mod.donate, pending: { stripePaymentLink: "", bankDetails: null } } };
    });
    Page = (await import("@/app/donate/page")).default;
  });

  afterEach(() => {
    vi.doUnmock("@/content/donate");
    vi.resetModules();
  });

  it("shows the UK fallback text and a single /support button, no card link, no <dl> (Req 12.3, 12.5)", () => {
    const { container } = render(<Page />);
    expect(screen.getByText(donate.uk.fallbackText)).toBeInTheDocument();
    expect(donate.uk.fallbackText).toMatch(/donations team/);
    const support = screen.getByRole("link", { name: donate.uk.fallbackButtonLabel });
    expect(support).toHaveAttribute("href", "/support");

    expect(screen.queryByRole("link", { name: donate.uk.stripeLabel })).toBeNull();
    expect(screen.queryByText(donate.uk.intro)).toBeNull();
    expect(container.querySelector("dl")).toBeNull();
    expect(screen.queryAllByRole("button", { name: /^Copy/ })).toHaveLength(0);
    expect(screen.queryByText(donate.uk.referenceInstruction)).toBeNull();
    expect(container.querySelector("form, input")).toBeNull();
  });
});

describe("/donate with a three-field bank group and the funder acknowledgement filled", () => {
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

  it("renders only the three core rows when iban / bic are absent (Req 12.4)", () => {
    const { container } = render(<Page />);
    expect(screen.getByRole("link", { name: /Donate by card/ })).toHaveAttribute("href", STRIPE);
    const dl = container.querySelector("dl")!;
    expect(Array.from(dl.querySelectorAll("dt")).map((d) => d.textContent)).toEqual([
      "Account name",
      "Sort code",
      "Account number",
    ]);
    expect(screen.getAllByRole("button", { name: /^Copy / })).toHaveLength(3);
    expect(screen.queryByText("IBAN")).toBeNull();
    expect(screen.queryByText("BIC")).toBeNull();
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
