import Image from "next/image";
import type { ImageRef } from "@/lib/types";

// A meaningful image with its descriptive alt text and an optional caption
// (Req 13.13, 13.14). Server component.
//
// Always served through next/image with an explicit `sizes` (Req 13.14). Pass
// `preload` for the single above-the-fold image on a page — Next 16 deprecates
// `priority` in its favour (docs/NEXT16_NOTES.md item 8). When the ImageRef
// carries intrinsic dimensions the image is laid out at its natural ratio;
// otherwise it fills a 4:3 frame.
export function Figure({
  image,
  caption,
  sizes,
  preload = false,
  className = "",
}: {
  image: ImageRef;
  caption?: string;
  sizes: string;
  preload?: boolean;
  className?: string;
}) {
  const sized = image.width !== undefined && image.height !== undefined;

  return (
    <figure className={`flex flex-col gap-2 ${className}`}>
      {sized ? (
        <Image
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          sizes={sizes}
          preload={preload}
          className="h-auto w-full border border-ink"
        />
      ) : (
        <div className="relative aspect-[4/3] w-full overflow-hidden border border-ink">
          <Image src={image.src} alt={image.alt} fill sizes={sizes} preload={preload} className="object-cover" />
        </div>
      )}
      {caption ? <figcaption className="font-mono text-xs text-nile-700">{caption}</figcaption> : null}
    </figure>
  );
}
