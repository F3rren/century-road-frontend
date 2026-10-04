---
name: Grains of History
description: Explore the past, one story at a time. A cyanotype almanac of every century, by day and by country.
colors:
  prussian-blue: "#0E2A47"
  exposure-blue: "#1F4E79"
  paper: "#F4F6F3"
  print-white: "#FBFCFA"
  haze: "#E4EAEE"
  haze-line: "#C5CFD8"
  shade: "#394A5B"
  fixer-yellow: "#E2B44A"
  oxblood: "#8A2B1F"
  washed-green: "#2C5737"
  negative: "#0A1726"
  negative-print: "#0F2033"
  negative-haze: "#13273D"
  negative-line: "#24394F"
  pale-print: "#E6ECF1"
  exposure-light: "#8DB8E0"
  shade-light: "#A3B5C6"
  oxblood-light: "#EFA08F"
  washed-green-light: "#93C9A2"
  board-line: "#25425F"
  heat-low: "#5F8BB8"
  country-line: "#7A8C9E"
typography:
  display:
    fontFamily: "Literata, Georgia, ui-serif, serif"
    fontSize: "2rem"
    fontWeight: 600
    lineHeight: "2.375rem"
    letterSpacing: "-0.015em"
  headline:
    fontFamily: "Literata, Georgia, ui-serif, serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: "1.75rem"
  numeral:
    fontFamily: "Literata, Georgia, ui-serif, serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: "1.5rem"
    letterSpacing: "-0.01em"
    fontFeature: "tnum"
  story:
    fontFamily: "Literata, Georgia, ui-serif, serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.375
  body:
    fontFamily: "Atkinson Hyperlegible, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.625
  label:
    fontFamily: "Atkinson Hyperlegible, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 700
    lineHeight: "1.125rem"
    letterSpacing: "0em"
rounded:
  none: "0"
  control: "3px"
spacing:
  row: "12px"
  page: "24px"
  section: "32px"
components:
  button-primary:
    backgroundColor: "{colors.exposure-blue}"
    textColor: "{colors.paper}"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: "44px"
  button-outline:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.prussian-blue}"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: "44px"
  button-overlay-active:
    backgroundColor: "{colors.fixer-yellow}"
    textColor: "{colors.prussian-blue}"
    rounded: "{rounded.control}"
    height: "44px"
  field:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.prussian-blue}"
    rounded: "{rounded.none}"
    padding: "6px 8px"
    height: "44px"
  sidebar:
    backgroundColor: "{colors.prussian-blue}"
    textColor: "{colors.pale-print}"
    width: "240px"
  map-plaque:
    backgroundColor: "{colors.prussian-blue}"
    textColor: "{colors.pale-print}"
    rounded: "{rounded.none}"
---

# Design System: Grains of History

## Overview

**Creative North Star: "La stampa cianotipica"** (the cyanotype print)

Grains of History is printed, not painted. A cyanotype turns paper Prussian blue where light reaches it, and that one chemistry carries the whole system. Text, the sidebar board and the deepest heat are Prussian blue on a cold white paper. The dark theme is the plate's negative, not a "night mode". Historical photographs are toned blue as prints. The one moving gesture is an image developing, paper turning to blue. History arrives in grains: every event is one, in the hourglass mark, in the charts, in the name.

Density follows the reader. Reading surfaces (the guide, the methodology, the legal pages, an event's popup) hold a 65-character column of Literata and Atkinson Hyperlegible, with a contents rail in the margin. Tool surfaces (the map panel, the Archive's filters, Settings) are compact and ruled. The year is the fact that leads every list.

The system rejects the look it replaced, confirmed with the user in the rebrand: no warm cream with a red accent, no all-caps tracked labels, no monospace datelines, no middle-dot meta strings, no boxed card kit. It is quiet everywhere except where a print develops.

**Key Characteristics:**
- One blue family carries everything; fixer yellow is the only warm colour, and only as a fill or a ring on Prussian.
- Every text pairing clears 7:1 in both themes.
- Literata for what is read (titles, years, events), Atkinson Hyperlegible for what is operated (labels, controls, figures in prose).
- Flat: depth comes from tonal surfaces and hairlines, never shadow.
- Grains, the round dot, are the system's one recurring form: the mark, the charts.
- One authored motion: `develop`. Everything else appears without travel, except what answers the reader's own action: a drawer, the map's camera.

## Colors

A cold, single-hue cyanotype palette: Prussian blue on white paper by day, pale print on the negative by night, with one warm fixer yellow for "selected" and "focused" on the blue surfaces.

### Primary
- **Exposure Blue** (light theme; **Exposure Light** in dark): links, primary button fills, the active segment of a toggle, grains in the charts. As text it is 8.0:1 on Paper, and Exposure Light is 8.7:1 on Negative.
- **Prussian Blue**: body and heading text in the light theme, the sidebar board and map plaques in both themes, and the deepest step of the heat scale.

### Secondary
- **Fixer Yellow**: the selected country on the map, the active control on a Prussian plaque, the sidebar's active link and its focus ring. It is 7.5:1 against Prussian, and it carries Prussian text when it is a fill.

### Neutral
- **Paper**: page background, light theme. A cold white, never cream.
- **Print White**: raised surfaces such as filter panels, light theme.
- **Haze**: muted fills (hover, secondary surfaces), light theme.
- **Haze Line**: every border and rule, light theme.
- **Shade**: secondary text (descriptions, metadata, dates), light theme. It is 7.5:1 even on Haze.
- **Negative / Negative Print / Negative Haze / Negative Line**: the same four roles in the dark theme.
- **Pale Print**: text in the dark theme and on every Prussian surface.
- **Shade Light**: secondary text, dark theme.
- **Board Line**: the sidebar's own rules.

### Semantic
- **Oxblood** (light) / **Oxblood Light** (dark): destructive actions and error text only.
- **Washed Green** (light) / **Washed Green Light** (dark): success only.

### Map
- **Paper** is the map's ground, land and sea alike; **Haze** surrounds the globe, so the sphere keeps its edge.
- **Country Line**: every country's border, a hairline on the paper. At 3.2:1 the geography stays readable and quieter than any heat step.
- **Heat Low → Exposure Blue → Prussian Blue**: today's events per country, as exposure. A country with more events is more exposed, so it is darker. Each step is printed opaque with a 1px Prussian outline, and clears 3:1 against the paper (3.3, 8.0 and 13.4:1).

### Named Rules
**The Fixer Rule.** Fixer yellow is never text on paper and never decoration. It is a fill under Prussian text, or a ring or rule on a Prussian surface. It marks exactly one thing: what is selected or focused there.

**The Seven-to-One Rule.** Every text pairing holds at least 7:1 in both themes. Check a new pairing by computed contrast, not by eye. The tokens above already carry their measured ratios in `globals.css`.

**The Paper Map Rule.** The map is printed on the paper: land and sea are both Paper, countries are Country Line hairlines, and only today's countries are exposed, so nothing else on the map may be blue (blue water would read as "1–2 events"). Place names appear only from zoom 4, in Shade on a paper halo, in the interface's language, and never in italic.

## Typography

**Display Font:** Literata (with Georgia, ui-serif)
**Body Font:** Atkinson Hyperlegible (with ui-sans-serif, system-ui)

**Character:** A literary text serif for everything that is read, paired with a typeface drawn for low-vision legibility for everything that is operated. They are two clearly different voices: one tells, one guides.

### Hierarchy
- **Display** (600, 2rem, 2.375rem leading, -0.015em): page titles; the name on the Welcome (2.25–3.75rem); the "404".
- **Headline** (600, 1.25rem): section headings, decades, settings rows, dialog sections.
- **Numeral** (600, 1.25rem, tabular): the year in the margin of every event list (`YearMark`), with the era under it before the common era. The event popup sets it at 3rem.
- **Story** (400, 1rem, 1.375 leading): an event's text in lists. It is 1.25–1.5rem in the event popup, and 0.875rem in the compact map panel. Summary sentences (Dashboard, Il mio secolo) use Literata at 1.5–1.875rem.
- **Body** (400, 1rem, 1.625 leading, max 65ch): prose on the reading pages, descriptions and notes.
- **Label** (700, 0.8125rem, no tracking, sentence case): field labels, list sub-headings, the contents rail heading.

### Named Rules
**The Year Leads Rule.** In any list of events the year is the first thing read: Literata numerals in a fixed margin column, the text beside it. A list whose rows share one day does not repeat the day.

**The Real Weights Rule.** Only self-hosted real weights exist: Literata 400 and 600, Atkinson 400 and 700. Nothing is bold beyond them, and nothing is italic: no italic is loaded, and a synthesized slant is banned.

**The Sentence Case Rule.** No all-caps labels and no added letter-spacing. Monospace only for code, storage keys and keyboard keys.

## Layout

The app shell has three parts:
- **Sidebar:** a fixed 240px Prussian board on the left (256px drawer on phones).
- **Header:** a 56px bar on top.
- **Content:** the route fills the rest.

Below 1024px the sidebar and the map's events panel become overlay drawers. The map is the one full-bleed surface: a 320px events panel beside the globe, with plaques floating over the map.

Content width follows the job:
- **Reading pages** (guide, methodology, credits, privacy, terms) use a 65ch column. On wide screens a 12rem contents rail sits in the left margin and stays in view while the text scrolls; on narrow screens it folds under the title.
- **Tool pages:** the Archive, Settings and Il mio secolo sit in up to 4xl. Settings is a list of rows: name on the left, controls on the right.
- **The Dashboard** uses 5xl for its chart.

Spacing is Tailwind's 4px rhythm: 24px page padding, 32–40px between sections, 12px within an event row. Text stays left-aligned. Only the Welcome, the 404 and the empty states are centred: an empty state sits in the middle of the space its missing content leaves.

## Elevation & Depth

Flat, with no exceptions, confirmed with the user. No shadow appears anywhere: not on cards, not on hover, not under the event popup. Depth comes from three things:
- **Tonal surfaces:** Paper, Print White, Haze, or their negatives.
- **Hairlines:** Haze Line, 1px.
- **Prussian surfaces:** the sidebar board and the map plaques, which read as mounted plates.

The modal scrim is plain black at 50%, and the Welcome's photographs sit under a flat paper scrim (85% light, 75% dark). Never blur, never a gradient.

### Named Rules
**The Flat Rule.** A surface is separated by tone or by a rule, never by a shadow. Nothing lifts on hover: state shows as colour.

## Shapes

Corners are almost square. Controls (buttons, segmented toggles) take a 3px radius, like the trimmed edge of a print. Fields, panels, plaques and images are square. The circle is reserved: it is the grain. Grains appear in the hourglass mark, the charts, and nothing else decorative. Borders are 1px hairlines; a section is opened by a rule above it, not by a box around it.

### Named Rules
**The Grain Rule.** A dot means one item, an event, a grain of history. Do not use dots as bullets, status lights or decoration.

## Components

### Buttons
Precise and quiet, like the tools of a photographic archive.
- **Shape:** 3px corners, 44px minimum height on every size (`sm`, `icon`, `pill`).
- **Primary:** Exposure Blue fill, Paper text (Prussian-dark text on Exposure Light in the dark theme).
- **Outline:** a hairline border on the page background. It is used for secondary actions such as Print, Clear search, the country suggestions and Reset filters.
- **Ghost / Link:** no fill; a link reads as underlined Exposure Blue text.
- **Overlay / Overlay Active:** buttons on the map's Prussian plaques, pale at rest. The active one is filled Fixer Yellow with Prussian text.
- **Focus:** a 2px ring with a 2px offset on every interactive element. The ring is Prussian on paper, pale on the negative, and Fixer Yellow on Prussian surfaces (sidebar, plaques), where a Prussian ring would vanish.
- **Disabled:** 50% opacity, never re-coloured.

### Inputs / Fields
- **Style:** square, hairline border, page background, 44px tall, Atkinson 0.875rem.
- **Focus:** the same 2px ring as buttons.
- **Grouping:** related fields sit under a Label. The Archive folds its secondary filters into "More filters", open on desktop and whenever a filter is active.

### Navigation
- **Sidebar:** the Prussian board in both themes. The wordmark sits at the top; links are Atkinson 700 at 0.875rem in sentence case, with icons. The active link has a 2px Fixer Yellow left rule and Fixer Yellow text. The main sections are shortcut-numbered 1–5; the reference pages sit below a rule.
- **Header:** the menu toggle, then the wordmark only while the sidebar is closed (one name on screen at a time), and the tagline on wide screens.
- **Contents rail:** on reading pages, a list of the page's own section headings, built from them and linked to them.

### Event Row (signature)
The unit of every list:
- **Year:** the Numeral in a 3.75rem margin column, with the era under it before the common era.
- **Text:** Story type beside it, clamped to three lines.
- **Below the text:** the number of linked articles, or the day when rows come from different days (Il mio secolo). An event the editors also picked for the day is marked "In evidenza" there, in Label weight and Exposure Blue, instead of being listed twice.
- **Compact variant:** used in the 320px map panel, with a 2.75rem margin and 0.875rem text. The day's list there has a heading per century ("1900–1999"), in Literata 600 at 0.875rem, Shade.
- **Interaction:** the whole row opens the event popup; hover and focus turn the text Exposure Blue. The focus ring is drawn inset, because the row's `content-visibility` clips anything outside it.

### Event Popup (signature)
A native `<dialog>`, read like the caption of a print. The order is:
1. the year at 3rem;
2. one date line, with the weekday from 1583 on and how long ago it was;
3. the event in Story type at 1.25–1.5rem;
4. the ways on from it, as 44px text links: its country's whole year when the map places it, and its day in the Archive (not shown on the Archive itself);
5. after a rule, "Related articles": square 5–7rem thumbnails, title link, description, extract, and the image credit in the text column.

Only the close button stays put while the content scrolls. Escape, a backdrop click and the button all close it, and focus returns to the row.

### Grain Chart (signature)
- **Form:** one grain per event, piled in the column of its century (Dashboard) or decade (Il mio secolo).
- **Columns are links:** to the Archive narrowed to that century, or to the decade on the page.
- **Gaps:** only columns with events are drawn; jumps are marked "…", not drawn to scale.
- **Size:** at most 20 rows. A column past that widens; past 60 events the chart switches to finer 5px grains and 36 rows.
- **Labels:** Literata numerals under a hairline baseline.
- **Narrow screens:** the chart scrolls sideways, starting at the recent end.

### Hourglass Mark and Wordmark
20 grains in rows of 4-3-2-1-1-2-3-4, beside "Grains of History" in Literata 600. The mark is Prussian on paper and Fixer Yellow on the sidebar; the favicon is Fixer Yellow grains on Prussian.

### Map Plaques
The legend and the projection toggle are Prussian plates at 90% with a white/15% hairline. MapLibre's own zoom and compass buttons are restyled to match: 44px, with the Fixer focus ring, above the attribution line. Legend swatches sit in a 2px Paper frame, each step as it prints on the map; on the plate alone the Prussian step would vanish.

### Motion
One gesture, `develop`: paper-coloured and faint, to full Prussian, over 1.4s. It is used for the name on the Welcome, where the hourglass grains settle one by one first, 45ms apart, and for the number on the 404. Supporting elements fade in once, without travel. Reduced motion, from the OS or the in-app override, shows the final state at once.

Two movements are not gestures: they answer the reader's own action and show where something went.
- **Drawers:** the mobile sidebar and events panel slide in from their edge, and the desktop sidebar eases its width, over 300ms (75ms with reduced motion).
- **The map's camera:** it turns to a chosen country, or to today's events when the globe opens, and blends between globe and flat, each over 0.9s. With reduced motion it jumps.

### Photography
Historical photographs used as atmosphere (the Welcome's filmstrip, the 404's 1872 plate) are toned as cyanotypes: greyscale blended by luminosity over Prussian (Exposure Blue in the dark theme). Article thumbnails in an event's popup keep their true colours, because a study aid must not alter its evidence.

## Do's and Don'ts

### Do:
- **Do** set every text pairing at 7:1 or more in both themes, and verify it by computed contrast.
- **Do** lead event lists with the year in Literata numerals (`YearMark`).
- **Do** use Fixer Yellow only for what is selected or focused on a Prussian surface, as a fill under Prussian text or as a ring.
- **Do** separate sections with a hairline rule above them, not a box around them.
- **Do** keep 44px touch targets and a visible focus ring on every interactive element.
- **Do** tone atmospheric photographs as cyanotypes, and keep evidence images in true colour.
- **Do** write errors and empty states as direction: what happened, and what to do next.

### Don't:
- **Don't** add a box-shadow, blur, glass or gradient anywhere.
- **Don't** use all-caps labels, tracked letter-spacing, middle-dot meta strings, monospace data labels, or a "→" appended to a link.
- **Don't** apply italic or a weight that is not self-hosted (Literata 400/600, Atkinson 400/700).
- **Don't** put Fixer Yellow text on paper, or a Prussian focus ring on a Prussian surface.
- **Don't** colour the basemap's water blue.
- **Don't** use dots for anything but grains.
- **Don't** add a second motion vocabulary: no slide-up entrances, no hover lifts.
