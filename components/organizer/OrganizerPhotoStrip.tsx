import Image from "next/image";
import { getSafeEventImageUrl } from "@/lib/images";

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=80",
  "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&q=80",
  "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&q=80",
  "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&q=80",
  "https://images.unsplash.com/photo-1429962710883-0aaaf678903a?w=400&q=80",
  "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=400&q=80",
];

const STRIP_SIZE = 6;

type OrganizerPhotoStripProps = {
  events: { title: string; image: string }[];
};

export function OrganizerPhotoStrip({ events }: OrganizerPhotoStripProps) {
  const eventImages = events.map((e) => getSafeEventImageUrl(e.image));
  const images = [...eventImages, ...FALLBACK_IMAGES]
    .slice(0, STRIP_SIZE)
    .map((src) => getSafeEventImageUrl(src));

  return (
    <div className="relative overflow-hidden border-b border-white/10">
      <div className="flex gap-1 px-1 py-1 opacity-40 sm:gap-1.5">
        {images.map((src, index) => (
          <div
            key={`strip-${index}`}
            className="relative h-16 min-w-[120px] flex-1 overflow-hidden rounded-lg sm:h-20 sm:min-w-[140px]"
          >
            <Image
              src={src}
              alt=""
              fill
              className="object-cover saturate-125"
              sizes="200px"
              priority={index < 3}
            />
          </div>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-black" />
    </div>
  );
}
