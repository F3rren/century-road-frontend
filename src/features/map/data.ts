// The map feature's data, without its UI. index.ts also re-exports MapView, which
// drags MapLibre (~1 MB) into any chunk importing from it - a page that only needs
// today's data or the heat levels imports from here instead.
export { useTodayHistory } from './hooks/useTodayHistory';
export { HEAT_LEVELS } from './constants/heat';
