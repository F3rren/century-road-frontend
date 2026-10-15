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

Current coverage is deliberately narrow rather than broad: a first pass targeting the highest-value, lowest-risk surface — pure business logic with real edge cases (`src/lib/months.ts`'s date/leap-year/BCE-era handling, `src/features/archive/lib/filterParams.ts`'s URL parse/clamp/round-trip logic, `src/features/dashboard/lib/computeStats.ts`'s aggregation rules, `src/lib/welcomeSeen.ts`'s storage-failure fallback), plus `historyApi.ts`'s content-layer clients (envelope handling and the shapes each one refuses, with `api.ts` mocked), `pathFilters` (parse/serialize, accent-insensitive search, topic counts, grouping), `PathsPage` over 120 synthetic paths in three topics (grouping, select, search, empty state, URL, an older backend with no topics), `PathPage`, the new pages' components (`ReportForm`, `InsightView`, `SamePeriod`, `CenturySamePeriod`, `Surprise`, `PathStops`: what the backend says must not be dropped, and how each failure reads), a parity test that every locale has exactly the keys Italian has, plus one component smoke test (`ExternalAnchor`) proving the RTL/jsdom setup itself works end-to-end. Writing tests for a codebase that had none surfaced two real, if minor, findings worth knowing before extending this suite: `daysInMonth(0)` returns `0`, not the `31` fallback other out-of-range inputs get (index `0` is an in-bounds read of the array's own padding slot, not a missing index — `??` never fires); and `parseFilters`'s `Number(params.get('month')) || fallback.month` treats a URL's `month=0` as absent (falsy `0`) rather than clamping it, so it silently falls back to today's month instead. Neither is fixed here — they're pre-existing behavior, documented in the tests that found them, not defects introduced by adding tests.

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
│   ├── paths/      the guided paths: "Inizia da qui", search first, then the list of paths gathered by macro-topic and opening by topic, a path's ordered stops
│   ├── insights/   "Perché conta" for one event
│   ├── discovery/  the two ways in that are not a search: "Sorprendimi" (a random event, with its country shown and linked) and "Nello stesso periodo" (the same years in other countries)
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
  - `century` → "Il mio secolo": pick a country, read its events from every day of the year in time order, grouped by decade. Fed by the backend's nightly country index (`/api/history/countries`), not by the day-at-a-time feed the other pages use. The choice lives in the URL (`?country=IT&from=1901&to=2000`; an empty `from=`/`to=` means no limit, a missing one the 1901–2000 default), so the link is the thing to share; each row opens the Archive on that day and year. Main nav after Archivio, shortcut `4`. "Sorprendimi" sits next to Print and shows a random event from the index that honours the country and years chosen here, with its date and country, and leads on from it: its day in the Archive, the country's whole year, the country on the map (an empty answer is said, not an error). Under a country's timeline, "Nello stesso periodo" compares the years around one the reader types (it starts from the middle event's year; the country being read is left out). Not printed. Country names come from `@/features/map/data` for the same MapLibre reason as `methodology` below.
  - `paths` → "Percorsi": over 8 paths a ruled strip comes first, under the title, with a search box (every word, any order, no accents, over title, tagline and topic name) and a topic select with a count per topic, then "Inizia da qui" (a few paths and events picked by an editor; hidden while a filter is on, so the results are the page) and then every guided path. The ~25 backend topics are gathered under 7 macro-topic headings (`lib/macroTopics.ts`, a table of the frontend's, not a backend field; a topic it does not know is listed last under "other"), and each topic is a closed `<details>` row with its path count that opens onto its paths (open from the start when a search or a topic is chosen). Within a heading the topics, and within a topic the paths, keep the order the backend lists them (it sorts by topic, then by the year of the first stop, then by slug; the frontend does not re-sort), each row with the years its stops span ("1789–1799", "509–27 a.C.", from the backend's `startYear`/`endYear`). The filters live in the URL (`/paths?topic=ROMA_IMPERIALE&q=augusto`, defaults omitted), so Back and a shared link keep them, and a path's page goes back to its topic (`/paths?topic=…`). The topic codes come from a closed list on the backend (`Topic` enum); the labels are `paths.topic.<CODE>` (and `paths.macro.<CODE>` for the headings) in the four locales, falling back to the backend's Italian `topicLabel` for a code the frontend does not know yet, and an older backend that sends no topic gets one flat list. No pagination or virtualization: ~125 rows are ~1,000 DOM nodes and a search takes ~15 ms; Ctrl+F still works, closed topics included, because every row is in the DOM. `paths/:slug` is one path: cover (toned as a cyanotype, with the link to its author and licence), intro and the stops in order, each with its place, a "Perché conta" that opens under it (before, the event, after and a few connections, asked of the backend only for the stop that was opened and only once) and two links, the insight's full page and its place on the map. `insights/:slug` is "Perché conta" as a reading page (before, the event, after; caveats on dates and places; where to read next; sources and provenance). Main nav after Il mio secolo, shortcut `5` (Settings moved to `6`). The insight a map link names lives in the URL: `/?insight=sputnik-1` pins its place and turns the camera to it (`MapView`'s `focusPlace`, `PlacePlaque`); `?country=` and `?insight=` are not combined, picking a country drops the pin.
  - `guide`, `methodology`, `credits` → reference pages (how to use, where the data comes from, sources/licenses/contact), fully translated, linked from the sidebar's lower group with Privacy and Terms. `methodology` renders today's real backend response as a table via `useTodayHistory`, says how paths and insights are made (hand-written, in the project's code, a first draft until a person has reviewed it) and renders the backend's sources, coverage and limits live — imported from `@/features/map/data`, not the main barrel, which would pull MapLibre (~1 MB) into a text page.
  - `*` → `NotFoundPage`.

## Data model

None, locally. This app holds no local persistence beyond browser `localStorage` for user preferences (theme, language, map projection, reduced-motion override, "has seen welcome"). Every piece of content data — events, view-count statistics — is fetched live from the backend gateway on every page load; there is no client-side cache layer beyond React's own render lifecycle and `localStorage`'s preference values.

## API design

**`src/services/api.ts`** — the single shared HTTP client. `BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api"` (deliberately `||`, not `??` — an unset env var arrives as an empty string at build time, which `??` would accept and point every request at the site root). A thin `request<T>()` wrapper sets `Content-Type: application/json`, throws a plain `Error("HTTP {status}: {statusText}")` on any non-ok response, otherwise resolves `response.json()`. Exposes `api.get/post/put/patch/delete`, all generic over `<T>`. No auth headers, no retry, no interceptor layer.

**`src/features/history/services/historyApi.ts`** — the only feature-level API module in the app; dashboard, map, archive, and century all consume backend data through it rather than each having their own (century through `fetchTimelineCountries` and `fetchCountryTimeline`, with `buildCountryTimelinePath` as the fetch key). Validates every response's envelope shape at runtime (checks the expected fields exist) before trusting `.data`, and throws a plain `Error` with a **hardcoded Italian message** (`'Risposta del backend non nel formato atteso'`) on a shape mismatch — a known gap, not yet routed through i18next keys.

Beyond the day feed, the same module is the client for the backend's content layer (backend commit `59a6a43`, documented in its README under "Guided paths and insights", "Discovery" and "Sources, and reporting a mistake"). One types file per part (`features/history/types/`: `editorial.ts`, `discovery.ts`, `transparency.ts`, re-exported by `types/index.ts`), one client function and, where there is a key to hold, one hook; the pages are in Routing above and the table says what feeds what:

| Part | Endpoint | Client | Hook |
|---|---|---|---|
| "Inizia da qui" | `GET /history/start-here` | `fetchStartHere` | `useStartHere` |
| Guided paths | `GET /history/paths`, `/paths/{slug}` | `fetchPaths`, `fetchPath(slug)` | `usePaths`, `usePath(slug)` |
| "Perché conta" | `GET /history/insights[?month=&day=]`, `/insights/{slug}` | `buildInsightsPath` + `fetchInsights`, `fetchInsight(slug)` | `useInsights(day?)`, `useInsight(slug)` |
| "Sorprendimi" | `GET /history/random` | `buildRandomEventPath` + `fetchRandomEvent` | none — it is asked for on a click, never cached, so there is no key to hold |
| "Nello stesso periodo" | `GET /history/same-period` | `buildSamePeriodPath` + `fetchSamePeriod` | `useSamePeriod(params)` |
| Sources and limits | `GET /history/sources` | `fetchSources` | `useSources` |
| "Segnala un errore" | `POST /history/reports` | `submitErrorReport` | none — a write |

Where each part is used: "Inizia da qui", the paths and the insights feed `PathsPage`, `PathPage` and `InsightPage`; `useInsightFinder` feeds the "Approfondimento disponibile" mark on the Archive's and the map panel's lists (events and the editors' picks only: a birth with the same year as an event does not have its insight) and the "Perché conta" link in the event popup; `fetchRandomEvent` feeds "Sorprendimi" through `useSurprise` in three places, each with the filters in force there (Il mio secolo: country and years; the Archive: its years; the map panel: the selected country), and an answer is forgotten when those filters change; `useSamePeriod` feeds `SamePeriod` under a country's timeline in Il mio secolo (not under an insight: events of other countries beside a story read as related to it) (a year field, parsed by `parseAroundYear`, asked of the backend only once it is a year), leaving out the country being looked at; the map has no year to compare, so it has none; `useSources` feeds `SourcesReport`, the live section of the methodology page; `submitErrorReport` feeds `ReportForm`, under every event popup, insight and path. `useOptionalInsight` lets the map ask for an insight only when a link names one. The event popup's "Perché conta" block (`WhyItMatters`) and a path stop's (`StopWhyItMatters`) share one excerpt, `buildExcerpt` + `InsightExcerpt` (set apart from Wikipedia's text around it by its own palette, all from the existing tokens: a `muted` (Haze) surface, a 2px `primary` rule on its edge, the part labels in `primary`; measured contrast on that surface is 12.0 / 7.5 / 7.1:1 for text / Shade / Exposure Blue in the light theme and 12.7 / 7.2 / 7.3:1 in the dark one): the three parts and at most three connections, never the caveats, the sources or the provenance, which only the insight's own page carries (a stop still shows its own place note, since the stop carries the place).

The hooks follow `useOnThisDay`: a `build…Path` function makes the fetch key, `useKeyedFetch` holds the race guard, and every hook returns `retry` (`useFetchOnce` returns it too now, for the keyless ones). Things a page built on this must keep, because the backend's contract says so: show `place.note` when `place.approximate` is true; show no review date, and never the word "verified", when `provenance.reviewedAt` is absent (every path and insight is a draft written with the help of an AI and none is reviewed: `EditorialNotice` says so at the top of each editorial page, and the Methodology page shows the real count of reviewed insights); show `notes` when there are any; show a date as exactly as `date.precision` says (`formatEditorialDate`: the bare year for `YEAR`, month and year for `MONTH`, because the month and day of a coarser date are placeholders, never facts); show the `notice` and `coverage.note` of a same-period answer at every coverage level, and present `SPARSE` as "poco materiale", not as "nothing happened"; an insight is matched to a day's events on `date.year`, since events carry no identifier. The editorial text is Italian only, whatever the UI language. `POST /reports` is rate-limited (429) and `api.ts` throws a plain `Error("HTTP 429: …")` for it, as for a 400, so a form tells them apart from the status in the message (as `describeFetchError` does for 5xx); and the app collects no personal data, so `ReportForm` sends only the target, the category and the message: the backend's optional `contact` email is left out of the `ErrorReport` type on purpose, so it cannot be sent by accident, and the form says it cannot reply. The Privacy page describes the form (what is sent, and that no name, email, identifier or address is stored with a report). `describeFetchError` reads a 404 ("the content doesn't exist") and a 429 ("too many requests") besides the network and 5xx cases; `ReportForm` reads a 400 as a report the backend refused as written.

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
