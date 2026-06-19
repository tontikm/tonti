import { POPIA_EMAIL } from "@/lib/site";

export function CookiesContent() {
  return (
    <>
      <section>
        <h2>1. What are cookies?</h2>
        <p>
          Cookies are small text files stored on your device when you visit a
          website. We also use similar technologies such as local storage for
          session state.
        </p>
      </section>

      <section>
        <h2>2. Cookies we use</h2>
        <h3>Essential</h3>
        <ul>
          <li>
            <strong>Organizer session:</strong> keeps you signed in to the
            organizer dashboard during beta
          </li>
          <li>
            <strong>Security:</strong> helps protect forms and authenticated
            routes
          </li>
        </ul>
        <h3>Functional</h3>
        <ul>
          <li>Remembering UI preferences where applicable</li>
        </ul>
        <h3>Analytics (if enabled)</h3>
        <p>
          We may use privacy-focused analytics to understand site usage. You will
          be notified before non-essential analytics cookies are deployed.
        </p>
      </section>

      <section>
        <h2>3. Managing cookies</h2>
        <p>
          You can block or delete cookies through your browser settings. Blocking
          essential cookies may prevent organizer login or ticket features from
          working correctly.
        </p>
      </section>

      <section>
        <h2>4. Contact</h2>
        <p>
          Questions:{" "}
          <a href={`mailto:${POPIA_EMAIL}`} className="text-foreground hover:underline">
            {POPIA_EMAIL}
          </a>
        </p>
      </section>
    </>
  );
}
