import { Plus } from "lucide-react";
import { AdminArtistsTable } from "@/components/admin/AdminArtistsTable";
import { AdminPageHeader } from "@/components/admin/AdminShell";
import { listAdminArtists } from "@/lib/admin/data";
import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "Admin · Artists",
  robots: { index: false, follow: false },
};

type Props = {
  searchParams: Promise<{ created?: string }>;
};

export default async function AdminArtistsPage({ searchParams }: Props) {
  const { created } = await searchParams;
  const artists = await listAdminArtists();

  return (
    <>
      <AdminPageHeader
        title="Artists"
        description="Curate artist profiles with photos and bios. Organizer-added names appear here as stubs until you enrich them."
        action={
          <Button href="/admin/artists/new" size="md">
            <Plus className="h-4 w-4" />
            Add artist
          </Button>
        }
      />

      {created === "1" && (
        <div className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-950/20 px-4 py-3 text-sm text-emerald-100">
          Artist added.
        </div>
      )}

      {artists.length === 0 ? (
        <p className="text-sm text-muted">No artists yet.</p>
      ) : (
        <AdminArtistsTable artists={artists} />
      )}

      <p className="mt-6 text-sm text-muted">
        Organizers can also add artist names while creating events. Those entries
        show as &ldquo;Needs profile&rdquo; until you add a photo and bio.
      </p>
    </>
  );
}
