import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

// GitHub Pages serves this repo at https://<org>.github.io/bushleague/ — the
// base path must match the repo name exactly or every asset link 404s.
const BASE = process.env.VITE_BASE_PATH ?? "/bushleague/";

export default defineConfig({
  base: BASE,
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon-32.png", "apple-touch-icon.png"],
      manifest: {
        name: "Bush League",
        short_name: "Bush League",
        description: "Run a ballclub from a folding chair in indy ball to a big-league dynasty.",
        start_url: BASE,
        scope: BASE,
        display: "standalone",
        orientation: "portrait",
        background_color: "#0a0a0a",
        theme_color: "#0a0a0a",
        icons: [
          { src: "icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        // The save lives in IndexedDB, not the cache — this only needs to
        // make the app shell load offline after a first visit (LAWS.md's old
        // Law 1 portability goal, restored for a hosted app).
        globPatterns: ["**/*.{js,css,html,woff2,png,svg}"],
      },
    }),
  ],
  build: {
    target: "es2022",
    sourcemap: true,
  },
});
