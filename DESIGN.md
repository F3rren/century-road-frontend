---
name: Century Road
description: A wire-service newsroom archive for the historical events of the 20th century.
colors:
  wire-red: "#c81e3a"
  wire-red-bright-dark: "#e54d61"
  bulletin-ivory: "#f6f1e4"
  card-ivory: "#fbf8f1"
  newsprint-ink: "#1a1714"
  hairline: "#d8d0be"
  muted-ink: "#6b6355"
  newsroom-black: "#141210"
  ivory-white-dark: "#f2ede3"
  sidebar-accent: "#e86475"
  rust: "#a03a1e"
  archive-green: "#3f6b4a"
typography:
  display:
    fontFamily: "Oswald, Impact, Haettenschweiler, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 600
    lineHeight: "2rem"
    letterSpacing: "-0.005em"
  body:
    fontFamily: "Source Serif 4, Georgia, ui-serif, serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: "1.5"
  label:
    fontFamily: "Oswald, Impact, Haettenschweiler, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: "1rem"
    letterSpacing: "0.08em"
  dateline:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "0.6875rem"
    letterSpacing: "0.05em"
rounded:
  sm: "1px"
  md: "1px"
  lg: "2px"
spacing:
  sm: "0.75rem"
  md: "1rem"
  lg: "1.5rem"
components:
  button-primary:
    backgroundColor: "{colors.wire-red}"
    textColor: "{colors.card-ivory}"
    rounded: "{rounded.md}"
    padding: "0 1rem"
    height: "2.75rem"
  button-primary-hover:
    backgroundColor: "{colors.wire-red}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.newsprint-ink}"
  event-clipping:
    backgroundColor: "transparent"
    textColor: "{colors.newsprint-ink}"
    rounded: "0"
    padding: "0.75rem 0"
---

# Design System: Century Road

## Overview

**Creative North Star: "The Wire-Service Newsroom Archive"**

Century Road reads as a press archive, not a library, a museum, or a SaaS dashboard. Every historical event is a dateline — a place and a date stamped together, the way a wire bulletin's header works — and the whole interface adopts a newsroom's own working materials: bulletin-paper ivory, newsprint ink, ruled clippings instead of cards, and exactly one committed color (wire-red) reserved for the interactive and "live" moments. This direction was assigned by the project's concept-seed roll rather than picked by default — the obvious "atlas/almanac" (cream + sepia + hairline cartography) was offered and explicitly declined as the more predictable choice for a historical-cartographic product.

The system is deliberately restrained: neutrals carry the surface, one accent carries emphasis, and radius is functionally zero throughout (clippings and rules, not soft rounded cards). Nothing here is glass, blur, or gradient — depth comes from hairline rules and ruled division, never shadow.

**Key Characteristics:**
- One committed accent (wire-red) — never a decorative field, always interactive/active/"today"
- Ruled clippings, not cards — hairline dividers replace borders-plus-shadow
- Type size carries importance (event headline size scales with historical importance) — not color alone
- Display voice (Oswald, condensed newsroom-grotesque) for headings/labels; reading voice (Source Serif 4) for event titles and body content
- Near-zero radius everywhere (1–2px) — square, not soft
- The sidebar is a fixed newsroom-black directory board that never themes with light/dark — everything else does

## Colors

Warm, paper-and-ink neutrals carry the surface; wire-red is the only saturated color in the system.

### Primary
- **Wire-Red** (`#c81e3a` light / `#e54d61` dark): The one committed accent. Used for the active nav tab, primary button fills, the selected-country map highlight, and hover emphasis on interactive headlines. Never used decoratively or as a background field.

### Neutral
- **Bulletin Ivory** (`#f6f1e4`): Page background, light mode. A warm paper tone, not a cold gray or a pastel cream.
- **Card Ivory** (`#fbf8f1`): Slightly lighter surface for cards/panels, light mode.
- **Newsprint Ink** (`#1a1714`): Primary text, light mode. Also doubles as the dark-mode fill-button foreground (see the Wire-Red Foreground Rule below).
- **Hairline** (`#d8d0be`): All borders and rule dividers, light mode. Never a heavier gray — this is a paper-fiber-toned line, not a UI-chrome gray.
- **Muted Ink** (`#6b6355`): Secondary text (labels, metadata, descriptions), light mode.
- **Newsroom Black** (`#141210`): Page background, dark mode — "the archive at night." Also the sidebar's fixed, always-on background regardless of app theme.
- **Ivory White** (`#f2ede3`): Primary text, dark mode.

### Named Rules
**The One Voice Rule.** Wire-red is the only saturated color permitted in the interface. Category color-coding (event type swatches) stays deliberately quieter — solid small squares, never filled pill backgrounds — so it never competes with the one true accent.

**The Wire-Red Foreground Rule.** A filled wire-red surface (buttons, active toggle) uses ivory text in light mode but **dark ink text in dark mode**, not ivory-on-ivory. Dark-mode wire-red is intentionally brighter (`#e54d61`) for legibility as text-on-background, and a bright red reads better with dark text on top of it than with white-on-white-adjacent. This was a real WCAG failure caught and fixed during the build (ivory-on-`#e2394f` measured 4.02:1, under the 4.5:1 floor) — don't "simplify" it back to one foreground color for both themes.

**The Sidebar Accent Rule.** Never use `{colors.wire-red}` for text inside the sidebar. The sidebar never themes with light/dark, but `--primary` does — in light mode, light-mode wire-red on the sidebar's fixed dark background measures 2.85:1, a real failure. Use `sidebar-accent` (`#e86475`, verified 4.99:1) instead; it exists specifically for this fixed-dark context.

## Typography

**Display Font:** Oswald (with Impact, Haettenschweiler, sans-serif fallback)
**Body Font:** Source Serif 4 (with Georgia, ui-serif, serif fallback)
**Label/Mono Font:** system monospace stack (datelines only)

**Character:** A condensed, confident newsroom-grotesque headline voice paired with a calm, readable serif for content — the classic editorial pairing (bold masthead type over readable body copy), not a single face doing both jobs.

### Hierarchy
- **Display** (600, 1.75rem/2rem, -0.005em tracking): Page-level `<h1>` only.
- **Headline** (600, 1.125rem, condensed): Event titles at high importance.
- **Title** (600, 1rem/0.875rem, condensed): Event titles at medium/low importance — type size itself carries the importance signal, not a separate visual treatment.
- **Body** (600, 0.875rem, 1.5 line-height, serif): Event descriptions and other reading content.
- **Label** (600, 0.75rem, 0.08em tracking, uppercase, condensed): Section headings, form labels, the map legend title.
- **Dateline** (monospace, 0.6875rem, uppercase, 0.05em tracking): Place + date stamps on event clippings — the one place monospace appears, deliberately, as the "wire bulletin" device.

### Named Rules
**The Single-Weight Rule.** Both custom faces are self-hosted at exactly one weight each (600). Nothing in this system uses a browser-synthesized (faux) bold — if a heavier or lighter weight is ever needed, host the real weight; never let the browser fake it.

**The Size-Carries-Importance Rule.** An event's historical importance (`high`/`medium`/`low`) maps to headline type size (`text-lg`/`text-base`/`text-sm`), never to color. This was a raise donated by a declined "festival lineup poster" challenger during the direction round.

## Layout

Single-page app shell: a fixed-width nav sidebar (240px desktop, off-canvas drawer below 1024px), a header bar, and route content filling the rest. The Mappa route is the primary surface: a docked events panel (320px desktop, 85vw/max 384px mobile drawer) beside a full-bleed map. Dashboard and Settings content is capped at `max-w-6xl`, centered, with `p-6` page padding. Spacing scale is Tailwind's default 4px rhythm throughout — no custom spacing tokens were needed beyond that.

## Elevation & Depth

**No shadows anywhere in this system.** Depth and separation come from hairline rules (`border-border`, 1px) and ruled division (`divide-y`/`divide-x`), never `box-shadow`. Map overlay controls (`MapOverlayPanel`) are solid plaques (`bg-[#141210]/90`, no backdrop-blur) rather than glass — blur-as-decoration was explicitly rejected during the direction round.

### Named Rules
**The Flat-By-Default Rule.** Every surface — event clippings, dashboard stat blocks, map overlay plaques, buttons — sits flush with no elevation. Nothing lifts on hover; only color (wire-red) and hairline rules communicate state and hierarchy.

## Shapes

Radius is functionally zero (`--radius: 0.125rem` = 2px, with `md`/`sm` steps at 1px to stay non-negative) — square corners read as "clippings and rules," not "soft rounded cards." The one deliberate exception is the mobile drawer's overlay backdrop, which has no shape at all (full-bleed scrim). Event category markers are small solid squares (`h-2 w-2`), never rounded dots or pills.

## Components

### Buttons
- **Shape:** Near-square (1px radius).
- **Primary:** Wire-red fill, ivory (light mode) or dark-ink (dark mode) text — see the Wire-Red Foreground Rule. 44px minimum height (touch target floor established before this redesign; preserved).
- **Ghost:** Transparent, `hover:bg-accent`. Used for icon-only chrome (menu toggle, theme toggle, close buttons).
- **Overlay / Overlay-Active:** Used only inside `MapOverlayPanel` (ProjectionToggle). Overlay-active is a wire-red fill — the same "this is the active/selected state" signal as everywhere else in the system, not a separate white/black treatment.

### Cards / Containers
- **Corner Style:** Square (1px radius) where a boundary exists at all.
- **Background:** `card` (light: `#fbf8f1`) or transparent, depending on context.
- **Shadow Strategy:** None — see Elevation & Depth.
- **Border:** Hairline (`border-border`, 1px) or `divide-*` rules between siblings, never a full box unless the content needs a distinct boundary (e.g. the empty-state placeholder).
- **Internal Padding:** `p-5` (dashboard stat blocks), `py-3` (event clippings, no horizontal padding — they're full-width rows).

### Navigation
- **Sidebar:** Fixed newsroom-black background regardless of app theme (a directory board, not a themed surface). Nav items are index tabs: a 2px left border in `sidebar-accent` plus a subtle background tint marks the active route; inactive items are 70%-opacity ivory text with a hover border/background. Display-face, uppercase, tracked.
- **Header masthead:** "CENTURY ROAD · press archive" persists in the header bar even when the sidebar is collapsed, so identity never fully drops.

### Event Clipping (signature component)
The core content unit, replacing what was a bordered, shadowed, rounded card. Structure, top to bottom: a monospace uppercase dateline (`PLACE · DAY MON YEAR`), a display-face headline sized by importance, a small solid category-color square plus label, and (when not compact) a serif description. Rows are separated by a 1px hairline (`border-b`, last child excepted) rather than individual card boundaries — the whole list reads as one ruled column, not a stack of discrete boxes. The signature interaction: hovering or focusing an expandable clipping's headline transitions it to wire-red over 150ms (`motion-safe:duration-150`) — "the copy runs hot" — before the click/Enter/Space toggle reveals the full (un-clamped) title and description.

## Do's and Don'ts

### Do:
- **Do** reserve wire-red for interactive/active/"today" moments only — buttons, active nav, selected map country, hover emphasis.
- **Do** use `sidebar-accent` (never `primary`) for any accent color rendered inside the sidebar.
- **Do** use dark ink (not ivory) as the foreground on a dark-mode wire-red fill.
- **Do** let event importance drive headline type size, not a color or icon change.
- **Do** keep both custom typefaces at their single hosted weight (600); don't request a second weight without self-hosting it for real.
- **Do** separate list content with hairline rules (`divide-y`, `border-b`) instead of individual card borders + shadow.

### Don't:
- **Don't** add `box-shadow` anywhere. Depth is hairlines and ruled division only.
- **Don't** add `backdrop-blur` or any glass treatment. Map overlays are solid plaques.
- **Don't** round corners beyond the 1–2px system radius. If something needs to look "soft," that's a signal the direction is being diluted, not a reason to bump the radius token.
- **Don't** introduce a second saturated accent color alongside wire-red. If a new semantic need arises (e.g. a genuine destructive/delete action), reach for `rust` (`#a03a1e`) — already reserved for that role — rather than inventing a new hue.
- **Don't** use the light-mode wire-red value inside the sidebar or any other fixed-dark surface; it fails contrast there. Verify new fixed-dark-on-variable-theme combinations with actual contrast math, not by eye — two real WCAG failures were caught this way during the build, not by inspection.
