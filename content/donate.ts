import type { DonateContent } from "@/lib/types";

/**
 * Donate page copy and links (Req 12). The site performs no payment handling;
 * every route links out to SIMA, PayPal, Stripe, or bank transfer.
 *
 * Placeholders: `stripePaymentLink` (Req 12.3) and `bankDetails` (Req 12.4/12.12),
 * both filled on 2026-10-01 from the Old_Site (Stripe Payment Link where the
 * donor chooses the amount; Co-operative Bank account). The UK panel shows
 * `uk.fallbackText` only while both are pending again.
 *
 * REVIEW NOTES:
 * - `uk.stripeLabel` reads "Donate by card" (not "Donate in GBP") because the
 *   Stripe link accepts GBP, EUR and other currencies.
 * - `contactLine` is completed with `site.pending.contactEmails.donations`.
 */
export const donate: DonateContent = {
  us: {
    title: "United States",
    tagline:
      "US donations are tax-deductible to the fullest extent of the law via our fiscal sponsor, SIMA Studios (501(c)(3)).",
    primary: {
      label: "Donate in USD",
      href: "https://www.paypal.com/donate/?hosted_button_id=CU7JMGF3GWH2J",
    },
    secondary: {
      label: "Our SIMA page",
      href: "https://simastudios.org/fiscal-sponsorship/returning-sands/",
    },
  },

  uk: {
    title: "United Kingdom & elsewhere",
    intro:
      "Give by card, Apple Pay or Google Pay in the amount of your choice, or send a bank transfer using the details below.",
    stripeLabel: "Donate by card",
    fallbackText:
      "Card payments and bank transfer details are coming shortly. In the meantime, email the donations team and we'll send you the details directly.",
    fallbackButtonLabel: "Email us",
    referenceInstruction: "Please use your name as the payment reference.",
  },

  statements: {
    notForProfit: "Returning Sands CIC is entirely not-for-profit; all funds are reinvested in the mission.",
    notACharity:
      "Returning Sands CIC is a Community Interest Company, not a registered charity. Gift Aid is not available on donations.",
  },

  contactLine: "Questions about giving? Email",

  pending: {
    stripePaymentLink: "https://donate.stripe.com/bJeaEW9qC7Kudizgvw8EM00",
    bankDetails: {
      accountName: "Returning Sands Community Interest Company",
      sortCode: "08-92-99",
      accountNumber: "67540396",
      iban: "GB83 CPBK 0892 9967 5403 96",
      bic: "CPBKGB22",
    },
  },
};
