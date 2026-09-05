import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.js";
// The War Room faces (DECISIONS.md D104). Latin-only and hand-written rather
// than imported wholesale — see the note at the top of `styles/fonts.css`
// for why the packages' own stylesheets would put Cyrillic in the PWA
// precache. Three variable files cover every weight the design system uses.
import "./styles/fonts.css";
import "./styles/index.css";

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("missing #root — check index.html");

createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
