import { Passport } from "@/components/motifs/Passport";
import { Stamp } from "@/components/motifs/Stamp";
import { CityStamp } from "./CityStamp";
import { events } from "@/content/events";
import type { City } from "@/lib/types";

// Passport_Hero on Home (Req 2.3 to 2.6, 2.8, 2.11). Server component.
//
// An open passport spread: the Returning Sands oval stamp sits on the left
// page with a short Mono_Font caption; the right page carries the three
// City_Stamp anchors in the fixed order London, Cairo, NYC (2.3). `Passport`
// already stacks the two pages below `md` (2.8), and `CityStamp` keeps each
// anchor tappable at that size.

/** Display order required by Req 2.3. */
export const HERO_CITIES: readonly City[] = ["london", "cairo", "nyc"];

export function PassportHero({ className = "" }: { className?: string }) {
  return (
    <Passport
      variant="spread"
      className={className}
      left={
        <div className="flex h-full flex-col items-center justify-center gap-6 text-center">
          <Stamp size={200} tilt="-5deg" />
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink/80">
            a documentary and impact campaign
          </p>
        </div>
      }
      right={
        <div className="flex h-full flex-col items-center justify-center gap-6">
          {HERO_CITIES.map((city) => (
            <CityStamp key={city} city={city} name={events.cities[city].name} href={`/campaign/${city}`} />
          ))}
        </div>
      }
    />
  );
}
