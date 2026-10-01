# Design assets for returningsands.org

This is the brief for the graphic designer. It lists every piece of artwork the site can take, what it is for, the format and size we need, and the exact file name and folder it goes into.

The site already works without any of these. Each one currently has a stand-in built from CSS and type (a dashed oval, a plain boxed label, a grey silhouette). Your file replaces the stand-in; nothing else on the page changes. You can deliver one asset at a time, in any order.

One rule matters more than the rest: words stay as live text on the site. Stamps, boarding passes, tickets and cards all carry text today, and that text is real HTML so that screen readers and search engines can read it and the team can edit it. So for any asset that contains lettering, we need a version with the lettering removed (or the lettering on its own layer we can switch off). The site draws the words on top of your artwork. See "Rules" at the end.

## How an asset gets onto the site

There are two mechanisms. Each entry below says which one applies.

- **File replacement.** Put the file at the path given and it is picked up at the next build. Nothing else to do. Four assets work this way: favicon, app icon, share-card background, wordmark.
- **Flag.** Put the file at the path given, then a team member flips one switch from `false` to `true` in `content/site.ts`, in the `designAssets` block. The switch names are listed with each asset. If a switch is on but the file is missing, the build stops with a message naming the asset and the path it expected, so a half-finished swap cannot go live.

All flag-controlled files live in `public/design/`. Two of them (`city-stamps/` and `event-stamps/`) are folders holding one file per city or per event; the file names are given below.

## Summary

| Asset | Format | Size | Path | Mechanism |
| --- | --- | --- | --- | --- |
| Passport cover | SVG + PNG | PNG 1600 px wide, 3:4-ish portrait | `public/design/passport-cover.svg` (+ `.png` companion) | flag `passportCover` |
| Passport open spread | SVG or PNG | 2400 px wide, 2:1 landscape | `public/design/passport-spread.png` | flag `passportSpread` |
| Oval stamp | SVG | 3:2, around 160 × 106 px on screen | `public/design/stamp-oval.svg` | flag `stampOval` |
| Event stamps (8) | SVG | same oval + label box | `public/design/event-stamps/<event-id>.svg` | flag `eventStamps` |
| City stamps (3) | SVG | boxed, roughly 3:1 | `public/design/city-stamps/{london,cairo,nyc}.svg` | flag `cityStamps` |
| Boarding pass | SVG | 1200 × 630 share version + flexible web version | `public/design/boarding-pass.svg` | flag `boardingPass` |
| Admission ticket | SVG | roughly 3:1 landscape | `public/design/admission-ticket.svg` | flag `admissionTicket` |
| Passport card frame | SVG | 3:4 portrait | `public/design/passport-card-frame.svg` | flag `passportCardFrame` |
| Silhouette portrait | SVG | 3:4 portrait | `public/design/silhouette.svg` | flag `silhouette` |
| Wordmark | SVG | horizontal, about 6:1 | `public/design/wordmark.svg` (+ `wordmark-reversed.svg`) | file replacement |
| Favicon / app icon | SVG + PNG | SVG, 32, 180, 512 px square | `app/icon.svg`, `app/apple-icon.png`, `public/design/icon-32.png`, `public/design/icon-512.png` | file replacement |
| Share-card background | PNG | 1200 × 630, under 200 KB | `public/design/share-bg.png` | file replacement |
| Instagram templates | PNG or layered | 1080 × 1080 and 1080 × 1920 | `design-src/instagram/` | not shown on the site |

Colour mode for everything: RGB for screen (sRGB). No CMYK, no spot colours. Use the hex values in "Colours".

## The assets

### Passport cover

- **Purpose.** The closed passport: the dark cover with the eagle emblem and the bilingual title "RETURNING SANDS / عودة الرمال". The component exists and is ready for the artwork; it is not yet placed on a page, so there is no rush on this one.
- **Format.** SVG for the site, plus a PNG export at 1600 px wide for print and social use.
- **Size.** Portrait, passport proportions (about 3:4). The site stretches it to cover the panel, so keep important detail away from the edges.
- **Colour.** Dark green ground (we currently use `nile-900` `#0a1825`; a true passport green is fine), emblem and lettering in light sand or metallic-looking flat colour. RGB.
- **Text.** The title and the word "PASSPORT" are drawn by the site in live text. Supply the cover with the emblem only, and a second version with your lettering if you want us to match its placement.
- **Path.** `public/design/passport-cover.svg`. Put the PNG next to it as `public/design/passport-cover.png`; the site does not read the PNG.
- **Mechanism.** Flag `site.designAssets.passportCover`.

### Passport open spread background

- **Purpose.** The open two-page spread behind the Home page hero. The Returning Sands stamp sits on the left page, the three city stamps on the right page.
- **Format.** SVG or PNG. PNG if it relies on paper texture or photography.
- **Size.** 2400 px wide, two equal pages side by side (about 2:1). On phones the two pages stack vertically, so each half must also work on its own as a page.
- **Colour.** Pale paper on each page, close to `sand-100` `#f1e8d4`, with the centre gutter darker. Guilloche patterns, faint watermarks and page edges welcome. RGB.
- **Text.** None at all. The site places the stamps on top.
- **Path.** `public/design/passport-spread.png` (keep this exact name even if you deliver SVG content; tell us and we will adjust).
- **Mechanism.** Flag `site.designAssets.passportSpread`.

### Returning Sands oval stamp

- **Purpose.** The main logo mark: an oval rubber stamp with a dashed border and the bilingual name. Used on the Home hero, the 404 page and as the top half of every event stamp.
- **Format.** SVG.
- **Size.** 3:2 oval. Rendered at about 160 × 106 px on screen, sometimes larger, so draw it clean at any size.
- **Colour.** Black ink (`ink` `#18130c`) on a transparent background. One colour only.
- **Text.** The words "RETURNING SANDS" and "عودة الرمال" are live text. Supply the oval, dashed border and any ornament without the words, plus a lettered reference version.
- **Path.** `public/design/stamp-oval.svg`.
- **Mechanism.** Flag `site.designAssets.stampOval`.

### Eight event stamp variants

- **Purpose.** One stamp per event: the oval above a small rectangular box carrying the event label. There are seven events plus one for the film page labelled "THE DOCUMENTARY".
- **Format.** SVG, one file per variant.
- **Size.** Same oval as above with the label box beneath; keep the whole thing in a consistent bounding box across all eight.
- **Colour.** Black ink on transparent. One colour.
- **Text.** The label text below is live HTML; supply the box empty, plus a lettered reference version for each.
- **Path.** Folder `public/design/event-stamps/`, one file per event named after its id:

| File | Label the site prints |
| --- | --- |
| `cairo-auc-conversation.svg` | IN CONVERSATION / AUC — Cairo |
| `cairo-access-art-exhibition.svg` | EXHIBITION / Access Art Space — Cairo |
| `nyc-exclusive-showcase.svg` | EXCLUSIVE SHOWCASE / New York |
| `nyc-performance-night.svg` | PERFORMANCE / The People's Forum — NYC |
| `nyc-space-360-exhibition.svg` | EXHIBITION / Space 360 — NYC |
| `london-ruby-cruel.svg` | EXHIBITION / Ruby Cruel — London |
| `london-culture-house.svg` | IN CONVERSATION / Culture House — London |
| `the-documentary.svg` | THE DOCUMENTARY |

- **Mechanism.** Flag `site.designAssets.eventStamps`. The folder must contain all eight before the flag goes on. (Developer note: the event stamp component currently draws the shared oval; reading the per-event files behind this flag is a small wiring task once the files land.)

### Three city stamps

- **Purpose.** The three boxed, hand-drawn stamps on the right-hand passport page. Each one is a link to a city page.
- **Format.** SVG, one file per city, each with a default and a hover state.
- **Size.** Boxed landscape, roughly 3:1. On screen each is at least 44 × 44 px tall so it can be tapped; expect about 140 × 48 px.
- **Colour.** Default state in `stamp-600` `#7c4c66` on transparent; hover state darker, in `stamp-700` `#5f3a4f`. The site tilts each stamp slightly, so deliver them upright.
- **Text.** The city name (LONDON, CAIRO, NYC) is live text. Supply the frame only, plus a lettered reference.
- **Path.** Folder `public/design/city-stamps/`, files `london.svg`, `cairo.svg`, `nyc.svg`. For the hover state, deliver `london-hover.svg`, `cairo-hover.svg`, `nyc-hover.svg` alongside; the developer wires them in.
- **Mechanism.** Flag `site.designAssets.cityStamps`.

### Boarding pass template

- **Purpose.** The airline-ticket card used for event summaries on the Campaign page and for the share images people see when a link is posted. Layout: "BOARDING PASS / RETURNING SANDS", `FROM → TO` airport codes, `EVENT 001`, date, title, with a perforated tear line between the two parts.
- **Format.** SVG, two variants: a fixed 1200 × 630 px version for share cards, and a flexible web version whose middle can stretch.
- **Size.** Share version exactly 1200 × 630 px. Web version drawn at about 600 × 200 px with a perforation that stays put as it widens.
- **Colour.** Paper ground in `sand-50` `#faf5ec` or `sand-100`, rules in `ink`, one accent (we use `ochre-500` `#b8651f`). Transparent outside the card.
- **Text.** Every field is live text in IBM Plex Mono. Supply the card with empty fields, plus a lettered reference so we match your positions.
- **Path.** Web version `public/design/boarding-pass.svg`. Share version `public/design/boarding-pass-share.png` (PNG export; the share-card renderer cannot read complex SVG).
- **Mechanism.** Flag `site.designAssets.boardingPass`.

### Admission ticket template

- **Purpose.** The email signup form on the Virtual Museum page, styled as a museum admission ticket. Contains a label, an email box and a "Reserve my ticket" button.
- **Format.** SVG.
- **Size.** Landscape, roughly 3:1, about 480 × 160 px on screen. Stretches a little on narrow phones.
- **Colour.** Paper ground, `ink` rules, optional accent. Transparent outside the ticket.
- **Text.** All live. Supply the ticket shape with empty fields.
- **Path.** `public/design/admission-ticket.svg`.
- **Mechanism.** Flag `site.designAssets.admissionTicket`.

### Passport card frame

- **Purpose.** The frame around each team member's card, styled as a passport identity page: photo on the left or top, then name, role, base, bio.
- **Format.** SVG.
- **Size.** Portrait 3:4 photo window; the frame sits around a card about 320 × 460 px on screen.
- **Colour.** Paper ground, `ink` rules, faint guilloche welcome. Transparent outside the frame; the photo window must be transparent so the headshot shows through.
- **Text.** All live.
- **Path.** `public/design/passport-card-frame.svg`.
- **Mechanism.** Flag `site.designAssets.passportCardFrame`.

### Silhouette placeholder portrait

- **Purpose.** Shown in a team card when the person's headshot has not arrived. The site labels it "Portrait coming soon" for screen readers.
- **Format.** SVG.
- **Size.** 3:4 portrait, filling the photo window.
- **Colour.** Flat `sand-200` `#e8dcc4` ground with the figure in `sand-400` `#c19a5b` or `ink` at low opacity. Keep it quiet.
- **Text.** None.
- **Path.** `public/design/silhouette.svg`.
- **Mechanism.** Flag `site.designAssets.silhouette`.

### Standalone wordmark

- **Purpose.** The horizontal "Returning Sands" wordmark for the top navigation and footer, and for partners to use.
- **Format.** SVG, two colourways: black and reversed white.
- **Size.** Horizontal, about 6:1. Displayed at roughly 160 × 28 px in the navigation.
- **Colour.** Black version in `ink` `#18130c`; reversed version in `sand-50` `#faf5ec`. Transparent background.
- **Text.** This is the one asset where the lettering is the artwork. Still deliver the live-text fallback: tell us the typeface and tracking so the HTML version matches when the image is not available.
- **Path.** `public/design/wordmark.svg` (black) and `public/design/wordmark-reversed.svg` (white).
- **Mechanism.** File replacement. No flag. (Developer note: the navigation currently shows the name as text; picking up `wordmark.svg` when present is a small wiring task once the file lands.)

### Favicon and app icon set

- **Purpose.** The small icon in browser tabs, bookmarks and on phone home screens. Usually the oval stamp simplified.
- **Format.** SVG source plus PNG exports at 32, 180 and 512 px square.
- **Size.** Square. Keep the mark inside a safe area with about 10% margin; iOS rounds the corners of the 180 px icon.
- **Colour.** Full colour allowed. The SVG should read well on both light and dark tab bars. PNGs on a solid `sand-50` background (iOS does not accept transparency on the 180 px icon).
- **Text.** None.
- **Path.** SVG → `app/icon.svg`. 180 px → `app/apple-icon.png`. 32 px → `public/design/icon-32.png`. 512 px → `public/design/icon-512.png`.
- **Mechanism.** File replacement. No flag. The two files in `app/` replace the current stand-in icons and are served at the next build; the two in `public/design/` are not read by the site yet and are kept for a future web manifest and for partners.

### Default share-card background

- **Purpose.** The paper texture behind every share image (the preview shown when a page is posted on WhatsApp, iMessage, LinkedIn). Text and the stamp are drawn on top by the site.
- **Format.** PNG, pre-compressed to under 200 KB. Please export at that size yourself (TinyPNG or similar); the site uses the file as delivered.
- **Size.** Exactly 1200 × 630 px.
- **Colour.** Paper in the `sand` range, subtle grain, no vignette heavier than about 10%. Must leave the central area calm enough for dark text at `ink` to pass contrast.
- **Text.** None.
- **Path.** `public/design/share-bg.png`.
- **Mechanism.** File replacement. No flag.

### Instagram templates

- **Purpose.** Post and story templates for the campaign's Instagram, in the site's visual language. The six accent colours in "Colours" come from these templates; please confirm or correct the hex values.
- **Format.** PNG exports plus the layered source (Figma, Illustrator or Photoshop).
- **Size.** 1080 × 1080 px (post) and 1080 × 1920 px (story).
- **Colour.** The six colour fields: ochre yellow, deep blue, brick red, pale pink, dusty blue, terracotta. RGB.
- **Text.** Editable layers in the source so the team can change dates and titles.
- **Path.** `design-src/instagram/` in the repository (for example `design-src/instagram/post-1080x1080.png`, `design-src/instagram/story-1080x1920.png`, plus the source file). This folder is not published to the website.
- **Mechanism.** None. These are not shown on the site; they are kept with the project for the team.

## Colours

The six accent colours are taken from the Instagram templates. The values below are provisional until you confirm them. They live in one file, `app/globals.css`, and nothing else on the site may contain a colour value.

| Token name | Hex | Where it is used |
| --- | --- | --- |
| `accent-ochre-yellow` | `#d9a441` | Instagram field 1 |
| `accent-deep-blue` | `#1b3a5c` | Instagram field 2 |
| `accent-brick-red` | `#a3391f` | Instagram field 3; the red "DENIED" overprint on the 404 page |
| `accent-pale-pink` | `#efd3d0` | Instagram field 4 |
| `accent-dusty-blue` | `#7f9bb3` | Instagram field 5 |
| `accent-terracotta` | `#c2643d` | Instagram field 6 |

The core palette, carried over from the current site:

| Token name | Hex | Role |
| --- | --- | --- |
| `sand-50` | `#faf5ec` | Page background |
| `sand-100` | `#f1e8d4` | Passport pages, cards |
| `sand-200` | `#e8dcc4` | Panels |
| `sand-300` | `#d4b886` | Borders |
| `sand-400` | `#c19a5b` | Darker sand |
| `ochre-500` | `#b8651f` | Donate button, links, accents |
| `ochre-600` | `#8b4513` | Donate button hover |
| `nile-700` | `#1a3a52` | Deep blue |
| `nile-800` | `#122a3d` | Focus outlines |
| `nile-900` | `#0a1825` | Passport cover ground |
| `ink` | `#18130c` | Text and stamp ink |
| `stamp-200` | `#e2c9d3` | Lightest stamp tint |
| `stamp-400` | `#b487a0` | Stamp tint |
| `stamp-500` | `#96617c` | Quote rule on What's at Stake |
| `stamp-600` | `#7c4c66` | City stamp border, default |
| `stamp-700` | `#5f3a4f` | City stamp border on hover; "PAST" overprint; the 60% statistic |

## Type

Two typefaces, no more.

- **Display font (headlines and body): Bitter**, weights 400 and 700, in normal and italic. This is the stand-in for **AVRO Regular (400) and AVRO Bold (700)**. If the AVRO web licence is confirmed and the font files are supplied, the site switches to AVRO by changing one file; nothing else moves. Design in AVRO if you have it; check that it also holds up in Bitter.
- **Mono font (kickers, names, lists, stamp and boarding-pass text): IBM Plex Mono**, weights 400 and 600.

Neither font has Arabic glyphs. The Arabic title "عودة الرمال" falls back to a system Naskh face on the visitor's device, so do not rely on a specific Arabic typeface in artwork that sits behind live text.

Share cards currently omit the Arabic title for this reason; supplying an Arabic-capable `.woff`/`.ttf` under `public/fonts/` enables it.

## Rules

1. **Text stays live.** Every asset that contains words must also be supplied with the words removed, or with the words on a separate layer we can hide. On the site the words are real HTML on top of your artwork. Deliver a lettered reference version too, so we can match position and size.
2. **Transparent backgrounds.** Stamps, frames, tickets, the wordmark and the boarding pass sit on paper or on other artwork. Export with transparency; only the page-sized backgrounds (passport spread, share-card background) are opaque.
3. **Keep the stand-in proportions.** Oval stamp 3:2, city stamps about 3:1, portrait windows 3:4, share images 1200 × 630, boarding pass two-part with a tear line. The layout is built around these; a different aspect ratio will be cropped or stretched.
4. **SVG hygiene.** Outline or embed nothing we did not ask for: no linked images, no fonts, no scripts, no raster effects. Flatten strokes you want to keep exact. Keep each SVG under about 100 KB.
5. **One file per path.** Use exactly the file names in this document, lower-case, hyphens, no spaces. The site looks for those names and nothing else.
6. **The build checks for you.** If a flag is on and the file is missing, the site refuses to publish and prints the asset name and the path it expected. Nothing you deliver can break the live site by accident; at worst a preview fails and tells us why.
7. **Pre-compress raster files.** `share-bg.png` under 200 KB; PNG icons under 50 KB each; the passport spread PNG under 600 KB.
