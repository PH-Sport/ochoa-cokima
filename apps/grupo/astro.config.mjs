import { defineConfig } from "astro/config";
import vercel from "@astrojs/vercel";
import sitemap from "@astrojs/sitemap";
import { resolveSiteUrl } from "@tombo/config/site-url";

// La web del grupo (grupotombo.com): una sola página que presenta el grupo y lleva a sus dos casas,
// más las dos legales. Sustituye al WordPress del grupo desde el 2026-11-23 (docs/grupo-tombo-web.md).
export default defineConfig({
  // Sin SITE_URL, el build de producción falla a propósito, como en las otras dos (docs/deploy.md).
  site: resolveSiteUrl(),
  output: "static",
  // Mismo servicio de imágenes y mismos anchos que las otras dos apps; el porqué, en su astro.config.
  adapter: vercel({
    imageService: true,
    imagesConfig: {
      sizes: [320, 390, 480, 640, 780, 960, 1200, 1600],
      formats: ["image/avif", "image/webp"],
      minimumCacheTTL: 60 * 60 * 24 * 30,
    },
  }),
  integrations: [sitemap()],
  trailingSlash: "never",
  // Las páginas del WordPress que había en grupotombo.com. Las de cada casa y sus cartas viejas llevan
  // a su web nueva, para que Google traspase lo que tenían y no compitan con ella; contacto y «trabaja
  // con nosotros» llevan a su bloque de la portada. El adaptador de Vercel las convierte en 301 reales.
  redirects: {
    "/cokima-kitchenmadness": "https://www.cokima.es/",
    "/carta-cokima": "https://www.cokima.es/carta",
    "/tasquita-los-ochoa": "https://www.tasquitalosochoa.es/",
    "/carta-los-ochoa": "https://www.tasquitalosochoa.es/carta/",
    "/contacto": "/#contacto",
    "/trabaja-con-nosotros": "/#trabaja",
  },
});
