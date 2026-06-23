import { LegalHubLayout } from "@/components/legal/LegalHubLayout";
import { CookiesContent } from "@/components/legal/policies/CookiesContent";

export const metadata = {
  title: "Cookie policy",
  description: "How Spotra uses cookies and similar technologies.",
};

export default function LegalCookiesPage() {
  return (
    <LegalHubLayout
      title="Cookie policy"
      description="This policy describes how Spotra uses cookies and local storage on our website."
      lastUpdated="16 June 2026"
    >
      <CookiesContent />
    </LegalHubLayout>
  );
}
