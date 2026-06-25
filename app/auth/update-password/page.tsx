import { redirect } from "next/navigation";
import { UpdatePasswordForm } from "@/components/auth/UpdatePasswordForm";
import { getFanUser } from "@/lib/auth/session";
import { sanitizeReturnTo } from "@/lib/auth/sanitize-return-to";
import { isFanAuthConfigured } from "@/lib/supabase/server-auth";

export const metadata = {
  title: "Update password",
};

type UpdatePasswordPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function UpdatePasswordPage({
  searchParams,
}: UpdatePasswordPageProps) {
  if (!isFanAuthConfigured()) {
    redirect("/login?error=config");
  }

  const user = await getFanUser();
  if (!user) {
    redirect("/forgot-password");
  }

  const query = await searchParams;
  const nextParam = query.next;
  const returnTo = sanitizeReturnTo(
    typeof nextParam === "string" ? nextParam : "/account",
  );

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col justify-center px-4 py-12 sm:px-6">
      <UpdatePasswordForm returnTo={returnTo} />
    </div>
  );
}
