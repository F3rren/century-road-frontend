# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Three audiences, confirmed as equally primary (not one dominant persona):

- **Curious explorers** — browse the globe with no fixed goal, discover events by chance.
- **Targeted lookups** — arrive wanting a specific fact: an event, a date, a country's history.
- **Students and educators** — use the app as a study or teaching aid for 20th-century history.

The design must support open-ended discovery and fast, precise lookup at once — neither persona is secondary to the other.

## Product Purpose

An interactive historical almanac of the 20th century: historical events are placed both geographically (on a globe/map) and temporally ("what happened today, across the century"). Success is a user finding or learning about an event easily, whether they arrived browsing or searching.

## Positioning

Inferred from the built mechanism (confirm/correct if this reads wrong): most "on this day in history" products are list- or timeline-first. Century Road is spatial-first — the globe is the primary navigation surface, with the calendar/"accadde oggi" framing layered on top via a heatmap of event density per country. A neighboring product with only a timeline or a search box could not truthfully claim the same mechanism.

## Operating Context

Single-page web app (React + Vite + Tailwind + MapLibre GL). Routes:

- **Mappa** (`/`, default route) — the core surface: interactive globe/map, click a country (or use the "vai a un paese" picker) to see its events, an "Accadde oggi" panel (every century the history API has for today, not just the 20th) with a heatmap by event density, keyboard-accessible country picker, projection toggle (globe/flat). The heatmap, the country picker, and the per-country event lists all read the same real, live history API — see Capabilities and Constraints for the geocoding heuristic behind country attribution.
- **Dashboard** (`/dashboard`) — real statistics computed from today's live history-API data (events covered, countries geocoded, time span, most-cited country), plus a link into Archivio.
- **Archivio** (`/archive`) — every entry the history API has for a chosen day, across all centuries, not limited to the 20th: filters for month/day, an optional year range, entry type (selected picks/events/births/deaths/holidays), language, and a text search over the results. Backed by the same history-service endpoint, and the same unrestricted range, as the map's "Accadde oggi" panel — Archivio adds the year-range, type and language filters, and the text search, on top of it.
- **Impostazioni** (`/settings`) — six real, working sections: Aspetto (theme, moved here from the navbar), Lingua e contenuti (UI language picker + a live date-format example), Mappa (default projection), Accessibilità (a reduced-motion override independent of the OS setting), Scorciatoie da tastiera (a read-only reference for the app's real keyboard shortcuts), Dati e privacy (a button to clear every preference this app stores, plus a link to Privacy). See Capabilities and Constraints for the i18n mechanism behind the language picker.
- **Privacy** (`/privacy`) and **Termini e condizioni** (`/terms`) — legal pages, reachable from the sidebar footer, not shortcut-numbered like the app's own sections. Prose stays Italian-only — not yet translated, see Capabilities and Constraints.

## Capabilities and Constraints

**Confirmed and built:**
- Interactive globe/map (MapLibre GL) with two projections (globe, mercator/flat).
- Country selection by map click or by an accessible `<select>` picker (keyboard/screen-reader equivalent of the map click).
- Event cards: year, title, description, category (war/politics/science/culture/disaster/economy), country.
- "Accadde oggi" framing: events matching today's month/day are highlighted; a per-country heatmap (color only, by design — see the legend's own text key) shows density on the map, computed from the same live data.
- Light/dark theme (persisted, system-preference default, no flash on load) — the toggle lives in Impostazioni, not the navbar.
- Keyboard shortcuts (1/2/3/4 route nav, `/` focuses the country picker, documented for the user in Impostazioni), reduced-motion respected automatically from the OS setting, with an independent manual override in Impostazioni for users who want it regardless of their OS setting.
- Responsive: nav sidebar and events panel become overlay drawers below the desktop breakpoint.
- UI internationalization (Italian default, English, German, French) via `react-i18next`, switchable in Impostazioni and persisted (`src/i18n`). Covers the app's chrome and functional pages (nav, Mappa, Dashboard, Archivio, Impostazioni, shared History components) — Privacy and Termini stay Italian-only prose for now, called out explicitly in Impostazioni. Date formatting (`formatEventDate`/`monthNames` in `src/lib/months.ts`) follows the chosen UI language via `Intl.DateTimeFormat`; country names (`Intl.DisplayNames`) do too. The Archive/Map "content language" (which language Wikipedia's on-this-day API returns article text in — API only supports Italian/English) defaults from the UI language (German/French fall back to English content) but stays independently overridable where it already was (Archivio's own toggle, unchanged in behavior).
- A real history-service backend (`src/features/history`), fetched over `src/services/api.ts`, driving the map's "Accadde oggi" panel, its heatmap and country picker, the Dashboard's stats, and the standalone Archivio page — all unrestricted by century; Archivio additionally filters by year range, entry type and language, and searches the results.
- Country attribution by geocoding, not a fixed field: history-API entries carry no country of their own, only optional coordinates on some of their linked Wikipedia articles. The map (`src/features/map/lib/geocodeEntries.ts`, `countryGeometry.ts`) takes the first linked article with coordinates and resolves it to a country via point-in-polygon lookup (`@turf/boolean-point-in-polygon`) against Natural Earth's 110m country boundaries; the heatmap counts only the `events` section (not `selected`, to avoid double-counting entries that appear in both) and the same country list (from that same boundary dataset, ~174 countries, named via `Intl.DisplayNames` in the active UI language) backs the "vai a un paese" picker.

**Known limitations of the geocoding heuristic:** an article's coordinates describe the article's subject, not necessarily where the historical event took place, and only the *first* coordinate-bearing linked article is used, so this is an approximation, not a ground truth. On a typical day roughly half of entries have no geocodable linked article at all and are simply not attributed to any country (not hidden — they still appear in the day's full list, just uncounted on the map). Natural Earth's 110m resolution is simplified for rendering, not surveyed for geocoding: a coordinate near a border can resolve to the neighboring country, and some small island nations have no shape at this resolution and can never be matched. A higher-resolution boundary dataset was considered and rejected — the file-size cost outweighs the benefit for a feature that is already presented to the user as approximate (see the heatmap legend's caveat).

**Undecided:** nothing currently open — Impostazioni's six sections (see Operating Context) are all real and working. Future settings ideas would need their own scoping pass.

## Brand Commitments

The name **"Century Road"** is the only fixed identity element. Palette, typography, tone, and every other visual decision are explicitly open for this redesign — confirmed by the user, not assumed.

## Evidence on Hand

- The real history-service backend, queried live for every page (map, dashboard, archive) — no mock or placeholder dataset remains in the frontend.
- No logo, marketing copy, screenshots, or other brand assets exist in the repo.

## Product Principles

1. **Discovery and lookup are equally first-class.** The interface must work for someone with no goal (exploring the globe) and someone with a precise question (a date, a country, an event), without either compromising the other.
2. **Geography and time are the two organizing axes.** Every event has both a place and a date; the design should keep both dimensions reachable together, not force a choice between a map view and a calendar/list view.
3. **Content clarity for learning.** Students and educators are a confirmed real audience — information must stay scannable and unambiguous even as the visual language changes; boldness should never come at the cost of comprehension.
4. **Statistics reflect the real dataset, not filler.** Anything shown as a number or metric (especially on Dashboard) must derive from the actual events data, never generic placeholder business metrics.
5. **One fixed identity element.** Only the name "Century Road" is binding; the rest of the visual world is being deliberately reimagined, not incrementally adjusted.

## Accessibility & Inclusion

Built and verified in prior work (not to be regressed by this redesign): WCAG AA contrast on all text/badge combinations, full keyboard operability (including a non-map equivalent for country selection), visible focus states, `prefers-reduced-motion` support, semantic headings and labeled landmarks, 44×44px minimum touch targets. Students/educators and general accessibility both make this a hard floor, not a nice-to-have.
