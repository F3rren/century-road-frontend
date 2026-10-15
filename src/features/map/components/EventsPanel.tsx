import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { X, Globe, CalendarDays, CalendarClock, RotateCw } from 'lucide-react';
import { Trans, useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/Select';
import { Alert } from '@/components/ui/Alert';
import { EmptyState } from '@/components/ui/EmptyState';
import { cn } from '@/lib/utils';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { AttributionNotice, EntryList, HistoryEvents, type HistoryEntry } from '@/features/history';
import { SurpriseButton, SurpriseResult, useSurprise } from '@/features/discovery';
import { deriveContentLanguage } from '@/i18n/contentLanguage';
import { formatEventDate, monthNames } from '@/lib/months';
import type { useTodayHistory } from '../hooks/useTodayHistory';
import type { Country } from '../types';

const STATUS_CLASS = 'px-0.5 py-2 text-xs text-muted-foreground';
const LINK_CLASS =
  'inline-flex min-h-11 items-center text-sm font-bold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

interface EventsPanelProps {
  selectedCountry: Country | null;
  onClearCountry: () => void;
  onSelectCountry: (country: Country) => void;
  // Owned by MapPage and passed down rather than fetched again here: this
  // panel and the map's heatmap need the exact same day's data, and a
  // second independent fetch of it would just be wasted.
  history: ReturnType<typeof useTodayHistory>;
}

// The two doors into the same day: the day itself ("Accadde oggi", every
// event) and a country (its events today, then its whole year). The country
// picker stays in view in both, and a country leads back with "Tutti i paesi".
export function EventsPanel({ selectedCountry, onClearCountry, onSelectCountry, history }: EventsPanelProps) {
  const { t, i18n } = useTranslation();
  const {
    today,
    data,
    isLoading,
    error,
    retry,
    countryFeaturesLoading,
    countryFeaturesError,
    geocodedEvents,
    countryHeatmap,
    availableCountries,
    eventsForCountry,
  } = history;
  // The map/globe is pointer-only: below desktop this panel isn't docked, so
  // it needs its own open state instead of always taking up map width.
  const isDesktop = useIsDesktop();
  const selectedCode = selectedCountry?.code ?? null;
  // A link to a country opens on it: on mobile, with its events in view.
  const [mobileOpen, setMobileOpen] = useState(() => !isDesktop && selectedCode !== null);
  const countryPickerRef = useRef<HTMLSelectElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const drawerId = useId();
  const hintId = useId();

  // Docked on desktop, or inside the open drawer: wherever the picker can be seen.
  const shortcuts = useMemo(() => ({ '/': () => countryPickerRef.current?.focus() }), []);
  useKeyboardShortcuts(shortcuts, isDesktop || mobileOpen);

  // Picking a country is the main way into this panel on mobile, where it
  // isn't permanently docked — surface it automatically. Adjusted during
  // render (tracking the previous value) rather than in an effect. By code:
  // the same country comes back as a new object once the list has loaded.
  const [prevCode, setPrevCode] = useState(selectedCode);
  if (selectedCode !== prevCode) {
    setPrevCode(selectedCode);
    if (!isDesktop && selectedCode) setMobileOpen(true);
  }

  // The closed drawer is off screen, so it is also out of reach of the
  // keyboard and of screen readers; opened, it takes the focus.
  useEffect(() => {
    const drawer = drawerRef.current;
    if (!drawer) return;
    drawer.inert = !mobileOpen;
    if (mobileOpen) closeRef.current?.focus({ preventScroll: true });
  }, [mobileOpen, isDesktop]);

  const closeDrawer = () => {
    setMobileOpen(false);
    triggerRef.current?.focus();
  };

  // "Sorprendimi" honours the country in force here; with none chosen, any country.
  const surprise = useSurprise({ lang: deriveContentLanguage(i18n.language), country: selectedCode });

  const date = formatEventDate(today.day, today.month, undefined, i18n.language);
  const events = data?.sections.events;
  const countryEvents = selectedCountry ? eventsForCountry(selectedCountry.code) : [];
  // A country's events need both the day and the country shapes they are placed by
  // (a country can arrive from the URL before the shapes have loaded).
  const countryLoading = isLoading || countryFeaturesLoading;

  // The countries with an event today first, so a pick is rarely a dead end.
  const withEvents = availableCountries.filter((c) => countryHeatmap[c.code]);
  const otherCountries = availableCountries.filter((c) => !countryHeatmap[c.code]);
  const countryOptions = (countries: Country[]) =>
    countries.map((c) => (
      <option key={c.code} value={c.code}>
        {c.name}
      </option>
    ));

  // Where the map places each of today's events, for the link in its popup.
  const placeOf = useMemo(
    () => new Map(geocodedEvents.flatMap(({ entry, country }) => (country ? [[entry, country] as const] : []))),
    [geocodedEvents],
  );
  const countryFor = (entry: HistoryEntry) => placeOf.get(entry);

  // One short line for screen readers when the list changes, instead of
  // announcing the whole panel.
  const status = error || (selectedCountry ? countryLoading : isLoading)
    ? ''
    : selectedCountry
      ? t('map.events.liveCountry', { count: countryEvents.length, country: selectedCountry.name })
      : t('map.events.liveAll', { count: events?.items.length ?? 0, date });

  const loadError = (
    <div className="space-y-3 px-0.5 py-2">
      <Alert variant="inline">{t('map.events.loadError', { error })}</Alert>
      <Button size="sm" variant="outline" onClick={retry}>
        <RotateCw className="h-3.5 w-3.5" />
        {t('common.retry')}
      </Button>
    </div>
  );

  const centuryLink = selectedCountry && (
    <Link to={`/century?country=${selectedCountry.code}`} className={LINK_CLASS}>
      {t('map.events.seeCentury')}
    </Link>
  );

  const countryView = selectedCountry && (
    countryLoading ? (
      <p className={STATUS_CLASS}>{t('common.loading')}</p>
    ) : error ? (
      loadError
    ) : countryEvents.length === 0 ? (
      <EmptyState
        icon={Globe}
        descriptionClassName="max-w-none text-sm"
        description={
          <Trans
            i18nKey="map.events.noEventsFor"
            values={{ country: selectedCountry.name }}
            components={{ bold: <span className="font-medium" /> }}
          />
        }
        // Nothing today, but the country index has its whole year.
        action={centuryLink}
      />
    ) : (
      <div>
        <h3 className="mb-1 text-eyebrow text-muted-foreground">
          {t('map.events.anniversariesTitle', { day: today.day, month: monthNames(i18n.language)[today.month] })}
        </h3>
        {events && data && (
          <>
            <EntryList
              section={{ language: events.language, fallback: events.fallback, stale: events.stale, items: countryEvents }}
              month={today.month}
              day={today.day}
              attribution={data.attribution}
              compact
              countryFor={() => selectedCountry}
            />
            <div className="mt-2">{centuryLink}</div>
            <div className="pt-3">
              <AttributionNotice attribution={data.attribution} />
            </div>
          </>
        )}
      </div>
    )
  );

  const panel = (
    <>
      {/* Header — a masthead strip, not a floating title bar */}
      <div className="flex min-h-[4.25rem] items-center gap-2 border-b border-border px-4 py-2">
        {selectedCountry ? (
          <Globe className="h-4 w-4 shrink-0 text-primary" />
        ) : (
          <CalendarDays className="h-4 w-4 shrink-0 text-primary" />
        )}
        <div className="min-w-0 flex-1">
          <h2 className="break-words font-display text-base font-semibold tracking-tight">
            {selectedCountry ? selectedCountry.name : t('map.events.todayTitle')}
          </h2>
          {!selectedCountry && <p className="text-xs text-muted-foreground">{date}</p>}
        </div>
        {selectedCountry && (
          <Button variant="ghost" className={cn('px-2 text-primary', isDesktop && '-mr-2')} onClick={onClearCountry}>
            {t('map.events.allCountries')}
          </Button>
        )}
        {!isDesktop && (
          <Button
            ref={closeRef}
            variant="ghost"
            size="icon"
            className="-mr-2"
            onClick={closeDrawer}
            aria-label={t('map.events.closePanel')}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* The country door, in view in both views */}
      <div className="border-b border-border px-4 py-3">
        <label htmlFor="country-picker" className="mb-1.5 block text-eyebrow text-muted-foreground">
          {t('map.events.countryPickerLabel')}
        </label>
        <Select
          id="country-picker"
          ref={countryPickerRef}
          aria-keyshortcuts="/"
          aria-describedby={hintId}
          disabled={countryFeaturesLoading || availableCountries.length === 0}
          value={selectedCountry?.code ?? ''}
          onChange={(e) => {
            const country = availableCountries.find((c) => c.code === e.target.value);
            if (country) onSelectCountry(country);
          }}
        >
          <option value="" disabled>
            {countryFeaturesLoading
              ? t('map.events.loadingCountries')
              : t('map.events.selectCountryPlaceholder')}
          </option>
          {withEvents.length > 0 ? (
            <>
              <optgroup label={t('map.events.withEventsToday', { count: withEvents.length })}>
                {countryOptions(withEvents)}
              </optgroup>
              <optgroup label={t('map.events.otherCountries')}>{countryOptions(otherCountries)}</optgroup>
            </>
          ) : (
            countryOptions(availableCountries)
          )}
        </Select>
        {countryFeaturesError && (
          <Alert variant="inline" className="mt-1">
            {t('map.events.countriesLoadError', { error: countryFeaturesError })}
          </Alert>
        )}
        <p id={hintId} className="mt-1.5 text-xs text-muted-foreground">
          {t('map.events.clickHint')}
        </p>
        <SurpriseButton outcome={surprise.outcome} onDraw={surprise.draw} className="mt-2" />
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hidden p-4">
        <SurpriseResult outcome={surprise.outcome} compact className="mb-4" />
        {countryView || (
          <HistoryEvents data={data} isLoading={isLoading} error={error} onRetry={retry} countryFor={countryFor} />
        )}
      </div>
    </>
  );

  const liveStatus = (
    <p className="sr-only" aria-live="polite">
      {status}
    </p>
  );

  if (isDesktop) {
    return (
      <aside aria-label={t('map.events.panelAriaLabel')} className="flex h-full w-80 shrink-0 flex-col border-r border-border bg-background">
        {liveStatus}
        {panel}
      </aside>
    );
  }

  return (
    <>
      {liveStatus}
      {/* Above the map's attribution, not over it. */}
      <Button
        ref={triggerRef}
        size="sm"
        className="absolute bottom-12 left-4 z-10"
        onClick={() => setMobileOpen(true)}
        aria-expanded={mobileOpen}
        aria-controls={drawerId}
      >
        <CalendarClock className="h-4 w-4" />
        {t('map.events.todayButton', { date })}
      </Button>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50"
          onClick={closeDrawer}
          aria-hidden="true"
        />
      )}
      <aside
        id={drawerId}
        ref={drawerRef}
        aria-label={t('map.events.panelAriaLabel')}
        onKeyDown={(e) => {
          if (e.key === 'Escape') closeDrawer();
        }}
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-[85vw] max-w-sm flex-col border-r border-border bg-background transition-transform duration-300 motion-reduce:duration-75',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {panel}
      </aside>
    </>
  );
}
