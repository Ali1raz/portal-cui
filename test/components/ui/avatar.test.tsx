import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  AvatarIndicator,
  AvatarStatus,
} from "@/components/ui/avatar";

describe("Avatar components", () => {
  it("renders a complete avatar with fallback", () => {
    // Note: Radix UI handles the rendering logic of Image vs Fallback
    // based on image loading state. In jsdom, image loading events don't fire reliably
    // so we typically just test that they mount correctly.
    render(
      <Avatar data-testid="avatar-root">
        <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
        <AvatarFallback data-testid="avatar-fallback">CN</AvatarFallback>
      </Avatar>
    );

    expect(screen.getByTestId("avatar-root")).toBeInTheDocument();
    expect(screen.getByTestId("avatar-root")).toHaveClass(
      "relative flex shrink-0 size-10"
    );
  });

  it("renders the AvatarFallback with text when image fails/is missing", () => {
    render(
      <Avatar>
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
    );

    const fallback = screen.getByText("JD");
    expect(fallback).toBeInTheDocument();
    expect(fallback).toHaveClass(
      "flex h-full w-full items-center justify-center"
    );
  });

  it("renders AvatarStatus with variant classes", () => {
    render(
      <Avatar>
        <AvatarFallback>OP</AvatarFallback>
        <AvatarIndicator>
          <AvatarStatus variant="online" data-testid="status-online" />
        </AvatarIndicator>
      </Avatar>
    );

    const status = screen.getByTestId("status-online");
    expect(status).toBeInTheDocument();
    expect(status).toHaveClass("bg-green-600"); // online variant custom class
  });

  it("renders AvatarStatus with offline variant correctly", () => {
    render(<AvatarStatus variant="offline" data-testid="status-offline" />);
    const status = screen.getByTestId("status-offline");

    expect(status).toHaveClass("bg-zinc-400");
  });
});
