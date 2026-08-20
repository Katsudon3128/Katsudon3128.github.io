import { defineConfig, devices } from "@playwright/test";

const runtime = globalThis as typeof globalThis & {
  process?: { env?: Record<string, string | undefined> };
};
const isCI = Boolean(runtime.process?.env?.CI);

export default defineConfig({
  testDir: "./tests/browser",
  fullyParallel: true,
  reporter: "line",
  use: {
    baseURL: "http://127.0.0.1:4321",
    ...devices["Desktop Chrome"],
    channel: isCI ? undefined : "chrome",
  },
  webServer: {
    command:
      "ASTRO_BROWSER_TEST_BUILD=1 npm run build -- --mode test && node tests/serve-dist.mjs dist-test",
    url: "http://127.0.0.1:4321/projects/",
    reuseExistingServer: false,
  },
});
