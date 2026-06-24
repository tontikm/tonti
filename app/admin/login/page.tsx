import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { getAdminSession } from "@/lib/admin/session";

export const metadata = {
  title: "Admin login",
  robots: { index: false, follow: false },
};

type AdminLoginPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const session = await getAdminSession();
  if (session) {
    redirect("/admin");
  }

  const query = await searchParams;
  const idleLogout = query.reason === "idle";

  return <AdminLoginForm idleLogout={idleLogout} />;
}
