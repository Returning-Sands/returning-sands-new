import type { MuseumContent } from "@/lib/types";

/**
 * Virtual Museum teaser page (Req 8). All copy here is drafted placeholder-quality
 * text based on the Old_Site "Oral History Project" section and the project brief;
 * it is intentionally technology-neutral (Req 8.8) and needs team review.
 *
 * `pending.workOfAmer` is the Placeholder for the paragraph on the work of Amer
 * Matar / the Prisons Museum inside "What it is" (Req 8.5).
 */
export const museum: MuseumContent = {
  intro: [
    "The Virtual Museum is where the campaign's collecting ends up: a museum of Sudanese cultural memory that anyone, anywhere, can visit. It is being built from oral histories recorded with Sudanese artists in exile, from personal and civil-society archives shared with the project, and from the records of what has already been lost.",
    "The museum is in planning. Reserve a ticket below and we will email you once when it opens.",
  ],

  whatItIs: [
    "In consultation with Oral Historian Afra Elagab, the project will follow ten Sudanese artists in Cairo, documenting their experiences of exile, displacement, and cultural loss — collecting personal archives of photographs, documents, artworks, and objects that go beyond the artists themselves, drawing from the wider Sudanese community in Cairo and abroad.",
    "These materials will be digitised into a community-led archive, positioning civil-society collections as critical resources for post-conflict cultural recovery — ultimately becoming a virtual museum, making Sudanese cultural memory accessible to audiences worldwide. The museum is a collecting and publishing effort first; how it is presented will follow the material, not the other way round.",
  ],

  collections: [
    {
      title: "Collections",
      description:
        "Artworks, photographs, documents, and objects shared by Sudanese artists and families in Cairo and across the diaspora, catalogued with the stories of the people who kept them.",
    },
    {
      title: "Archival materials",
      description:
        "Records from partner archives, including material held by the Sudan Human Rights Hub that has never been shown publicly, alongside research gathered with the American University in Cairo.",
    },
    {
      title: "Oral histories",
      description:
        "Recorded testimony from ten Sudanese artists in exile, gathered with Oral Historian Afra Elagab, on displacement, loss, and the making of culture away from home.",
    },
    {
      title: "Lost artefacts room",
      description:
        "A record of what has been looted, destroyed, or gone missing from Sudan's museums, archives, and historic sites since 2023, so that loss is documented rather than forgotten.",
    },
  ],

  roadmap: [
    {
      label: "Access to archives secured",
      description:
        "Agreements with Sudanese archives and partner institutions give the project material to work from, including collections never shown before.",
      dateText: "2026",
    },
    {
      label: "Oral histories and exhibitions",
      description:
        "Ten artists are interviewed in Cairo while exhibitions and conversations run in Cairo, London, and New York, adding to the collection as they go.",
      dateText: "Nov 2026 – Feb 2027",
      current: true,
    },
    {
      label: "Digitisation and cataloguing",
      description:
        "Collected material is digitised, described, and checked with the people who shared it, with consent recorded for everything that will be shown.",
      dateText: "2027",
    },
    {
      label: "Doors open",
      description:
        "The Virtual Museum opens to the public. Everyone holding a ticket is emailed on opening day.",
      dateText: "Date TBA",
    },
  ],

  ticket: {
    label: "Your email address",
    buttonLabel: "Reserve my ticket",
    consentText:
      "Yes, email me occasionally about events, the film and how donations are used. Unsubscribe any time.",
    privacyNote:
      "We will use your email only to let you know when the Virtual Museum opens, and for nothing else.",
    privacyNoteProviderTbc:
      "We will use your email only to let you know when the Virtual Museum opens, and for nothing else; our email provider is to be confirmed.",
  },

  thanks: {
    sentence: "Your ticket is reserved — we will email you when the Virtual Museum opens.",
    backLabel: "Back to the Virtual Museum",
  },

  pending: {
    workOfAmer: "",
  },
};
