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

### Semantic

Two roles, each with a themed foreground pairing (`--success-foreground`/`--destructive-foreground`) the same way `primary` has one — never assume ivory or ink works on top without checking the theme's own pairing:

- **Destructive** — `rust` (`#a03a1e` light; brighter in dark mode for the same AAA-on-dark reason wire-red is). This is the system's second and *only other* permitted saturated color, reserved for genuine destructive actions (see the One Voice Rule) — never a second decorative accent.
- **Success** — `archive-green` (`#3f6b4a` light, muted rather than a bright "confirmation" green — it stays inside this system's restrained, paper-and-ink register rather than reading as a SaaS-style status chip).

No separate "warning" role exists in the system today — if one is needed, it should follow the same pattern (a themed foreground pairing, not a bare color) rather than reaching for an unreviewed hue.

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
- **Focus:** `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring` (plus `ring-offset-2 ring-offset-background`, or `ring-offset-black` on the dark map-overlay variant) on every interactive element in the system, no exceptions — never rely on the browser's default outline, and never remove focus styling without replacing it.
- **Disabled:** `disabled:opacity-50 disabled:pointer-events-none` — dimmed and inert, never hidden or re-colored; disabled state is signaled by opacity alone, consistent with the system's "color/size carries meaning, nothing else does" discipline.

### Cards / Containers
- **Corner Style:** Square (1px radius) where a boundary exists at all.
- **Background:** `card` (light: `#fbf8f1`) or transparent, depending on context.
- **Shadow Strategy:** None — see Elevation & Depth.
- **Border:** Hairline (`border-border`, 1px) or `divide-*` rules between siblings, never a full box unless the content needs a distinct boundary (e.g. the empty-state placeholder).
- **Internal Padding:** `p-5` (dashboard stat blocks), `py-3` (event clippings, no horizontal padding — they're full-width rows).

### Navigation
- **Sidebar:** Fixed newsroom-black background regardless of app theme (a directory board, not a themed surface). Nav items are index tabs: a 2px left border in `sidebar-accent` plus a subtle background tint marks the active route; inactive items are 70%-opacity ivory text with a hover border/background. Display-face, uppercase, tracked.
- **Header masthead:** "CENTURY ROAD · press archive" persists in the header bar even when the sidebar is collapsed, so identity never fully drops.
- **Focus:** same ring treatment as buttons — `focus-visible:ring-2 focus-visible:ring-ring`, never the browser default.
- **Disabled:** not applicable — nav items are never shown in a disabled state; a route that shouldn't be reachable is simply not rendered.

### Event Clipping (signature component)
The core content unit, replacing what was a bordered, shadowed, rounded card. Structure, top to bottom: a monospace uppercase dateline (`PLACE · DAY MON YEAR`), a display-face headline sized by importance, a small solid category-color square plus label, and (when not compact) a serif description. Rows are separated by a 1px hairline (`border-b`, last child excepted) rather than individual card boundaries — the whole list reads as one ruled column, not a stack of discrete boxes. The signature interaction: hovering or focusing an expandable clipping's headline transitions it to wire-red over 150ms (`motion-safe:duration-150`) — "the copy runs hot" — before the click/Enter/Space toggle reveals the full (un-clamped) title and description.

### Modals
One real modal exists in the system: the event detail popup (`EventDialog`), built on the native `<dialog>` element rather than a hand-rolled overlay — the browser traps focus, makes the rest of the page inert, closes on Escape, and hands focus back to the triggering button for free, and it sits in the browser's own top layer, so a parent panel's `overflow`/`transform` can never clip or offset it.
- **Shape/surface:** follows the system exactly — square corners, hairline `border-border`, `bg-background`, **no shadow**. The only concession to "this is a layer above the page" is the native `::backdrop`, styled `bg-black/50` — not a blur, a plain scrim.
- **Header:** dateline + display-face title on the left, a ghost icon-only close button (`X`, 16px) on the right, separated from the body by a hairline `border-b`.
- **Body:** scrolls independently of the header (`overflow-y-auto` on the content region only), so a long entry never pushes the close button off-screen.
- **Dismissal:** Escape, a click on the backdrop, or the header's close button — all three, always.
- If a second modal use case appears, it should reuse this same native-`<dialog>` pattern rather than introducing a second overlay mechanism (a portal + manually-managed focus trap) for the same job.

### Iconography
[lucide-react](https://lucide.dev) is the only icon library in the system — no mixing in a second set. Icons are stroke-based (never filled), which matches the hairline/flat-by-default aesthetic — a filled icon reads as a solid shape with its own implied elevation, which this system doesn't have anywhere else. Standard inline size is **16px** (`h-4 w-4`), used next to body/label text and inside buttons; a handful of empty-state/illustrative uses go larger (`h-8 w-8`) where the icon is the primary content of a moment, not an accessory to text next to it — there's no third size in between. Icons paired with a visible text label are `aria-hidden="true"`; an icon-only control (a close button, the theme toggle) carries its own `aria-label` instead.

## Accessibility

This system's accessibility floor is verified, already built, and must not regress — see `PRODUCT.md`'s Accessibility & Inclusion section for the product-level commitment this implements:

- **Contrast:** WCAG AA (4.5:1) minimum on every text/UI pairing; several tokens (`--primary`, `--muted-foreground`, `--sidebar-accent`) are tuned to clear the stricter **AAA 7:1** bar specifically because they double as plain body/label text, not just button fills. Two real failures were caught and fixed during the build, not assumed away — both documented as Named Rules above: ivory-on-`#e2394f` measured 4.02:1 (fixed by the Wire-Red Foreground Rule), and light-mode wire-red on the fixed-dark sidebar measured 2.85:1 (fixed by the Sidebar Accent Rule). Any new fixed-dark-on-variable-theme combination must be verified the same way — by computed contrast, not by eye.
- **Touch targets:** 44×44px minimum on every interactive element (`size="sm"`/`"icon"` in the Button component both resolve to `h-11`, 44px) — a floor established before this redesign and preserved through it.
- **Focus visibility:** every interactive element carries a visible `focus-visible` ring (see the Buttons and Navigation state specs above); the browser's default outline is suppressed only because it's replaced, never removed outright.
- **Motion:** `prefers-reduced-motion` is respected automatically wherever an animation utility is used (`motion-safe:`/`motion-reduce:` variants), plus an independent manual override in Impostazioni for a user who wants reduced motion regardless of their OS setting.
- **Keyboard operability:** every mouse-only interaction has a keyboard equivalent — most notably, country selection on the map has a full non-map path (the accessible `<select>` picker), not just a map click.

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
