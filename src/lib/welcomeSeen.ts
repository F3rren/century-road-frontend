export const WELCOME_SEEN_STORAGE_KEY = "century-road-seen-welcome";

export function hasSeenWelcome(): boolean {
  try {
    return localStorage.getItem(WELCOME_SEEN_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export function markWelcomeSeen(): void {
  try {
    localStorage.setItem(WELCOME_SEEN_STORAGE_KEY, "true");
  } catch {
    // Private-browsing/storage-blocked: the welcome page just shows again
    // next visit, which is a harmless fallback, not a broken one.
  }
}
