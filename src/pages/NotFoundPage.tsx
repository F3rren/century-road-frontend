import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { usePageMeta } from "@/hooks/usePageMeta";
import { ExternalAnchor } from "@/components/ui/ExternalAnchor";
import { PHOTO_404_CREDIT_URL } from "@/features/terms";

// A real 1872 photograph, not a decorative illustration — O.G. Rejlander's
// "surprise" plate from Darwin's The Expression of the Emotions in Man and
// Animals, one of the first scientific works to use photography: a genuine
// historical document of someone caught mid-bewilderment. CC BY 4.0,
// Wellcome Collection, credited below like every borrowed image in this app.

const LINK_CLASS =
  "text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

// One moment, the same as the Welcome page's: the number develops from paper
// to Prussian. The rest appears once it has. motion-safe: and the in-app
// reduced-motion override show the final state straight away.
export function NotFoundPage() {
  const { t } = useTranslation();
  usePageMeta(t("notFound.title"), t("meta.notFound.description"));

  return (
    <div className="relative flex h-full flex-col items-center justify-center gap-6 overflow-hidden px-6 py-12 text-center">
      {/* Toned as a cyanotype, like the Welcome photos: greyscale blended by
          luminosity over a Prussian ground, under a flat scrim. */}
      <div aria-hidden="true" className="absolute inset-0 z-0 bg-[#0E2A47] dark:bg-[#1F4E79]">
        <img
          src="/404-surprise.jpg"
          alt=""
          className="h-full w-full object-cover object-[center_25%] mix-blend-luminosity grayscale contrast-125"
        />
      </div>
      <div className="absolute inset-0 z-0 bg-background/85 dark:bg-background/75" />

      <div className="relative z-10">
        <p className="font-display text-8xl font-semibold tabular-nums tracking-[-0.03em] motion-safe:animate-develop sm:text-9xl">
          404
        </p>
        <h1 className="mt-3 font-display text-2xl font-semibold motion-safe:animate-fade-in motion-safe:[animation-delay:1s]">
          {t("notFound.title")}
        </h1>
        <p className="mx-auto mt-2 max-w-sm text-muted-foreground motion-safe:animate-fade-in motion-safe:[animation-delay:1s]">
          {t("notFound.message")}
        </p>
      </div>

      {/* Three ways back, not one: whatever the visitor was trying to reach,
          at least one of these is probably closer to it than the map alone. */}
      <div
        className="relative z-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 motion-safe:animate-fade-in motion-safe:[animation-delay:1s]"
      >
        <Link to="/" className={LINK_CLASS}>
          {t("notFound.backToMap")}
        </Link>
        <Link to="/archive" className={LINK_CLASS}>
          {t("notFound.goToArchive")}
        </Link>
        <Link to="/dashboard" className={LINK_CLASS}>
          {t("notFound.goToDashboard")}
        </Link>
      </div>

      <ExternalAnchor
        href={PHOTO_404_CREDIT_URL}
        className="relative z-10 text-xs text-muted-foreground hover:text-foreground motion-safe:animate-fade-in motion-safe:[animation-delay:1s]"
      >
        {t("notFound.photoCredit")}
      </ExternalAnchor>
    </div>
  );
}
