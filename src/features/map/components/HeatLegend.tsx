import { useState } from 'react';
import { Info, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { MapOverlayPanel } from '@/components/ui/MapOverlayPanel';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { HEAT_LEVELS } from '../constants/heat';

export function HeatLegend() {
  const { t } = useTranslation();
  // ProjectionToggle (opposite top corner) already goes icon-only below sm
  // specifically so it plus this panel never crowd a narrow viewport — but
  // at its full ~13rem width, an always-open legend does exactly that on
  // its own: it was covering a third of a phone screen's worth of map.
  // Desktop keeps the always-open panel (unchanged); mobile starts
  // collapsed to a single 44px icon button, matching ProjectionToggle's
  // own touch targets.
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const [expanded, setExpanded] = useState(isDesktop);
  const [prevIsDesktop, setPrevIsDesktop] = useState(isDesktop);
  if (isDesktop !== prevIsDesktop) {
    setPrevIsDesktop(isDesktop);
    setExpanded(isDesktop);
  }

  if (!isDesktop && !expanded) {
    return (
      <MapOverlayPanel className="inline-flex">
        <Button
          type="button"
          variant="overlay"
          size="icon"
          onClick={() => setExpanded(true)}
          aria-label={t('map.legend.ariaLabel')}
        >
          <Info className="h-4 w-4" />
        </Button>
      </MapOverlayPanel>
    );
  }

  return (
    <MapOverlayPanel className="flex max-w-[13rem] flex-col gap-1.5 px-3 py-2" role="note" aria-label={t('map.legend.ariaLabel')}>
      <div className="flex items-center justify-between gap-2">
        <p className="font-display text-eyebrow uppercase text-white/70">
          {t('map.legend.today')}
        </p>
        {!isDesktop && (
          <button
            type="button"
            onClick={() => setExpanded(false)}
            aria-label={t('map.legend.close')}
            className="-m-1.5 p-1.5 text-white/70 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      {[...HEAT_LEVELS].reverse().map(({ color, labelKey }) => (
        <div key={labelKey} className="flex items-center gap-2">
          <span
            className="h-3 w-3 shrink-0"
            style={{ backgroundColor: color }}
          />
          <span className="text-xs text-white/90">{t(`map.legend.level.${labelKey}`)}</span>
        </div>
      ))}
      {/* Honest about the heuristic: the API gives no country per event, only
          coordinates on some linked articles, matched against simplified
          country borders — see features/map/lib/geocodeEntries. */}
      <p className="mt-0.5 border-t border-white/15 pt-1.5 text-[11px] leading-snug text-white/60">
        {t('map.legend.methodology')}
      </p>
    </MapOverlayPanel>
  );
}
