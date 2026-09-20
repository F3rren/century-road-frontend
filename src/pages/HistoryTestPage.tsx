import { PageHeader } from "@/components/ui/PageHeader";
import { useOnThisDay } from "@/features/history";
import type {
  HistorySectionKey,
  OnThisDayParams,
  SectionResult,
} from "@/features/history";
import { usePageTitle } from "@/hooks/usePageTitle";

// Verification page for the history-service integration: it shows what the
// browser really received, not a styled version of it. Reachable by URL only.
const TEST_YEAR = 1978;
const TEST_TYPES: readonly HistorySectionKey[] = ["events", "births"];

function todayParams(): OnThisDayParams {
  const today = new Date();
  return {
    month: today.getMonth() + 1,
    day: today.getDate(),
    lang: "it",
    types: TEST_TYPES,
    year: TEST_YEAR,
  };
}

const PARAMS = todayParams();

function SectionBlock({ name, section }: { name: string; section: SectionResult }) {
  return (
    <section className="border border-border p-5">
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <h2 className="font-display text-eyebrow uppercase text-muted-foreground">
          {name}
        </h2>
        <p className="text-xs text-muted-foreground">
          {section.items.length} voci · lingua {section.language}
          {section.fallback && " (fallback)"}
          {section.stale && " · copia non aggiornata"}
        </p>
      </div>
      {section.items.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">Nessuna voce.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {section.items.map((item, index) => (
            <li key={`${item.year}-${index}`} className="text-sm">
              <span className="tabular-nums text-primary">{item.year ?? "—"}</span>{" "}
              <span className="whitespace-pre-line">{item.text}</span>{" "}
              {item.pages.map((page) => (
                <a
                  key={page.url}
                  href={page.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mr-2 text-xs text-muted-foreground underline"
                >
                  {page.title}
                </a>
              ))}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function HistoryTestPage() {
  const { path, isLoading, data, error } = useOnThisDay(PARAMS);
  usePageTitle("Test API storia");

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <PageHeader
          title="Test API storia"
          description="Verifica che il frontend riceva i dati dal backend"
        />

        <p className="break-all font-mono text-xs text-muted-foreground">
          GET /api{path}
        </p>

        {isLoading && <p className="text-sm">Caricamento…</p>}

        {error && (
          <p role="alert" className="border border-destructive p-4 text-sm text-destructive">
            Richiesta fallita: {error}
          </p>
        )}

        {data && (
          <>
            <p className="text-sm">
              Ricevuto per il {data.date.day}/{data.date.month} · lingua richiesta{" "}
              {data.language} · avvisi: {data.warnings.length === 0 ? "nessuno" : data.warnings.join(", ")}
            </p>
            <div className="space-y-4">
              {Object.entries(data.sections).map(([name, section]) => (
                <SectionBlock key={name} name={name} section={section} />
              ))}
            </div>
            <p className="text-xs text-muted-foreground">{data.attribution.notice}</p>
          </>
        )}
      </div>
    </div>
  );
}
