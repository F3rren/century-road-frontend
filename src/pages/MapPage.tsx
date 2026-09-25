import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MapView, ProjectionToggle, EventsPanel } from '@/features/map';
import { HeatLegend } from '@/features/map/components/HeatLegend';
import { useTodayHistory } from '@/features/map/hooks/useTodayHistory';
import { usePageMeta } from '@/hooks/usePageMeta';
import { getStoredProjection } from '@/hooks/useMapProjection';
import { trackCountryView } from '@/features/history';
import type { Country, ProjectionType } from '@/features/map';

export function MapPage() {
  const { t } = useTranslation();
  const [projection, setProjection] = useState<ProjectionType>(getStoredProjection);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  usePageMeta(t('nav.map'), t('meta.map.description'));

  // Anonymous, aggregate view tracking - one signal, "this country was selected", no visitor
  // identifier attached. Both selection paths (a map click and the panel's own picker) set
  // the same selectedCountry state, so this single effect covers both.
  useEffect(() => {
    if (selectedCountry) trackCountryView(selectedCountry.code);
  }, [selectedCountry]);

  const history = useTodayHistory();

  return (
    <div className="flex h-full w-full">
      <h1 className="sr-only">{t('map.panelAriaLabel')}</h1>
      <EventsPanel
        selectedCountry={selectedCountry}
        onClearCountry={() => setSelectedCountry(null)}
        onSelectCountry={setSelectedCountry}
        history={history}
      />
      <div className="relative flex-1">
        <MapView
          projection={projection}
          onCountryClick={setSelectedCountry}
          selectedCountryCode={selectedCountry?.code}
          countryHeatmap={history.countryHeatmap}
        />
        <div className="absolute top-4 right-4 z-10">
          <ProjectionToggle value={projection} onChange={setProjection} />
        </div>
        {/* Top-left, not bottom-right: MapLibre's own NavigationControl
            already anchors bottom-right, and bottom-left is used by the
            mobile "Eventi" trigger + the map's attribution control. */}
        <div className="absolute top-4 left-4 z-10">
          <HeatLegend />
        </div>
      </div>
    </div>
  );
}
