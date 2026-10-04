export interface TodaySummary {
  total: number;
  // null when no event of the day has a year.
  firstYear: number | null;
  lastYear: number | null;
  // Events the map places in a country, and in how many countries.
  placed: number;
  countries: number;
  topCountry: { name: string; count: number } | null;
}

// One column of the century chart: the century's first year (1900, or -100
// for 100-1 BC) and how many of today's events fall in it.
export interface CenturyGrains {
  start: number;
  count: number;
}
