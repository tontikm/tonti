import { notFound } from "next/navigation";
import { DoorStaffJoinForm } from "@/components/organizer/DoorStaffJoinForm";
import { getDoorStaffInviteByToken } from "@/lib/organizer/door-staff";

export const metadata = {
  title: "Join door staff",
};

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DoorStaffJoinPage({ searchParams }: Props) {
  const query = await searchParams;
  const rawToken = query.token;
  const token = typeof rawToken === "string" ? rawToken.trim() : "";

  if (!token) {
    notFound();
  }

  const invite = await getDoorStaffInviteByToken(token);
  if (!invite) {
    notFound();
  }

  return (
    <DoorStaffJoinForm
      token={token}
      eventTitle={invite.eventTitle}
      email={invite.email}
      defaultName={invite.name}
      expired={invite.expired}
    />
  );
}
