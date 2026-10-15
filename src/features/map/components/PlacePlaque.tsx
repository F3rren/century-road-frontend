import { X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { MapOverlayPanel } from '@/components/ui/MapOverlayPanel';
import { insightRoute, type InsightDetail } from '@/features/history';

interface PlacePlaqueProps {
  insight: InsightDetail;
  onClear: () => void;
}

// What the pin on the map is: the insight it belongs to and its place, on a Prussian plaque like
// the legend. An approximate pin (a launch site standing in for the Moon) says so, with the
// backend's note, instead of passing as the place itself.
export function PlacePlaque({ insight, onClear }: PlacePlaqueProps) {
  const { t } = useTranslation();
  const { place } = insight;
  return (
    <MapOverlayPanel className="max-w-[16rem] px-3 py-2 text-white" role="note" aria-label={t('map.place.ariaLabel')}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-eyebrow text-white/80">{t('map.place.heading')}</p>
        <Button
          type="button"
          variant="overlay"
          size="icon"
          onClick={onClear}
          aria-label={t('map.place.clear')}
          className="-mr-3 -mt-3"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
      <div lang="it" className="space-y-1">
        <p className="font-display text-base font-semibold leading-snug">{insight.title}</p>
        <p className="text-sm text-white/80">{place.name}</p>
        {place.approximate && place.note && (
          <p className="text-sm text-white/80">{t('editorial.approximatePlace', { note: place.note })}</p>
        )}
      </div>
      <Button asChild variant="overlay" size="sm" className="-ml-4 mt-1 underline">
        <Link to={insightRoute(insight.slug)}>{t('map.place.read')}</Link>
      </Button>
    </MapOverlayPanel>
  );
}
