import { BarChart3, QrCode, Ticket, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "Organizer Dashboard",
  description: "Sell tickets to your music events on Tonti.",
};

const features = [
  {
    icon: Ticket,
    title: "Create events",
    description: "Set up shows with multiple ticket tiers, capacity limits, and pricing.",
  },
  {
    icon: BarChart3,
    title: "Track sales",
    description: "Real-time analytics on ticket sales, revenue, and attendance.",
  },
  {
    icon: QrCode,
    title: "Scan at the door",
    description: "Validate tickets instantly with our door scanning app.",
  },
  {
    icon: Users,
    title: "Manage attendees",
    description: "Export guest lists, handle refunds, and communicate with buyers.",
  },
];

export default function OrganizerPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <p className="text-sm font-medium uppercase tracking-wider text-accent">
          For promoters & venues
        </p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
          Sell tickets to your music events
        </h1>
        <p className="mt-4 text-lg text-muted">
          Tonti is built exclusively for live music. List your show, set your
          tiers, and start selling — dashboard and Stripe Connect coming next.
        </p>
        <Button className="mt-8" size="lg" disabled>
          Sign up — coming soon
        </Button>
      </div>

      <div className="mt-16 grid gap-6 sm:grid-cols-2">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="rounded-2xl border border-border bg-surface p-6"
          >
            <feature.icon className="h-8 w-8 text-accent" />
            <h2 className="mt-4 text-lg font-semibold">{feature.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
