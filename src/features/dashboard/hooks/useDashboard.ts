import { useMemo } from "react";
import { MOCK_EVENTS } from "@/features/map/data/mockEvents";
import { computeStats } from "../lib/computeStats";

// No loading/error state: this derives from MOCK_EVENTS, already in memory,
// so there is nothing to wait on or fail. That changes the moment this
// reads from a real API instead (see PRODUCT.md's data constraint) — at
// that point loading/error come back for a genuine reason, not as
// simulated states over synchronous data.
export function useDashboard() {
  const stats = useMemo(() => computeStats(MOCK_EVENTS), []);
  return { stats };
}
