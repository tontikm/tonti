import { createAuthClient, isFanAuthConfigured } from "@/lib/supabase/server-auth";
import { getFanLastActivity } from "@/lib/auth/fan-activity";
import { IDLE_TIMEOUTS_MS, isIdleExpired } from "@/lib/auth/idle-timeout";

export type FanUser = {
  id: string;
  email: string;
  name: string;
  createdAt?: string;
};

export async function getFanUser(): Promise<FanUser | null> {
  if (!isFanAuthConfigured()) return null;

  const supabase = await createAuthClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) return null;

  const lastActivity = await getFanLastActivity();
  if (lastActivity && isIdleExpired(lastActivity, IDLE_TIMEOUTS_MS.fan)) {
    return null;
  }

  const metadataName = user.user_metadata?.full_name;
  const name =
    typeof metadataName === "string" && metadataName.trim()
      ? metadataName.trim()
      : user.email.split("@")[0];

  return {
    id: user.id,
    email: user.email,
    name,
    createdAt: user.created_at ?? undefined,
  };
}
