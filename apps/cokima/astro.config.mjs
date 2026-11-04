import { defineConfig } from "astro/config";
import vercel from "@astrojs/vercel";
import sitemap from "@astrojs/sitemap";
import { resolveSiteUrl } from "@tombo/config/site-url";

export default defineConfig({
  // Dominio pendiente de decisión del cliente: se fija vía SITE_URL (spec §8).
  // Sin SITE_URL, el build de producción falla a propósito (docs/deploy.md).
  site: resolveSiteUrl(),
  output: "static",
  // Las imágenes las optimiza Vercel bajo demanda en vez de sharp en build.
  // Con sharp, el adaptador intenta enlazarlo dentro de la función serverless
  // y el build falla en Windows, donde crear symlinks pide permisos que un
  // build normal no tiene. La única ruta serverless (/api/meta-capi) no toca
  // imágenes, así que no había motivo para arrastrarlo hasta allí.
  adapter: vercel({
    imageService: true,
    // Sin `sizes`, Vercel solo acepta sus anchos por defecto y Astro acaba
    // emitiendo un srcset de un único tamaño grande: un móvil de 390px se
    // descargaría la imagen de 1200px entera, que es lo contrario de lo que
    // buscamos. Estos anchos cubren de 320px a retina de escritorio.
    imagesConfig: {
      sizes: [320, 390, 480, 640, 780, 960, 1200, 1600],
      formats: ["image/avif", "image/webp"],
      minimumCacheTTL: 60 * 60 * 24 * 30,
    },
  }),
  integrations: [sitemap()],
  // Las direcciones, sin barra al final: /carta, y no /carta/, también en la canónica y en el sitemap.
  trailingSlash: "never",
  // La web es Brasa, y desde el 2026-11-04 cada sección tiene su página: /carta y /reservas vuelven a ser
  // las de la web anterior (docs/cokima-el-rediseno.md §3). Las inglesas llevan a la suya en español
  // hasta que haya inglés. La home inglesa va aparte, en src/pages/en/index.astro.
  redirects: {
    "/en/menu": "/carta",
    "/en/reservations": "/reservas",
  },
  i18n: {
    defaultLocale: "es",
    locales: ["es", "en"],
    routing: { prefixDefaultLocale: false },
  },
});
