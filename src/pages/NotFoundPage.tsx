import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { getReducedMotionOverride } from "@/hooks/useReducedMotion";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { usePageMeta } from "@/hooks/usePageMeta";
import { ExternalAnchor } from "@/components/ui/ExternalAnchor";

// A real 1872 photograph, not a decorative illustration — O.G. Rejlander's
// "surprise" plate from Darwin's The Expression of the Emotions in Man and
// Animals, one of the first scientific works to use photography, chosen
// specifically because it's a genuine historical document of someone
// captured mid-bewilderment, the same material (real Commons photography,
// not clip art) already used for the Welcome page's carousel. CC BY 4.0,
// Wellcome Collection — credited below, same as every other borrowed image
// in this app.
const PHOTO_CREDIT_URL =
  "https://commons.wikimedia.org/wiki/File:Surprise_and_distress_in_Darwin%27s_Expression_of_Emotions..._Wellcome_L0049511.jpg";

// Per-character pace matched to the Welcome page's dateline (1.1s over an
// ~18-character date ≈ 0.06s/char) but a touch brisker, since this string
// runs 3-4x longer and the same pace would feel sluggish over a full
// sentence. Duration/step-count are derived from the actual translated
// string (not a hardcoded per-language table) so the choreography stays
// correct if the copy is ever edited, and every later delay is offset from
// this one measured value rather than guessed per language.
const CHAR_PACE_S = 0.037;
const MIN_TYPE_DURATION_S = 1.2;

export function NotFoundPage() {
  const { t } = useTranslation();
  usePageMeta(t("notFound.title"), t("meta.notFound.description"));

  // Read once per visit, same combined OS-preference-or-in-app-override
  // check as PhotoCarousel.tsx — this page needs a custom typing duration
  // per language, which the CSS-only motion-safe:/motion-reduce: variants
  // can't express (they gate whole utility classes, not an inline duration
  // computed from the string's own length), so the whole sequence is
  // conditioned in JS instead, exactly like the filmstrip's own animation.
  const [reduced] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches || getReducedMotionOverride(),
  );
  // The single-line width-reveal only has room at sm and up — the German
  // string alone runs ~78 monospace characters, wider than a phone screen
  // at any legible size. Below sm the same (already mid-word-truncated)
  // sentence just wraps and fades in — the joke is in the cut-off wording
  // itself, not only in how it's revealed, so it still lands without the
  // width animation.
  const hasRoomToType = useMediaQuery("(min-width: 640px)");

  const typedMessage = t("notFound.typedMessage");
  const typeDurationS = Math.max(MIN_TYPE_DURATION_S, typedMessage.length * CHAR_PACE_S);
  const delay = (afterTypingS: number) =>
    reduced ? undefined : { animationDelay: `${(hasRoomToType ? typeDurationS : 0.3) + afterTypingS}s` };

  return (
    <div className="relative flex h-full flex-col items-center justify-center gap-5 overflow-hidden px-6 py-12 text-center">
      {/* The background: desaturated and scrimmed exactly like the Welcome
          carousel (grayscale + contrast, never shown at full strength, a
          solid flat scrim — not a gradient/blur — between it and the text),
          so this reads as the same material everywhere it appears in this
          system, not a one-off decoration. */}
      <img
        src="/404-surprise.jpg"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 z-0 h-full w-full object-cover object-[center_25%] grayscale contrast-125"
      />
      <div className="absolute inset-0 z-0 bg-background/90" />

      {/* The dispatch that can't finish: the machine is mid-sentence, right
          at the word "not found", when it runs out of paper. Full text is
          always in the DOM (screen readers get it immediately, cut-off and
          all) — only the visual reveal is animated, same technique as the
          Welcome page's dateline. */}
      <div
        className={cn(
          "relative z-10 max-w-md text-left font-mono text-sm text-foreground sm:text-base",
          // The jolt only makes sense as the payoff of a typing motion that
          // just stopped — the mobile fallback below has no such moment, so
          // it doesn't get one either.
          hasRoomToType && !reduced && "animate-paper-jolt",
        )}
        style={hasRoomToType && !reduced ? { animationDelay: `${typeDurationS}s` } : undefined}
      >
        {hasRoomToType ? (
          <>
            {/* The reveal window's width must match the text's own natural
                width, not a percentage of this block (that resolves against
                the containing block, i.e. this max-w-md wrapper, and clips
                the tail of a sentence longer than max-w-md — found live
                testing this). ch is exact here since the text is
                monospace: each character really is 1ch wide. */}
            <span
              className="inline-block overflow-hidden align-bottom"
              style={reduced ? undefined : { width: `${typedMessage.length}ch` }}
            >
              <span
                className={cn("inline-block whitespace-nowrap", !reduced && "w-0 animate-typewriter")}
                style={
                  reduced
                    ? undefined
                    : {
                        animationDuration: `${typeDurationS}s`,
                        animationTimingFunction: `steps(${typedMessage.length}, end)`,
                      }
                }
              >
                {typedMessage}
              </span>
            </span>
            {!reduced && (
              <span aria-hidden="true" className="ml-0.5 animate-caret-blink">
                ▍
              </span>
            )}
          </>
        ) : (
          <p className={cn(!reduced && "animate-fade-up")}>{typedMessage}</p>
        )}
      </div>

      <p
        className={cn("relative z-10 font-display text-eyebrow uppercase text-muted-foreground", !reduced && "animate-fade-up")}
        style={delay(0.2)}
      >
        {t("notFound.outOfPaper")}
      </p>

      {/* A dashed tear-line, not the usual solid hairline rule elsewhere in
          this system — a small nod to a teletype's perforated fanfold paper
          edge. A border style, not a texture image or gradient, so it stays
          inside the system's flat material rules. */}
      <div
        className={cn("relative z-10 h-0 w-16 origin-left border-t border-dashed border-border", !reduced && "animate-grow-x")}
        style={delay(0.6)}
      />

      <div className="relative z-10">
        {/* The one moment on this page that gets real weight: a stamp
            landing, not another fade-up — everything around it is quiet on
            purpose so this lands. */}
        <h1
          className={cn("font-display text-6xl font-semibold text-muted-foreground", !reduced && "animate-stamp-in")}
          style={delay(0.9)}
        >
          404
        </h1>
        <p
          className={cn("mt-1 text-lg text-muted-foreground", !reduced && "animate-fade-up")}
          style={delay(1.15)}
        >
          {t("notFound.title")}
        </p>
        {/* A filed-away, no-record-found stamp, not a repeat of the "404"
            above it — the kind of line a real archive drawer would carry. */}
        <p
          className={cn("mt-1 font-mono text-[11px] uppercase tracking-wider text-muted-foreground", !reduced && "animate-fade-up")}
          style={delay(1.3)}
        >
          {t("notFound.referenceCode")}
        </p>
      </div>

      {/* Three ways back, not one: whatever the visitor was trying to reach,
          at least one of these is probably closer to it than starting over
          from the map alone. */}
      <div
        className={cn("relative z-10 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm", !reduced && "animate-fade-up")}
        style={delay(1.6)}
      >
        <Link to="/" className="text-primary hover:underline">
          {t("notFound.backToMap")}
        </Link>
        <span aria-hidden="true" className="text-border">
          ·
        </span>
        <Link to="/archive" className="text-primary hover:underline">
          {t("notFound.goToArchive")}
        </Link>
        <span aria-hidden="true" className="text-border">
          ·
        </span>
        <Link to="/dashboard" className="text-primary hover:underline">
          {t("notFound.goToDashboard")}
        </Link>
      </div>

      <ExternalAnchor
        href={PHOTO_CREDIT_URL}
        className={cn(
          "relative z-10 text-[11px] text-muted-foreground hover:text-foreground",
          !reduced && "animate-fade-up",
        )}
        style={delay(1.8)}
      >
        {t("notFound.photoCredit")}
      </ExternalAnchor>
    </div>
  );
}
