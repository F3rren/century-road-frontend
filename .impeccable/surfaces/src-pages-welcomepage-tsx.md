---
version: 1
slug: "src-pages-welcomepage-tsx"
primary_target: "src/pages/WelcomePage.tsx"
related_targets: ["src/features/welcome/components/PhotoCarousel.tsx","src/features/welcome/hooks/useHistoryPhotoCarousel.ts","src/components/ui/Wordmark.tsx","src/router/index.tsx"]
---

## Direction contract

THESIS: The threshold to Grains of History is a print developing, not a marketing hero: the hourglass grains settle and the name turns from paper to Prussian blue, while real photographs of a random day of history pass behind it as cyanotypes. Refuses the generic "big background image + headline + CTA" landing arrangement.

OWN-WORLD: Paper (dark: the Negative) with Prussian text. The name and the hourglass mark in Literata 600; today's date, the tagline and the sentence in Atkinson and Literata, sentence case, no monospace, no caps. The "Entra" button in Exposure blue, 44px. Photographs toned as cyanotypes: greyscale blended by luminosity over a Prussian frame (Exposure blue in dark), separated by hairline seams, under a flat paper scrim (85% light, 75% dark); a loading frame shows the Prussian ground and crossfades to the photo. No shadow, no blur; the one gradient is the CSS edge-fade mask the marquee needs.

STORY: The visitor understands they have reached a live archive of real history that changes every day. Behind them, three filmstrips of real photographs from a randomly picked day scroll past, hinting at the archive's breadth. They watch the name develop, then press "Entra" into the map.

FIRST VIEWPORT: A centred column, full viewport height, outside the app shell (no sidebar, no header). Today's real date first, as a plain fact. The hourglass mark settles in, 45ms per grain, while the name develops (1.4s, from 0.3s). Then the tagline, a one-sentence description and "Entra" appear together at 1.6s, fading in without travel, with the attribution footer below the fold. Behind it: three horizontal bands, each a seamless infinite filmstrip from one shared pool of real Wikimedia photos of one random day, alternating direction row to row, edges soft-masked. Reduced motion (OS or in-app override) shows the final state and stops the filmstrips.

FORM: Structural candidate 4 of 7 for this surface (wire ticker awakening), seed key 3e1679c1, locked by the user in the first build; seven user-requested filmstrip follow-ups extended it. In the rebrand the user replaced the world with the cyanotype print (option 1 of 3, no seed roll) and the motion with "develop": the typed dateline, the caret and the stamp were removed. FIRST VIEWPORT keeps its structure.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.

### History that still holds

- **Load speed.** `<link rel="preconnect">` for `upload.wikimedia.org` and `thumb.wikimedia.org` in `index.html`, and `decoding="async"` throughout. `loading="lazy"` was tried and reverted, because the strip's continuous loop defeats it; a muted-placeholder crossfade replaced it.
- **Page weight.** Wikipedia's "thumbnail" can be the unscaled original. PNG sources are excluded, and any candidate is capped at 600px on its longest side, since tiles render at 160–224 CSS px.
- **The SVG exclusion regex.** It must not be `$`-anchored: Wikimedia URLs carry a query string.
- **Disclosed limit.** Dimensions do not predict byte weight: one measured outlier was a 330×330 JPEG at 876KB. The API reports no byte size.
- **Known open item, unresolved.** The photo pool is unfiltered real history, so it can surface intense subject matter on a newcomer's first screen. Whether to filter is an editorial decision, not a design one.
