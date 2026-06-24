"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteAdminArtist } from "@/app/admin/actions";
import type { AdminArtistRow } from "@/lib/admin/data";
import { getGenreLabel } from "@/lib/data/genres";
import { Badge } from "@/components/ui/Badge";

type AdminArtistsTableProps = {
  artists: AdminArtistRow[];
};

export function AdminArtistsTable({ artists }: AdminArtistsTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <div className="overflow-x-auto rounded-2xl border border-white/10">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-wider text-muted">
          <tr>
            <th className="px-4 py-3 font-medium">Artist</th>
            <th className="px-4 py-3 font-medium">Genre</th>
            <th className="px-4 py-3 font-medium">Events</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {artists.map((artist) => (
            <tr key={artist.slug} className="hover:bg-white/[0.02]">
              <td className="px-4 py-3">
                <p className="font-medium">{artist.name}</p>
                <p className="text-xs text-muted">{artist.slug}</p>
              </td>
              <td className="px-4 py-3 text-muted">
                {getGenreLabel(artist.genre)}
              </td>
              <td className="px-4 py-3 text-muted">{artist.eventCount}</td>
              <td className="px-4 py-3">
                {artist.isStub ? (
                  <Badge color="#f59e0b">Needs profile</Badge>
                ) : (
                  <Badge color="#34d399">Curated</Badge>
                )}
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    href={`/admin/artists/${artist.slug}/edit`}
                    className="text-amber-200 hover:text-amber-100"
                  >
                    Edit
                  </Link>
                  <Link
                    href={`/artists/${artist.slug}`}
                    className="text-muted hover:text-foreground"
                  >
                    Public
                  </Link>
                  <button
                    type="button"
                    disabled={isPending || artist.eventCount > 0}
                    title={
                      artist.eventCount > 0
                        ? "Remove artist from all events before deleting"
                        : "Delete artist"
                    }
                    onClick={() => {
                      if (
                        !window.confirm(
                          `Delete ${artist.name}? This cannot be undone.`,
                        )
                      ) {
                        return;
                      }
                      startTransition(async () => {
                        const result = await deleteAdminArtist(artist.slug);
                        if (result.error) {
                          window.alert(result.error);
                          return;
                        }
                        router.refresh();
                      });
                    }}
                    className="inline-flex items-center gap-1 text-muted hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
