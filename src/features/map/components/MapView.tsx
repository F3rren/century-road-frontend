import { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { AlertTriangle, RotateCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/EmptyState';
import { heatColor } from '../constants/heat';
import { COUNTRIES_GEOJSON_URL } from '../constants/countries';
import { countryAnchor, facingCenter, fetchCountryFeatures, localizedCountryName } from '../lib/countryGeometry';
import { createProjectionAnimator, prefersReducedMotion, type ProjectionAnimator } from '../lib/projectionAnimator';
import type { Country, ProjectionType } from '../types';

const STYLE_URL = 'https://tiles.openfreemap.org/styles/positron';

// The basemap is printed like a cyanotype's paper (DESIGN.md, The Paper Map
// Rule): land and sea are both the paper, countries are thin lines, and only
// today's countries are printed, in the exposure scale. MapLibre paint can't
// read CSS custom properties, so these are the fixed token hexes.
const PAPER = '#F4F6F3';
const COUNTRY_LINE = '#7A8C9E'; // 3.2:1 on the paper: the geography stays readable
const PRUSSIAN = '#0E2A47';
const SHADE = '#394A5B';
const FIXER = '#E2B44A';
// Place labels only once the map is zoomed in: at world scale the countries
// speak through the heat, and the panel names them.
const LABELS_FROM_ZOOM = 4;
const CAMERA_MS = 900;

// ── Basemap ──────────────────────────────────────────────────────────────────

// Restyles OpenFreeMap's Positron once it has loaded. Returns the first label
// layer, so the app's own layers can go underneath every label.
function printOnPaper(map: maplibregl.Map, language: string): string | undefined {
  let firstLabel: string | undefined;
  for (const layer of map.getStyle().layers ?? []) {
    if (layer.type === 'background') {
      map.setPaintProperty(layer.id, 'background-color', PAPER);
    } else if (layer.type === 'fill' && /^(water|landcover_ice|landcover_glacier)/.test(layer.id)) {
      map.setPaintProperty(layer.id, 'fill-color', PAPER);
    } else if (layer.type === 'line' && (layer.id === 'boundary_2' || layer.id === 'boundary_disputed')) {
      // The app draws its own borders, from the same shapes the heat is counted on.
      map.setLayoutProperty(layer.id, 'visibility', 'none');
    } else if (layer.type === 'symbol') {
      firstLabel ??= layer.id;
      map.setLayerZoomRange(layer.id, Math.max(layer.minzoom ?? 0, LABELS_FROM_ZOOM), layer.maxzoom ?? 24);
      map.setPaintProperty(layer.id, 'text-color', SHADE);
      map.setPaintProperty(layer.id, 'text-halo-color', PAPER);
      // No italic anywhere in the system (DESIGN.md, The Real Weights Rule).
      const font: unknown = map.getLayoutProperty(layer.id, 'text-font');
      if (Array.isArray(font) && font.every((f) => typeof f === 'string')) {
        map.setLayoutProperty(layer.id, 'text-font', font.map((f: string) => f.replace('Italic', 'Regular')));
      }
    }
  }
  localizeLabels(map, language);
  return firstLabel;
}

// Place names in the interface's language where the tiles have one, instead of
// Positron's Latin-plus-native pair ("Russia" over "Россия").
function localizeLabels(map: maplibregl.Map, language: string) {
  for (const layer of map.getStyle().layers ?? []) {
    if (layer.type !== 'symbol') continue;
    // Road shields print a reference number, not a name: leave them alone.
    if (!JSON.stringify(map.getLayoutProperty(layer.id, 'text-field') ?? '').includes('name')) continue;
    map.setLayoutProperty(layer.id, 'text-field', ['coalesce', ['get', `name:${language}`], ['get', 'name:latin'], ['get', 'name']]);
  }
}

// MapLibre's own controls speak English: relabel them in the interface's language.
function labelControls(container: HTMLElement, t: TFunction) {
  const label = (selector: string, text: string) =>
    container.querySelectorAll<HTMLElement>(selector).forEach((el) => {
      el.setAttribute('aria-label', text);
      el.setAttribute('title', text);
    });
  label('.maplibregl-ctrl-zoom-in', t('map.controls.zoomIn'));
  label('.maplibregl-ctrl-zoom-out', t('map.controls.zoomOut'));
  label('.maplibregl-ctrl-compass', t('map.controls.resetBearing'));
  label('.maplibregl-ctrl-attrib-button', t('map.controls.attribution'));
  container.querySelector('canvas')?.setAttribute('aria-label', t('map.panelAriaLabel'));
}

// ── Heat ─────────────────────────────────────────────────────────────────────

function buildHeatExpression(heatmap: Record<string, number>): maplibregl.ExpressionSpecification {
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

// The countries with an event today, for their Prussian outline.
function heatFilter(heatmap: Record<string, number>): maplibregl.FilterSpecification {
  return ['in', ['get', 'iso_a2'], ['literal', Object.keys(heatmap)]];
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
  const { t, i18n } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const projectionAnimatorRef = useRef<ProjectionAnimator | null>(null);
  // Ref avoids stale-closure issue in the once('load') callback
  const heatmapRef = useRef<Record<string, number>>(countryHeatmap ?? {});
  // Same stale-closure issue, same fix: the click handler below is bound once
  // inside once('load') and would otherwise keep naming countries in
  // whatever language was active when the map first loaded.
  const languageRef = useRef(i18n.language);
  // Same stale-closure issue, same fix again: the click handler below is
  // bound once and would otherwise keep calling whichever onCountryClick was
  // passed in on that first render, forever.
  const onCountryClickRef = useRef(onCountryClick);
  const [loadError, setLoadError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  // Effects that touch the style wait for it: a country can arrive from the
  // URL before the basemap has loaded.
  const [loaded, setLoaded] = useState(false);
  // Where to point the camera for each country, once the shapes have loaded.
  const anchorsRef = useRef(new Map<string, [number, number]>());
  const [anchorsReady, setAnchorsReady] = useState(false);
  // The globe turns to today's events once, and never after the reader has
  // moved it or picked a country.
  const framedRef = useRef(false);
  const userMovedRef = useRef(false);

  // Re-created whenever retryKey changes, so "Riprova" after a tile/style
  // load failure gets a genuinely fresh map instance.
  useEffect(() => {
    if (!containerRef.current) return;
    setLoadError(false);
    setLoaded(false);

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

    map.on('movestart', (e) => {
      if ((e as { originalEvent?: Event }).originalEvent) userMovedRef.current = true;
    });

    map.once('load', () => {
      const firstLabel = printOnPaper(map, languageRef.current);

      map.addSource('countries-ne', {
        type: 'geojson',
        data: COUNTRIES_GEOJSON_URL,
      });

      // 1. Every country as a thin line on the paper.
      map.addLayer(
        {
          id: 'countries-lines',
          type: 'line',
          source: 'countries-ne',
          paint: {
            'line-color': COUNTRY_LINE,
            'line-width': ['interpolate', ['linear'], ['zoom'], 1, 0.5, 5, 1],
          },
        },
        firstLabel,
      );

      // 2. Today's countries printed in the exposure scale, opaque.
      map.addLayer(
        {
          id: 'countries-heat',
          type: 'fill',
          source: 'countries-ne',
          paint: { 'fill-color': buildHeatExpression(heatmapRef.current), 'fill-opacity': 1 },
        },
        firstLabel,
      );

      // 3. A Prussian outline on each of them, so even the lightest step reads.
      map.addLayer(
        {
          id: 'countries-heat-outline',
          type: 'line',
          source: 'countries-ne',
          filter: heatFilter(heatmapRef.current),
          paint: { 'line-color': PRUSSIAN, 'line-width': 1 },
        },
        firstLabel,
      );

      // 4. Transparent fill for click detection.
      map.addLayer(
        {
          id: 'countries-fill',
          type: 'fill',
          source: 'countries-ne',
          paint: { 'fill-color': 'transparent', 'fill-opacity': 0 },
        },
        firstLabel,
      );

      // 5. The selected country in fixer yellow, which stays distinct over every
      //    step of the blue scale underneath it, with a Prussian rule around it.
      map.addLayer(
        {
          id: 'countries-highlight',
          type: 'fill',
          source: 'countries-ne',
          filter: ['==', 'iso_a2', ''],
          paint: { 'fill-color': FIXER, 'fill-opacity': 0.85 },
        },
        firstLabel,
      );
      map.addLayer(
        {
          id: 'countries-outline',
          type: 'line',
          source: 'countries-ne',
          filter: ['==', 'iso_a2', ''],
          paint: { 'line-color': PRUSSIAN, 'line-width': 2 },
        },
        firstLabel,
      );

      map.on('click', 'countries-fill', (e) => {
        const feature = e.features?.[0];
        if (!feature) return;
        const props = feature.properties as Record<string, string>;
        const code = props['iso_a2'] ?? '';
        const englishName = props['name'] ?? props['admin'] ?? '';
        if (code && englishName) {
          onCountryClickRef.current?.({ name: localizedCountryName(code, englishName, languageRef.current), code });
        }
      });

      map.on('mouseenter', 'countries-fill', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'countries-fill', () => {
        map.getCanvas().style.cursor = '';
      });

      setLoaded(true);
    });

    mapRef.current = map;
    projectionAnimatorRef.current = createProjectionAnimator(map);
    return () => {
      projectionAnimatorRef.current?.cancel();
      projectionAnimatorRef.current = null;
      map.remove();
      mapRef.current = null;
    };
  }, [retryKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // The country shapes are shared with the panel's picker (one cached fetch).
  useEffect(() => {
    let active = true;
    fetchCountryFeatures()
      .then((features) => {
        if (!active) return;
        anchorsRef.current = new Map(features.map((f) => [f.properties.iso_a2, countryAnchor(f)]));
        setAnchorsReady(true);
      })
      // The panel reports a failure to load the shapes; the camera just stays put.
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  // Sync projection. The first application (page load, or a retried map) is
  // instant; after that the switch between flat map and globe is animated.
  // retryKey is a dependency because a retried map is a new instance that
  // has to be given the projection again.
  useEffect(() => {
    const map = mapRef.current;
    const animator = projectionAnimatorRef.current;
    if (!map || !animator) return;
    const apply = () => animator.goTo(projection);
    if (map.isStyleLoaded()) apply();
    else map.once('styledata', apply);
    return () => {
      map.off('styledata', apply);
      animator.cancel();
    };
  }, [projection, retryKey]);

  // Sync the selected country: highlight it, and turn the map to it, so picking
  // a country on the far side of the globe shows where it is.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !loaded) return;
    const code = selectedCountryCode ?? '';
    const filter: maplibregl.FilterSpecification = ['==', 'iso_a2', code];
    if (map.getLayer('countries-highlight')) map.setFilter('countries-highlight', filter);
    if (map.getLayer('countries-outline')) map.setFilter('countries-outline', filter);
    const anchor = code ? anchorsRef.current.get(code) : undefined;
    if (anchor) {
      framedRef.current = true;
      map.easeTo({ center: anchor, duration: prefersReducedMotion() ? 0 : CAMERA_MS });
    }
  }, [selectedCountryCode, loaded, anchorsReady]);

  // Once today's events have arrived, face them: the globe opens on the side of
  // the world where today's history happened.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !loaded || !anchorsReady || framedRef.current || userMovedRef.current || selectedCountryCode) return;
    const points = Object.entries(countryHeatmap ?? {}).flatMap(([code, count]) => {
      const anchor = anchorsRef.current.get(code);
      return anchor ? [{ lng: anchor[0], lat: anchor[1], weight: count }] : [];
    });
    const center = facingCenter(points);
    if (!center) return;
    framedRef.current = true;
    map.easeTo({ center, duration: prefersReducedMotion() ? 0 : CAMERA_MS });
  }, [countryHeatmap, loaded, anchorsReady, selectedCountryCode]);

  // Keep languageRef current for the click handler above, and the place names
  // and control labels in the interface's language.
  useEffect(() => {
    languageRef.current = i18n.language;
    const map = mapRef.current;
    if (map && loaded) localizeLabels(map, i18n.language);
  }, [i18n.language, loaded]);

  useEffect(() => {
    if (containerRef.current) labelControls(containerRef.current, t);
  }, [t, i18n.language, retryKey]);

  // Keep onCountryClickRef current for the click handler above.
  useEffect(() => {
    onCountryClickRef.current = onCountryClick;
  }, [onCountryClick]);

  // Sync the heat: colours and outlines.
  useEffect(() => {
    heatmapRef.current = countryHeatmap ?? {};
    const map = mapRef.current;
    if (!map || !map.getLayer('countries-heat')) return;
    map.setPaintProperty('countries-heat', 'fill-color', buildHeatExpression(heatmapRef.current));
    map.setFilter('countries-heat-outline', heatFilter(heatmapRef.current));
  }, [countryHeatmap, loaded]);

  return (
    <div className="relative h-full w-full">
      {/* Haze around the globe, so the paper sphere keeps its edge on the paper page. */}
      <div ref={containerRef} className="h-full w-full bg-muted" />
      {loadError && (
        <EmptyState
          variant="overlay"
          tone="destructive"
          icon={AlertTriangle}
          title={t('map.error.title')}
          description={t('map.error.description')}
          action={
            <Button size="sm" onClick={() => setRetryKey((k) => k + 1)}>
              <RotateCw className="h-3.5 w-3.5" />
              {t('common.retry')}
            </Button>
          }
        />
      )}
    </div>
  );
}
