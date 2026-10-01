import Image from "next/image";
import { STAMPS, type StampVariant } from "./stamps";

// Ported from Old_Site app/Stamp.tsx (Req 13.9). Server component.
//
// The badge is a texture element, not content: the image is marked `alt=""`
// and the whole badge is `aria-hidden` so it never reaches the accessibility
// tree (Req 13.12). Motion lives entirely in CSS (`.stamp-sway`,
// `.stamp-hover` in app/globals.css) so reduced-motion and no-JS fall back
// cleanly (Req 13.11, 19.7).
export function StampBadge({
  className = "",
  variant = "sudan",
  size = 128,
  tilt = "-4deg",
  sway = true,
  interactive = true,
}: {
  className?: string;
  variant?: StampVariant;
  size?: number;
  /** CSS angle for the resting tilt, read by `.stamp-sway` via `--tilt`. */
  tilt?: string;
  sway?: boolean;
  interactive?: boolean;
}) {
  const stamp = STAMPS[variant];
  return (
    <div className={`shrink-0 ${className}`} aria-hidden="true">
      <div
        className={sway ? "stamp-sway" : ""}
        style={{
          ["--tilt" as string]: tilt,
          transform: sway ? undefined : `rotate(${tilt})`,
        }}
      >
        <div
          className={`bg-sand-50 p-[6px] shadow-[0_10px_30px_-8px] shadow-ink/45 ${
            interactive ? "stamp-hover" : ""
          }`}
          style={{ width: size, height: size / stamp.aspect }}
        >
          <div className="relative h-full w-full overflow-hidden">
            <Image
              src={stamp.src}
              alt=""
              fill
              sizes={`${size}px`}
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
