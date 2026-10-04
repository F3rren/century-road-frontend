# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Three audiences, confirmed as equally primary (not one dominant persona):

- **Curious explorers** — browse the globe with no fixed goal, discover events by chance.
- **Targeted lookups** — arrive wanting a specific fact: an event, a date, a country's history.
- **Students and educators** — use the app as a study or teaching aid for history.

The design must support open-ended discovery and fast, precise lookup at once — neither persona is secondary to the other.

## Product Purpose

An interactive historical almanac across every century, with no century privileged over another: the events Wikipedia records for each day of the year, from antiquity to now, placed both geographically (on a globe/map, and per country) and temporally ("what happened on this day", "what happened in this country, across the year"). Success is a user finding or learning about an event easily, whether they arrived browsing or searching. "Il mio secolo" opening on 1901–2000 is an interface default, not a scope of the product.

## Positioning

Two ways into the same data, confirmed by the user: **the day** and **the country**. The map answers "what happened today, and where" — the globe is the navigation surface, with a heatmap of today's events per country. "Il mio secolo" answers "what happened in this country, on any day of the year" — a per-country timeline built from a nightly country index. Both use one rule to place an event in a country, so the two doors agree. Most "on this day" products are list- or timeline-first and stop at the day; a neighboring product with only a timeline or a search box could not truthfully claim this pairing.

## Operating Context

Single-page web app (React + Vite + Tailwind + MapLibre GL) over a Spring Boot backend in a sibling repository. Routes:

- **Welcome** (`/welcome`) — the first-visit threshold, shown once; then the map is the default route.
- **Mappa** (`/`) — the core surface: interactive globe/map, click a country (or use the "Vai a un paese" picker) to see its events, an "Accadde oggi" panel (every century the history API has for today) with a heatmap by event density, projection toggle (globe/flat). A country with no events today links to its whole year in "Il mio secolo".
- **Dashboard** (`/dashboard`) — today's real figures written as a sentence (events, span, countries, most-cited country), today's events by century (each century opens the Archive narrowed to it), and the all-time most viewed days and countries (anonymous aggregate counts).
- **Archivio** (`/archive`) — every entry the history API has for a chosen day, across all centuries: filters for month/day, an optional year range, entry type (selected picks/events/births/deaths/holidays), language, and a text search over the results.
- **Il mio secolo** (`/century`) — pick a country and read its events from every day of the year, oldest first, grouped by decade, with a chart of events per decade. The choice lives in the URL (`?country=IT&from=1901&to=2000`) so the link can be shared; each event opens the Archive on its day and year; the page prints or saves as PDF.
- **Impostazioni** (`/settings`) — six working sections: Aspetto (theme), Lingua e contenuti (UI language + a live date-format example), Mappa (default projection), Accessibilità (a reduced-motion override independent of the OS setting), Scorciatoie da tastiera (read-only reference), Dati e privacy (clear every stored preference, link to Privacy).
- **Reference pages** — Come si usa (`/guide`), Dietro i dati (`/methodology`, with a live report of today's data), Crediti e contatti (`/credits`); and the legal pages Privacy (`/privacy`) and Termini e condizioni (`/terms`). All are linked from the sidebar's lower group, not shortcut-numbered.

## Capabilities and Constraints

**Confirmed and built:**
- Interactive globe/map (MapLibre GL) with two projections (globe, mercator/flat).
- Country selection by map click or by an accessible `<select>` picker (keyboard/screen-reader equivalent of the map click).
- Event rows show what the history API provides and nothing invented: the year, the event's text as Wikipedia writes it, and how many articles it links. A popup shows the full entry: the date with its weekday (from 1583, when the Gregorian count applies) and how long ago it was, the text, and the linked articles with their pictures and image credits. The API gives no category, importance or country of its own.
- "Accadde oggi" framing: today's events listed by year; a per-country heatmap (color only, by design — see the legend's own text key) shows density on the map.
- **Country index (backend):** a nightly pass at 00:00 UTC reads all 366 days in Italian and English and stores each event that has a year and a country, placed with the same rule and the same Natural Earth shapes as the map (`GET /api/history/countries`, `/countries/{code}/timeline`). Each edition stands on its own, with no fallback between them; the index can be a day behind Wikipedia. It feeds "Il mio secolo".
- Light/dark theme (persisted, system-preference default, no flash on load); the toggle lives in Impostazioni.
- Keyboard shortcuts (1–5 route nav: Mappa, Dashboard, Archivio, Il mio secolo, Impostazioni; `/` focuses the country picker), documented in Impostazioni; reduced motion respected from the OS setting, with an independent manual override.
- Responsive: nav sidebar and events panel become overlay drawers below the desktop breakpoint.
- UI internationalization (Italian default, English, German, French) via `react-i18next`, switchable and persisted. Privacy and Termini stay Italian-only prose, called out on those pages and in Impostazioni. Dates (`src/lib/months.ts`) and country names (`Intl.DisplayNames`) follow the UI language. The "content language" (the language Wikipedia's text comes in — Italian or English only) defaults from the UI language (German/French fall back to English) and stays overridable in Archivio.
- A failed request is explained in plain words in the UI language (no connection, service unavailable, unexpected answer) with what to do, never the browser's or server's technical text.
- Country attribution by geocoding, not a fixed field: the first linked article with coordinates decides, resolved by point-in-polygon against Natural Earth's 110m boundaries (in the browser for today's map, `src/features/map/lib/geocodeEntries.ts`; on the server for the country index, with the same file and rule). The heatmap counts only the `events` section (not `selected`, which repeats some of them).

**Known limitations of the geocoding heuristic:** an article's coordinates describe the article's subject, not necessarily where the historical event took place, and only the *first* coordinate-bearing linked article is used, so this is an approximation, not a ground truth. On a typical day roughly half of entries have no geocodable linked article and are not attributed to any country (they still appear in the day's full list). Natural Earth's 110m resolution is simplified for rendering, not surveyed for geocoding: a coordinate near a border can resolve to the neighboring country, and some small island nations have no shape at this resolution. A higher-resolution dataset was considered and rejected — the file-size cost outweighs the benefit for a feature already presented as approximate.

**Undecided:** nothing currently open.

## Brand Commitments

- **Name:** "Grains of History" (formerly Century Road), confirmed by the user. It stays in English in every UI language. The repository, container image and browser storage-key names keep the old name on purpose; renaming the storage keys would reset every visitor's preferences.
- **Tagline:** "Explore the past, one story at a time", translated per UI language ("Esplora il passato, una storia alla volta", and the German and French equivalents).
- The visual identity chosen with the user in the rebrand is recorded in DESIGN.md.

## Evidence on Hand

- The real history-service backend, queried live for every page, plus the nightly country index — no mock or placeholder dataset remains in the frontend.
- Brand assets: the hourglass-of-grains mark and wordmark (`src/components/ui/Wordmark.tsx`), the favicon (`public/favicon.svg`) and the social preview image (`public/og-image.png`).
- Real historical photography from Wikimedia Commons (the Welcome page's filmstrip) and one 1872 plate for the 404 page (`public/404-surprise.jpg`), each credited.
- No testimonials, customers, usage figures beyond the anonymous view counters, or marketing copy exist; none may be invented.

## Product Principles

1. **Discovery and lookup are equally first-class.** The interface must work for someone with no goal (exploring the globe) and someone with a precise question (a date, a country, an event), without either compromising the other.
2. **Geography and time are the two organizing axes.** Every event has both a place and a date; the design should keep both dimensions reachable together, not force a choice between a map view and a calendar/list view.
3. **Content clarity for learning.** Students and educators are a confirmed real audience — information must stay scannable and unambiguous; boldness should never come at the cost of comprehension.
4. **Statistics reflect the real dataset, not filler.** Anything shown as a number or metric must derive from the actual events data, never generic placeholder metrics.
5. **The day and the country lead into each other.** The map, "Il mio secolo" and the Archive read the same data with the same country rule, so an event reached through one door should be reachable from the others.

## Accessibility & Inclusion

Built and verified, not to be regressed: text contrast held at 7:1 (WCAG AAA) on every text pairing in both themes since the 2026-09-25 pass, with WCAG AA as the floor for everything else; full keyboard operability (including a non-map equivalent for country selection) with a visible focus ring on every surface, the fixed dark sidebar and map overlays included; `prefers-reduced-motion` support plus an in-app override; semantic headings and labeled landmarks; 44×44px minimum touch targets. Students/educators and general accessibility both make this a hard floor, not a nice-to-have.
