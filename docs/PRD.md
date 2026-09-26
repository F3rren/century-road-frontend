# PRD — Century Road

> This PRD covers the whole system (frontend + backend). Product vision, personas, and per-route UX detail already live in [PRODUCT.md](../PRODUCT.md) and aren't re-pasted here — this document adds what that one structurally can't hold: system-wide constraints, a prioritized feature list, acceptance criteria, non-functional requirements, and open questions. Visual language: [DESIGN.md](../DESIGN.md). Technical shape: this repo's [architecture.md](architecture.md) and the backend's [architecture.md](https://github.com/F3rren/century-road-backend/blob/main/docs/architecture.md).

## Overview

**Century Road** is an interactive historical almanac: it places 20th-century historical events both geographically (on a globe/map) and temporally (what happened on today's date, across the century), backed by a live Wikipedia "on this day" feed proxied through a small Spring Boot backend. It's spatial-first, not list/timeline-first — most "on this day" products lead with a calendar or search box; this one leads with a globe, with the calendar/date framing layered on top via a per-country event-density heatmap.

## Goal and problem

Most "on this day in history" products treat geography as an afterthought, if they surface it at all — a list of dates with no sense of *where*. Century Road's bet is that place and time are equally organizing axes for historical curiosity: a user browsing with no fixed goal should be able to spin a globe and stumble onto something, and a user with a precise question (a date, a country) should get there just as fast. See `PRODUCT.md`'s Product Purpose and Positioning for the full framing.

## Target users

Three co-primary personas (not one dominant persona with two afterthoughts) — full detail in `PRODUCT.md`'s Users section: **curious explorers** (open-ended browsing), **targeted lookups** (arrive wanting a specific fact), **students and educators** (study/teaching aid).

## Main user flows

1. **Open-ended discovery** — land on the globe (`/`) → spin/click a country → see today's events attributed to it (or the accessible `<select>` picker as a keyboard/screen-reader equivalent of the same click).
2. **Targeted lookup by date** — open Archivio (`/archive`) → filter by month/day, optionally a year range, entry type, and language → text-search the results.
3. **Understanding the dataset at a glance** — open Dashboard (`/dashboard`) → see today's real event stats (count, countries geocoded, time span, most-cited country) and the all-time most-viewed days/countries → jump into Archivio from there.
4. **Adjusting how the app behaves** — open Impostazioni (`/settings`) → change UI language (4 available), theme, default map projection, or the reduced-motion override — six real sections, no placeholders.
5. **First-ever visit** — a new visitor is routed to `/welcome` (a chrome-free threshold screen) before ever seeing the app shell; every later visit lands straight on the globe.

There is **no login/account flow** in the frontend today — see Open Questions.

## Feature list (MoSCoW)

This is a first-draft prioritization derived from what `PRODUCT.md` already calls "confirmed and built" — it needs the project owner's review and re-prioritization, not just mine.

**Must have** (shipped, confirmed working):
- Interactive globe + flat-map projection toggle (MapLibre GL)
- Country selection by map click or accessible picker
- "Accadde oggi" panel with per-country event-density heatmap
- Dashboard: today's real event stats + all-time day/country view popularity
- Archivio: full-range filtering (month/day, year range, type, language) + text search
- 6 working Impostazioni sections (theme, language, map projection, accessibility, keyboard shortcuts reference, data/privacy controls)
- 4-language UI i18n (IT default, EN, DE, FR)
- Light/dark theme, persisted, no load flash
- WCAG AA accessibility floor (see Non-Functional Requirements)
- Anonymous, aggregate view tracking (day + country), with no visitor identifier

**Should have** (clearly adjacent, not yet built):
- Surfacing the view-popularity trend more prominently than the current Dashboard panel (e.g. a dedicated "most read" surface)
- Translated Privacy/Termini pages (currently Italian-only by design, not yet revisited)

**Could have** (speculative, needs a scoping decision before it's real):
- A login/account surface wired to the already-fully-built `auth-service` (see Open Questions — nothing today indicates this is planned, deprioritized, or intentionally out of scope)
- Higher-resolution country boundaries for the geocoding heuristic (explicitly considered and rejected once already — see `PRODUCT.md`'s Known Limitations — would need a fresh cost/benefit case to reopen)

**Won't have (now)**:
- User accounts, saved searches, or any personalization requiring the backend's auth beyond what's already built for a not-yet-connected admin surface

## Acceptance criteria

Derived from `PRODUCT.md`'s own already-stated constraint language, not invented fresh:

- **Country selection** — must be reachable both by map click and by keyboard/screen-reader via the `<select>` picker; both paths must resolve to the identical country/events result.
- **On-this-day data** — every number shown (Dashboard, Archivio result counts) must derive from the live backend response for that exact query; no filler/placeholder values, ever (`PRODUCT.md` Product Principle #4).
- **i18n coverage** — app chrome + all 5 functional routes fully translated in all 4 languages; Privacy/Termini may remain Italian-only, but that must be stated to the user, not silently inconsistent.
- **Accessibility** — WCAG AA contrast on every text/badge pairing, full keyboard operability with no map-only interaction, visible focus states, `prefers-reduced-motion` respected automatically plus an independent manual override, 44×44px minimum touch targets. Already built and verified; must not regress.
- **View tracking** — a country-view POST or a day-view increment must never block, delay, or error out the page it's attached to, even if the tracking write itself fails (fire-and-forget by design).

## Technical constraints

| | |
|---|---|
| Frontend stack | React 18.3.1, Vite ^8.3.0, TypeScript ^5.5.3, Tailwind ^3.4.10, react-router-dom ^7, i18next/react-i18next, maplibre-gl. No test framework currently. |
| Backend stack | Spring Boot 3.3.4, Java 21, 3 independent Maven services (no reactor build), PostgreSQL with per-service schema isolation, Flyway. |
| Hosting | Railway (primary, both frontend and backend), Docker Compose (local full-stack dev), GitHub Pages (frontend-only static fallback). |
| External dependency | Wikipedia's "On this day" REST API — the entire event dataset originates there; the backend caches (6h fresh, 7d stale-serve) and rate-limits itself as "a good neighbour" per Wikimedia's own policy. |

## Non-functional requirements

- **Performance** — `history-service` caches Wikipedia responses (Caffeine, one entry per language+day, single-flight loading) and wraps upstream calls in a circuit breaker/retry/bulkhead (max 3 concurrent, matching Wikipedia's own etiquette ask). Frontend build-time guards (`vite.config.ts`) catch mixed-content and secret-leak mistakes before they ship.
- **Security** — login rate-limited (5/min per `ip|email`), BCrypt password hashing, JWT (HS256) + single-use rotating refresh tokens (SHA-256 hashed at rest), CORS locked to one explicit frontend origin (never a wildcard), stateless sessions with CSRF disabled (bearer-token auth only). Postgres and observability tooling (Prometheus/Grafana) are never publicly exposed, even in production.
- **Accessibility** — see Acceptance Criteria above; treated as a hard floor per `PRODUCT.md`, not a nice-to-have.
- **Scalability** — each backend service is independently deployable and stateless at the request layer (JWT, not server sessions); `history-service`'s own database load is bounded by distinct (language, day) pairs requested, not by request volume, because of its caching design.

## Success metrics

Scoped deliberately to what's actually instrumented today, per `PRODUCT.md` Product Principle #4 ("statistics reflect the real dataset, not filler") — this section does **not** invent generic SaaS growth metrics that nothing in the stack currently measures:

- Anonymous aggregate day-view counts (`history.day_views`) and country-view counts (`history.country_views`) — which calendar days and which countries draw the most attention, over time.
- Beyond these two counters, there is currently no analytics/instrumentation layer (no session tracking, no funnel/retention tooling). Any additional success metric is an open question pending a deliberate analytics-tooling decision — not something to back into by instrumenting more without that conversation happening first.

## Open questions

1. **Frontend auth/login** — `auth-service` is fully built (JWT issuing, refresh rotation, admin user CRUD), but nothing in the frontend calls it: no login route, no auth UI, no token storage anywhere in `src/`. Is this planned and simply not yet built, deliberately deprioritized, or is `auth-service` intended purely to back a future admin surface that isn't this public-facing app at all?
2. **Success metrics beyond the two view counters** — see above; needs a decision on whether/how to add analytics, not an assumption baked into this document.
3. **The MoSCoW list above** — first draft, needs the project owner's sign-off, especially the Could/Won't split.
4. **Should Privacy/Termini translation actually happen soon**, or is Italian-only an accepted permanent state for the legal pages specifically (as opposed to everywhere else, which is fully localized)?
