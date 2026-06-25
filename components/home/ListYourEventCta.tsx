import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

export function ListYourEventCta() {
  return (
    <section className="mx-auto max-w-[1440px] px-4 pt-6 sm:px-6 lg:px-8">
      <Reveal className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-xl">
            <h2 className="text-xl font-bold sm:text-2xl">List your event</h2>
            <p className="mt-1.5 text-sm text-muted sm:text-base">
              Sell tickets and scan guests at the door — built for SA promoters
              and venues.
            </p>
          </div>
          <Button href="/for-organizers" size="lg" className="shrink-0">
            List your event
          </Button>
        </div>
      </Reveal>
    </section>
  );
}
