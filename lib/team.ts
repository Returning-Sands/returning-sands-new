/**
 * Pure helpers for the Team Page (Requirements 10.1, 10.8, 10.9; design
 * Property 14). No React, no content import — the page passes in
 * `team.members` and `team.groups` so these stay trivially testable.
 */
import type { TeamGroup, TeamMember } from "./types";

/**
 * Return a new array of `members` sorted by ascending `order`, ties broken by
 * `name` A–Z using an English-locale comparison (Req 10.8). The input is not
 * mutated; `Array.prototype.sort` is stable so equal (order, name) pairs keep
 * their file order.
 */
export function sortMembers(members: readonly TeamMember[]): TeamMember[] {
  return [...members].sort((a, b) => a.order - b.order || a.name.localeCompare(b.name, "en"));
}

/**
 * Group `members` by `group` in the order given by `groups`, each group's
 * members sorted via `sortMembers`. Groups with zero members are omitted
 * entirely so the page never renders an empty heading or grid (Req 10.9).
 * Members whose `group` is not listed in `groups` are dropped; the validator
 * rejects such content before it ever reaches a render (Req 10.10).
 */
export function groupMembers(
  members: readonly TeamMember[],
  groups: readonly TeamGroup[],
): { group: TeamGroup; members: TeamMember[] }[] {
  const sorted = sortMembers(members);
  return groups
    .map((group) => ({ group, members: sorted.filter((m) => m.group === group) }))
    .filter((g) => g.members.length > 0);
}
