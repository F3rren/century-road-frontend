import { useState } from "react";
import type { ProjectionType } from "@/features/map";

export const MAP_PROJECTION_STORAGE_KEY = "century-road-map-projection";

function isProjectionType(value: string | null): value is ProjectionType {
  return value === "mercator" || value === "globe";
}

// Read-once helper: MapPage's initial useState reads this directly, so its
// first-mount default and Settings' Mappa section write through the exact
// same key and can never drift.
export function getStoredProjection(): ProjectionType {
  try {
    const stored = localStorage.getItem(MAP_PROJECTION_STORAGE_KEY);
    return isProjectionType(stored) ? stored : "globe";
  } catch {
    return "globe";
  }
}

export function useMapProjection() {
  const [defaultProjection, setDefaultProjectionState] = useState<ProjectionType>(getStoredProjection);

  const setDefaultProjection = (next: ProjectionType) => {
    setDefaultProjectionState(next);
    try {
      localStorage.setItem(MAP_PROJECTION_STORAGE_KEY, next);
    } catch {
      // Private-browsing/storage-blocked: still applies for this session.
    }
  };

  return { defaultProjection, setDefaultProjection };
}
