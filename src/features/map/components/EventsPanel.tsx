import { useRef, useState } from 'react';
import { X, Globe, CalendarDays, CalendarClock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useEvents } from '../hooks/useEvents';
import { EventCard } from './EventCard';
import type { Country, HistoricalEvent } from '../types';

const MONTH_NAMES = [
  '', 'gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno',
  'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre',
];

interface SectionProps {
  title: string;
  events: HistoricalEvent[];
  emptyMessage?: string;
}

function Section({ title, events, emptyMessage }: SectionProps) {
  return (
    <div>
      <h2 className="mb-1 font-display text-eyebrow uppercase text-muted-foreground">
        {title}
      </h2>
      {events.length === 0 ? (
        <p className="px-0.5 py-2 text-xs italic text-muted-foreground">
          {emptyMessage ?? 'Nessun evento'}
        </p>
      ) : (
        <div>
          {events.map((e) => (
            <EventCard key={e.id} event={e} />
          ))}
        </div>
      )}
    </div>
  );
}

interface EventsPanelProps {
  selectedCountry: Country | null;
  onClearCountry: () => void;
  onSelectCountry: (country: Country) => void;
}

export function EventsPanel({ selectedCountry, onClearCountry, onSelectCountry }: EventsPanelProps) {
  const { globalEvents, countryFiltered, today, availableCountries } = useEvents(
    selectedCountry?.code,
  );
  // The map/globe is pointer-only: below desktop this panel isn't docked, so
  // it needs its own open state instead of always taking up map width.
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const [mobileOpen, setMobileOpen] = useState(false);
  const countryPickerRef = useRef<HTMLSelectElement>(null);

  // Only active when the picker is actually reachable: docked on desktop,
  // or the mobile drawer is open. It also only exists in the DOM once a
  // country is selected — that branch renders Section, not the picker.
  useKeyboardShortcuts(
    { '/': () => countryPickerRef.current?.focus() },
    !selectedCountry && (isDesktop || mobileOpen),
  );

  // Picking a country is the main way into this panel on mobile, where it
  // isn't permanently docked — surface it automatically. Adjusted during
  // render (tracking the previous value) rather than in an effect.
  const [prevSelectedCountry, setPrevSelectedCountry] = useState(selectedCountry);
  if (selectedCountry !== prevSelectedCountry) {
    setPrevSelectedCountry(selectedCountry);
    if (!isDesktop && selectedCountry) setMobileOpen(true);
  }

  const panel = (
    <>
      {/* Header — a masthead strip, not a floating title bar */}
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        {selectedCountry ? (
          <>
            <Globe className="h-4 w-4 shrink-0 text-primary" />
            <span className="flex-1 truncate font-display text-base font-semibold tracking-tight">
              {selectedCountry.name}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClearCountry}
              aria-label="Torna alla vista globale"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </Button>
          </>
        ) : (
          <>
            <CalendarDays className="h-4 w-4 shrink-0 text-primary" />
            <div className="flex-1 min-w-0">
              <p className="font-display text-base font-semibold tracking-tight">Accadde oggi nel '900</p>
              <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                {today.day} {MONTH_NAMES[today.month]}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Content — aria-live announces the swap when a country is picked via
          map click, keyboard picker, or cleared back to the global view. */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6" aria-live="polite">
        {selectedCountry ? (
          countryFiltered?.all.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
              <Globe className="h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                Nessun evento registrato per{' '}
                <span className="font-medium">{selectedCountry.name}</span>
              </p>
              <button
                onClick={onClearCountry}
                className="mt-2 text-xs text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Torna alla vista globale
              </button>
            </div>
          ) : (
            <>
              <Section
                title={`Già accaduti (entro il ${today.day} ${MONTH_NAMES[today.month]})`}
                events={countryFiltered?.past ?? []}
                emptyMessage="Nessun evento prima di oggi in questo paese"
              />
              <Section
                title="In arrivo"
                events={countryFiltered?.upcoming ?? []}
                emptyMessage="Nessun evento dopo oggi in questo paese"
              />
            </>
          )
        ) : (
          <>
            <div>
              <label
                htmlFor="country-picker"
                className="mb-1.5 block font-display text-eyebrow uppercase text-muted-foreground"
              >
                Vai a un paese
              </label>
              <select
                id="country-picker"
                ref={countryPickerRef}
                aria-keyshortcuts="/"
                className="w-full border border-input bg-background px-2 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value=""
                onChange={(e) => {
                  const country = availableCountries.find((c) => c.code === e.target.value);
                  if (country) onSelectCountry(country);
                }}
              >
                <option value="" disabled>
                  Seleziona un paese…
                </option>
                {availableCountries.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            {globalEvents.length > 0 && (
              <Section
                title={
                  globalEvents.some((e) => e.month === today.month && e.day === today.day)
                    ? `Anniversari del ${today.day} ${MONTH_NAMES[today.month]}`
                    : 'I più importanti del Novecento'
                }
                events={globalEvents}
              />
            )}
            <p className="pt-2 pb-1 text-center text-xs text-muted-foreground">
              Clicca un paese sulla mappa (o usa il menu sopra) per vedere i suoi eventi
            </p>
          </>
        )}
      </div>
    </>
  );

  if (isDesktop) {
    return (
      <aside aria-label="Eventi storici" className="flex h-full w-80 shrink-0 flex-col border-r border-border bg-background">
        {panel}
      </aside>
    );
  }

  return (
    <>
      <Button
        size="sm"
        className="absolute bottom-4 left-4 z-10"
        onClick={() => setMobileOpen(true)}
      >
        <CalendarClock className="h-4 w-4" />
        Eventi
      </Button>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}
      <aside
        aria-label="Eventi storici"
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-[85vw] max-w-sm flex-col border-r border-border bg-background transition-transform duration-300 motion-reduce:duration-75',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
        aria-hidden={!mobileOpen}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-2">
          <span className="font-display text-eyebrow uppercase text-muted-foreground">
            Eventi
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(false)}
            aria-label="Chiudi pannello eventi"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        {panel}
      </aside>
    </>
  );
}
