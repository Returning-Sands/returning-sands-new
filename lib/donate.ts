/**
 * UK donate panel decision (Requirements 12.3, 12.4, 12.5, 12.12; design
 * "Donate and contact: link-out only", Property 8).
 *
 * Pure: no React, no content import. `UkPanel` feeds it the two Placeholders
 * from `content/donate.ts` and renders each branch independently:
 *
 * - `showStripe`   iff the Stripe Payment Link is present (12.3)
 * - `showBank`     iff ALL THREE core bank fields are present (12.4). A
 *                  partially filled group counts as empty (12.12) — note this
 *                  is stricter than `present(bank)`, which is true when ANY
 *                  field is set. The optional `iban` / `bic` extras never
 *                  influence the decision; they are rendered only when present.
 * - `showFallback` iff neither of the above (12.5)
 */
import { present, type Pending } from "./pending";
import type { BankDetails } from "./types";

export type { BankDetails };

export type UkPanelState = { showStripe: boolean; showBank: boolean; showFallback: boolean };

export function ukPanelState(stripe: Pending<string>, bank: Pending<BankDetails>): UkPanelState {
  const showStripe = present(stripe);
  const showBank =
    present(bank) && present(bank.accountName) && present(bank.sortCode) && present(bank.accountNumber);
  return { showStripe, showBank, showFallback: !showStripe && !showBank };
}

/**
 * Optional fields of the bank group. Absent or empty, they are not reported as
 * "partially filled" (lib/validate.ts, lib/summary.ts) and add no row.
 */
export const OPTIONAL_BANK_FIELDS: readonly (keyof BankDetails)[] = ["iban", "bic"];
