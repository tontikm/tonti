import { LegalHubLayout } from "@/components/legal/LegalHubLayout";
import { TermsContent } from "@/components/legal/policies/TermsContent";

export const metadata = {
  title: "Terms of service",
  description:
    "Terms and conditions for using Spotra to discover and book live music events in South Africa.",
};

export default function LegalTermsPage() {
  return (
    <LegalHubLayout
      title="Terms of service"
      description="These terms govern your use of Spotra as a fan, ticket buyer, or event organizer in South Africa."
      lastUpdated="16 June 2026"
    >
      <TermsContent />
    </LegalHubLayout>
  );
}
