---
version: 1
slug: "src-pages-mappage-tsx"
primary_target: "src/pages/MapPage.tsx"
related_targets: ["src/features/map/components/EventsPanel.tsx","src/features/map/components/MapView.tsx","src/features/map/components/HeatLegend.tsx","src/components/layout/AppLayout.tsx"]
---

## Scope

Mode: Operate. The visitor finds and reads events by place: what happened today, and where. Audience: curious explorers, targeted lookups, students and educators, all equally primary. One of the product's two doors (the day); the other is Il mio secolo (the country), reachable from here.

## Direction contract

THESIS: The map is the day's cyanotype exposure: each country darkens with the events it received today, and a country leads on to its whole year. Refuses the default interactive-map kit of red pins, a floating glass panel and colour-coded categories.

OWN-WORLD: Paper and Prussian blue, Exposure blue for links and grains; fixer yellow only for the selected country and the active control on a Prussian plaque. Literata years lead every row in a margin column; Atkinson Hyperlegible for labels and controls. Flat Prussian plates over the paper map (land and sea alike, country hairlines, place names only from zoom 4), hairline rules, no shadow.

STORY: The visitor sees where today's history happened at a glance, picks a country by clicking or by the picker, reads its events year-first, opens one to read the whole entry, or follows the country into its whole year.

FIRST VIEWPORT: Desktop: a 320px panel on the left (today's date, the country picker, today's events year-first), the globe filling the rest; the legend plate top-left of the map, the projection toggle top-right, zoom bottom-right. Mobile: the globe full-bleed, an "Accadde oggi, {date}" button bottom-left, above the map credits, opening the panel as a drawer; a link with ?country= opens on that country, drawer open.

FORM: Cyanotype print, option 1 of 3 offered in the rebrand (cyanotype print, hourglass sand, herbarium), chosen by the user. No concept-seed roll was run; seed key: none.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.

## Unresolved decisions

- None. The mobile drawer's double heading was settled in the 2026-10-04 polish: one header with the drawer's only X, and "Tutti i paesi" as a text button in a country's view.
