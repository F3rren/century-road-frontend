import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, RotateCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/EmptyState';
import { MapView, ProjectionToggle, EventsPanel, localizedCountryName } from '@/features/map';
import { HeatLegend } from '@/features/map/components/HeatLegend';
import { useTodayHistory } from '@/features/map/hooks/useTodayHistory';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { getStoredProjection } from '@/hooks/useMapProjection';
import { trackCountryView } from '@/features/history';
import type { Country, ProjectionType } from '@/features/map';

const COUNTRY_CODE = /^[A-Z]{2}$/;

export function MapPage() {
  const { t, i18n } = useTranslation();
  const [projection, setProjection] = useState<ProjectionType>(getStoredProjection);
  const [searchParams, setSearchParams] = useSearchParams();
  const isDesktop = useIsDesktop();
  usePageMeta(t('nav.map'), t('meta.map.description'));

  const history = useTodayHistory();
  const { availableCountries } = history;

  // The chosen country lives in the URL, like the archive's filters: Back
  // returns to the whole day, and a shared link opens on the same country.
  // Until the country list has loaded, a well-formed code is taken on trust.
  const code = searchParams.get('country');
  const selectedCountry = useMemo<Country | null>(() => {
    if (!code || !COUNTRY_CODE.test(code)) return null;
    if (availableCountries.length === 0) return { code, name: localizedCountryName(code, code, i18n.language) };
    return availableCountries.find((c) => c.code === code) ?? null;
  }, [code, availableCountries, i18n.language]);

  // A new history entry for each choice, so Back steps through them; picking the
  // country already shown adds none.
  const selectCountry = useCallback(
    (country: Country | null) => {
      if ((country?.code ?? null) === code) return;
      setSearchParams(country ? { country: country.code } : {});
    },
    [code, setSearchParams],
  );
  const clearCountry = useCallback(() => selectCountry(null), [selectCountry]);

  // Anonymous, aggregate view tracking - one signal, "this country was selected", no visitor
  // identifier attached. A map click, the panel's picker and a link all go through the URL,
  // so this single effect covers them all.
  const selectedCode = selectedCountry?.code;
  useEffect(() => {
    if (selectedCode) trackCountryView(selectedCode);
  }, [selectedCode]);

  return (
    <div className="flex h-full w-full">
      <h1 className="sr-only">{t('map.panelAriaLabel')}</h1>
      <EventsPanel
        selectedCountry={selectedCountry}
        onClearCountry={clearCountry}
        onSelectCountry={selectCountry}
        history={history}
      />
      <div className="relative flex-1">
        <MapView
          projection={projection}
          onCountryClick={selectCountry}
          selectedCountryCode={selectedCountry?.code}
          countryHeatmap={history.countryHeatmap}
        />
        <div className="absolute top-4 right-4 z-10">
          <ProjectionToggle value={projection} onChange={setProjection} />
        </div>
        {/* Top-left, not bottom-right: MapLibre's own NavigationControl
            already anchors bottom-right, and bottom-left is used by the
            mobile "Accadde oggi" trigger + the map's attribution control. */}
        <div className="absolute top-4 left-4 z-10">
          <HeatLegend />
        </div>
        {/* On desktop the docked panel shows the failure next to the map; on
            mobile the panel is closed, and an empty print would read as a day
            with no history. */}
        {history.error && !isDesktop && (
          <EmptyState
            variant="overlay"
            tone="destructive"
            icon={AlertTriangle}
            title={t('map.events.loadError', { error: history.error })}
            action={
              <Button size="sm" onClick={history.retry}>
                <RotateCw className="h-3.5 w-3.5" />
                {t('common.retry')}
              </Button>
            }
            className="z-20"
          />
        )}
      </div>
    </div>
  );
}
