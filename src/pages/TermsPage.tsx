import { LegalPage, SeeAlso } from "@/features/legal";
import {
  AboutSection,
  AccuracySection,
  AvailabilitySection,
  ChangesSection,
  ContentSection,
  GoverningLawSection,
  IntellectualPropertySection,
  LiabilitySection,
  LinksSection,
  SummarySection,
  UsageSection,
} from "@/features/terms";
import { usePageTitle } from "@/hooks/usePageTitle";

export function TermsPage() {
  usePageTitle("Termini e condizioni");

  return (
    <LegalPage
      title="Termini e condizioni"
      description="Le regole per usare Century Road"
    >
      <SummarySection />
      <AboutSection />
      <UsageSection />
      <ContentSection />
      <IntellectualPropertySection />
      <AccuracySection />
      <AvailabilitySection />
      <LiabilitySection />
      <LinksSection />
      <GoverningLawSection />
      <ChangesSection />
      <SeeAlso to="/privacy" label="Informativa sulla privacy" />
    </LegalPage>
  );
}
