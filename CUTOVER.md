# Cutover: moving returningsands.org to the new site

Requirement 21.6 to 21.9 · design.md "Cutover plan"

## Read this first

Cutover is a MANUAL step. It is performed by a named member of the Returning
Sands team, by hand, in the Vercel dashboard. It is never performed by an
automated agent, a script, a CI job, or the Vercel CLI, and it happens only
after the team has reviewed the New_Project preview and the project owner has
personally signed off. Until that sign-off the domains stay where they are.

The two Vercel projects involved (both in the `returning-sands` team):

| Name in this document | Vercel project | Serves today |
|---|---|---|
| Old_Project | `returning-sands` | `returningsands.org`, `www.returningsands.org` (the current single-page site) |
| New_Project | `returning-sands-new` | `returning-sands-new.vercel.app` only |

Cutover means moving the two production domains from Old_Project to
New_Project. Nothing else changes: no DNS edits, no deletion, no code deploy
is part of the move itself.

Work through the ordered checklist below top to bottom. Every line records who
confirmed it and when. Do not start item (d) until items (a) to (c) are all
ticked and the owner has given the go-ahead in writing (email or chat is fine;
paste a reference next to item (d)).

## Ordered checklist

### (a) Placeholder audit

Every Placeholder that, while empty, disables a user-facing control or renders
visibly marked placeholder text must be either filled with confirmed content or
explicitly accepted empty with a reason. Run `npm run build` on the candidate
commit; the `postbuild` step prints the outstanding list in the form
`content/<file>.ts   pending.<key>`. Paste that output under the table and
complete one row per key.

Candidate commit: `____________`  · build run by: ____ on: ____

| Content file | Placeholder key | What it disables or marks while empty | Status (filled / accepted empty — reason) |
|---|---|---|---|
| `content/site.ts` | `pending.campaignOverview` | `/campaign` shows "[Campaign overview placeholder — copy to follow]" | |
| `content/site.ts` | `pending.emailProvider` | Admission_Ticket on `/museum` and mailing-list ticket on `/support` are disabled ("Ticket desk opening soon"); privacy note says provider "to be confirmed" | filled 2026-10-01 — Web3Forms, ported from Old_Site (relays to info@returningsands.org; `redirect` uses the production origin, so preview sign-ups land on the old site's `/museum/thanks` until cutover) |
| `content/site.ts` | `pending.funderAcknowledgement` | Funder block omitted on `/donate` and `/museum` | |
| `content/site.ts` | `pending.companyRegistration` | Footer shows "Returning Sands CIC · Company no. 17311689 · Registered office to follow" (from `site.companyNumber`); the plain "Company details to follow" line only if that number were also removed | |
| `content/events.ts` | `pending.exclusiveShowcaseDate` | NYC Exclusive Showcase shows "Date TBA" and no Event JSON-LD | |
| `content/events.ts` | `pending.cultureHouseDay` | London Culture House keeps "January 2027, day TBA" | |
| `content/donate.ts` | `pending.stripePaymentLink` | No "Donate by card" button or intro sentence on `/donate` | filled 2026-10-01 — Stripe Payment Link, ported from Old_Site |
| `content/donate.ts` | `pending.bankDetails` | No bank details / Copy buttons on `/donate`; fallback text and Support button shown when Stripe is also empty | filled 2026-10-01 — Co-operative Bank account incl. IBAN and BIC, ported from Old_Site |
| `content/film.ts` | `pending.logline` | `/film` shows "[Logline to follow]" | |
| `content/film.ts` | `pending.aboutFilm` | `/film` shows "[About the film to follow]" | |
| `content/film.ts` | `pending.trailerUrl` | Home shows disabled "Trailer coming soon" button; `/film` shows the coming-soon Boarding_Pass instead of the trailer | |
| `content/museum.ts` | `pending.workOfAmer` | `/museum` shows "[Copy on the work of Amer to follow]" | |

Placeholder summary pasted from the candidate build:

```
(paste `npm run build` postbuild output here)
```

- [ ] (a) Every disabling Placeholder above is filled or recorded as accepted empty with a reason — confirmed by: ____ on: ____

### (b) Accessibility gate

- [ ] (b) The latest GitHub Action run on the candidate commit reports zero `serious` or `critical` axe violations (link the run: ____________), and `ACCESSIBILITY_CHECKLIST.md` carries a completed sign-off — confirmed by: ____ on: ____

### (c) Lighthouse_Mobile

Run Lighthouse in Chrome DevTools (Mobile preset, simulated throttling) three
times per route against the New_Project preview URL and record the median of
the three runs. Every cell must be 90 or higher.

Preview URL tested: `____________________`

| Route | Performance | Accessibility | Best Practices | SEO |
|---|---|---|---|---|
| `/` | | | | |
| `/about` | | | | |
| `/at-stake` | | | | |
| `/film` | | | | |
| `/campaign` | | | | |
| `/campaign/cairo` | | | | |
| `/campaign/london` | | | | |
| `/campaign/nyc` | | | | |
| `/museum` | | | | |
| `/team` | | | | |
| `/support` | | | | |
| `/donate` | | | | |
| `/privacy` | | | | |

- [ ] (c) Lighthouse_Mobile median >= 90 in all four categories for all 13 routes — confirmed by: ____ on: ____

### Owner go-ahead (gate before any domain change)

- [ ] Project owner has reviewed the preview and approved the domain move in writing (reference: ____________) — confirmed by: ____ on: ____

### (d) Remove domains from Old_Project

In the Vercel dashboard: team `returning-sands` → project `returning-sands` →
Settings → Domains. Remove `returningsands.org` and `www.returningsands.org`.
Do not touch anything else in Old_Project.

- [ ] (d) `returningsands.org` and `www.returningsands.org` removed from Old_Project — confirmed by: ____ on: ____

### (e) Add domains to New_Project

Team `returning-sands` → project `returning-sands-new` → Settings → Domains.
Add `returningsands.org` (primary) and `www.returningsands.org` set to redirect
to the apex. Wait until both show "Valid Configuration" and the certificate
status is issued. Because the DNS already points at Vercel and both projects
are in the same team, this normally completes within minutes.

- [ ] (e) Both domains added to New_Project and both show a valid TLS certificate — confirmed by: ____ on: ____

### (f) www redirect

```
curl -I https://www.returningsands.org/
```

Expected: `HTTP/2 308` with `location: https://returningsands.org/`.

- [ ] (f) `https://www.returningsands.org/` returns 308 with `Location: https://returningsands.org/` — confirmed by: ____ on: ____

### (g) Share_Cards

Paste each of these links into a WhatsApp chat and an iMessage conversation and
wait for the preview to render. Each must show the intended image and page
title, with no broken-image icon and no blank preview.

| Route | WhatsApp | iMessage |
|---|---|---|
| `https://returningsands.org/` | | |
| `https://returningsands.org/film` | | |
| `https://returningsands.org/campaign/______` (one City_Page) | | |

- [ ] (g) Share_Cards for `/`, `/film` and one City_Page render correctly on WhatsApp and iMessage — confirmed by: ____ on: ____

### (h) Sitemap and robots

```
curl -I https://returningsands.org/sitemap.xml
curl -I https://returningsands.org/robots.txt
```

- [ ] (h) `/sitemap.xml` and `/robots.txt` each return HTTP 200 on the production domain — confirmed by: ____ on: ____

Final item confirmed on: ____________  (the 14-day freeze and rollback window count from this date)

## Rollback

Rollback is also manual and uses the same dashboard screens in reverse.

Triggers (Requirement 21.9), any one of which within 14 days of the final
checklist item is enough:

- any route in `lib/routes.ts` (`INDEXABLE_ROUTES`) returns a non-200 status on `https://returningsands.org`
- the "Donate in USD" PayPal link on `/donate` is unreachable
- an axe violation of impact `critical` is found on the production domain

Procedure, to be completed within 1 hour of the issue being identified:

1. Remove `returningsands.org` and `www.returningsands.org` from New_Project (`returning-sands-new`).
2. Add both domains back to Old_Project (`returning-sands`), `www` redirecting to the apex.
3. Confirm `curl -I https://returningsands.org/` returns 200 from the old site.
4. Record the issue below.

| Date/time identified | Issue | Rolled back by | Domains back on Old_Project at | Fix and re-cutover plan |
|---|---|---|---|---|
| | | | | |

## Old_Project freeze

From the start of item (d) until at least 14 days after the final checklist
item is confirmed, Old_Project (`returning-sands`) stays exactly as it is:

- no new deployments (do not push to its repository, do not redeploy)
- no settings changes (environment variables, domains other than the move itself, build settings)
- no deletion of the project or of any of its deployments

This is what makes the one-hour rollback possible. Freeze ends on: ____________

## DNS

No DNS records change at the registrar or DNS host. Both the apex and `www`
already resolve to Vercel, and both projects live in the same Vercel team, so
the cutover and the rollback are purely Vercel project domain assignments with
no propagation delay (Requirement 21.7). If anyone is asked to edit a DNS
record as part of this cutover, stop and re-read this section.

## Caveat: the accessibility gate and Vercel previews

The axe gate runs in GitHub Actions (`.github/workflows/a11y.yml`), not inside
Vercel's build. Vercel's build container cannot start the built site and drive
Chromium in the same step, so the check lives in the Action instead. Two
consequences:

- A pull request whose axe check is red still gets a Vercel preview
  deployment. That is intentional (the preview is useful for reviewing the
  failure), but it means a green preview URL is not evidence that the gate
  passed. Always look at the Action result, which is why item (b) asks for the
  run link.
- Production is protected only if "Require status checks to pass before
  merging" is enabled on `main` in the GitHub repository settings, with the
  a11y workflow selected. Without that setting a red check does not block the
  merge that triggers the production deploy. Verify the setting is on before
  ticking item (b).

Setting verified on `main` by: ____ on: ____
