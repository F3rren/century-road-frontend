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
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        // Only one weight is self-hosted (600) — every serif use in the
        // app stands on that single weight, by design, rather than mixing
        // a real weight with a browser-synthesized (faux) bold.
        serif: ['"Source Serif 4"', "Georgia", "ui-serif", "serif"],
      },
      fontSize: {
        // Page-level <h1>: reach for this instead of picking a size/
        // weight/tracking combination ad hoc for a new page. 600, not 700
        // — this is the font-serif weight, and 600 reads better at this
        // size in a serif than a synthesized bold would.
        "page-title": [
          "1.5rem",
          { lineHeight: "2rem", fontWeight: "600", letterSpacing: "-0.02em" },
        ],
        // Small uppercase section/field label (events panel section
        // headings, the map legend title, form labels). Same metrics as
        // the plain `text-xs font-semibold uppercase tracking-wider`
        // combination already in use, named so it isn't retyped per call
        // site — text-transform and color stay separate utilities.
        eyebrow: [
          "0.75rem",
          { lineHeight: "1rem", fontWeight: "600", letterSpacing: "0.05em" },
        ],
      },
    },
  },
  plugins: [],
};

export default config;
