import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Badge, BadgeButton, BadgeDot } from "@/components/ui/badge";

describe("Badge", () => {
  it("renders correctly", () => {
    // Need to use getByText since it renders as a span by default
    render(<Badge>New Item</Badge>);
    const badge = screen.getByText("New Item");
    expect(badge).toBeInTheDocument();
  });

  it("applies standard variants correctly", () => {
    render(<Badge variant="destructive">Error</Badge>);
    const badge = screen.getByText("Error");

    expect(badge).toHaveClass("bg-destructive");
    expect(badge).toHaveClass("text-destructive-foreground");
  });

  it("renders as a child element when asChild is provided", () => {
    // The Slot component renders the direct child rather than a span wrapper
    const { container } = render(
      <Badge asChild variant="primary">
        <a href="/test">Link Badge</a>
      </Badge>
    );

    const link = screen.getByRole("link", { name: "Link Badge" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveClass("bg-primary");

    // Check that it's actually an anchor tag
    expect(container.querySelector("a")).toBeInTheDocument();
    expect(container.querySelector("span")).not.toBeInTheDocument();
  });
});

describe("Badge Components", () => {
  it("renders BadgeButton with appropriate role", () => {
    render(
      <Badge>
        Pill <BadgeButton aria-label="Remove" />
      </Badge>
    );

    const button = screen.getByRole("button", { name: "Remove" });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass("cursor-pointer");
  });

  it("renders BadgeDot correctly", () => {
    render(<BadgeDot aria-label="Status dot" />);

    const dot = screen.getByLabelText("Status dot");
    expect(dot).toBeInTheDocument();
    expect(dot).toHaveClass("rounded-full");
  });
});
