import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

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
  plugins: [react()],
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
