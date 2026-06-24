import { notFound } from "next/navigation";
import { AdminArtistForm } from "@/components/admin/AdminArtistForm";
import { AdminBackLink } from "@/components/admin/AdminBackLink";
import { AdminPageHeader } from "@/components/admin/AdminShell";
import { getAdminArtist } from "@/lib/admin/data";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const artist = await getAdminArtist(slug);
  return {
    title: artist ? `Admin · Edit ${artist.name}` : "Admin · Artist not found",
    robots: { index: false, follow: false },
  };
}

export default async function AdminEditArtistPage({ params }: Props) {
  const { slug } = await params;
  const artist = await getAdminArtist(slug);
  if (!artist) notFound();

  return (
    <>
      <AdminBackLink href="/admin/artists" label="Artists" />
      <AdminPageHeader
        title={`Edit ${artist.name}`}
        description="Update photo, bio, and genre. Slug is fixed once created."
      />
      <AdminArtistForm mode="edit" artist={artist} />
    </>
  );
}
