import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

// Explicit, not relying on auto-registration — Vitest doesn't expose Jest's
// globals unless `test.globals` is on, and this project isn't turning that
// on just to make an implicit convenience work.
afterEach(() => {
  cleanup();
});
