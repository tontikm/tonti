import Link from "next/link";
import { redirect } from "next/navigation";
import { FanProfileHeader } from "@/components/account/FanProfileHeader";
import { FanProfileStats } from "@/components/account/FanProfileStats";
import {
  EmptySection,
  NextUpCard,
  OrderCard,
  ProfileSection,
} from "@/components/account/OrderCard";
import { getFanUser } from "@/lib/auth/session";
import {
  getFanOrders,
  isOrderAttended,
  isOrderUpcoming,
  type FanOrderRecord,
} from "@/lib/fan/orders";
import { getSafeEventImageUrl } from "@/lib/images";
import { isFanAuthConfigured } from "@/lib/supabase/server-auth";
import { formatEventDate, formatEventTime } from "@/lib/utils";

export const metadata = {
  title: "Profile",
};

function sortUpcomingByShowTime(records: FanOrderRecord[]): FanOrderRecord[] {
  return [...records].sort((a, b) => {
    const aTime = a.event ? new Date(a.event.showTime).getTime() : Infinity;
    const bTime = b.event ? new Date(b.event.showTime).getTime() : Infinity;
    return aTime - bTime;
  });
}

function orderLabels(record: FanOrderRecord) {
  const { order, event } = record;
  return {
    title: event?.title ?? order.eventSlug,
    imageUrl: event?.image ? getSafeEventImageUrl(event.image) : null,
    dateLabel: event
      ? `${formatEventDate(event.date)} · ${formatEventTime(event.showTime)}`
      : "Date TBC",
    venueLabel: event
      ? `${event.venue.name}, ${event.venue.city}`
      : "Venue TBC",
  };
}

export default async function AccountPage() {
  if (!isFanAuthConfigured()) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="mt-4 text-muted">
          Fan accounts require Supabase auth. Add your keys to{" "}
          <code className="text-foreground">.env.local</code> and run the
          migrations.
        </p>
      </div>
    );
  }

  const user = await getFanUser();
  if (!user) {
    redirect("/login?next=/account");
  }

  const records = await getFanOrders(user);
  const upcoming = sortUpcomingByShowTime(
    records.filter((record) => isOrderUpcoming(record)),
  );
  const attended = records.filter((record) => isOrderAttended(record));
  const totalTickets = records.reduce(
    (sum, record) => sum + record.order.ticketCount,
    0,
  );
  const nextUp = upcoming[0] ?? null;
  const remainingUpcoming = nextUp ? upcoming.slice(1) : [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <FanProfileHeader user={user} />

      <div className="mt-6">
        <FanProfileStats
          upcomingCount={upcoming.length}
          attendedCount={attended.length}
          totalTickets={totalTickets}
        />
      </div>

      {nextUp ? (
        <div className="mt-8">
          <NextUpCard
            orderId={nextUp.order.id}
            ticketCount={nextUp.order.ticketCount}
            {...orderLabels(nextUp)}
          />
        </div>
      ) : null}

      <div className="mt-8 space-y-6">
        <ProfileSection title="Upcoming" count={upcoming.length}>
          {upcoming.length === 0 ? (
            <EmptySection message="No upcoming tickets yet. Browse events and grab a spot." />
          ) : remainingUpcoming.length === 0 && nextUp ? (
            <p className="text-sm text-muted">
              Your next show is highlighted above.
            </p>
          ) : (
            <div className="space-y-3">
              {remainingUpcoming.map((record) => (
                <OrderCard
                  key={record.order.id}
                  orderId={record.order.id}
                  ticketCount={record.order.ticketCount}
                  totalAmount={record.order.totalAmount}
                  badge="Upcoming"
                  {...orderLabels(record)}
                />
              ))}
            </div>
          )}
        </ProfileSection>

        <ProfileSection title="Attended" count={attended.length}>
          {attended.length === 0 ? (
            <EmptySection message="Events you check in to will show up here." />
          ) : (
            <div className="space-y-3">
              {attended.map((record) => (
                <OrderCard
                  key={record.order.id}
                  orderId={record.order.id}
                  ticketCount={record.order.ticketCount}
                  totalAmount={record.order.totalAmount}
                  badge="Attended"
                  {...orderLabels(record)}
                />
              ))}
            </div>
          )}
        </ProfileSection>

        <ProfileSection title="All orders" count={records.length}>
          {records.length === 0 ? (
            <EmptySection message="You haven't booked any tickets yet." />
          ) : (
            <div className="space-y-3">
              {records.map((record) => (
                <OrderCard
                  key={record.order.id}
                  orderId={record.order.id}
                  ticketCount={record.order.ticketCount}
                  totalAmount={record.order.totalAmount}
                  {...orderLabels(record)}
                />
              ))}
            </div>
          )}
        </ProfileSection>
      </div>

      <div className="mt-10 text-center">
        <Link href="/events" className="text-sm text-muted hover:text-foreground">
          Browse events
        </Link>
      </div>
    </div>
  );
}
