type FanProfileStatsProps = {
  upcomingCount: number;
  attendedCount: number;
  totalTickets: number;
};

function StatTile({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-5 py-4 text-center">
      <p className="text-3xl font-bold tabular-nums">{value}</p>
      <p className="mt-1 text-sm text-muted">{label}</p>
    </div>
  );
}

export function FanProfileStats({
  upcomingCount,
  attendedCount,
  totalTickets,
}: FanProfileStatsProps) {
  return (
    <div className="grid grid-cols-3 gap-3 sm:gap-4">
      <StatTile value={upcomingCount} label="Upcoming" />
      <StatTile value={attendedCount} label="Attended" />
      <StatTile value={totalTickets} label="Total tickets" />
    </div>
  );
}
