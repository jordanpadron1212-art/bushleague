import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
// jsdom doesn't implement IndexedDB — save.ts (idb) needs a real
// implementation to test against, not a mock of idb's own API.
import "fake-indexeddb/auto";

// jsdom's own fetch/AbortController polyfill shadows Node's global one with
// a DIFFERENT class hierarchy — real, discovered while investigating why
// GitHub Actions' CI had failed on every single run since this project's
// first commit (Node 24 there, Node 22 in every session that verified
// locally, never caught before). react-router's data router calls
// `new Request(href, { signal })` internally on every navigation; Node's
// built-in `Request` (undici) does a strict `instanceof AbortSignal` check
// against ITS OWN native class, not jsdom's, so a signal from jsdom's
// `AbortController` throws "Expected signal to be an instance of
// AbortSignal" the moment a test triggers a route change — exactly what
// `app.test.tsx`'s club-picker/action-bar tests do. The standalone `undici`
// package is a self-contained implementation that resolves `fetch`/
// `Request`/`Response`/`Headers` and their own `AbortSignal` checks
// consistently against EACH OTHER, sidestepping the cross-realm mismatch
// with jsdom's separate class — reproduced and verified fixed against a
// real Node 24 binary, not assumed from reading about the issue.
import { fetch, Headers, Request, Response, FormData } from "undici";
Object.assign(globalThis, { fetch, Headers, Request, Response, FormData });

// Explicit, not relying on auto-registration — Vitest doesn't expose Jest's
// globals unless `test.globals` is on, and this project isn't turning that
// on just to make an implicit convenience work.
afterEach(() => {
  cleanup();
});
