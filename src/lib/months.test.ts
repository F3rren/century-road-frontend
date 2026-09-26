import { describe, expect, it } from "vitest";
import { daysInMonth, formatEventDate, monthNames, randomMonthDay, todayMonthDay } from "./months";

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
