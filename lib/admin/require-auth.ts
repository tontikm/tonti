import type { AdminSession } from "@/lib/admin/session";
import { getAdminSession } from "@/lib/admin/session";

export type AdminAuthError = { error: string };

export async function requireAdminSession(): Promise<
  AdminSession | AdminAuthError
> {
  const session = await getAdminSession();
  if (!session) {
    return { error: "You must be signed in as a platform admin." };
  }
  return session;
}
