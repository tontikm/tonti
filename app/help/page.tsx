import Link from "next/link";
import { LegalLayout } from "@/components/legal/LegalLayout";
import { SocialLinks } from "@/components/layout/SocialLinks";
import {
  CONTACT_EMAIL,
  SOCIAL_LINKS,
  SUPPORT_EMAIL,
} from "@/lib/site";

export const metadata = {
  title: "Help & support",
  description: "Get help with tickets, RSVPs, refunds, and organizer tools on Spotra.",
};

export default function HelpPage() {
  return (
    <LegalLayout
      title="Help & support"
      description="Answers to common questions about tickets, RSVPs, and listing events on Spotra."
      lastUpdated="16 June 2026"
    >
      <section>
        <h2>Fans &amp; ticket buyers</h2>
        <h3>How do I get tickets?</h3>
        <p>
          Open an event page, choose your tier, and complete the RSVP or checkout
          flow. Free tiers issue QR tickets immediately on the confirmation page.
        </p>
        <h3>Where is my QR ticket?</h3>
        <p>
          After a successful RSVP you are redirected to your ticket page. Save the
          link or screenshot your QR codes. You can also open your ticket from
          the verification link encoded in each QR.
        </p>
        <h3>Can I get a refund?</h3>
        <p>
          Refund rules are set by each organizer. See our{" "}
          <Link href="/legal/refunds" className="text-foreground hover:underline">
            refund policy
          </Link>{" "}
          and the event page for details.
        </p>
      </section>

      <section>
        <h2>Organizers &amp; venues</h2>
        <h3>How do I list an event?</h3>
        <p>
          Sign in at{" "}
          <Link href="/for-organizers" className="text-foreground hover:underline">
            Spotra for organizers
          </Link>
          , create an event, upload a poster, set ticket tiers, and publish.
        </p>
        <h3>How do I check in guests at the door?</h3>
        <p>
          From your event in the dashboard, open <strong>Tickets</strong> or{" "}
          <strong>Door scanner</strong> to scan QR codes or enter ticket codes
          manually.
        </p>
      </section>

      <section>
        <h2>Contact us</h2>
        <ul>
          <li>
            General:{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-foreground hover:underline"
            >
              {CONTACT_EMAIL}
            </a>
          </li>
          <li>
            Ticket support:{" "}
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="text-foreground hover:underline"
            >
              {SUPPORT_EMAIL}
            </a>
          </li>
        </ul>
        {SOCIAL_LINKS.length > 0 && (
          <div className="mt-6">
            <p className="mb-3 text-foreground">Follow Spotra</p>
            <SocialLinks />
          </div>
        )}
      </section>
    </LegalLayout>
  );
}
