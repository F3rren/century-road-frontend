import type { Map as MapLibreMap, ProjectionSpecification } from 'maplibre-gl';
import type { ProjectionType } from '../types';

// MapLibre's own setProjection('mercator' | 'globe') swaps in a single frame,
// and a [from, to, fraction] tuple is not honoured (it always renders the
// globe). What does work is a projection *expression* whose input is a global
// state property: 0 renders the flat map, 1 the globe, anything between a
// world that is progressively bent. Driving that property frame by frame is
// the transition.
const BLEND_KEY = 'projectionBlend';

const BLEND_PROJECTION: ProjectionSpecification = {
  type: [
    'interpolate',
    ['linear'],
    ['global-state', BLEND_KEY],
    0,
    'mercator',
    1,
    'vertical-perspective',
  ],
};

// Full flat-to-globe run; a change interrupted halfway takes proportionally less.
const TRANSITION_MS = 900;

function blendOf(projection: ProjectionType): number {
  return projection === 'globe' ? 1 : 0;
}

function easeInOutCubic(progress: number): number {
  return progress < 0.5
    ? 4 * progress ** 3
    : 1 - (-2 * progress + 2) ** 3 / 2;
}

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export interface ProjectionAnimator {
  // Move the map to `target`. The first call only sets the starting
  // projection; later calls animate, unless the user asked for reduced motion.
  goTo: (target: ProjectionType) => void;
  // Stop any running animation where it is (the map keeps that blend, and the
  // next goTo continues from it). Safe to call when nothing is running.
  cancel: () => void;
}

// The map must already have a loaded style when goTo is called.
export function createProjectionAnimator(map: MapLibreMap): ProjectionAnimator {
  // A new map starts flat, whatever projection was asked for.
  let blend = 0;
  let isBlendProjectionActive = false;
  let hasStarted = false;
  let frameId: number | null = null;

  function cancel(): void {
    if (frameId === null) return;
    cancelAnimationFrame(frameId);
    frameId = null;
  }

  // Leave the blend projection for MapLibre's own. Asking for 'globe' while the
  // blend projection is active would be ignored (both are named "globe"), so
  // step through 'mercator' first; no frame is drawn between the two calls.
  function settle(target: ProjectionType): void {
    if (isBlendProjectionActive && target === 'globe') {
      map.setProjection({ type: 'mercator' });
    }
    map.setProjection({ type: target });
    isBlendProjectionActive = false;
    blend = blendOf(target);
  }

  function animate(target: ProjectionType): void {
    const from = blend;
    const to = blendOf(target);
    if (from === to) {
      settle(target);
      return;
    }

    // Set the starting value first so the first frame of the new projection is
    // drawn at the blend the map is already showing (no jump).
    map.setGlobalStateProperty(BLEND_KEY, from);
    if (!isBlendProjectionActive) {
      map.setProjection(BLEND_PROJECTION);
      isBlendProjectionActive = true;
    }

    const duration = TRANSITION_MS * Math.abs(to - from);
    const startedAt = performance.now();

    const step = (now: number): void => {
      // The frame timestamp can precede startedAt (it is when the frame began,
      // not when it ran), so clamp on both ends or the first step overshoots.
      const progress = Math.min(1, Math.max(0, (now - startedAt) / duration));
      blend = from + (to - from) * easeInOutCubic(progress);
      map.setGlobalStateProperty(BLEND_KEY, blend);

      if (progress < 1) {
        frameId = requestAnimationFrame(step);
        return;
      }
      frameId = null;
      settle(target);
    };
    frameId = requestAnimationFrame(step);
  }

  function goTo(target: ProjectionType): void {
    cancel();
    const shouldAnimate = hasStarted && !prefersReducedMotion();
    hasStarted = true;

    if (shouldAnimate) animate(target);
    else settle(target);
  }

  return { goTo, cancel };
}
