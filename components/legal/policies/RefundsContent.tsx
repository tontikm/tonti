import { SUPPORT_EMAIL, BRAND_NAME } from "@/lib/site";

export function RefundsContent() {
  return (
    <>
      <section>
        <h2>1. General principle</h2>
        <p>
          Refund rules are primarily set by the event organizer and displayed on
          the event page. {BRAND_NAME} facilitates ticketing but does not guarantee
          refunds unless stated for a specific event or required by law.
        </p>
      </section>

      <section>
        <h2>2. Free RSVPs</h2>
        <p>
          Free RSVP tickets can be cancelled by contacting the organizer or {BRAND_NAME}
          support before the event. No payment is processed for free tiers.
        </p>
      </section>

      <section>
        <h2>3. Paid tickets</h2>
        <p>
          When online payments launch, refund eligibility will depend on the
          organizer&apos;s stated policy and the Consumer Protection Act where
          applicable. Processing times for approved refunds are typically 5–10
          business days via the original payment method.
        </p>
      </section>

      <section>
        <h2>4. Cancelled or rescheduled events</h2>
        <p>
          If an event is cancelled or materially changed, the organizer is
          responsible for communicating options (refund, credit, or transfer).
          {BRAND_NAME} will assist with notifications where technically possible.
        </p>
      </section>

      <section>
        <h2>5. Door refusal</h2>
        <p>
          Tickets may be refused at entry for valid reasons (age limits, capacity,
          conduct, forged codes). Refunds are generally not available where entry
          is refused due to breach of event or venue rules.
        </p>
      </section>

      <section>
        <h2>6. How to request a refund</h2>
        <p>
          Email{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="text-foreground hover:underline">
            {SUPPORT_EMAIL}
          </a>{" "}
          with your order reference, event name, and reason for the request. We
          will coordinate with the organizer and respond within 5 business days.
        </p>
      </section>
    </>
  );
}
