import "@testing-library/jest-dom/vitest";
import "@/test/__mocks__/prisma";
import { vi } from "vitest";

import { config } from "dotenv";
config({ path: ".env" });

vi.mock("server-only", () => ({}));
