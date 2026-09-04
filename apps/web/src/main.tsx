import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.js";
// Latin-subset builds only (game copy is English-only) — the default
// `/400.css` imports pull every Unicode range (Cyrillic, Greek, Vietnamese),
// which more than triples the font payload for a mobile-first PWA.
import "@fontsource/ibm-plex-sans/latin-400.css";
import "@fontsource/ibm-plex-sans/latin-500.css";
import "@fontsource/ibm-plex-sans/latin-600.css";
import "@fontsource/ibm-plex-mono/latin-400.css";
import "@fontsource/ibm-plex-mono/latin-500.css";
import "./styles/index.css";

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("missing #root — check index.html");

createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
