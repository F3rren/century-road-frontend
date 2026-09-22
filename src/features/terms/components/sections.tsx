import type { ReactNode } from "react";
import { ExternalAnchor } from "@/components/ui/ExternalAnchor";
import {
  ContactEmail,
  LastUpdated,
  LegalSection,
  LegalSummary,
  OPERATOR_NAME,
} from "@/features/legal";
import {
  BACKEND_REPO_URL,
  CC_BY_SA_URL,
  FRONTEND_REPO_URL,
  LAST_UPDATED_ISO,
  NATURAL_EARTH_TERMS_URL,
  OSM_COPYRIGHT_URL,
} from "../constants";

const SUMMARY_ITEMS = [
  "Il sito è gratuito e non richiede un account.",
  "I testi degli eventi vengono da Wikipedia (CC BY-SA 4.0) e le immagini hanno licenze proprie: se le riusi, cita la fonte.",
  "Il servizio è offerto «così com'è»: può contenere errori e non è un archivio completo.",
  "Usalo in modo lecito e senza sovraccaricarlo.",
] as const;

export function SummarySection() {
  return <LegalSummary items={SUMMARY_ITEMS} />;
}

export function AboutSection() {
  return (
    <LegalSection title="1. Chi siamo e cosa offre il sito">
      <p>
        Century Road è una mappa interattiva con gli eventi storici accaduti nel giorno di
        oggi, e un archivio che copre ogni secolo. La gestisce{" "}
        <strong>{OPERATOR_NAME}</strong> («il gestore»), che puoi contattare a{" "}
        <ContactEmail />.
      </p>
      <p>Usando il sito accetti questi termini. Se non li accetti, non usarlo.</p>
    </LegalSection>
  );
}

export function UsageSection() {
  return (
    <LegalSection title="2. Come puoi usare il sito">
      <p>
        Il sito è gratuito e non richiede un account. Puoi usarlo per consultare gli
        eventi, per studiare e per uso personale o didattico. Non puoi:
      </p>
      <ul className="list-disc space-y-1.5 pl-5">
        <li>usarlo per attività illecite;</li>
        <li>
          accedere a parti del servizio che non sono pubbliche o aggirarne le misure di
          sicurezza;
        </li>
        <li>
          ostacolarne il funzionamento, per esempio con un numero eccessivo di
          richieste automatiche.
        </li>
      </ul>
      <p>
        Il gestore può limitare o bloccare l'accesso a chi non rispetta queste regole.
      </p>
    </LegalSection>
  );
}

interface LicenseItemProps {
  title: string;
  children: ReactNode;
}

function LicenseItem({ title, children }: LicenseItemProps) {
  return (
    <li>
      <strong>{title}.</strong> {children}
    </li>
  );
}

export function ContentSection() {
  return (
    <LegalSection title="3. Contenuti e licenze">
      <p>Il sito mostra contenuti di terzi, ciascuno con la propria licenza:</p>
      <ul className="space-y-3">
        <LicenseItem title="Testi degli eventi">
          Vengono da Wikipedia e sono disponibili con licenza{" "}
          <ExternalAnchor href={CC_BY_SA_URL} className="text-primary">
            CC BY-SA 4.0
          </ExternalAnchor>
          . Se li riusi devi citare Wikipedia e l'articolo, indicare la licenza e, se li
          modifichi, distribuire il risultato con la stessa licenza.
        </LicenseItem>
        <LicenseItem title="Immagini">
          Vengono da Wikimedia Commons. Ognuna ha una propria licenza e un proprio
          autore, indicati nella pagina del file: la trovi con il link «Autore e
          licenza dell'immagine» nel dettaglio di ogni evento. La licenza dei testi non
          vale per le immagini.
        </LicenseItem>
        <LicenseItem title="Mappa">
          I dati sono © OpenStreetMap contributors e disponibili con licenza ODbL (
          <ExternalAnchor href={OSM_COPYRIGHT_URL} className="text-primary">
            dettagli
          </ExternalAnchor>
          ); stile e tessere sono forniti da OpenFreeMap e OpenMapTiles. L'attribuzione
          è in basso a sinistra sulla mappa.
        </LicenseItem>
        <LicenseItem title="Confini dei paesi">
          Sono dati Natural Earth, di{" "}
          <ExternalAnchor href={NATURAL_EARTH_TERMS_URL} className="text-primary">
            pubblico dominio
          </ExternalAnchor>
          .
        </LicenseItem>
      </ul>
      <p>Il gestore non rivendica diritti su questi contenuti di terzi.</p>
    </LegalSection>
  );
}

export function IntellectualPropertySection() {
  return (
    <LegalSection title="4. Proprietà intellettuale">
      <p>
        Il nome «Century Road», la grafica, il software e i testi dell'interfaccia
        appartengono al gestore, salvo i contenuti di terzi indicati sopra. Il codice
        sorgente è pubblicato su GitHub (
        <ExternalAnchor href={FRONTEND_REPO_URL} className="text-primary">
          frontend
        </ExternalAnchor>
        ,{" "}
        <ExternalAnchor href={BACKEND_REPO_URL} className="text-primary">
          backend
        </ExternalAnchor>
        ): per usarlo valgono le licenze indicate in ciascun repository.
      </p>
    </LegalSection>
  );
}

export function AccuracySection() {
  return (
    <LegalSection title="5. Accuratezza dei contenuti">
      <p>
        I contenuti storici arrivano da Wikipedia, che è scritta e modificata dai suoi
        utenti: possono contenere errori, omissioni o informazioni superate.
      </p>
      <p>
        Il sito non pretende di essere un archivio completo. Alcune sezioni, come la
        mappa dei paesi, il menu «Vai a un paese» e la dashboard, usano per ora un
        insieme selezionato di eventi.
      </p>
      <p>
        Non usarlo come unica fonte per studi, lavori o decisioni: controlla sempre gli
        articoli originali, che il sito ti indica con un link.
      </p>
    </LegalSection>
  );
}

export function AvailabilitySection() {
  return (
    <LegalSection title="6. Disponibilità del servizio">
      <p>
        Il sito è offerto gratuitamente e «così com'è». Può essere modificato, sospeso
        o interrotto in qualsiasi momento, anche senza preavviso, per manutenzione o
        per cause esterne: per esempio se Wikipedia o i servizi della mappa non sono
        raggiungibili.
      </p>
    </LegalSection>
  );
}

export function LiabilitySection() {
  return (
    <LegalSection title="7. Limitazione di responsabilità">
      <p>
        Nei limiti consentiti dalla legge, il gestore non risponde dei danni che
        derivano dall'uso del sito o dall'impossibilità di usarlo, né dei contenuti e
        dei servizi di terze parti.
      </p>
      <p>
        Restano ferme le responsabilità che la legge non permette di escludere, per
        esempio in caso di dolo o colpa grave, e i diritti che la legge riconosce ai
        consumatori.
      </p>
    </LegalSection>
  );
}

export function LinksSection() {
  return (
    <LegalSection title="8. Link a siti di terzi">
      <p>
        Il sito rimanda a Wikipedia, Wikimedia Commons e altri siti. Il gestore non li
        controlla e non risponde dei loro contenuti. Come vengono trattati i tuoi dati
        è spiegato nell'informativa sulla privacy.
      </p>
    </LegalSection>
  );
}

export function GoverningLawSection() {
  return (
    <LegalSection title="9. Legge applicabile">
      <p>
        Questi termini sono regolati dalla legge italiana. Se sei un consumatore,
        restano ferme le norme inderogabili a tua tutela e puoi rivolgerti al giudice
        del luogo in cui risiedi.
      </p>
    </LegalSection>
  );
}

export function ChangesSection() {
  return (
    <LegalSection title="10. Modifiche ai termini">
      <p>
        Il gestore può aggiornare questi termini, per esempio se il sito cambia. Le
        modifiche valgono dalla pubblicazione di questa pagina, che riporta sempre la
        data dell'ultima versione. Per domande sui termini scrivi a{" "}
        <ContactEmail />.
      </p>
      <LastUpdated iso={LAST_UPDATED_ISO} />
    </LegalSection>
  );
}
