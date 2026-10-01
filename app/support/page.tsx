import Link from "next/link";

import { FILLED_BUTTON, OUTLINED_BUTTON } from "@/components/donate/UkPanel";
import { ExternalLink } from "@/components/layout/ExternalLink";
import { PartnerTile } from "@/components/support/PartnerTile";
import { partners } from "@/content/partners";
import { site } from "@/content/site";
import { generalMailto, mailtoFor } from "@/lib/contacts";
import { pageMetadata } from "@/lib/metadata";

// Support page (Req 11). Server component; link-out only.
//
// Order is load-bearing (11.1): the <h1> is the only thing above the two CTAs,
// "Get in Touch" (mailto: general) then "Support Us" (/donate), and nothing
// interactive precedes them. Then three sections, each labelled by its <h2>:
//   - Contact: one mailto: per entry in `site.support.contacts` order — general
//     first, then the named contacts — label = name + role; an unconfirmed
//     address routes to the general inbox via `mailtoFor` (11.2, 11.10)
//   - Follow: Instagram and LinkedIn ExternalLinks, each with a decorative
//     icon AND a visible platform name (11.4)
//   - Partners & Supporters: <h2> from content + 2 / 4 column grid of equal
//     height PartnerTiles in file order; the whole section is omitted when the
//     list is empty so no empty grid or orphan heading renders (11.5, 11.12)
export const metadata = pageMetadata("support", "/support");

const PAGE_HEADING = "Support & Contact";

const H2 = "font-mono text-sm uppercase tracking-widest text-ochre-600";
// `inline-block` (not flex) so the " — " between name and role survives as
// real text in the link's accessible name.
const TEXT_LINK =
  "inline-block min-h-[44px] py-2 text-ink underline underline-offset-4 hover:text-ochre-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nile-800";


export default function SupportPage() {
  const emails = site.pending.contactEmails;
  const hasPartners = partners.partners.length > 0;

  return (
    <article className="mx-auto max-w-6xl px-4 py-16 md:py-24">
      <h1 className="font-display text-4xl font-bold tracking-tight md:text-6xl">{PAGE_HEADING}</h1>

      {/* Req 11.1: first interactive elements, in this order. */}
      <div className="mt-8 flex flex-wrap gap-3">
        <a href={generalMailto(emails)} className={FILLED_BUTTON}>
          Get in Touch
        </a>
        <Link href="/donate" className={OUTLINED_BUTTON}>
          Support Us
        </Link>
      </div>

      <div className="perf-seam mt-12" aria-hidden="true" />

      {/* Req 11.2, 11.10 */}
      <section aria-labelledby="contact-heading" className="mt-12">
        <h2 id="contact-heading" className={H2}>
          Contact
        </h2>
        <ul className="mt-6 flex list-none flex-col gap-2 p-0">
          {site.support.contacts.map((contact) => (
            <li key={contact.key}>
              <a href={mailtoFor(contact, emails)} className={TEXT_LINK}>
                <span className="font-semibold">{contact.name}</span>
                {" — "}
                <span className="text-nile-700">{contact.role}</span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      {/* Req 11.4 */}
      <section aria-labelledby="follow-heading" className="mt-16">
        <h2 id="follow-heading" className={H2}>
          Follow
        </h2>
        <ul className="mt-6 flex list-none flex-wrap gap-x-8 gap-y-2 p-0">
          <li>
            <ExternalLink href={site.social.instagram} className={TEXT_LINK}>
              <InstagramIcon />
              Instagram
            </ExternalLink>
          </li>
          <li>
            <ExternalLink href={site.social.linkedin} className={TEXT_LINK}>
              <LinkedInIcon />
              LinkedIn
            </ExternalLink>
          </li>
        </ul>
      </section>

      {/* Req 11.5, 11.11, 11.12 */}
      {hasPartners ? (
        <section aria-labelledby="partners-heading" className="mt-16">
          <h2 id="partners-heading" className={H2}>
            {partners.heading}
          </h2>
          <ul className="mt-6 grid list-none grid-cols-2 gap-4 p-0 md:grid-cols-4">
            {partners.partners.map((partner) => (
              <li key={partner.name} className="flex">
                <PartnerTile partner={partner} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  );
}

// Decorative platform icons; the visible text next to each is the label (11.4).
const ICON = {
  "aria-hidden": "true",
  focusable: "false",
  viewBox: "0 0 24 24",
  width: "20",
  height: "20",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "1.75",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  className: "me-2 inline-block align-text-bottom",
} as const;

function InstagramIcon() {
  return (
    <svg {...ICON}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg {...ICON}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 0 1 4 0v4M12 10v7" />
    </svg>
  );
}
