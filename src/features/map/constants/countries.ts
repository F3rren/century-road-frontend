// Natural Earth's 1:10m admin-0 country boundaries, simplified, 239 shapes with their ISO 3166-1
// codes: the microstates and the small territories the 1:110m file left out are in (the Vatican,
// Monaco, San Marino, Singapore, Malta, the Maldives...), and so are Kosovo, Tuvalu and Gibraltar.
// It is built, not downloaded: scripts/build-countries.mjs says from what, and what it decides.
//
// Shared by MapView (drawing the heatmap/click targets) and lib/countryGeometry (locating a point
// in a country) so both always agree on the exact same shapes - using two different resolutions
// would let the heatmap's fill colors and its own "which country is this point in" lookup
// silently disagree at a border. Part of the bundle (hashed, same origin), not a third party's
// server. The backend's country index still uses 1:110m, see docs/architecture.md.
import countriesUrl from '@/assets/geo/countries.json?url';

export const COUNTRIES_GEOJSON_URL = countriesUrl;
