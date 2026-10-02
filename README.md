<div align="center">

# Century Road

**An interactive historical almanac — the 20th century, placed on a globe and on a calendar.**

[![Build](https://img.shields.io/github/actions/workflow/status/F3rren/century-road-frontend/ci.yml?branch=main&label=build&logo=github)](https://github.com/F3rren/century-road-frontend/actions/workflows/ci.yml)
[![CodeQL](https://img.shields.io/github/actions/workflow/status/F3rren/century-road-frontend/codeql.yml?branch=main&label=codeql&logo=github)](https://github.com/F3rren/century-road-frontend/actions/workflows/codeql.yml)
[![Dependency scan](https://img.shields.io/github/actions/workflow/status/F3rren/century-road-frontend/dependency-scan.yml?branch=main&label=dependencies&logo=github)](https://github.com/F3rren/century-road-frontend/actions/workflows/dependency-scan.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![React](https://img.shields.io/badge/react-18.3-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/typescript-5.5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/vite-^8-646CFF?logo=vite&logoColor=white)](https://vite.dev)
[![Tailwind CSS](https://img.shields.io/badge/tailwindcss-3.4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Vitest](https://img.shields.io/badge/tested_with-vitest-6E9F18?logo=vitest&logoColor=white)](docs/architecture.md#testing)

</div>

<img src="public/og-image.png" alt="Century Road — a wire-service newsroom archive of 20th-century history" width="100%">

## What this is

Century Road places historical events both **geographically** (an interactive globe) and **temporally** ("what happened today, across the century"). It's spatial-first, not list/timeline-first: the globe is the primary navigation surface, with a per-country event-density heatmap layered on top of the calendar framing. Every event comes live from Wikipedia's "On this day" feed, through a small Spring Boot backend — no mock data.

See [docs/PRD.md](docs/PRD.md) for the full product requirements, [PRODUCT.md](PRODUCT.md) for user personas and per-route detail, and [DESIGN.md](DESIGN.md) for the visual language ("The Wire-Service Newsroom Archive").

## Features

- **Interactive globe/map** (MapLibre GL), with a flat-projection toggle
- **Country selection** by map click or an accessible `<select>` picker — always both, never map-only
- **"Accadde oggi"** — today's events highlighted, with a heatmap of event density per country
- **Archivio** — every entry across all centuries for a chosen day, filterable by year range, entry type, and language, with text search
- **Il mio secolo** — one country's events from every day of the year, in time order and grouped by decade; the link keeps the choice, and the page prints cleanly or saves as PDF
- **Dashboard** — real statistics from the live dataset (never filler numbers), plus anonymous all-time view-popularity by day and country
- **4-language UI** (Italian default, English, German, French) via i18next
- **Light/dark theme**, persisted, no load flash
- **Full keyboard operability** and a WCAG AA accessibility floor — see [DESIGN.md's Accessibility section](DESIGN.md#accessibility)

## Tech stack

React 18.3.1 · Vite ^8.3.0 · TypeScript ^5.5.3 · Tailwind CSS ^3.4.10 · react-router-dom ^7 · i18next/react-i18next · maplibre-gl ^6.10.0 · lucide-react

Full rationale and folder structure: [docs/architecture.md](docs/architecture.md).

## Getting started

**Prerequisites**: Node 22.10+ (older Node 20 builds can `dev`/`build`/`lint` fine, but crash running tests — jsdom's own startup needs a `node:worker_threads` API only available from ~22.10 on), and the [backend](https://github.com/F3rren/century-road-backend) running locally (or `VITE_API_BASE_URL` pointed at a reachable gateway).

```bash
npm install
npm run dev
```

The dev server proxies `/api/*` to `BACKEND_URL` (default `http://localhost:8080`, the backend gateway's default port). See [.env.example](.env.example) for both environment variables and when each applies.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Vite dev server at `:5173` |
| `npm run build` | `tsc && vite build` — this is also the typecheck |
| `npm run lint` | `eslint --max-warnings 0` |
| `npm run test` | Unit/component tests (Vitest + React Testing Library) |
| `npm run test:coverage` | Same, with a coverage report — nothing gates on it yet |
| `npm run preview` | Serve the production build locally |

Unit and component tests exist; there's no E2E suite yet. CI runs lint, test, and build (typecheck) on every push and PR — see [docs/architecture.md#testing](docs/architecture.md#testing) for what's covered today and two real, minor quirks the first test pass turned up.

## Container images

For a platform that runs a ready-made image rather than building from source, CI publishes to
GitHub Container Registry, on every push to `main` or `develop`, and only once lint, test and
build have passed:

```
ghcr.io/f3rren/century-road-frontend
```

Every image carries two tags: the short commit id (`:1a2b3c4`), which never moves and is the one
to pin, and a moving one, `:latest` for what is on `main` and `:develop` for `develop`. A release
adds `:1.2.3` and `:1.2` (see below). Built from `Dockerfile.railway` (the compiled app served by
Caddy), so a published image is the one Railway itself used to build.

`VITE_API_BASE_URL` is baked into the compiled files at build time, so it is supplied to the CI
build as a repository variable (*Settings → Secrets and variables → Actions → Variables*, name
`VITE_API_BASE_URL`, value `https://<the gateway's public domain>/api`) — not a secret, since it
ends up in the public bundle either way.

The package inherits the repository's visibility, so on a public repository it can be pulled
without credentials.

To build the same image by hand:

```bash
docker build -f Dockerfile.railway --build-arg VITE_API_BASE_URL=https://<gateway>/api -t century-road-frontend:local .
```

### Releasing a version

A version is a tag on a commit of `main`. The image already exists by then: CI built and tested it
when the commit reached `main`. Releasing gives it its version tags and creates the GitHub
release. It builds nothing, so `:1.2.3` is byte for byte what was tested.

```bash
git checkout main && git pull
git tag -a v1.2.3 -m "v1.2.3"
git push origin v1.2.3
```

The **Release** workflow (`.github/workflows/release.yml`) then:

- checks that the commit is on `main` and that its CI run passed, and waits for that run if it is
  still going, so tagging right after the merge is fine;
- tags the image `:1.2.3` and `:1.2`. `:1.2` follows the newest patch: releasing an older one later
  does not pull it back;
- creates the GitHub release, with the image name and the notes GitHub generates from the pull
  requests merged since the previous release.

It refuses, and changes nothing, when the tag is not `vMAJOR.MINOR.PATCH` (no pre-releases yet),
the commit is not on `main`, its CI run failed, there is no image for the commit, or `:1.2.3` is
already published for a different image. Running it again for the same tag is harmless. In
production pin the full version (`:1.2.3`) or the commit tag: `:latest` and `:1.2` move.

**A tag that already exists**, made before this workflow, such as `v0.3.0`: Actions, Release, Run
workflow, and give the tag. *Dry run* is ticked by default: it does every check and prints what it
would do, and writes nothing. Untick it to do it.

The logic is `.github/scripts/release.sh`. `bash .github/scripts/release_test.sh` tests it with
`gh` and `docker` replaced by stand-ins, so it needs no network, and CI runs it on every push.

## Deployment

Three targets, chosen per environment — Railway (primary/production, from the image CI publishes
above, not built on Railway), Docker Compose (local full-stack dev alongside the backend), and
GitHub Pages (static-only fallback). Full detail, including every environment variable and the two
build-time safety guards (mixed-content and secret-leak prevention):
[docs/architecture.md#deployment-and-environments](docs/architecture.md#deployment-and-environments).

## Running it on Railway

The service is deployed from the image CI publishes (see [Container images](#container-images)),
not built on Railway.

*Add → Docker Image*, pointed at:

```
ghcr.io/f3rren/century-road-frontend:<version>
```

`<version>` is a released version, such as `0.3.0` (see
[Releasing a version](#releasing-a-version)). Prefer it to `latest`: a version never moves, so a
redeploy cannot change what runs. The short commit id from the package's list of tags does the
same for a commit that has not been released.

**Following releases automatically.** *Settings → Source → Configure Auto Updates*. With a full
version tag such as `:0.3.0` it offers **patches only** or **minor updates and patches**, and a
major version is never automatic. Choose *patches only*, with a maintenance window (the night one,
02:00–06:00 UTC): a `v0.3.1` release then reaches production by itself, and `v0.4.0` waits until
you change the tag by hand — same reasoning as the [backend's identical setup](https://github.com/F3rren/century-road-backend#running-it-on-railway).

The service needs no build-time variables — `VITE_API_BASE_URL` is already baked into the image
(see [Container images](#container-images)). *Settings → Networking → Generate Domain* gives it
its public address, which the backend's `gateway` service needs as its `FRONTEND_ORIGIN`, exactly,
with no trailing slash. Optionally set `HSTS_MAX_AGE` (seconds, default 300) once HTTPS has been
stable for a while.

## Related repository

The backend — 3 Spring Boot services behind a gateway — lives at [F3rren/century-road-backend](https://github.com/F3rren/century-road-backend).

## Documentation

| Doc | Covers |
|---|---|
| [PRODUCT.md](PRODUCT.md) | Personas, positioning, per-route capabilities and constraints |
| [docs/PRD.md](docs/PRD.md) | Full requirements: feature priority, acceptance criteria, NFRs, open questions |
| [DESIGN.md](DESIGN.md) | Design system — tokens, components, accessibility |
| [docs/architecture.md](docs/architecture.md) | Tech stack, API design, folder structure, deployment |
| [AGENTS.md](AGENTS.md) | Operational guidance for AI coding agents |

## License

[MIT](LICENSE) © 2026 Samuele Alessandro Di Silvestri
