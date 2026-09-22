import { useEffect, useState } from "react";

// Delays reflecting `value` until it has stopped changing for `delayMs`, so a
// value fed by free typing (a search box, a year field) doesn't fire a network
// request or an expensive re-render on every keystroke.
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const handle = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(handle);
  }, [value, delayMs]);

  return debounced;
}
