# Ochoa: el Inicio vivo

> **Estado: vivo** · en `preview` desde el 2026-10-29 · revisado 2026-10-30

- **Abierto:** 2026-10-28 · **En `preview`:** 2026-10-29
- **Ramas:** `preview`. Antes se probó en `feat/inicio-paralaje` (parada el 2026-10-28) y en
  `feat/inicio-vivo`, que entró entera en `preview` el 2026-10-29 con un avance directo. Lo que
  hay encima se eligió en un probador fuera del repositorio, en tres rondas.
- **Estado:** construido en las dos homes, la española y la inglesa, y medido sobre el build.
  Mario lo vio en su iPhone el 2026-10-29 y pidió ajustes, hechos ese día y medidos en el
  simulador de iOS y en los dos motores (§3.6 y §6); falta que los vea él.

Este documento explica **por qué** la home de Ochoa es como es desde el 2026-10-29 y por qué se
descartó casi todo lo que se propuso antes. Si vas a tocar la barra del ordenador, el fondo, la
portada o La casa, léelo antes: lo que se te ocurra seguramente ya se probó, y aquí está el motivo
por el que se quedó fuera.

---

## 1. El problema, y cómo se fue precisando

El 2026-10-28 Mario paró dos intentos seguidos de rehacer el Inicio. El primero, la rama
`feat/inicio-paralaje` —portada a pantalla completa, platos recortados en los huecos blancos y un
collage en el ordenador—: *«en ordenador es muy incómodo. Está extremadamente vacío»*, y *«no me
puedes poner una foto tan enorme y un plato en PNG tan enano»*. El segundo, cuatro direcciones
nuevas investigadas y puntuadas por un revisor; tampoco le convenció ninguna
(`archivo/2026-10-28-ochoa-inicio-direcciones.md`).

Entonces pidió quedarse con **la base de siempre** —«Reservar» siempre a mano, los botones que se
hunden, los títulos con su sombra, el menú desplegable y el mapa en 3D— y que la home *«se sienta
viva, no algo plano y estático»*. Eso fue la rama `feat/inicio-vivo`: paralaje en tres fondos, el
manifiesto en una banda roja con la pared de botellas, y un muro de La casa que cambiaba solo.

Al verla, el mismo día, Mario precisó qué le faltaba:

- en el ordenador quería **las secciones a la vista y no un menú**, con algo que reaccionara al
  cursor;
- el blanco le parecía plano, y propuso *«detalles sutiles rojos por el fondo que vayan
  moviéndose, haciendo formas»*, como hacen en el local;
- de La casa en el ordenador: *«no veo una estructura clara, como si estuviese desordenado»*.

Y después, ya con lo demás elegido, la portada no le convencía, *«principalmente por las
fotos»*, y en el ordenador tampoco la estructura. **Lo de la estructura era medible:** a 1440×900
la portada es una franja de 1440×682, y las fotos de Instagram son verticales o cuadradas, así que
se veía entre el 36 y el 47 % de su alto, y en una pantalla de alta densidad salían estiradas a
1,98×. En el móvil la quería a pantalla completa.

## 2. Lo que ordena las decisiones

**La base no se toca: lo vivo va encima.** Es lo que pidió Mario al parar los dos intentos, y por
eso nada de lo de aquí cambia la estructura de la hoja ni el sitio de «Reservar». Todo lo nuevo es
una capa: una luz sobre los rótulos, un fondo detrás de la página, una manera de enseñar las fotos
que ya había.

**Todo lo que se mueve solo obedece la regla 6** de `movimiento.md`: no corre fuera de la vista ni
con la pestaña oculta, se para para siempre cuando alguien lo toca, y no arranca con «reducir
movimiento». Lo que no cabe en las reglas lleva su excepción escrita allí, con fecha y motivo: el
fondo, que no se para mientras se ve la página; la tira, que no es lenta ni pequeña (regla 18); y
la sombra de El relieve, que se repinta con el ratón (regla 2).

**Se decide viéndolo, en la web de verdad.** Describir un movimiento no sirve (`metodo.md` §1). El
probador era la home construida, con sus fuentes, sus fotos y sus tiempos, y encima un panel para
cambiar de opción. Está en un Artifact privado de Mario
(`https://claude.ai/artifact/HFFN1Qx8eCbYDRYw6z56DC`); su código vive solo ahí y se lee con la
acción `read`. Era un boceto: lo elegido se reescribió en componentes y módulos del proyecto, con
sus tokens y sus reglas, y sin nada de lo que solo servía para comparar.

---

## 3. Lo que hay, pieza a pieza

### 3.1 La barra del ordenador: El relieve

`components/Nav.astro` y `relieve.ts`. Desde 861 px la barra enseña **La carta, Dónde estamos y
Conócenos** en Anton, en versal, más el enlace al otro idioma; el botón «Menú» desaparece. En el
móvil sigue el botón con la cortina. En inglés, las etiquetas que ya usaba el menú: Menu, Find us,
About us. «Dónde estamos» va a `#visita` en la home y a `/#visita` desde las demás páginas.

**El cursor es la luz.** La sombra dura de esos tres enlaces, del rótulo «Los Ochoa» y del titular
de la portada cae siempre hacia el lado contrario del cursor, y es más larga cuanto más cerca está:
0,03 em lejos y, a su lado, hasta 0,12 em en las secciones, 0,085 en el rótulo y 0,075 en el
titular. Se suaviza 0,22 por fotograma (`--relieve-suave`). Solo con ratón: el dedo no tiene
posición mientras no toca.

**La fórmula del rótulo sigue siendo una.** `.cartel` lee `--relieve-x` y `--relieve-y` con su
valor de siempre como reserva, y `relieve.ts` las publica solo en las piezas con `data-relieve`.
Así no hay una copia del valor en cada pieza (regla 20), y sin ratón todo queda como estaba.

**Entran con la entrada.** Las secciones y el idioma van dentro de `[data-intro-aparta]`, así que la
entrada de la web los saca de la pantalla y los trae deslizándose como a «Reservar»: fuera de ese
grupo se habrían visto puestos sobre la plancha roja desde el primer fotograma. Y si el menú estaba
abierto cuando la ventana pasa de 861 px, se cierra: el botón que lo cierra ya no está.

### 3.2 El fondo vivo: «Vermú y palabras»

`components/Fondo.astro` y `fondo.ts`, en la home y, desde el 2026-10-30, en «Conócenos», como en
el probador; en los dos idiomas. Un lienzo fijo detrás
de toda la página, dibujado en directo con WebGL2 —la manera que pidió Mario, la de PHSPORT—. Se ve
porque las secciones blancas no tienen fondo propio; los bloques opacos (portada, cinta,
manifiesto, pie, fotos) lo tapan. Dos capas a la vez:

- **El vermú:** la red de luz que deja un vaso al sol sobre el mármol, solo sus vetas, en rojo.
  Detrás del texto baja al 28 %.
- **Las palabras:** siete, todas en Yellowtail, la letra del espejo de la barra: Tortilla, Vermú,
  Gildas, Croquetas, Ensaladilla, Callos y Bravas (tres con su raya de pincel). Se pintan a mano
  donde hay blanco libre, viven 8,2 a 11,3 s y se borran; la siguiente espera 1,3 a 2,8 s
  (`--vidas-palabra`, `--esperas-palabra`, por turnos y sin compás). Como mucho tres a la vez, dos
  por debajo de 861 px. Si no cabe, se busca en 70 sitios y luego algo más pequeña (×0,82 y
  ×0,68). La luz es el cursor y, sin ratón, pasea sola; la luz del vermú las enciende. Van fijas a
  la pantalla, como pintadas en un cristal.

**Lo que tapa es la caja de cada pieza**, y del mosaico de La casa solo su caja entera, no lo de
dentro (§5). **Con «reducir movimiento»**, un fotograma quieto que solo se repinta al bajar o al
cambiar de tamaño, y las palabras salen ya pintadas, sin pincel. **Con la pestaña oculta** no se
pinta nada, y **al salir de la página** se suelta el contexto de WebGL antes de que el router cambie
de página.

**Sin ratón, el vermú va más fuerte** (2026-10-29). En su iPhone, Mario lo veía *«apenas»*: sin
cursor que lo encienda, a la escala del ordenador cabía menos de una celda de la red en la
pantalla, y casi todo el blanco tiene texto delante que lo baja al 28 %. Pidió *«un poquito más de
intensidad al color y al movimiento»*. En una pantalla sin ratón las vetas van a 0,38 de opacidad
en vez de 0,24 y a 0,7 de escala —más vetas en la pantalla—, un 40 % más deprisa; la luz que pasea,
que ya encendía las palabras, las enciende como el cursor en el ordenador (con media presencia); y
la red baja con la página al 12 %, como un plano lejano. Las palabras no: siguen fijas a la
pantalla. En el ordenador no cambia nada (`VETAS` en `fondo.ts`).

**Yellowtail se sirve desde la web**, como Anton y Archivo: `public/fonts/yellowtail-400.woff2`, el
subconjunto latino de Google Fonts (18 KB), y solo la pide el lienzo. **Su licencia es la Apache
2.0, no la OFL** que se daba por hecho: está en `apache/yellowtail` del repositorio google/fonts.
Origen y licencia, también junto a su `@font-face` en `global.css`. Si Yellowtail no llega, las
palabras no salen: no se pintan con otra letra.

### 3.3 La casa: el mosaico vivo

`components/Casa.astro`, `mosaico.ts` y `data/casa.ts`. Sustituye al muro de tres huecos que
cambiaba una foto cada 4 s. **Cuatro teselas** con diez fotos que se turnan; más o menos cada 3 s
(un cambio de 1,2 s y una pausa de 1,3 a 2,1, sin compás) la grande se encoge y una vecina crece en
su hueco con una foto nueva. En el ordenador, tres columnas y dos filas, con el texto en la primera
celda; en el móvil, dos columnas y tres filas, con el texto encima. El titular es el de siempre en
una línea, «Lo que hay detrás del cristal»: la foto del cristal, que antes iba entre sus dos tramos,
abre el mosaico en la grande.

**Nunca se estira una foto.** Cada tesela es una ventana recortada con `clip-path`, y la foto va
debajo, colocada con `transform` a la escala que la cubre con un 10 % de sobra. La que crece va
debajo y la que se encoge encima y arranca un 20 % antes, para que no se atraviesen. La foto nueva
entra desenfocada y se enfoca mientras se asienta: el gesto de Mochi (`--desenfoque`, regla 2).
**La ventana y su foto las mueve el script en el mismo fotograma**, no dos transiciones de CSS (§5).

**La foto grande lleva su nombre**, como una chapa: El cristal, La barra, Las cañas, El vermú, Las
bravas, El café, El comedor, El fútbol, Las gafas y El equipo. En inglés, traducidas tal cual. Con
el ratón encima el mosaico se para, cada foto se desplaza un poco dentro de su ventana y la que
tiene el ratón enseña su nombre. Al pulsar una —o con Intro o Espacio— se pone grande y desde ahí ya
no se mueve sola (regla 6). Solo corre con el 30 % a la vista y la pestaña delante. Sin JavaScript
queda una rejilla quieta con las cuatro primeras.

**Sin ratón, la ventana va con la página** (2026-10-29). Mario pidió el efecto del cursor también
en el móvil, *«pero únicamente que reaccione al scroll, no al dedo»*: al bajar, cada foto se
desplaza en su ventana más despacio que su tesela —al 12 %, hasta 24 px, frenando suave antes de
su borde—. Lo que sobra se mide en lo que se ve, también a medio cambio, así que nunca asoma el
fondo de la tesela. **La foto de La tasca hace lo mismo**: sin ratón, al bajar; con el ratón
encima, en el ordenador, se asoma como las de La casa (`data-ventana` en `paralaje.ts`).

### 3.4 La portada: el telón en el móvil, la tira en el ordenador

`components/Hero.astro` y `data/portada.ts`. Ocho fotos de Instagram que no salen en el resto de la
home; la serie, sus encuadres y por qué está cada una, en `fotografia.md`.

- **Móvil (por debajo de 861 px):** llena la pantalla bajo la cabecera,
  `calc(100svh - var(--t-header-h))`, sin la franja por la que asomaba el primer plato. Sigue el
  telón del 2026-10-27, con `compas.ts`, el indicador y el paralaje. Siete fotos: el rótulo del
  cristal no cabe en vertical (se leía «S OCHO»).
- **Ordenador, «la tira»:** el mismo alto que antes. Las ocho en fila, cada una entera al alto de
  la capa del paralaje —que sobresale un 8 % por arriba y por abajo— y con su proporción, con juntas
  de 3 px de tinta. La serie va dos veces para que la vuelta no se note. Avanza de derecha a
  izquierda a 28 px/s (`--vel-tira`), lineal y sin parar. Se para para siempre al primer toque en
  la portada, se pausa con menos de media portada a la vista o con la pestaña oculta, y con
  «reducir movimiento» se queda quieta. Sin indicador. El titular, el velo y el estado de apertura
  siguen donde estaban.

Las ocho fotos son los mismos elementos en las dos pantallas: el CSS las apila para el telón o las
pone en fila para la tira, y la copia de la serie la añade el script. Sin JavaScript, en el
ordenador queda la fila quieta.

**Desde el 2026-10-29, además:**

- **Bajar con el dedo encima no la apaga.** Se apagaba con `pointerdown`, que en el móvil es el
  primer gesto de cualquiera, y Mario la veía parada. Ahora solo la apaga un toque de verdad
  (regla 6 de `movimiento.md`, `toque.ts`); lo mismo el mazo de «Lo que más sale» y el manifiesto.
- **Cada foto se pide un turno antes.** En Chromium —los Android— las que esperan tapadas no se
  descargaban nunca, y el telón no pasaba de la primera (regla 28).
- **El encuadre se calcula para cada pantalla** en las fotos que dicen qué tiene que verse
  (`foco`) y qué letrero no puede salir partido (`letrero`), en `data/portada.ts`: la del vino y
  la de la caña. Con un encuadre fijo, medido a 390×844, el borde partía las letras del
  servilletero en otras pantallas («OCHOA» a 320 y 375 de ancho, «HOA» a 412×800). Ahora, en los
  móviles las letras quedan fuera, acercando la foto entre 1,02 y 1,54 veces; en los plegables y
  las tabletas, donde haría falta más, salen enteras. Lo que cuenta en la del vino es el vino
  cayendo en la copa, no el servilletero, que Mario vio en primer plano.
- **En un móvil tumbado va la tira**, a pantalla completa bajo la cabecera (§3.6).

### 3.5 Lo que se quedó de la rama, y el inglés

De `feat/inicio-vivo` siguen **el paralaje de los tres fondos** (`paralaje.ts`), **el manifiesto
rojo con las botellas** —a Mario le gustó al verlo: *«aporta algo de dinamismo»*; ahora es
`components/Manifiesto.astro`, para que la home inglesa lleve la misma pieza— y **el menú de
cortina**. Se sustituyeron el muro de La casa y el telón de la portada en el ordenador.

**La home inglesa es igual** desde el 2026-10-29: mismas piezas, con el texto inglés que ya había y
las etiquetas del mosaico traducidas tal cual. El `estado.md` del 2026-10-28 dejaba la igualación
para cuando Mario diera el visto bueno, y pedir esto en `preview` lo era.

### 3.6 Las pantallas

El 2026-10-29 Mario pidió asegurarse de que la web es *«completamente responsive»*, con los
plegables *«en formato pasaporte»* en mente. Se recorrió en 30 tamaños con Chromium y 17 con WebKit
—móviles de 320 a 440 de ancho, los tamaños que se esperan de los plegables cerrados y abiertos,
móviles tumbados, tabletas y pantallas de hasta 3440—, midiendo desbordamientos, textos y qué parte
de cada foto se ve. Del iPhone plegable solo hay filtraciones, así que se cubrió el rango y no un
aparato. Lo que se cambió:

- **Móvil tumbado.** La portada medía más que la pantalla —el mínimo de 420 px bajo una cabecera de
  62, en 390 de alto— y del titular se veía el 80 % y de «Abierto ahora», nada. En una pantalla
  baja ahora ocupa la pantalla bajo la cabecera, el titular se mide también por el alto y, si
  además está tumbada, va la tira en vez del telón, que enseñaba la mitad del alto de cada foto.
  «Lo que más sale» va en la tira de fichas que se desliza: una carta del mazo no cabía.
- **La isla de la cámara.** Con el móvil tumbado tapaba el borde del rótulo y del titular. El margen
  lateral de toda la web ya no baja de lo que tapan la isla y las esquinas (`.wrap` en
  `global.css`).
- **Las fotos de «Lo que más sale» van en proporción**, no a 190 px de alto: de un plato cuadrado
  se veía el 58 % en un iPhone y el 26–35 % en un plegable abierto o una tableta en vertical. Ahora,
  el 63 % en todos los móviles (16:10, casi el alto de antes en un iPhone) y el plato entero en la
  fila del ordenador.
- **Tableta en vertical.** En la tira, cada foto salía más ancha que la pantalla (1332 px en una de
  1024): nunca se veía entera. La portada mide como mucho tres cuartos del ancho.
- **La mesa de La tasca** dejaba ver el fondo dentro de su marco en los móviles (regla 29).

**Lo que se dejó como está, a sabiendas:** en el telón del móvil se ve entre el 36 y el 58 % del
ancho de cada foto cuadrada, porque llena la pantalla a lo alto, que es lo que pidió Mario; cada
foto lleva su encuadre, y la del vino y la de la caña, el que se calcula. El cartel de cookies
ocupa un cuarto de la pantalla en un móvil tumbado mientras no se decide. Con el móvil tumbado, el
menú deja seis de sus diez opciones bajo el borde, alcanzables desplazándolo. La foto de las
botellas, que es un fondo, enseña una franja cada vez más estrecha en las pantallas muy anchas (el
10 % del alto a 3440). A 861 px, en inglés, «Homemade» sobresale 2 px de su caja sin cortarse. Y
en WebKit, solo a 861 px de ancho, la home da un aviso «ResizeObserver loop» en cada carga, que
ya daba antes de estos cambios; no se ha buscado de qué observador sale.

---

## 4. Lo que se propuso y se descartó

Queda escrito para que nadie lo vuelva a proponer sin saber que ya se miró.

### Antes del probador (2026-10-28)

- **`feat/inicio-paralaje`**, parada por Mario (§1). Su estado propio vive solo en esa rama.
- **Cuatro direcciones** —El espejo, La vitrina, El cartel y La comanda—, ninguna elegida
  (`archivo/2026-10-28-ochoa-inicio-direcciones.md`).
- **El botón «Menú» que crecía hasta ser el menú**, con el muelle de Mochi. Mario lo eligió y, al
  verlo, volvió a la cortina: *«queda más simétrico»*.

### Primera ronda del probador

- **Navegación del ordenador: «El relieve», elegida.** Fuera «La chapa» (una chapa de papel bajo
  la sección) y «La foto» (asomaba la foto de la sección y seguía al cursor).
- **Fondo: ninguna de las tres.** De «El espejo» le gustaban las palabras sueltas, pero *«se me
  sigue quedando soso»*; quería algo *«como lo que hicimos con la web de PHSPORT, pero adaptado al
  lenguaje de esta web»*. Fuera también «El trazo» (dibujos de una línea) y «Las banderillas».
- **La casa: «Mosaico»**, pero *«algo más animada/interactiva»*: que las fotos salieran más a
  menudo, *«que cambiasen de forma y de posición según van saliendo»*. Fuera «Texto y muro» y «El
  inventario».

### Segunda ronda

- **Fondo, a la manera de PHSPORT, en tres escenas:** «Las palabras», «El vermú» y «Vermú y
  palabras». Eligió la tercera; del vermú dijo *«ideal»*. De la red de luz de PHSPORT tal cual se
  quitó todo menos las vetas: en blanco se veía como una neblina rosa.
- **Las palabras iban en dos letras**, la del espejo (Yellowtail) y la de los títulos, con PATATAS
  BRAVAS en versales. Se quedó con la del espejo: «Bravas» volvió en ella, entraron «Croquetas» y
  «Callos», y pidió que salieran *«ligeramente»* más a menudo.
- **El hueco para cada palabra se buscó primero preguntando a la página punto por punto**, y alguna
  rozaba un texto: ahora se mira la caja de cada pieza.
- **Las palabras atadas al scroll** se descartaron sin enseñarlas: en el iPhone el lienzo llega
  tarde y bailarían. Van fijas a la pantalla.
- **La casa, «Mosaico vivo», elegido**: *«me gusta mucho»*. Que dos teselas pequeñas se cambiaran
  el sitio a la vez se probó y se quitó: se atravesaban. Dos etiquetas no se entendían: «La ronda»
  (el chico con dos cañas por gafas) pasó a «Las gafas», que es lo que se ve, y «El delantal»
  (Guille) a «El equipo».

### Tercera ronda

- **Portada en el ordenador: «La tira», elegida**, frente a «El tríptico» (tres fotos verticales en
  fila, cada una con su telón y nunca dos a la vez), «El rótulo» (el titular en un panel rojo entre
  dos fotos que se turnan) y «Como ahora», que estaba para comparar. Fue a 22 px/s y Mario la pidió
  *«ligeramente»* más rápida: 28. No son la «pared» ni el «escaparate» de los cinco bocetos del
  2026-10-26, que eran rejillas quietas.
- **Portada en el móvil: a pantalla completa**, sin la franja de asomo.
- **La serie nueva**, elegida entre las 25 fotos de Instagram sin usar en la home. Fuera las de
  Navidad, que caducan; la de la camiseta del Madrid, que es de un equipo; y la del guante de
  Spiderman, que es más de Cokima. El cubo de madera (`DMf4a_eoWqt-1`) se guarda para Conócenos. Las
  seis de antes salen de la portada.
- **Las palabras con más esperas cortas y también vidas más cortas** daban casi el triple de
  palabras, más que *«ligeramente»*: se acortaron solo las esperas, un 25 %.

---

## 5. Las trampas que costaron tiempo

**La sombra del titular no seguía al cursor** en la segunda ronda: la regla del componente, con su
atributo de ámbito, pesaba más que la del probador. En el código de verdad la sombra se escribe en
la propia regla de `Hero.astro`.

**El mosaico contaba como si tapara el blanco de alrededor.** Sus teselas miden el mosaico entero y
sus fotos se salen de la ventana que se ve (las recorta un `clip-path`), así que las palabras no
encontraban sitio cerca de La casa. Del mosaico cuenta solo su caja.

**La foto se adelantaba a su ventana.** En el probador la ventana se movía con una transición de
`clip-path` y la foto con una de `transform`. Pasadas al código, la medición con estilos calculados
daba la foto cubriendo siempre su ventana; **las capturas no**: al empezar un cambio, una franja de
26 px sin foto al pie de la tesela que se encogía. El navegador lleva la transición del `transform`
en el compositor y la del `clip-path` en el hilo principal, y con el hilo principal cargado —aquí,
por el lienzo del fondo en un Chromium sin GPU— la foto iba por delante. Sin el lienzo, ninguna
franja. Ahora las dos las calcula `mosaico.ts` en el mismo fotograma, con las curvas de
`tokens.css`. La trampa es ya la regla 27 de `movimiento.md`. **Medir los estilos no es medir lo
pintado.**

**Vercel descarta en silencio los anchos que no están en `imagesConfig`.** El fondo del manifiesto
pedía 1440 y su `srcset` se quedaba en 960; ahora pide hasta 1600, que de una foto de 1440 devuelve
la foto entera sin agrandarla. Las fotos nuevas piden siempre anchos de la lista.

**La mezcla del manifiesto salía gris** porque el paralaje aislaba la foto del rojo: la regla 26 de
`movimiento.md`, de la rama `feat/inicio-vivo`.

**Tres más del 2026-10-29, ya reglas en `movimiento.md`:** tocar no es bajar con el dedo encima
(regla 6), Chromium no descarga lo que espera tapado por un `clip-path` (28), y lo que le sobra a
una capa se mide en la página, porque WebKit no lo resuelve como Chromium (29). Las tres se vieron
en un motor y no en el otro.

---

## 6. Lo medido

Sobre el build del 2026-10-29, servido en local con `/_vercel/image` sustituido por el archivo
original (en local no existe el optimizador de Vercel). Ordenador con Chromium a 1440×900 y
1024×768; móvil con WebKit a 390×844. Lo que se mide en el móvil es el motor, no un iPhone.

- **El relieve:** la sombra calculada cambia entre dos posiciones del cursor en las secciones, el
  rótulo y el titular, en las dos homes y en la carta. Las secciones se ven desde 861 px y a 860
  vuelve el botón «Menú». En la entrada, las secciones llegan deslizándose con los botones.
- **El fondo:** el lienzo mide la ventana (1425×900 a 1440, con la barra de scroll aparte) y pinta
  a 0,85 de la densidad, con un tope de 1,5. La única letra con la que se pintan las palabras es
  «140px Yellowtail», pedida a `/fonts/yellowtail-400.woff2`; ninguna petición a Google. Con la
  página quieta, en el ordenador nacieron 19 palabras en 120 s (40 s en Lo que más sale, La tasca y
  Dónde estamos), como mucho tres a la vez; en el móvil, 8 en 60 s en La tasca, como mucho dos. En
  el probador, medido igual pero con su panel encima de la página, fueron 15 y 10: el mismo orden.
  Con la pestaña oculta, 0 fotogramas en 2 s, y al volver sigue pintando. Al ir a la carta, 0
  fotogramas y el contexto soltado; al volver a la home, se monta otro.
- **El mosaico:** 5 o 6 cambios en 16 s a la vista. La foto cubre siempre su ventana, con un
  margen mínimo de 20,5 px a 1440, 8,8 a 1024 y 7,7 a 390 (lo peor de varias pasadas), medido
  fotograma a fotograma y ya sobre lo que se pinta. Con el ratón encima, ningún cambio en 6 s;
  fuera de la vista, ninguno; tras
  pulsar la más pequeña, se pone grande con su chapa y ningún cambio en 9 s; con «reducir
  movimiento», ninguno. Las etiquetas salen en los dos idiomas.
- **La portada en el móvil:** cabecera 62 + portada 782 = 844, la pantalla entera. Siete fotos y
  siete puntos; la del vino, a 1,15 desde su encuadre (100 % 50 %). A los 4,2 s el telón ya ha
  traído la segunda.
- **La tira:** a 1440×900, portada de 682 px y capa de 791. Cada foto se ve entera de ancho y en el
  86 % de su alto, a entre 0,88 y 1,10× en una pantalla de densidad 2 (antes, 1,98×); a 1024, a
  entre 0,75 y 1,00×. Juntas de 3 px. Avanza a 28 px/s: entre 27,6 y 29,7 según la pasada, con un
  reloj que va por fuera de la página y una máquina cargada por el lienzo; con el 40 % de la
  portada a la vista, 0; tras un clic en la portada, 0, también después de bajar y volver; con
  «reducir movimiento», ninguna animación. Con la pestaña oculta recorre entre 0,5 y 6,5 px en
  1,5 s, que es lo que tarda en hacerse efectiva la pausa (de 20 a 230 ms).
- **Regla 25:** el mosaico empieza al menos 1.381 px por debajo de «Lo que más sale» en el móvil
  (pantalla de 844) y 1.555 por debajo de la portada en el ordenador: nunca comparte pantalla con
  el telón ni con el mazo, y por eso lleva su propio reloj.
- **Sin scroll lateral** en las once rutas de la web a 390, 1024 y 1440, recorriendo cada página de
  arriba abajo, y en las dos homes y la carta a 861 y 860. **Sin errores de JavaScript**, también
  navegando con el router de la home a la carta y de vuelta. El único error es el de siempre en
  local: el motor de reservas devuelve 403 a una plantilla en `http://localhost`.

**Del 2026-10-29, tras verlo Mario en su iPhone** (build local; simulador de iOS con un iPhone 17,
y Playwright con Chromium y WebKit):

- **Al bajar con el dedo:** en el simulador, la portada y el mazo siguen pasando después de bajar
  con el dedo encima, y una carta tocada se queda quieta. En Chromium, con el gesto táctil de
  desplazamiento de CDP, el dedo da `pointerdown` y `pointercancel` y el mazo sigue en tres
  pasadas; el manifiesto sigue al bajar y se para con un toque. Antes, en el simulador, la portada
  se quedaba en la misma foto para siempre.
- **El telón sin tocar:** un cambio cada 3,5 s en los dos motores, y en Chromium llegan las siete
  fotos (antes, 1 de 7).
- **La mesa de La tasca:** ningún píxel de fondo en 19 a 21 posiciones por tamaño, en los dos
  motores (antes, 6,5 px a 390); sin ratón se mueve ±14,5 px a 390 en Chromium y de −19,4 a 14,5
  en WebKit; con el ratón en las esquinas, ±9,6 y ±7,7 px.
- **El mosaico sin ratón:** cada foto, hasta 24 px al bajar, sin un píxel de fondo, tampoco
  muestreando 4 s de cambios.
- **El vermú en el móvil:** el rojo que añade al blanco, en una franja de La casa a 390×844, sube
  un 36 % (de 0,58 a 0,79 de media).
- **Las pantallas:** en 26 tamaños con Chromium y 11 con WebKit, el titular y «Abierto ahora» se
  ven enteros al entrar, también tumbado y con el cartel de cookies; las letras del vino y de la
  caña no salen partidas en ninguno; de un plato se ve el 62–63 % en el móvil y el 100 % en el
  ordenador; a 1024×1366, la foto más ancha de la tira mide 891 px. **Sin scroll lateral** en 7
  rutas, en 11 tamaños con Chromium y 7 con WebKit, recorridas enteras.

**Sin medir:** en un iPhone de verdad (el gasto del lienzo en la GPU, el desenfoque y la barra del
navegador), con un ratón de verdad, en una conexión lenta, y el peso real de las fotos servidas por
Vercel.

---

## 7. Lo que no hay que volver a discutir

- La base de la web: «Reservar» siempre a mano, los botones que se hunden, los títulos con su
  sombra, el menú desplegable —la cortina, en el móvil— y el mapa en 3D.
- Que en el ordenador se vean las secciones y no un botón de menú.
- El fondo: el vermú y las palabras, las palabras solo en la letra del espejo.
- Que dos teselas del mosaico se cambien el sitio a la vez: se atraviesan.
- La portada del ordenador: la tira. El tríptico, el rótulo y el telón a todo lo ancho ya se
  compararon con ella.
- La franja de asomo en el móvil: Mario prefiere la pantalla completa.

## 8. Por dónde seguir

Lo que espera a Mario está en `estado.md` §0. Lo que toca a este documento:

1. **Que Mario vea en su iPhone los ajustes del 2026-10-29** —el telón y el mazo al bajar, las
   fotos de La casa y de La tasca al bajar, el vermú— y diga si el vermú se nota lo justo (la
   palanca es `VETAS` en `fondo.ts`). Lo que cuesta el lienzo en un móvil modesto sigue sin medir:
   si se nota, la primera palanca es la densidad (`MAX_DPR` y `ESCALA`). Ningún plegable real se
   ha probado, solo sus tamaños.
2. **El muelle de Mochi (`--ease-muelle`) no lo usa nada** desde que el mosaico sustituyó al muro.
   Se dejó en `tokens.css` porque la decisión de Mario sigue en pie; si no vuelve a hacer falta, se
   quita con su excepción de la regla 1.
3. **Las seis fotos de la portada anterior** siguen en `src/assets/portada/` sin uso (`fotografia.md`).
