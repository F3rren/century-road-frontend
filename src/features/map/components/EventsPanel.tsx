import { useRef, useState } from 'react';
import { X, Globe, CalendarDays, CalendarClock } from 'lucide-react';
import { Trans, useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { EntryList, HistoryEvents } from '@/features/history';
import { monthNames } from '@/lib/months';
import type { useTodayHistory } from '../hooks/useTodayHistory';
import type { Country } from '../types';

const STATUS_CLASS = 'px-0.5 py-2 text-xs italic text-muted-foreground';

interface EventsPanelProps {
  selectedCountry: Country | null;
  onClearCountry: () => void;
  onSelectCountry: (country: Country) => void;
  // Owned by MapPage and passed down rather than fetched again here: this
  // panel and the map's heatmap need the exact same day's data, and a
  // second independent fetch of it would just be wasted.
  history: ReturnType<typeof useTodayHistory>;
}

export function EventsPanel({ selectedCountry, onClearCountry, onSelectCountry, history }: EventsPanelProps) {
  const { t, i18n } = useTranslation();
  const months = monthNames(i18n.language);
  const { today, data, isLoading, error, countryFeaturesError, availableCountries, eventsForCountry } = history;
  // The map/globe is pointer-only: below desktop this panel isn't docked, so
  // it needs its own open state instead of always taking up map width.
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const [mobileOpen, setMobileOpen] = useState(false);
  const countryPickerRef = useRef<HTMLSelectElement>(null);

  // Only active when the picker is actually reachable: docked on desktop,
  // or the mobile drawer is open. It also only exists in the DOM once a
  // country is selected — that branch renders the per-country list, not the
  // picker.
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

  const events = data?.sections.events;
  const countryEvents = selectedCountry ? eventsForCountry(selectedCountry.code) : [];

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
              aria-label={t('map.events.backToGlobal')}
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </Button>
          </>
        ) : (
          <>
            <CalendarDays className="h-4 w-4 shrink-0 text-primary" />
            <div className="flex-1 min-w-0">
              <p className="font-display text-base font-semibold tracking-tight">{t('map.events.todayTitle')}</p>
              <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                {today.day} {months[today.month]}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Content — aria-live announces the swap when a country is picked via
          map click, keyboard picker, or cleared back to the global view. */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6" aria-live="polite">
        {selectedCountry ? (
          isLoading ? (
            <p className={STATUS_CLASS}>{t('common.loading')}</p>
          ) : error ? (
            <p className="px-0.5 py-2 text-xs text-destructive">
              {t('map.events.loadError', { error })}
            </p>
          ) : countryEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
              <Globe className="h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                <Trans
                  i18nKey="map.events.noEventsFor"
                  values={{ country: selectedCountry.name }}
                  components={{ bold: <span className="font-medium" /> }}
                />
              </p>
              <button
                onClick={onClearCountry}
                className="mt-2 text-xs text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {t('map.events.backToGlobal')}
              </button>
            </div>
          ) : (
            <div>
              <h2 className="mb-1 font-display text-eyebrow uppercase text-muted-foreground">
                {t('map.events.anniversariesTitle', { day: today.day, month: months[today.month] })}
              </h2>
              {events && data && (
                <EntryList
                  section={{ language: events.language, fallback: events.fallback, stale: events.stale, items: countryEvents }}
                  month={today.month}
                  day={today.day}
                  attribution={data.attribution}
                />
              )}
            </div>
          )
        ) : (
          <>
            <div>
              <label
                htmlFor="country-picker"
                className="mb-1.5 block font-display text-eyebrow uppercase text-muted-foreground"
              >
                {t('map.events.countryPickerLabel')}
              </label>
              <select
                id="country-picker"
                ref={countryPickerRef}
                aria-keyshortcuts="/"
                disabled={availableCountries.length === 0}
                className="w-full border border-input bg-background px-2 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                value=""
                onChange={(e) => {
                  const country = availableCountries.find((c) => c.code === e.target.value);
                  if (country) onSelectCountry(country);
                }}
              >
                <option value="" disabled>
                  {availableCountries.length === 0
                    ? t('map.events.loadingCountries')
                    : t('map.events.selectCountryPlaceholder')}
                </option>
                {availableCountries.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
              {countryFeaturesError && (
                <p className="mt-1 text-xs text-destructive">
                  {t('map.events.countriesLoadError', { error: countryFeaturesError })}
                </p>
              )}
            </div>
            <HistoryEvents
              title={t('map.events.anniversariesTitle', { day: today.day, month: months[today.month] })}
              data={data}
              isLoading={isLoading}
              error={error}
            />
            <p className="pt-2 pb-1 text-center text-xs text-muted-foreground">
              {t('map.events.clickHint')}
            </p>
          </>
        )}
      </div>
    </>
  );

  if (isDesktop) {
    return (
      <aside aria-label={t('map.events.panelAriaLabel')} className="flex h-full w-80 shrink-0 flex-col border-r border-border bg-background">
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
        {t('map.events.eventsButton')}
      </Button>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}
      <aside
        aria-label={t('map.events.panelAriaLabel')}
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-[85vw] max-w-sm flex-col border-r border-border bg-background transition-transform duration-300 motion-reduce:duration-75',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
        aria-hidden={!mobileOpen}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-2">
          <span className="font-display text-eyebrow uppercase text-muted-foreground">
            {t('map.events.eventsButton')}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(false)}
            aria-label={t('map.events.closePanel')}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        {panel}
      </aside>
    </>
  );
}
