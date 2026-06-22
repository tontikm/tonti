import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminShell";
import { OrganizerStatusActions } from "@/components/admin/OrganizerStatusActions";
import { OrganizerStatusBadge } from "@/components/admin/OrganizerStatusBadge";
import { listAdminOrganizers } from "@/lib/admin/data";
import type { OrganizerStatus } from "@/lib/admin/data";
import { formatDateRange } from "@/lib/utils";

export const metadata = {
  title: "Admin · Organizers",
  robots: { index: false, follow: false },
};

type Props = {
  searchParams: Promise<{ status?: string }>;
};

const TABS: { key: OrganizerStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "suspended", label: "Suspended" },
];

function parseStatus(raw?: string): OrganizerStatus | undefined {
  if (raw === "pending" || raw === "approved" || raw === "suspended") {
    return raw;
  }
  return undefined;
}

export default async function AdminOrganizersPage({ searchParams }: Props) {
  const { status: statusParam } = await searchParams;
  const statusFilter = parseStatus(statusParam);
  const organizers = await listAdminOrganizers(statusFilter);

  return (
    <>
      <AdminPageHeader
        title="Organizers"
        description="Approve new organizers before their events appear on Tonti."
      />

      <div className="mb-6 flex flex-wrap gap-2">
        {TABS.map((tab) => {
          const href =
            tab.key === "all"
              ? "/admin/organizers"
              : `/admin/organizers?status=${tab.key}`;
          const active =
            tab.key === "all" ? !statusFilter : statusFilter === tab.key;

          return (
            <Link
              key={tab.key}
              href={href}
              className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                active
                  ? "border-amber-500/40 bg-amber-950/30 text-amber-100"
                  : "border-white/15 text-muted hover:text-foreground"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {organizers.length === 0 ? (
        <p className="text-sm text-muted">No organizers in this view.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Organizer</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Events</th>
                <th className="px-4 py-3 font-medium">Joined</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {organizers.map((org) => (
                <tr key={org.id} className="bg-surface/20">
                  <td className="px-4 py-4">
                    <p className="font-medium">{org.name ?? "—"}</p>
                    <p className="text-xs text-muted">{org.email}</p>
                    {org.slug && (
                      <Link
                        href={`/organizers/${org.slug}`}
                        className="text-xs text-muted underline-offset-4 hover:underline"
                      >
                        /organizers/{org.slug}
                      </Link>
                    )}
                    <Link
                      href={`/admin/organizers/${org.id}`}
                      className="mt-1 block text-xs text-amber-200 underline-offset-4 hover:underline"
                    >
                      Statement
                    </Link>
                  </td>
                  <td className="px-4 py-4">
                    <OrganizerStatusBadge status={org.status} />
                  </td>
                  <td className="px-4 py-4 text-muted">{org.eventCount}</td>
                  <td className="px-4 py-4 text-muted">
                    {formatDateRange(org.createdAt.slice(0, 10))}
                  </td>
                  <td className="px-4 py-4">
                    <OrganizerStatusActions
                      organizerId={org.id}
                      status={org.status}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
