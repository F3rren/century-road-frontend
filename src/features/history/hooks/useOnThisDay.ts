import { useEffect, useState } from 'react';
import { buildOnThisDayPath, fetchOnThisDay } from '../services/historyApi';
import type { OnThisDayData, OnThisDayParams } from '../types';

type Settled =
  | { path: string; data: OnThisDayData; error: null }
  | { path: string; data: null; error: string };

function toMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Errore sconosciuto';
}

export function useOnThisDay(params: OnThisDayParams) {
  const path = buildOnThisDayPath(params);
  const [settled, setSettled] = useState<Settled | null>(null);

  useEffect(() => {
    let isStale = false;

    fetchOnThisDay(path)
      .then((data) => {
        if (!isStale) setSettled({ path, data, error: null });
      })
      .catch((error: unknown) => {
        if (!isStale) setSettled({ path, data: null, error: toMessage(error) });
      });

    return () => {
      isStale = true;
    };
  }, [path]);

  // A result for a previous path is not the answer to this one: treat it as
  // still loading instead of resetting state inside the effect.
  const current = settled?.path === path ? settled : null;

  return {
    path,
    isLoading: current === null,
    data: current?.data ?? null,
    error: current?.error ?? null,
  };
}
