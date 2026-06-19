import Link from "next/link";
import { CheckoutAuthGate } from "@/components/auth/CheckoutAuthGate";
import { sanitizeReturnTo } from "@/lib/auth/sanitize-return-to";
import { isFanAuthConfigured } from "@/lib/supabase/server-auth";

type LoginPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata = {
  title: "Sign in",
};

function getInitialError(error: string | undefined): string | undefined {
  if (error === "auth") {
    return "Google sign-in failed. Try again or use email.";
  }
  if (error === "config") {
    return "Fan auth is not configured.";
  }
  return undefined;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const query = await searchParams;
  const nextParam = query.next;
  const returnTo = sanitizeReturnTo(
    typeof nextParam === "string" ? nextParam : "/",
  );
  const errorParam = query.error;
  const initialError = getInitialError(
    typeof errorParam === "string" ? errorParam : undefined,
  );

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col justify-center px-4 py-12 sm:px-6">
      <CheckoutAuthGate
        returnTo={returnTo}
        authConfigured={isFanAuthConfigured()}
        initialError={initialError}
        footer={
          <p className="text-center text-sm text-muted">
            <Link href="/events" className="hover:text-foreground">
              ← Back to events
            </Link>
          </p>
        }
      />
    </div>
  );
}
