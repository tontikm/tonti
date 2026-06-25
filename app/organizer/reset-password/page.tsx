import { notFound } from "next/navigation";
import { OrganizerResetPasswordForm } from "@/components/organizer/OrganizerResetPasswordForm";

export const metadata = {
  title: "Reset organizer password",
};

type OrganizerResetPasswordPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function OrganizerResetPasswordPage({
  searchParams,
}: OrganizerResetPasswordPageProps) {
  const query = await searchParams;
  const token = typeof query.token === "string" ? query.token.trim() : "";

  if (!token) {
    notFound();
  }

  return <OrganizerResetPasswordForm token={token} />;
}
