"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { site } from "@/content/site";
import { currentNavHref } from "@/lib/nav";
import { MobileMenu } from "./MobileMenu";

// Top_Nav (Req 1.2 to 1.7, 15.6). Thin client component: the only reason it
// is a client component is `usePathname()`, which feeds the pure
// `currentNavHref` mapping so exactly one link carries `aria-current="page"`
// and the underline. The HTML is still statically rendered.
//
// Bar order (left to right, matching Tab order): Home wordmark, inline list of
// the six text links (hidden below `md`, shown with no JS via `.no-js
// .nav-inline`), the Donate_CTA, then the MobileMenu button (below `md`). The
// Home link and Donate_CTA therefore stay visible outside the collapsible
// region at every width (1.6).

const DONATE_HREF = "/donate";

const LINK_BASE =
  "inline-block px-1 py-2 font-mono text-sm uppercase tracking-wider text-ink hover:text-ochre-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nile-800";
const CURRENT = "underline decoration-2 underline-offset-4";

// Donate_CTA: the only link with a fill or border (1.3). Fill and border are
// kept on hover, the fill darkens.
const DONATE_CTA =
  "inline-block border border-ink bg-ochre-500 px-4 py-2 font-mono text-sm uppercase tracking-wider text-sand-50 hover:bg-ochre-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nile-800";

export function TopNav() {
  const pathname = usePathname();
  const current = currentNavHref(pathname ?? "");

  const textLinks = site.nav.filter((item) => item.href !== DONATE_HREF);
  const donate = site.nav.find((item) => item.href === DONATE_HREF);

  return (
    <nav aria-label="Primary" className="flex items-center justify-between gap-4 px-4 py-3 md:px-8">
      <Link
        href="/"
        aria-current={current === "/" ? "page" : undefined}
        className={`font-display text-lg font-bold tracking-tight text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nile-800 ${
          current === "/" ? CURRENT : ""
        }`}
      >
        {site.name}
      </Link>

      <ul className="nav-inline hidden md:flex items-center gap-5">
        {textLinks.map((item) => {
          const isCurrent = current === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={isCurrent ? "page" : undefined}
                className={`${LINK_BASE} ${isCurrent ? CURRENT : ""}`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="flex items-center gap-3">
        {donate && (
          <Link
            href={donate.href}
            aria-current={current === donate.href ? "page" : undefined}
            className={`${DONATE_CTA} ${current === donate.href ? CURRENT : ""}`}
          >
            {donate.label}
          </Link>
        )}
        <MobileMenu items={site.nav} current={current} />
      </div>
    </nav>
  );
}
