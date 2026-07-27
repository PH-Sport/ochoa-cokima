import { defineConfig } from "astro/config";
import vercel from "@astrojs/vercel";
import sitemap from "@astrojs/sitemap";
import { resolveSiteUrl } from "@tombo/config/site-url";

export default defineConfig({
  // Dominio pendiente de decisión del cliente: se fija vía SITE_URL (spec §8).
  // Sin SITE_URL, el build de producción falla a propósito (docs/deploy.md).
  site: resolveSiteUrl(),
  output: "static",
  adapter: vercel(),
  integrations: [sitemap()],
  i18n: {
    defaultLocale: "es",
    locales: ["es", "en"],
    routing: { prefixDefaultLocale: false },
  },
});
