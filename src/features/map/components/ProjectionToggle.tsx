import { Globe, Map as MapFlat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MapOverlayPanel } from '@/components/ui/MapOverlayPanel';
import type { ProjectionType } from '../types';

interface ProjectionToggleProps {
  value: ProjectionType;
  onChange: (projection: ProjectionType) => void;
}

const options: { value: ProjectionType; label: string; Icon: typeof Globe }[] = [
  { value: 'mercator', label: 'Pianisfero', Icon: MapFlat },
  { value: 'globe',    label: 'Globo',      Icon: Globe },
];

export function ProjectionToggle({ value, onChange }: ProjectionToggleProps) {
  return (
    <MapOverlayPanel className="flex items-stretch divide-x divide-white/15" role="group" aria-label="Proiezione mappa">
      {options.map(({ value: opt, label, Icon }) => (
        <Button
          key={opt}
          type="button"
          variant={value === opt ? 'overlayActive' : 'overlay'}
          size="pill"
          onClick={() => onChange(opt)}
          aria-pressed={value === opt}
        >
          <Icon className="h-3.5 w-3.5 shrink-0" />
          {/* Below sm: icon-only, so this control plus HeatLegend (opposite
              top corner) never crowd a narrow viewport. The label stays
              in the accessible name at every width via sr-only. */}
          <span className="sr-only sm:not-sr-only">{label}</span>
        </Button>
      ))}
    </MapOverlayPanel>
  );
}
