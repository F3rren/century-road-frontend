# Architecture — Grains of History Frontend

> System context: this is the frontend half of Grains of History. The backend (3 Spring Boot services behind a gateway) lives in a sibling repository, [github.com/F3rren/century-road-backend](https://github.com/F3rren/century-road-backend), which has its own `architecture.md`. Product context lives in [PRODUCT.md](../PRODUCT.md); visual language in [DESIGN.md](../DESIGN.md); operational guidance for AI agents in [AGENTS.md](../AGENTS.md).

## Tech stack

| | Version | Notes |
|---|---|---|
| React | 18.3.1 | |
| Vite | ^8.3.0 | Also the dev server and build tool |
| TypeScript | ^5.5.3 | |
| Tailwind CSS | ^3.4.10 | shadcn/ui-style token setup (`components.json`) via `class-variance-authority`, `clsx`, `tailwind-merge` |
| react-router-dom | ^7.18.4 | `createBrowserRouter` |
| i18next / react-i18next | ^26 / ^17 | No HTTP backend — all 4 locale JSONs imported statically |
| maplibre-gl | ^6.10.0 | The interactive globe/map |
| @turf/boolean-point-in-polygon | ^7.4.0 | Country-attribution geocoding (see below) |
| lucide-react | latest | The only icon library — see [DESIGN.md](../DESIGN.md) |
| ESLint | ^10 (flat config) | No Prettier |
| Vitest / React Testing Library | ^5 / ^16 | Unit + component tests, `jsdom` environment — see Testing below |

**No E2E framework exists yet** (no Playwright/Cypress) — only unit and component-level tests. Adding E2E coverage for the 3-5 core user flows in `docs/PRD.md` is a real, not-yet-scoped gap, not an oversight to silently "fix" by inventing one unasked.

## Testing

`npm run test` (Vitest, `jsdom` environment) — configured in `vitest.config.ts`, deliberately separate from `vite.config.ts` since the app build's concerns (the dev proxy, the maplibre worker-asset plugin, the two production guards) are irrelevant to running tests. Global setup (`src/test/setup.ts`) extends `expect` with `@testing-library/jest-dom` matchers, wires React Testing Library's cleanup by hand into `afterEach` (this project keeps Vitest's `globals` off, so RTL's own auto-cleanup — which relies on detecting a global `afterEach` — doesn't fire on its own), and stubs `window.matchMedia`, which `jsdom` doesn't implement at all and several hooks (`useMediaQuery`, theme/reduced-motion detection) call unconditionally.

Test files sit next to the code they cover (`foo.ts` → `foo.test.ts`), not in a parallel `tests/` tree. Every test file imports `describe`/`it`/`expect`/`vi` explicitly from `vitest` rather than relying on injected globals.

Current coverage is deliberately narrow rather than broad: a first pass targeting the highest-value, lowest-risk surface — pure business logic with real edge cases (`src/lib/months.ts`'s date/leap-year/BCE-era handling, `src/features/archive/lib/filterParams.ts`'s URL parse/clamp/round-trip logic, `src/features/dashboard/lib/computeStats.ts`'s aggregation rules, `src/lib/welcomeSeen.ts`'s storage-failure fallback), plus `historyApi.ts`'s content-layer clients (envelope handling and the shapes each one refuses, with `api.ts` mocked), plus one component smoke test (`ExternalAnchor`) proving the RTL/jsdom setup itself works end-to-end. Writing tests for a codebase that had none surfaced two real, if minor, findings worth knowing before extending this suite: `daysInMonth(0)` returns `0`, not the `31` fallback other out-of-range inputs get (index `0` is an in-bounds read of the array's own padding slot, not a missing index — `??` never fires); and `parseFilters`'s `Number(params.get('month')) || fallback.month` treats a URL's `month=0` as absent (falsy `0`) rather than clamping it, so it silently falls back to today's month instead. Neither is fixed here — they're pre-existing behavior, documented in the tests that found them, not defects introduced by adding tests.

CI (`ci.yml`) runs `npm run test` between lint and build, so a failing test fails the pipeline the same way a lint or type error does.

**Requires Node ≥22.10** (`package.json`'s `engines` field, and `ci.yml`'s `node-version: '22'`) — not a preference, a hard requirement discovered the first time this suite ran in CI. jsdom 30's bundled `undici` (^8.x) unconditionally calls `node:worker_threads.markAsUncloneable` at module-load time; that API doesn't exist before Node ~22.10, so on an older Node every single test file crashes before any test runs, with the misleading-looking error `webidl.util.markAsUncloneable is not a function`. `dev`/`build`/`lint` don't touch jsdom and work fine on Node 20 — only `npm run test` needs the newer runtime. If this resurfaces after a jsdom bump, check whether the fix landed upstream before reflexively re-pinning the Node version further.

## General architecture

A single-page app, feature-folder organized. Everything under `src/features/<name>/` owns its own `components/`, `hooks/`, `lib/`, `services/`, `types/` as needed — cross-feature imports go through each feature's `index.ts` barrel, never reaching into another feature's internals directly.

```
src/
├── pages/          route-level components — thin, compose feature components
├── features/
│   ├── welcome/    first-visit threshold screen (the name developing like a print, a cyanotype-toned photo filmstrip)
│   ├── map/        the core surface — MapLibre globe/map restyled as a paper print, country geocoding, events side panel
│   ├── history/    shared history-service layer: the "on this day" feed (consumed by map, dashboard, archive) and the client for the rest of the backend's content (see API design)
│   ├── dashboard/  real-data statistics (today's events + all-time view-popularity)
│   ├── archive/    the standalone filterable/searchable day browser
│   ├── century/    "Il mio secolo": one country's events across the whole year, URL-backed, printable
│   ├── settings/   6 real settings sections
│   ├── info/       guide/methodology/credits pages: prose links, and today's live data report
│   ├── legal/       shared component kit for the two legal pages (LegalSection also reused by the info pages)
│   ├── privacy/    content instance using the legal kit
│   └── terms/      content instance using the legal kit
├── components/
│   ├── layout/     AppLayout, Header, Sidebar — the persistent app shell
│   └── ui/         shared primitives (button, PageHeader, ExternalAnchor, …)
├── hooks/          app-wide hooks (theme, language, map projection, keyboard shortcuts, reduced motion, …)
├── lib/            utils, welcomeSeen, months (date formatting)
├── services/       api.ts — the single shared HTTP client
├── router/         route table
├── i18n/           i18next setup + 4 locale JSONs
├── styles/         globals.css — design tokens
└── types/          shared app-wide types
```

### Routing

`src/router/index.tsx` builds a `createBrowserRouter` with a `basename` derived from `import.meta.env.BASE_URL`, so the router prefix follows whichever build target set it (see Deployment below) rather than being hardcoded.

- **`/welcome`** — standalone, outside `AppLayout`. A true threshold: no sidebar/header chrome.
- **`/`** (`AppLayout`, wraps everything below as children):
  - `index: true` → `IndexRoute` — not a page itself, a gate: `!hasSeenWelcome()` redirects to `/welcome`, otherwise renders `MapPage` directly (the same "default unless a preference says otherwise" shape the app uses for theme/language/projection). The selected country lives in `?country=XX` (each choice pushes a history entry, so Back returns to the whole day); the first-visit redirect drops it.

### The map

`MapView` loads OpenFreeMap's Positron and repaints it on load as the paper of a cyanotype ([DESIGN.md](../DESIGN.md), The Paper Map Rule): land and sea in Paper, its own country lines from the same Natural Earth shapes the heat is counted on, place names only from zoom 4 and in the UI language. Today's countries are filled from `constants/heat.ts`, and the camera turns to them (`facingCenter`) and to a chosen country (`countryAnchor`), both in `lib/countryGeometry.ts`. `EventsPanel` holds the two doors, the day and the country; the history list it renders marks the editors' picks in place (`features/history/lib/featured.ts`) instead of listing them twice. The design critique this layout answers is kept in `.impeccable/critique/`.
  - `dashboard`, `archive`, `settings`, `privacy`, `terms` → their respective pages.
  - `century` → "Il mio secolo": pick a country, read its events from every day of the year in time order, grouped by decade. Fed by the backend's nightly country index (`/api/history/countries`), not by the day-at-a-time feed the other pages use. The choice lives in the URL (`?country=IT&from=1901&to=2000`; an empty `from=`/`to=` means no limit, a missing one the 1901–2000 default), so the link is the thing to share; each row opens the Archive on that day and year. Main nav after Archivio, shortcut `4` (Settings moved to `5`). Country names come from `@/features/map/data` for the same MapLibre reason as `methodology` below.
  - `guide`, `methodology`, `credits` → reference pages (how to use, where the data comes from, sources/licenses/contact), fully translated, linked from the sidebar's lower group with Privacy and Terms. `methodology` renders today's real backend response as a table via `useTodayHistory` — imported from `@/features/map/data`, not the main barrel, which would pull MapLibre (~1 MB) into a text page.
  - `*` → `NotFoundPage`.

## Data model

None, locally. This app holds no local persistence beyond browser `localStorage` for user preferences (theme, language, map projection, reduced-motion override, "has seen welcome"). Every piece of content data — events, view-count statistics — is fetched live from the backend gateway on every page load; there is no client-side cache layer beyond React's own render lifecycle and `localStorage`'s preference values.

## API design

**`src/services/api.ts`** — the single shared HTTP client. `BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api"` (deliberately `||`, not `??` — an unset env var arrives as an empty string at build time, which `??` would accept and point every request at the site root). A thin `request<T>()` wrapper sets `Content-Type: application/json`, throws a plain `Error("HTTP {status}: {statusText}")` on any non-ok response, otherwise resolves `response.json()`. Exposes `api.get/post/put/patch/delete`, all generic over `<T>`. No auth headers, no retry, no interceptor layer.

**`src/features/history/services/historyApi.ts`** — the only feature-level API module in the app; dashboard, map, archive, and century all consume backend data through it rather than each having their own (century through `fetchTimelineCountries` and `fetchCountryTimeline`, with `buildCountryTimelinePath` as the fetch key). Validates every response's envelope shape at runtime (checks the expected fields exist) before trusting `.data`, and throws a plain `Error` with a **hardcoded Italian message** (`'Risposta del backend non nel formato atteso'`) on a shape mismatch — a known gap, not yet routed through i18next keys.

Beyond the day feed, the same module is the client for the backend's content layer (backend commit `59a6a43`, documented in its README under "Guided paths and insights", "Discovery" and "Sources, and reporting a mistake"). **No page uses it yet** — there is no route, component or i18n copy for any of it, by design: adding a route changes the routing structure, which needs a decision first. What exists is the contract, ready to build on, one types file per part (`features/history/types/`: `editorial.ts`, `discovery.ts`, `transparency.ts`, re-exported by `types/index.ts`):

| Part | Endpoint | Client | Hook |
|---|---|---|---|
| "Inizia da qui" | `GET /history/start-here` | `fetchStartHere` | `useStartHere` |
| Guided paths | `GET /history/paths`, `/paths/{slug}` | `fetchPaths`, `fetchPath(slug)` | `usePaths`, `usePath(slug)` |
| "Perché conta" | `GET /history/insights[?month=&day=]`, `/insights/{slug}` | `buildInsightsPath` + `fetchInsights`, `fetchInsight(slug)` | `useInsights(day?)`, `useInsight(slug)` |
| "Sorprendimi" | `GET /history/random` | `buildRandomEventPath` + `fetchRandomEvent` | none — it is asked for on a click, never cached, so there is no key to hold |
| "Nello stesso periodo" | `GET /history/same-period` | `buildSamePeriodPath` + `fetchSamePeriod` | `useSamePeriod(params)` |
| Sources and limits | `GET /history/sources` | `fetchSources` | `useSources` |
| "Segnala un errore" | `POST /history/reports` | `submitErrorReport` | none — a write |

The hooks follow `useOnThisDay`: a `build…Path` function makes the fetch key, `useKeyedFetch` holds the race guard, and every hook returns `retry` (`useFetchOnce` returns it too now, for the keyless ones). Things a page built on this must keep, because the backend's contract says so: show `place.note` when `place.approximate` is true; show no review date, and never the word "verified", when `provenance.reviewedAt` is absent (the first path and its nine insights are drafts, none reviewed); show `notes` when there are any; show the `notice` and `coverage.note` of a same-period answer at every coverage level, and present `SPARSE` as "poco materiale", not as "nothing happened"; an insight is matched to a day's events on `date.year`, since events carry no identifier. The editorial text is Italian only, whatever the UI language. `POST /reports` is rate-limited (429) and `api.ts` throws a plain `Error("HTTP 429: …")` for it, as for a 400, so a form tells them apart from the status in the message (as `describeFetchError` does for 5xx); and its optional `contact` is personal data, so the Privacy page (Italian-only, intentionally) has to say so before a form ships.

The backend's response envelope (`ApiEnvelope<T>`, shared shape across both repos): `{ success, error?, message?, userMessage?, data?, timestamp, sessionId }`. See the backend's `architecture.md` for the authoritative definition.

## Key technical decisions

Two build-time guards live in `vite.config.ts` and fail the *build*, not the runtime, on purpose — catching a class of mistake as an explicit error message instead of a silent production failure:

- **`assertNoSecretsInBundle`** — refuses to build if any `VITE_*` environment variable name looks secret-shaped (matches `/SECRET|TOKEN|PASSWORD|PASSWD|PRIVATE|CREDENTIAL|API_?KEY|ACCESS_?KEY/i`). Every `VITE_*` variable is compiled into the bundle every visitor downloads, so a secret there is published, not hidden.
- **`assertHttpsApiBase`** — in a production build, refuses to proceed if `VITE_API_BASE_URL` isn't `https://` or a same-origin relative path. A page served over HTTPS calling an `http://` API gets silently blocked by the browser as mixed content; this turns that into a clear build-time error instead of every API call failing mysteriously in production.

**Print styles are global, and so far one page uses them.** `/century` is the first page meant for paper, but what it needed is app-wide: in `globals.css` the `.dark` tokens apply under `@media screen` only, so paper is always printed light whatever the theme on screen; `html`/`body` let go of the fixed-height shell, and rows using `content-visibility` are forced visible (otherwise off-screen rows print blank). `AppLayout` releases its own `h-screen`/`overflow-hidden` frame with `print:` classes, and `Header`/`Sidebar` are `print:hidden`. A future printable page gets all of that for free and only hides its own controls (`print:hidden`) and keeps rows whole (`break-inside-avoid`).

A third, unrelated Vite plugin (`maplibreWorkerAssets`) exists because maplibre-gl resolves its worker file at runtime via a relocatable relative URL that Vite's static analysis can't follow — the plugin copies the two files maplibre expects to find beside the bundle at build time, and `optimizeDeps.exclude: ["maplibre-gl"]` prevents the dev server's dependency pre-bundling from breaking the same relative-path resolution in dev.

## Deployment and environments

Three real deploy targets exist in this repo, chosen per environment:

| Target | How | Notes |
|---|---|---|
| **Railway** (primary/production) | *Docker Image* deploy, pointed at `ghcr.io/f3rren/century-road-frontend:<version>` — not built on Railway | Production URL: `https://century-road.up.railway.app`. `VITE_API_BASE_URL` is baked into the image at CI build time (a GitHub Actions repository variable), not supplied by Railway — the backend's gateway `FRONTEND_ORIGIN` must match this app's exact public origin. See README.md's [Container images](../README.md#container-images) and [Running it on Railway](../README.md#running-it-on-railway). |
| **Docker Compose** (local full-stack dev) | `Dockerfile`, `dev` stage: `node:20-alpine`, `npm run dev -- --host 0.0.0.0`; `prod` stage: `nginx:1.27-alpine` serving `dist/` | For running frontend + backend together via the backend's `compose-dev.yml`-adjacent workflow. |
| **GitHub Pages** (optional/static) | `VITE_BASE_PATH` env var sets Vite's `base`, consumed by the router's dynamic `basename` | Only the Pages workflow sets this; local dev and a custom domain both want a plain `/`. |

Environment variables:
- **`BACKEND_URL`** (dev only, default `http://localhost:8080`) — where the Vite dev server proxies `/api/*` requests. Never reaches the browser.
- **`VITE_API_BASE_URL`** (production only) — baked into the bundle at build time; must end with `/api`; validated by the two build guards above. Supplied as a GitHub Actions repository variable to the image CI publishes, not as a Railway service variable (Railway no longer builds this app).

CI (`.github/workflows/`): `ci.yml` runs `npm run lint`, `npm run test`, `npm run build` (type-checking is folded into `build` via `tsc && vite build`), then — on a push to `main`/`develop` only, once that job is green — builds and publishes the production image to GHCR (`publish-image` job) and runs the release script's own test suite (`release-script` job). `release.yml` (triggered by a `vMAJOR.MINOR.PATCH` tag push, or manually) gives that image its version tags and creates a GitHub release; see README.md's [Releasing a version](../README.md#releasing-a-version). Also present: `codeql.yml` (weekly + on push/PR), `dependency-review.yml` (PR-only, fails on `high` severity), `dependency-scan.yml` (weekly + on push/PR), and a weekly `dependabot.yml` targeting `develop`.
