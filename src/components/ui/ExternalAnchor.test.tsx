import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ExternalAnchor } from "./ExternalAnchor";

describe("ExternalAnchor", () => {
  it("renders its children as a link", () => {
    render(<ExternalAnchor href="https://example.org">Wikipedia</ExternalAnchor>);
    const link = screen.getByRole("link", { name: /wikipedia/i });
    expect(link).toHaveAttribute("href", "https://example.org");
  });

  it("always opens in a new tab with a noreferrer rel, since every use leaves the app", () => {
    render(<ExternalAnchor href="https://example.org">Wikipedia</ExternalAnchor>);
    const link = screen.getByRole("link", { name: /wikipedia/i });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noreferrer");
  });

  it("announces to screen readers that the link opens in a new tab", () => {
    render(<ExternalAnchor href="https://example.org">Wikipedia</ExternalAnchor>);
    // The visible text is "Wikipedia"; the accessible name additionally
    // includes the sr-only "opens in a new tab" span appended after it.
    const link = screen.getByRole("link");
    expect(link).toHaveTextContent("Wikipedia");
    expect(link.querySelector(".sr-only")).not.toBeNull();
  });

  it("merges a caller-provided className with its own base classes", () => {
    render(
      <ExternalAnchor href="https://example.org" className="text-primary">
        Wikipedia
      </ExternalAnchor>,
    );
    const link = screen.getByRole("link");
    expect(link).toHaveClass("text-primary");
    expect(link).toHaveClass("underline");
  });
});
