import { COMPANY_NAME, POPIA_EMAIL, BRAND_NAME } from "@/lib/site";

export function PopiaContent() {
  return (
    <>
      <section>
        <h2>1. Purpose of processing</h2>
        <p>
          {BRAND_NAME} processes personal information to facilitate live-music event
          discovery, ticket RSVPs, QR check-in, and organizer tools. Processing
          is based on consent, contractual necessity, and legitimate interests
          where appropriate under POPIA.
        </p>
      </section>

      <section>
        <h2>2. Information officer</h2>
        <p>
          {COMPANY_NAME} has designated an information officer responsible for
          POPIA compliance. Contact:{" "}
          <a href={`mailto:${POPIA_EMAIL}`} className="text-foreground hover:underline">
            {POPIA_EMAIL}
          </a>
        </p>
      </section>

      <section>
        <h2>3. Categories of data subjects</h2>
        <ul>
          <li>Fans and ticket buyers</li>
          <li>Event organizers and venue partners</li>
          <li>Website visitors</li>
        </ul>
      </section>

      <section>
        <h2>4. Your POPIA rights</h2>
        <p>You have the right to:</p>
        <ul>
          <li>Be notified that your personal information is being collected</li>
          <li>Request access to personal information we hold about you</li>
          <li>Request correction or deletion where applicable</li>
          <li>Object to processing in certain circumstances</li>
          <li>Lodge a complaint with the Information Regulator (South Africa)</li>
        </ul>
      </section>

      <section>
        <h2>5. Cross-border transfers</h2>
        <p>
          Some service providers may process data outside South Africa. Where this
          occurs, we take steps to ensure adequate protection consistent with
          POPIA requirements.
        </p>
      </section>

      <section>
        <h2>6. Data breaches</h2>
        <p>
          If a compromise of personal information occurs, we will notify affected
          data subjects and the Information Regulator where required by law.
        </p>
      </section>

      <section>
        <h2>7. Information Regulator</h2>
        <p>
          Information Regulator (South Africa):{" "}
          <a
            href="https://inforegulator.org.za"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground hover:underline"
          >
            inforegulator.org.za
          </a>
        </p>
      </section>

      <section>
        <h2>8. Related policies</h2>
        <p>
          See also our{" "}
          <a href="/legal/privacy" className="text-foreground hover:underline">
            Privacy policy
          </a>{" "}
          and{" "}
          <a href="/legal/cookies" className="text-foreground hover:underline">
            Cookie policy
          </a>
          .
        </p>
      </section>
    </>
  );
}
