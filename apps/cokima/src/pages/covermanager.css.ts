import type { APIRoute } from "astro";
import tokens from "../styles/tokens.css?raw";
import piel from "../styles/covermanager.css?raw";

/* La hoja que el motor de reservas de CoverManager carga dentro de su iframe
   (`?template=` en BookingEmbed). Es la gemela de la de Ochoa
   (`apps/ochoa/src/pages/covermanager.css.ts`), por lo mismo: el motor solo
   enlaza una URL, así que se sirve como un solo archivo con la fuente, los
   tokens de la casa y la piel.

   Va con `?raw` y no leyendo el disco: el bundler mete el texto en el build,
   mientras que una lectura con `import.meta.url` funciona en dev y falla al
   construir sin dar error (CLAUDE.md, «verificar sobre el build»).

   La URL de la fuente es relativa a la raíz y se resuelve contra el dominio de
   esta hoja, no contra covermanager.com; Vercel sirve los estáticos con
   `access-control-allow-origin: *`, que es lo que deja al iframe usarla. Es la
   misma `@font-face` de brasa.css: la Bricolage variable, de 200 a 800. */
const fuentes = `
@font-face {
  font-family: "Bricolage Grotesque";
  font-weight: 200 800;
  font-style: normal;
  font-display: swap;
  src: url("/fonts/bricolage-400.woff2") format("woff2");
}
`;

/* Sin las notas (2026-11-18), como en Ochoa: las de `tokens.css` y la piel son para quien mantiene la web,
   y servidas llegaban a cualquiera que abriera la hoja (51). Se quitan al servir, no en los fuentes. La
   expresión no distingue un `/*` dentro de una cadena: hoy ninguna de las dos hojas lo tiene (comprobado
   ese día); si alguna lo llegara a tener, esto la rompería. */
const sinNotas = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\n\s*\n+/g, "\n");

export const GET: APIRoute = () =>
  new Response(sinNotas(`${fuentes}\n${tokens}\n${piel}`), {
    headers: { "Content-Type": "text/css; charset=utf-8" },
  });
