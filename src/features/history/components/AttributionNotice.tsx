import { useTranslation } from 'react-i18next';
import type { Attribution } from '../types';
import { ExternalAnchor } from '@/components/ui/ExternalAnchor';

interface AttributionNoticeProps {
  attribution: Attribution;
}

// Wikipedia's text is CC BY-SA 4.0: wherever it is shown, the source and the
// licence have to be visible too. The backend supplies the wording.
export function AttributionNotice({ attribution }: AttributionNoticeProps) {
  const { t } = useTranslation();
  return (
    <div className="max-w-measure space-y-1 text-xs leading-snug text-muted-foreground">
      <p>{attribution.notice}</p>
      <p>
        {t('history.attribution.licenseLabel')}:{' '}
        <ExternalAnchor href={attribution.licenseUrl}>{attribution.license}</ExternalAnchor>.
      </p>
    </div>
  );
}
