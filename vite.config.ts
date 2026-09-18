import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// In Docker dev, BACKEND_URL points to the backend container via Docker network.
// Locally (no Docker) it defaults to localhost:8080.
const backendUrl = process.env.BACKEND_URL ?? "http://localhost:8080";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // maplibre-gl loads its worker via a relative import.meta.url; esbuild's
  // dep pre-bundling relocates the package into node_modules/.vite/deps
  // without moving the worker file along with it, so the worker 404s at
  // runtime and the map never renders. Excluding it from optimizeDeps
  // serves it straight from node_modules, where the relative path resolves.
  optimizeDeps: {
    exclude: ["maplibre-gl"],
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
    proxy: {
      "/api": {
        target: backendUrl,
        changeOrigin: true,
      },
    },
  },
});
