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

  describe("with an address that is not a web URL", () => {
    it.each(["javascript:alert(1)", " JavaScript:alert(1)", "data:text/html,<b>x</b>", "vbscript:msgbox(1)", "/just/a/path", ""])(
      "shows the text and links nothing for %j",
      (href) => {
        render(<ExternalAnchor href={href}>Wikipedia</ExternalAnchor>);
        expect(screen.queryByRole("link")).not.toBeInTheDocument();
        expect(screen.getByText("Wikipedia")).toBeInTheDocument();
      },
    );

    it("shows the text and links nothing when there is no address at all", () => {
      render(<ExternalAnchor>Wikipedia</ExternalAnchor>);
      expect(screen.queryByRole("link")).not.toBeInTheDocument();
      expect(screen.getByText("Wikipedia")).toBeInTheDocument();
    });

    it("does not announce a new tab it will not open", () => {
      const { container } = render(<ExternalAnchor href="javascript:alert(1)">Wikipedia</ExternalAnchor>);
      expect(container.querySelector(".sr-only")).toBeNull();
      expect(container.querySelector("[href], [target]")).toBeNull();
    });
  });

  it("still links an uppercase scheme, which is a web URL all the same", () => {
    render(<ExternalAnchor href="HTTPS://example.org">Wikipedia</ExternalAnchor>);
    expect(screen.getByRole("link")).toHaveAttribute("target", "_blank");
  });
});
