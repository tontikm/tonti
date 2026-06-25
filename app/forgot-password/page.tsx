import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { sanitizeReturnTo } from "@/lib/auth/sanitize-return-to";
import { isFanAuthConfigured } from "@/lib/supabase/server-auth";

export const metadata = {
  title: "Forgot password",
};

type ForgotPasswordPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ForgotPasswordPage({
  searchParams,
}: ForgotPasswordPageProps) {
  const query = await searchParams;
  const nextParam = query.next;
  const returnTo = sanitizeReturnTo(
    typeof nextParam === "string" ? nextParam : "/login",
  );

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col justify-center px-4 py-12 sm:px-6">
      <ForgotPasswordForm
        authConfigured={isFanAuthConfigured()}
        returnTo={returnTo}
      />
    </div>
  );
}
