import { defineConfig } from "astro/config";
import { siteConfig } from "./src/config/site";

export default defineConfig({
  output: "static",
  site: siteConfig.url,
  trailingSlash: "always",
  image: {
    // Article images are trusted, version-controlled local assets.
    dangerouslyProcessSVG: true,
  },
});
