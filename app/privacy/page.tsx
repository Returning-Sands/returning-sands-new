import Link from "next/link";

import { museum } from "@/content/museum";
import { site } from "@/content/site";
import { pageMetadata } from "@/lib/metadata";
import { present } from "@/lib/pending";

// Privacy page (Req 17.9, 17.11, 18.3, 18.4). Linked from the Footer on every
// Page (17.8); has no Top_Nav link (lib/nav.ts). Indexable (lib/routes.ts).
export const metadata = pageMetadata("privacy", "/privacy");

// The copy below is legal boilerplate describing how the Site itself behaves
// (analytics, cookies, email handling, controller), not editorial content, so
// it lives here rather than in a Content_File. The one editorial sentence, how
// Admission_Ticket emails are used, is read from `museum.ticket.privacyNote`
// so the ticket and this page can never disagree (17.9). The Email_Provider
// name is the only Placeholder-dependent piece: present -> "stored with
// {provider}", pending -> the to-be-confirmed sentence, never a blank (17.11).
export const PRIVACY_COPY = {
  title: "Privacy",
  kicker: "How we handle your data",
  controller:
    "This website is run by Returning Sands CIC, which is the data controller for any information collected here.",
  headings: {
    analytics: "Analytics",
    cookies: "Cookies",
    email: "Email signup",
    contact: "Contact",
  },
  analytics:
    "The Site uses cookie-less Vercel Analytics to count page views. It sets no tracking cookies, builds no visitor profiles, and shares no personal data with advertisers, so there is no consent banner to click through.",
  cookies: "The Site sets no cookies of its own, and stores nothing in your browser's local storage.",
  emailIntro:
    "If you reserve a ticket for the Virtual Museum, we ask for your email address and nothing else.",
  emailUse: museum.ticket.privacyNote,
  providerNamed: (provider: string) =>
    `Emails are stored with ${provider}. You can unsubscribe at any time using the link in any email we send.`,
  providerTbc: "Our email provider is to be confirmed and will be named here.",
  contact: "Questions about this page or your data? Reach the team via our",
  contactLinkLabel: "Support page",
} as const;

const H2 = "font-mono text-sm uppercase tracking-widest text-ochre-600";
const BODY = "mt-6 flex max-w-prose flex-col gap-4 text-lg leading-relaxed";
const LINK_CLASS =
  "underline decoration-2 underline-offset-4 hover:text-ochre-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nile-800";

export default function PrivacyPage() {
  const provider = site.pending.emailProvider;
  const { headings } = PRIVACY_COPY;

  return (
    <article className="mx-auto max-w-3xl px-4 py-16 md:py-24">
      <header>
        <p className="kicker">{PRIVACY_COPY.kicker}</p>
        <h1 className="mt-4 font-display text-4xl font-bold tracking-tight md:text-6xl">{PRIVACY_COPY.title}</h1>
        <p className="mt-6 max-w-prose text-lg leading-relaxed">{PRIVACY_COPY.controller}</p>
      </header>

      <div className="perf-seam mt-12" aria-hidden="true" />

      {/* Req 18.1–18.4: cookie-less analytics, no tracking cookies, no banner. */}
      <section aria-labelledby="privacy-analytics" className="mt-12">
        <h2 id="privacy-analytics" className={H2}>
          {headings.analytics}
        </h2>
        <div className={BODY}>
          <p>{PRIVACY_COPY.analytics}</p>
        </div>
      </section>

      <div className="divider-rule mt-14" aria-hidden="true" />

      {/* Req 18.3: zero cookies / storage set by the Site. */}
      <section aria-labelledby="privacy-cookies" className="mt-14">
        <h2 id="privacy-cookies" className={H2}>
          {headings.cookies}
        </h2>
        <div className={BODY}>
          <p>{PRIVACY_COPY.cookies}</p>
        </div>
      </section>

      <div className="divider-rule mt-14" aria-hidden="true" />

      {/* Req 17.9, 17.11: how Admission_Ticket emails are used; provider name
          iff the Placeholder is populated, otherwise the TBC sentence. */}
      <section aria-labelledby="privacy-email" className="mt-14">
        <h2 id="privacy-email" className={H2}>
          {headings.email}
        </h2>
        <div className={BODY}>
          <p>{PRIVACY_COPY.emailIntro}</p>
          <p>{PRIVACY_COPY.emailUse}</p>
          <p>{present(provider) ? PRIVACY_COPY.providerNamed(provider.provider) : PRIVACY_COPY.providerTbc}</p>
        </div>
      </section>

      <div className="divider-rule mt-14" aria-hidden="true" />

      <section aria-labelledby="privacy-contact" className="mt-14">
        <h2 id="privacy-contact" className={H2}>
          {headings.contact}
        </h2>
        <div className={BODY}>
          <p>
            {PRIVACY_COPY.contact}{" "}
            <Link href="/support" className={LINK_CLASS}>
              {PRIVACY_COPY.contactLinkLabel}
            </Link>
            .
          </p>
        </div>
      </section>
    </article>
  );
}
