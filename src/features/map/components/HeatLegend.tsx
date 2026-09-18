import { MapOverlayPanel } from '@/components/ui/MapOverlayPanel';
import { HEAT_LEVELS } from '../constants/heat';

export function HeatLegend() {
  return (
    <MapOverlayPanel className="flex flex-col gap-1.5 px-3 py-2" role="note" aria-label="Legenda intensità eventi">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-white/70">
        Oggi nel '900
      </p>
      {[...HEAT_LEVELS].reverse().map(({ color, label }) => (
        <div key={label} className="flex items-center gap-2">
          <span
            className="h-3 w-3 shrink-0 rounded-sm"
            style={{ backgroundColor: color }}
          />
          <span className="text-xs text-white/90">{label}</span>
        </div>
      ))}
    </MapOverlayPanel>
  );
}
