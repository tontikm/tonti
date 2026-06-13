import Link from "next/link";
import Image from "next/image";
import { GENRES } from "@/lib/data/genres";

export function GenreGrid() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
      {GENRES.map((genre) => (
        <Link
          key={genre.id}
          href={`/events?genre=${genre.id}`}
          className="group flex flex-col items-center gap-2 rounded-xl border border-border bg-surface p-4 transition-all hover:border-accent/40 hover:bg-surface-hover"
        >
          <div
            className="h-3 w-3 rounded-full transition-transform group-hover:scale-125"
            style={{ backgroundColor: genre.color }}
          />
          <span className="text-center text-xs font-medium sm:text-sm">
            {genre.label}
          </span>
        </Link>
      ))}
    </div>
  );
}
