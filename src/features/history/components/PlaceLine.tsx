import { useTranslation } from 'react-i18next';
import type { EditorialPlace } from '../types';

// Where an insight or a stop is. An approximate pin (a launch site standing in for the Moon) is
// said to be one, with the backend's own note: never shown as if it were the place itself.
export function PlaceLine({ place }: { place: EditorialPlace }) {
  const { t } = useTranslation();
  return (
    <span lang="it">
      {place.name}
      {place.approximate && place.note && (
        <span className="block text-muted-foreground">{t('editorial.approximatePlace', { note: place.note })}</span>
      )}
    </span>
  );
}
