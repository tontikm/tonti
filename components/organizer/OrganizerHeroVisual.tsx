import Image from "next/image";
import { getSafeEventImageUrl } from "@/lib/images";

const FALLBACK_POSTERS = [
  {
    title: "Live music",
    image:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80",
  },
  {
    title: "Club night",
    image:
      "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80",
  },
  {
    title: "Festival",
    image:
      "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&q=80",
  },
];

type HeroEvent = {
  title: string;
  image: string;
};

const CARD_STYLES = [
  {
    rotate: "-rotate-6",
    translate: "translate-x-0 translate-y-0",
    z: "z-30",
    border: "border-violet-500/40 shadow-violet-500/20",
  },
  {
    rotate: "rotate-3",
    translate: "translate-x-8 translate-y-6 sm:translate-x-12",
    z: "z-20",
    border: "border-white/20 shadow-black/60",
  },
  {
    rotate: "-rotate-2",
    translate: "translate-x-16 translate-y-12 sm:translate-x-24 sm:translate-y-8",
    z: "z-10",
    border: "border-orange-500/30 shadow-orange-500/10",
  },
];

export function OrganizerHeroVisual({ events }: { events: HeroEvent[] }) {
  const posters =
    events.length >= 3
      ? events.slice(0, 3)
      : events.length > 0
        ? [...events, ...FALLBACK_POSTERS].slice(0, 3)
        : FALLBACK_POSTERS;

  return (
    <div className="relative mx-auto aspect-[4/5] w-full max-w-md lg:max-w-none">
      <div className="pointer-events-none absolute -left-8 top-1/4 h-40 w-40 rounded-full bg-violet-600/25 blur-3xl" />
      <div className="pointer-events-none absolute -right-4 bottom-1/4 h-48 w-48 rounded-full bg-orange-500/20 blur-3xl" />
      <div className="pointer-events-none absolute inset-4 rounded-[32px] border border-violet-500/10 bg-gradient-to-br from-violet-500/10 to-orange-500/5" />

      <div className="relative h-full min-h-[320px] sm:min-h-[380px]">
        {posters.map((poster, index) => {
          const style = CARD_STYLES[index] ?? CARD_STYLES[0];
          return (
            <div
              key={`${poster.title}-${index}`}
              className={`absolute left-4 top-6 w-[58%] sm:left-8 sm:w-[55%] ${style.rotate} ${style.translate} ${style.z}`}
            >
              <div
                className={`overflow-hidden rounded-2xl border bg-black shadow-2xl ${style.border}`}
              >
                <div className="relative aspect-[3/4]">
                  <Image
                    src={getSafeEventImageUrl(poster.image)}
                    alt={poster.title}
                    fill
                    className="object-cover saturate-110"
                    sizes="(max-width: 1024px) 50vw, 280px"
                    priority={index === 0}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-violet-900/10" />
                  <p className="absolute bottom-3 left-3 right-3 truncate text-xs font-medium text-white/90">
                    {poster.title}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
