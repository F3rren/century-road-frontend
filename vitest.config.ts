import path from "path";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// Separate from vite.config.ts on purpose: that file's concerns (the dev
// proxy, the maplibre worker-asset plugin, the production build guards) are
// all irrelevant to running tests and would only add risk for no benefit.
// The one thing duplicated here is the "@" alias, since tests import
// through it the same way the app does.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    css: false,
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      exclude: ["node_modules/", "src/test/"],
    },
  },
});
