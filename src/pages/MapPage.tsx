import { useState } from 'react';
import { MapView, ProjectionToggle, EventsPanel } from '@/features/map';
import { HeatLegend } from '@/features/map/components/HeatLegend';
import { useEvents } from '@/features/map/hooks/useEvents';
import { usePageTitle } from '@/hooks/usePageTitle';
import type { Country, ProjectionType } from '@/features/map';

export function MapPage() {
  const [projection, setProjection] = useState<ProjectionType>('globe');
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  usePageTitle('Mappa');

  const { countryHeatmap } = useEvents(selectedCountry?.code);

  return (
    <div className="flex h-full w-full">
      <h1 className="sr-only">Mappa storica interattiva del Novecento</h1>
      <EventsPanel
        selectedCountry={selectedCountry}
        onClearCountry={() => setSelectedCountry(null)}
        onSelectCountry={setSelectedCountry}
      />
      <div className="relative flex-1">
        <MapView
          projection={projection}
          onCountryClick={setSelectedCountry}
          selectedCountryCode={selectedCountry?.code}
          countryHeatmap={countryHeatmap}
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
