import { film } from "@/content/film";
import { site } from "@/content/site";
import { boardingPassCard } from "@/lib/og/boardingPassCard";
import { OG_CONTENT_TYPE, OG_SIZE, renderOg } from "@/lib/og/render";
import { present } from "@/lib/pending";

// Boarding_Pass Share_Card for /film (Req 16.6): Khartoum → London, with the
// date line driven by the trailer Placeholder (Req 14.9).
const title = site.pages.film.title;
const dateText = present(film.pending.trailerUrl) ? "TRAILER OUT NOW" : "COMING SOON";

export const alt = `Boarding pass for the Returning Sands documentary, KRT to LHR, ${dateText.toLowerCase()}`;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return renderOg(
    boardingPassCard({
      heading: "THE DOCUMENTARY",
      from: "KRT",
      to: "LHR",
      code: "DOC",
      dateText,
      title,
    }),
  );
}
