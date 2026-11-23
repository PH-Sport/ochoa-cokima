# La web del Grupo Tombo

> **Estado: vivo** · creada el 2026-11-23 · la app es `apps/grupo` y el proyecto de Vercel, `grupo-tombo`

## El problema real

`grupotombo.com` era un WordPress con una portada del grupo, una página por casa, sus dos cartas
viejas, contacto y «Trabaja con nosotros». Cuando las dos casas estrenaron dominio propio, el 2026-11-23,
ese WordPress seguía publicando sus páginas, y competía con las webs nuevas en Google. Las cartas viejas
eran lo más delicado, porque Google podía enseñar platos y precios que ya no existen.

Mario pidió que el grupo tuviera su web: **la misma que había, pero cuidada, y corta**. Sus palabras:
*«No necesito recargar la página de cosas, quiero que se vea bien todo, no debería ser una landing
excesivamente grande»*.

## Lo que es

**Una sola página**, con el logo y una frase del grupo, las dos casas a sangre con la foto de su
fachada y un enlace a su web, y el contacto. Además, el aviso legal, la privacidad y una página de 404.
**Los textos son los del WordPress**, sin inventar nada. Las fotos son las de cada casa, del propio
repo, y el logo, el del WordPress.

- **Estilo propio del grupo**, partiendo del logo: tinta, blanco y el rojo de la pincelada como único
  acento, que tiñe la pincelada detrás de «Restaurantes». Las fotos de las casas llevan el color. Se
  adapta al modo oscuro con el logo en blanco.
- **La tipografía es Schibsted Grotesk**, servida desde la propia web con `@fontsource`, no desde
  Google Fonts, para no pasarle la IP de cada visita a Google.
- **Sin formularios.** Contacto y «Trabaja con nosotros» enseñan `info@grupotombo.com`. Mantener los
  formularios del WordPress suponía montar un envío de correos y manejar currículums, que son datos
  personales. Mario estuvo de acuerdo.
- **Sin cookies, sin medición y sin banner.**
- **Las direcciones viejas del WordPress redirigen con un 301** a su equivalente: las de cada casa y sus
  cartas, a su web nueva; `/contacto` y `/trabaja-con-nosotros`, a su bloque de la portada. Van en
  `redirects` de `astro.config.mjs`, que el adaptador de Vercel convierte en rutas 301 de verdad.
  Comprobado en `.vercel/output/config.json`. Con la barra final hay dos saltos, un 308 que la quita
  y luego el 301, y Google los sigue.
- **No usa el `Seo.astro` de `@tombo/ui`**, que declara un `Restaurant`. Aquí la ficha para buscadores
  es una `Organization` con sus dos casas como `subOrganization`, más un `WebSite` con el nombre
  «Grupo Tombo». Solo la lleva la portada.
- **El icono de la pestaña es la pincelada roja**, el mismo que tenía el WordPress, en sus tres tamaños
  (32, 180 y 192 px). Lo eligió Mario el 2026-11-23, en lugar del provisional con «GT».

## Lo descartado

- **Un repositorio aparte.** Se descartó para reutilizar lo que ya hay (configuración, forma de
  publicar, documentación) y tener un solo sitio que sincronizar entre los dos ordenadores. Solo
  tendría sentido si fuera a llevarla otra persona.
- **Copiar el WordPress página a página.** Las páginas de cada casa repetían lo que ya está en sus
  webs, así que desaparecen y redirigen.
- **Poner en cada casa un enlace a la otra.** Rompería la regla de que las casas no se cruzan. Lo
  acordado es un enlace discreto a «Grupo Tombo» en el pie de cada una, **que todavía no está puesto**.

## Lo que falta

- **Los datos fiscales del titular** en el aviso legal y la privacidad, como en las otras dos webs.
- **No tiene imagen para compartir el enlace** (`og:image`).
- **El enlace a «Grupo Tombo» en el pie de Cokima y de Ochoa.**
- **Los DNS:** el paso a paso y los valores, en `deploy.md` §Dominios y SEO.

La maqueta con la que se aprobó está en `recursos.md` §3.
