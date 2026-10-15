import { SurpriseButton } from './SurpriseButton';
import { SurpriseResult } from './SurpriseResult';
import { useSurprise, type SurpriseFilters } from '../hooks/useSurprise';

// The button and its answer together, for a page with room for both (Il mio secolo, the
// Archive): a fragment, so it sits in the caller's row, with the answer on a line of its own.
export function Surprise(filters: SurpriseFilters) {
  const { outcome, draw } = useSurprise(filters);
  return (
    <>
      <SurpriseButton outcome={outcome} onDraw={draw} />
      <SurpriseResult outcome={outcome} className="basis-full" />
    </>
  );
}
