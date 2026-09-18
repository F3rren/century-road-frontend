import { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { AlertTriangle, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { heatColor } from '../constants/heat';
import type { Country, ProjectionType } from '../types';

const STYLE_URL = 'https://tiles.openfreemap.org/styles/positron';
const COUNTRIES_GEOJSON =
  'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_110m_admin_0_countries.geojson';

// ── Heat map helpers ─────────────────────────────────────────────────────────

function buildHeatExpression(
  heatmap: Record<string, number>,
): maplibregl.ExpressionSpecification {
  const entries = Object.entries(heatmap);
  if (!entries.length) {
    return 'rgba(0,0,0,0)' as unknown as maplibregl.ExpressionSpecification;
  }
  return [
    'match',
    ['get', 'iso_a2'],
    ...entries.flatMap(([code, count]) => [code, heatColor(count)]),
    'rgba(0,0,0,0)',
  ] as maplibregl.ExpressionSpecification;
}

// Heat intensity must not be conveyed by color alone (WCAG 1.4.1): stamp the
// raw event count on top of each colored country too.
function buildHeatLabelExpression(
  heatmap: Record<string, number>,
): maplibregl.ExpressionSpecification {
  const entries = Object.entries(heatmap);
  if (!entries.length) {
    return '' as unknown as maplibregl.ExpressionSpecification;
  }
  return [
    'match',
    ['get', 'iso_a2'],
    ...entries.flatMap(([code, count]) => [code, String(count)]),
    '',
  ] as maplibregl.ExpressionSpecification;
}

// ── Component ────────────────────────────────────────────────────────────────

interface MapViewProps {
  projection: ProjectionType;
  onCountryClick?: (country: Country) => void;
  selectedCountryCode?: string | null;
  countryHeatmap?: Record<string, number>;
}

export function MapView({
  projection,
  onCountryClick,
  selectedCountryCode,
  countryHeatmap,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  // Ref avoids stale-closure issue in the once('load') callback
  const heatmapRef = useRef<Record<string, number>>(countryHeatmap ?? {});
  const [loadError, setLoadError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  // Re-created whenever retryKey changes, so "Riprova" after a tile/style
  // load failure gets a genuinely fresh map instance.
  useEffect(() => {
    if (!containerRef.current) return;
    setLoadError(false);

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: STYLE_URL,
      center: [10, 20],
      zoom: 1.8,
      projection: { type: projection },
      attributionControl: false,
    });

    map.addControl(
      new maplibregl.NavigationControl({ visualizePitch: true }),
      'bottom-right',
    );
    map.addControl(
      new maplibregl.AttributionControl({ compact: true }),
      'bottom-left',
    );

    map.on('error', (e) => {
      console.error('MapLibre error:', e.error);
      // Only escalate to a blocking error state for a failure of the base
      // style itself. Once it has loaded, isolated tile/glyph hiccups
      // shouldn't cover an otherwise-working map with a full takeover.
      if (!map.isStyleLoaded()) setLoadError(true);
    });

    map.once('load', () => {
      map.addSource('countries-ne', {
        type: 'geojson',
        data: COUNTRIES_GEOJSON,
      });

      // 1. Heatmap fill (colori verde/giallo/rosso)
      map.addLayer({
        id: 'countries-heat',
        type: 'fill',
        source: 'countries-ne',
        paint: {
          'fill-color': buildHeatExpression(heatmapRef.current),
          'fill-opacity': 0.8,
        },
      });

      // 1b. Event count as text so intensity isn't color-only (WCAG 1.4.1)
      map.addLayer({
        id: 'countries-heat-label',
        type: 'symbol',
        source: 'countries-ne',
        layout: {
          'text-field': buildHeatLabelExpression(heatmapRef.current),
          'text-size': 11,
          'symbol-placement': 'point',
        },
        paint: {
          'text-color': '#ffffff',
          'text-halo-color': 'rgba(0,0,0,0.75)',
          'text-halo-width': 1.2,
        },
      });

      // 2. Transparent fill for click detection
      map.addLayer({
        id: 'countries-fill',
        type: 'fill',
        source: 'countries-ne',
        paint: { 'fill-color': 'transparent', 'fill-opacity': 0 },
      });

      // 3. Wire-red highlight for selected country — MapLibre paint
      // properties can't read CSS custom properties, and the basemap is
      // always light regardless of app theme, so this is the fixed
      // light-mode --primary hex rather than the token.
      map.addLayer({
        id: 'countries-highlight',
        type: 'fill',
        source: 'countries-ne',
        filter: ['==', 'iso_a2', ''],
        paint: { 'fill-color': '#C81E3A', 'fill-opacity': 0.3 },
      });

      // 4. Border for selected country
      map.addLayer({
        id: 'countries-outline',
        type: 'line',
        source: 'countries-ne',
        filter: ['==', 'iso_a2', ''],
        paint: { 'line-color': '#C81E3A', 'line-width': 1.5 },
      });

      map.on('click', 'countries-fill', (e) => {
        const feature = e.features?.[0];
        if (!feature) return;
        const props = feature.properties as Record<string, string>;
        const code = props['iso_a2'] ?? '';
        const name = props['name'] ?? props['admin'] ?? '';
        if (code && name) onCountryClick?.({ name, code });
      });

      map.on('mouseenter', 'countries-fill', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'countries-fill', () => {
        map.getCanvas().style.cursor = '';
      });
    });

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [retryKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync projection
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const apply = () => map.setProjection({ type: projection });
    if (map.isStyleLoaded()) apply();
    else map.once('styledata', apply);
  }, [projection]);

  // Sync country highlight (selected)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    const code = selectedCountryCode ?? '';
    const filter: maplibregl.FilterSpecification = ['==', 'iso_a2', code];
    if (map.getLayer('countries-highlight')) map.setFilter('countries-highlight', filter);
    if (map.getLayer('countries-outline')) map.setFilter('countries-outline', filter);
  }, [selectedCountryCode]);

  // Sync heatmap colors + count labels
  useEffect(() => {
    heatmapRef.current = countryHeatmap ?? {};
    const map = mapRef.current;
    if (!map || !map.getLayer('countries-heat')) return;
    map.setPaintProperty(
      'countries-heat',
      'fill-color',
      buildHeatExpression(heatmapRef.current),
    );
    if (map.getLayer('countries-heat-label')) {
      map.setLayoutProperty(
        'countries-heat-label',
        'text-field',
        buildHeatLabelExpression(heatmapRef.current),
      );
    }
  }, [countryHeatmap]);

  return (
    <div className="relative h-full w-full">
      <div
        ref={containerRef}
        className="h-full w-full bg-muted"
        aria-label="Mappa storica interattiva del Novecento"
      />
      {loadError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/95 p-6 text-center">
          <AlertTriangle className="h-8 w-8 text-destructive" />
          <p className="text-sm font-medium">Impossibile caricare la mappa</p>
          <p className="max-w-xs text-xs text-muted-foreground">
            Controlla la connessione di rete e riprova.
          </p>
          <Button size="sm" onClick={() => setRetryKey((k) => k + 1)}>
            <RotateCw className="h-3.5 w-3.5" />
            Riprova
          </Button>
        </div>
      )}
    </div>
  );
}
