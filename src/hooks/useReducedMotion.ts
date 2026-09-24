import { useState } from "react";

export const REDUCED_MOTION_STORAGE_KEY = "century-road-reduced-motion";

// Read-once helper, usable outside React too (projectionAnimator.ts's own
// prefersReducedMotion() check, which fires on each projection toggle click,
// not just at mount).
export function getReducedMotionOverride(): boolean {
  try {
    return localStorage.getItem(REDUCED_MOTION_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export function useReducedMotion() {
  const [enabled, setEnabled] = useState<boolean>(getReducedMotionOverride);

  const setOverride = (next: boolean) => {
    setEnabled(next);
    document.documentElement.classList.toggle("reduce-motion", next);
    try {
      if (next) localStorage.setItem(REDUCED_MOTION_STORAGE_KEY, "true");
      else localStorage.removeItem(REDUCED_MOTION_STORAGE_KEY);
    } catch {
      // Private-browsing/storage-blocked: override still applies for this
      // session, it just won't persist across reloads.
    }
  };

  return { enabled, setOverride };
}
