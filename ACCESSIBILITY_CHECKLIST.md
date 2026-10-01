# Accessibility checklist (manual keyboard walkthrough)

Requirement 15.14 · companion to the automated gate in `tests/a11y/pages.spec.ts`

## Why this walkthrough exists

The automated Accessibility_Check runs axe-core (WCAG 2.0 A, 2.0 AA and 2.2 AA
rules) through Playwright against every indexable route, `/museum/thanks` and
the 404 page, and fails the GitHub Action on any `serious` or `critical`
violation. It also asserts that no decorative image is exposed to assistive
technology and that no image uses a file name as its `alt`. That catches
missing labels, contrast failures, broken ARIA references, duplicate landmarks
and similar static defects.

axe cannot judge the things that only a person at a keyboard or behind a
screen reader can: whether the Tab order matches the reading order, whether a
focus ring is actually visible on the sand paper texture, whether Escape really
puts focus back on the menu button, whether a layout survives 200% zoom
without clipping, or whether a screen reader announces the page in a sensible
order. Requirement 15.1 states that WCAG 2.2 AA is verified by the automated
check *and* this manual walkthrough together, and Requirement 15.14 requires
every item below to record a pass at least once before Cutover.

Run this against the Vercel preview of the cutover candidate commit (not
`localhost`), in Chromium or Firefox with JavaScript enabled unless an item
says otherwise. Use a 1280 px wide window unless an item specifies another
width. "Focus visible" means an outline of at least 2 CSS px with at least
3:1 contrast against the surrounding colour (Req 15.3).

## Walkthrough

Record `pass` or `fail` in the Result column. A failing row must be fixed and
re-tested; add a new row rather than overwriting the failed one so the history
stays visible.

| Item | Steps | Expected | Result (pass/fail) | Tester | Date |
|---|---|---|---|---|---|
| Skip link | Load `/`. Press Tab once. Press Enter. | The first focused element is the "Skip to content" link, visible only while focused. Enter moves focus to `<main>` and the next Tab lands on the first link inside the page content, not back in the header. Repeat on `/donate` and `/museum`. | | | |
| Top_Nav tab order | Load `/about`. Tab through the header. | Order is: skip link, Home wordmark, About, What's at Stake, Impact Campaign, The Documentary, Team, Support, Donate CTA (the Donate nav link and the CTA are the same control). No element is skipped and nothing off-screen receives focus. | | | |
| Top_Nav aria-current | On `/about`, `/campaign/london` and `/donate`, inspect the primary nav (DevTools or screen reader "current page" announcement). | Exactly one link carries `aria-current="page"` and is underlined: About on `/about`, Impact Campaign on `/campaign/london`, Donate on `/donate`. On `/museum`, `/privacy` and the 404 page no nav link is current. | | | |
| Collapsed menu: open | Resize to 375 px wide. Load `/`. Tab to the "Menu" button and press Enter, then Space. | The button has `aria-expanded="false"` closed and `"true"` open. The menu list appears with the same seven links as the desktop nav. Focus stays on the button after opening. | | | |
| Collapsed menu: Escape | With the menu open at 375 px, press Escape. | The menu closes and focus is back on the "Menu" button in the same key press, with its focus ring visible. | | | |
| Collapsed menu: link click closes | Open the menu at 375 px, Tab to "Team", press Enter. | Navigation to `/team` happens and the menu is closed on the new page. Repeat with a pointer click on a link: the menu closes. | | | |
| Collapsed menu: focus trap | Open the menu at 375 px. Press Tab repeatedly past the last link, then Shift+Tab repeatedly before the button. | Tab from the last link wraps to the "Menu" button; Shift+Tab from the button wraps to the last link. Focus never reaches the Home wordmark, the Donate CTA, or page content while the menu is open. | | | |
| Passport_Hero: focus visible | Load `/`. Tab into the passport spread. | Each City_Stamp receives a visible focus outline (`outline-2 outline-offset-2`, Nile blue) that is clearly distinct from the stamp border. Nothing inside the left passport page (the oval stamp) is focusable. | | | |
| City_Stamp London | Tab to the London stamp, press Enter. Return, hover it with the pointer. | Accessible name contains "London". Enter navigates to `/campaign/london`. Hover darkens the stamp border (stamp-700) within ~150 ms. | | | |
| City_Stamp Cairo | Tab to the Cairo stamp, press Enter. Return, hover it with the pointer. | Accessible name contains "Cairo". Enter navigates to `/campaign/cairo`. Hover darkens the stamp border. | | | |
| City_Stamp NYC | Tab to the NYC stamp, press Enter. Return, hover it with the pointer. | Accessible name contains "NYC" or "New York". Enter navigates to `/campaign/nyc`. Hover darkens the stamp border. | | | |
| Admission_Ticket: label | Load `/museum`. Tab to the email field in the hero ticket (`#ticket-top`) and again in the closing ticket (`#ticket-bottom`). | Each `<input type="email">` has a visible label associated via `<label for>`; a screen reader announces the label and "edit text, email". The privacy note is readable next to the field. | | | |
| Admission_Ticket: native validation | With the provider configured, leave the field empty and press "Reserve my ticket"; then type `not-an-email` and submit. | The browser shows its native "Please fill in this field" / "Please include an @" message and does not submit. No custom script replaces the message. | | | |
| Admission_Ticket: disabled while pending | If `site.pending.emailProvider` is still empty on the candidate build, Tab through both tickets. | The input is `disabled`, the text "Ticket desk opening soon" appears where the button would be, the form has no `action`, and Tab skips the disabled input without trapping. If the provider is configured, record "n/a – provider configured". | | | |
| Donate Copy buttons: Copied feedback | Load `/donate` with bank details present. Tab to each Copy button (account name, sort code, account number), press Enter. | Label changes to "Copied" for about two seconds and reverts to "Copy". Accessible name reads "Copied <field>" then "Copy <field>". Clipboard contains the exact value. If bank details are still pending, record "n/a – fallback panel shown" and check that the single "Support" button is reachable. | | | |
| Donate Copy buttons: failure message | Deny clipboard permission in the browser (or test in a context without `navigator.clipboard`), press a Copy button. | An inline `role="status"` message reads "Couldn't copy automatically — select the text to copy it." The value remains visible and selectable with the keyboard. | | | |
| External link: PayPal "Donate in USD" | `/donate`, Tab to the link; read with a screen reader. | Announced with "(opens in new tab)". Enter opens `paypal.com` in a new tab; the original tab stays on `/donate`. | | | |
| External link: "Our SIMA page" | `/donate`, Tab to the link; read with a screen reader. | Announced with "(opens in new tab)". Opens `simastudios.org` in a new tab. | | | |
| External link: Stripe "Donate in GBP" | `/donate`, Tab to the link (only present when `donate.pending.stripePaymentLink` is filled). | Announced with "(opens in new tab)". Opens the Stripe Payment Link in a new tab. If still pending, record "n/a – Stripe link pending". | | | |
| External link: Instagram | Footer on any page and the Support page. | Icon link's accessible name is "Instagram (opens in new tab)" in the footer; on `/support` the visible text plus the hidden suffix is announced. Opens `instagram.com/returningsands` in a new tab. | | | |
| External link: LinkedIn | Footer on any page and the Support page. | Accessible name is "LinkedIn (opens in new tab)" in the footer; on `/support` the visible text plus hidden suffix is announced. Opens the company page in a new tab. | | | |
| External link: trailer | `/` "Watch the Trailer" and `/film` trailer fallback link (only when `film.pending.trailerUrl` is filled). | Announced with "(opens in new tab)" and opens the trailer host in a new tab. The `<iframe>` on `/film` has the title "Returning Sands trailer". If pending, the Home control is a disabled "Trailer coming soon" button that is not in the Tab order; record "n/a – trailer pending" for the link part. | | | |
| External link: partner links | `/support` Partners & Supporters grid. For every partner tile that is wrapped in an anchor. | Each linked tile is exactly one anchor, announced with the partner name and "(opens in new tab)", and opens the partner site in a new tab. At the time of writing no partner has an `href`; record "n/a – no partner links" if that is still true. | | | |
| External link: event links | Each City_Page. For every Event with an `externalLink`. | Announced with "(opens in new tab)" and opens in a new tab. Record "n/a" if no event has an external link. | | | |
| 200% zoom | Set browser zoom to 200% at 1280 px. Visit every route: `/`, `/about`, `/at-stake`, `/film`, `/campaign`, `/campaign/cairo`, `/campaign/london`, `/campaign/nyc`, `/museum`, `/team`, `/support`, `/donate`, `/privacy`, `/museum/thanks`, and a 404 URL. | No text is clipped or overlaps, every control is still visible and operable, the Boarding_Pass and stamp text wraps rather than truncates, and no horizontal scrollbar appears. | | | |
| 320 px width | Resize the viewport to 320 px wide (DevTools device toolbar). Visit every route listed above. | No horizontal scroll on any page (`document.documentElement.scrollWidth` equals `clientWidth`). The passport spread stacks to one column, the donate panels stack, the team grid is one column, and the mobile menu works. | | | |
| Reduced motion | Enable "Reduce motion" at OS level (or emulate `prefers-reduced-motion: reduce` in DevTools). Load `/`, `/campaign`, `/film`. | `.reveal` sections are already visible with no fade or slide, stamps do not sway or tilt in, the postmark is fully drawn, and hover colour changes are instant. Nothing is hidden that would otherwise animate in. | | | |
| Screen reader: Home | NVDA (Windows, Firefox or Chrome) or VoiceOver (macOS Safari). Load `/`, read from the top with the arrow keys, then navigate by headings (H) and landmarks (D / rotor). | Order is skip link, banner, primary navigation, main. One `<h1>` "Returning Sands"; the Arabic title is announced in Arabic (`lang="ar"`); the passport stamps are announced as links with the city name; the trailer button is announced as disabled when pending; footer navigation is announced as "Footer". No image is announced by its file name and decorative stamps are silent. | | | |
| Screen reader: Donate | Same assistive technology. Load `/donate`, read from the top. | Headings for the US and UK panels are announced in order; each external link ends with "opens in new tab"; the bank details read as a definition list (term then value) with a Copy button per value; the two statements (Req 12.6 and 12.7) are read as plain text. No form fields are announced. | | | |
| Screen reader: Museum | Same assistive technology. Load `/museum`, read from the top. | The five section headings are announced in order; the email field is announced with its label and the privacy note; the roadmap reads as a list with exactly one "WE ARE HERE" marker adjacent to the current stage; the "[Copy on the work of Amer to follow]" note is announced as a note when still pending. No overlay or dialog is announced. | | | |

## Sign-off

All items passed at least once before cutover — name: ____________________ / date: ____________

Attach or link the Vercel preview URL that was tested: ____________________________________

Once signed, copy this sign-off line into `CUTOVER.md` item (b) notes so the
cutover record shows both the automated axe result and the manual walkthrough.
