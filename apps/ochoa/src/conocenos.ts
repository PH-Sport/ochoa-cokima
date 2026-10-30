/**
 * ¿«Conócenos» sigue en obras?
 *
 * Desde el 2026-10-30 tiene su cuerpo —la casa contada con sus propias frases—,
 * pero Mario lo está revisando en `preview` para pedir cambios. Hasta que lo dé
 * por bueno **no puede llegar a los buscadores**: una página de marca a medias
 * compite con la home por las mismas palabras y sale perdiendo. Con esta
 * bandera en `true` lleva `noindex, follow` y se queda fuera del sitemap (ver
 * `astro.config.mjs`).
 *
 * **Ponerlo en `false` es el único paso que queda** cuando Mario la dé por
 * buena: de ahí salen a la vez el indexado, la entrada en el sitemap y el
 * JSON-LD `AboutPage`. No hay nada más que tocar.
 */
export const EN_OBRAS = true;

/** Las dos rutas, en un solo sitio: las usan las páginas y el filtro del sitemap. */
export const RUTAS_CONOCENOS = ["/conocenos", "/en/about"];
