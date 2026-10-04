import { useMemo } from "react";
// The light entry: the main map barrel would pull MapLibre into this page.
import { useTodayHistory } from "@/features/map/data";
import { groupByCentury, summarizeToday } from "../lib/computeStats";

// Backed by the same today's-history fetch (and the same coordinate-based
// country guess) the map page uses, so loading and error are real states.
export function useDashboard() {
  const { today, data, geocodedEvents, isLoading, error } = useTodayHistory();
  const summary = useMemo(() => summarizeToday(geocodedEvents), [geocodedEvents]);
  const centuries = useMemo(() => groupByCentury(geocodedEvents), [geocodedEvents]);
  // The edition the events really came from, for the archive links.
  const language = data?.sections.events?.language;
  return { today, language, summary, centuries, isLoading, error };
}
