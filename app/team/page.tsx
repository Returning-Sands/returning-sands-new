import { PassportCard } from "@/components/motifs/PassportCard";
import { team } from "@/content/team";
import { pageMetadata } from "@/lib/metadata";
import { groupMembers } from "@/lib/team";

// Team page (Req 10). One <section> per non-empty group in the fixed
// three-group order from `team.groups`, each introduced by a Mono_Font <h2>
// (10.1) and followed by a grid of Passport_Cards (10.2). Ordering within a
// group and the omission of empty groups are handled by `groupMembers`
// (10.8, 10.9). The grid is 1 / 2 / 4 columns at <640 / 640–1023 / >=1024 px
// (10.7); rows fill left-to-right by CSS grid auto-placement.
export const metadata = pageMetadata("team", "/team");

const PAGE_HEADING = "Team";

/** Stable, URL-safe id for a group heading, e.g. "producers-co-founders". */
function headingId(group: string): string {
  return `${group
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")}-heading`;
}

export default function TeamPage() {
  const groups = groupMembers(team.members, team.groups);

  return (
    <article className="mx-auto max-w-6xl px-4 py-16 md:py-24">
      <header>
        <p className="kicker">Who we are</p>
        <h1 className="mt-4 font-display text-4xl font-bold tracking-tight md:text-6xl">{PAGE_HEADING}</h1>
      </header>

      <div className="perf-seam mt-12" aria-hidden="true" />

      {groups.map(({ group, members }, i) => {
        const id = headingId(group);
        return (
          <section key={group} aria-labelledby={id} className={i === 0 ? "mt-12" : "mt-16"}>
            <h2 id={id} className="font-mono text-sm uppercase tracking-widest text-ochre-600">
              {group}
            </h2>
            <ul className="mt-6 grid list-none grid-cols-1 gap-6 p-0 sm:grid-cols-2 lg:grid-cols-4">
              {members.map((member) => (
                <li key={member.name} className="flex">
                  <PassportCard member={member} className="w-full" />
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </article>
  );
}
