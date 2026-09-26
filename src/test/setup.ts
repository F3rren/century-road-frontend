import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

// RTL's auto-cleanup-after-each-test hooks into a global `afterEach` that
// only exists when Vitest's `test.globals` is on. This project deliberately
// keeps globals off (test files import describe/it/expect explicitly), so
// cleanup is wired by hand here instead — otherwise every render() in a
// file leaks into the next test's DOM and queries like getByRole start
// matching more than one element.
afterEach(() => {
  cleanup();
});

// jsdom doesn't implement matchMedia at all — every hook that reads a media
// query (useMediaQuery, the theme/reduced-motion/dark-mode detection) would
// throw immediately without this. Matches nothing by default; a test that
// needs a specific query to match overrides window.matchMedia itself.
if (!window.matchMedia) {
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}
