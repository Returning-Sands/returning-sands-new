/**
 * Build-time content validation (design.md "Build-time validation").
 *
 * Hand-rolled semantic rules on top of the TypeScript shapes in `lib/types.ts`.
 * `tsc --noEmit` already catches shape errors; this module adds the cross-field
 * and length rules with owner-friendly wording. Every error line is formatted
 *
 *   [content/<file>.ts] <item id or position>: field "<name>" <reason>
 *
 * `validateAll()` collects every error across the seven Content_Files and throws
 * a single `Error` listing them all; it returns `{ warnings }` for partially
 * filled grouped Placeholders, which are not errors (the group is treated as
 * empty by `isPending`). It runs from `app/layout.tsx` at module load (once per
 * `next build`) and from the unit tests.
 *
 * Each per-file validator is exported so property tests can target it with
 * arbitrary content. The only impurity is `fs.existsSync` for image and
 * Designer_Asset paths, resolved against `process.cwd()`.
 */
import { existsSync } from "node:fs";
import path from "node:path";

import { site as realSite } from "@/content/site";
import { events as realEvents } from "@/content/events";
import { team as realTeam } from "@/content/team";
import { partners as realPartners } from "@/content/partners";
import { donate as realDonate } from "@/content/donate";
import { film as realFilm } from "@/content/film";
import { museum as realMuseum } from "@/content/museum";

import { DESIGN_ASSET_PATHS } from "./assetPaths";
import { OPTIONAL_BANK_FIELDS } from "./donate";
import { isPending } from "./pending";
import type {
  City,
  DesignAssetKey,
  DonateContent,
  EventDate,
  EventsContent,
  FilmContent,
  ImageRef,
  MuseumContent,
  PartnersContent,
  SiteContent,
  TeamContent,
} from "./types";

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

/** The seven Content_Files, bundled so tests can validate a mutated copy. */
export type ContentSet = {
  site: SiteContent;
  events: EventsContent;
  team: TeamContent;
  partners: PartnersContent;
  donate: DonateContent;
  film: FilmContent;
  museum: MuseumContent;
};

export const CITIES: readonly City[] = ["cairo", "london", "nyc"];
export const PARTNER_PERMISSIONS = ["granted", "pending", "not-required"] as const;
export const EVENT_STATUSES = ["upcoming", "past"] as const;

/** Collection titles the Museum page must always carry (Requirement 8.3). */
export const REQUIRED_COLLECTION_TITLES = ["Collections", "Archival materials", "Lost artefacts room"] as const;

/**
 * Terms that would commit the Virtual Museum to a delivery technology
 * (Requirement 8.8). Matched on word boundaries, case-insensitively, except
 * "AR", which is only banned as the upper-case acronym so ordinary prose is
 * not flagged.
 */
export const BANNED_MUSEUM_TERMS = ["3D", "VR", "virtual reality", "augmented reality", "metaverse"] as const;

const BANNED_TERM_PATTERNS: { term: string; re: RegExp }[] = [
  ...BANNED_MUSEUM_TERMS.map((term) => ({
    term,
    re: new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+")}\\b`, "i"),
  })),
  { term: "AR", re: /\bAR\b/ },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type ContentFile = "site" | "events" | "team" | "partners" | "donate" | "film" | "museum";

/** Formats one error line in the documented shape. */
function err(file: ContentFile, item: string, field: string, reason: string): string {
  return `[content/${file}.ts] ${item}: field "${field}" ${reason}`;
}

function isBlank(v: unknown): boolean {
  return typeof v !== "string" || v.trim() === "";
}

function len(v: string): number {
  return Array.from(v.trim()).length;
}

function quote(v: unknown): string {
  return JSON.stringify(v === undefined ? null : v);
}

/** Resolves a `public/`-relative URL path (e.g. `/img/ali.jpg`) to the filesystem. */
function publicFileExists(src: string): boolean {
  if (isBlank(src) || !src.startsWith("/")) return false;
  return existsSync(path.join(process.cwd(), "public", ...src.split("/").filter(Boolean)));
}

function repoPathExists(relPath: string): boolean {
  // Build-time existence check only; the ignore comment stops Turbopack from
  // tracing the whole project into the server bundle because of this path.
  return existsSync(
    path.join(/*turbopackIgnore: true*/ process.cwd(), ...relPath.split("/").filter(Boolean)),
  );
}

const ISO_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** True for a real calendar date written as `YYYY-MM-DD`. */
export function isIsoDate(v: unknown): boolean {
  if (typeof v !== "string") return false;
  const m = ISO_DATE_RE.exec(v);
  if (!m) return false;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const dt = new Date(Date.UTC(y, mo - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === mo - 1 && dt.getUTCDate() === d;
}

/** Returns the reason an `EventDate` is malformed, or `null` when it is valid. */
export function eventDateProblem(date: EventDate | unknown): string | null {
  if (date === null) return null;
  if (typeof date === "string") {
    return isIsoDate(date) ? null : `must be an ISO date YYYY-MM-DD, a { start, end } range, or null (got ${quote(date)})`;
  }
  if (typeof date === "object" && date !== null && "start" in date && "end" in date) {
    const { start, end } = date as { start: unknown; end: unknown };
    if (!isIsoDate(start)) return `range start must be an ISO date YYYY-MM-DD (got ${quote(start)})`;
    if (!isIsoDate(end)) return `range end must be an ISO date YYYY-MM-DD (got ${quote(end)})`;
    if ((end as string) < (start as string)) return `range end must be on or after start (got start ${start}, end ${end})`;
    return null;
  }
  return `must be an ISO date YYYY-MM-DD, a { start, end } range, or null (got ${quote(date)})`;
}

const IATA_RE = /^[A-Z]{3}$/;

/** Pushes errors for a required non-empty string. */
function requireText(errors: string[], file: ContentFile, item: string, field: string, v: unknown): void {
  if (isBlank(v)) errors.push(err(file, item, field, `must be a non-empty string (got ${quote(v)})`));
}

/** Pushes errors for a string whose trimmed length must sit in `[min, max]`. */
function requireLength(
  errors: string[],
  file: ContentFile,
  item: string,
  field: string,
  v: unknown,
  min: number,
  max: number,
): void {
  if (typeof v !== "string") {
    errors.push(err(file, item, field, `must be a string (got ${quote(v)})`));
    return;
  }
  const n = len(v);
  if (n < min || n > max) {
    errors.push(err(file, item, field, `must be ${min}–${max} characters (got ${n})`));
  }
}

/** Pushes errors for an array of non-empty paragraphs with `[min, max]` entries. */
function requireParagraphs(
  errors: string[],
  file: ContentFile,
  item: string,
  field: string,
  v: unknown,
  min = 1,
  max = Number.POSITIVE_INFINITY,
): void {
  if (!Array.isArray(v)) {
    errors.push(err(file, item, field, `must be an array of paragraphs (got ${quote(v)})`));
    return;
  }
  if (v.length < min || v.length > max) {
    const bound = max === Number.POSITIVE_INFINITY ? `at least ${min}` : `${min}–${max}`;
    errors.push(err(file, item, field, `must have ${bound} paragraph(s) (got ${v.length})`));
  }
  v.forEach((p, i) => requireText(errors, file, item, `${field}[${i}]`, p));
}

/** Pushes errors for an `ImageRef`: non-empty alt and a file under `public/`. */
function requireImage(errors: string[], file: ContentFile, item: string, field: string, img: ImageRef | unknown): void {
  if (!img || typeof img !== "object") {
    errors.push(err(file, item, field, `must be an image reference { src, alt } (got ${quote(img)})`));
    return;
  }
  const { src, alt } = img as Partial<ImageRef>;
  if (isBlank(src)) {
    errors.push(err(file, item, `${field}.src`, `must be a non-empty path under public/ (got ${quote(src)})`));
  } else if (!publicFileExists(src as string)) {
    errors.push(err(file, item, `${field}.src`, `points to ${quote(src)} but public${src} does not exist`));
  }
  requireText(errors, file, item, `${field}.alt`, alt);
}

// ---------------------------------------------------------------------------
// content/site.ts
// ---------------------------------------------------------------------------

/** Page titles 10–60, descriptions 50–160, both unique across pages (Req 16.1, 16.14). */
export function validateMetadata(pages: Record<string, { title: string; description: string }>): string[] {
  const errors: string[] = [];
  const seenTitles = new Map<string, string>();
  const seenDescriptions = new Map<string, string>();

  for (const [key, page] of Object.entries(pages)) {
    const item = `pages.${key}`;
    if (!page || typeof page !== "object") {
      errors.push(err("site", item, "title", `must be a { title, description } object (got ${quote(page)})`));
      continue;
    }
    requireLength(errors, "site", item, "title", page.title, 10, 60);
    requireLength(errors, "site", item, "description", page.description, 50, 160);

    if (typeof page.title === "string") {
      const t = page.title.trim();
      const prior = seenTitles.get(t);
      if (prior) errors.push(err("site", item, "title", `must be unique across pages (duplicates pages.${prior})`));
      else seenTitles.set(t, key);
    }
    if (typeof page.description === "string") {
      const d = page.description.trim();
      const prior = seenDescriptions.get(d);
      if (prior) {
        errors.push(err("site", item, "description", `must be unique across pages (duplicates pages.${prior})`));
      } else {
        seenDescriptions.set(d, key);
      }
    }
  }
  return errors;
}

/** Design_Asset flag `true` -> file or directory exists at its documented path (Req 20.8). */
export function validateDesignAssets(flags: Record<DesignAssetKey, boolean>): string[] {
  const errors: string[] = [];
  for (const [key, on] of Object.entries(flags) as [DesignAssetKey, boolean][]) {
    if (!on) continue;
    const target = DESIGN_ASSET_PATHS[key];
    if (!target) {
      errors.push(err("site", "designAssets", key, `is not a known Designer_Asset key`));
    } else if (!repoPathExists(target)) {
      errors.push(err("site", "designAssets", key, `is true but ${target} does not exist`));
    }
  }
  return errors;
}

export function validateSite(site: SiteContent): string[] {
  const e: string[] = [];
  const f: ContentFile = "site";

  requireText(e, f, "site", "name", site.name);
  requireText(e, f, "site", "arabicName", site.arabicName);
  requireText(e, f, "site", "kicker", site.kicker);
  requireLength(e, f, "site", "description", site.description, 1, 160);
  requireText(e, f, "site", "url", site.url);

  if (!Array.isArray(site.nav) || site.nav.length === 0) {
    e.push(err(f, "site", "nav", `must list at least one link (got ${quote(site.nav)})`));
  } else {
    site.nav.forEach((n, i) => {
      requireText(e, f, `nav[${i}]`, "label", n?.label);
      requireText(e, f, `nav[${i}]`, "href", n?.href);
    });
  }

  requireText(e, f, "social", "instagram", site.social?.instagram);
  requireText(e, f, "social", "linkedin", site.social?.linkedin);

  // About (Req 3.8, 3.4)
  requireParagraphs(e, f, "about", "aboutUs", site.about?.aboutUs);
  requireParagraphs(e, f, "about", "mission", site.about?.mission);
  if (!Array.isArray(site.about?.goals) || site.about.goals.length !== 5) {
    e.push(err(f, "about", "goals", `must list exactly 5 goals (got ${site.about?.goals?.length ?? 0})`));
  } else {
    site.about.goals.forEach((g, i) => requireText(e, f, "about", `goals[${i}]`, g));
  }

  // What's at Stake (Req 4.5, 4.7)
  requireText(e, f, "atStake", "quote", site.atStake?.quote);
  requireText(e, f, "atStake", "quoteBy", site.atStake?.quoteBy);
  requireParagraphs(e, f, "atStake", "body", site.atStake?.body);
  requireText(e, f, "atStake", "stat.value", site.atStake?.stat?.value);
  requireText(e, f, "atStake", "stat.label", site.atStake?.stat?.label);
  if (!Array.isArray(site.atStake?.images) || site.atStake.images.length < 1 || site.atStake.images.length > 5) {
    e.push(err(f, "atStake", "images", `must contain 1–5 images (got ${site.atStake?.images?.length ?? 0})`));
  } else {
    site.atStake.images.forEach((img, i) => requireImage(e, f, "atStake", `images[${i}]`, img));
  }

  // Campaign lines (Req 6.9)
  requireLength(e, f, "campaign", "museumTeaser", site.campaign?.museumTeaser, 1, 600);
  requireText(e, f, "campaign", "donateLine", site.campaign?.donateLine);

  // Support contacts
  if (!Array.isArray(site.support?.contacts) || site.support.contacts.length === 0) {
    e.push(err(f, "support", "contacts", `must list at least one contact (got ${quote(site.support?.contacts)})`));
  } else {
    site.support.contacts.forEach((c, i) => {
      const item = `support.contacts[${i}]`;
      requireText(e, f, item, "key", c?.key);
      requireText(e, f, item, "name", c?.name);
      requireText(e, f, item, "role", c?.role);
      if (typeof c?.confirmed !== "boolean") {
        e.push(err(f, item, "confirmed", `must be true or false (got ${quote(c?.confirmed)})`));
      }
    });
  }

  // Per-page SEO (Req 16.1, 16.14) and Designer_Asset flags (Req 20.8)
  e.push(...validateMetadata(site.pages ?? {}));
  e.push(...validateDesignAssets(site.designAssets ?? ({} as Record<DesignAssetKey, boolean>)));

  if (Array.isArray(site.instagramGrid)) {
    if (site.instagramGrid.length > 12) {
      e.push(err(f, "site", "instagramGrid", `must contain at most 12 items (got ${site.instagramGrid.length})`));
    }
    site.instagramGrid.forEach((g, i) => {
      requireImage(e, f, "site", `instagramGrid[${i}]`, g);
      requireText(e, f, "site", `instagramGrid[${i}].href`, g?.href);
    });
  }

  // Contact email defaults are not Placeholders; every key must be set (Req 11.2).
  for (const [k, v] of Object.entries(site.pending?.contactEmails ?? {})) {
    requireText(e, f, "pending", `contactEmails.${k}`, v);
  }

  return e;
}

// ---------------------------------------------------------------------------
// content/events.ts
// ---------------------------------------------------------------------------

export function validateEvents(content: EventsContent): string[] {
  const e: string[] = [];
  const f: ContentFile = "events";

  // Cities (Req 7.2)
  for (const city of CITIES) {
    const c = content.cities?.[city];
    const item = `cities.${city}`;
    if (!c) {
      e.push(err(f, item, "name", `is missing; every city in ${CITIES.join(", ")} must be defined`));
      continue;
    }
    requireText(e, f, item, "name", c.name);
    requireLength(e, f, item, "framing", c.framing, 1, 200);
    if (typeof c.iata !== "string" || !IATA_RE.test(c.iata)) {
      e.push(err(f, item, "iata", `must be 3 upper-case letters (got ${quote(c.iata)})`));
    }
  }

  // Events (Req 7.4, 7.5)
  if (!Array.isArray(content.events)) {
    e.push(err(f, "events", "events", `must be an array (got ${quote(content.events)})`));
    return e;
  }

  const seenIds = new Map<string, number>();
  content.events.forEach((ev, i) => {
    const hasId = !isBlank(ev?.id);
    const item = hasId ? `event "${ev.id}"` : `event at position ${i}`;

    if (!hasId) {
      e.push(err(f, item, "id", `must be a non-empty string (got ${quote(ev?.id)})`));
    } else {
      const prior = seenIds.get(ev.id);
      if (prior !== undefined) {
        e.push(err(f, item, "id", `must be unique across events (also used at position ${prior})`));
      } else {
        seenIds.set(ev.id, i);
      }
    }

    requireText(e, f, item, "title", ev?.title);
    requireText(e, f, item, "stampLabel", ev?.stampLabel);
    requireText(e, f, item, "venue", ev?.venue);
    requireText(e, f, item, "dateDisplay", ev?.dateDisplay);
    requireText(e, f, item, "blurb", ev?.blurb);

    if (!CITIES.includes(ev?.city)) {
      e.push(err(f, item, "city", `must be one of ${CITIES.join(", ")} (got ${quote(ev?.city)})`));
    }

    if (!ev || !("date" in ev)) {
      e.push(err(f, item, "date", `is required (use null when the date is TBA)`));
    } else {
      const problem = eventDateProblem(ev.date);
      if (problem) e.push(err(f, item, "date", problem));
    }

    if (ev?.status !== undefined && !EVENT_STATUSES.includes(ev.status)) {
      e.push(err(f, item, "status", `must be one of ${EVENT_STATUSES.join(", ")} when set (got ${quote(ev.status)})`));
    }

    if (ev?.sponsorLine !== undefined) requireText(e, f, item, "sponsorLine", ev.sponsorLine);

    if (ev?.externalLink !== undefined) {
      requireText(e, f, item, "externalLink.label", ev.externalLink?.label);
      requireText(e, f, item, "externalLink.href", ev.externalLink?.href);
    }

    const codes = ev?.airportCodes;
    if (!codes || typeof codes !== "object") {
      e.push(err(f, item, "airportCodes", `must be { from, to } IATA codes (got ${quote(codes)})`));
    } else {
      for (const side of ["from", "to"] as const) {
        const v = codes[side];
        if (typeof v !== "string" || !IATA_RE.test(v)) {
          e.push(err(f, item, `airportCodes.${side}`, `must be 3 upper-case letters (got ${quote(v)})`));
        }
      }
    }

    if (ev?.images !== undefined) {
      if (!Array.isArray(ev.images)) {
        e.push(err(f, item, "images", `must be an array of images (got ${quote(ev.images)})`));
      } else {
        if (ev.images.length > 6) {
          e.push(err(f, item, "images", `must contain at most 6 images (got ${ev.images.length})`));
        }
        ev.images.forEach((img, j) => requireImage(e, f, item, `images[${j}]`, img));
      }
    }
  });

  return e;
}

// ---------------------------------------------------------------------------
// content/team.ts
// ---------------------------------------------------------------------------

export function validateTeam(content: TeamContent): string[] {
  const e: string[] = [];
  const f: ContentFile = "team";

  if (!Array.isArray(content.groups) || content.groups.length === 0) {
    e.push(err(f, "team", "groups", `must list at least one group (got ${quote(content.groups)})`));
  } else {
    content.groups.forEach((g, i) => requireText(e, f, "team", `groups[${i}]`, g));
  }

  if (!Array.isArray(content.members)) {
    e.push(err(f, "team", "members", `must be an array (got ${quote(content.members)})`));
    return e;
  }

  const groups = new Set(Array.isArray(content.groups) ? content.groups : []);
  content.members.forEach((m, i) => {
    const item = isBlank(m?.name) ? `member at position ${i}` : `member "${m.name}"`;
    requireText(e, f, item, "name", m?.name);
    requireText(e, f, item, "role", m?.role);
    if (isBlank(m?.group)) {
      e.push(err(f, item, "group", `must be a non-empty string (got ${quote(m?.group)})`));
    } else if (!groups.has(m.group)) {
      e.push(err(f, item, "group", `must be one of the declared groups (got ${quote(m.group)})`));
    }
    if (typeof m?.order !== "number" || !Number.isInteger(m.order) || m.order < 1) {
      e.push(err(f, item, "order", `must be a positive integer (got ${quote(m?.order)})`));
    }
    if (m?.base !== undefined) requireText(e, f, item, "base", m.base);
    if (m?.bio !== undefined) requireText(e, f, item, "bio", m.bio);
    if (m?.photo !== undefined) {
      if (isBlank(m.photo)) {
        e.push(err(f, item, "photo", `must be a non-empty path under public/ when set (got ${quote(m.photo)})`));
      } else if (!publicFileExists(m.photo)) {
        e.push(err(f, item, "photo", `points to ${quote(m.photo)} but public${m.photo} does not exist`));
      }
    }
  });

  return e;
}

// ---------------------------------------------------------------------------
// content/partners.ts
// ---------------------------------------------------------------------------

export function validatePartners(content: PartnersContent): string[] {
  const e: string[] = [];
  const f: ContentFile = "partners";

  requireText(e, f, "partners", "heading", content.heading);

  if (!Array.isArray(content.partners)) {
    e.push(err(f, "partners", "partners", `must be an array (got ${quote(content.partners)})`));
    return e;
  }

  content.partners.forEach((p, i) => {
    const item = isBlank(p?.name) ? `partner at position ${i}` : `partner "${p.name}"`;
    requireText(e, f, item, "name", p?.name);
    if (!PARTNER_PERMISSIONS.includes(p?.permission)) {
      e.push(
        err(f, item, "permission", `must be one of ${PARTNER_PERMISSIONS.join(", ")} (got ${quote(p?.permission)})`),
      );
    }
    if (p?.href !== undefined) requireText(e, f, item, "href", p.href);
    if (p?.logo !== undefined) requireImage(e, f, item, "logo", p.logo);
  });

  return e;
}

// ---------------------------------------------------------------------------
// content/donate.ts
// ---------------------------------------------------------------------------

export function validateDonate(content: DonateContent): string[] {
  const e: string[] = [];
  const f: ContentFile = "donate";

  requireText(e, f, "us", "title", content.us?.title);
  requireText(e, f, "us", "tagline", content.us?.tagline);
  for (const btn of ["primary", "secondary"] as const) {
    requireText(e, f, "us", `${btn}.label`, content.us?.[btn]?.label);
    requireText(e, f, "us", `${btn}.href`, content.us?.[btn]?.href);
  }

  requireText(e, f, "uk", "title", content.uk?.title);
  requireText(e, f, "uk", "intro", content.uk?.intro);
  requireText(e, f, "uk", "stripeLabel", content.uk?.stripeLabel);
  requireText(e, f, "uk", "fallbackText", content.uk?.fallbackText);
  requireText(e, f, "uk", "fallbackButtonLabel", content.uk?.fallbackButtonLabel);
  requireText(e, f, "uk", "referenceInstruction", content.uk?.referenceInstruction);

  requireText(e, f, "statements", "notForProfit", content.statements?.notForProfit);
  requireText(e, f, "statements", "notACharity", content.statements?.notACharity);
  requireText(e, f, "donate", "contactLine", content.contactLine);

  return e;
}

// ---------------------------------------------------------------------------
// content/film.ts
// ---------------------------------------------------------------------------

export function validateFilm(content: FilmContent): string[] {
  const e: string[] = [];
  const f: ContentFile = "film";

  for (const key of ["logline", "about", "director", "protagonist", "backing", "trailer"] as const) {
    requireText(e, f, "headings", key, content.headings?.[key]);
  }

  requireText(e, f, "director", "name", content.director?.name);
  requireText(e, f, "director", "credential", content.director?.credential);
  requireText(e, f, "director", "note", content.director?.note);

  requireText(e, f, "protagonist", "name", content.protagonist?.name);
  requireText(e, f, "protagonist", "bio", content.protagonist?.bio);
  requireImage(e, f, "protagonist", "image", content.protagonist?.image); // Req 5.11

  if (!Array.isArray(content.backing) || content.backing.length === 0) {
    e.push(err(f, "film", "backing", `must list at least one backer (got ${quote(content.backing)})`));
  } else {
    content.backing.forEach((b, i) => {
      requireText(e, f, `backing[${i}]`, "name", b?.name);
      requireText(e, f, `backing[${i}]`, "detail", b?.detail);
    });
  }

  requireText(e, f, "film", "trailerComingSoonText", content.trailerComingSoonText);

  return e;
}

// ---------------------------------------------------------------------------
// content/museum.ts
// ---------------------------------------------------------------------------

/** Returns the banned terms found in `text` (Req 8.8), in list order. */
export function bannedTermsIn(text: string): string[] {
  return BANNED_TERM_PATTERNS.filter(({ re }) => re.test(text)).map(({ term }) => term);
}

export function validateMuseum(content: MuseumContent): string[] {
  const e: string[] = [];
  const f: ContentFile = "museum";
  const copy: { item: string; field: string; text: unknown }[] = [];

  requireParagraphs(e, f, "museum", "intro", content.intro, 1, 3);
  (Array.isArray(content.intro) ? content.intro : []).forEach((p, i) =>
    copy.push({ item: "museum", field: `intro[${i}]`, text: p }),
  );

  requireParagraphs(e, f, "museum", "whatItIs", content.whatItIs);
  (Array.isArray(content.whatItIs) ? content.whatItIs : []).forEach((p, i) =>
    copy.push({ item: "museum", field: `whatItIs[${i}]`, text: p }),
  );

  // Collections (Req 8.3)
  if (!Array.isArray(content.collections) || content.collections.length < 3 || content.collections.length > 8) {
    e.push(err(f, "museum", "collections", `must list 3–8 collections (got ${content.collections?.length ?? 0})`));
  }
  const collections = Array.isArray(content.collections) ? content.collections : [];
  collections.forEach((c, i) => {
    const item = isBlank(c?.title) ? `collection at position ${i}` : `collection "${c.title}"`;
    requireLength(e, f, item, "title", c?.title, 1, 60);
    requireLength(e, f, item, "description", c?.description, 1, 400);
    copy.push({ item, field: "title", text: c?.title }, { item, field: "description", text: c?.description });
  });
  const titles = new Set(collections.map((c) => (typeof c?.title === "string" ? c.title.trim() : "")));
  for (const required of REQUIRED_COLLECTION_TITLES) {
    if (!titles.has(required)) {
      e.push(err(f, "museum", "collections", `must include a collection titled ${quote(required)}`));
    }
  }

  // Roadmap (Req 8.6, 8.7)
  if (!Array.isArray(content.roadmap) || content.roadmap.length < 3 || content.roadmap.length > 8) {
    e.push(err(f, "museum", "roadmap", `must list 3–8 stages (got ${content.roadmap?.length ?? 0})`));
  }
  const roadmap = Array.isArray(content.roadmap) ? content.roadmap : [];
  roadmap.forEach((s, i) => {
    const item = isBlank(s?.label) ? `roadmap stage at position ${i}` : `roadmap stage "${s.label}"`;
    requireLength(e, f, item, "label", s?.label, 1, 60);
    requireLength(e, f, item, "description", s?.description, 1, 300);
    if (s?.dateText !== undefined) requireText(e, f, item, "dateText", s.dateText);
    if (s?.current !== undefined && typeof s.current !== "boolean") {
      e.push(err(f, item, "current", `must be true or false when set (got ${quote(s.current)})`));
    }
    copy.push({ item, field: "label", text: s?.label }, { item, field: "description", text: s?.description });
    if (s?.dateText !== undefined) copy.push({ item, field: "dateText", text: s.dateText });
  });
  const currentCount = roadmap.filter((s) => s?.current === true).length;
  if (roadmap.length > 0 && currentCount !== 1) {
    e.push(err(f, "museum", "roadmap", `must flag exactly one stage with current: true (found ${currentCount})`));
  }

  // Admission_Ticket copy (Req 9.1)
  requireText(e, f, "ticket", "label", content.ticket?.label);
  if (content.ticket?.buttonLabel !== "Reserve my ticket") {
    e.push(err(f, "ticket", "buttonLabel", `must be exactly "Reserve my ticket" (got ${quote(content.ticket?.buttonLabel)})`));
  }
  requireText(e, f, "ticket", "consentText", content.ticket?.consentText);
  requireLength(e, f, "ticket", "privacyNote", content.ticket?.privacyNote, 1, 160);
  requireLength(e, f, "ticket", "privacyNoteProviderTbc", content.ticket?.privacyNoteProviderTbc, 1, 160);
  copy.push(
    { item: "ticket", field: "label", text: content.ticket?.label },
    { item: "ticket", field: "consentText", text: content.ticket?.consentText },
    { item: "ticket", field: "privacyNote", text: content.ticket?.privacyNote },
    { item: "ticket", field: "privacyNoteProviderTbc", text: content.ticket?.privacyNoteProviderTbc },
  );

  requireText(e, f, "thanks", "sentence", content.thanks?.sentence);
  requireText(e, f, "thanks", "backLabel", content.thanks?.backLabel);
  copy.push(
    { item: "thanks", field: "sentence", text: content.thanks?.sentence },
    { item: "thanks", field: "backLabel", text: content.thanks?.backLabel },
  );

  if (typeof content.pending?.workOfAmer === "string") {
    copy.push({ item: "pending", field: "workOfAmer", text: content.pending.workOfAmer });
  }

  // Banned technology terms over every piece of museum copy (Req 8.8)
  for (const { item, field, text } of copy) {
    if (typeof text !== "string") continue;
    const found = bannedTermsIn(text);
    if (found.length > 0) {
      e.push(err(f, item, field, `must not name a delivery technology (found ${found.map(quote).join(", ")})`));
    }
  }

  return e;
}

// ---------------------------------------------------------------------------
// Warnings: partially filled grouped Placeholders
// ---------------------------------------------------------------------------

/**
 * A grouped Placeholder (object with several fields) is all-or-nothing: when
 * some fields are filled and others empty, `isPending` treats the whole group
 * as empty. That is not an error, but the owner should know, so it is
 * reported as a warning (design.md "Placeholder build summary").
 */
export function partialGroupWarnings(content: ContentSet): string[] {
  const groups: { file: ContentFile; key: string; value: unknown; optional?: readonly string[] }[] = [
    { file: "site", key: "companyRegistration", value: content.site.pending?.companyRegistration },
    { file: "site", key: "funderAcknowledgement", value: content.site.pending?.funderAcknowledgement },
    { file: "site", key: "emailProvider", value: content.site.pending?.emailProvider },
    { file: "donate", key: "bankDetails", value: content.donate.pending?.bankDetails, optional: OPTIONAL_BANK_FIELDS },
  ];

  const warnings: string[] = [];
  for (const { file, key, value, optional = [] } of groups) {
    if (!value || typeof value !== "object" || isPending(value)) continue;
    // Optional fields (bank `iban` / `bic`) may be absent or blank without
    // making the group "partially filled".
    const empty = Object.entries(value)
      .filter(([k, v]) => v !== undefined && !optional.includes(k) && isPending(v))
      .map(([k]) => k);
    if (empty.length > 0) {
      warnings.push(
        `[content/${file}.ts] pending.${key}: partially filled — treated as empty until ${empty
          .map((k) => `"${k}"`)
          .join(", ")} ${empty.length === 1 ? "is" : "are"} filled`,
      );
    }
  }
  return warnings;
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

export const realContent: ContentSet = {
  site: realSite,
  events: realEvents,
  team: realTeam,
  partners: realPartners,
  donate: realDonate,
  film: realFilm,
  museum: realMuseum,
};

/** Runs every validator and returns the combined error list without throwing. */
export function collectErrors(content: ContentSet = realContent): string[] {
  return [
    ...validateSite(content.site),
    ...validateEvents(content.events),
    ...validateTeam(content.team),
    ...validatePartners(content.partners),
    ...validateDonate(content.donate),
    ...validateFilm(content.film),
    ...validateMuseum(content.museum),
  ];
}

/**
 * Validates every Content_File. Throws one `Error` listing every problem when
 * any rule fails; otherwise returns the warnings for partially filled grouped
 * Placeholders (never thrown).
 */
export function validateAll(content: ContentSet = realContent): { warnings: string[] } {
  const errors = collectErrors(content);
  if (errors.length > 0) {
    throw new Error(
      `Content validation failed with ${errors.length} error${errors.length === 1 ? "" : "s"}:\n${errors
        .map((line) => `  ${line}`)
        .join("\n")}`,
    );
  }
  return { warnings: partialGroupWarnings(content) };
}
