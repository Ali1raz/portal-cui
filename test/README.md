# Testing Guidelines

This project uses [Vitest](https://vitest.dev/) for unit and component testing, combined with [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) for DOM assertions.

## Running Tests

All configuration is handled in `vitest.config.ts`, and test files must be located inside the `test/` directory, following the `*.test.ts` or `*.test.tsx` naming convention.

- **Run all tests once:**
  ```bash
  pnpm test
  ```
- **Run tests in watch mode (reruns on file changes):**
  ```bash
  pnpm test:watch
  ```
- **Run specific tests (e.g., only "button" tests):**
  ```bash
  pnpm test button
  ```

## Writing Tests

Place all tests inside the `test/` directory, mimicking the structure of the `src/` or `app/` folder.

For example, tests for `app/(auth)/register/_components/register-form.tsx` live in `test/app/(auth)/register/_components/register-form.test.tsx`.

### Basic Component Test Example

```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("renders correctly", () => {
    // 1. Render the component
    render(<Button>Click me</Button>);

    // 2. Select elements
    const button = screen.getByRole("button", { name: /click me/i });

    // 3. Make assertions
    expect(button).toBeInTheDocument();
  });
});
```

### Testing Interactivity Example

Use `@testing-library/user-event` to simulate user interactions.

```tsx
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MyForm } from "@/components/my-form";

it("submits the form", async () => {
  const user = userEvent.setup();
  render(<MyForm />);

  // Type into an input
  await user.type(screen.getByLabelText(/email/i), "test@example.com");

  // Click a button
  await user.click(screen.getByRole("button", { name: /submit/i }));

  // Wait for async actions using waitFor
  await waitFor(() => {
    expect(screen.getByText(/success/i)).toBeInTheDocument();
  });
});
```

## Mocking Dependencies

When testing components that rely on external libraries (like `next/navigation` or server actions), you should mock those dependencies using Vitest's `vi.mock()`.

**Important:** Mock declarations are hoisted, so they must be at the very top level of your file!

```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, type Mock } from "vitest";
import { useRouter } from "next/navigation";
import { myServerAction } from "@/app/actions";

// 1. Define the mocks
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

vi.mock("@/app/actions", () => ({
  myServerAction: vi.fn(),
}));

describe("MyComponent", () => {
  it("calls server action and redirects on success", async () => {
    const mockPush = vi.fn();

    // 2. Setup mock implementations
    (useRouter as Mock).mockReturnValue({ push: mockPush });
    (myServerAction as Mock).mockResolvedValue({ status: "success" });

    render(<MyComponent />);
    // ... simulate user interaction ...

    // 3. Assert on the mocks
    expect(myServerAction).toHaveBeenCalledWith({ data: "example" });
    expect(mockPush).toHaveBeenCalledWith("/success");
  });
});
```

## Prisma Client Mocking (Vitest)

Prisma Client is globally mocked in [vitest.setup.ts](../vitest.setup.ts) via
[test/**mocks**/prisma.ts](./__mocks__/prisma.ts). This follows the Prisma testing
series pattern using `vitest-mock-extended` deep mocks.

For unit tests that call DB code:

1. Import `prismaMock` from `@/test/__mocks__/prisma`
2. Mock dependent modules (for example `requireSession`, `requirePermission`)
3. Set Prisma responses with `mockResolvedValue`, `mockResolvedValueOnce`,
   `mockImplementation`, etc.

Example:

```ts
import { prismaMock } from "@/test/__mocks__/prisma";

prismaMock.user.findUnique.mockResolvedValue({ id: "user-1" } as never);
prismaMock.$transaction.mockResolvedValue([10, 4, 3, 2] as never);
```

## Available Custom Matchers

Because we include `jest-dom` via `vitest.setup.ts`, you have access to powerful DOM matchers:

- `.toBeInTheDocument()`
- `.toHaveClass('bg-red-500')`
- `.toBeDisabled()`
- `.toHaveTextContent('Hello')`
- `.toBeVisible()`

For the full list of matchers, see [testing-library/jest-dom](https://github.com/testing-library/jest-dom).
