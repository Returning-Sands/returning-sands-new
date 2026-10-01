# Editing the website's content

Everything a visitor reads on returningsands.org lives in the seven files in this `content/` folder. Dates, links, team bios, partner names, the Stripe link, the trailer URL: all of it is here. Nothing you need to change is anywhere else.

You do not need to know how to code. Each file is a list of labelled values. Find the label, change the text between the quotes, save the file. Keep the quotes, commas and brackets as they are.

Two things to know before you start:

- Text sits between double quotes: `title: "Exhibition at Ruby Cruel",`. If your text itself contains a double quote, write it as `\"` or use curly quotes (“ ”) instead.
- Every line inside a `{ ... }` block ends with a comma. Copy an existing line and edit it rather than typing from scratch.

If something is wrong (a missing comma, a date in the wrong form, a photo path that does not exist), the site will not publish a broken page. Instead the build fails and prints a readable message, for example:

```
Content validation failed with 1 error:
  [content/events.ts] event "london-ruby-cruel": field "date" range end must be on or after start (got start 2027-02-06, end 2027-01-16)
```

Each line names the file, the item and the field. Fix that and run the build again.

Where the message appears:

- If you run `npm run build` on your own computer, it is printed in the terminal window at the end of the output.
- If you pushed a branch to GitHub, open the pull request, click the Vercel preview check, then "Build Logs". The same message is near the bottom, in red.

When the build succeeds it finishes with a short list of what is still missing. See "How to fill a Placeholder" below.

## What each file contains

- `site.ts` — Site-wide words. The site name and Arabic name, the kicker "A FILM & IMPACT CAMPAIGN", the one-line description on the Home page, the navigation links, Instagram and LinkedIn URLs, the About page (About us, Mission, the five Goals), the What's at Stake page (quote, body text, the 60% statistic, archival images), the Virtual Museum teaser and donate line on the Campaign page, the Support page contacts (including the Donations team), the Companies House number shown in the footer (`companyNumber`), the browser tab title and search description for every page, the `designAssets` on/off switches for the designer's artwork, and the site-level Placeholders (campaign overview, email provider, funder acknowledgement, company registration, contact emails).
- `events.ts` — The three cities (name, one-line framing sentence, airport code) and the seven impact events for Cairo, London and New York: title, stamp label, venue, date, blurb, sponsor line, images, ticket link. Also the two date Placeholders (Exclusive Showcase date, Culture House day).
- `team.ts` — The three team groups and the ten team members: name, role, group, where they are based, bio, photo and display order.
- `partners.ts` — The "Partners & Supporters" heading and the thirteen partner names shown on the Support page, with each partner's logo, website link and logo-permission status.
- `donate.ts` — The Donate page. US panel (SIMA tagline, PayPal and SIMA links), UK panel (the sentence above the card button, button labels, the text shown while Stripe and bank details are missing, the payment-reference instruction), the two legal statements, the "Questions about giving?" line (the address comes from `site.ts` contact emails), and the Placeholders for the Stripe Payment Link and bank details (account name, sort code, account number, plus optional IBAN and BIC).
- `film.ts` — The Documentary page. Section headings, director Aicha Cherif (name, credential, director's note), protagonist Ali Nour (bio and photo), the two backers (Sundance x Adobe Ignite Fellowship, SIMA Studios), the "Trailer coming soon" text, and the Placeholders for the logline, the about-the-film text and the trailer URL. The Home page's trailer button reads the trailer URL from here too.
- `museum.ts` — The Virtual Museum page. Intro paragraphs, "What it is", the collection areas, the roadmap stages (exactly one marked `current: true`), the Admission Ticket label, button, consent-checkbox sentence and privacy note (the same ticket is reused as the mailing-list signup on the Support page), the thank-you page text, and the Placeholder for the paragraph on the work of Amer.

## How to fill a Placeholder

A Placeholder is a value we know we need but do not have yet. Every Placeholder lives in the `pending: { ... }` block at the bottom of its file. There is exactly one copy of each, so filling it in once updates every page that shows it.

An empty Placeholder looks like one of these:

- `""` (two double quotes with nothing between them) for a piece of text or a link
- `null` for a group of related values, such as bank details

Both mean "not yet available". Spaces only (`"   "`) also count as empty. While a Placeholder is empty the site shows the agreed fallback instead: a disabled "Trailer coming soon" button, a dashed "[Copy to follow]" box, the "coming shortly" text on the UK donate panel, and so on. It never prints the word "null".

One value that is not a Placeholder but behaves like one: `companyNumber` in `site.ts`. The footer shows "Returning Sands CIC · Company no. 17311689 · Registered office to follow" while it is filled and the grouped `companyRegistration` is still `null`. Once the registered office is known, fill all three fields of `companyRegistration` and the footer shows the full line instead.

After every successful build the site prints what is still outstanding. Today the list reads:

```
Outstanding Placeholders (9):
  content/site.ts   pending.campaignOverview
  content/site.ts   pending.funderAcknowledgement
  content/site.ts   pending.companyRegistration
  content/events.ts   pending.exclusiveShowcaseDate
  content/events.ts   pending.cultureHouseDay
  content/film.ts   pending.logline
  content/film.ts   pending.aboutFilm
  content/film.ts   pending.trailerUrl
  content/museum.ts   pending.workOfAmer
```

(The Stripe link, bank details and email provider were filled on 2026-10-01 from the old site, so they no longer appear.)

You can print it yourself at any time without a full build: `npx tsx scripts/placeholder-summary.ts`.

When everything is filled it prints a single line: `No Placeholders are outstanding.`

### Grouped Placeholders are all-or-nothing

Some Placeholders are a group of fields: bank details (account name, sort code, account number) and company registration (name, number, address). The site shows a group only when every field in it is filled. If you fill two of three, the whole group is treated as empty, the fallback stays on screen, and the summary says `partially filled — treated as empty`. Fill all of them in one go.

Two bank fields are optional extras and do not count: `iban` and `bic`. Leave them out, or leave them empty, and the three core fields still decide whether the panel shows.

### Example 1: the Stripe link (filled)

In `donate.ts`, the `pending` block holds the Stripe Payment Link:

```ts
  pending: {
    stripePaymentLink: "https://donate.stripe.com/XXXXXXXXXXXX",
    bankDetails: { ... },
  },
```

To take the card button off the page, set it back to `""`. To change it, paste the new Payment Link between the quotes. The "Donate by card" button (and the sentence above it, `uk.intro`) appears on the Donate page whenever the link is filled.

### Example 2: bank details (filled)

In the same block, `bankDetails` has the three core fields plus the two optional ones:

```ts
    bankDetails: {
      accountName: "Returning Sands Community Interest Company",
      sortCode: "08-92-99",
      accountNumber: "67540396",
      iban: "GB83 CPBK 0892 9967 5403 96",
      bic: "CPBKGB22",
    },
```

The UK panel shows one row per filled field, each with a Copy button, then the line "Please use your name as the payment reference." Set the whole value to `null` to take the details off the page.

### Example 2b: the email provider (filled)

In `site.ts`, `pending.emailProvider` describes where the Admission Ticket on the Virtual Museum page (and the "Join the mailing list" ticket on the Support page) sends sign-ups. Today it is Web3Forms, which emails each sign-up to info@returningsands.org; that email (address, consent sentence, time) is the consent record.

```ts
    emailProvider: {
      provider: "Web3Forms (relayed to info@returningsands.org)",
      actionUrl: "https://api.web3forms.com/submit",
      hiddenFields: {
        access_key: "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX",
        subject: "Virtual Museum ticket — returningsands.org",
        from_name: "Returning Sands website",
        redirect: "https://returningsands.org/museum/thanks",
        botcheck: "",
      },
      emailFieldName: "email",
    },
```

- `provider` — The name shown in the privacy note under the ticket and on the Privacy page ("Handled by …", "Sign-ups are relayed by …").
- `actionUrl` — The address the form posts to. Set it to `""` to switch the ticket off ("Ticket desk opening soon") without deleting the rest.
- `hiddenFields` — Extra values sent with every sign-up. For Web3Forms: `access_key` (the public form key), `subject` and `from_name` (how the relayed email is labelled), `botcheck` (a spam trap; leave it empty) and `redirect`.
- `redirect` — The full web address the visitor is sent to after a successful sign-up. It must be the production address `https://returningsands.org/museum/thanks`, not a preview URL. Until the domain moves to the new site (see `CUTOVER.md`), a sign-up made on a preview deployment therefore lands on the old site's `/museum/thanks`, which does not exist there. That is accepted for now; it fixes itself at cutover.
- `emailFieldName` — The name the provider expects for the email field (`email` for Web3Forms).

Switching to a newsletter service later means replacing this one object and nothing else.

### Example 3: the trailer URL

In `film.ts`, find:

```ts
  pending: {
    logline: "",
    aboutFilm: "",
    trailerUrl: "",
  },
```

Paste the YouTube or Vimeo link:

```ts
    trailerUrl: "https://www.youtube.com/watch?v=XXXXXXXXXXX",
```

The Home page button becomes "Watch the Trailer" and the Documentary page embeds the video. Fill `logline` and `aboutFilm` the same way: paste the text between the quotes.

## How to add an Event

Events live in the `events: [ ... ]` list in `events.ts`. Copy an existing event block, paste it after the last one in the list, and change the values. Here is an event with every field filled in:

```ts
    {
      id: "london-ruby-cruel",
      title: "Exhibition at Ruby Cruel",
      stampLabel: "EXHIBITION / Ruby Cruel — London",
      city: "london",
      venue: "Ruby Cruel",
      date: { start: "2027-01-16", end: "2027-02-06" },
      dateDisplay: "From 16 January 2027, for three weeks",
      status: "upcoming",
      blurb:
        "From January 16th 2027, for three weeks, we will host Returning Sands, the exhibition, at Ruby Cruel gallery.",
      sponsorLine: "This activation has been generously sponsored by the Bermuda Arts Council.",
      images: [
        { src: "/img/events/ruby-cruel-1.jpg", alt: "Visitors in the Ruby Cruel gallery on opening night" },
      ],
      externalLink: { label: "Reserve a place", href: "https://www.eventbrite.co.uk/e/xxxxxxxx" },
      airportCodes: { from: "CAI", to: "LHR" },
    },
```

What each field is for:

- `id` — A short name made of lower-case letters, numbers and hyphens, used in the page address (`/campaign/london#london-ruby-cruel`). Must be different from every other event's `id`.
- `title` — The event name shown as the heading.
- `stampLabel` — The short text in the rectangular box under the oval stamp. Pattern used so far: `"TYPE / Venue — City"`, in capitals for the type.
- `city` — Exactly one of `"cairo"`, `"london"` or `"nyc"`. This decides which city page the event appears on.
- `venue` — The venue name.
- `date` — One of three forms, see below.
- `dateDisplay` — The date as you want people to read it, for example `"18–20 December 2026"` or `"Date TBA"`. The site shows this text; it does not generate it from `date`.
- `status` — Optional. Leave it out and the site works it out from the date. See the next section.
- `blurb` — The paragraph describing the event.
- `sponsorLine` — Optional. One sentence shown under the blurb. Delete the line if there is no sponsor.
- `images` — Optional. Up to six photos. Each needs `src` (a path to a file you have put under `public/`, so `/img/events/photo.jpg` means the file `public/img/events/photo.jpg`) and `alt` (a sentence describing the picture for people who cannot see it). Delete the whole `images:` block if there are none.
- `externalLink` — Optional. A ticket or venue link with the button text (`label`) and the web address (`href`). Delete the line if there is none.
- `airportCodes` — Two three-letter airport codes in capitals, shown on the boarding-pass card as `FROM → TO`. The cities use `CAI` (Cairo), `LHR` (London) and `JFK` (New York).

### The three forms a date can take

```ts
      date: "2026-12-16",                                   // a single day
      date: { start: "2026-12-18", end: "2026-12-20" },     // a range, end on or after start
      date: null,                                           // date not yet known (TBA)
```

Dates are always written `YYYY-MM-DD` with a four-digit year, two-digit month and two-digit day. Use `null` (no quotes) when the date is not confirmed; the event is listed after the dated ones and shows your `dateDisplay` text. If only the month is known, use a range covering the whole month and say so in `dateDisplay`, as `london-culture-house` does with `"January 2027, day TBA"`.

### What the build rejects

The build will stop and tell you if:

- `id`, `title`, `stampLabel`, `venue`, `dateDisplay`, `blurb` or `airportCodes` is missing or empty
- two events share the same `id`
- `city` is not `cairo`, `london` or `nyc`
- `date` is not one of the three forms above, is not a real calendar date, or the range `end` is before `start`
- `status` is set to anything other than `"upcoming"` or `"past"`
- an airport code is not exactly three capital letters
- there are more than six images, an image has no `alt`, or its `src` points to a file that is not under `public/`
- `sponsorLine` or `externalLink` is present but empty

## How to mark an Event as past

You usually do not need to do anything. On every build the site compares today's date with the event's last day (the single `date`, or the `end` of a range). If today is later than that day, the event is marked past: its stamp gets a "PAST" overprint and it moves into the "Past events" group at the bottom of its city page. An event whose last day is today still counts as upcoming.

The check runs when the site is built, not when someone visits. So an event flips to past at the next deploy after its end date. Any push to GitHub triggers a deploy; if nothing has been pushed for a while, ask for a redeploy from the Vercel dashboard.

Two cases where you set it by hand, by adding one line to the event:

```ts
      status: "past",
```

- An event with `date: null` (TBA) that has in fact happened, or was cancelled and should be shown as past.
- An event you want to show as past before its end date, or keep as upcoming after it (use `status: "upcoming"` for that).

A `status` you write always wins over the automatic one. Remove the line to go back to automatic.

## How to add a team member

Team members live in the `members: [ ... ]` list in `team.ts`. Copy an existing member block and edit it:

```ts
    {
      name: "Afra Elagab",
      role: "Oral Historian",
      group: "Core Team",
      base: "Cairo",
      bio: "One or two sentences about the person.",
      photo: "/img/team/afra-elagab.jpg",
      order: 7,
    },
```

- `name` and `role` — Required.
- `group` — Required. Must be exactly one of the three names in the `groups` list at the top of the file: `"Producers & Co-Founders"`, `"Director & Executive Producer"` or `"Core Team"`. To add a fourth group, add its name to that list first.
- `base` — Optional. The city they work from. Delete the line to leave it off the card.
- `bio` — Optional. Delete the line to leave it off the card.
- `photo` — Optional. While it is missing the card shows a silhouette with the label "Portrait coming soon". To add one, save the picture under `public/img/` (for example `public/img/team/afra-elagab.jpg`) and write its path starting with `/img/`. The build checks that the file exists.
- `order` — Required. A whole number, 1 or more. Members are shown within their group from lowest to highest. Numbers do not have to be consecutive, so `15` after `10` is fine.

Photo advice: the card is a portrait (3:4) frame, like a passport photo. Crop the picture to 3:4 before saving, for example 900 pixels wide by 1200 pixels tall, with the face in the upper-middle. The site will crop anything else to fit, which can cut off heads. Save as JPG, and keep it under about 300 KB.

## How to add a partner

Partners live in the `partners: [ ... ]` list in `partners.ts`. They are shown on the Support page in the order they appear in the file. Copy a line and edit it:

```ts
    { name: "Access Art Space", permission: "pending" },
```

The full set of fields:

```ts
    {
      name: "Access Art Space",
      logo: { src: "/img/partners/access-art-space.svg", alt: "Access Art Space" },
      href: "https://www.accessartspace.com",
      permission: "granted",
    },
```

- `name` — Required. The partner's name as they write it.
- `permission` — Required. Whether we have their permission to show their logo. One of:
  - `"pending"` — We have not asked, or are waiting. The tile shows the name in text inside a dashed border, even if a `logo` is set.
  - `"granted"` — They said yes. The tile shows the logo (if `logo` is set).
  - `"not-required"` — No permission needed (for example an open-use logo). The tile shows the logo (if `logo` is set).
- `logo` — Optional. The logo file, saved under `public/img/` (for example `public/img/partners/access-art-space.svg`, or a PNG), with `src` as the path starting `/img/` and `alt` as the partner's name. Only shown when `permission` is `"granted"` or `"not-required"`. Delete the line to show the name as text instead.
- `href` — Optional. The partner's website. The whole tile becomes a link that opens in a new tab. Delete the line for no link.

Every tile is the same height, so logos are scaled to fit without cropping. Wide logos on a transparent background look best.
