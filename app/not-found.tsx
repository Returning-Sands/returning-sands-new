import Link from "next/link";

import { Stamp } from "@/components/motifs/Stamp";
import { pageMetadata } from "@/lib/metadata";

// Custom 404 (Req 1.9, 16.13). Renders inside the root layout, so Top_Nav and
// Footer come for free. Next also injects `noindex` on every 404 response;
// the explicit robots entry here is belt-and-braces (docs/NEXT16_NOTES.md 1d).
export const metadata = pageMetadata("notFound", "/404", { noindex: true });

export default function NotFound() {
  return (
    <section className="mx-auto flex max-w-3xl flex-col items-center gap-8 px-4 py-16 text-center md:flex-row md:text-start">
      <Stamp overprint="DENIED" tilt="-6deg" size={200} className="shrink-0" />
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
          VISA DENIED — page not found
        </h1>
        <p className="mt-4 text-lg">
          The page you were looking for does not exist, or it has moved. Check the address, or head
          back to the start.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block font-mono text-sm uppercase tracking-wider underline decoration-2 underline-offset-4 hover:text-ochre-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nile-800"
        >
          Return to the home page
        </Link>
      </div>
    </section>
  );
}
