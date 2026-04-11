# GDI Product Listing Page

A paginated product listing page built with React and Vite.
Features an in-memory cache layer with TTL and race condition
handling for rapid navigation.

## Setup

```bash
npm install
npm run dev
```

Open http://localhost:5173

---

## Project Structure

![project_structure](<Screenshot 2026-04-11 at 11.57.53 AM.png>)

---

## Architecture

The app is split into three layers that don't bleed into each other.

**Utils** are plain JavaScript, no React. `cache.js` and
`fetchClient.js` could run in any JS environment. Keeping them
framework-agnostic makes them easy to test and easy to replace.

**Hooks** sit between the data layer and the UI. `useProducts`
is the only place that knows about fetching, pagination state,
and cache results. Components just consume what the hook gives them.

**Components** only render. They receive props, return JSX.
No fetch calls, no business logic.

---

## Cache (utils/cache.js)

In-memory Map-based cache. Single exported instance so the
whole app shares one cache — no split state between components.

- **Key format:** `products_${limit}_${skip}` => tied to exact
  API params, not page numbers. If page size changes from 16
  to 24, old cache entries won't collide with new ones.
- **TTL:** 30 seconds, checked on read. Expired entries are
  deleted when accessed rather than on a timer => simpler and
  sufficient for this scale.
- **Private methods** (`#key`, `#isExpired`) hide internals
  from callers. The public interface is just `get`, `set`, `has`.

---

## Race Condition Handling (utils/fetchClient.js)

Rapid pagination can cause stale responses to overwrite newer
ones. Example: Page 2 request fires, then Page 3 fires before
Page 2 returns. If Page 2 arrives last, it overwrites Page 3.

Fix: a shared `currentRequestToken` increments on every call.
When a response arrives, its token is compared to the current
one. If they don't match, the response is discarded silently.

The hook catches `STALE_REQUEST` errors and does nothing =>
no error shown to the user, no state update.
The newer request handles rendering.

---

## State Management (hooks/useProducts.js)

All product and pagination state lives in one hook.

`skip` and `totalPages` are derived from `page` and `pageSize`
rather than stored separately => avoids sync issues between
related values.

When page size changes, page resets to 1. A page 3 at 16
products per page doesn't map to page 3 at 24 products per
page. Resetting prevents showing the wrong data.

---

## Tradeoffs

- **Map over plain object** for the cache store. Maps are built
  for frequent get/set operations and don't carry prototype
  baggage that plain objects do.
- **Two token checks in fetchClient** => once after the network
  response, once after JSON parsing. Catches stale requests at
  the earliest possible point rather than doing unnecessary
  parsing work on a response we're going to discard anyway.
- **Lazy TTL cleanup** => expired entries are removed when
  accessed, not on a scheduled timer. A background cleanup
  interval would be more thorough at scale, but adds complexity
  that isn't justified here.
- **Page resets to 1 on page size change** => a page 3 at 16
  products doesn't translate to page 3 at 24 products. Resetting
  is the safest default.
- **No debounce on pagination buttons** => buttons are disabled
  while loading, so rapid clicks are naturally rate-limited
  without extra logic.
- **Adapter pattern in fetchClient** => `mapProduct` maps the raw
  API shape to our internal model. If DummyJSON changes their
  response structure, only this function needs updating.