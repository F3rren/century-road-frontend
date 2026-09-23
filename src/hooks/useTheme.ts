import { useState } from "react";

type Theme = "light" | "dark";
// Exported so the privacy page names the exact key it describes. index.html
// reads the same key in its pre-paint script and has to be kept in step.
export const THEME_STORAGE_KEY = "century-road-theme";

// The inline script in index.html already applied the persisted/system
// theme to <html> before React mounted (avoids a flash of the wrong
// theme); this just reads that back instead of re-deriving it.
function getInitialTheme(): Theme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  const toggleTheme = () => {
    setTheme((current) => {
      const next: Theme = current === "dark" ? "light" : "dark";
      document.documentElement.classList.toggle("dark", next === "dark");
      try {
        localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch {
        // Private-browsing/storage-blocked: theme still applies for this
        // session, it just won't persist across reloads.
      }
      return next;
    });
  };

  return { theme, toggleTheme };
}
