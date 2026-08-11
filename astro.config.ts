import { defineConfig } from "astro/config";
import { siteConfig } from "./src/config/site";

export default defineConfig({
  output: "static",
  site: siteConfig.url,
  trailingSlash: "always",
});
