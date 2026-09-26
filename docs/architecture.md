# Architecture — Century Road Frontend

> System context: this is the frontend half of Century Road. The backend (3 Spring Boot services behind a gateway) lives in a sibling repository, [github.com/F3rren/century-road-backend](https://github.com/F3rren/century-road-backend), which has its own `architecture.md`. Product context lives in [PRODUCT.md](../PRODUCT.md); visual language in [DESIGN.md](../DESIGN.md); operational guidance for AI agents in [AGENTS.md](../AGENTS.md).

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

**No test framework exists** — zero test files, zero test dependencies (`vitest`, `jest`, `@testing-library/*`, `playwright` are all absent). This is a stated fact about the current codebase, not an oversight to silently "fix" by inventing a test setup unasked.

## General architecture

A single-page app, feature-folder organized. Everything under `src/features/<name>/` owns its own `components/`, `hooks/`, `lib/`, `services/`, `types/` as needed — cross-feature imports go through each feature's `index.ts` barrel, never reaching into another feature's internals directly.

```
src/
├── pages/          route-level components — thin, compose feature components
├── features/
│   ├── welcome/    first-visit threshold screen (dateline-typing animation, historical photo carousel)
│   ├── map/        the core surface — MapLibre globe/map, country geocoding, events side panel
│   ├── history/    shared "on this day" domain layer — consumed by map, dashboard, archive
│   ├── dashboard/  real-data statistics (today's events + all-time view-popularity)
│   ├── archive/    the standalone filterable/searchable day browser
│   ├── settings/   6 real settings sections
│   ├── legal/       shared component kit for the two legal pages
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
  - `index: true` → `IndexRoute` — not a page itself, a gate: `!hasSeenWelcome()` redirects to `/welcome`, otherwise renders `MapPage` directly (the same "default unless a preference says otherwise" shape the app uses for theme/language/projection).
  - `dashboard`, `archive`, `settings`, `privacy`, `terms` → their respective pages.
  - `*` → `NotFoundPage`.

## Data model

None, locally. This app holds no local persistence beyond browser `localStorage` for user preferences (theme, language, map projection, reduced-motion override, "has seen welcome"). Every piece of content data — events, view-count statistics — is fetched live from the backend gateway on every page load; there is no client-side cache layer beyond React's own render lifecycle and `localStorage`'s preference values.

## API design

**`src/services/api.ts`** — the single shared HTTP client. `BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api"` (deliberately `||`, not `??` — an unset env var arrives as an empty string at build time, which `??` would accept and point every request at the site root). A thin `request<T>()` wrapper sets `Content-Type: application/json`, throws a plain `Error("HTTP {status}: {statusText}")` on any non-ok response, otherwise resolves `response.json()`. Exposes `api.get/post/put/patch/delete`, all generic over `<T>`. No auth headers, no retry, no interceptor layer.

**`src/features/history/services/historyApi.ts`** — the only feature-level API module in the app; dashboard, map, and archive all consume backend data through it rather than each having their own. Validates every response's envelope shape at runtime (checks the expected fields exist) before trusting `.data`, and throws a plain `Error` with a **hardcoded Italian message** (`'Risposta del backend non nel formato atteso'`) on a shape mismatch — a known gap, not yet routed through i18next keys.

The backend's response envelope (`ApiEnvelope<T>`, shared shape across both repos): `{ success, error?, message?, userMessage?, data?, timestamp, sessionId }`. See the backend's `architecture.md` for the authoritative definition.

## Key technical decisions

Two build-time guards live in `vite.config.ts` and fail the *build*, not the runtime, on purpose — catching a class of mistake as an explicit error message instead of a silent production failure:

- **`assertNoSecretsInBundle`** — refuses to build if any `VITE_*` environment variable name looks secret-shaped (matches `/SECRET|TOKEN|PASSWORD|PASSWD|PRIVATE|CREDENTIAL|API_?KEY|ACCESS_?KEY/i`). Every `VITE_*` variable is compiled into the bundle every visitor downloads, so a secret there is published, not hidden.
- **`assertHttpsApiBase`** — in a production build, refuses to proceed if `VITE_API_BASE_URL` isn't `https://` or a same-origin relative path. A page served over HTTPS calling an `http://` API gets silently blocked by the browser as mixed content; this turns that into a clear build-time error instead of every API call failing mysteriously in production.

A third, unrelated Vite plugin (`maplibreWorkerAssets`) exists because maplibre-gl resolves its worker file at runtime via a relocatable relative URL that Vite's static analysis can't follow — the plugin copies the two files maplibre expects to find beside the bundle at build time, and `optimizeDeps.exclude: ["maplibre-gl"]` prevents the dev server's dependency pre-bundling from breaking the same relative-path resolution in dev.

## Deployment and environments

Three real deploy targets exist in this repo, chosen per environment:

| Target | How | Notes |
|---|---|---|
| **Railway** (primary/production) | `Dockerfile.railway` + Caddy, `RAILWAY_DOCKERFILE_PATH=Dockerfile.railway` | Production URL: `https://century-road-frontend-production.up.railway.app`. `VITE_API_BASE_URL=https://<gateway's public domain>/api` set as a build-time Railway variable — the backend's gateway `FRONTEND_ORIGIN` must match this app's exact public origin. |
| **Docker Compose** (local full-stack dev) | `Dockerfile`, `dev` stage: `node:20-alpine`, `npm run dev -- --host 0.0.0.0`; `prod` stage: `nginx:1.27-alpine` serving `dist/` | For running frontend + backend together via the backend's `compose-dev.yml`-adjacent workflow. |
| **GitHub Pages** (optional/static) | `VITE_BASE_PATH` env var sets Vite's `base`, consumed by the router's dynamic `basename` | Only the Pages workflow sets this; local dev and a custom domain both want a plain `/`. |

Environment variables:
- **`BACKEND_URL`** (dev only, default `http://localhost:8080`) — where the Vite dev server proxies `/api/*` requests. Never reaches the browser.
- **`VITE_API_BASE_URL`** (production only) — baked into the bundle at build time; must end with `/api`; validated by the two build guards above.

CI (`.github/workflows/`): `ci.yml` runs `npm run lint` and `npm run build` only (type-checking is folded into `build` via `tsc && vite build`; no test step exists, since no test suite does). Also present: `codeql.yml` (weekly + on push/PR), `dependency-review.yml` (PR-only, fails on `high` severity), `dependency-scan.yml` (weekly + on push/PR), and a weekly `dependabot.yml` targeting `develop`.
