import Image from "next/image";
import { STAMPS, type StampVariant } from "./stamps";

// Ported from Old_Site app/Stamp.tsx (Req 13.9). Server component.
//
// A large, faint, blended copy of a stamp artwork positioned absolutely
// behind section content. Purely decorative: `aria-hidden` wrapper and
// `alt=""` image (Req 13.12), `pointer-events-none` so it never intercepts
// clicks. The parent must be `relative` (or otherwise positioned).
export function StampWatermark({
  className = "",
  variant = "sudan",
  size = 640,
  tilt = "-8deg",
  mode = "multiply",
  opacity = 0.06,
}: {
  className?: string;
  variant?: StampVariant;
  size?: number;
  tilt?: string;
  mode?: "multiply" | "screen";
  opacity?: number;
}) {
  const stamp = STAMPS[variant];
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none select-none absolute ${
        mode === "screen" ? "mix-blend-screen" : "mix-blend-multiply"
      } ${className}`}
      style={{
        width: size,
        height: size / stamp.aspect,
        transform: `rotate(${tilt})`,
        opacity,
      }}
    >
      <Image
        src={stamp.src}
        alt=""
        fill
        sizes={`${size}px`}
        className="object-cover"
      />
    </div>
  );
}
