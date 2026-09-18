import fs from "fs";
import path from "path";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

// maplibre-gl works out its worker URL at runtime rather than through a
// static new URL("./worker.mjs", import.meta.url) that Vite's build could
// recognise and emit for. Ported from the same fix already merged to main
// (PR #18, "fix: emit the maplibre worker beside the bundle") so develop's
// production builds don't regress once it catches up with main. Both files
// are needed: the worker imports the shared chunk, and both are read from
// the installed package so they can never drift from package-lock.json.
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

export default defineConfig({
  plugins: [react(), maplibreWorkerAssets()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // maplibre-gl loads its worker via a relative import.meta.url; esbuild's
  // dep pre-bundling (dev server only) relocates the package into
  // node_modules/.vite/deps without moving the worker file along with it,
  // so the worker 404s at runtime and the map never renders. Excluding it
  // from optimizeDeps serves it straight from node_modules, where the
  // relative path resolves. This is the dev-server counterpart to the
  // maplibreWorkerAssets build plugin above.
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
