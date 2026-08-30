# Ayurvedic Super App

A **production-ready Ayurvedic Super App** with three independent modules —
**Consultations**, **Shop**, and **Health Records** — built to the Amrutam Senior
React Assignment spec. It is architected for **scale (5k doctors / 20k products /
10k records)**, **offline-first operation**, **reliability**, and strong
developer experience.

> React Native · TypeScript · React Navigation v7 · Zustand

---

## Getting Started

```bash
npm install
npm test
npm run lint
npm run ios   # or npm run android (after pod install for iOS)
```

> All data is deterministically generated in-memory (mock server). No live
> backend or network is required — the app is offline-first.

---

## Folder Structure

```
src/
├── app/                  # App shell: providers & navigation assembly
│   ├── navigation/       # Root tab navigator + central param-list types
│   └── providers/        # Theme/connectivity/sync providers
│
├── core/                 # Shared, framework-agnostic infrastructure
│   ├── api/              # API abstraction (retry/timeout/cache/offline queue)
│   │   └── connectivity/ # NetInfo wrapper + connectivity store
│   ├── config/           # Feature Flags + i18n (Localization bonus)
│   ├── db/               # Storage abstraction + mock server + data generator
│   ├── error/            # ErrorBoundary (crash-report abstraction hook)
│   ├── hooks/            # useDebounce, usePrevious, useNow, useLatestRef
│   ├── logger/           # Structured, ring-buffered logging
│   ├── theme/            # Design-system tokens (light/dark)
│   ├── toast/            # Global toast store/API
│   ├── ui/               # Reusable design-system components
│   └── util/             # format/date/string utilities
│
└── modules/              # Three independent feature modules
    ├── consultations/    # Module 1 — doctor booking
    ├── shop/             # Module 2 — e-commerce
    └── health/           # Module 3 — health-record timeline
```

Each module is **self-contained**: it owns its `src/{screens,components,store,
services,hooks,types}` and a `navigation/` entry. Modules communicate only
through `core/` and the central navigation types — no cross-module imports.

---

## Architectural Decisions

- **Feature-modular monolith.** Each module is an independent subtree with its own
  store(s), services and screens, but ships inside one binary — the separation of
  a micro-frontend without the overhead.
- **Layered core → modules.** `core/` holds domain-agnostic infrastructure.
  *All* data access flows through the **API abstraction layer**, so swapping the
  mock backend for a real REST/Graph API is a one-file change (`db/mockServer.ts`).
- **Virtualised rendering everywhere.** Lists use `FlatList`/`SectionList` with
  `removeClippedSubviews`, bounded `windowSize`, `initialNumToRender`, and
  `React.memo`-wrapped rows so 5k/20k/10k rows never block the JS thread.
- **Deterministic, lazy mock data.** Repositories generate data on demand via a
  seeded PRNG (5,000 doctors, 20,000 products, 10,000 records) instead of
  materialising huge arrays — keeping memory flat.

### State Management: Zustand

Chosen over Redux for: tiny API surface, **selective re-renders** (only
components subscribing to a changed slice update), first-class `persist` support
for offline stores, and simple middleware-free composition.

| Store | Responsibility |
|-------|----------------|
| `doctorListStore` | doctor pagination/search/filter/sort |
| `appointmentsStore` | persisted offline bookings |
| `productListStore` | product infinite-scroll/filter/sort |
| `cartStore` / `wishlistStore` | **persisted** offline cart & wishlist |
| `healthStore` | grouped record timeline |
| `themeStore` | light/dark tokens |
| `connectivityStore` | reachability |
| `toastStore` | global toasts |

---

## Performance & Scalability

1. **Virtualisation** — `FlatList`/`SectionList` render only visible rows; heavy
   datasets paginate through the service layer.
2. **Memoization** — memoised rows (`React.memo`), `useCallback` handlers,
   `useMemo` derived values, and Zustand selector subscriptions keep re-renders
   local.
3. **Debounced search** — search settles for 300ms before hitting the data layer,
   avoiding per-keystroke re-queries.
4. **Efficient state updates** — targeted, immutable store updates; components
   subscribe only to the slice they need.
5. **Lazy data materialisation** — generators build records on-the-fly and cache,
   so loading 5,000 doctors is just iterating ids.

## Offline-First Strategy

- **Cached API responses.** Every GET is sealed in a storage envelope; on
  re-entry, fresh-cache hits return instantly; on failure **stale-while-
  revalidate** serves the last good payload.
- **Offline cart / wishlist / appointments** persist to device storage via
  Zustand `persist`.
- **Offline bookings (queued).** Mutating requests (book/cancel/order) that fail
  while offline are pushed to a persisted queue.
- **Automatic sync.** When NetInfo reports connectivity (or the app returns to
  the foreground), the queue flushes in order; failures re-queue and a toast
  confirms how many synced.

## Reliability

The API layer gracefully handles: **slow network / timeouts** (per-attempt
bound), **random failures / 5xx** (backoff retries), **invalid JSON / partial
responses** (validators + typed failure), **empty responses** (empty states, not
crashes), and **session expiry (401/403)** (central hook). Errors are logged via
the structured logger and surfaced through the global **Toast** system — never a
blank screen.

## Developer Experience

- **Shared design system** (`core/ui`) with theming — Button, Card, Badge, Avatar,
  Input, Spinner, EmptyState, AppBar, Chip, Screen.
- **Strong typing** across all three modules + navigation param lists.
- **Zero duplication** — shared hooks, formatting, and mock-generator utils.
- **ESLint + Prettier** configured; `npm run lint` / `npm test`.
- **Accessibility** — `accessibilityRole`/`accessibilityLabel`/`accessibilityState`
  on interactive elements; a live-region toast container.

---

## Bonus Features Implemented

1. **Feature Flags** — typed, persisted flag store with enable/disable API.
2. **Localization (2 languages)** — `en`/`hi` dictionary + locale store.
3. **Crash-reporting abstraction** — `ErrorBoundary` + structured logger buffer.
4. **Background Synchronization** — AppState/foreground + NetInfo-triggered
   offline-queue flush.

## Testing

Tests cover business logic, custom hooks, utilities, and a real offline sync flow:

| Suite | Scope |
|-------|-------|
| `util.format.test.ts` | currency, dates, relative time, hashing, chunking |
| `business-logic.test.ts` | repos, filtering, sort, checkout, appointments |
| `hooks.test.tsx` | `useDebounce`, `usePrevious` |
| `offline-flow.test.ts` | cached reads + queueing + flush (end-to-end) |
| `App.test.tsx` | app renders |

```bash
npm test
```

## Trade-offs

- **No live backend.** A deterministic mock server keeps the app self-contained;
  connecting a real API is a single-transport swap.
- **AsyncStorage persistence.** Synchronous reads aren't needed; migration to
  SQLite/WatermelonDB would help very large local datasets.
- **Simplified booking.** Conflict/expiry/double-book rules are enforced, but a
  production system needs server-authoritative slot reservation.
- **No component libraries.** The design system is hand-built and theme-driven,
  avoiding heavy dependencies.

## Future Improvements

- Server-authoritative booking with optimistic UI + conflict rollback.
- Push notifications & deep-linking (native handlers stubbed).
- WatermelonDB/SQLite for offline CRUD at scale.
- Envelope-encrypted secure local storage for sensitive health data.
- API-contract validation + codegen for the real backend.
- Real image URLs for doctors/products/attachments.
