import { describe, expect, it } from "vitest";
import { centuryRange, daysInMonth, describeEventDate, formatEventDate, monthNames, randomMonthDay, todayMonthDay } from "./months";

describe("daysInMonth", () => {
  it("returns 31 for a 31-day month", () => {
    expect(daysInMonth(1)).toBe(31);
  });

  it("returns 30 for a 30-day month", () => {
    expect(daysInMonth(4)).toBe(30);
  });

  it("always treats February as 29 days, ignoring the actual year", () => {
    // Deliberate: the on-this-day API treats 2/29 as always valid regardless
    // of which year is asked for alongside it — see the source comment.
    expect(daysInMonth(2)).toBe(29);
  });

  it("falls back to 31 for a month past the end of the array", () => {
    expect(daysInMonth(13)).toBe(31);
  });

  it("returns 0, not a 31 fallback, for month 0 - it's an in-bounds read of the array's own unused padding slot, not a missing index", () => {
    expect(daysInMonth(0)).toBe(0);
  });
});

describe("todayMonthDay", () => {
  it("returns the local calendar day in 1-indexed month/day shape", () => {
    const now = new Date();
    const result = todayMonthDay();
    expect(result.month).toBe(now.getMonth() + 1);
    expect(result.day).toBe(now.getDate());
  });
});

describe("randomMonthDay", () => {
  it("always lands on a day that actually exists in its month", () => {
    for (let i = 0; i < 200; i++) {
      const { month, day } = randomMonthDay();
      expect(month).toBeGreaterThanOrEqual(1);
      expect(month).toBeLessThanOrEqual(12);
      expect(day).toBeGreaterThanOrEqual(1);
      expect(day).toBeLessThanOrEqual(daysInMonth(month));
    }
  });
});

describe("monthNames", () => {
  it("returns 13 entries, 1-indexed with a blank padding entry at [0]", () => {
    const names = monthNames("en");
    expect(names).toHaveLength(13);
    expect(names[0]).toBe("");
  });

  it("localizes month names per language", () => {
    expect(monthNames("en")[1]).toBe("January");
    expect(monthNames("it")[1].toLowerCase()).toBe("gennaio");
  });

  it("caches the result per language (same reference on a second call)", () => {
    expect(monthNames("en")).toBe(monthNames("en"));
  });
});

describe("formatEventDate", () => {
  it("formats a day+month with no year for a holiday (year omitted)", () => {
    expect(formatEventDate(22, 9, undefined, "en")).toBe("September 22");
  });

  it("formats a day+month with no year when year is explicitly null", () => {
    expect(formatEventDate(22, 9, null, "en")).toBe("September 22");
  });

  it("appends a plain year for a positive (CE) year", () => {
    expect(formatEventDate(22, 9, 1236, "en")).toBe("September 22 1236");
  });

  it("spells out a negative (BCE) year with the era suffix instead of a bare minus sign", () => {
    const result = formatEventDate(15, 3, -44, "it");
    expect(result).not.toContain("-44");
    expect(result).toContain("44");
    expect(result.toLowerCase()).toContain("a.c.");
  });

  it("stays valid on 29 February (2000 is used as the reference year, a leap year)", () => {
    expect(() => formatEventDate(29, 2, undefined, "en")).not.toThrow();
    expect(formatEventDate(29, 2, undefined, "en")).toBe("February 29");
  });
});

describe("centuryRange", () => {
  it("spans a hundred years from the start of the common-era century", () => {
    expect(centuryRange(1900, "it")).toBe("1900–1999");
  });

  it("counts down before the common era, with the era suffix", () => {
    expect(centuryRange(-100, "it")).toBe("100–1 a.C.");
    expect(centuryRange(-500, "it")).toBe("500–401 a.C.");
  });
});

describe("describeEventDate", () => {
  const now = new Date(Date.UTC(2026, 9, 3));

  it("spells out the weekday for a Gregorian date, and how long ago it was", () => {
    expect(describeEventDate(3, 10, 1954, "it", now)).toEqual({ date: "domenica 3 ottobre 1954", ago: "72 anni fa" });
  });

  it("shows no weekday before 1583, when the sources count in the Julian calendar", () => {
    expect(describeEventDate(3, 10, 1283, "it", now).date).toBe("3 ottobre 1283");
  });

  it("counts across the missing year 0 for a date before the common era", () => {
    expect(describeEventDate(15, 3, -44, "it", now)).toEqual({ date: "15 marzo 44 a.C.", ago: "2069 anni fa" });
  });

  it("words last year and this year the way the language does", () => {
    expect(describeEventDate(1, 1, 2025, "en", now).ago).toBe("last year");
    expect(describeEventDate(1, 1, 2026, "en", now).ago).toBe("this year");
  });

  it("has no weekday for 29 February in a year without one", () => {
    expect(describeEventDate(29, 2, 1900, "en", now).date).toBe(formatEventDate(29, 2, 1900, "en"));
  });

  it("gives a holiday (no year) only its day and month", () => {
    expect(describeEventDate(25, 12, undefined, "it", now)).toEqual({ date: "25 dicembre", ago: null });
  });
});
