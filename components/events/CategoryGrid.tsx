import Link from "next/link";
import { EVENT_CATEGORIES } from "@/lib/data/categories";

export function CategoryGrid() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {EVENT_CATEGORIES.map((category) => (
        <Link
          key={category.id}
          href={`/events?category=${category.id}`}
          className="group flex flex-col items-center gap-2 rounded-xl border border-border bg-surface p-4 transition-all hover:border-accent/40 hover:bg-surface-hover"
        >
          <div
            className="h-3 w-3 rounded-full transition-transform group-hover:scale-125"
            style={{ backgroundColor: category.color }}
          />
          <span className="text-center text-xs font-medium sm:text-sm">
            {category.label}
          </span>
        </Link>
      ))}
    </div>
  );
}
