import { useEffect, useMemo, useState } from 'react';
import { useOnThisDay, type HistorySectionKey } from '@/features/history';
import { todayMonthDay } from '@/lib/months';
import { countByCountry, geocodeEntries, type GeocodedEntry } from '../lib/geocodeEntries';
import { fetchCountryFeatures, listCountries, type CountryFeature } from '../lib/countryGeometry';
import type { Country } from '../types';

// selected: the editors' short pick for the day; events: the full list. Both
// feed the "Accadde oggi" panel's display; only `events` feeds the heatmap
// and per-country lists below, to avoid double-counting a happening that
// appears in both sections (see geocodeEntries).
const TYPES: readonly HistorySectionKey[] = ['selected', 'events'];

// Everything the map page needs about "today": the raw on-this-day response
// (for the global "Accadde oggi" list) plus, once the country shapes have
// loaded, each event's guessed country and the resulting per-country counts
// and event lists. One shared fetch of both the day's events and the country
// shapes, reused by the heatmap, the "vai a un paese" picker and per-country
// filtering — see geocodeEntries.ts for what "guessed" means here.
export function useTodayHistory() {
  const today = useMemo(() => todayMonthDay(), []);
  const { data, isLoading, error } = useOnThisDay({
    month: today.month,
    day: today.day,
    lang: 'it',
    types: TYPES,
  });

  const [countryFeatures, setCountryFeatures] = useState<CountryFeature[] | null>(null);
  const [countryFeaturesError, setCountryFeaturesError] = useState<string | null>(null);

  useEffect(() => {
    let isStale = false;
    fetchCountryFeatures()
      .then((features) => {
        if (!isStale) setCountryFeatures(features);
      })
      .catch((fetchError: unknown) => {
        if (isStale) return;
        setCountryFeaturesError(
          fetchError instanceof Error ? fetchError.message : 'Errore sconosciuto',
        );
      });
    return () => {
      isStale = true;
    };
  }, []);

  const geocodedEvents = useMemo<GeocodedEntry[]>(() => {
    const events = data?.sections.events;
    if (!events || !countryFeatures) return [];
    return geocodeEntries(events.items, countryFeatures);
  }, [data, countryFeatures]);

  const countryHeatmap = useMemo(() => countByCountry(geocodedEvents), [geocodedEvents]);

  // Every real country the map can be clicked on, not just the ones with an
  // event attributed today — picking one with none shows the panel's own
  // "no event found" state instead of only offering a curated subset.
  const availableCountries = useMemo<Country[]>(
    () => (countryFeatures ? listCountries(countryFeatures) : []),
    [countryFeatures],
  );

  function eventsForCountry(countryCode: string) {
    return geocodedEvents
      .filter(({ country }) => country?.code === countryCode)
      .map(({ entry }) => entry);
  }

  return {
    today,
    data,
    isLoading,
    error,
    countryFeaturesError,
    geocodedEvents,
    countryHeatmap,
    availableCountries,
    eventsForCountry,
  };
}
