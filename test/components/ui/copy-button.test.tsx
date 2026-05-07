import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CopyButton } from "@/components/ui/copy-button";

describe("CopyButton", () => {
  it("copies text and shows the copied state", async () => {
    vi.useFakeTimers();

    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });

    render(<CopyButton text="portal-cui" duration={20} loadingDuration={10} />);

    const button = screen.getByRole("button", { name: /copy/i });
    fireEvent.click(button);

    expect(writeText).toHaveBeenCalledWith("portal-cui");
    expect(button).toBeDisabled();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(10);
    });

    expect(screen.getByRole("button", { name: /copied/i })).toBeInTheDocument();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(20);
    });

    expect(screen.getByRole("button", { name: /copy/i })).toBeEnabled();

    vi.useRealTimers();
  });
});
