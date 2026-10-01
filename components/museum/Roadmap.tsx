import type { MuseumContent } from "@/lib/types";

// Virtual Museum roadmap (Req 8.6). Server component.
//
// A vertical timeline: one <li> per stage, in Content_File order, each with
// its label, description and optional date text. The single stage flagged
// `current: true` (the validator guarantees exactly one, Req 8.7) carries
// `aria-current="step"` and a stamp-style "WE ARE HERE" marker rendered as
// real text next to it — the Designer_Asset, when it arrives, only ever swaps
// the background, never the words (Req 20.9).
export function Roadmap({ stages, className = "" }: { stages: MuseumContent["roadmap"]; className?: string }) {
  return (
    <ol className={`relative flex list-none flex-col gap-10 border-s-2 border-dashed border-ink p-0 ps-8 ${className}`}>
      {stages.map((stage, i) => {
        const current = stage.current === true;
        return (
          <li
            key={stage.label}
            aria-current={current ? "step" : undefined}
            className="relative"
          >
            {/* Timeline node sitting on the rule to the left. */}
            <span
              aria-hidden="true"
              className={`absolute -left-[2.45rem] top-1.5 block size-4 rounded-full border-2 border-ink ${
                current ? "bg-stamp-600" : "bg-sand-50"
              }`}
            />

            <div className="flex flex-wrap items-start gap-x-4 gap-y-2">
              <div className="flex flex-col gap-1">
                <span className="font-mono text-xs uppercase tracking-[0.18em] text-nile-700">
                  {String(i + 1).padStart(2, "0")}
                  {stage.dateText ? ` · ${stage.dateText}` : ""}
                </span>
                <h3 className="font-display text-xl font-bold tracking-tight md:text-2xl">{stage.label}</h3>
              </div>

              {current ? (
                <span className="stamp-tilt inline-block shrink-0 border-2 border-dashed border-stamp-700 px-3 py-1 font-mono text-xs font-semibold uppercase tracking-[0.3em] text-stamp-700">
                  WE ARE HERE
                </span>
              ) : null}
            </div>

            <p className="mt-3 max-w-prose leading-relaxed">{stage.description}</p>
          </li>
        );
      })}
    </ol>
  );
}
