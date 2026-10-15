import { Shuffle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import type { SurpriseOutcome } from '../hooks/useSurprise';

interface SurpriseButtonProps {
  outcome: SurpriseOutcome;
  onDraw: () => void;
  className?: string;
}

// "Sorprendimi", and "Un altro evento" once there is one on screen.
export function SurpriseButton({ outcome, onDraw, className }: SurpriseButtonProps) {
  const { t } = useTranslation();
  return (
    <Button
      type="button"
      variant="outline"
      className={className}
      disabled={outcome.kind === 'loading'}
      onClick={onDraw}
    >
      <Shuffle className="h-4 w-4" aria-hidden="true" />
      {outcome.kind === 'found' ? t('discovery.surprise.another') : t('discovery.surprise.button')}
    </Button>
  );
}
