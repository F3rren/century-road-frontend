import { useCallback, useEffect, useState } from "react";
import type { StatCard } from "../types";

function fetchMockStats(): Promise<StatCard[]> {
  // Replace with real API call: api.get<StatCard[]>('/dashboard/stats')
  const mockStats: StatCard[] = [
    { id: "1", label: "Utenti totali", value: 1240, change: 12 },
    { id: "2", label: "Ricavi mensili", value: "€ 48.200", change: 8 },
    { id: "3", label: "Ordini attivi", value: 87, change: -3 },
  ];
  return new Promise((resolve) => setTimeout(() => resolve(mockStats), 500));
}

function runFetch(
  setStats: (stats: StatCard[]) => void,
  setError: (error: string | null) => void,
  setLoading: (loading: boolean) => void,
) {
  fetchMockStats()
    .then(setStats)
    .catch(() => setError("Impossibile caricare le statistiche."))
    .finally(() => setLoading(false));
}

export function useDashboard() {
  const [stats, setStats] = useState<StatCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initial load: stats/loading/error already start in the right shape, so
  // the effect only needs to kick off the fetch — no synchronous setState.
  useEffect(() => {
    runFetch(setStats, setError, setLoading);
  }, []);

  // Retry, called from a click handler (not an effect): resetting loading/
  // error synchronously here is fine.
  const refetch = useCallback(() => {
    setLoading(true);
    setError(null);
    runFetch(setStats, setError, setLoading);
  }, []);

  return { stats, loading, error, refetch };
}
