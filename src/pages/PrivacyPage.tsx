import {
  ChangesSection,
  ControllerSection,
  DataSection,
  LegalBasisSection,
  RetentionSection,
  RightsSection,
  StorageSection,
  SummarySection,
  ThirdPartiesSection,
} from "@/features/privacy";
import { LegalPage, SeeAlso } from "@/features/legal";
import { usePageMeta } from "@/hooks/usePageMeta";

export function PrivacyPage() {
  usePageMeta("Privacy", "Come Century Road tratta i tuoi dati");

  return (
    <LegalPage
      title="Informativa sulla privacy"
      description="Come Century Road tratta i tuoi dati"
    >
      <SummarySection />
      <ControllerSection />
      <DataSection />
      <StorageSection />
      <ThirdPartiesSection />
      <LegalBasisSection />
      <RetentionSection />
      <RightsSection />
      <ChangesSection />
      <SeeAlso to="/terms" label="Termini e condizioni" />
    </LegalPage>
  );
}
