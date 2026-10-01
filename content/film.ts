import type { FilmContent } from "@/lib/types";

/**
 * The Documentary page (Req 5). Director's note and Ali Nour biography are the
 * Old_Site texts, held here as interim values until confirmed copy replaces them.
 *
 * `pending.trailerUrl` is the single definition of the trailer Placeholder; the
 * Home page imports it from this file (Req 14.3).
 */
export const film: FilmContent = {
  headings: {
    logline: "Logline",
    about: "About the film",
    director: "Director",
    protagonist: "Protagonist",
    backing: "Backing & support",
    trailer: "Trailer",
  },

  director: {
    name: "Aicha Cherif",
    credential: "Director · 2026 Sundance x Adobe Ignite Fellow",
    note: "“With Returning Sands I venture into thematics of memory and belonging, through my own experience with displacement. Fleeing gender-based violence in my homeland, Guinea, at age one, I have found solace in storytelling.”\n\nMy intention with my forthcoming feature documentary HEAT is to showcase a neighborhood filled with a rich and textured history — and with this project, I explore the same questions of identity and belonging from a different lens. As part of the creative process, I’m in open conversation with Sudanese filmmakers and creatives, as well as Ali and his community of heritage workers, to make sure to highlight their voices and stories in a collaborative manner.",
  },

  protagonist: {
    name: "Ali Nour",
    bio: "A grants-management specialist and cultural heritage advocate. Ali serves as Secretary General of Blue Shield Sudan and rapporteur of the Emergency Response Committee under Sudan’s National Corporation for Antiquities and Museums (NCAM).\n\nWith a background in strategic fundraising, proposal development, and crisis coordination, he supports regional and international efforts to document, stabilise, and protect heritage in Sudan.",
    image: {
      src: "/img/ali.jpg",
      alt: "Ali Nour, Secretary General of Blue Shield Sudan, photographed in Cairo",
    },
  },

  backing: [
    {
      name: "Sundance x Adobe Ignite Fellowship",
      detail:
        "Director Aicha Cherif is a 2026 Sundance x Adobe Ignite Fellow, supporting the development of the film.",
    },
    {
      name: "SIMA Studios fiscal sponsorship",
      detail:
        "Returning Sands is fiscally sponsored by SIMA Studios, a US 501(c)(3), making US donations to the film tax-deductible.",
    },
  ],

  trailerComingSoonText: "Trailer coming soon",

  pending: {
    logline: "",
    aboutFilm: "",
    trailerUrl: "",
  },
};
