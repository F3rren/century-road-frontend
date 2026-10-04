import { describe, expect, it } from "vitest";
import type { GeocodedEntry } from "@/features/map";
import { groupByCentury, summarizeToday } from "./computeStats";

function event(year?: number, country: GeocodedEntry["country"] = null): GeocodedEntry {
  return { entry: { text: "An event.", pages: [], year }, country };
}

const italy = { code: "IT", name: "Italy" };
const france = { code: "FR", name: "France" };

describe("summarizeToday", () => {
  it("returns null when there are no events", () => {
    expect(summarizeToday([])).toBeNull();
  });

  it("counts every event, placed or not", () => {
    expect(summarizeToday([event(), event(1990, italy)])?.total).toBe(2);
  });

  it("counts distinct countries, not distinct events", () => {
    const summary = summarizeToday([event(1990, italy), event(1991, italy), event(1992, france)]);
    expect(summary?.countries).toBe(2);
    expect(summary?.placed).toBe(3);
  });

  it("never counts an unplaced event toward the countries", () => {
    const summary = summarizeToday([event(), event()]);
    expect(summary?.countries).toBe(0);
    expect(summary?.placed).toBe(0);
    expect(summary?.topCountry).toBeNull();
  });

  it("reports the most-cited country by event count, not alphabetically", () => {
    expect(summarizeToday([event(1, france), event(2, italy), event(3, italy)])?.topCountry).toEqual({
      name: "Italy",
      count: 2,
    });
  });

  it("spans from the earliest to the latest year among events that have one", () => {
    const summary = summarizeToday([event(1990), event(), event(-44)]);
    expect([summary?.firstYear, summary?.lastYear]).toEqual([-44, 1990]);
  });

  it("has no span when no event carries a year", () => {
    expect(summarizeToday([event()])?.firstYear).toBeNull();
  });
});

describe("groupByCentury", () => {
  it("puts each year in the century starting at its multiple of 100", () => {
    expect(groupByCentury([event(1900), event(1999), event(2000)])).toEqual([
      { start: 1900, count: 2 },
      { start: 2000, count: 1 },
    ]);
  });

  it("rounds years before the common era down, so 44 BC is in 100-1 BC", () => {
    expect(groupByCentury([event(-44), event(-100), event(-101)])).toEqual([
      { start: -200, count: 1 },
      { start: -100, count: 2 },
    ]);
  });

  it("leaves out events without a year and orders centuries oldest first", () => {
    expect(groupByCentury([event(1500), event(), event(-2333)])).toEqual([
      { start: -2400, count: 1 },
      { start: 1500, count: 1 },
    ]);
  });
});
