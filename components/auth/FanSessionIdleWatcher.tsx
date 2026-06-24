import { getFanUser } from "@/lib/auth/session";
import { FanSessionIdleWatcherClient } from "@/components/auth/FanSessionIdleWatcherClient";

export async function FanSessionIdleWatcher() {
  const user = await getFanUser();
  if (!user) return null;
  return <FanSessionIdleWatcherClient />;
}
