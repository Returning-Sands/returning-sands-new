import Link from "next/link";

import { CopyButton } from "@/components/content/CopyButton";
import { ExternalLink } from "@/components/layout/ExternalLink";
import { donate } from "@/content/donate";
import { ukPanelState } from "@/lib/donate";
import { present } from "@/lib/pending";

// "United Kingdom & elsewhere" panel body (Req 12.3, 12.4, 12.5, 12.12, 12.13).
// Server component; the only client code inside is each `CopyButton`.
//
// Three independent branches decided by `ukPanelState` (design Property 8):
//   - Stripe link present      -> `uk.intro` sentence + "Donate by card" ExternalLink
//   - all three bank fields    -> <dl> name / sort code / account number (plus
//                                 IBAN and BIC rows when those optional fields
//                                 are present), each with a CopyButton, then
//                                 the reference line
//   - neither                  -> fallback text + single button to /support
// The heading itself (`uk.title`) is rendered by the page so both panels share
// one <section>/<h2> structure.

const BUTTON =
  "inline-flex min-h-[44px] items-center justify-center px-5 py-2 font-mono text-sm uppercase tracking-wider focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nile-800";
export const FILLED_BUTTON = `${BUTTON} border border-ink bg-ochre-500 text-sand-50 hover:bg-ochre-600`;
export const OUTLINED_BUTTON = `${BUTTON} border border-ink bg-transparent text-ink hover:bg-sand-100`;

export function UkPanel() {
  const { uk, pending } = donate;
  const { showStripe, showBank, showFallback } = ukPanelState(pending.stripePaymentLink, pending.bankDetails);

  // `showBank` guarantees the group is fully populated (lib/donate.ts), so the
  // non-null assertion below is safe; the fields are read once for the rows.
  const bank = showBank ? pending.bankDetails! : null;
  const rows: [string, string][] = [];
  if (bank) {
    rows.push(["Account name", bank.accountName], ["Sort code", bank.sortCode], ["Account number", bank.accountNumber]);
    // Optional extras for donors outside the UK; absent or blank -> no row.
    if (bank.iban !== undefined && present(bank.iban)) rows.push(["IBAN", bank.iban]);
    if (bank.bic !== undefined && present(bank.bic)) rows.push(["BIC", bank.bic]);
  }

  return (
    <div className="flex flex-col gap-6">
      {showStripe ? (
        <>
          <p className="text-lg leading-relaxed">{uk.intro}</p>
          <p>
            <ExternalLink href={pending.stripePaymentLink as string} className={FILLED_BUTTON}>
              {uk.stripeLabel}
            </ExternalLink>
          </p>
        </>
      ) : null}

      {bank ? (
        <>
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-4 border border-ink p-4">
            {rows.map(([term, value]) => (
              // One <div> per pair keeps dt/dd adjacent for assistive tech
              // while letting the grid lay the row out.
              <div key={term} className="contents">
                <dt className="font-mono text-xs uppercase tracking-widest text-nile-700">{term}</dt>
                <dd className="flex flex-wrap items-center justify-between gap-3 m-0">
                  <span className="font-mono text-base font-semibold select-all">{value}</span>
                  <CopyButton value={value} label={term} />
                </dd>
              </div>
            ))}
          </dl>
          <p className="text-base leading-relaxed">{uk.referenceInstruction}</p>
        </>
      ) : null}

      {showFallback ? (
        <>
          <p className="text-lg leading-relaxed">{uk.fallbackText}</p>
          <p>
            <Link href="/support" className={OUTLINED_BUTTON}>
              {uk.fallbackButtonLabel}
            </Link>
          </p>
        </>
      ) : null}
    </div>
  );
}
