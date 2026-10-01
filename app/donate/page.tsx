import Image from "next/image";

import { FILLED_BUTTON, OUTLINED_BUTTON, UkPanel } from "@/components/donate/UkPanel";
import { ExternalLink } from "@/components/layout/ExternalLink";
import { donate } from "@/content/donate";
import { site } from "@/content/site";
import { pageMetadata } from "@/lib/metadata";
import { present } from "@/lib/pending";
import type { ImageRef } from "@/lib/types";

// Donate page (Req 12). Link-out only: no form, no card or bank input, no
// payment handling on the Site (12.9). Every heading, tagline, label and URL
// comes from content/donate.ts (12.1).
//
// Layout: two panels in a `grid md:grid-cols-2` — US first so it sits on the
// left at >= 768 px and on top below that (12.1). Both statements follow (12.6,
// 12.7); the CPF / British Council funder block renders only when the single
// `site.pending.funderAcknowledgement` Placeholder is present, otherwise
// nothing at all — no wrapper, heading, or spacing (12.8, 17.5, 17.6, design
// Property 6).
export const metadata = pageMetadata("donate", "/donate");

const H2 = "font-display text-2xl font-bold tracking-tight md:text-3xl";
const PANEL = "flex flex-col gap-6 border border-ink p-6 md:p-8";

const MAIL_LINK =
  "underline decoration-2 underline-offset-4 hover:text-ochre-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nile-800";

export default function DonatePage() {
  const { us, uk, statements } = donate;
  const funder = site.pending.funderAcknowledgement;
  const donationsEmail = site.pending.contactEmails.donations;

  return (
    <article className="mx-auto max-w-5xl px-4 py-16 md:py-24">
      <header>
        <p className="kicker">Support the film</p>
        <h1 className="mt-4 font-display text-4xl font-bold tracking-tight md:text-6xl">Donate</h1>
      </header>

      <div className="perf-seam mt-12" aria-hidden="true" />

      <div className="mt-12 grid gap-8 md:grid-cols-2">
        {/* Req 12.2: United States — PayPal primary, SIMA secondary, both new tab. */}
        <section aria-labelledby="donate-us" className={PANEL}>
          <h2 id="donate-us" className={H2}>
            {us.title}
          </h2>
          <p className="text-lg leading-relaxed">{us.tagline}</p>
          <div className="mt-auto flex flex-wrap gap-3">
            <ExternalLink href={us.primary.href} className={FILLED_BUTTON}>
              {us.primary.label}
            </ExternalLink>
            <ExternalLink href={us.secondary.href} className={OUTLINED_BUTTON}>
              {us.secondary.label}
            </ExternalLink>
          </div>
        </section>

        {/* Req 12.3–12.5, 12.12: United Kingdom & elsewhere — decision tree in UkPanel. */}
        <section aria-labelledby="donate-uk" className={PANEL}>
          <h2 id="donate-uk" className={H2}>
            {uk.title}
          </h2>
          <UkPanel />
        </section>
      </div>

      {/* Req 12.6 then 12.7, in that order, below both panels; then the
          donations-inbox line (address from the one contactEmails map). */}
      <div className="mt-12 flex max-w-prose flex-col gap-4 text-base leading-relaxed text-nile-800">
        <p>{statements.notForProfit}</p>
        <p>{statements.notACharity}</p>
        <p>
          {donate.contactLine}{" "}
          <a href={`mailto:${donationsEmail}`} className={MAIL_LINK}>
            {donationsEmail}
          </a>
          .
        </p>
      </div>

      {/* Req 12.8, 17.5, 17.6: funder acknowledgement iff present; logo iff present. */}
      {present(funder) ? (
        <aside aria-label="Funder acknowledgement" className="mt-12 flex flex-wrap items-center gap-6 border-t border-ink pt-8">
          {funder.logo ? <FunderLogo logo={funder.logo} /> : null}
          <p className="max-w-prose text-base leading-relaxed">{funder.wording}</p>
        </aside>
      ) : null}
    </article>
  );
}

// Logo via next/image with an explicit `sizes` (Req 13.14, 19.4). With
// intrinsic dimensions it renders at its natural ratio; otherwise it fits a
// fixed 10rem x 4rem box.
function FunderLogo({ logo }: { logo: ImageRef }) {
  const sized = logo.width !== undefined && logo.height !== undefined;
  if (sized) {
    return (
      <Image
        src={logo.src}
        alt={logo.alt}
        width={logo.width}
        height={logo.height}
        sizes="160px"
        className="h-16 w-auto"
      />
    );
  }
  return (
    <span className="relative block h-16 w-40">
      <Image src={logo.src} alt={logo.alt} fill sizes="160px" className="object-contain object-left" />
    </span>
  );
}
