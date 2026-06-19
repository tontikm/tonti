import { COMPANY_NAME, CONTACT_EMAIL, POPIA_EMAIL } from "@/lib/site";

export function PrivacyContent() {
  return (
    <>
      <section>
        <h2>1. Who we are</h2>
        <p>
          {COMPANY_NAME} (&quot;Tonti&quot;) is the responsible party for personal
          information processed through our website and ticketing services, in
          line with the Protection of Personal Information Act, 2013 (POPIA).
        </p>
      </section>

      <section>
        <h2>2. Information we collect</h2>
        <ul>
          <li>
            <strong>Account &amp; RSVP data:</strong> name, email address, ticket
            selections, order history, and QR ticket codes
          </li>
          <li>
            <strong>Organizer data:</strong> email address used to access the
            organizer dashboard
          </li>
          <li>
            <strong>Event content:</strong> posters, descriptions, and listings
            submitted by organizers
          </li>
          <li>
            <strong>Technical data:</strong> IP address, browser type, device
            information, and usage logs for security and analytics
          </li>
        </ul>
      </section>

      <section>
        <h2>3. How we use your information</h2>
        <ul>
          <li>Process ticket RSVPs and display confirmation pages</li>
          <li>Enable door check-in and organizer guest lists</li>
          <li>Operate, secure, and improve the platform</li>
          <li>Communicate service updates and support responses</li>
          <li>Comply with legal obligations</li>
        </ul>
      </section>

      <section>
        <h2>4. Sharing of information</h2>
        <p>
          We share ticket buyer name and email with the relevant event organizer
          for the event you booked. We use service providers (such as hosting and
          database providers) under appropriate safeguards. We do not sell your
          personal information.
        </p>
      </section>

      <section>
        <h2>5. Retention</h2>
        <p>
          We retain information for as long as needed to provide services,
          resolve disputes, enforce agreements, and meet legal requirements.
          Ticket records may be kept for audit and fraud-prevention purposes after
          the event date.
        </p>
      </section>

      <section>
        <h2>6. Your rights</h2>
        <p>
          Under POPIA you may request access, correction, deletion, or restriction
          of your personal information, subject to lawful exceptions. See our{" "}
          <a href="/legal/popia" className="text-foreground hover:underline">
            POPIA page
          </a>{" "}
          for details.
        </p>
      </section>

      <section>
        <h2>7. Security</h2>
        <p>
          We use technical and organizational measures to protect data, including
          encrypted connections and access controls. No online system is completely
          secure; please use a strong email account and keep ticket codes private.
        </p>
      </section>

      <section>
        <h2>8. Contact</h2>
        <p>
          Privacy enquiries:{" "}
          <a href={`mailto:${POPIA_EMAIL}`} className="text-foreground hover:underline">
            {POPIA_EMAIL}
          </a>{" "}
          · General:{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-foreground hover:underline">
            {CONTACT_EMAIL}
          </a>
        </p>
      </section>
    </>
  );
}
