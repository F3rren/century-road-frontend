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
import { usePageMeta } from "@/hooks/usePageMeta";

export function TermsPage() {
  usePageMeta("Termini e condizioni", "Le regole per usare Grains of History");

  return (
    <LegalPage
      title="Termini e condizioni"
      description="Le regole per usare Grains of History"
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
