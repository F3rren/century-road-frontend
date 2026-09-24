import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ExternalAnchor } from "@/components/ui/ExternalAnchor";
import {
  CC_BY_SA_URL,
  NATURAL_EARTH_TERMS_URL,
  OSM_COPYRIGHT_URL,
  WIKIMEDIA_COMMONS_URL,
} from "@/features/terms";
import { PhotoCarousel, useHistoryPhotoCarousel } from "@/features/welcome";
import { usePageTitle } from "@/hooks/usePageTitle";
import { markWelcomeSeen } from "@/lib/welcomeSeen";

// The threshold to the app, shown once (see IndexRoute/welcomeSeen). A wire
// dispatch arriving, not a marketing hero: today's real date types in first,
// alone, then the masthead resolves — proving "this archive is live today"
// before any content does. Purely CSS-driven (no JS timers/state), so the
// Enter button is focusable and clickable from the very first paint,
// whatever the animation is doing visually. motion-safe:/motion-reduce:
// (extended in tailwind.config.ts to also honor Impostazioni's override)
// drop the whole sequence to its end state for anyone who asked for that.
export function WelcomePage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { photos } = useHistoryPhotoCarousel();
  usePageTitle(t("welcome.pageTitle"));

  const dateline = new Intl.DateTimeFormat(i18n.language, {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date());

  function handleEnter() {
    markWelcomeSeen();
    navigate("/", { replace: true });
  }

  return (
    // h-screen + its own overflow-y-auto, not min-h-screen: html/body carry
    // overflow-hidden globally (every scrollable area is a panel's own, per
    // globals.css) — a page taller than the viewport (a short window, the
    // footer) needs to scroll itself, not rely on window-level scroll that
    // doesn't exist here.
    <div className="flex h-screen flex-col overflow-y-auto bg-background text-foreground">
      <main className="relative flex flex-1 flex-col items-center justify-center gap-5 px-6 py-20 text-center">
        <PhotoCarousel photos={photos} />

        {/* The dispatch: today's date, typed in like a wire bulletin. The
            full string is always in the DOM (screen readers read it
            immediately); only the visual reveal is animated. */}
        <div className="relative z-10 flex items-baseline font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
          <span className="motion-safe:inline-block motion-safe:w-0 motion-safe:animate-typewriter motion-safe:overflow-hidden motion-safe:whitespace-nowrap">
            {dateline}
          </span>
          <span
            aria-hidden="true"
            className="ml-0.5 motion-safe:animate-caret-blink motion-reduce:hidden"
          >
            ▍
          </span>
        </div>

        <div className="relative z-10">
          <h1 className="font-display text-4xl font-semibold uppercase tracking-wide motion-safe:animate-fade-up motion-safe:[animation-delay:1.05s] sm:text-6xl">
            Century Road
          </h1>
          <p className="mt-2 font-display text-eyebrow uppercase text-muted-foreground motion-safe:animate-fade-up motion-safe:[animation-delay:1.35s]">
            {t("nav.brandTagline")}
          </p>
        </div>

        <p className="relative z-10 max-w-sm font-serif text-sm text-muted-foreground motion-safe:animate-fade-up motion-safe:[animation-delay:1.55s]">
          {t("welcome.tagline")}
        </p>

        <div className="relative z-10 h-px w-16 origin-left bg-border motion-safe:animate-grow-x motion-safe:[animation-delay:1.8s]" />

        <Button
          size="sm"
          onClick={handleEnter}
          className="relative z-10 motion-safe:animate-fade-up motion-safe:[animation-delay:2.05s]"
        >
          {t("welcome.enter")}
        </Button>
      </main>

      <footer className="border-t border-border px-6 py-6 text-center motion-safe:animate-fade-up motion-safe:[animation-delay:2.3s]">
        <p className="font-display text-eyebrow uppercase text-muted-foreground">
          {t("welcome.footer.creditsLabel")}
        </p>
        <ul className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <li>
            <ExternalAnchor href={CC_BY_SA_URL} className="hover:text-foreground">
              {t("welcome.footer.wikipedia")}
            </ExternalAnchor>
          </li>
          <li>
            <ExternalAnchor href={WIKIMEDIA_COMMONS_URL} className="hover:text-foreground">
              {t("welcome.footer.photos")}
            </ExternalAnchor>
          </li>
          <li>
            <ExternalAnchor href={OSM_COPYRIGHT_URL} className="hover:text-foreground">
              {t("welcome.footer.map")}
            </ExternalAnchor>
          </li>
          <li>
            <ExternalAnchor href={NATURAL_EARTH_TERMS_URL} className="hover:text-foreground">
              {t("welcome.footer.boundaries")}
            </ExternalAnchor>
          </li>
        </ul>
      </footer>
    </div>
  );
}
