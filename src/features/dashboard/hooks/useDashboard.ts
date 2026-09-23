import { useTranslation } from "react-i18next";
import { useTodayHistory } from "@/features/map";
import { computeStats } from "../lib/computeStats";

// Async, backed by the same today's-history fetch (and the same
// coordinate-based country guess) the map page uses — not a synchronous
// in-memory mock array, so loading/error are real states here, not
// simulated ones.
export function useDashboard() {
  const { t } = useTranslation();
  const { geocodedEvents, isLoading, error } = useTodayHistory();
  const stats = computeStats(geocodedEvents, t);
  return { stats, isLoading, error };
}
