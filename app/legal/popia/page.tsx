import { LegalHubLayout } from "@/components/legal/LegalHubLayout";
import { PopiaContent } from "@/components/legal/policies/PopiaContent";

export const metadata = {
  title: "POPIA",
  description:
    "Tonti's compliance with the Protection of Personal Information Act (POPIA) in South Africa.",
};

export default function LegalPopiaPage() {
  return (
    <LegalHubLayout
      title="POPIA compliance"
      description="Information about how Tonti processes personal information under the Protection of Personal Information Act, 2013 (POPIA)."
      lastUpdated="16 June 2026"
    >
      <PopiaContent />
    </LegalHubLayout>
  );
}
