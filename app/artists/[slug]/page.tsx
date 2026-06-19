import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EventCard } from "@/components/events/EventCard";
import { Badge } from "@/components/ui/Badge";
import { getAllArtists, getArtistBySlug } from "@/lib/data/artists";
import { getEventsByArtist } from "@/lib/data/events";
import { getSafeArtistImageUrl } from "@/lib/images";
import { getGenreColor, getGenreLabel } from "@/lib/data/genres";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const artists = await getAllArtists();
  return artists.map((artist) => ({ slug: artist.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const artist = await getArtistBySlug(slug);
  if (!artist) return { title: "Artist not found" };
  return {
    title: artist.name,
    description: artist.bio,
  };
}

export default async function ArtistPage({ params }: Props) {
  const { slug } = await params;
  const artist = await getArtistBySlug(slug);
  if (!artist) notFound();

  const events = await getEventsByArtist(slug);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-8 sm:flex-row sm:items-start">
        <div className="relative h-48 w-48 shrink-0 overflow-hidden rounded-2xl border border-border">
          <Image
            src={getSafeArtistImageUrl(artist.image)}
            alt={artist.name}
            fill
            className="object-cover"
            sizes="192px"
          />
        </div>

        <div>
          <Badge color={getGenreColor(artist.genre)}>
            {getGenreLabel(artist.genre)}
          </Badge>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">{artist.name}</h1>
          {artist.bio && (
            <p className="mt-4 max-w-2xl leading-relaxed text-muted">
              {artist.bio}
            </p>
          )}
        </div>
      </div>

      <section className="mt-12">
        <h2 className="text-xl font-semibold">
          Upcoming shows ({events.length})
        </h2>
        {events.length === 0 ? (
          <p className="mt-4 text-muted">No upcoming shows listed.</p>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <EventCard key={event.slug} event={event} />
            ))}
          </div>
        )}
      </section>

      <div className="mt-8">
        <Link href="/events" className="text-sm text-accent hover:underline">
          ← Browse all events
        </Link>
      </div>
    </div>
  );
}
