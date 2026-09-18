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
