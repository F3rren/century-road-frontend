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
        // Fixer yellow: "today" and the selected country. A fill under
        // highlight-foreground (Prussian), never text on the paper.
        highlight: {
          DEFAULT: "hsl(var(--highlight))",
          foreground: "hsl(var(--highlight-foreground))",
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
          // Fixer yellow, 7.5:1 on the fixed Prussian sidebar. text-primary
          // is NOT legible there (it swaps with the app theme; the sidebar
          // doesn't). Use text-sidebar-accent for the active-tab color.
          accent: "hsl(var(--sidebar-accent))",
        },
      },
      // --radius is 4px: the slightly eased corner of a trimmed print, not a
      // soft card. Steps 1px apart so the smallest never reaches zero.
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 1px)",
        sm: "calc(var(--radius) - 1px)",
      },
      fontFamily: {
        // Interface voice, and the default for everything: Atkinson
        // Hyperlegible, hosted at its real 400 and 700.
        sans: ["\"Atkinson Hyperlegible\"", "ui-sans-serif", "system-ui", "sans-serif"],
        // Reading voice for event text and prose: Literata 400/600.
        serif: ["\"Literata\"", "Georgia", "ui-serif", "serif"],
        // Titles and the year numerals: the same Literata, set larger and
        // tighter. One family for reading and display keeps the page quiet;
        // the contrast with the interface sans does the rest.
        display: ["\"Literata\"", "Georgia", "ui-serif", "serif"],
      },
      // One motion for the whole identity, borrowed from the cyanotype it is
      // named after: an image is not typed or stamped, it develops, paper
      // turning to Prussian blue. The Welcome page settles the hourglass's
      // grains and develops the name; the 404 develops its number. OS-level
      // reduced motion drops them via motion-safe:, and the in-app override
      // neutralizes timing globally (see globals.css); "both" fill-mode lands
      // either way on the final, fully visible state.
      keyframes: {
        develop: {
          from: { opacity: "0.15", color: "hsl(var(--border))" },
          to: { opacity: "1", color: "hsl(var(--foreground))" },
        },
        "grain-settle": {
          from: { opacity: "0", transform: "translateY(-1.5px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
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
        develop: "develop 1.4s ease-out both",
        "grain-settle": "grain-settle 0.35s ease-out both",
        "fade-in": "fade-in 0.6s ease-out both",
        // Slow and ambient on purpose — a background filmstrip, not the
        // page's focal motion. linear, never eased: an eased infinite loop
        // visibly surges/stalls at every repeat.
        "filmstrip-scroll": "filmstrip-scroll 50s linear infinite",
      },
      maxWidth: {
        // The reading column of DESIGN.md, 65 characters. `ch` is the width of
        // a "0", and Atkinson Hyperlegible's zero is wide: 65ch ran to about 92
        // characters a line (measured), so the cap is 48ch for about 68.
        measure: "48ch",
      },
      fontSize: {
        // Page-level <h1>, Literata 600. A text serif at display size wants
        // a little negative tracking, the opposite of a condensed grotesk.
        "page-title": [
          "2rem",
          { lineHeight: "2.375rem", fontWeight: "600", letterSpacing: "-0.015em" },
        ],
        // The event year, the list's main fact: Literata numerals in the
        // margin, tabular figures expected at the call site.
        dateline: [
          "1.25rem",
          { lineHeight: "1.5rem", fontWeight: "600", letterSpacing: "-0.01em" },
        ],
        // Small section/field label in the interface face, sentence case,
        // no tracking: a label, not a stamp.
        eyebrow: [
          "0.8125rem",
          { lineHeight: "1.125rem", fontWeight: "700", letterSpacing: "0em" },
        ],
      },

    },
  },
  plugins: [],
};

export default config;
