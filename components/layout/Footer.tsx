import Link from "next/link";

import { events } from "@/content/events";
import { site } from "@/content/site";
import { isPending, present } from "@/lib/pending";
import type { SiteContent } from "@/lib/types";
import { ExternalLink } from "./ExternalLink";

// Footer (Req 1.8, 17.1 to 17.3, 17.8). Server component.
//
// `<nav aria-label="Footer">` links to every Page including `/museum` and
// `/privacy`; Instagram and LinkedIn icon links go through ExternalLink; the
// legal block shows the three company registration fields only when all three
// are present, otherwise the fixed fallback line. `new Date()` runs at build
// time because every route is static (17.3).

type CompanyRegistration = SiteContent["pending"]["companyRegistration"];

type FooterProps = {
  /** Defaults to the site Placeholder; injectable for tests. */
  companyRegistration?: CompanyRegistration;
};

const FOOTER_LINKS: { label: string; href: string }[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "What's at Stake", href: "/at-stake" },
  { label: "The Documentary", href: "/film" },
  { label: "Impact Campaign", href: "/campaign" },
  { label: events.cities.cairo.name, href: "/campaign/cairo" },
  { label: events.cities.london.name, href: "/campaign/london" },
  { label: events.cities.nyc.name, href: "/campaign/nyc" },
  { label: "Virtual Museum", href: "/museum" },
  { label: "Team", href: "/team" },
  { label: "Support", href: "/support" },
  { label: "Donate", href: "/donate" },
  { label: "Privacy", href: "/privacy" },
];

const FALLBACK_LEGAL = "Returning Sands CIC · Company details to follow";

// Grouped Placeholders are all-or-nothing (17.1, 17.2): a partially filled
// registration is treated as empty so no single field ever leaks on its own.
function allFilled(
  reg: CompanyRegistration,
): reg is { name: string; number: string; address: string } {
  return present(reg) && !isPending(reg.name) && !isPending(reg.number) && !isPending(reg.address);
}

const LINK =
  "font-mono text-xs uppercase tracking-wider text-ink hover:text-ochre-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nile-800";

export function Footer({ companyRegistration = site.pending.companyRegistration }: FooterProps) {
  const year = new Date().getUTCFullYear();

  return (
    <div className="border-t border-ink/20 px-4 py-10 md:px-8">
      <nav aria-label="Footer">
        <ul className="flex flex-wrap gap-x-5 gap-y-2">
          {FOOTER_LINKS.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className={LINK}>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <ul className="mt-6 flex items-center gap-4">
        <li>
          <ExternalLink
            href={site.social.instagram}
            aria-label="Instagram (opens in new tab)"
            className="inline-flex h-11 w-11 items-center justify-center text-ink hover:text-ochre-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nile-800"
          >
            <svg
              aria-hidden="true"
              focusable="false"
              viewBox="0 0 24 24"
              width="22"
              height="22"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" />
            </svg>
          </ExternalLink>
        </li>
        <li>
          <ExternalLink
            href={site.social.linkedin}
            aria-label="LinkedIn (opens in new tab)"
            className="inline-flex h-11 w-11 items-center justify-center text-ink hover:text-ochre-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nile-800"
          >
            <svg
              aria-hidden="true"
              focusable="false"
              viewBox="0 0 24 24"
              width="22"
              height="22"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 0 1 4 0v4M12 10v7" />
            </svg>
          </ExternalLink>
        </li>
      </ul>

      <div className="mt-8 font-mono text-xs leading-relaxed text-ink/80">
        <p>
          {allFilled(companyRegistration)
            ? `${companyRegistration.name} · Company no. ${companyRegistration.number} · ${companyRegistration.address}`
            : FALLBACK_LEGAL}
        </p>
        <p>© {year} Returning Sands CIC</p>
      </div>
    </div>
  );
}
