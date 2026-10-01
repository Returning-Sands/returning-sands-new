import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// `.mts` so Vite loads the config as ESM (the Next.js Vitest guide uses the
// same extension). `resolve.tsconfigPaths` honours the `@/*` alias from
// tsconfig.json natively, replacing the vite-tsconfig-paths plugin.
export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: "jsdom",
    include: ["tests/unit/**/*.test.ts?(x)"],
    setupFiles: ["tests/unit/setup.ts"],
  },
});
