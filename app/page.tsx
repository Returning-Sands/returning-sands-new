import { site } from "@/content/site";
import { pageMetadata } from "@/lib/metadata";

// Temporary Home shell (Task 4.4) so the root route builds; the full Home with
// the Passport_Hero, city list and trailer control lands in Task 6.
export const metadata = pageMetadata("home", "/");

export default function Home() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16 md:py-24">
      <p className="kicker">{site.kicker}</p>
      <h1 className="mt-4 font-display text-5xl font-bold tracking-tight md:text-7xl">{site.name}</h1>
      <p lang="ar" dir="rtl" className="mt-2 text-3xl md:text-4xl">
        {site.arabicName}
      </p>
      <p className="mt-6 max-w-prose text-lg italic leading-relaxed">{site.description}</p>
    </section>
  );
}
