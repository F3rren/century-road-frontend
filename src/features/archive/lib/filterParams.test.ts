import { describe, expect, it } from "vitest";
import { defaultFilters, parseFilters, toSearchParams } from "./filterParams";
import type { ArchiveFilters } from "../types";

describe("defaultFilters", () => {
  it("defaults to today's date, the plain events section, and no year/text filter", () => {
    const filters = defaultFilters();
    expect(filters.fromYear).toBeNull();
    expect(filters.toYear).toBeNull();
    expect(filters.types).toEqual(["events"]);
    expect(filters.query).toBe("");
    expect(filters.month).toBeGreaterThanOrEqual(1);
    expect(filters.month).toBeLessThanOrEqual(12);
  });
});

describe("parseFilters", () => {
  it("falls back to today's defaults when the URL carries no params at all", () => {
    const result = parseFilters(new URLSearchParams());
    expect(result).toEqual(defaultFilters());
  });

  it("reads month/day/types/from/to/lang/q from the URL", () => {
    const params = new URLSearchParams(
      "month=10&day=16&from=1900&to=1999&types=events,births&lang=en&q=maastricht",
    );
    const result = parseFilters(params);
    expect(result).toEqual({
      month: 10,
      day: 16,
      fromYear: 1900,
      toYear: 1999,
      types: ["events", "births"],
      lang: "en",
      query: "maastricht",
    });
  });

  it("clamps an out-of-range month into 1-12", () => {
    expect(parseFilters(new URLSearchParams("month=13&day=1")).month).toBe(12);
    // -5, not 0: `Number(params.get('month')) || fallback.month` treats a
    // falsy 0 as "absent" and substitutes today's month instead of clamping
    // it - see parseFilters. A genuinely out-of-range non-zero value is what
    // actually exercises the clamp.
    expect(parseFilters(new URLSearchParams("month=-5&day=1")).month).toBe(1);
  });

  it("treats month=0 as absent (falsy) and falls back to today's month rather than clamping it", () => {
    expect(parseFilters(new URLSearchParams("month=0&day=1")).month).toBe(defaultFilters().month);
  });

  it("clamps the day to what the (already-clamped) month actually has", () => {
    // February never has more than 29 days in this app's own calendar rules.
    expect(parseFilters(new URLSearchParams("month=2&day=31")).day).toBe(29);
  });

  it("keeps the requested types in the app's own canonical order, not the URL's order", () => {
    const result = parseFilters(new URLSearchParams("month=1&day=1&types=holidays,events"));
    expect(result.types).toEqual(["events", "holidays"]);
  });

  it("drops unknown type keys silently rather than erroring", () => {
    const result = parseFilters(new URLSearchParams("month=1&day=1&types=events,nonsense"));
    expect(result.types).toEqual(["events"]);
  });

  it("falls back to the default types when every requested type is unknown", () => {
    const result = parseFilters(new URLSearchParams("month=1&day=1&types=nonsense"));
    expect(result.types).toEqual(defaultFilters().types);
  });

  it("treats a non-numeric year as absent rather than as NaN", () => {
    const result = parseFilters(new URLSearchParams("month=1&day=1&from=soon"));
    expect(result.fromYear).toBeNull();
  });

  it("falls back to the default language for an unsupported lang value", () => {
    const result = parseFilters(new URLSearchParams("month=1&day=1&lang=de"));
    expect(result.lang).toBe(defaultFilters().lang);
  });

  it("never throws on a malformed/hand-edited URL", () => {
    expect(() => parseFilters(new URLSearchParams("month=abc&day=xyz&from=&to=&types="))).not.toThrow();
  });
});

describe("toSearchParams", () => {
  const base: ArchiveFilters = {
    month: 10,
    day: 16,
    fromYear: null,
    toYear: null,
    types: ["events"],
    lang: defaultFilters().lang,
    query: "",
  };

  it("always writes month and day", () => {
    const params = toSearchParams(base);
    expect(params.get("month")).toBe("10");
    expect(params.get("day")).toBe("16");
  });

  it("omits from/to/types/lang/q when they match the unset/default state", () => {
    const params = toSearchParams(base);
    expect(params.has("from")).toBe(false);
    expect(params.has("to")).toBe(false);
    expect(params.has("q")).toBe(false);
    // types is written whenever non-empty (base has "events"), by design.
    expect(params.get("types")).toBe("events");
    expect(params.has("lang")).toBe(false);
  });

  it("writes lang only when it differs from the default language", () => {
    const params = toSearchParams({ ...base, lang: base.lang === "it" ? "en" : "it" });
    expect(params.get("lang")).toBe(base.lang === "it" ? "en" : "it");
  });

  it("round-trips through parseFilters for a fully-specified filter set", () => {
    const filters: ArchiveFilters = {
      month: 3,
      day: 15,
      fromYear: -44,
      toYear: 1999,
      types: ["events", "births", "deaths"],
      lang: "en",
      query: "caesar",
    };
    const roundTripped = parseFilters(toSearchParams(filters));
    expect(roundTripped).toEqual(filters);
  });
});
