import type { APIRoute } from "astro";
import tokens from "../styles/tokens.css?raw";
import piel from "../styles/covermanager.css?raw";

/* La hoja que el motor de reservas de CoverManager carga dentro de su iframe
   (`?template=` en BookingEmbed). Se sirve como un solo archivo porque el
   motor solo enlaza una URL: los tokens de la casa, las fuentes y la piel.

   Va con `?raw` y no leyendo el disco: el bundler mete el texto en el build,
   mientras que una lectura con `import.meta.url` funciona en dev y falla al
   construir sin dar error (CLAUDE.md, «verificar sobre el build»).

   Las URL de las fuentes son relativas a la raíz y se resuelven contra el
   dominio de esta hoja, no contra covermanager.com. Vercel sirve los
   estáticos con `access-control-allow-origin: *`, que es lo que deja al
   iframe usarlas. Son las mismas dos `@font-face` de global.css. */
const fuentes = `
@font-face {
  font-family: "Anton";
  font-weight: 400;
  font-style: normal;
  font-display: swap;
  src: url("/fonts/anton-400.woff2") format("woff2");
}
@font-face {
  font-family: "Archivo";
  font-weight: 100 900;
  font-stretch: 62% 125%;
  font-style: normal;
  font-display: swap;
  src: url("/fonts/archivo-var.woff2") format("woff2");
}
`;

/* Sin las notas (2026-11-18). Las de `tokens.css` y la piel son para quien mantiene la web, y servidas
   llegaban a cualquiera que abriera la hoja: 72 notas internas, comparaciones con la otra casa incluidas.
   Se quitan al servir, no en los fuentes, que es donde tienen que estar. La expresión no distingue un
   `/*` dentro de una cadena: hoy ninguna de las dos hojas lo tiene (comprobado ese día); si alguna lo
   llegara a tener, esto la rompería. */
const sinNotas = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\n\s*\n+/g, "\n");

export const GET: APIRoute = () =>
  new Response(sinNotas(`${fuentes}\n${tokens}\n${piel}`), {
    headers: { "Content-Type": "text/css; charset=utf-8" },
  });
