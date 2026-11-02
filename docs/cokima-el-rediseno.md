# Cokima: el rediseño

> **Estado: vivo** · el rediseño está en curso · revisado 2026-11-02

- **Abierto:** 2026-08-14 · **Última tanda:** 2026-11-02
- **Rama:** `preview` desde el 2026-10-26, cuando Mario pidió trabajar solo en ella. Antes vivió en
  `tmp/entrada-cokima`
- **Estado:** **desde el 2026-10-31 la web de Cokima en `preview` es Brasa** (§3), y se itera
  sobre ella con Mario. La entrada de §4 —el vídeo, el nombre y los dos botones— sigue como
  portada de Brasa; lo de debajo es nuevo. Falta que Mario elija la manera de la carta.

Este documento explica **por qué** Cokima se está rehaciendo y por qué se ha descartado casi todo
lo que se propuso antes de llegar aquí. Si vas a seguir el trabajo, léelo entero antes de tocar
`Entrada.astro`: la mitad de las decisiones parecen arbitrarias hasta que sabes qué se probó y se
tiró.

---

## 1. El problema, y no era el que parecía

Cokima llevaba desde la fase 2 sin tocarse mientras Ochoa se llevaba la tipografía, la carta, las
fotos reales y tres iteraciones de portada. El diagnóstico obvio era «Cokima está sin desmenuzar»,
y con ese diagnóstico se hizo lo obvio: buscar material y proponer piel nueva —paleta, fotos,
tipografía—.

**Mario lo paró.** Su objeción: las secciones seguían siendo las mismas que las de Ochoa. Al
comprobarlo resultó ser literal, no una impresión:

```
Ochoa:   Hero → Highlights → Ticker → manifiesto → tasca → casa → visita
Cokima:  Hero → Highlights →          manifiesto →         casa → visita
```

Los mismos nombres de clase (`manifesto`, `casa`, `visita`) y los mismos cuatro componentes
compartidos (`Hero`, `Highlights`, `Nav`, `Footer`). **Cokima era Ochoa con dos secciones menos.**
Cambiar colores y fotos sobre eso no iba a arreglarlo nunca.

### Las cinco palancas

Lo que hace que dos webs se sientan iguales no es el color. Son cinco cosas, y las cinco estaban
calcadas:

| Palanca | Qué era en las dos |
|---|---|
| **El eje** | vertical, apilado, dentro de una columna centrada de ancho fijo |
| **La unidad de contenido** | un plato = foto cuadrada + nombre a la izquierda + precio a la derecha |
| **El ritmo** | todas las secciones con el mismo aire, todas abriendo con etiqueta + titular |
| **La navegación** | cabecera fija, logo izquierda, hamburguesa derecha |
| **El suelo** | un solo fondo de principio a fin |

De las cinco, **la que más pesa es la unidad de contenido**. Mientras un plato se dibuje igual en
las dos casas, se sentirán la misma web aunque cambie todo lo demás.

---

## 2. La distinción que ordena todo

La dio Mario y es la clave de la que cuelga el resto:

> **Ochoa** es *«pido lo de siempre, me siento y a charlar con mi gente»*.
> **Cokima** *«trata de ser más una experiencia, más pícara, pero experiencia»*.

Ochoa es **transacción social**: la web apilada y directa le pega, porque su trabajo es no
estorbar. Cokima es **experiencia con picardía**, y un índice de secciones no cuenta eso.

Traducido a estructura: *experiencia* significa que la página tiene un **antes y un después** en
vez de un índice, y *pícara* significa que **insinúa antes de enseñar**.

---

## 3. Lo que se propuso y se descartó

Queda escrito para que nadie lo vuelva a proponer sin saber que ya se miró.

**Tres direcciones de piel** (14 de agosto) — *El mural*, *La pared de polaroids*, *El neón*.
Descartadas por Mario: buena piel sobre el esqueleto de Ochoa. Siguen siendo válidas como
paleta y como uso de las fotos, y el material que sacaron se conserva.

**Tres esqueletos** (14 de agosto) — planos en gris, sin color ni fotos, para juzgar el hueso:

1. *A dos voces* — dos capas: la mesa ordenada sobre la pared descarada.
2. *La noche avanza* — la página no tiene secciones, tiene horas: de la luz de la calle a
   medianoche, con el suelo oscureciéndose.
3. *Se destapa* — un tablero de piezas tapadas que se destapan. **Descartado**: en móvil no
   existe el pasar por encima y esconder el precio va contra la razón por la que la gente entra.

**Mario eligió el 2 y luego cambió el planteamiento.** Trajo una referencia de app —foto a
pantalla completa, dos botones abajo— y decidió construir sobre eso, por orden, empezando por la
landing. Su frase: *«olvídate del diseño que tenemos actualmente»*.

**Lo que sobrevive del esqueleto 2 y conviene no perder de vista:** el reloj. `OpenState` ya
calcula si el restaurante está abierto con su horario real, y hoy es una etiqueta pequeña. En
aquella dirección pasaba a ser el eje de la página. Es la única pieza compartida con Ochoa que
tenía sentido conservar, porque es lógica y no forma.

> Los bocetos están en artifacts privados de la cuenta de Mario. Un agente no puede abrirlos; él
> sí. Piezas de piel: `b237e791-60f1-4107-b17c-8ed219fdd209`. Esqueletos:
> `50dfedae-4f66-4bbf-a0d6-2e445a633109`. Móvil del esqueleto 2:
> `23d1ffdc-443e-44ad-8414-254363c7d0e1`.

### Lo de debajo de la entrada, en bocetos (2026-10-30 y 31)

Del 2026-10-30 al 31 se buscó qué va debajo de la entrada con bocetos en Artifacts privados de
Mario, sin tocar el repo. Lo que se pedía: algo más premium, mezclar comida, local y gente como
en Ochoa pero sin copiar su concepto, y conservar las frases reales de @cokimamadrid. Cada ronda,
con el motivo de Mario:

1. ***La mecha*** — rechazada: *«No me termina de convencer…»*. Su rama se borró a petición suya.
2. **Tres variantes** —*Hasta el fondo*, *La barra*, *Cocina y sala*—, rechazadas.
3. ***Cokima a presión*** (https://claude.ai/artifact/EDYTpts7iT6FaQX4okEKtA): fotos que estallan
   en esquirlas con WebGL. Rechazada el 2026-10-30: *«demasiado como un "mírame"»*, *«cargante»*.
   La explosión no cuadra con sus fotos —cocina exótica, misterio, *«un haz de fuego»*—, y tras
   la portada eran platos y más platos.
4. ***Cokima en penumbra*** (https://claude.ai/artifact/Rb6UGWDjJ6APjAjqgFekA5): desplazamiento
   normal, un haz de luz de fuego fijo a media pantalla, y comida, cocina, sala y gente
   intercalados. Rechazada: *«Sigue sin convencerme…»*.
5. **Desde ahí, bocetos de tres en tres y sin pulir.** Tanda 1: *Sobremesa*, editorial claro de
   revista (https://claude.ai/artifact/RSVWQxraCZxyQrovZ6CwtD); *Comanda*, tiques de cocina sobre
   negro (https://claude.ai/artifact/AXcon6x9xtWQhiFLcmZ376); *Bocado*, bloques de color pop
   (https://claude.ai/artifact/8RhzVirkLHKFZXukJtCPhZ). Rechazada entera el 2026-10-31:
   *«Ninguno me tira demasiado. Mantén una estética limpia, no me interesa tener "extravagancias"
   en pantalla»*. Pidió modo oscuro, degradados suaves que se fundan, movimiento vivo *«como una
   respiración de fondo»* y *«un fondo animado como de brasas»*.
6. **Tanda 2**, las tres oscuras y con brasas que respiran: *Rescoldo*, un lecho de brasas en
   WebGL al pie y una columna centrada con fotos en óvalo
   (https://claude.ai/artifact/JjvCDf9rKDxsEmVwNXMwHF); *Aliento*, solo luz difusa que cambia de
   color por bloque, fotos a sangre que se disuelven y Cormorant Garamond
   (https://claude.ai/artifact/Ad3BWyz1KMB34nTiQN4ruc); *Pavesas*, calima y chispas que suben, con
   capítulos numerados (https://claude.ai/artifact/JDHQMDh5j9cD4sujoNKFUQ). **Veredicto del
   2026-10-31:** se queda con **el fuego de Rescoldo** y **la Bricolage fina de sus títulos**
   —la misma de la web, a 200 en vez de 800—, *«no me refiero a que me quedo con el formato como
   tal»*. Echa en falta **un menú por secciones** *«antes que tener una single page eterna»*. De
   Aliento le gusta cómo se enseñan los platos —la foto a sangre que se disuelve en el negro, la
   frase en cursiva, el plato y el precio debajo—, pero **en La carta, no en Inicio**, y *«sin
   realmente quitar protagonismo a otros que no se muestren foto»*.
7. **Tanda 3**, un solo boceto: **Brasa**, lo de abajo.

### Brasa, el boceto que le gusta (2026-10-31)

https://claude.ai/artifact/SF9FyZdGNHJEDPbnwJjFCP. Mario: *«Me gusta más este diseño, lo veo
mejor»*. Primero pidió verlo en línea en una rama aparte, y se subió como página suelta a
`feat/cokima-brasa`, en `/brasa/`. Al verlo allí, encima de la web anterior, pidió el mismo día
lo contrario: *«Puesto que quiero comenzar a iterar sobre esta variante, haz la rama "preview"
exclusiva para esta nueva versión»*. **Desde el 2026-10-31 Brasa es la web de Cokima en
`preview`**, y `feat/cokima-brasa` sobra (si se borra lo decide él).

- **El fuego de Rescoldo de fondo:** sube en la portada del Inicio y baja al pie en las demás
  secciones. WebGL a 0,6 de resolución y a 30 fotogramas por segundo como mucho, y **transparente
  donde no hay fuego**: sobre el suelo se ve igual que el opaco del boceto, porque su negro era el
  mismo `--ground`, y en la portada deja ver el vídeo. Mario lo pidió *«ligeramente»* más rápido:
  va a 1,25 veces el ritmo del boceto (`VELOCIDAD` en `brasa.js`). Tiene su excepción a la regla 6
  en `movimiento.md`.
- **Títulos en Bricolage 200, y la voz en Cormorant Garamond cursiva.**
- **Cuatro secciones: Inicio, La carta, Nosotros y Visítanos**, con nombres provisionales. En el
  ordenador, en la barra de arriba, en el centro. En el móvil, desde el 2026-11-02, en un
  desplegable de la barra de arriba (más abajo); antes, una píldora flotante abajo. No es la
  cortina, que es de Ochoa.
- **La portada del Inicio sigue la regla de §4:** el nombre y los dos botones, sin menú, que
  aparece al bajar. Con dos cosas que pidió Mario al verla: **«Kitchen Madness» bajo el nombre**
  —*«le da algo más de dinamismo a la portada»*—, y **el vídeo de la
  entrada detrás**, *«a modo provisional»*, *«ligeramente oscurecido y haciéndole una transición más
  oscura aún en la parte inferior, para que el fuego animado quede por encima del vídeo»*. El
  vídeo va fuera de `<main>` y antes del lienzo del fuego, que se pinta encima; lo arranca el
  script como en `Entrada.astro` (reglas 6 y 20 de `movimiento.md`).
  «Kitchen Madness» entró en la cursiva de la voz y al día siguiente, el 2026-11-01, Mario lo
  pidió *«con la letra normal que usamos para los textos, no usaría la letra clásica curva […]
  en mayúsculas, pero con un tamaño de letra pequeño»*: va en Bricolage 500, espaciado como las
  etiquetas de la página, a 11,5 px en el móvil y 15 en el ordenador.
- **«Reservar» y «Ver carta» viajan de la portada a la barra (2026-11-02).** Mario: *«Ahora mismo,
  simplemente desaparecen y se cambian de sitio […] que realmente se aprecie como cambian de un
  sitio a otro»*. Medido antes de tocar nada: los dos botones subían con la página y, al pasar el
  60% de la pantalla, se apagaban en su sitio mientras la barra aparecía en otro, sin relación, y
  durante un instante había dos «Reservar» a medio fundir. **Se le propusieron tres maneras y
  eligió la primera:** que viajen al cruzar el límite. Ahora «Reservar» sube a la esquina
  encogiéndose y, en el ordenador, «Ver carta» se vuelve «La carta», la del menú de arriba; al
  subir hacen el camino de vuelta. **En el móvil solo viaja «Reservar»:** «Ver carta» bajaba a la
  píldora de abajo, y desde que las secciones del móvil van en el desplegable (más abajo) «La
  carta» queda dentro de la lista cerrada y no hay adónde llegar; se apaga con la portada, como
  antes.
  Lo que vuela es una copia sin función y los de verdad esperan escondidos, así que nunca hay dos a
  la vez. Con margen: se va al 60% y vuelve por debajo del 50%, para que nadie los ponga a ir y
  venir parándose en el límite. Cómo está hecho, en `movimiento.md` («Qué se mueve hoy» y regla 30).
  **Las descartadas, y por qué:** *que sigan al dedo* —el viaje atado a lo que se ha bajado— porque
  en el iPhone la barra del navegador cambia el alto de la pantalla mientras se desliza
  (`archivo/barra-del-navegador-ios.md`) y el viaje daría saltos, porque a medio camino los
  botones pisan «Buen producto. Malas intenciones.» y porque es trabajo en cada movimiento del
  dedo con el fuego ya cargando el móvil; y *el gesto mínimo* —deslizarse unos píxeles hacia donde
  van— porque insinúa la dirección pero no se ve que sea el mismo botón. **Y lo que no se
  mueve, a propósito:** el «Cokima» grande de la portada no vuela a la barra, porque eso hace ya la
  entrada de Ochoa con su rótulo.
- **En el móvil, las secciones van en un desplegable (2026-11-02).** Mario: *«En escritorio me
  gusta la idea de tener las secciones arriba en el medio de la pantalla, pero en móvil no me
  termina de gustar la píldora abajo»*. Se le propusieron tres alternativas y las pidió ver en una
  maqueta, con la píldora al lado: https://claude.ai/artifact/TGPi5Le9WBSVTFXZGoLwhc. Eligió la 2:
  *«Es la que menos sitio ocupa y la más limpia, cosa que nos interesa bastante para este
  diseño»*. En la barra va la sección en la que estás con una flecha; al tocarla baja la lista de
  las cuatro, en la letra fina de los títulos, con un punto brasa en la actual, y la barra se
  vuelve opaca para que barra y lista sean una pieza. Se cierra al elegir, al tocar fuera, con
  Escape, al mover la página, al volver a la portada —donde no hay barra— y al pasar a ancho de
  ordenador. **Las descartadas, y por qué:** *arriba*, en una línea bajo la marca como en el
  ordenador, que era la que recomendaba el agente —nada flota sobre las fotos y los dos botones de
  la portada viajarían hacia arriba—, porque la franja de arriba crece y aquí se quiere lo mínimo;
  *abajo, plana*, de lado a lado y solo texto, porque sigue tapando abajo y en el iPhone se estira
  bajo la rayita de inicio; y la píldora, que es la que no le gustaba. Ninguna de las tres era un
  botón «Menú» con cortina, que es de Ochoa.
- **El Inicio va por bloques desde el 2026-11-02**, cada uno con una cosa de Cokima y el adelanto de
  una sección (más abajo, «La dirección de Brasa»). Hasta entonces era corto: la frase de Instagram,
  el estado de la cocina y tres accesos directos a las otras secciones.
- **La carta tiene siempre los 21 platos en la misma lista, y cada parte se abre con uno de sus
  platos en foto** (*Portadilla*). Hubo tres maneras conmutables en una barra de boceto, y Mario
  eligió esta el 2026-11-02: *«me quedo con la foto que presenta la sección, con el resto de platos
  abajo»*. Las otras dos salieron del código con la barra: *Al tocar*, un punto en los que tienen
  foto que la desplegaban al tocarlos, con un lateral fijo que seguía al ratón en el ordenador; y
  *Pareja*, dos imprescindibles en foto arriba. Las direcciones `#carta-1`, `-2` y `-3` llevan a
  La carta. El tartar, sin foto, lleva su frase publicada en lugar de una foto.
- **Todas las frases son de @cokimamadrid.** El hueco de reseñas sigue sin material.

**Cómo entró en la web, y lo que se dejó a propósito para después:**

- **Es el boceto pasado tal cual**, no reescrito en componentes: la página es
  `apps/cokima/src/pages/index.astro`, sus estilos `src/styles/brasa.css` y su código
  `src/brasa.js`. Así se puede iterar con Mario sobre lo mismo que vio. Lo que sí cambió: la carta
  llega del build (`menu-es.json`, en un JSON dentro de la página), y colores, letras, curva y
  duraciones salen de `tokens.css`, como manda `movimiento.md`. Los tokens del fondo, la brasa y
  la línea pasaron a ser los de Brasa; la curva es la `--ease` de siempre, no la del boceto.
- **No usa `Base.astro`**, que es el marco de la web anterior: su cabecera, su pie, su router de
  transiciones y **el cartel de cookies con la medición detrás**. En la home no hay hoy ni cartel
  ni medición, y antes de producción tienen que volver. Tampoco carga `global.css`: declara su
  letra y su apagado de movimiento en `brasa.css`.
- **Las páginas de la web anterior dejan de publicarse:** `/carta`, `/reservas` y la versión
  inglesa. Sus direcciones llevan a la sección que las sustituye (`redirects` de
  `astro.config.mjs`), y la home inglesa a la española, desde `src/pages/en/index.astro` porque la
  regla de redirección no casa con la barra final de `/en/`. **Brasa no tiene inglés todavía.**
- **Las legales siguen igual**, con `Base.astro` y su aspecto anterior. Brasa enlaza a ellas
  desde el pie de Visítanos.
- **La Cormorant viene de Google Fonts**, como en el boceto. Antes de producción se sirve desde la
  web, como la Bricolage: pedirla a Google le pasa la IP de cada visita.
- **Las fotos** están en `public/images/`, sin pasar por la optimización de Astro, al tamaño del
  boceto (de 62 a 258 KB). Salen de la fototeca de @cokimamadrid, reducidas para el boceto; **no
  quedó apuntado de qué publicación es cada una**, y ya no coinciden con sus originales. La
  dieciséis sí lo tiene: `sala-entera.jpg` es *Cokima 5*, una de las seis del local que trajo Mario
  (`fototeca/icloud/cokima/`), pasada a sRGB y a 1400 px (206 KB). Entró como puerta de Nosotros del
  Inicio el 2026-11-02, cuando Mario pidió *«Quítame la foto de Nosotros y cámbiamela por
  otra»*: era Martín, que en el ordenador quedaba en un primer plano de su cara. Martín sigue dentro
  de Nosotros. Con el Inicio por bloques pasó a su muestra de Nosotros; las tres fotos de producto
  del Inicio, con su origen, están en `fotografia.md`.
- **El estado de la cocina** lleva su horario escrito en `brasa.js` (13:00–16:00 y 19:30–23:30),
  el mismo de `recursos.md` §4, todavía sin confirmar por el restaurante. `OpenState` no sirve aquí:
  calcula el horario del local, no el de la cocina.
- **Trampa, sin error: `brasa.css` es una sola hoja sin ámbito, y un nombre de clase nuevo puede
  estar cogido.** El desplegable del móvil se llamó primero `.lista`, que ya era la de los platos
  de La carta, así que sus reglas —`position: fixed`, `visibility: hidden` y, en el ordenador,
  `display: none`— dejaron La carta sin un solo plato a la vista, solo con las fotos. Se publicó
  así en `preview` el 2026-11-02 y se arregló en la tanda siguiente; ahora es `.desplegable`. Las
  pruebas del desplegable miraban el desplegable y no lo vieron. **Antes de estrenar un nombre de
  clase se busca en `brasa.css`, `brasa.js` e `index.astro`**, y lo que cambia la barra se
  comprueba también en La carta.
- **Trampa, sin error:** los `widths` de un `<Image>` tienen que estar entre los `sizes` de
  `imagesConfig` en `astro.config.mjs`. Si no, el `srcset` sale con **un solo tamaño, 1600 px**, y
  el móvil se lo descarga entero; pedir otro ancho a Vercel da 400. Pasaba con los anchos que
  traía `Entrada.astro` (420, 720, 1080 y 1440), copiados al póster de Brasa; el póster va ahora
  con 480, 780, 1200 y 1600. `Entrada.astro` ya no se usa y se queda como estaba.

### La dirección de Brasa (2026-11-02)

**El problema real, en palabras de Mario:** *«ahora mismo estamos soltando parches y estamos
tirándole cosas a la web con cualquier cosa que se nos ocurre, pero no estamos pensando en una
dirección»*. Le gustaba la estética —*«textos y colores, muy guay»*— pero le faltaban *«vida y
sazón»*: el Inicio en el ordenador era la portada, una frase y tres accesos directos; Nosotros,
fotos con frases de Instagram que no cuentan nada del restaurante; Visítanos, plano. **La causa:**
cada tanda se preguntó qué efecto ponerle a una sección, y no qué tiene que contar. Ningún efecto
llena una sección que no dice nada.

**Lo que se probó y se descartó ese día**, en la maqueta *Brasa con sazón*
(https://claude.ai/artifact/9maPX8uKzqNrT3e6n3QFoa), con el motivo de Mario:

- *El fuego que responde* al ratón y al dedo: sobra. *«No tenemos que hacer como en la otra web
  del otro restaurante»*; el fuego se queda de fondo, sin reaccionar a nada.
- *Cokima ahora*, un bloque con el reloj de la cocina: *«añaden ruido»*, *«contenido pobre»*. El
  estado de la cocina es la línea pequeña de siempre.
- *El Inicio más largo* con la frase que prendía palabra a palabra: más largo, pero sin resolver
  que las tres secciones fueran accesos directos al final.
- *La pared de polaroids* en Nosotros: *«muy pobre»*, *«no hay texto, no cuenta nada del
  restaurante»*, fotos colgadas que no dicen nada.
- *La puerta de noche* en Visítanos, con el neón «Abierto»: lo que más le cuadraba, pero pobre.

**La referencia que trajo Mario: https://www.sqew.uk** (shawarma en Leeds y Manchester). Se cogió
su manera de montar el Inicio: **cada bloque cuenta una cosa distinta y adelanta una sección**, con
su enlace —por qué existen, qué prometen, qué se come, cómo es—. Y no se cogió: su estética de
comida rápida (letra estrecha gigante, verde, fotos de producto recortadas, pegatinas), la banda de
texto que corre —Ochoa ya tiene la suya—, la barra de acciones fija abajo en el móvil —se acababa de
quitar la píldora— ni el equipo con nombres y fotos: Mario, *«Yo no pondría nombres en el Equipo.
Incluso quitaría las fotos y pasaría a hablar directamente del restaurante en general»*.

**La idea que lo ordena todo es la frase de la casa:** *«Puedes comer en cualquier sitio, pero
será solo comer»* (la web del Grupo Tombo, `recursos.md` §3). La web tiene que demostrarla. La voz
también es la de esa web —*«mandanga de la buena»*, carne de animales que *«viven mejor que tú»*,
*«le dirás ciao a las croquetas de tu abuela»*—, canalla y con gracia, junto a las frases de
@cokimamadrid. Brasa pone el ambiente; esa voz, la sazón.

**El Inicio, por bloques** (por debajo de la portada, que no cambia):

1. **Por qué existe Cokima.** La frase de la casa en grande, su explicación —*explosión de sabor,
   compartir y desfasar*— y la línea pequeña del estado de la cocina.
2. **El producto.** *«Buen producto. Malas intenciones.»* y la frase de la web del grupo partida en
   tres: el pescado, la carne y las verduras, cada una con su foto de producto de Instagram.
3. **La carta, de muestra.** La *cocina ecléctica* de la web del grupo y los cinco imprescindibles
   de la carta, con precio y descripción; en el ordenador, la foto cambia al pasar el ratón por cada
   uno. Enlace a la carta entera.
4. **Nosotros, de muestra.** La sala entera y la entrada de Nosotros: *«Nacimos en Argüelles con
   una misión»*. Enlace.
5. **Visítanos, de muestra.** *«Ven a conocernos y le dirás ciao a las croquetas de tu abuela»*,
   la dirección en pequeño, Reservar y el enlace.

**Las reglas que no se mueven:**

- **Una sección —o un bloque— solo existe si cuenta algo de Cokima.** Lo práctico (horario, si
  está abierto, teléfono) va en pequeño donde hace falta y nunca es una sección por sí solo.
- **El fuego se queda de fondo**, tal cual, sin reaccionar a nada.
- **Una sola manera de presentar las cosas en toda la web:** etiqueta brasa, título fino, voz en
  cursiva, fotos que se funden en el negro y un enlace. No un truco distinto por sección.
- **Del Ochoa, la idea de que el Inicio adelante cada sección; ni sus piezas ni su orden** (§1, §7).
- **Nada inventado.** Los textos son de la web del grupo y de @cokimamadrid.

**Montado en `preview` el 2026-11-02**, en cuanto Mario dijo *«Vamos a probarlo»*: los cinco
bloques en `index.astro`; los imprescindibles los pinta `brasa.js` desde la carta y `FOTOS`, con una
foto pequeña por plato en el móvil y, en el ordenador, una grande al lado que cambia al pasar el
ratón. Las tres fotos de producto —atún rojo, picaña madurada y tomates— son de @cokimamadrid
(`fotografia.md`). La sala entera pasa a la muestra de Nosotros y el rótulo, a la de Visítanos.
Medido sobre el build, en WebKit y Chromium a 1440, 390 y 320: los cinco bloques y los cinco
imprescindibles con sus precios de la carta, todo revelado al bajar, todas las fotos cargadas, la
foto grande sigue al ratón y no cambia con el tataki, que no tiene; cada enlace lleva a su sección;
sin errores ni scroll lateral. La página del Inicio pasa a medir 4.820 px en el ordenador. Sin mirar
en un iPhone, y **falta que lo vea Mario**.

**Lo que falta y solo puede dar Mario:** de dónde viene Cokima —quién está detrás y desde cuándo—.
Sin eso, Nosotros puede contar qué es Cokima pero no su historia. **Nosotros y Visítanos se
rediseñan después, sobre esta dirección.**

---

## 4. La landing, y por qué cada cosa está donde está

`apps/cokima/src/components/Entrada.astro`. Sustituye al `Hero` heredado. La pantalla entera es el
plato, el nombre en el medio, dos botones abajo, y **nada más**.

> **Desde el 2026-10-31 `Entrada.astro` no se usa:** la portada es la de Brasa (§3), que hereda
> esta regla —el nombre con «Kitchen Madness» debajo, los dos botones y nada más, con el menú al
> bajar— y el vídeo, ahora detrás del fuego. Lo de esta sección sigue explicando el porqué de esa
> portada; el cartel de cookies y la altura congelada de los apartados siguientes son de
> `Entrada.astro` y Brasa no los tiene todavía.

### Lo que NO está, y es deliberado

Mario, textualmente: *«hay muchas cosas en la landing. Solo deben estar los dos botones. Ni texto,
menú hamburguesa, nombre... nada»*. Están fuera, y aparecen al deslizar:

- el rótulo y la hamburguesa de la cabecera,
- su botón de «Reservar» (abajo ya hay uno a tamaño de pulgar),
- **el cartel de cookies**,
- el aviso de que falta el vídeo.

**No erosionar esto añadiendo «solo una cosita más».** Es la decisión de diseño de la pantalla.

El nombre en el centro llegó después, y no contradice lo anterior: lo que Mario quitó fue el
claim y el rótulo pequeño de la barra; lo que puso es la marca como pieza de composición.

### El cartel de cookies: ocupa el sitio de los botones y se lo devuelve

**Cambiado el 2026-08-17, idea de Mario.** Antes bajaba con el resto y esperaba fuera de la
entrada, porque plantado sobre la landing se comía los dos botones. Ahora ese conflicto es la
secuencia: **mientras hay decisión pendiente el cartel ocupa ese hueco, y al decidir se retira y
los botones entran.** Primero decides, luego entras.

Funciona porque en móvil el cartel **ya** es una franja apoyada en el borde inferior, exactamente
donde caen «Ver carta» y «Reservar». En vez de dos piezas peleándose por el mismo borde, se turnan.

**RECHAZAR DESTAPA IGUAL QUE ACEPTAR, y de eso depende que esto sea legal.** Tapar la única acción
disponible hasta que alguien *acepta* es un muro de cookies, que la AEPD no admite. Hacerlo hasta
que *decide* —con las dos salidas igual de accesibles y del mismo tamaño, y con la página entera
navegable sin decidir— no lo es. Y sigue sin instalarse ninguna cookie no esencial antes del
consentimiento (`Base.astro`, spec §10), que es la obligación de fondo.

Eso obligó a arreglar un agujero del componente compartido: **hasta ahora solo avisaba al
aceptar**, porque el evento `tombo:consent` existe para arrancar la medición. Colgar de él lo que
se destapa habría dejado a quien rechaza sin ver nunca los botones.

**El mecanismo va en `@tombo/ui` y la decisión estética en la app.** El `ConsentBanner` publica
`data-consent-pendiente` en el `<html>` mientras el cartel está a la vista y lo quita con las dos
respuestas; es un atributo de contrato, como los `data-intro-*`. Cokima se cuelga de él por CSS;
**Ochoa no lo lee y no se entera**, que es como lo quiso Mario.

**Se marca lo pendiente y no lo decidido, a propósito:** así el atributo solo existe si el script
corrió y hay cartel de verdad. Sin JavaScript no hay marca y los botones se ven, en vez de quedar
escondidos para siempre esperando un aviso que no va a llegar. El fallo cae del lado bueno.

Medido en el build, los cinco casos: primera visita (pie a `visibility: hidden` y fuera del orden
de tabulación), tras **rechazar** (pie dentro, cookie `denied`), tras **aceptar** (igual), visita
recurrente (botones directos, sin cartel) y sin decidir + scroll a 2329px (se navega con
normalidad). El `visibility` no es adorno: a opacidad cero los botones seguían recibiendo el foco,
y eso ya mordió al vaciar la landing.

### La curvatura: donde vive el contraste entre las dos casas

Ochoa tiene cuatro radios que crecen con la pieza (4 / 7 / 9 / 12) y su comentario dice que dejan
de crecer *«donde seguir subiendo la convertiría en una pastilla»*. **Cokima toma la decisión
contraria en ese mismo eje:**

```
lo que se PULSA  → píldora siempre (--r-control). El radio no es un valor: es la mitad
                   de la altura, así que un botón alto y uno bajo salen igual de redondos.
lo que se MIRA   → escala de tres pasos: --r-caja 10, --r-panel 14, --r-marco 20.
```

Antes había un `6px` plano, igual para un botón que para una tarjeta: un radio único para piezas
de todos los tamaños, que es justo lo que la escala de Ochoa evita. Era una deuda real.

### El vídeo, que ya está (2026-08-17)

Lo montó Mario en Higgsfield: **siete escenas de unos cuatro segundos** —la sala con el neón
«Orgasm, at the first bite», la barra con el sol de COKIMA, y cinco platos—. Entregado en
**1920x1080, 30 fps, 27 s y 18,5 MB**, sin pista de audio.

Llegaba con dos problemas, y ninguno es culpa del montaje: **es horizontal** y **está iluminado
como catálogo**, claro y plano. Puesto tal cual encima del póster —que es casi negro, con el neón
al fondo y solo el plato encendido— parecían dos webs distintas peleándose en la misma pantalla.

**EL VÍDEO ES PROVISIONAL Y VA A CAMBIAR, así que la receta vive en el repo**, no en un mensaje de
commit: `scripts/video-entrada.sh` convierte el original en los cuatro archivos que sirve la web.
Cambiar de vídeo es un comando y una revisión a ojo —que el grado le siente bien al material
nuevo—. Los nombres no cambian, así que el componente no se toca, y el hash de la URL lo pone Vite
al construir, con lo que **ningún navegador se queda con la versión vieja en caché**. Esa fue la
razón real para sacar los archivos de `public/`.

**Dos cortes, porque uno solo no sirve para las dos pantallas.**

| | qué es | por qué |
|---|---|---|
| `entrada.*` | 608x1080 | Móvil. Vertical, que es donde se diseñó la entrada. |
| `entrada-ancho.*` | 1280x720 | Escritorio. El vertical ahí se ampliaba **3,13x** y se veía blando. |

El vertical es un recorte central del `1920x1080`. Conviene entender qué hace y qué no: en un móvil
de 393x852 el `object-fit: cover` enseña **el 26% central** del original, se recorte antes o no.
**El recorte no cambia lo que se ve; cambia lo que se descarga.** Centrado y no desplazado porque
no hay un encuadre bueno para las siete escenas: los platos quedan bien, y a los dos neones les
corta el texto —que es precisamente la banda que tapa el rótulo—. El horizontal no recorta nada,
solo baja de tamaño: el original ya es 16:9.

**La elección se hace en JS, no con el atributo `media` del `<source>`**, que a diferencia de
`<picture>` no se reevalúa. Se decide una vez, antes del `load()` —con `preload="none"` y sin
`autoplay` todavía no se ha pedido un byte, así que reescribir las fuentes es gratis— y no se
rehace al redimensionar: cambiar de archivo a media reproducción cortaría la imagen para ganar
nitidez en una ventana que se está arrastrando. Medido después: en escritorio la ampliación baja de
3,13x a **1,5x**, y cada pantalla pide solo su archivo.

**Y si `entrada-ancho.*` no existe, no pasa nada**: el glob no lo encuentra, los `data-` salen
vacíos y todo el mundo ve el vertical. Es el mismo contrato que el de «si no hay vídeo, manda el
póster».

**El grado, horneado en el archivo y no en CSS.** Un `filter` sobre un vídeo a pantalla completa
se recompone en cada fotograma; el archivo se procesa una vez. La cadena está en el commit y son
tres pasos: `eq` baja exposición y sube contraste, `curves` **baja las luces altas más en el azul
que en el rojo** —que es lo que apaga la madera clara y la cerveza sin tocar la brasa—, y una
viñeta suave cierra los bordes. Se calibró comparando fotogramas contra el póster, no a ojo: se
descartaron una versión suave (seguía siendo de día) y una fuerte (aplastaba el plato).

**Peso: de 18,5 MB a 1,01 / 0,87 MB** (móvil, MP4 / WebM) y **1,51 / 1,40 MB** (escritorio). A 25
fps y no 30: es un fondo de movimientos lentos, y a 25 no se nota la diferencia. No compite con el
LCP porque no se pide hasta que el script lo pide: `preload="none"` y `load()` después de
`astro:page-load`.

**Y no se pide en cuatro casos**, que son los que separan un fondo decorativo de un peaje: si
alguien pidió movimiento reducido, si lleva «Ahorro de datos» puesto, si el navegador rechaza
reproducir —el ahorro de energía del iPhone— o si no hay archivos. En los cuatro manda el póster.
`navigator.connection` no existe en Safari, y su ausencia no significa nada: solo se hace caso
cuando dice explícitamente que sí.

**La cinta se pausa cuando no se la ve**, con su propio `IntersectionObserver` y también al pasar
la pestaña a segundo plano. Es la regla 6 de `movimiento.md`, que la cinta incumplía sin que nadie
lo mirara: los botones y la chispa sí se paraban con `data-sobre-entrada`, y el vídeo seguía
decodificando a pantalla completa con la página en el pie —medido: `currentTime` avanzando de 5,05
a 7,06 s—. Lleva observador propio y no el atributo del `<html>` porque ese lo pone un centinela de
1px al final de la sección, y aquí lo que importa es si el vídeo está en pantalla.

**La etiqueta `<video>` sigue sin pintarse si el archivo no está**, y esa comprobación **hubo que
rehacerla entera**: la que había no funcionaba al construir. Está contada en el §5, y es la trampa
más cara de esta tanda. Ahora los archivos viven en `src/assets/video/` y quien decide es
`import.meta.glob`, que se evalúa al compilar. La condición se queda aunque hoy haya vídeo: es lo
que sostiene que el póster mande solo cuando no hay cinta —en iPhone con ahorro de energía,
`play()` se rechaza—. La primera versión pintaba la etiqueta siempre confiando en `preload="none"`
y dejaba **cuatro 404 en la consola de cada visita**.

**Y el cartel de «falta el vídeo» ahora depende de que falte de verdad.** Estaba atado solo a
`showPhotoGuides()`, así que habría anunciado en la preview un hueco ya cubierto. Es la trampa de
siempre con las rejillas: se ponen para marcar lo que falta y hay que acordarse de que dejen de
hablar cuando deja de faltar.

**Quien no quiere movimiento no se lo descarga siquiera.** Lo preguntó Mario —«¿mantenemos la
imagen de antes para movimiento reducido y ahorro de energía?»— y al medirlo resultó que solo se
cumplía a medias: la etiqueta llevaba `autoplay`, que arranca el navegador sin pasar por el guard
del script, así que el vídeo se bajaba y se reproducía **invisible**. Se le quitó el `autoplay` y
ahora arranca solo el script. Medido en el build: en movimiento reducido, cero peticiones de red,
`readyState: 0`, `paused: true` y el póster mandando; en normal, todo como debe. Está como regla 20
en `movimiento.md`.

**En ahorro de energía, sin medir.** El póster manda igual, porque en iPhone con esa opción
`play()` se rechaza y la clase que hace visible la cinta nunca se pone. Lo que **no** está
comprobado es si la descarga llega a empezar antes del rechazo: eso solo se ve en el teléfono de
Mario, y no se ha hecho. Si importa, la vía es no llamar a `load()` y dejar que sea `play()` quien
pida los datos, para que el rechazo llegue antes que el primer byte.

**Lo que queda por mirar:** el bucle corta en seco al volver al principio —de las croquetas a la
sala—, y como el propio montaje ya cambia de escena cada cuatro segundos no desentona, pero no se
ha decidido si merece un fundido.

El póster no es un fotograma cualquiera: es una foto procesada como cualquier otra de la casa,
porque **en iPhone con el ahorro de energía activado `play()` se rechaza aunque el vídeo esté
silenciado**, y entonces el póster es lo único que se ve. Lo mismo para quien pida menos
movimiento.

### El movimiento: dos piezas, y las dos con la misma doctrina

Mario pidió botones «vivos» y una animación de scroll, y en las dos avisó de **evitar los patrones
típicos de IA**. Lo típico —el brillo que barre, el halo que late, el borde de degradado girando,
el ratoncito con la ruedita, la flecha que rebota— se reconoce antes de entenderse, porque tiene
**cadencia** y porque el gesto no significa nada.

Las dos piezas salen del mundo del local, que es de brasa y de neón. Están explicadas en
`movimiento.md` (reglas 18 y 19 y la tabla de qué se mueve).

---

## 5. Las trampas que costaron tiempo

Todas aparecieron **midiendo en el navegador**, ninguna leyendo el código.

**`import.meta.url` no apunta al fuente después de empaquetar, y `dev` no lo delata.** La que más
ha costado, y no dio ni un error. La existencia del vídeo se comprobaba así:

```js
const publico = (n) => fileURLToPath(new URL(`../../public/video/${n}`, import.meta.url));
existsSync(publico("entrada.mp4"));
```

En `dev` funciona, porque ahí `import.meta.url` es el fichero fuente. **Al construir, este
componente acaba empaquetado en `dist/server/.prerender/chunks/`**, así que la ruta salía como
`dist/server/public/video/entrada.mp4` —una carpeta que no existe jamás— y la comprobación
devolvía `false` **siempre**. Medido con una sonda temporal en el build, que es lo único que lo
enseñó.

Consecuencia: el vídeo se subió, se desplegó, y en el iPhone de Mario seguía el póster. El HTML
publicado no traía `<video>` y sí traía el cartel de «falta el vídeo», encima de un vídeo que
estaba perfectamente servido en `/video/entrada.mp4`.

**Y el error de método que lo permitió: se verificó en `dev` y se dio por bueno el `build`.** El
`Complete!` del build se leyó como si fuera una verificación, y no lo es: dice que compiló, no que
el HTML diga lo que debe. **Lo que se despliega es el build, así que es el HTML del build lo que
hay que mirar** —`grep "<video" .vercel/output/static/index.html`—, igual que con la barra de iOS
se aprendió a medir en el navegador y no a leer el código.

Arreglado con `import.meta.glob(..., { eager: true, query: "?url" })` sobre `src/assets/video/`,
que resuelve el bundler al compilar y por tanto no depende de dónde acabe el módulo. Probado en las
**dos** direcciones —con los ficheros y sin ellos—, que es justo lo que nunca se había hecho: el
mecanismo viejo solo se había visto dar `false` cuando `false` era la respuesta correcta.

**La entrada no ocupaba la pantalla.** La cabecera es `sticky` y reserva sus 61px en el flujo
aunque parezca flotar: la sección terminaba en y=904 con una ventana de 844, el centinela nunca
entraba en pantalla y la cabecera no se volvía transparente jamás. Se sube con
`margin-top: calc(-1 * var(--t-header-h))`.

**El texto sobre la foto no llegaba al contraste.** El claim daba 2,13:1 cuando un titular de 40px
necesita 3:1. Los topes del velo se recalcularon sobre la **posición medida** del texto, no a ojo.
Y se le añadió una sombra ancha y difusa pensando en el vídeo: **cuando el fondo cambie en cada
fotograma no habrá degradado que sirva para todos**.

**Doble recorte en las portadas de los bocetos.** Se recortaba la foto y luego el CSS la recortaba
otra vez, y eso se comía justo el sujeto. La imagen se prepara a la proporción exacta de su hueco.

**El mínimo automático de un track de grid**, tres veces en un día: un hijo ancho ensancha su
columna y arrastra a todos sus hermanos. Se arregla con `min-width: 0`. Ya estaba documentado para
las retículas de Cokima y volvió a morder en sitios nuevos.

**Un falso negativo propio.** Al comprobar si el rescoldo se pausaba fuera de pantalla salió que
no. Era el test: había tocado la animación por la Web Animations API y **eso la desincroniza del
`animation-play-state` del CSS**. En página limpia funcionaba. Antes de creer un resultado raro,
comprobar que el instrumento no lo está causando.

**El checkpoint de Vercel.** Sondear la preview en bucle (50 intentos) activó su anti-bot, y a
partir de ahí devuelve `403` a curl y a Playwright. Los greps siguen «funcionando» —devuelven cero
coincidencias— y eso se lee como «no se ha desplegado». El estado de un build se pregunta a la
API (`list_deployments` → `state: READY`), no martilleando la URL.

---

## 6. Por dónde seguir

1. **Iterar Brasa con Mario** (§3), que es la web en `preview` desde el 2026-10-31. Lo primero que
   espera: que elija una de las tres maneras de la carta. Y antes de producción, lo que §3 deja
   apartado a propósito: el cartel de cookies y la medición, la Cormorant servida desde la web, el
   inglés y las legales con el aspecto nuevo.
2. ~~Decidir si el rótulo del centro se queda al bajar.~~ En Brasa la barra solo aparece pasada
   la portada, así que los dos «Cokima» no coinciden.
3. ~~El vídeo~~ **puesto el 2026-08-17** (§4), pero **el que hay es provisional y Mario lo dijo
   expresamente**: lo pasó para ver cómo quedaba. **El pulido al 100% se hace cuando llegue el
   definitivo**, y hasta entonces no merece la pena gastar en ello. Lo que queda para ese día,
   anotado para no volver a razonarlo:

   - **AV1** en un tercer `<source>`. Ahorraría del orden de 300 KB sobre 1 MB, a cambio de
     complicar la matriz de compatibilidad y de gastar batería en móviles que no lo decodifican por
     hardware. Hoy no compensa; con el vídeo bueno y su peso real delante, se revisa.
   - **El corte del bucle**, que vuelve al principio en seco. El montaje ya cambia de escena cada
     cuatro segundos, así que no desentona, pero no está decidido si merece un fundido.
   - **Repasar el encuadre y el grado** con `scripts/video-entrada.sh`: los dos están calibrados
     para ESTE material, y el script explica cómo rehacerlos.
4. **`Hero.astro` y `Embers.astro` quedan huérfanos** a propósito. No se borran hasta que el
   rediseño cierre. **Desde el 2026-10-31 también** `Entrada.astro`, `Highlights.astro`,
   `MenuDeck.astro`, `AllergenFilter.astro`, `data/casa.ts`, `data/dish-images.ts` y la colección
   `menu-en`, que eran de las páginas que dejaron de publicarse. `Nav.astro`, `Footer.astro` y
   `Base.astro` siguen vivos: los usan las legales.
5. **El `hreflang` de las tres legales de Cokima** sigue roto: declaran que su versión inglesa es
   la home inglesa. El arreglo es `altSeoPath={null}` y su `Base.astro` necesita la prop, igual
   que se hizo en Ochoa el 31 de julio. No se ha tocado porque queda fuera de este hilo.
6. **Diez de las doce fotos de plato siguen sin identificar.** Ver `fotografia.md`.

## 7. Lo que no hay que volver a discutir

- Que Cokima y Ochoa compartan estructura. Ese fue el problema entero.
- La píldora en los controles de Cokima. Está fundada en la decisión contraria de Ochoa.
- Poner cosas en la landing. Solo el nombre —con «Kitchen Madness» debajo, que pidió Mario el
  2026-10-31— y los dos botones.
- El ratoncito de scroll y la flecha que rebota.
- Las fotos que estallan, las secuencias de pantallas como historias y las «extravagancias» en
  pantalla (§3, *Cokima a presión* y la tanda 1).
- Una sola página eterna: Mario pidió menú por secciones (§3, tanda 2).
