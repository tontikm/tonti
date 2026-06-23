import { LegalHubLayout } from "@/components/legal/LegalHubLayout";
import { PrivacyContent } from "@/components/legal/policies/PrivacyContent";

export const metadata = {
  title: "Privacy policy",
  description:
    "How Spotra collects, uses, and protects your personal information in South Africa.",
};

export default function LegalPrivacyPage() {
  return (
    <LegalHubLayout
      title="Privacy policy"
      description="This policy explains what personal information we collect and how we use it when you use Spotra."
      lastUpdated="16 June 2026"
    >
      <PrivacyContent />
    </LegalHubLayout>
  );
}
