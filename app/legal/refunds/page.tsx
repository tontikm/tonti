import { LegalHubLayout } from "@/components/legal/LegalHubLayout";
import { RefundsContent } from "@/components/legal/policies/RefundsContent";

export const metadata = {
  title: "Refund policy",
  description:
    "Refund and cancellation policy for tickets purchased or reserved on Tonti.",
};

export default function LegalRefundsPage() {
  return (
    <LegalHubLayout
      title="Refund policy"
      description="How refunds, cancellations, and event changes work on Tonti."
      lastUpdated="16 June 2026"
    >
      <RefundsContent />
    </LegalHubLayout>
  );
}
