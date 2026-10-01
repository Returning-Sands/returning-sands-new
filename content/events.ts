import type { EventsContent } from "@/lib/types";

/**
 * The three campaign cities and the seven impact Events (Req 7.6).
 *
 * REVIEW NOTES:
 * - VERBATIM (user-supplied, do not edit without sign-off): every event `blurb`,
 *   the `cairo-auc-conversation` title and the `nyc-exclusive-showcase` stampLabel.
 * - STILL DRAFTED (needs sign-off): city `framing` sentences (short factual
 *   summaries derived from the verbatim blurbs), the remaining titles,
 *   stampLabels, venues and dateDisplay strings.
 * - airportCodes are a first pass (CAI / LHR / JFK) and can be swapped freely.
 * - Date ranges for "Feb 2027" and "Jan 2027" cover the whole month until the
 *   days are confirmed.
 */
export const events: EventsContent = {
  cities: {
    cairo: {
      name: "Cairo",
      framing:
        "Two days in downtown Cairo: a half-day of discussion at AUC and an exhibition of fifteen Sudanese artists.",
      iata: "CAI",
    },
    london: {
      name: "London",
      framing:
        "An exhibition at Ruby Cruel and a fireside conversation at Culture House, January and February 2027.",
      iata: "LHR",
    },
    nyc: {
      name: "New York",
      framing: "A performance night, a private donor showcase, and an exhibition at Space 360.",
      iata: "JFK",
    },
  },

  events: [
    // ---------------------------------------------------------------- Cairo
    {
      id: "cairo-auc-conversation",
      title: "In Conversation at the American University in Cairo",
      stampLabel: "IN CONVERSATION / AUC — Cairo",
      city: "cairo",
      venue: "The American University in Cairo",
      date: "2026-12-16",
      dateDisplay: "16 December 2026",
      blurb:
        "On December 16th, The American University in Cairo will host a half-day series of discussions in collaboration with Sudanese heritage expert Dr. Amira Ahmed.",
      airportCodes: { from: "LHR", to: "CAI" },
    },
    {
      id: "cairo-access-art-exhibition",
      title: "Exhibition at Access Art Space",
      stampLabel: "EXHIBITION / Access Art Space — Cairo",
      city: "cairo",
      venue: "Access Art Space",
      date: { start: "2026-12-18", end: "2026-12-20" },
      dateDisplay: "18–20 December 2026",
      blurb:
        "From December 18–20th Access Art Space, a gallery in downtown Cairo, will host an exhibition of 15 Sudanese artists curated by Sudanese visual artist and curator Reem Aljeally.",
      airportCodes: { from: "LHR", to: "CAI" },
    },

    // ------------------------------------------------------------- New York
    {
      id: "nyc-exclusive-showcase",
      title: "Exclusive Showcase",
      stampLabel: "EXCLUSIVE SHOWCASE / New York",
      city: "nyc",
      venue: "New York — venue to be announced",
      date: null,
      dateDisplay: "Date TBA",
      blurb:
        "A private fundraiser featuring Mai Abusalih. Professor Abusalih, a renowned Sudanese architectural designer, will share insights from her research into the historical and contemporary entanglements of the Sudan National Museum with politics and power. This event serves as the campaign's primary fundraiser.",
      airportCodes: { from: "LHR", to: "JFK" },
    },
    {
      id: "nyc-performance-night",
      title: "Performance Night x Al-Bait Baitkoum",
      stampLabel: "PERFORMANCE / The People's Forum — NYC",
      city: "nyc",
      venue: "The People's Forum",
      date: "2026-11-22",
      dateDisplay: "22 November 2026",
      blurb:
        "A community activation with Al-Bait Baitkoum, a grassroots Sudanese arts collective, at The People's Forum on November 22nd 2026. This event will be one of the campaign's cathartic moments: a celebration of Sudanese culture in the diaspora; an evening defined by performance, mingling, and a live community-generated art installation.",
      airportCodes: { from: "LHR", to: "JFK" },
    },
    {
      id: "nyc-space-360-exhibition",
      title: "Exhibition at Space 360",
      stampLabel: "EXHIBITION / Space 360 — NYC",
      city: "nyc",
      venue: "Space 360",
      date: { start: "2027-02-01", end: "2027-02-28" },
      dateDisplay: "February 2027",
      blurb:
        "In February of 2027, we will host an exhibition of several Sudanese artists at Space 360, curated by Paris Sistilli and Fatma Yasier. This exhibition will explore themes of memory, return, and home.",
      airportCodes: { from: "LHR", to: "JFK" },
    },

    // --------------------------------------------------------------- London
    {
      id: "london-ruby-cruel",
      title: "Exhibition at Ruby Cruel",
      stampLabel: "EXHIBITION / Ruby Cruel — London",
      city: "london",
      venue: "Ruby Cruel",
      date: { start: "2027-01-16", end: "2027-02-06" },
      dateDisplay: "From 16 January 2027, for three weeks",
      blurb:
        "From January 16th 2027, for three weeks, we will host Returning Sands, the exhibition, at Ruby Cruel gallery. Meditating on the theme of unlikely kinships, this exhibition features four artists, two Bermudian, two Sudanese, who use their art to imagine what returning—physically, culturally, and psychologically—looks like for their two communities seldom envisaged as relatives.",
      sponsorLine: "This activation has been generously sponsored by the Bermuda Arts Council.",
      airportCodes: { from: "CAI", to: "LHR" },
    },
    {
      id: "london-culture-house",
      title: "In Conversation at Culture House",
      stampLabel: "IN CONVERSATION / Culture House — London",
      city: "london",
      venue: "Culture House",
      date: { start: "2027-01-01", end: "2027-01-31" },
      dateDisplay: "January 2027, day TBA",
      blurb:
        "Founded as an organisation dedicated to preserving Somali cultural heritage, Culture House has extended its circle of care to embrace the rich cultures of its East African neighbours. In January, we'll be delighted to host a fireside chat that discusses the key themes of the campaign—collective memory, personal testimony, art in conflict, to name a few—with African stakeholders and professionals whose work is rooted in these themes.",
      airportCodes: { from: "CAI", to: "LHR" },
    },
  ],

  pending: {
    exclusiveShowcaseDate: "",
    cultureHouseDay: "",
  },
};
