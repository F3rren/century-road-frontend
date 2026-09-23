// Natural Earth's 110m-resolution admin-0 country boundaries, simplified for
// lightweight rendering. Shared by MapView (drawing the heatmap/click
// targets) and lib/countryGeometry (locating a point in a country) so both
// always agree on the exact same shapes — using two different resolutions
// would let the heatmap's fill colors and its own "which country is this
// point in" lookup silently disagree at a border.
export const COUNTRIES_GEOJSON_URL =
  'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_110m_admin_0_countries.geojson';
