import fs from "fs";
import path from "path";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

// maplibre-gl works out its worker URL at runtime - a ternary picking between the dev
// and production filename, then a template literal - rather than through a static
// new URL("./worker.mjs", import.meta.url) that Vite could recognise. Nothing is
// emitted for it, so in a built site the worker is fetched from next to the bundle and
// 404s. The failure is quiet in a way that wastes an afternoon: the canvas mounts at
// full size and no error surfaces in the page, the map simply never draws.
//
// Copying the files maplibre expects to find beside the bundle is what fixes it. Both
// are needed: the worker imports the shared chunk, and both are read from the installed
// package so they can never drift from the version in package-lock.json.
function maplibreWorkerAssets(): Plugin {
  const files = ["maplibre-gl-worker.mjs", "maplibre-gl-shared.mjs"];

  return {
    name: "maplibre-worker-assets",
    apply: "build",
    generateBundle() {
      for (const file of files) {
        const from = path.resolve(
          __dirname,
          "node_modules/maplibre-gl/dist",
          file,
        );
        this.emitFile({
          type: "asset",
          // Exact names, exact directory: maplibre builds the URL itself and will not
          // look anywhere else.
          fileName: `assets/${file}`,
          source: fs.readFileSync(from),
        });
      }
    },
  };
}

// In Docker dev, BACKEND_URL points to the backend container via Docker network.
// Locally (no Docker) it defaults to localhost:8080.
const backendUrl = process.env.BACKEND_URL ?? "http://localhost:8080";

// GitHub Pages serves this repository at /<repo>/, so every built asset URL needs
// that prefix. It comes from the environment rather than being hardcoded: local dev
// and any future custom domain at the apex both want a plain "/", and only the Pages
// workflow sets it.
const basePath = process.env.VITE_BASE_PATH ?? "/";

export default defineConfig({
  base: basePath,
  plugins: [react(), maplibreWorkerAssets()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
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
