import type { Attribution } from '../types';
import { ExternalAnchor } from './ExternalAnchor';

interface AttributionNoticeProps {
  attribution: Attribution;
}

// Wikipedia's text is CC BY-SA 4.0: wherever it is shown, the source and the
// licence have to be visible too. The backend supplies the wording.
export function AttributionNotice({ attribution }: AttributionNoticeProps) {
  return (
    <div className="space-y-1 text-[11px] leading-snug text-muted-foreground">
      <p>{attribution.notice}</p>
      <p>
        Licenza:{' '}
        <ExternalAnchor href={attribution.licenseUrl}>{attribution.license}</ExternalAnchor>.
      </p>
    </div>
  );
}
