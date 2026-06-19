import { HeaderClient } from "./HeaderClient";
import { FanAuthLink, getFanNavLink } from "./HeaderFanLink";
import { HeaderOrganizerLink } from "./HeaderOrganizerLink";
import { getFanUser } from "@/lib/auth/session";
import { getOrganizerSession } from "@/lib/organizer/session";

export async function Header() {
  const [fanUser, organizerSession] = await Promise.all([
    getFanUser(),
    getOrganizerSession(),
  ]);
  const organizerSignedIn = Boolean(organizerSession);

  return (
    <HeaderClient
      organizerLink={<HeaderOrganizerLink />}
      fanLink={
        <FanAuthLink user={fanUser} organizerSignedIn={organizerSignedIn} />
      }
      fanNavLink={getFanNavLink(fanUser, organizerSignedIn)}
      fanSignedIn={Boolean(fanUser)}
    />
  );
}
