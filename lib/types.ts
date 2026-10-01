/**
 * Content model types for every Content_File under `content/`.
 *
 * One exported type per Content_File (Requirement 14.2):
 *   content/site.ts     -> SiteContent
 *   content/events.ts   -> EventsContent
 *   content/team.ts     -> TeamContent
 *   content/partners.ts -> PartnersContent
 *   content/donate.ts   -> DonateContent
 *   content/film.ts     -> FilmContent
 *   content/museum.ts   -> MuseumContent
 *
 * Placeholder values use `Pending<T>` from `lib/pending.ts` (Requirement 14.4).
 * Shapes follow design.md "Data Models" exactly.
 */
import type { Pending } from "./pending";

// ---------------------------------------------------------------------------
// Shared primitives
// ---------------------------------------------------------------------------

/** A static image under `public/`, e.g. `{ src: "/img/ali.jpg", alt: "…" }`. */
export type ImageRef = { src: string; alt: string; width?: number; height?: number };

/** A labelled link rendered as a button (Donate panels). */
export type LinkButton = { label: string; href: string };

/** One Top_Nav / Footer entry; the seven links live in `site.nav` (Req 1.2, 14.1). */
export type NavItem = { label: string; href: string };

/**
 * Every route that has its own SEO title/description in `site.pages` (Req 16.1).
 * The twelve Pages, plus `/privacy`, the noindex `/museum/thanks`, and the 404.
 */
export type PageKey =
  | "home"
  | "about"
  | "atStake"
  | "film"
  | "campaign"
  | "campaignCairo"
  | "campaignLondon"
  | "campaignNyc"
  | "museum"
  | "museumThanks"
  | "team"
  | "support"
  | "donate"
  | "privacy"
  | "notFound";

/**
 * Designer_Asset flags switched via `site.designAssets` (Req 20.5).
 * Each key maps to a fixed path under `public/design/` in `lib/assets.ts`.
 */
export type DesignAssetKey =
  | "stampOval"
  | "passportCover"
  | "passportSpread"
  | "cityStamps"
  | "boardingPass"
  | "admissionTicket"
  | "passportCardFrame"
  | "silhouette"
  | "eventStamps";

// ---------------------------------------------------------------------------
// content/site.ts — SiteContent
// ---------------------------------------------------------------------------

/** Keys of the contact-email Placeholder group (defaults from Req 11.2). */
export type ContactKey = "general" | "yusef" | "paris" | "camilla" | "cillian";

/** A named contact on `/support`; `confirmed` false routes mail to the general address (Req 11.10). */
export type Contact = { key: ContactKey; name: string; role: string; confirmed: boolean };

/** Provider-agnostic Admission_Ticket form config (Req 9.3). */
export type EmailProviderConfig = {
  provider: string;
  actionUrl: string;
  hiddenFields: Record<string, string>;
  emailFieldName: string;
};

export type SiteContent = {
  name: string; // "Returning Sands"
  arabicName: string; // "عودة الرمال"
  kicker: string; // "A FILM & IMPACT CAMPAIGN"
  description: string; // <= 160 chars, italic home line (2.1)
  url: "https://returningsands.org";
  nav: NavItem[]; // the seven links in order (1.2)
  social: { instagram: string; linkedin: string };
  about: { aboutUs: string[]; mission: string[]; goals: string[] }; // paragraphs; goals exactly 5 (3.4)
  atStake: {
    quote: string;
    quoteBy: string;
    body: string[];
    stat: { value: string; label: string };
    images: ImageRef[];
  };
  campaign: { museumTeaser: string; donateLine: string };
  support: { contacts: Contact[] }; // general first, then named (11.2)
  pages: Record<PageKey, { title: string; description: string }>; // SEO per route (16.1)
  designAssets: Record<DesignAssetKey, boolean>; // 20.5 flags
  instagramGrid?: { src: string; alt: string; href: string }[]; // <= 12 (22.2)
  pending: {
    campaignOverview: Pending<string>;
    emailProvider: Pending<EmailProviderConfig>;
    funderAcknowledgement: Pending<{ wording: string; logo?: ImageRef }>;
    companyRegistration: Pending<{ name: string; number: string; address: string }>;
    contactEmails: Record<ContactKey, string>; // defaults from 11.2
  };
};

// ---------------------------------------------------------------------------
// content/events.ts — EventsContent
// ---------------------------------------------------------------------------

export type City = "cairo" | "london" | "nyc";

/** `YYYY-MM-DD`. */
export type IsoDate = `${number}-${number}-${number}`;

/** Single day, inclusive range, or `null` when TBA. */
export type EventDate = IsoDate | { start: IsoDate; end: IsoDate } | null;

export type Event = {
  id: string;
  title: string;
  stampLabel: string;
  city: City;
  venue: string;
  date: EventDate;
  dateDisplay: string;
  status?: "upcoming" | "past"; // optional override (7.10)
  blurb: string;
  sponsorLine?: string;
  images?: ImageRef[]; // <= 6, alt non-empty
  externalLink?: { label: string; href: string };
  airportCodes: { from: string; to: string }; // IATA, 3 upper-case letters
};

export type EventsContent = {
  cities: Record<City, { name: string; framing: string; iata: string }>; // framing <= 200 chars (7.2)
  events: Event[]; // the seven (7.6)
  pending: { exclusiveShowcaseDate: Pending<string>; cultureHouseDay: Pending<string> };
};

// ---------------------------------------------------------------------------
// content/team.ts — TeamContent
// ---------------------------------------------------------------------------

export type TeamGroup = "Producers & Co-Founders" | "Director & Executive Producer" | "Core Team";

export type TeamMember = {
  name: string;
  role: string;
  group: TeamGroup;
  base?: string;
  bio?: string;
  photo?: string;
  order: number;
};

export type TeamContent = { groups: TeamGroup[]; members: TeamMember[]; pending: Record<string, never> };

// ---------------------------------------------------------------------------
// content/partners.ts — PartnersContent
// ---------------------------------------------------------------------------

export type Partner = {
  name: string;
  logo?: ImageRef;
  href?: string;
  permission: "granted" | "pending" | "not-required";
};

export type PartnersContent = { heading: string; partners: Partner[]; pending: Record<string, never> };

// ---------------------------------------------------------------------------
// content/donate.ts — DonateContent
// ---------------------------------------------------------------------------

export type DonateContent = {
  us: { title: string; tagline: string; primary: LinkButton; secondary: LinkButton };
  uk: {
    title: string;
    stripeLabel: string;
    fallbackText: string;
    fallbackButtonLabel: string;
    referenceInstruction: string;
  };
  statements: { notForProfit: string; notACharity: string };
  pending: {
    stripePaymentLink: Pending<string>;
    bankDetails: Pending<{ accountName: string; sortCode: string; accountNumber: string }>;
  };
};

// ---------------------------------------------------------------------------
// content/film.ts — FilmContent
// ---------------------------------------------------------------------------

export type FilmContent = {
  headings: {
    logline: string;
    about: string;
    director: string;
    protagonist: string;
    backing: string;
    trailer: string;
  };
  director: { name: string; credential: string; note: string }; // note = Old_Site director's note (5.10)
  protagonist: { name: string; bio: string; image: ImageRef }; // ali.jpg (5.9)
  backing: { name: string; detail: string }[]; // 2 items (5.6)
  trailerComingSoonText: string;
  // `trailerUrl` is defined here and only here (14.3); Home imports it from film.ts.
  pending: { logline: Pending<string>; aboutFilm: Pending<string>; trailerUrl: Pending<string> };
};

// ---------------------------------------------------------------------------
// content/museum.ts — MuseumContent
// ---------------------------------------------------------------------------

export type MuseumContent = {
  intro: string[]; // 1–3 paragraphs
  whatItIs: string[];
  collections: { title: string; description: string }[]; // 3–8, title <= 60, desc <= 400 (8.3)
  roadmap: { label: string; description: string; dateText?: string; current?: boolean }[]; // 3–8, exactly one current (8.6)
  ticket: {
    label: string;
    buttonLabel: "Reserve my ticket";
    privacyNote: string;
    privacyNoteProviderTbc: string;
  };
  thanks: { sentence: string; backLabel: string };
  pending: { workOfAmer: Pending<string> };
};
