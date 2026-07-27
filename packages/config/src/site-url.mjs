/**
 * Resuelve la URL canónica del site (`site` de Astro), de la que salen canonical,
 * hreflang, sitemap y el JSON-LD `Restaurant`.
 *
 * Regla: en producción **no hay fallback**. Un despliegue sin `SITE_URL` debe romper
 * el build, no publicar un dominio inventado (docs/deploy.md).
 *
 * @param {Record<string, string | undefined>} env
 * @returns {string} URL absoluta sin barra final
 */
export function resolveSiteUrl(env = process.env) {
  const raw = env.SITE_URL?.trim();

  if (raw) {
    let url;
    try {
      url = new URL(raw);
    } catch {
      throw new Error(`SITE_URL no es una URL absoluta válida: ${JSON.stringify(raw)}`);
    }
    if (url.protocol !== "https:" && url.protocol !== "http:") {
      throw new Error(`SITE_URL debe usar http(s), no ${url.protocol} (${raw})`);
    }
    return url.href.replace(/\/$/, "");
  }

  if (env.VERCEL_ENV === "production") {
    throw new Error(
      "Falta SITE_URL en el entorno de producción. Defínela en Vercel " +
        "(Settings → Environment Variables) con el dominio definitivo: de ella salen " +
        "canonical, hreflang, sitemap y JSON-LD.",
    );
  }

  // Preview de Vercel: dominio efímero del despliegue, correcto para esa URL.
  if (env.VERCEL_URL) return `https://${env.VERCEL_URL}`;

  // Desarrollo local.
  return "http://localhost:4321";
}
