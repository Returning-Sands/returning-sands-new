import Image from "next/image";
import { resolveAsset } from "@/lib/assets";

/** Must match the `sizes` used by `PassportCard` so the two swap cleanly. */
export const PORTRAIT_SIZES = "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw";

// Stand-in portrait for a team member without a photo (Req 10.4). Server
// component. The outer element carries the informative text
// ("Portrait coming soon") as an accessible name; the drawing itself — inline
// SVG, or the designer's `silhouette.svg` when switched on — is decorative
// and hidden (Req 13.12).
export function Silhouette({ className = "" }: { className?: string }) {
  const asset = resolveAsset("silhouette");
  return (
    <div
      role="img"
      aria-label="Portrait coming soon"
      className={`relative h-full w-full overflow-hidden bg-sand-200 text-sand-400 ${className}`}
    >
      {asset.kind === "designer" ? (
        <Image
          src={asset.src}
          alt=""
          aria-hidden="true"
          fill
          sizes={PORTRAIT_SIZES}
          className="pointer-events-none object-cover"
        />
      ) : (
        <svg
          aria-hidden="true"
          focusable="false"
          viewBox="0 0 300 400"
          preserveAspectRatio="xMidYMid slice"
          className="h-full w-full"
          fill="currentColor"
        >
          {/* Head */}
          <ellipse cx="150" cy="150" rx="62" ry="74" />
          {/* Neck */}
          <rect x="128" y="212" width="44" height="40" />
          {/* Shoulders */}
          <path d="M30 400 C 30 300, 90 250, 150 250 C 210 250, 270 300, 270 400 Z" />
        </svg>
      )}
    </div>
  );
}
