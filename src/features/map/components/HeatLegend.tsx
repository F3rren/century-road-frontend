import { MapOverlayPanel } from '@/components/ui/MapOverlayPanel';
import { HEAT_LEVELS } from '../constants/heat';

export function HeatLegend() {
  return (
    <MapOverlayPanel className="flex max-w-[13rem] flex-col gap-1.5 px-3 py-2" role="note" aria-label="Legenda intensità eventi">
      <p className="font-display text-eyebrow uppercase text-white/70">
        Oggi
      </p>
      {[...HEAT_LEVELS].reverse().map(({ color, label }) => (
        <div key={label} className="flex items-center gap-2">
          <span
            className="h-3 w-3 shrink-0"
            style={{ backgroundColor: color }}
          />
          <span className="text-xs text-white/90">{label}</span>
        </div>
      ))}
      {/* Honest about the heuristic: the API gives no country per event, only
          coordinates on some linked articles, matched against simplified
          country borders — see features/map/lib/geocodeEntries. */}
      <p className="mt-0.5 border-t border-white/15 pt-1.5 text-[11px] leading-snug text-white/60">
        Paese dedotto dal primo articolo collegato con coordinate
      </p>
    </MapOverlayPanel>
  );
}
