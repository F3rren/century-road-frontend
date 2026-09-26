import { afterEach, describe, expect, it, vi } from "vitest";
import { hasSeenWelcome, markWelcomeSeen, WELCOME_SEEN_STORAGE_KEY } from "./welcomeSeen";

afterEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("hasSeenWelcome / markWelcomeSeen", () => {
  it("is false before the welcome page has ever been marked seen", () => {
    expect(hasSeenWelcome()).toBe(false);
  });

  it("becomes true after marking it seen", () => {
    markWelcomeSeen();
    expect(hasSeenWelcome()).toBe(true);
  });

  it("writes the expected literal value under the expected key", () => {
    markWelcomeSeen();
    expect(localStorage.getItem(WELCOME_SEEN_STORAGE_KEY)).toBe("true");
  });

  it("treats any other stored value as not seen", () => {
    localStorage.setItem(WELCOME_SEEN_STORAGE_KEY, "yes");
    expect(hasSeenWelcome()).toBe(false);
  });

  it("falls back to false, not throwing, when localStorage.getItem throws (private browsing)", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("storage blocked");
    });
    expect(() => hasSeenWelcome()).not.toThrow();
    expect(hasSeenWelcome()).toBe(false);
  });

  it("does not throw when localStorage.setItem throws (private browsing)", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("storage blocked");
    });
    expect(() => markWelcomeSeen()).not.toThrow();
  });
});
