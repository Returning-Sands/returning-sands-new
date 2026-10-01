import type { TeamContent } from "@/lib/types";

/**
 * The ten team members in three groups (Req 10.3). Bios for the four members
 * who had one on the Old_Site are reproduced verbatim. `photo` is left unset
 * until headshots arrive; the Passport_Card shows the Silhouette meanwhile.
 */
export const team: TeamContent = {
  groups: ["Producers & Co-Founders", "Director & Executive Producer", "Core Team"],

  members: [
    // ------------------------------------------------ Producers & Co-Founders
    {
      name: "Paris Quetzal Sistilli",
      role: "Producer · Co-Founder",
      group: "Producers & Co-Founders",
      base: "New York",
      bio: "A Mexican-American cultural heritage researcher and practitioner focused on heritage protection, cultural policy, and collective memory. She holds degrees in Middle Eastern Politics from Sciences Po and Political Science from Columbia. Her writing has appeared in the Journal of Art Crime and art-law journals at UC Berkeley and Harvard.",
      order: 1,
    },
    {
      name: "Yusef Bushara",
      role: "Producer · Co-Founder",
      group: "Producers & Co-Founders",
      base: "London",
      bio: "A Sudanese-Bermudian editor, writer, and researcher specializing in Middle Eastern politics and publishing. Based in London, he works as a non-fiction editorial assistant at Saqi Books, and released his debut poetry collection, Good News, in 2025.",
      order: 2,
    },
    {
      name: "Camilla Marchese González",
      role: "Producer · Co-Founder",
      group: "Producers & Co-Founders",
      base: "Brooklyn",
      bio: "A Guatemalan-Italian writer and filmmaker drawn to storytelling as a means of preservation. Her short films have screened at DOC/NYC, Hamptons International Film Festival, Woodstock Film Festival, and Athens International Film Festival.",
      order: 3,
    },

    // ------------------------------------------ Director & Executive Producer
    {
      name: "Aicha Cherif",
      role: "Director",
      group: "Director & Executive Producer",
      order: 4,
    },
    {
      name: "Basma Khalifa",
      role: "Executive Producer",
      group: "Director & Executive Producer",
      base: "London",
      bio: "A Sudanese creative and founder of Zola Studios, working in character-driven storytelling that foregrounds underrepresented voices. Her debut feature reached over 30 million viewers and earned a Newcomer of the Year nomination at the Edinburgh TV Festival.",
      order: 5,
    },

    // -------------------------------------------------------------- Core Team
    { name: "Jenna Khalil", role: "Cairo Impact Coordinator", group: "Core Team", order: 6 },
    { name: "Afra Elagab", role: "Oral Historian", group: "Core Team", order: 7 },
    { name: "Anisa Estrada", role: "Researcher · Historic Preservation", group: "Core Team", order: 8 },
    { name: "Cillian Lavelle", role: "Finance Coordinator", group: "Core Team", order: 9 },
    { name: "Micheal Isaak", role: "Researcher", group: "Core Team", order: 10 },
  ],

  pending: {},
};
