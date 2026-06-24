import { AdminArtistForm } from "@/components/admin/AdminArtistForm";
import { AdminBackLink } from "@/components/admin/AdminBackLink";
import { AdminPageHeader } from "@/components/admin/AdminShell";

export const metadata = {
  title: "Admin · New artist",
  robots: { index: false, follow: false },
};

export default function AdminNewArtistPage() {
  return (
    <>
      <AdminBackLink href="/admin/artists" label="Artists" />
      <AdminPageHeader
        title="Add artist"
        description="Create a curated artist profile for the public catalog and event lineups."
      />
      <AdminArtistForm mode="create" />
    </>
  );
}
