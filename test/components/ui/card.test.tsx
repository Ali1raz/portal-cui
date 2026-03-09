import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

describe("Card", () => {
  it("renders a complete card layout properly", () => {
    // Render a typical card structure
    render(
      <Card data-testid="test-card">
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card Description</CardDescription>
          <CardAction>
            <button>Action</button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <p>This is the main content</p>
        </CardContent>
        <CardFooter>
          <span>Footer note</span>
        </CardFooter>
      </Card>
    );

    // Check all sub-components render correctly
    expect(screen.getByTestId("test-card")).toBeInTheDocument();
    expect(screen.getByText("Card Title")).toBeInTheDocument();
    expect(screen.getByText("Card Description")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Action" })).toBeInTheDocument();
    expect(screen.getByText("This is the main content")).toBeInTheDocument();
    expect(screen.getByText("Footer note")).toBeInTheDocument();
  });

  it("renders Title with correct semantic grouping", () => {
    render(
      <CardHeader>
        <CardTitle>Just Title</CardTitle>
      </CardHeader>
    );

    const title = screen.getByText("Just Title");
    expect(title).toBeInTheDocument();
    expect(title).toHaveClass("font-semibold");
  });

  it("merges custom classNames correctly for CardContent", () => {
    render(
      <CardContent className="bg-red-500 test-padding" data-testid="content">
        Content
      </CardContent>
    );

    const content = screen.getByTestId("content");
    expect(content).toHaveClass("px-6"); // default base class
    expect(content).toHaveClass("bg-red-500");
    expect(content).toHaveClass("test-padding");
  });
});
