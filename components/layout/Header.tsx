import { HeaderClient } from "./HeaderClient";
import { FanAuthLink } from "./HeaderFanLink";
import { HeaderOrganizerLink } from "./HeaderOrganizerLink";
import { getFanUser } from "@/lib/auth/session";
import { getOrganizerSession } from "@/lib/organizer/session";
import { buildSearchIndex } from "@/lib/search";

export async function Header() {
  const [fanUser, organizerSession, searchItems] = await Promise.all([
    getFanUser(),
    getOrganizerSession(),
    buildSearchIndex(),
  ]);
  const organizerSignedIn = Boolean(organizerSession);

  return (
    <HeaderClient
      organizerLink={<HeaderOrganizerLink />}
      fanLink={
        <FanAuthLink user={fanUser} organizerSignedIn={organizerSignedIn} />
      }
      searchItems={searchItems}
    />
  );
}
