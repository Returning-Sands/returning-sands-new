import Image from "next/image";

import { SmartLink } from "@/components/layout/SmartLink";
import type { Partner } from "@/lib/types";

// One Partners & Supporters tile on /support (Req 11.7, 11.8, 11.9, 11.11).
// Server component.
//
// Every tile is the same fixed height (`h-24`) so typographic and logo tiles
// line up in the grid at any viewport width (11.11). The decision is:
//   - no `logo` OR `permission === "pending"`  -> typographic Stand_In_Asset:
//     the partner name in the Mono_Font inside a dashed stamp-style border,
//     and no <img> at all (11.7)
//   - `logo` AND permission granted/not-required -> next/image with `fill` and
//     `object-contain` so the logo scales to fit the tile height without
//     cropping, `alt` = partner name (11.8, 11.11)
// When `href` is set the whole tile is wrapped in exactly one anchor via
// SmartLink (external hosts get the new-tab affordance); otherwise the tile
// renders with no link (11.9).

/** Grid is two columns below `md` and four from `md` up (page.tsx). */
export const PARTNER_LOGO_SIZES = "(min-width: 768px) 25vw, 50vw";

const TILE = "relative block h-24 w-full";

export function showsLogo(partner: Partner): boolean {
  return partner.logo !== undefined && partner.permission !== "pending";
}

export function PartnerTile({ partner }: { partner: Partner }) {
  const tile = showsLogo(partner) ? (
    <span className={`${TILE} overflow-hidden`}>
      <Image
        src={partner.logo!.src}
        alt={partner.name}
        fill
        sizes={PARTNER_LOGO_SIZES}
        className="object-contain"
      />
    </span>
  ) : (
    <span
      className={`${TILE} flex items-center justify-center border-2 border-dashed border-ink px-3 text-center font-mono text-xs uppercase leading-snug tracking-wider text-ink break-words sm:text-sm`}
    >
      {partner.name}
    </span>
  );

  if (partner.href) {
    return (
      <SmartLink
        href={partner.href}
        className="block w-full hover:text-ochre-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nile-800"
      >
        {tile}
      </SmartLink>
    );
  }
  return tile;
}
