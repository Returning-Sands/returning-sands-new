import { defineConfig, devices } from "@playwright/test";

const PORT = 3000;
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "tests",
  // Only browser suites; Vitest owns tests/unit/**.
  testMatch: ["a11y/**/*.spec.ts", "e2e/**/*.spec.ts"],
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // One `next start` process serves every worker; with the default worker
  // count (half the cores) page loads queue behind on-demand `next/image`
  // optimisation and `load` can exceed 30 s on a laptop. Cap the workers and
  // give each test a minute; axe analysis alone takes 5–15 s on a full page.
  workers: process.env.CI ? 2 : 4,
  timeout: 60_000,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  // Playwright boots the production build (`next start`), per the Next docs.
  webServer: {
    command: "npm run start",
    port: PORT,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 375, height: 667 },
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
});
