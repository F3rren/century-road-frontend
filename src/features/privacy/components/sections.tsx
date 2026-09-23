import { ExternalAnchor } from "@/components/ui/ExternalAnchor";
import { THEME_STORAGE_KEY } from "@/hooks/useTheme";
import {
  ContactEmail,
  LastUpdated,
  LegalSection,
  LegalSummary,
  OPERATOR_NAME,
} from "@/features/legal";
import { GARANTE_URL, GDPR_URL, LAST_UPDATED_ISO } from "../constants";
import { THIRD_PARTIES } from "../data/thirdParties";
import { ThirdPartyList } from "./ThirdPartyList";

const SUMMARY_ITEMS = [
  "Non serve un account e non ti chiediamo dati personali.",
  "Non usiamo cookie, strumenti di analisi né pubblicità, e non ti profiliamo.",
  "Per mostrare mappa e immagini, il tuo browser contatta alcuni servizi esterni, che vedono il tuo indirizzo IP.",
  "Nel tuo browser salviamo una sola preferenza, il tema chiaro o scuro, e solo se lo cambi.",
] as const;

export function SummarySection() {
  return <LegalSummary items={SUMMARY_ITEMS} />;
}

export function ControllerSection() {
  return (
    <LegalSection title="1. Titolare del trattamento">
      <p>
        Il titolare del trattamento è <strong>{OPERATOR_NAME}</strong>. Per qualsiasi
        domanda su questa informativa o sui tuoi dati puoi scrivere a <ContactEmail />.
      </p>
    </LegalSection>
  );
}

export function DataSection() {
  return (
    <LegalSection title="2. Quali dati trattiamo">
      <p>
        <strong>Dati tecnici di navigazione.</strong> Come ogni sito, quando lo apri il
        tuo browser invia al server il tuo indirizzo IP, la data e l'ora, la pagina o il
        dato richiesto e informazioni sul browser. Servono a consegnare il sito e a
        garantirne il funzionamento e la sicurezza.
      </p>
      <p>
        <strong>Richieste degli eventi.</strong> Per mostrare «Accadde oggi» il sito
        chiede al nostro servizio gli eventi di un giorno. La richiesta contiene solo il
        giorno e il mese, la lingua, il tipo di voci e l'intervallo di anni: nessun dato
        che ti identifica, e non serve accedere. A ogni richiesta viene assegnato un
        codice casuale, usato solo per collegare tra loro le righe dei log tecnici.
      </p>
      <p>
        Gli eventi vengono letti da Wikipedia dal nostro server, non dal tuo browser:
        per quella richiesta il tuo indirizzo IP non viene inoltrato a Wikipedia.
      </p>
      <p>
        Il sito non ha moduli, account né commenti e non usa la tua posizione, quindi
        non raccogliamo nome, email o altri dati che ci fornisci volontariamente.
      </p>
    </LegalSection>
  );
}

export function StorageSection() {
  return (
    <LegalSection title="3. Cookie e archiviazione nel browser">
      <p>Il sito non imposta cookie.</p>
      <p>
        Se usi il pulsante del tema, il browser salva nel suo archivio locale
        (localStorage) una voce chiamata{" "}
        <code className="font-mono text-sm">{THEME_STORAGE_KEY}</code>, con valore{" "}
        <code className="font-mono text-sm">light</code> o{" "}
        <code className="font-mono text-sm">dark</code>. Serve solo a ricordare la tua
        scelta, resta sul tuo dispositivo e non viene inviata a nessuno. Puoi
        cancellarla dalle impostazioni del browser.
      </p>
      <p>
        Se non cambi tema, il sito segue la preferenza del tuo sistema e non salva
        nulla.
      </p>
    </LegalSection>
  );
}

export function ThirdPartiesSection() {
  return (
    <LegalSection title="4. Servizi di terze parti">
      <p>
        Il sito non ospita da solo tutto ciò che mostra. Mentre lo usi, il tuo browser
        contatta direttamente questi servizi, che possono vedere il tuo indirizzo IP e
        lo trattano secondo le proprie informative.
      </p>
      <ThirdPartyList providers={THIRD_PARTIES} />
      <p>
        Quando apri un link verso Wikipedia, Wikimedia Commons o Creative Commons lasci
        il sito: da quel momento valgono le informative di quei siti.
      </p>
    </LegalSection>
  );
}

export function LegalBasisSection() {
  return (
    <LegalSection title="5. Perché li trattiamo e su quale base">
      <p>
        Trattiamo i dati tecnici per far funzionare il sito e proteggerlo da abusi. La
        base giuridica è il legittimo interesse del titolare a offrire un servizio
        sicuro e funzionante (art. 6, par. 1, lett. f, del{" "}
        <ExternalAnchor href={GDPR_URL} className="text-primary">
          Regolamento UE 2016/679
        </ExternalAnchor>
        , il GDPR).
      </p>
    </LegalSection>
  );
}

export function RetentionSection() {
  return (
    <LegalSection title="6. Conservazione e trasferimenti fuori dall'UE">
      <p>
        Non teniamo un archivio di dati personali dei visitatori. I log tecnici sono
        gestiti dal fornitore di hosting e conservati per il tempo previsto dalla sua
        politica.
      </p>
      <p>
        Alcuni dei servizi indicati sopra hanno sede negli Stati Uniti. In quel caso il
        trasferimento dei dati è regolato dalle garanzie previste nelle loro
        informative.
      </p>
    </LegalSection>
  );
}

export function RightsSection() {
  return (
    <LegalSection title="7. I tuoi diritti">
      <p>
        Hai il diritto di accedere ai tuoi dati, di chiederne la rettifica o la
        cancellazione, di limitarne il trattamento, di opporti e di riceverli in un
        formato portabile (artt. 15–22 del GDPR).
      </p>
      <p>
        Poiché non ti identifichiamo, in genere non siamo in grado di collegare i log
        tecnici a una persona: in quel caso non possiamo dare seguito alla richiesta
        (art. 11 del GDPR). Per esercitare i tuoi diritti scrivi a <ContactEmail />.
      </p>
      <p>
        Se ritieni che il trattamento violi la legge, puoi presentare reclamo al{" "}
        <ExternalAnchor href={GARANTE_URL} className="text-primary">
          Garante per la protezione dei dati personali
        </ExternalAnchor>
        .
      </p>
    </LegalSection>
  );
}

export function ChangesSection() {
  return (
    <LegalSection title="8. Modifiche a questa informativa">
      <p>
        Se cambia qualcosa, per esempio se il sito comincia a usare un nuovo servizio
        esterno, aggiorniamo questa pagina e la data qui sotto.
      </p>
      <LastUpdated iso={LAST_UPDATED_ISO} />
    </LegalSection>
  );
}
