import Link from "next/link";
import { Mic2, Plus } from "lucide-react";
import { OrganizerPageHeader } from "@/components/organizer/OrganizerShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { getAllArtists } from "@/lib/data/artists";
import { getGenreColor, getGenreLabel } from "@/lib/data/genres";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";

export const metadata = { title: "Artists" };

type Props = {
  searchParams: Promise<{ created?: string }>;
};

export default async function OrganizerArtistsPage({ searchParams }: Props) {
  const { created } = await searchParams;
  const artists = await getAllArtists();
  const supabaseReady = isSupabaseAdminConfigured();

  return (
    <>
      <OrganizerPageHeader
        title="Artists"
        description={`${artists.length} artist${artists.length !== 1 ? "s" : ""} available for event lineups`}
        action={
          <Button href="/organizer/artists/new" size="md">
            <Plus className="h-4 w-4" />
            Add artist
          </Button>
        }
      />

      {created === "1" && (
        <div className="mb-6 rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm">
          Artist added — select them when creating an event lineup.
        </div>
      )}

      {!supabaseReady && (
        <div className="mb-6 rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-muted">
          Connect Supabase to save new artists. Until then, only seed artists are
          listed.
        </div>
      )}

      <ul className="divide-y divide-white/10 rounded-2xl border border-white/10">
        {artists.map((artist) => (
          <li key={artist.slug} className="px-4 py-4 sm:px-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{artist.name}</p>
                  <Badge color={getGenreColor(artist.genre)}>
                    {getGenreLabel(artist.genre)}
                  </Badge>
                </div>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
                  <Mic2 className="h-3.5 w-3.5" />
                  {artist.slug}
                </p>
              </div>
              <Link
                href={`/artists/${artist.slug}`}
                className="text-sm text-muted hover:text-foreground"
              >
                View public page →
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
