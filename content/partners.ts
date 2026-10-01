import type { PartnersContent } from "@/lib/types";

/**
 * Partners & Supporters shown on /support, in this order (Req 11.5).
 * Every partner starts as `permission: "pending"` with no logo, so each renders
 * as a typographic tile until logo permission is confirmed (Req 11.7).
 */
export const partners: PartnersContent = {
  heading: "Partners & Supporters",

  partners: [
    { name: "SIMA", permission: "pending" },
    { name: "Ruby Cruel", permission: "pending" },
    { name: "Bermuda Arts Council", permission: "pending" },
    { name: "Kalam Aflam", permission: "pending" },
    { name: "Sundance Institute", permission: "pending" },
    { name: "The Muse multi studios", permission: "pending" },
    { name: "Sudan Human Rights Hub", permission: "pending" },
    { name: "Culture House", permission: "pending" },
    { name: "The American University in Cairo", permission: "pending" },
    { name: "SUDAAK", permission: "pending" },
    { name: "Blue Shield International", permission: "pending" },
    { name: "Access Art Space", permission: "pending" },
    { name: "British Council", permission: "pending" },
  ],

  pending: {},
};
