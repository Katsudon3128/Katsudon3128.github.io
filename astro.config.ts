import { defineConfig } from "astro/config";
import { siteConfig } from "./src/config/site";

const runtime = globalThis as typeof globalThis & {
  process?: { env?: Record<string, string | undefined> };
};
const isBrowserTestBuild =
  runtime.process?.env?.ASTRO_BROWSER_TEST_BUILD === "1";

export default defineConfig({
  output: "static",
  outDir: isBrowserTestBuild ? "./dist-test" : "./dist",
  site: siteConfig.url,
  trailingSlash: "always",
  image: {
    // Article images are trusted, version-controlled local assets.
    dangerouslyProcessSVG: true,
  },
});
