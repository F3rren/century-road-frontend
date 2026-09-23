import { useTodayHistory } from "@/features/map";
import { computeStats } from "../lib/computeStats";

// Async, backed by the same today's-history fetch (and the same
// coordinate-based country guess) the map page uses — not a synchronous
// in-memory mock array, so loading/error are real states here, not
// simulated ones. See PRODUCT.md's data constraint.
export function useDashboard() {
  const { geocodedEvents, isLoading, error } = useTodayHistory();
  const stats = computeStats(geocodedEvents);
  return { stats, isLoading, error };
}
