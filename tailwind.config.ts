import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar))",
          foreground: "hsl(var(--sidebar-foreground))",
          border: "hsl(var(--sidebar-border))",
          // Verified 4.99:1 against the sidebar background — text-primary
          // is NOT legible here (it swaps with the app theme; the sidebar
          // doesn't). Use text-sidebar-accent for the active-tab color.
          accent: "hsl(var(--sidebar-accent))",
        },
      },
      // --radius is 2px in this direction (clippings and rules, not soft
      // cards) — subtracting Tailwind's usual 2px/4px steps would go
      // negative, so the steps are 1px apart instead. Still effectively
      // square at normal viewing distance, never literally invalid CSS.
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 1px)",
        sm: "calc(var(--radius) - 1px)",
      },
      fontFamily: {
        // Reading voice. Only one weight is self-hosted (600) — every
        // serif use stands on that real weight rather than a
        // browser-synthesized (faux) bold.
        serif: ['"Source Serif 4"', "Georgia", "ui-serif", "serif"],
        // Display/headline voice — condensed newsroom-grotesque (real
        // early-20th-century headline lineage). Also one hosted weight
        // (600); size alone carries the hierarchy on top of it (see the
        // eyebrow/page-title/dateline scale below), matching the
        // direction's own "type size carries importance" principle.
        display: ['"Oswald"', "Impact", "Haettenschweiler", "sans-serif"],
      },
      // The Welcome page's one signature interaction — a dateline typing in
      // like a wire dispatch, then the masthead/tagline/rule/button
      // resolving in sequence via animation-delay. Real OS-level reduced
      // motion drops these via stock motion-safe:/motion-reduce: (unmodified
      // — see globals.css for why the in-app override doesn't touch these
      // variants at all and instead neutralizes timing globally).
      keyframes: {
        typewriter: {
          from: { width: "0" },
          to: { width: "100%" },
        },
        "caret-blink": {
          "0%, 100%": { opacity: "0" },
          "50%": { opacity: "1" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(0.5rem)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "grow-x": {
          from: { transform: "scaleX(0)" },
          to: { transform: "scaleX(1)" },
        },
        // The photo filmstrip's seamless loop: the track renders the photo
        // pool twice back to back, so translating exactly -50% lands on a
        // frame-for-frame duplicate of the start — no jump, no reset.
        "filmstrip-scroll": {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
      },
      animation: {
        typewriter: "typewriter 1.1s steps(22, end) forwards",
        // forwards: settles on the 100% keyframe (opacity 0) once the 4
        // blinks finish, so the caret disappears on its own even under the
        // reduce-motion override below (near-zero duration, still forwards).
        "caret-blink": "caret-blink 0.9s step-end 4 forwards",
        // fill-mode "both" (not just "forwards"): with a delay, the element
        // must sit at the from-keyframe (invisible) during that delay, or
        // it flashes visible in its default state before its turn arrives.
        "fade-up": "fade-up 0.6s ease-out both",
        "grow-x": "grow-x 0.5s ease-out both",
        // Slow and ambient on purpose — a background filmstrip, not the
        // page's focal motion. linear, never eased: an eased infinite loop
        // visibly surges/stalls at every repeat.
        "filmstrip-scroll": "filmstrip-scroll 50s linear infinite",
      },
      fontSize: {
        // Page-level <h1>, set in the display face. Oswald is already
        // condensed, so it wants little to no extra negative tracking —
        // unlike a normal-width display serif, tightening it further just
        // cramps the letterforms.
        "page-title": [
          "1.75rem",
          { lineHeight: "2rem", fontWeight: "600", letterSpacing: "-0.005em" },
        ],
        // The event year, set as a hero numeral object (display face,
        // tabular figures expected at the call site) rather than a small
        // badge — donated by the nixie-tube-counter challenger.
        dateline: [
          "1.125rem",
          { lineHeight: "1.25rem", fontWeight: "600", letterSpacing: "0em" },
        ],
        // Small uppercase section/field label (events panel section
        // headings, the map legend title, form labels), set in the display
        // face. Same metrics the app already used as plain utilities,
        // named so they aren't retyped per call site — text-transform and
        // color stay separate utilities.
        eyebrow: [
          "0.75rem",
          { lineHeight: "1rem", fontWeight: "600", letterSpacing: "0.08em" },
        ],
      },
    },
  },
  plugins: [],
};

export default config;
