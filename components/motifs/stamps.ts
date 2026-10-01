// Shared image table for the two ported Old_Site stamp artworks (Req 13.9).
// Both files live in public/img/ and are served through next/image.
export const STAMPS = {
  sudan: {
    src: "/img/stamp-sudan.png",
    aspect: 893 / 752,
  },
  magazine: {
    src: "/img/stamp-magazine.png",
    aspect: 766 / 195,
  },
} as const;

export type StampVariant = keyof typeof STAMPS;
