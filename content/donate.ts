import type { DonateContent } from "@/lib/types";

/**
 * Donate page copy and links (Req 12). The site performs no payment handling;
 * every route links out to SIMA, PayPal, Stripe, or bank transfer.
 *
 * Placeholders: `stripePaymentLink` (Req 12.3) and `bankDetails` (Req 12.4/12.12).
 * The UK panel shows `uk.fallbackText` while both are pending.
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
    stripeLabel: "Donate in GBP",
    fallbackText:
      "Card payments in GBP and bank transfer details are coming shortly. In the meantime, email us and we'll send you the details directly.",
    fallbackButtonLabel: "Email us",
    referenceInstruction: "Please use your name as the payment reference.",
  },

  statements: {
    notForProfit: "Returning Sands CIC is entirely not-for-profit; all funds are reinvested in the mission.",
    notACharity:
      "Returning Sands CIC is a Community Interest Company, not a registered charity. Gift Aid is not available on donations.",
  },

  pending: {
    stripePaymentLink: "",
    bankDetails: null,
  },
};
