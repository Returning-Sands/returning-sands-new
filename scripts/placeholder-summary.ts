// Prints the list of Placeholders that are still "not yet available" after a
// build (Requirements 14.7, 14.10, 12.12, 17.2).
//
// Runs as the `postbuild` npm script (`tsx scripts/placeholder-summary.ts`)
// and can be run by hand with `npx tsx scripts/placeholder-summary.ts`. It
// imports every Content_File, hands their `pending` objects to the pure
// `summarizePending()` in lib/summary.ts, and prints the result.
//
// The exit code is always 0: the summary is informational and must never fail
// a deploy. Content errors are the job of `validateAll()` in the root layout,
// which fails `next build` itself. Relative imports are used (not `@/`) so the
// script does not depend on tsx honouring tsconfig `paths`.

import { summarizePending, type PendingGroups } from "../lib/summary";

async function loadGroups(): Promise<PendingGroups> {
  const [site, events, team, partners, donate, film, museum] = await Promise.all([
    import("../content/site"),
    import("../content/events"),
    import("../content/team"),
    import("../content/partners"),
    import("../content/donate"),
    import("../content/film"),
    import("../content/museum"),
  ]);
  return {
    site: site.site.pending,
    events: events.events.pending,
    team: team.team.pending,
    partners: partners.partners.pending,
    donate: donate.donate.pending,
    film: film.film.pending,
    museum: museum.museum.pending,
  };
}

async function main(): Promise<void> {
  try {
    const groups = await loadGroups();
    for (const line of summarizePending(groups)) {
      console.log(line);
    }
  } catch (error) {
    console.error("placeholder-summary: could not load content files");
    console.error(error);
  }
  process.exitCode = 0;
}

void main();
