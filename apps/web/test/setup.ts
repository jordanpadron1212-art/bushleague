import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
// jsdom doesn't implement IndexedDB — save.ts (idb) needs a real
// implementation to test against, not a mock of idb's own API.
import "fake-indexeddb/auto";

// Explicit, not relying on auto-registration — Vitest doesn't expose Jest's
// globals unless `test.globals` is on, and this project isn't turning that
// on just to make an implicit convenience work.
afterEach(() => {
  cleanup();
});
