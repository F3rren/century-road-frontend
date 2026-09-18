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

Single-page web app (React + Vite + Tailwind + MapLibre GL). Three routes:

- **Mappa** (`/`, default route) — the core surface: interactive globe/map, click a country to see its events, "accadde oggi" (on-this-day) framing with a heatmap by event density, keyboard-accessible country picker, projection toggle (globe/flat).
- **Dashboard** (`/dashboard`) — currently placeholder/generic SaaS mock stats (total users, monthly revenue, active orders) with no relation to the product's actual content. Confirmed direction: replace with statistics about the historical-events dataset itself (e.g. events covered, countries represented, distribution by decade/category) — see Capabilities and Constraints.
- **Impostazioni** (`/settings`) — placeholder only ("coming soon"), no real settings implemented yet.

## Capabilities and Constraints

**Confirmed and built:**
- Interactive globe/map (MapLibre GL) with two projections (globe, mercator/flat).
- Country selection by map click or by an accessible `<select>` picker (keyboard/screen-reader equivalent of the map click).
- Event cards: year, title, description, category (war/politics/science/culture/disaster/economy), country.
- "Accadde oggi" framing: events matching today's month/day are highlighted; a per-country heatmap (event count, both color and a numeric label) shows density on the map.
- Light/dark theme (persisted, system-preference default, no flash on load).
- Keyboard shortcuts (1/2/3 route nav, `/` focuses the country picker), reduced-motion support.
- Responsive: nav sidebar and events panel become overlay drawers below the desktop breakpoint.

**Data constraint:** the historical events dataset (`MOCK_EVENTS`) is currently a static, hardcoded array in the frontend — specific real 20th-century events (verified dates/countries/descriptions), not fabricated filler, but not yet backed by any API. `src/services/api.ts` exists but is unused for this data. Any redesign work should not assume a backend that doesn't exist yet.

**Confirmed future direction, not yet implemented:** Dashboard's mock business-KPI content (`useDashboard` hook, 3 hardcoded stats) is confirmed to be replaced with real statistics derived from the events dataset. The computation itself doesn't exist yet — this is direction, not a shipped capability.

**Undecided:** Impostazioni has no defined scope yet — placeholder only.

## Brand Commitments

The name **"Century Road"** is the only fixed identity element. Palette, typography, tone, and every other visual decision are explicitly open for this redesign — confirmed by the user, not assumed.

## Evidence on Hand

- The historical events dataset itself (`src/features/map/data/mockEvents.ts`): specific, real, dated 20th-century events with country/category/description — real content, not placeholder text.
- No logo, marketing copy, screenshots, or other brand assets exist in the repo.

## Product Principles

1. **Discovery and lookup are equally first-class.** The interface must work for someone with no goal (exploring the globe) and someone with a precise question (a date, a country, an event), without either compromising the other.
2. **Geography and time are the two organizing axes.** Every event has both a place and a date; the design should keep both dimensions reachable together, not force a choice between a map view and a calendar/list view.
3. **Content clarity for learning.** Students and educators are a confirmed real audience — information must stay scannable and unambiguous even as the visual language changes; boldness should never come at the cost of comprehension.
4. **Statistics reflect the real dataset, not filler.** Anything shown as a number or metric (especially on Dashboard) must derive from the actual events data, never generic placeholder business metrics.
5. **One fixed identity element.** Only the name "Century Road" is binding; the rest of the visual world is being deliberately reimagined, not incrementally adjusted.

## Accessibility & Inclusion

Built and verified in prior work (not to be regressed by this redesign): WCAG AA contrast on all text/badge combinations, full keyboard operability (including a non-map equivalent for country selection), visible focus states, `prefers-reduced-motion` support, semantic headings and labeled landmarks, 44×44px minimum touch targets. Students/educators and general accessibility both make this a hard floor, not a nice-to-have.
