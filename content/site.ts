import type { SiteContent } from "@/lib/types";

/**
 * Site-wide copy: name, nav, About, What's at Stake, campaign lines, contacts,
 * per-page SEO titles/descriptions, Designer_Asset flags and site-level Placeholders.
 *
 * REVIEW NOTES:
 * - VERBATIM (user-supplied, do not edit without sign-off): description,
 *   about.aboutUs, about.mission, about.goals, atStake.body.
 *   The one correction applied: the source typo "painted, painted" in the
 *   Mission is rendered as "written, painted, produced" (Req 3.3).
 * - STILL DRAFTED (needs sign-off): campaign.museumTeaser, campaign.donateLine,
 *   and every title/description in `pages`.
 * - CONTACTS: `general` and `donations` are confirmed inboxes. The four named
 *   contacts (yusef, paris, camilla, cillian) stay `confirmed: false` until the
 *   owner confirms each address is live; until then their links route to the
 *   general inbox (Req 11.10).
 * - `companyNumber` is the Companies House number on its own; the grouped
 *   `pending.companyRegistration` stays null until the registered office
 *   address is known (all-or-nothing group).
 * - `pending.emailProvider` is Web3Forms (ported from the Old_Site, 2026-10-01):
 *   the form posts to api.web3forms.com, which relays the fields to
 *   info@returningsands.org. The `redirect` hidden field uses the PRODUCTION
 *   origin, so on the preview deployment a successful submit lands on the old
 *   site's /museum/thanks (a 404) until cutover — accepted for now.
 */
export const site: SiteContent = {
  name: "Returning Sands",
  arabicName: "عودة الرمال",
  kicker: "A FILM & IMPACT CAMPAIGN",
  description:
    "A documentary and impact campaign about what it means to return home — tracing one journey back to Sudan, and what it takes to rebuild.",
  url: "https://returningsands.org",

  nav: [
    { label: "About", href: "/about" },
    { label: "What's at Stake", href: "/at-stake" },
    { label: "Impact Campaign", href: "/campaign" },
    { label: "The Documentary", href: "/film" },
    { label: "Team", href: "/team" },
    { label: "Support", href: "/support" },
    { label: "Donate", href: "/donate" },
  ],

  social: {
    instagram: "https://www.instagram.com/returningsands",
    linkedin: "https://www.linkedin.com/company/returningsands",
  },

  about: {
    aboutUs: [
      "Founded in 2026 by Camilla Marchese, Yusef Bushara, and Paris Sistilli, Returning Sands (عودة الرمال) is a kaleidoscopic arts-and-culture campaign focused on amplifying the fight for Sudan's cultural heritage around the world. Working at the intersection of documentary filmmaking, public exhibition, and intercultural education, Returning Sands seeks to ensure that Sudanese heritage remains visible, accessible, and understood for generations to come. As a registered CIC, Returning Sands is entirely not-for-profit, and all funds generated are reinvested in the mission.",
    ],
    mission: [
      "The organisation's title reflects its most fundamental commitments: to work alongside forcibly displaced Sudanese heritage professionals and artists to envision what return might look like – by the millions, one day, like the grains of sand that populate Sudan's vast landscapes.",
      "Returning Sands aims to cast light on the destruction inflicted upon Sudanese cultural heritage but, more importantly, to offer an alternative vision for the future of Sudan, as written, painted, produced, imagined and created by Sudanese people and their allies around the world.",
    ],
    goals: [
      "Support the documentation of endangered Sudanese heritage and lived memory.",
      "Amplify the work of Sudanese heritage professionals, including emerging efforts tied to Blue Shield Sudan.",
      "Collaborate with Sudanese artists and heritage experts to tackle the issue of futurity in an interdisciplinary fashion.",
      "Enable future pathways to rebuild, recover, and sustain Sudanese cultural heritage – within the country and across the diaspora.",
      "Position culture as a core component of humanitarian and conflict response.",
    ],
  },

  atStake: {
    quote:
      "Country is more than territory, it is memory … So if you protect that now, in the middle of this chaos, then we will have a foundation through which we can rebuild.",
    quoteBy: "Ali Nour",
    body: [
      "Cultural heritage is a tangible expression of identity. In times of conflict, it becomes a strategic target for those seeking to erode the memory, cohesion, and continuity of a people.",
      "Although commonly referred to as a 'civil war,' Sudan, since 2023, has actually been in the throes of a counter-revolutionary war. The country has witnessed widespread and irreversible damage to archaeological sites, archives, and museums. Notably, through acts of \"deliberate cultural erosion,\" 60% of the Sudan National Museum's holdings have been looted in the last three years.",
      "Even though Sudanese heritage expert Ali Nour notes, \"what's done is done,\" an urgency remains to remember despite irrevocable loss.",
      "Destruction in Sudan is ongoing, not confined to the past, making immediate documentation and action essential. Fully grasping the scale of loss is critical to informing preventative strategies for the country's future. At the same time, heritage workers continue to operate under extreme, time-sensitive conditions with limited visibility and support, underscoring the urgent need for greater aid, technical expertise, and protective resources.",
    ],
    stat: {
      value: "60%",
      label: "of the Sudan National Museum's holdings looted in the last three years",
    },
    images: [
      { src: "/img/meroe.jpg", alt: "The pyramids of Meroë rising from the desert in northern Sudan" },
      { src: "/img/gateway.jpg", alt: "A historic stone gateway, part of Sudan's architectural heritage" },
      { src: "/img/portrait.jpg", alt: "Archival studio portrait of a Sudanese sitter in formal dress" },
    ],
  },

  campaign: {
    museumTeaser:
      "The Virtual Museum will gather what the campaign collects — oral histories, personal archives, photographs, and records of what has been lost — into a place that anyone, anywhere, can visit. Reserve a ticket and we'll let you know when the doors open.",
    donateLine:
      "Every event in Cairo, London, and New York is a fundraising catalyst for the documentary at the heart of the project. Your donation goes directly towards making the film.",
  },

  support: {
    contacts: [
      { key: "general", name: "Returning Sands", role: "General enquiries", confirmed: true },
      { key: "donations", name: "Donations team", role: "Giving and receipts", confirmed: true },
      { key: "yusef", name: "Yusef Bushara", role: "Producer · Co-Founder", confirmed: false },
      { key: "paris", name: "Paris Quetzal Sistilli", role: "Producer · Co-Founder", confirmed: false },
      { key: "camilla", name: "Camilla Marchese González", role: "Producer · Co-Founder", confirmed: false },
      { key: "cillian", name: "Cillian Lavelle", role: "Finance Coordinator", confirmed: false },
    ],
  },

  companyNumber: "17311689",

  pages: {
    home: {
      title: "Returning Sands — A Film & Impact Campaign",
      description:
        "A short documentary and impact campaign protecting Sudanese cultural heritage, with events in Cairo, London, and New York. Watch, attend, donate.",
    },
    about: {
      title: "About Returning Sands",
      description:
        "Who we are, what we set out to do, and the five goals that hold the work together. A UK Community Interest Company founded in 2026.",
    },
    atStake: {
      title: "What's at Stake — Returning Sands",
      description:
        "Why Sudanese cultural heritage is under threat: looted museums, destroyed archives, and heritage workers operating under fire since 2023.",
    },
    film: {
      title: "The Documentary — Returning Sands",
      description:
        "A short documentary directed by Aicha Cherif following Ali Nour of Blue Shield Sudan as he coordinates heritage protection from exile in Cairo.",
    },
    campaign: {
      title: "Impact Campaign — Returning Sands",
      description:
        "Seven exhibitions, conversations, and performances across Cairo, London, and New York, raising visibility and funds for the documentary.",
    },
    campaignCairo: {
      title: "Cairo Events — Returning Sands",
      description:
        "Returning Sands in Cairo: a conversation at the American University in Cairo and an exhibition at Access Art Space, December 2026.",
    },
    campaignLondon: {
      title: "London Events — Returning Sands",
      description:
        "Returning Sands in London: an exhibition at Ruby Cruel and a conversation at Culture House, January and February 2027.",
    },
    campaignNyc: {
      title: "New York Events — Returning Sands",
      description:
        "Returning Sands in New York: a performance night at The People's Forum, an exclusive showcase, and an exhibition at Space 360.",
    },
    museum: {
      title: "Virtual Museum — Returning Sands",
      description:
        "A museum of Sudanese cultural memory built from oral histories, personal archives, and records of lost artefacts. Reserve your ticket for opening day.",
    },
    museumThanks: {
      title: "Ticket Reserved — Returning Sands",
      description:
        "Your ticket for the Returning Sands Virtual Museum is reserved. We'll email you when the museum opens its doors.",
    },
    team: {
      title: "Team — Returning Sands",
      description:
        "Meet the producers, director, executive producer, and core team behind Returning Sands, working between New York, London, and Cairo.",
    },
    support: {
      title: "Support & Contact — Returning Sands",
      description:
        "Get in touch with the Returning Sands team, follow the campaign, and see the partners and supporters already backing the project.",
    },
    donate: {
      title: "Donate — Returning Sands",
      description:
        "Support Returning Sands in USD via our fiscal sponsor SIMA Studios, or in GBP from the UK and elsewhere. Every donation goes towards the film.",
    },
    privacy: {
      title: "Privacy — Returning Sands",
      description:
        "How the Returning Sands website handles your data: cookie-less analytics, no tracking cookies, and how Virtual Museum ticket emails are used.",
    },
    notFound: {
      title: "VISA DENIED — page not found",
      description:
        "The page you were looking for does not exist on returningsands.org. Head back to the home page to find the film, events, and ways to donate.",
    },
  },

  designAssets: {
    stampOval: false,
    passportCover: false,
    passportSpread: false,
    cityStamps: false,
    boardingPass: false,
    admissionTicket: false,
    passportCardFrame: false,
    silhouette: false,
    eventStamps: false,
  },

  pending: {
    campaignOverview: "",
    emailProvider: {
      provider: "Web3Forms (relayed to info@returningsands.org)",
      actionUrl: "https://api.web3forms.com/submit",
      hiddenFields: {
        // Public by design: the key only lets this site submit to the form
        // that forwards to info@returningsands.org.
        access_key: "b24cc743-7a95-4a52-9fcc-5427cf5e251b",
        subject: "Virtual Museum ticket — returningsands.org",
        from_name: "Returning Sands website",
        // Production origin on purpose (Req 9.3); see REVIEW NOTES above.
        redirect: "https://returningsands.org/museum/thanks",
        // Honeypot: Web3Forms drops any submission where this is filled.
        botcheck: "",
      },
      emailFieldName: "email",
    },
    funderAcknowledgement: null,
    companyRegistration: null,
    contactEmails: {
      general: "info@returningsands.org",
      donations: "donations@returningsands.org",
      yusef: "yusef@returningsands.org",
      paris: "paris@returningsands.org",
      camilla: "camilla@returningsands.org",
      cillian: "cillian@returningsands.org",
    },
  },
};
