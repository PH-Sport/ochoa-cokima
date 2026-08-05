/**
 * ¿«Conócenos» sigue en obras?
 *
 * La página está montada y navegable, pero su cuerpo son huecos a la espera de
 * la historia real del restaurante. Mientras eso siga así **no puede llegar a
 * los buscadores**: una página de marca vacía compite con la home por las
 * mismas palabras y sale perdiendo, que es justo lo contrario de para lo que se
 * hizo. Con esta bandera en `true` lleva `noindex, follow` y se queda fuera del
 * sitemap (ver `astro.config.mjs`).
 *
 * **Ponerlo en `false` es el único paso que queda** cuando el texto esté
 * escrito: de ahí salen a la vez el indexado, la entrada en el sitemap y el
 * JSON-LD `AboutPage`. No hay nada más que tocar.
 */
export const EN_OBRAS = true;

/** Las dos rutas, en un solo sitio: las usan las páginas y el filtro del sitemap. */
export const RUTAS_CONOCENOS = ["/conocenos", "/en/about"];
