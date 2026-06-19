import { COMPANY_NAME, CONTACT_EMAIL, LEGAL_EMAIL } from "@/lib/site";

export function TermsContent() {
  return (
    <>
      <section>
        <h2>1. About Tonti</h2>
        <p>
          Tonti is a live-music ticketing and discovery platform operated by{" "}
          {COMPANY_NAME} (&quot;Tonti&quot;, &quot;we&quot;, &quot;us&quot;). By
          accessing tonti.co.za or related services, you agree to these terms.
        </p>
      </section>

      <section>
        <h2>2. Eligibility</h2>
        <p>
          You must be at least 18 years old to purchase tickets unless an event
          specifies a different minimum age. Organizers must have authority to
          list events on behalf of the stated venue or promoter.
        </p>
      </section>

      <section>
        <h2>3. Tickets and RSVPs</h2>
        <ul>
          <li>
            Ticket tiers, prices, capacity, and entry rules are set by event
            organizers.
          </li>
          <li>
            Free RSVPs and paid tickets (when available) are subject to tier
            availability at the time of checkout.
          </li>
          <li>
            QR tickets are personal. Do not share codes publicly. Tonti is not
            responsible for loss arising from shared or duplicated codes.
          </li>
          <li>
            Door entry is subject to venue rules, age restrictions, and valid ID
            checks.
          </li>
        </ul>
      </section>

      <section>
        <h2>4. Organizer responsibilities</h2>
        <p>
          Organizers are responsible for accurate event information, lawful
          promotion, capacity limits, refunds where applicable, and compliance
          with venue agreements and South African law.
        </p>
      </section>

      <section>
        <h2>5. Acceptable use</h2>
        <p>You may not use Tonti to:</p>
        <ul>
          <li>List non-music events or misleading listings</li>
          <li>Scrape, reverse engineer, or disrupt the platform</li>
          <li>Resell tickets in breach of organizer or venue policy</li>
          <li>Upload unlawful, harmful, or infringing content</li>
        </ul>
      </section>

      <section>
        <h2>6. Limitation of liability</h2>
        <p>
          Tonti provides the platform &quot;as is&quot;. To the fullest extent
          permitted by South African law, we are not liable for event
          cancellations, changes, venue conditions, or organizer actions beyond
          our reasonable control. Nothing in these terms limits rights you cannot
          waive under the Consumer Protection Act where applicable.
        </p>
      </section>

      <section>
        <h2>7. Governing law</h2>
        <p>
          These terms are governed by the laws of the Republic of South Africa.
          Disputes are subject to the jurisdiction of South African courts.
        </p>
      </section>

      <section>
        <h2>8. Contact</h2>
        <p>
          Questions about these terms:{" "}
          <a href={`mailto:${LEGAL_EMAIL}`} className="text-foreground hover:underline">
            {LEGAL_EMAIL}
          </a>{" "}
          or{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-foreground hover:underline">
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </section>
    </>
  );
}
