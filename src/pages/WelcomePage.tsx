import { useTranslation } from "react-i18next";
import { BRAND_NAME, HourglassMark } from "@/components/ui/Wordmark";
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
import { usePageMeta } from "@/hooks/usePageMeta";
import { markWelcomeSeen } from "@/lib/welcomeSeen";

// The threshold to the app, shown once (see IndexRoute/welcomeSeen). One
// moment, not a cascade: the hourglass's grains settle in while the name
// develops from paper to Prussian, like a cyanotype under light; then
// everything else appears at once. Today's date is already there, as a fact.
// Purely CSS-driven (no JS timers/state), so the Enter button is focusable
// and clickable from the very first paint, whatever the animation is doing.
// motion-safe: and the in-app reduced-motion override drop the sequence to
// its end state for anyone who asked for that.
export function WelcomePage() {
  const { t, /*i18n*/ } = useTranslation();
  const navigate = useNavigate();
  const { photos } = useHistoryPhotoCarousel();
  usePageMeta(t("welcome.pageTitle"), t("meta.welcome.description"));

  // const dateline = new Intl.DateTimeFormat(i18n.language, {
  //   day: "numeric",
  //   month: "long",
  //   year: "numeric",
  //   timeZone: "UTC",
  // }).format(new Date());

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

        {/* <p className="relative z-10 text-sm text-muted-foreground">{dateline}</p> */}

        <div className="relative z-10">
          <h1 className="flex flex-col items-center gap-4 font-display text-4xl font-semibold tracking-[-0.02em] motion-safe:animate-develop motion-safe:[animation-delay:0.3s] sm:text-6xl">
            <HourglassMark settle className="h-12 sm:h-16" />
            {BRAND_NAME}
          </h1>
          <p className="mt-2 text-eyebrow text-muted-foreground motion-safe:animate-fade-in motion-safe:[animation-delay:1.6s]">
            {t("nav.brandTagline")}
          </p>
        </div>

        <p className="relative z-10 max-w-sm font-serif text-sm text-muted-foreground motion-safe:animate-fade-in motion-safe:[animation-delay:1.6s]">
          {t("welcome.tagline")}
        </p>

        <Button
          size="sm"
          onClick={handleEnter}
          className="relative z-10 motion-safe:animate-fade-in motion-safe:[animation-delay:1.6s]"
        >
          {t("welcome.enter")}
        </Button>
      </main>

      <footer className="border-t border-border px-6 py-6 text-center motion-safe:animate-fade-in motion-safe:[animation-delay:1.6s]">
        <p className="text-eyebrow text-muted-foreground">
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
