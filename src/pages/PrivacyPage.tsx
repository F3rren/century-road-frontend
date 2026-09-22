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
import { usePageTitle } from "@/hooks/usePageTitle";

export function PrivacyPage() {
  usePageTitle("Privacy");

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
