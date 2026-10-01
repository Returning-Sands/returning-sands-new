import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

import PrivacyPage, { PRIVACY_COPY, metadata } from "@/app/privacy/page";
import { museum } from "@/content/museum";
import { site } from "@/content/site";

// Privacy page (Req 17.8, 17.9, 17.11, 18.3, 18.4). Rendered once against the
// real Content_File (Email_Provider = Web3Forms, live) and once with the
// provider emptied again via `vi.doMock`, so both branches of 17.9/17.11 are
// exercised.

afterEach(cleanup);

const WEB3FORMS = "Web3Forms (relayed to info@returningsands.org)";

describe("/privacy with the real content (Email_Provider populated)", () => {
  it("uses the privacy metadata and canonical (Req 16.1, 16.2)", () => {
    expect(metadata.title).toBe(site.pages.privacy.title);
    expect(metadata.description).toBe(site.pages.privacy.description);
    expect(metadata.alternates?.canonical).toBe("https://returningsands.org/privacy");
  });

  it("renders the h1 and the four section h2s in order", () => {
    render(<PrivacyPage />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Privacy");
    const h2s = screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent);
    expect(h2s).toEqual(["Analytics", "Cookies", "Email signup", "Contact"]);
  });

  it("states cookie-less analytics, no tracking cookies, and names the controller (Req 17.9, 18.3, 18.4)", () => {
    const { container } = render(<PrivacyPage />);
    const text = container.textContent ?? "";
    expect(text).toContain("cookie-less");
    expect(text).toContain("no tracking cookies");
    expect(text).toContain("Vercel Analytics");
    expect(text).toContain("Returning Sands CIC");
  });

  it("explains how Admission_Ticket emails are used with the same sentence as the ticket (Req 17.9)", () => {
    render(<PrivacyPage />);
    expect(screen.getByText(museum.ticket.privacyNote)).toBeInTheDocument();
    expect(museum.ticket.privacyNote).toMatch(/Virtual Museum opens/);
    expect(museum.ticket.privacyNote).toMatch(/nothing else/);
  });

  it("names the relay provider and the consent record, and drops the to-be-confirmed wording (Req 17.9, 17.11)", () => {
    const { container } = render(<PrivacyPage />);
    expect(site.pending.emailProvider).toMatchObject({ provider: WEB3FORMS });
    const text = container.textContent ?? "";
    expect(text).toContain(`Sign-ups are relayed by ${WEB3FORMS}; the email we receive is the consent record.`);
    expect(screen.getByText(PRIVACY_COPY.providerNamed(WEB3FORMS))).toBeInTheDocument();
    expect(text).not.toContain("to be confirmed");
    expect(text).not.toContain("stored with");
    // No paragraph is left empty where the name would have gone.
    for (const p of Array.from(container.querySelectorAll("p"))) {
      expect(p.textContent?.trim()).not.toBe("");
    }
  });

  it("links to /support from the Contact section (Req 17.8 counterpart)", () => {
    render(<PrivacyPage />);
    const link = screen.getByRole("link", { name: PRIVACY_COPY.contactLinkLabel });
    expect(link).toHaveAttribute("href", "/support");
    const contactHeading = screen.getByRole("heading", { level: 2, name: "Contact" });
    expect(contactHeading.compareDocumentPosition(link) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("contains no form, input, or consent banner (Req 18.3, 18.4)", () => {
    const { container } = render(<PrivacyPage />);
    expect(container.querySelector("form, input, dialog, [role='dialog']")).toBeNull();
  });
});

describe("/privacy with the Email_Provider emptied again", () => {
  let Page: typeof PrivacyPage;

  beforeEach(async () => {
    vi.resetModules();
    vi.doMock("@/content/site", async (importOriginal) => {
      const mod = await importOriginal<typeof import("@/content/site")>();
      return {
        site: { ...mod.site, pending: { ...mod.site.pending, emailProvider: null } },
      };
    });
    Page = (await import("@/app/privacy/page")).default;
  });

  afterEach(() => {
    vi.doUnmock("@/content/site");
    vi.resetModules();
  });

  it("shows the provider-TBC sentence and never a provider name or 'relayed by' gap (Req 17.11)", () => {
    const { container } = render(<Page />);
    expect(screen.getByText(PRIVACY_COPY.providerTbc)).toBeInTheDocument();
    const text = container.textContent ?? "";
    expect(text).toContain("to be confirmed");
    expect(text).not.toContain("relayed by");
    expect(text).not.toContain("Web3Forms");
    for (const p of Array.from(container.querySelectorAll("p"))) {
      expect(p.textContent?.trim()).not.toBe("");
    }
    // The unaffected sections are unchanged.
    expect(text).toContain("cookie-less");
    expect(screen.getByText(museum.ticket.privacyNote)).toBeInTheDocument();
  });
});
