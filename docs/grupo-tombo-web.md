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

**La portada es una pantalla partida** (publicada el 2026-11-23, idea de Mario): cada mitad es una casa con
**su propia estética**, la de su web, y el logo del grupo las une en la costura. En el móvil, Cokima
arriba y Ochoa abajo; en el ordenador, izquierda y derecha. Cada mitad entera es un enlace a su web.
Al bajar, el grupo: el logo, su frase y el contacto. Además, el aviso legal, la privacidad y una
página de 404. **Los textos son los de cada casa y los del WordPress del grupo**, sin inventar nada.

- **La mitad de Cokima es de noche, como «Brasa»:**
  - el póster del vídeo de su portada, el logo crema y la seña «Kitchen Madness · Andrés Mellado, 21»
    en Bricolage;
  - la frase de la web vieja del grupo (*«Puedes comer en cualquier sitio, pero será solo comer»*) en
    la Cormorant cursiva de su voz;
  - su botón, el `.pill.solid` de Brasa.
- **La mitad de Ochoa es de día:**
  - la foto del brindis de su portada y el rótulo ovalado del local («Tasquita · Los Ochoa ·
    Madrid»), en Anton con su sombra;
  - *«¡La tasca que te mereces!»*;
  - su botón, el `.btn` de Ochoa.
- **La costura** es el logo del grupo en blanco sobre negro: en la línea entre las dos mitades en el
  móvil, y arriba en el centro en el ordenador.
- **Al señalar una mitad** con el ratón, su foto se acerca un poco y la otra se apaga. Solo `transform`
  y `opacity`, con duraciones de `tokens.css`, y nada con «reducir movimiento».
- **Los botones son los de cada casa, con su comportamiento** (desde el 2026-11-23, tras preguntar
  Mario si los elementos se reutilizaban tal cual). La primera versión solo los imitaba: el de Cokima
  era rojo y el de Ochoa blanco, ninguno de los dos como en su web, y no reaccionaban a nada.
  - **El de Cokima** es el `.pill.solid` de Brasa. Es un neón: con el ratón encima arranca a
    trompicones y se queda encendido; al pulsar se hunde (`scale(.965)`); en el móvil, el toque lo
    enciende y se apaga solo pasado `--ck-dur-neon-toque`.
  - **El de Ochoa** es su `.btn` rojo con sombra de tinta. Con el ratón encima se oscurece y baja un
    píxel; al pulsar se hunde los 3 px de su sombra, y al soltar vuelve a subir.
  - Como aquí la mitad entera es el enlace, es señalar o tocar la mitad lo que acciona su botón. El
    toque va con `pointerdown` y un script en la portada, como en las casas, porque `:active` no es
    fiable en Safari de iOS.
  - **No vienen las chispas** que salta el botón de Cokima al pulsar: las pinta `brasa.js` en su web.
  - **Trampa:** el build reescribe las duraciones a segundos (`1800ms` sale como `1.8s`), así que el
    script lee la unidad; un `parseFloat` a secas apagaba el neón en el acto.
- **Los tokens de cada casa están copiados** en `apps/grupo/src/styles/tokens.css`, con prefijo `--ck-`
  y `--oc-`. **Si una casa cambia su paleta o su letra, se cambia también aquí.** También las fuentes
  (Bricolage, Anton y Archivo, copiadas de `public/fonts` de cada app; la Cormorant, con
  `@fontsource`), servidas todas desde la propia web.
- **El nombre de cada casa y su dirección van en texto**, no dentro de imágenes, para los buscadores.
  El `h1` de la portada está oculto a la vista y dice «Grupo Tombo: Cokima y Tasquita Los Ochoa».
- **El resto, con el estilo del grupo:** tinta, blanco y el rojo de la pincelada del logo, en
  Schibsted Grotesk (servida con `@fontsource`, no desde Google Fonts, para no pasarle la IP de cada
  visita). Se adapta al modo oscuro con el logo en blanco; la pantalla partida no, porque cada casa
  tiene un solo aspecto.
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
- **La imagen al compartir el enlace** (`/images/compartir.jpg`, 1200×630, 87 KB) es la portada en
  pequeño: las dos mitades con sus fotos y su velo, y el logo del grupo en blanco sobre su pastilla
  negra en el centro, más grande que en la web para que se lea en un chat. Se rehace igual con
  `sh scripts/compartir-grupo.sh` (ffmpeg). **Trampa:** sin pasar las fotos a RGB y conservar el rango
  completo, los colores salían lavados.
- **El icono de la pestaña es la pincelada roja**, el mismo que tenía el WordPress, en sus tres tamaños
  (32, 180 y 192 px). Lo eligió Mario el 2026-11-23, en lugar del provisional con «GT».

## Lo descartado

- **La primera portada, con estilo propio del grupo** (publicada el mismo 2026-11-23): el logo, una
  frase grande, las dos casas en dos fichas con la foto de su fachada y el contacto. Mario, al verla en
  su dominio: *«la landing es literalmente la antigua, solo que con un poquito más modernizada»*. Pidió
  la pantalla partida para que *«cada una de las webs destaque con su branding y todo su diseño»*. Con
  ella cambió también la regla de CLAUDE.md: la web del grupo ya no tiene un estilo propio que no toma
  nada de las casas, sino que cada casa se presenta en su mitad con el suyo, sin mezclarse.
- **Más datos en cada mitad** (horario, «Reservar», teléfono). La cargarían, y para eso está la web de
  cada casa: cada mitad lleva lo mínimo para reconocerla y entrar.
- **Un repositorio aparte.** Se descartó para reutilizar lo que ya hay (configuración, forma de
  publicar, documentación) y tener un solo sitio que sincronizar entre los dos ordenadores. Solo
  tendría sentido si fuera a llevarla otra persona.
- **Copiar el WordPress página a página.** Las páginas de cada casa repetían lo que ya está en sus
  webs, así que desaparecen y redirigen.
- **Poner en cada casa un enlace a la otra.** Rompería la regla de que las casas no se cruzan. Lo
  acordado es un enlace discreto a «Grupo Tombo» en el pie de cada una, **que todavía no está puesto**.

## Lo que falta

- **Los datos fiscales del titular** en el aviso legal y la privacidad, como en las otras dos webs.
- **El enlace a «Grupo Tombo» en el pie de Cokima y de Ochoa.**
- **Los DNS:** el paso a paso y los valores, en `deploy.md` §Dominios y SEO.

La maqueta con la que se aprobó la pantalla partida está en `recursos.md` §3 (su segunda versión).
