import { describe, expect, it } from "vitest";
import i18n from "@/i18n";
import type { GeocodedEntry } from "@/features/map";
import { computeStats } from "./computeStats";

const { t } = i18n;

function entry(overrides: Partial<GeocodedEntry["entry"]> = {}): GeocodedEntry["entry"] {
  return { text: "An event.", pages: [], ...overrides };
}

describe("computeStats", () => {
  it("returns an empty array when there are no geocoded events", () => {
    expect(computeStats([], t)).toEqual([]);
  });

  it("counts the total number of events regardless of geocoding", () => {
    const events: GeocodedEntry[] = [
      { entry: entry(), country: null },
      { entry: entry(), country: { code: "IT", name: "Italy" } },
    ];
    const stats = computeStats(events, t);
    expect(stats.find((s) => s.id === "events")?.value).toBe("2");
  });

  it("counts distinct countries, not distinct events", () => {
    const events: GeocodedEntry[] = [
      { entry: entry({ year: 1990 }), country: { code: "IT", name: "Italy" } },
      { entry: entry({ year: 1991 }), country: { code: "IT", name: "Italy" } },
      { entry: entry({ year: 1992 }), country: { code: "FR", name: "France" } },
    ];
    const stats = computeStats(events, t);
    expect(stats.find((s) => s.id === "countries")?.value).toBe("2");
  });

  it("never counts an ungeocoded event toward the country total", () => {
    const events: GeocodedEntry[] = [
      { entry: entry(), country: null },
      { entry: entry(), country: null },
    ];
    const stats = computeStats(events, t);
    expect(stats.find((s) => s.id === "countries")?.value).toBe("0");
  });

  it("reports the most-cited country by event count, not alphabetically", () => {
    const events: GeocodedEntry[] = [
      { entry: entry(), country: { code: "FR", name: "France" } },
      { entry: entry(), country: { code: "IT", name: "Italy" } },
      { entry: entry(), country: { code: "IT", name: "Italy" } },
    ];
    const stats = computeStats(events, t);
    expect(stats.find((s) => s.id === "top-country")?.value).toBe("Italy");
  });

  it("spans from the earliest to the latest year among events that have one", () => {
    const events: GeocodedEntry[] = [
      { entry: entry({ year: 1990 }), country: null },
      { entry: entry(), country: null }, // no year (e.g. a holiday) - excluded from the span
      { entry: entry({ year: 1215 }), country: null },
    ];
    const stats = computeStats(events, t);
    expect(stats.find((s) => s.id === "span")?.value).toBe("1215–1990");
  });

  it("shows an em dash for the span when no event carries a year", () => {
    const events: GeocodedEntry[] = [{ entry: entry(), country: null }];
    const stats = computeStats(events, t);
    expect(stats.find((s) => s.id === "span")?.value).toBe("—");
  });

  it("shows an em dash for the top country when nothing was geocoded", () => {
    const events: GeocodedEntry[] = [{ entry: entry(), country: null }];
    const stats = computeStats(events, t);
    expect(stats.find((s) => s.id === "top-country")?.value).toBe("—");
    expect(stats.find((s) => s.id === "top-country")?.detail).toBeUndefined();
  });
});
