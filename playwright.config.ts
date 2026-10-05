import { defineConfig, devices } from "@playwright/test";

// API, Postgres et seed sont fournis par la CI (job `e2e` de ci.yml).
export default defineConfig({
  testDir: "e2e",
  testMatch: "**/*.e2e.ts",
  globalSetup: "./e2e/global-setup.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: "http://localhost:3001",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "pnpm start -p 3001",
    url: "http://localhost:3001/login",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
