import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

const serverOnlyMockPath = new URL(
  "./test/__mocks__/server-only.ts",
  import.meta.url
).pathname;

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  resolve: {
    alias: {
      "server-only": serverOnlyMockPath,
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
    include: ["test/**/*.test.{ts,tsx}"],
  },
});
