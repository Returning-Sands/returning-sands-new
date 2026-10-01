import Image from "next/image";
import { resolveAsset } from "@/lib/assets";
import { isPending } from "@/lib/pending";
import type { TeamMember } from "@/lib/types";
import { PORTRAIT_SIZES, Silhouette } from "./Silhouette";

// Team-member card styled as a passport identity page (Req 10.2, 10.4, 10.5).
// Server component.
//
// The 3:4 frame is identical for every card so rows line up; a photo fills it
// with `object-cover` (crop, never distort) and is described by the member's
// name. Without a photo the `Silhouette` stand-in takes the frame. `base` and
// `bio` render only when non-empty — no empty node is left behind (10.2). The
// designer's `passport-card-frame.svg` is layered behind the content as a
// decorative image when switched on (Req 20.9).
export function PassportCard({ member, className = "" }: { member: TeamMember; className?: string }) {
  const frame = resolveAsset("passportCardFrame");
  const photo = isPending(member.photo) ? null : (member.photo as string);
  const hasBase = !isPending(member.base);
  const hasBio = !isPending(member.bio);

  return (
    <article className={`relative flex flex-col gap-3 border border-ink bg-sand-100 p-4 text-ink ${className}`}>
      {frame.kind === "designer" ? (
        <Image
          src={frame.src}
          alt=""
          aria-hidden="true"
          fill
          sizes={PORTRAIT_SIZES}
          className="pointer-events-none object-cover"
        />
      ) : null}

      <div className="relative aspect-[3/4] w-full overflow-hidden border border-ink">
        {photo ? (
          <Image
            src={photo}
            alt={member.name}
            fill
            sizes={PORTRAIT_SIZES}
            className="object-cover"
          />
        ) : (
          <Silhouette />
        )}
      </div>

      <div className="relative flex flex-col gap-1">
        <h3 className="font-mono text-base font-semibold leading-tight">{member.name}</h3>
        <p className="font-mono text-xs uppercase tracking-[0.12em]">{member.role}</p>
        {hasBase ? <p className="font-mono text-xs text-nile-700">{member.base}</p> : null}
        {hasBio ? <p className="mt-2 text-sm leading-relaxed">{member.bio}</p> : null}
      </div>
    </article>
  );
}
