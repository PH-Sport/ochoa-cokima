# Estado del proyecto

- **Corte:** 2026-08-17
- **Rama de trabajo:** `tmp/entrada-cokima` (el rediseño de Cokima, en curso) · `preview`
  (desarrollo, todo lo demás integrado) · `main` (producción, sin nada nuevo aún)
- **Este documento es el punto de entrada.** Lo demás cuelga de aquí.
- **Esta es la versión buena del documento.** La que hay en `preview` solo cuenta lo integrado y
  remite aquí.

---

## 0. Por dónde seguir

**Mario alterna entre las dos webs y dice al empezar la sesión a cuál ataca. Esperar a que lo
diga, en vez de deducirlo de este documento.** Lo de abajo cuenta dónde quedó cada cosa, no qué
toca hoy: que el trabajo a medias sea el de Cokima no significa que la sesión vaya de Cokima.
Queda derogado el orden del 2026-08-04 —«primero Ochoa y Cokima después»—, que ya no rige.

**COKIMA SE ESTÁ REHACIENDO ENTERA, y es lo que tiene trabajo abierto.** El trabajo vive
en la rama `tmp/entrada-cokima`, no en `preview`.

**Y esto se desarrolla desde dos ordenadores** —un Mac prestado y el HP de Mario—, que el
2026-08-16 estuvo a punto de costar caro: el HP llevaba diez días sin `fetch`, con una rama local
llamada `preview` que en realidad era otra cosa. **Antes de leer nada más, §1.1.** Se resume en
`git fetch --all --prune` nada más sentarse, y en no pushear una rama sin mirar a dónde apunta.

**Antes de tocar nada, leer `cokima-el-rediseno.md`.** Explica por qué se descartó todo lo que se
propuso antes de llegar aquí, y sin eso la mitad de las decisiones de `Entrada.astro` parecen
arbitrarias. En dos frases: Cokima era *literalmente* Ochoa con dos secciones menos —mismos
componentes, mismos nombres de clase—, Mario lo paró, y la distinción que ordena el rediseño es
suya: **Ochoa es transacción social** («pido lo de siempre, me siento y a charlar con mi gente»)
y **Cokima es experiencia pícara**.

**Lo construido:** la landing. `apps/cokima/src/components/Entrada.astro` — la pantalla entera es
el plato, el nombre en el medio, dos botones píldora abajo, y **nada más**: el rótulo de la
cabecera, la hamburguesa y el cartel de cookies aparecen al deslizar. Es una decisión explícita de
Mario y no hay que erosionarla añadiendo «solo una cosita más».

**Y desde el 2026-08-17 el fondo es el vídeo**, no el póster: llegó de Higgsfield en horizontal y
claro, y entró recortado a vertical y con el grado horneado para que quede en segundo plano —que
es como lo pidió Mario— en vez de pelearse con el rótulo. El póster sigue ahí y sigue haciendo
falta: en iPhone con ahorro de energía es lo único que se ve. Detalle en `cokima-el-rediseno.md` §4.

**LO SIGUIENTE, Y ESTÁ SIN DECIDIR: qué va debajo de la entrada.** Hoy debajo sigue la portada
vieja —`Highlights`, manifiesto, casa, visita—, que es exactamente el esqueleto de Ochoa que se
quería tirar. Mario dejó dicho «enseguida vamos con lo que ocurre al scrollear»: **es una
conversación con él, no una tarea que ejecutar por cuenta propia.**

**Lo que espera a Mario:**

1. ~~El vídeo de la entrada.~~ **Entregado y puesto el 2026-08-17.** Vino de Higgsfield en
   horizontal (1920x1080, 27 s, 18,5 MB) y claro; se recortó a vertical `608x1080` y se le horneó
   el grado de la casa para que case con el póster, que es casi negro. Pesa **1,05 MB en MP4 y
   0,94 MB en WebM**. El porqué de cada parámetro está en `cokima-el-rediseno.md` §4. Queda
   anotado, sin decidir, si el corte del bucle merece un fundido.
2. **Identificar diez fotos de plato** con el restaurante. Sin eso no pueden ir en la carta. Ver
   `fotografia.md`.
3. **Decidir si `tmp/entrada-cokima` se fusiona en `preview`**: o se fusiona o se descarta, y se
   borra en los dos casos. Es el mismo trato que tuvo `tmp/entrada-ochoa`, **que ya se cerró el
   2026-08-16**: llevaba diez días parada con la tanda terminada y en verde dentro, y entró en
   `preview` con `--no-ff` para que se pueda sacar de un tirón (§3.octies). **Esta no está en ese
   punto**: la entrada nueva convive con la portada vieja debajo, y eso está a medias a propósito.
4. La clave de Google Maps, validar la carta en inglés, si «fríos» y «calientes» se separan, y
   unificar «Idiazabal» / «Idiazábal». Detalle en §4.

**Deuda de Cokima que sigue ahí y queda fuera de este hilo:** sus tres páginas legales arrastran
el `hreflang` roto que se corrigió en Ochoa el 31 de julio —declaran que su versión inglesa es la
home inglesa—. El arreglo es pasar `altSeoPath={null}` y su `Base.astro` necesita esa prop.

**Y `Hero.astro` y `Embers.astro` de Cokima quedan huérfanos a propósito.** No se borran hasta
que el rediseño cierre.

---

### Lo cerrado en agosto, por si hace falta el contexto

**La barra del navegador en iPhone (2026-08-01).** Era el `ClientRouter` de Astro, que hace
`history.replaceState` cada vez que el scroll se detiene. El arreglo es
`packages/ui/src/QuietScrollHistory.astro`. Todo el caso está en `barra-del-navegador-ios.md`, y
**su §8 —los tres errores de método— vale más que el arreglo**. La receta portable, para
cualquier web con `<ClientRouter />`, en `receta-barra-ios-astro.md`.

**«Conócenos» de Ochoa (2026-08-04)** está montada y navegable en los dos idiomas, pero su cuerpo
son cuatro rejillas de texto que dicen qué falta contar. Lleva `noindex` y fuera del sitemap; **el
interruptor es `EN_OBRAS` en `apps/ochoa/src/conocenos.ts`, y ponerlo en `false` es el único
paso**. Sigue esperando material.

**Los despliegues cruzados (2026-08-16).** Cada push reconstruía las dos webs. Resuelto con un
`ignoreCommand` por app; detalle y pruebas en `deploy.md`. Confirmado en real: al subir la rama de
Cokima, Ochoa quedó en `CANCELED`.

**Cómo levantarlo:** los `pnpm dev` lanzados en segundo plano desde el agente se mueren solos, y
ha pasado en las dos máquinas. Lanzarlos desde una terminal propia. Para ver el resultado sin `dev`, sirve
`apps/cokima/.vercel/output/static` tras un `pnpm --filter cokima build` — pero recuerda que el
optimizador de imágenes de Vercel no existe fuera de Vercel y habrá que suplir `/_vercel/image`.

**Y no sondear las previews en bucle esperando a que estén listas:** activa el checkpoint anti-bot
de Vercel y a partir de ahí devuelve `403` a curl y a Playwright, con lo que los greps empiezan a
devolver cero coincidencias y parece que el despliegue ha fallado. El estado se pregunta a la API
de Vercel (`list_deployments` → `state: READY`).

**El repo está vinculado a Vercel y cada push despliega.** Los alias fijos están en §6. No buscar
`.vercel/project.json` para comprobarlo: está en `.gitignore` y la vinculación por Git vive en el
panel de Vercel, no en el repo. El 31 se dedujo mal justo por ahí.

---

## 1. Modelo de ramas

| Rama | Papel | Alias de Vercel |
|---|---|---|
| `main` | Producción | falla a propósito sin `SITE_URL` |
| `preview` | **Desarrollo — todo se integra aquí** | alias fijo por rama (ver §6) |
| `tmp/entrada-cokima` | **Abierta.** El rediseño de Cokima | `cokima-git-tmp-entrada-cokima-rodz-dev.vercel.app` |

Ramas de tema opcionales y efímeras: nacen de `preview` y vuelven a `preview`.
Detalle en `deploy.md` §Modelo de ramas.

**`tmp/entrada-cokima` es temporal y espera decisión de Mario**, igual que hizo
`tmp/entrada-ochoa` en su momento: cuando decida, o se fusiona en `preview` o se descarta, y se
borra en los dos casos. Mientras tanto **no se integra**, porque la entrada nueva convive con la
portada vieja debajo y eso está a medias a propósito.

**Es la única rama temporal viva.** `tmp/entrada-ochoa` se cerró el 2026-08-16 y se borró: su
tanda está dentro de `preview` (§3.octies) y su alias de Vercel murió con ella. Llegó a haber dos
a la vez, en dos ordenadores distintos, y eso fue justo lo que se lió. **Una cada vez.**

### 1.1 Cambiar de ordenador

El proyecto se desarrolla en dos máquinas —un Mac prestado y el HP de Mario—, nunca a la vez.
El 2026-08-16 se descubrió que las dos tenían árboles distintos: el HP llevaba desde el día 7 sin
`fetch`, y su rama local `preview` no era `preview` sino la punta de `tmp/entrada-ochoa`, con un
botón de «Sync Changes 10↑» en Cursor esperando a que alguien lo pulsara. Habría empujado a
`origin/preview` exactamente la tanda que Mario había pedido no subir ahí.

No se perdió nada porque el trabajo estaba respaldado en su rama remota, pero la lección va
escrita aquí para que no dependa de esa suerte:

**Al sentarse en cualquiera de las dos máquinas, antes de leer código ni documentación:**

```bash
git fetch --all --prune
git status -sb          # ¿cuántos commits arriba y abajo, y de qué rama?
git branch -vv          # ¿a dónde apunta de verdad cada rama local?
```

**Las tres reglas que salieron de aquel susto:**

1. **No fiarse del nombre de una rama local.** Una rama llamada `preview` puede estar en otro
   sitio. `git branch -vv` dice la verdad; el rótulo de Cursor, no.
2. **No pulsar «Sync Changes» sin mirar qué commits son.** El botón no distingue entre subir tu
   trabajo y contaminar la rama de integración.
3. **Rama temporal que se abre, rama que se sube a `origin` el mismo día.** Un disco duro no es
   una copia de seguridad, y aquí no se trabaja siempre desde el mismo.

Si una rama local ha derivado, **se prueba primero el camino que no destruye nada**:

```bash
git checkout preview
git pull --ff-only      # si avanza, no había divergencia real: se acabó
```

Es exactamente lo que le toca al HP: sus diez commits acabaron dentro de `preview` al fusionarse
la entrada de Ochoa, así que su rama local es un **ancestro** de `origin/preview` y sube sola sin
perder nada. **El `--ff-only` es el seguro**: si hubiera commits realmente divergentes se niega a
moverse, en vez de tejer un merge a ciegas.

Solo si se niega hay divergencia de verdad. Y entonces se comprueba dónde vive lo que se va a
tirar **antes** de tirarlo:

```bash
git branch -r --contains <sha>   # ¿está respaldado en alguna rama remota?
git reset --hard origin/preview  # solo con esa respuesta en la mano
```

**Al terminar en una máquina:** subir todo lo que tenga valor —`git push` de la rama de trabajo—,
y dejar el corte de este documento con la fecha del día. Lo que no está en `origin` no existe
para la otra máquina.

---

## 2. Qué está construido

**Fase 1 — las dos webs.** Astro 6 estático + adaptador Vercel, pnpm workspaces.
Cada app: 6 páginas ES + 3 EN, endpoint CAPI, robots + sitemap, JSON-LD `Restaurant`,
hreflang, banner de consentimiento. Cartas reales transcritas ES+EN.

**Fase 2 — divergencia de layout.** Las 12 tareas del plan, ejecutadas en `preview`:
carta "baraja" de Cokima con tabs y snap horizontal, carta "pizarra" de Ochoa con toggle
½/entera y buscador, barra inferior de Ochoa y barra de reserva de Cokima con estado de
apertura real en hora de Madrid, View Transitions, y `MenuSection`/`DishRow` retirados de
`packages/ui`. Registro detallado en `estado-divergencia-layout.md`.

**Fase 3 — portadas, chrome y piel de Ochoa (2026-07-29).** Las dos homes abren con una
foto a sangre y titular anclado abajo a la izquierda, sin párrafo ni botones; debajo, una
tira de platos con nombre y precio que **asoma por el borde inferior** de la primera
pantalla. La reserva y la navegación se mudan a la cabecera (`[Reservar]` + hamburguesa
con foco atrapado), y desaparecen `BottomBar` y `ReserveBar`. Ochoa se viste con su marca
real: rojo bandera sobre blanco, sin serif ni grano ni verde oliva. Diseño en
`superpowers/specs/2026-07-29-portadas-y-chrome-design.md`, plan en
`superpowers/plans/2026-07-29-portadas-y-chrome.md`.

**Verificado el 2026-07-29 en `preview`,** midiendo a 390px en las cuatro homes:
`pnpm test` → 43 tests en verde (32 content, 6 tracking, 5 config) y `pnpm build` →
`Complete!` en las dos apps. La cabecera baja de 110px a 61px en Cokima y a 62px en
Ochoa; la portada ocupa el 77,5% de la pantalla y asoman las fichas con su precio;
cabecera e interruptor de la carta encajan con 0px de solape; el cartel de cookies se
apoya en el borde inferior sin competir con nada y sus dos botones miden 168,5px cada
uno; la carta de Ochoa sobre blanco da 17,4:1 de contraste y el titular de las portadas
15,7:1 (Cokima) y 16,0:1 (Ochoa).

---

## 3. Pendiente de construir

**Lo que bloquea de verdad:**

- [ ] **Fotografía real.** Ni una foto nueva ha entrado: la extracción desde Instagram
      está bloqueada por la firma de las URLs de su CDN. Las webs siguen con las fotos
      antiguas y **los once platos destacados salen sin imagen**. Todo lo demás está
      construido para recibirlas sin tocar layout. Detalle y claves de archivo exactas en
      `fotografia.md`.

**Menores:**

- [ ] **La clave de Google Maps** (`PUBLIC_GOOGLE_MAPS_KEY`). `Mapa.astro` ya está montado en la
      home ES de Ochoa: con clave dibuja el callejero real coloreado con la paleta de la casa —una
      imagen estática, cero JavaScript y cero cookies de terceros, que hoy esta web no tiene
      ninguna— y sin ella enseña el hueco marcado. El «cómo llegar» funciona en los dos casos
      porque no depende de ninguna API. **Cokima y la home EN de Ochoa siguen con el `.mapbox`
      viejo** y su cartel *«Mapa · pendiente de integrar»*.
- [ ] **Validar la carta en inglés con el restaurante.** Traducida entera el 2026-07-31,
      manteniendo sin traducir lo que no tiene equivalente (gilda, pintxo, txistorra, cachopín,
      torreznos, soldaditos de Pavía, revolconas). Es un documento comercial y lo tradujo el
      agente con criterio propio.
- [ ] **Comprobar en un iPhone real** que el hundido de los botones se ve. La lógica ya no
      depende de `:active` (ver §3.quater), pero Playwright usa Chromium: la verificación en
      Safari de iOS no se ha podido hacer desde aquí.
- [ ] El fragmento rojo del titular de Cokima da **4,26:1** sobre la foto. Cumple el 3:1
      que WCAG exige para texto grande (36,8px en negrita), pero no el 4,5:1 general: el
      vermellón `#ed1c24` no puede alcanzarlo ni sobre negro puro, donde su techo teórico
      es 4,2:1. Cambiarlo es decisión de marca (ver §4).
- [ ] Las fichas de destacados sin foto se resuelven tipográficamente. Funciona, pero la
      tira gana mucho en cuanto haya imágenes.
- [ ] `formatPortionPrice` (en `packages/content/src/portions.ts`) se quedó sin usuarios al
      pasar la carta a dos columnas: ya nadie elige una porción, se pintan las dos. Desde que la
      carta del 2026-07-31 va a precio único, **tampoco queda ni un plato con media ración** en
      Ochoa. **El 2026-08-04 Mario cerró el asunto: la carta puesta es la vigente y las medias
      raciones no vuelven**, así que la función es código muerto y se retira con sus cinco tests
      la próxima vez que se toque `packages/content`. El esquema sí conserva el formato
      `{ half, full }`, que no estorba y describe una carta que podría volver a tenerlo.
- [ ] Astro avisa al construir de que no puede generar el JSON schema de las colecciones
      `menu-es`/`menu-en` (`Cannot read properties of undefined (reading 'def')`). Es
      incompatibilidad de versiones entre zod y el generador de tipos de editor; **la validación
      del contenido sí funciona** y el build termina en `Complete!`. Solo afecta al autocompletado.

---

## 3.ter Las fotos de Ochoa, rehechas el 2026-07-30

**Hay nueve fotos del local en la web vieja del grupo** (`/wp-content/uploads/2021/09/LosOchoa-1..9.jpg`,
1000×1000) que nadie había mirado. De ahí sale todo lo de abajo.

**La portada es la fachada** (`hero.jpg`): el toldo rojo, el cartel colgante, la barra vista
desde la calle y «LA TASCA QUE TE MERECES» en el cristal. Dice qué sitio es antes de leer una
palabra. Es una sola pieza a sangre en todos los anchos, con el titular apoyado en la foto y su
sombra roja, que es lo que mejor funcionaba de la portada original.

Dos intentos anteriores, y por qué se descartaron: el **cenital de la mesa** no decía nada
recortado a vertical —se quedaba en un fragmento de plato sin contexto— y se mudó a la sección
«la tasca», que es apaisada y le sienta; el **rótulo del cristal** era demasiado plano de cerca
y, siendo cuadrado, en móvil solo cabía el 60% del ancho («OS OCHO»), lo que obligó a partir la
portada en dos con una banda roja bajo la foto. Esa partición se retiró: la banda competía con
la imagen y forzaba a cambiar el color de la sombra del titular. El rótulo del cristal no se
pierde, es la segunda foto de «la casa».

**«Lo que hay detrás del cristal» ya no son rejillas:** las cuatro son fotos reales —la barra
con el espejo rotulado a mano, el rótulo del cristal, el vermú con su banderilla y el interior
con el banco corrido rojo—, así que la sección se publica. Van en **dos columnas desfasadas**,
con la derecha bajando un escalón: ni el mosaico de piezas desiguales del primer intento ni la
cuadrícula perfecta del segundo, que quedaba rígida.

**Un fallo de la fase 3 que salió al mirar:** el estado de apertura de la portada iba en tinta
atenuada sobre una foto oscurecida por el degradado, o sea gris oscuro sobre fondo oscuro. Se
resuelve reescribiendo dentro de `.copy` los tokens `--t-text*` que consume, no parcheando el
componente.

## 3.quinquies La plancha roja del menú y la paridad del inglés (2026-07-31, tarde)

Mario abrió el menú en el móvil y señaló la costura: barra roja arriba, folio blanco debajo.
El problema no era la persiana, era el material. Diseño en
`superpowers/specs/2026-07-31-panel-rojo-y-paridad-en-design.md`, plan en
`superpowers/plans/2026-07-31-panel-rojo-y-paridad-en.md`.

- **El panel es la misma plancha roja que la barra**, cuyo filete se apaga mientras dura el
  menú. Se transparenta el color y no se quita el borde: `syncHeaderHeight()` mide la barra con
  `getBoundingClientRect()` —el borde incluido— y quitarlo la encogería dos píxeles.
- **Dentro, la fórmula del rótulo invertida:** papel con sombra tinta, que es la misma que ya
  usa el titular de la portada sobre la foto con los papeles cambiados. El número de sección
  baja a tinta y pasa a ser el único elemento oscuro.
- **El panel reescribe los tokens `--t-*` que consumen sus hijos**, como hace `.copy` en la
  portada. Eso destapó que sin `--t-open` el punto de «Abierto ahora» cae a `--t-accent`, que
  es este mismo rojo, y habría desaparecido.
- **La persiana por fin se ve:** cayendo blanca sobre contenido blanco no se notaba, y encima
  gastaba sus primeros 62px por detrás de la barra. Ahora el recorte arranca en `--t-header-h`.
- **El relieve al dedo estaba roto en media casa**, y se descubrió midiendo. `[data-tacto].tocando`
  pesa (0,2,0) y Astro añade el `[data-astro-cid-…]` a todo selector de un componente con
  estilos con scope, así que `.contacto a` pesa (0,2,1) y ganaba: las fichas ponían la clase, no
  se hundían —tampoco en la portada— y al soltar daban un salto desde abajo porque la animación
  de vuelta sí corría. El fantasma y el «Reservar» de la barra caían por otra vía: empataban a
  especificidad y ganaba el último declarado. **Regla para el futuro: el bloque de tacto va
  siempre después de los botones en la hoja global, y cualquier componente que reescriba
  `box-shadow` tiene que reescribir también su `.tocando`.**
- **La home inglesa alcanza a la española:** cinta, «la tasca» y «la casa» con el titular
  partido, `Mapa.astro` real en vez del dibujo de pega, y las fichas de contacto. Con ella
  mueren un `border-radius: 6px` suelto y las reglas de una portada retirada hace dos fases.
- **Las legales se quedan en español a propósito** (decisión de Mario: el texto válido en España
  es ese, y traducir un documento jurídico sin validar es un riesgo que no compensa). Lo que se
  arregla es que no mientan: el pie inglés marca «(ES)» y el `hreflang` deja de declarar que la
  versión inglesa del aviso legal es la home inglesa. `altPath` pasa a opcional en `Seo.astro` y
  `Base.astro` gana `altSeoPath`, porque navegar y declarar equivalencia son cosas distintas.

## 3.sexies El vaivén de la barra del navegador en Chromium (2026-08-01)

Mario lo describió probando en Brave: la barra de direcciones aparece y desaparece de forma
irregular, «muy sensible a los cambios de dirección», y al hacerlo parece redimensionarse la
página entera. **En Safari no pasa**, y esa asimetría es la pista: en Chromium el colapso de la
barra redimensiona el viewport de verdad, mientras que Safari desde iOS 15 mueve solo el viewport
visual. El resize no se puede evitar; lo que se ha quitado es lo que lo estorbaba.

**Dos reglas heredadas, las dos vestigios, las dos fuera de las dos webs:**

- **`body { overflow-x: hidden }`.** No recortaba una caja: el `overflow` del body se propaga al
  viewport cuando el del `<html>` es `visible`, así que convertía el documento entero en un
  scroller con desbordamiento tapado, que es justo lo que enturbia el mecanismo de Chromium.
  **Y no protegía nada:** medido sin ella, el ancho desplazable es igual al visible en las ocho
  rutas de Ochoa y las ocho de Cokima a 360px. Lo único que se sale son las tarjetas de la tira
  de platos, y de eso ya se ocupa el `overflow-x: auto` de la propia tira.
- **`scroll-behavior: smooth` en el `<html>`.** No animaba ninguna navegación, porque no hay en
  todo el monorepo un solo `href="#"` ni un `scrollIntoView`; el único scroll suave que existe
  —el de la tira de platos, `Highlights.astro:145`— pide su `behavior` en la propia llamada y no
  depende de la regla. Lo que sí animaba eran los reajustes de scroll que se da el navegador.

Se queda `scrollbar-gutter: stable`, que sí hace un trabajo real: sin él la página se ensancha de
golpe al abrir el menú. Verificado tras el cambio: `scroll-behavior: auto`, `overflow-x: visible`
y ancho desplazable igual al visible en las dieciséis rutas, con el menú **cerrado, abierto y
cerrado otra vez**; la portada sigue a 62px con el menú abierto, así que el arreglo del salto de
§3.quinquies sigue en pie. Regla 15 de `movimiento.md`.

**Segunda vuelta, con el dato que lo cambia todo:** Mario probó y **la carta quedó perfecta, la
portada no**. Eso descarta lo global y señala a algo que solo vive en la portada. Medido con
`Performance.getMetrics` y un trace de Chromium, diez cambios de alto del viewport cuestan:

| | recalcs de estilo | Paint | tareas de rasterizado |
|---|---|---|---|
| Portada | 20 | 9,0 ms | **45** |
| Carta | 10 | 0,7 ms | **0** |

**Dos causas, y una descartada que parecía la buena.** Mario preguntó si eran las imágenes:
ocultarlas todas **no** baja el rasterizado (47 tareas), y de hecho las mediciones se hicieron con
cinco de las seis sin cargar —`/_vercel/image` no existe fuera de Vercel, así que en local dan
404—, o sea que **el coste real en producción es mayor que el medido**. Lo que dispara el
rasterizado es **el `.hero`, cuya altura cuelga de `100svh`**: clavarlo en píxeles lo tira de 45
tareas a 3 y el pintado de 9,0 ms a 2,5. Cualquier cambio de alto del viewport le cambia el
tamaño y obliga a repintar 375×654, casi la pantalla entera. La carta no tiene nada así.

- **Arreglado: la cinta rotulada se para cuando no se la ve** (regla 6, que incumplía). Deja los
  recálculos de estilo de la portada en los mismos 10 de la carta. Verificado: pausada arriba y
  abajo, corriendo al volver **y por donde se quedó**, una sola instancia tras navegar y volver,
  y quieta con la pestaña detrás.
**Tercera vuelta, la que lo cierra.** Mario probó otra vez: **sigue igual por toda la portada,
esté arriba o abajo**. Eso descartaba el hero… y en realidad lo señalaba, porque **las dos
primeras tandas de medición se hicieron a `scrollY 0`** y esa ventana no valía para nada. Midiendo
a 0, 1200, 2400 y 3200, el coste es constante en la portada (72-116 tareas) y **cero en la carta
en todas**. Las capas de composición dieron la pista que faltaba: la del documento medía
**513×4003** en la portada y 375×4258 en la carta, y se repintaba entera en cada resize.

- **Arreglado: `.wall` sacaba 138px de scroll lateral a la portada.** `grid-template-columns:
  repeat(2, 1fr)` con fotos dentro: un track `1fr` es `minmax(auto, 1fr)` y el mínimo automático
  de una imagen es su tamaño intrínseco —1000px—, así que el track no encogía. Con
  `minmax(0, 1fr)` la capa vuelve a 375 de ancho y el rasterizado cae a la mitad. **El
  desbordamiento era preexistente y lo tapaba el `overflow-x: hidden`;** al retirarlo quedó
  destapado, así que durante unas horas la portada tuvo scroll lateral de verdad.
- **Arreglado: la portada deja de dimensionar su alto desde el viewport.** Es lo que quedaba, y
  lo lleva a 0. Cuando cambia de alto empuja todo lo de debajo e **invalida la capa entera del
  documento**, así que se repinta la página completa mires donde mires —de ahí que se notara
  igual arriba que abajo—. El `calc(100svh …)` sigue en el CSS como respaldo y como valor del
  primer pintado; el script lo congela en píxeles y **solo vuelve a medir cuando cambia el
  ancho**. Verificado: mismo alto de siempre (654 = 844−62−128), quieto ante un cambio de solo
  alto, y recolocado al rotar.

**Estado final medido**, diez cambios de alto del viewport desde cuatro posiciones de scroll:
portada **0 tareas de rasterizado** (eran 116) y pintado de 3,3 ms (eran 11,5); carta 0; home
inglesa 0. Y **cero desbordamiento lateral en 24 combinaciones** (8 rutas × 3 anchos) recorriendo
cada página entera, que es como hay que medirlo.

### Cuarta vuelta: la barra ya no salta, pero se anuncia

Con los saltos resueltos, Mario describe otra cosa: al deslizar, un amago mínimo en sentido
contrario despliega la barra de direcciones **entera**, y en vercel.com no pasa. Se midió todo lo
que podía explicarlo y **no era ninguna de las sospechas**:

- **Listeners bloqueantes: ninguno.** Los de la casa son todos `passive`, y aceptar cookies no
  añade ni uno (GTM aún no tiene ID). Descartado.
- **Coste del gesto: somos más ligeros que la referencia.** Trazando un deslizamiento táctil real,
  la portada gasta 0,6 ms de hilo principal y su tarea más larga es de 21 ms; **vercel.com gasta
  7,9 ms y tiene una tarea de 123 ms**. Ninguna de las dos registra motivos de scroll en hilo
  principal. Descartado.
- **Micro-retrocesos de scroll: cero.** Un swipe estrictamente monótono no produce ni un
  retroceso en las tres webs, así que la página no está pidiendo la barra por su cuenta.
- **Y una corrección a lo que se dijo dos veces aquí:** *vercel.com **no** oculta su cabecera al
  bajar.* Es `sticky top: 0`, 64px, y no se mueve — muestreado a seis alturas de scroll. Es la
  misma solución que nuestra `.nav` de 62px. La idea de imitar un auto-ocultado que no existe
  queda retirada.

**Lo que sí difiere, comparando lo que cada web le declara al navegador:**

| | Ochoa | vercel.com |
|---|---|---|
| `theme-color` | **ninguno** | `#FAFAFA`, el color de su propio fondo |
| `viewport` | `…, viewport-fit=cover` | `…, maximum-scale=1` |

- **Arreglado: `theme-color`.** Ochoa declara ahora `#c6222b` y Cokima `#150f0c`, que son los
  colores sobre los que ya flota cada cabecera. En Chrome y Brave de Android eso tiñe la barra de
  direcciones, así que deja de aparecer un bloque ajeno sobre la plancha roja: **la barra del
  navegador y la de la web pasan a ser la misma superficie**, que es el mismo argumento por el
  que el panel del menú dejó de ser blanco. Vercel hace exactamente esto, y por eso su barra no
  se ve llegar. Ataca la **percepción**, que es la mitad del problema, y es un remate de marca
  que interesa por sí solo.
- **Sin tocar, decisión de Mario: `viewport-fit=cover`.** Es la única diferencia de comportamiento
  que queda con la referencia y es candidato plausible —cambia cómo el navegador compone su UI
  sobre la web—, pero **quitarlo tiene coste visible**: es lo que permite que la portada llegue a
  sangre bajo el notch del iPhone en horizontal, y lo que hace que `env(safe-area-inset-bottom)`
  del banner de cookies (`ConsentBanner.astro:160`) devuelva algo distinto de cero. Cambio de una
  línea, reversible, pero no se aplica a ciegas por una hipótesis.

### Quinta vuelta: el navegador no era el que se creía

Mario grabó un vídeo y **el marco estaba mal desde el principio: es un iPhone.** Toda la sesión
había razonado sobre Brave de Android, que usa Chromium. **Brave en iPhone está obligado por
Apple a usar WebKit**, el motor de Safari. Consecuencias:

- El mecanismo «Chromium redimensiona el viewport de verdad y Safari no» era correcto, pero **el
  navegador de Mario está en el lado de Safari**. Los arreglos anteriores siguen siendo válidos
  —los saltos eran reales y desaparecieron—, pero la explicación de por qué lo eran no aplica a
  este último síntoma.
- **El `theme-color` no hace nada aquí.** Tiñe la barra en Chrome de Android y en Safari; en el
  vídeo, la barra inferior de Brave sigue saliendo oscura. Se deja puesto porque sí sirve en los
  otros navegadores y no cuesta nada, pero no es la solución de esto.

**Lo que el vídeo sí demuestra, fotograma a fotograma:** en vercel.com la barra se queda
colapsada en su línea fina casi todo el rato; en Ochoa alterna sin parar entre colapsada y
desplegada entera. Y el patrón es que **se despliega justo cuando el contenido deja de moverse**,
o sea al final del gesto o cuando el scroll pierde inercia.

- **`viewport-fit=cover`: probado y revertido el mismo día.** Se quitó porque era la única
  diferencia declarada que quedaba con la referencia; volvió porque **lo llevaban las dos páginas
  y el problema solo está en la portada**, así que no podía ser la causa. Se queda: es lo que
  pone la franja de la barra de estado del iPhone en el rojo de la casa, lo que lleva la portada a
  sangre bajo el notch y lo que da valor al `env(safe-area-inset-bottom)` del cartel de cookies.
- **El `theme-color` tampoco era.** Se le presentó a Mario como un arreglo de «percepción» cuando
  él describía un problema de comportamiento; era mezclar dos cosas para tapar que no había
  explicación. Tiñe la barra, no cambia cuándo aparece, y en Brave de iPhone ni la tiñe. Se queda
  puesto porque sirve en Chrome de Android y en Safari, pero **no cuenta como parte de esto**.

### Sexta vuelta: acotado a la portada por pruebas de Mario

Dos pruebas suyas en el mismo iPhone y el mismo Brave: **en la carta no ocurre** (se comporta como
vercel.com) y **en un artículo de Wikipedia tampoco**. Luego la rara es nuestra portada, no la
referencia, y la causa vive en algo que solo tiene ella.

**Hipótesis principal, pendiente de confirmar en el teléfono: la tira de platos.**
`Highlights.astro:143` monta un `setInterval` que cada `--dur-turno` (3,5 s) ejecuta
`strip.scrollTo({ left: …, behavior: "smooth" })` — **un scroll animado que la portada se hace a
sí misma**, sobre un contenedor que además lleva `scroll-snap-type: x mandatory`. Para iOS eso es
actividad de scroll en curso, y al terminar el navegador reevalúa si enseña la barra. Encaja con
la descripción literal de Mario —«cuando termina la animación, la barra vuelve a subir»— y con las
tres páginas que no fallan: ninguna tiene una tira que se mueva sola. La tira solo se apaga con un
gesto **sobre ella misma** (`strip.addEventListener`), así que deslizando por el resto de la
página sigue con su turno.

**La prueba que lo decide:** hacer el gesto en la zona baja de la portada, con la tira fuera de
pantalla —el `IntersectionObserver` la pausa al 50%—. Si ahí la barra se queda abajo, es la tira.

**Advertencia de método para la próxima:** preguntar en qué **dispositivo y navegador** se está
viendo antes de construir el diagnóstico. «Brave» no dice el motor: en Android es Chromium y en
iPhone es WebKit, y el razonamiento entero cambia. Aquí costó cuatro vueltas descubrirlo.

**Callejones descartados por medición, para no repetirlos:** la tira de platos **no** roba
gestos (`scrollLeft` se queda a 0 con swipes a 15° y 30°, y el documento avanza igual dentro que
fuera de ella); la altura del documento **no** cambia al cargar las fotos (las reserva el
`aspect-ratio`, salto máximo 0 en las dos páginas); el `ResizeObserver` del nav **no** dispara al
cambiar el alto (0 escrituras de `--t-header-h`); y la forma de la animación de la cinta da igual
—porcentaje, `translate3d` o píxeles, todas cuestan lo mismo—: lo que cuesta es que corra.

Si aun así siguiera, el siguiente sospechoso es de diseño: nuestra `.nav` es `sticky` y compite
con la barra del navegador por el mismo borde superior. La referencia que él cita —vercel.com—
oculta su propia cabecera al bajar y la devuelve al subir, en vez de dejarla clavada.

## 3.nonies La entrada de Cokima (2026-08-14 al 16) — en `tmp/entrada-cokima`

> Se numeró `3.octies` mientras esta rama estuvo aislada, y ese número ya lo tenía la entrada de
> Los Ochoa en `preview`. Al juntarlas el 2026-08-16 pasó a `nonies`, que es la que le toca por
> fecha. Si algún documento de esta rama todavía la llama `octies`, es de antes.

**El porqué de todo esto está en `cokima-el-rediseno.md`.** Aquí solo queda lo que hay que saber
para no romperlo.

`Entrada.astro` sustituye al `Hero` heredado. Cuatro commits, todos en la rama:

| commit | qué |
|---|---|
| `5a19f0f` | la entrada a pantalla completa, con póster y dos botones píldora |
| `5e810c6` | se vacía: rótulo, hamburguesa, cookies y aviso pasan a aparecer al deslizar |
| `5349e85` | el nombre al medio; botones a 48px y el aire de abajo a 18 |
| `0cf1b7c` | el pulso de luz que avisa de que hay más abajo |

**Las piezas que se sostienen unas a otras**, y por eso se rompen juntas si se toca una:

- **`data-sobre-entrada`** en el `<html>`. Lo pone y lo quita un `IntersectionObserver` sobre un
  centinela de un píxel al final de la sección. De él cuelgan **cinco** comportamientos: la
  cabecera transparente, la desaparición de sus tres piezas, el cartel de cookies, el aviso del
  vídeo y la pausa de las dos animaciones. Vive en `Entrada.astro` porque **es la entrada la que
  pide que la cabecera se aparte**, no la cabecera la que sabe de portadas. Y se limpia al
  navegar, o la carta heredaría una cabecera transparente sobre nada.
- **`margin-top: calc(-1 * var(--t-header-h))`** en la sección. La cabecera es `sticky` y reserva
  sus 61px en el flujo aunque parezca flotar; sin ese margen la entrada terminaba en y=904 con una
  ventana de 844 y el centinela no llegaba a entrar en pantalla nunca.
- **`--alto-entrada`**, el mismo congelado de alto que ya llevaba el `Hero`. Ver la regla 16 de
  `movimiento.md`: nada que ocupe media pantalla dimensiona su alto desde el viewport.
- **El `<h1>` es el propio rótulo del centro.** Hubo una versión con el `h1` oculto y ya no hace
  falta: si alguien quita el nombre de la pantalla, tiene que devolver el encabezado por otro
  lado o la página se queda sin él.

**Contrastes medidos sobre el póster** (peor píxel de cada franja, con el velo compuesto): nombre
11,7:1 · «Kitchen Madness» 5,95:1 · riel del pulso 2,49:1. El velo tiene los topes que tiene
porque se calcularon sobre la **posición medida** del texto, no a ojo; el claim que había antes
daba 2,13:1 con la curva anterior.

**Y el aviso que más importa:** en cuanto entre el vídeo, el fondo cambiará en cada fotograma y
ninguna de esas medidas seguirá valiendo. Por eso el rótulo lleva una sombra ancha y difusa, que
es lo único que aguanta un fondo que se mueve. **Cuando el vídeo esté, hay que volver a medir.**

---

## 3.octies La entrada de Los Ochoa (2026-08-06) — ya en `preview`

Mario la pidió «sencilla pero llamativa», con una restricción que mandaba sobre todo lo demás:
«no queremos generar fricción a todo el que entre haciéndole esperar una animación». Se eligió
sobre un boceto con tres variantes reproducibles, y **la elección es provisional**: el diseño
separa el andamiaje del gesto para que cambiarla cueste dos `@keyframes`. Todo el detalle, con
las dos descartadas y sus motivos, en `superpowers/specs/2026-08-06-entrada-ochoa-design.md`.

**Qué hace.** Sobre una plancha roja, «LOS» y «OCHOA» llegan torcidas de lados opuestos y encajan;
se les despega la sombra dura; y después la plancha se recoge hasta medir exactamente la barra,
con el rótulo aterrizando dentro y los botones entrando desde el borde derecho. **1,4 s**,
repartidos mitad y mitad: 700 ms para que el rótulo se monte y se lea, 700 ms para que se vaya a su
sitio. No estrena vocabulario: es el telón del menú y la plancha de la barra haciendo un gesto
nuevo, y la costura no se ve porque al terminar la recogida debajo hay el mismo rojo.

**Dos correcciones de Mario al verla en el móvil**, y las dos valen más que su arreglo:

- **El rótulo decía «Los Ochoa» y el de la barra «LOS OCHOA».** El componente reimplementaba a
  mano la fórmula de `.cartel` —familia e interlineado— en vez de usar la clase, así que se dejó
  por el camino el `text-transform` y el `letter-spacing`. **Ninguna de las mediciones podía
  cazarlo**: el aterrizaje daba desvío 0 porque era exacto… sobre otra palabra. Con la clase
  puesta, el residuo de alto además cae de 0,43 px a 0,01. Regla 20 de `movimiento.md`, reescrita.
- **«La animación se nota muy poco», y la alargó a 1,4 s.** El diagnóstico que salió de ahí es lo
  aprovechable: el problema no era la velocidad del movimiento sino que no daba tiempo a leer el
  nombre antes de que empezara a marcharse. De ahí el reparto mitad y mitad en vez de estirar las
  tres fases por igual. Nace `--dur-recogida`, porque `--dur-in` mide un panel que aparece y esto
  recorre la pantalla entera. Y el seguro sube de 3 s a 4,5 s: con la entrada en 1,4 s se habría
  quedado sin margen sobre el peor caso legítimo y podría haber cortado una entrada que iba bien.
- **El rótulo «aparecía de repente y ya», y luego la solución era demasiado seria.** Primero se
  hizo caer dentro de una máscara; funcionaba y estaba medido, pero Mario pidió «algo más
  juguetón, que grite tapa y caña jefe». Sobre un boceto con cuatro gestos eligió el **encaje de
  dos mitades**: «LOS» y «OCHOA» llegan torcidas de lados opuestos y se enderezan al juntarse. Es
  el rótulo de bar montado a mano, que nunca queda a plomo. Nace `--tuerce` (4deg), que es a la
  rotación lo que `--shift` es al desplazamiento. **La cortina retirada deja una lección que
  quedó escrita en la regla 14: correcta no es lo mismo que adecuada.**
- **Los botones de la barra se descubrían de golpe**, que es lo que prohíbe la regla 10 —lo vio
  Mario sin conocerla—. Ahora entran desde el borde derecho **durante** la recogida y por encima
  de la plancha, así que todo converge en el mismo instante en vez de dejar un hueco muerto.
  Costó cuatro fallos que no dan ningún error y son las reglas 21 a 24, nuevas: un `z-index` alto
  no vale dentro de un contexto de apilamiento ajeno —la barra es `sticky` y encierra a sus
  hijos—; en Astro un `:global()` troceado deja el combinador fuera y la regla no aplica a nada;
  **una transición heredada convierte en movimiento lo que querías instantáneo y falsea las
  medidas que tomes en ese momento** —los botones llevan `transition: transform` para el tacto, y
  eso hacía que se les viera *salir* al apartarlos (el «se asoma ligeramente» que cazó Mario) y
  que una medición diera −1284px, que los habría hecho entrar por el lado contrario—; y un valor
  de reserva tiene que ser seguro y no aproximado, que es lo que no era el `160%` inicial.

**Cuándo sale.** Cuatro puertas **en un orden que es parte del contrato**: `prefers-reduced-motion`
la apaga siempre; `back_forward` nunca la enseña; `reload` **sí**, y por delante de la marca de
sesión; y si no, sale salvo que la pestaña ya la haya visto. Traducido: siempre que se entra desde
fuera —en cualquier página, también `/carta`— y también al recargar a propósito, con F5 o con el
tirón hacia abajo del móvil. **Mario pidió lo de recargar primero al revés y lo cambió al verlo**;
el orden importa porque recargar implica haber estado ya, así que con las puertas al revés la
marca de sesión lo taparía siempre. Hay un test que fija ese orden.
**La decisión se toma antes del primer pintado**, en un script inline del `<head>`; tomarla
después enseñaría la web y luego la taparía.

**La función de decisión no está escrita dos veces.** El script inline se construye con
`decideEntrada.toString()`, así que lo que corre en el navegador es exactamente lo que cubren los
tests. Hay un test que vigila que la función siga sin referenciar nada de su módulo, que es lo que
rompería el truco en silencio.

**Sin JavaScript no hay entrada** y la web se ve entera desde el primer frame. Y hay un seguro de
3 s en el propio script inline: es síncrono y el que retira la plancha no lo es.

**El rótulo de la barra vuelve a la home con la entrada puesta**, salvo si ya estás en la home
—decisión de Mario—. A prueba, detrás de `INTRO_EN_RETORNO` en `packages/ui/src/intro.ts`.

**Verificado midiendo, no de vista:** aterriza con desvío 0 en x, en y y en ancho; no sale al
recargar ni con el botón de atrás *con la sesión limpia* (para probar la puerta y no el
`sessionStorage`); sí sale al llegar desde fuera a `/carta`; y los cuatro estados de la entrada
dejan la página en el mismo píxel. Tests: 45 → 57. `@tombo/ui` no tenía ninguno y ahora tiene
vitest.

**Pendiente y sin medir: el efecto sobre el LCP, y ahora importa más.** Un velo opaco sobre la
portada puede empujar esa métrica, y al pasar de 740 ms a 1,4 s la entrada entra de lleno en el
terreno donde se resiente: el umbral de «bueno» de Google son 2,5 s, así que 1,4 s de velo deja
poco margen para el resto de la carga en una red móvil. Mario la alargó con el dato delante, pero
**esto hay que medirlo**, y si sale mal la palanca es ese número.

Tres reglas nuevas en `movimiento.md` (18, 19 y 20) y la primera excepción a la regla 5, que
merece leerse: el apagado por `prefers-reduced-motion` no vale para una pieza que **solo existe
para moverse**, porque atenuarla deja un destello rojo de un fotograma.

## 3.septies El recuadro de foco y «Conócenos» (2026-08-04)

Mario describió un recuadro que salía «a ratos» al pulsar con el dedo o con el ratón, y que él
solo quería ver al tabular. Eran **dos causas distintas**, y se separaron midiendo.

**En escritorio no se reproducía.** Con la home instrumentada y clics de ratón reales sobre el
botón del menú, el logo, «Reservar», los tres enlaces del panel, «Ver la carta» y la tira de
platos, todo daba `:focus-visible = false` y `outline: none`; con Tab, `true` y anillo. Las 14
reglas de foco del repo ya usaban `:focus-visible`, así que **ahí no había nada que arreglar** —y
tocarlo habría roto el teclado—. Dos avisos de método que costaron vueltas: `requestAnimationFrame`
no corre con la pestaña en segundo plano y deja el instrumental mudo sin dar error, y cuando la
ventana pierde el foco del sistema los clics siguen llegando al DOM pero el teclado ya no, así que
`focusin` deja de dispararse y todo parece limpio.

- **Móvil: faltaba `-webkit-tap-highlight-color`** en todo el repo, así que iOS y Android pintaban
  su propio recuadro encima, compitiendo con el hundido de `[data-tacto]` justo mientras ocurre.
  Apagado en la raíz de las dos webs, donde se hereda sin listar un selector.
- **Escritorio: la herencia del foco programático.** `menu-overlay.ts` mueve el foco en las dos
  direcciones —al panel al abrir, al botón al cerrar— y el navegador, que no sabe de dónde venía
  el usuario, **hereda el anillo del elemento anterior**. Basta que entre una vez para quedarse
  rebotando entre los dos aunque después solo se use el ratón: eso era el «a ratos». Ahora cada
  llamada declara lo que quiere con `focus({ focusVisible })`, y quién decide es `e.detail === 0`,
  que distingue el Enter del clic sin espiar la página. Confirmado por Mario en su Brave.

**«Conócenos» (`/conocenos` y `/en/about`)** nace montada y vacía a propósito. Cuarta entrada del
menú —detrás de «Dónde estamos», para no empujar hacia abajo lo que convierte—, enlazada también
desde «La tasca» en las dos homes, que es lo que le da peso interno. El cuerpo son cuatro rejillas
de texto (`CopyGuide.astro`, hermano de `PhotoGuide`) que dicen qué hay que contar en cada bloque,
más el hueco de foto del equipo. Los dos idiomas salen de un solo componente,
`components/Conocenos.astro`, para que no se separen como se separó la home inglesa.

**Lo que impide que perjudique al SEO estando en obras:** `EN_OBRAS` en `src/conocenos.ts` la deja
con `noindex, follow`, fuera del sitemap (filtro en `astro.config.mjs`) y sin su JSON-LD
`AboutPage`. Un solo interruptor gobierna las tres cosas, y ponerlo en `false` cuando haya texto es
todo lo que hay que hacer. De paso, `Seo.astro` gana la prop `noindex` y el `Base.astro` de Ochoa
un `<slot name="head" />` para el JSON-LD propio de una página.

El titular no repite «La tasca que te mereces»: ese es el lema del cristal y el de la portada, y
dos páginas peleando por la misma frase se restan. Dice «La casa por dentro» / «Behind the bar».

## 3.quater La tanda del 2026-07-31: Sibuya como referencia y los retoques de Mario

Salió de analizar **sibuyaurbansushibar.com** en móvil, que es una web que le gusta a Mario, y
de quedarse con lo que se puede contar en el idioma de esta casa. El análisis completo —lo que
compartimos, en qué nos diferenciamos y qué no copiarles— se midió con Playwright a 390px: su
home pesa **20,5 MB** (el mismo vídeo descargado tres veces) contra los 767 KB del build de
Ochoa, y su `/carta` tarda 8,9 s en el primer byte. La ambición visual sí; el peso no.

**Lo que entró de ahí:**

- **El cartel de la portada volvió a escalar.** `clamp(2.6rem, 10vw, 6rem)` se quedaba clavado
  en su mínimo en todo móvil por debajo de 416px de ancho —a 390px, 10vw daba 39px y ganaba el
  suelo—. Con `11.5vw` vuelve a crecer con la pantalla desde los 362px.
- **La cinta rotulada** (`Ticker.astro`), banda roja a sangre entre la tira de platos y el
  manifiesto, con contenido que ya vive en la página. Va ahí y no bajo la portada porque ese
  hueco está medido para que asome la primera ficha de plato.
- **El medio dentro del titular**, el mejor recurso de su home, aplicado a «la casa» y no a la
  portada: el rótulo del cristal sale del muro y se lee entre «lo que hay» y «detrás del
  cristal». En la portada habría significado partirla en dos, que ya se probó y se retiró
  (§3.ter). El muro se queda con tres piezas y cierra en plano.
- **Aire solo donde hay fotografía** (`la tasca` y `la casa`, de 28/32px a 52px en móvil). La
  densidad del resto se mantiene: la hoja de bar es densa a propósito.

**Los retoques que pidió Mario después, viéndolo en el iPhone:**

- **Fuera las tres rayas del menú.** El botón dice la palabra —`MENÚ` / `CERRAR`— en la versal
  apretada de Archivo, con un subrayado que se recoge al abrir. El texto ya estaba en el markup
  para lectores de pantalla; ahora se ve. De paso deja de estar descentrado: tenía 31px a la
  derecha del glifo contra 22 arriba, y ahora son 20 y 21.
- **El menú cae como una persiana** de arriba abajo con `clip-path`, y se recoge al cerrar. El
  fundido anterior no decía de dónde venía. Con `clip-path` y no con un desplazamiento: así los
  nombres de sección no viajan y el escalonado de los enlaces se lee como lo que aparece detrás
  del telón.
- **Curvatura proporcional al tamaño.** Ya no hay un radio suelto por componente sino cuatro
  escalones (`--r-chapa` 4px, `--r-btn` 7px, `--r-caja` 9px, `--r-marco` 12px). Mario lo detectó
  comparando «Reservar» con «Llamar»: **tenían los dos 3px**, pero el segundo mide 55px de alto
  y se veía más picudo. La esquina se percibe en proporción a lo que enmarca. La proporción
  radio/alto ronda 0,16 en las piezas táctiles.
- **La tira de platos arrancaba pegada al borde** pese a su relleno de 20px: el `scroll-snap`
  alinea contra el borde del área de scroll, que ignora el `padding`, y el navegador desplazaba
  esos mismos píxeles. Se arregla con `scroll-padding-inline`. Y su sombra roja se cortaba por
  abajo porque `overflow-x: auto` obliga al eje vertical a recortar también — por eso la esquina
  inferior derecha parecía sin redondear: no lo estaba, estaba cortada.
- **Indicador de turno en la tira**: seis marcas, la del turno en curso es una barra que se
  rellena. Avanza solo cada 3,5 s y **se apaga para siempre al primer toque** — en una tira con
  precios, moverse debajo de quien está leyendo es quitarle el sitio, así que el gesto de
  deslizar es la pausa y no hay botón que la reponga.
- **Barrido entre páginas.** `<ClientRouter />` ya estaba puesto pero hacía el fundido por
  defecto. Ahora la hoja nueva entra por el borde y **es bidireccional**: con el botón de atrás
  barre al revés. La marca de dirección hay que escribirla también en el documento entrante,
  porque el intercambio copia los atributos del `<html>` nuevo encima y la borraba.
- **«Dónde estamos» se reordena:** el mapa abre la sección en vez de cerrarla, y teléfono e
  Instagram pasan a ser dos fichas con icono **y** texto (el icono solo obliga a adivinar, y el
  número escrito es lo que alguien copia). El mismo componente va en el pie del menú.

**El hundido de los botones, que costó tres intentos.** El primero solo tenía `:hover`, que en
móvil no existe. El segundo añadió `:active` con un retardo antes de la vuelta, y **seguía sin
verse en el iPhone**. Midiendo salieron las dos causas de verdad: entre soltar un enlace y tener
la página nueva pasan **232 ms**, y los ocho botones de esta web son enlaces, así que una subida
que arrancaba a los 220 ms se la llevaba la navegación por delante; y **en Safari de iOS
`:active` no se aplica de forma fiable** sin un listener táctil en la página. La solución no
depende de ninguna de las dos: `pointerdown` hunde y `pointerup` dispara la subida en el mismo
instante en que se levanta el dedo (`--dur-sube`, 240 ms). `pointercancel` también la suelta, o
arrastrar el dedo fuera del botón para no pulsarlo lo dejaría hundido para siempre.

**Lección de método, que es la que importa:** las dos primeras versiones se dieron por buenas
comprobando que la regla CSS existía en el CSSOM. Comprobar que una regla está escrita no es
comprobar que el efecto ocurre. Lo que lo resolvió fue simular el toque con
`page.mouse.down()`/`up()` y muestrear la posición real a lo largo del tiempo.

**La carta, rehecha con el material del restaurante.** Alberto pasó dos PDF por WhatsApp y pidió
tres secciones: pinchos y tapas, con pan, y raciones. **De 25 platos a 49.** Los postres van en
una cuarta porque están en la carta de sala y no caben en ninguna de las tres; las bebidas no se
publican, como pidió. Tres decisiones que quedaron tomadas:

- **Ya no hay medias raciones.** La carta nueva trae precio único, así que la tabla se queda en
  una columna. El soporte sigue en el esquema por si vuelven.
- **Montados, bocatines y bikinis llevan su tipo en el nombre.** En el PDF eso lo dice el rótulo
  de cada bloque, pero al fundirlos bajo «con pan» aparecían dos «De jamón con tomate rallado»
  con precios distintos —4,50 y 8,00—, que es una carta que miente.
- **El PDF de sala es imagen pura, sin capa de texto.** No se puede extraer con pdfjs; hubo que
  renderizarlo a 4× y leerlo a ojo. Si vuelve a hacer falta, el visor está en el scratchpad de
  la sesión, no en el repo.

## 3.bis Fase 4 — acordada el 2026-07-29, en curso

Orden acordado. Los cinco primeros no dependen de nadie; el sexto necesita contenido real.

1. ~~**Tipografía propia para Ochoa.**~~ **Hecho el 2026-07-29.** El cuerpo ya no cae en la
   fuente del sistema: **Archivo** (Omnibus-Type), variable en peso (100-900) **y en ancho
   (62-125)**, autoalojada en un solo `.woff2` de 90 KB — menos que los tres estáticos de
   Bricolage en Cokima, que suman 124 KB para tres pesos. Anton se queda solo en los
   titulares de cartel. El eje de ancho es lo que hace de bisagra entre las dos: las
   etiquetas en versal van al 84%, en la proporción del rótulo, y la carta podrá apretar al
   92% cuando pase a dos columnas. Escala de siete pasos con nombres por papel
   (`--fs-micro` … `--fs-cartel`) en `apps/ochoa/src/styles/tokens.css`. Fuera el
   `tabular-nums` del precio. Verificado a 390px: ni un elemento del DOM conserva fuente de
   sistema, 43 tests verdes y las dos apps `Complete!`.
2. ~~**Menú a pantalla completa.**~~ **Hecho el 2026-07-30, en las dos webs.** Botón sin
   borde y tres rayas que se pliegan en aspa sobre su propio centro. El panel cubre la
   pantalla por debajo de la barra —que se queda quieta, así que el botón que abre es el
   mismo que cierra y en el mismo sitio—, con "La carta" abriendo la cascada, numerada en
   Ochoa y con el punto de brasa en Cokima, y un pie con horario, teléfono, Instagram y
   dirección. El comportamiento vive una sola vez en `packages/ui/src/menu-overlay.ts`
   (estado, foco atrapado, Escape, bloqueo del fondo) y la piel entera en cada app, como
   manda la regla de oro. **Dos trampas que solo se vieron midiendo en el navegador:** una
   cabecera `sticky` se descuelga fuera de la pantalla en cuanto el fondo deja de tener
   scroll —pasa a `fixed` mientras el menú vive—, y ocultar el desbordamiento ensancha la
   página de golpe, que se resuelve reservando el hueco de la barra con
   `scrollbar-gutter: stable`.
3. ~~**Carta de Ochoa a dos columnas.**~~ **Hecho el 2026-07-30.** Los dos precios a la vez
   en columnas alineadas, y fuera el interruptor pegajoso: era una barra de 71px que
   viajaba con el dedo por toda la carta. **Fuera también el buscador**, que Mario retiró el
   mismo día — nadie va a buscar en una carta de veinticinco platos que se lee de un vistazo.
   Con él se fueron `matchDish` y `normalize` (`packages/content/src/search.ts`) y sus nueve
   tests, y la carta se quedó **sin una línea de JavaScript**. La
   nomenclatura la confirmó Mario con el restaurante: **«Ración» y «½ Ración», no «Tapa»**.
   Es una `<table>` de verdad, con `scope="col"`/`scope="row"`, porque un precio sin su
   cabecera no dice si es media o entera — y así un lector de pantalla lo anuncia solo.
   Once de los veinticinco platos no tienen media: llevan el mismo guion que la carta
   impresa, con el aviso en texto para quien no lo ve. Los postres, que van a precio único,
   enseñan una sola columna en vez de una vacía. Fuera también la guía de puntos: existía
   para llevar el ojo hasta un precio suelto, y con dos columnas alineadas la columna ya es
   la guía. **En escritorio la carta se acota a 44rem** — a 1280px el nombre quedaba a
   700px de su precio; el margen que sobra a la derecha es donde entrarán las fotos.
4. ~~**Rejillas guía en los huecos de foto.**~~ **Hecho el 2026-07-30.** **Diecinueve
   huecos** entre las dos webs: once de plato (las fichas de destacados que salen sin
   imagen) y ocho de la casa, en una sección nueva que enseña lo que ninguna de las dos
   webs tiene hoy: la barra, la sala, el equipo. **Su texto ya es el definitivo** —«Lo que
   hay detrás del cristal» en Ochoa, «Donde se mezcla y se mancha» en Cokima—, no el de
   andamio que hubo primero: que faltan las fotos ya lo dice cada rejilla en su etiqueta, y
   escribirlo otra vez en el titular era contarlo dos veces. Van en **cuadrícula de dos por
   dos, las cuatro iguales**; el mosaico asimétrico del primer intento llamaba la atención
   sobre la composición en vez de sobre las fotos. Cada hueco dibuja su proporción, la
   regla de tercios y **el nombre
   exacto del archivo** que hay que dejar para que desaparezca, derivado del nombre del
   plato con `dishImageKey()`. El componente es `packages/ui/src/PhotoGuide.astro`, sin
   una gota de marca, y se mide con container queries porque cae igual en una ficha de
   250px que en una banda de 700px.

   **No pueden llegar a producción, y eso no depende de acordarse:** lo decide
   `showPhotoGuides()` (`packages/config/src/photo-guides.mjs`), que las apaga si hay
   `SITE_URL` o si Vercel dice que es producción —un despliegue público siempre tiene una
   de las dos— y tiene seis tests que lo fijan. Comprobado además sobre el HTML construido:
   con `SITE_URL`, cero huecos en las dos apps; sin él, los diez de la home de Ochoa.
5. ~~**Sistema de movimiento.**~~ **Hecho el 2026-07-30.** Cinco valores por marca
   (`--ease`, `--dur-in`, `--dur-out`, `--shift`, `--stagger`) y **ni un milisegundo suelto
   en los componentes**: los cuatro que quedaban a mano —los dos `.btn` y las dos portadas—
   ya salen de los tokens. La curva es la misma en las dos marcas porque es calidad, no
   identidad; el ritmo diverge a propósito, Cokima más lenta y más lejos, Ochoa seca.
   De paso, **las portadas dejaron de animar `padding-bottom`**: el titular se aparta del
   cartel de cookies con `translateY`, mismo resultado en pantalla sin recalcular la
   disposición en cada fotograma. Y el apagado por `prefers-reduced-motion` vive ahora en un
   único sitio, no repetido por componente. Todo escrito en **`movimiento.md`**: los cinco
   valores, las cinco reglas y la lista de lo que se mueve, que es corta a propósito.
6. **Páginas nuevas.** No relleno: dar contexto a lo que ya hay y contar la historia real
   de cada casa, con copys trabajados. Las páginas concretas se deciden más adelante.

**Pendiente de foco:** casi todo el trabajo hasta ahora ha mirado a Ochoa. Cokima está sin
desmenuzar a fondo.

---

## 4. Decisiones abiertas (de Mario)

- [ ] **Filtro de alérgenos de Cokima.** Construido y apagado
      (`ALLERGEN_DATA_CONFIRMED = false` en `apps/cokima/src/site.ts`). No se enciende
      hasta que el restaurante firme los datos: un filtro "sin gluten" en el que una
      persona celíaca confía con datos orientativos es un problema de salud, no de UX.
- [ ] **Texto del cartel de cookies.** Es lo que más altura le da. No se ha tocado porque
      es contenido de consentimiento y acortarlo tiene matiz legal.
- [ ] **El rojo del titular de Cokima.** Con `#ed1c24` no hay forma de pasar de 4,26:1
      sobre la portada. Se queda así (cumple para texto grande) o el fragmento pasa al
      naranja `--ember`, que da 7,9:1 pero cambia el acento de marca en la primera
      pantalla.
- [ ] **Cuándo llevar `preview` a `main`** (`git switch main && git merge preview`).

**Cerradas el 2026-07-29:** el verde oliva del estado de apertura (retirado con la piel
nueva de Ochoa), las dos ramas muertas —que ya no existen— y **el push de `preview`**, que
Mario autorizó: la fase 3 está subida y los alias de preview ya no van retrasados.

**Cerrada el 2026-07-30:** **«Ración» y «½ Ración»**. Mario lo confirmó con el restaurante:
sirven media ración, no tapa. Es la nomenclatura que va en la carta.

---

## 5. Infraestructura pendiente

- [ ] Variables de entorno y dominios por proyecto en Vercel. `SITE_URL` bloquea los
      despliegues de producción a propósito mientras no haya dominio.
- [ ] *Ignored Build Step* en ambos proyectos: hoy cada push reconstruye las dos webs.
      Comando en `deploy.md`.
- [ ] Redirects 301 desde `grupotombo.com/cokima-kitchenmadness/` y
      `/tasquita-los-ochoa/` hacia los dominios nuevos.
- [ ] Alta de cada dominio en Google Search Console y enlace con su ficha de Google Business.

---

## 6. Cómo levantarlo y dónde mirarlo

```bash
pnpm install
pnpm --filter cokima dev    # http://localhost:4321
pnpm --filter ochoa dev     # segundo puerto libre
pnpm test                   # 45 tests
SITE_URL=https://example.com pnpm build
```

**Casi todo el trabajo es mobile-first y está pensado para pantalla estrecha.** En una
ventana ancha la impresión es que cambió menos de lo que cambió: hay que estrechar a
~375-390px o usar el modo dispositivo.

**Las imágenes solo se optimizan en Vercel, no en local.** Desde el 2026-07-29 las sirve
el servicio de imágenes del adaptador (`/_vercel/image?...`), que en `dev` y en `preview`
local devuelve el original. El peso real solo se puede medir en un despliegue.

**Previews (alias fijos, no cambian con cada push):**
- Cokima → `https://cokima-git-preview-rodzs-projects-1c289ef0.vercel.app`
- Ochoa → `https://ochoa-git-preview-rodzs-projects-1c289ef0.vercel.app`

**Aviso de dev:** si en local ves algo que no cuadra con el código (una regla CSS que ya
no existe, un elemento oculto sin motivo), suele ser caché obsoleta de Vite. Se arregla
con `rm -rf node_modules/.vite apps/*/node_modules/.vite` y rearrancando. Pasó el
2026-07-28 y estuvo a punto de dar por bueno un fallo inexistente.

---

## 7. Bloqueado por el cliente

Sin cambios respecto a la spec §12, más una entrada nueva:

- **Nueva:** confirmación oficial de los datos de alérgenos de Cokima (requisito para
  activar el filtro).
- Accesos: **CoverManager backoffice** (el más urgente), Meta Business (píxel por marca +
  token CAPI), GTM/GA4.
- Dominios propios por marca.
- Logos en vectorial (los favicons actuales son provisionales y geométricos, no logotipos).
- Fotografía real actualizada.
- Datos fiscales para las páginas legales.

---

## Documentos

| Documento | Qué es |
|---|---|
| `cokima-el-rediseno.md` | **Léelo primero.** Por qué Cokima se rehace, qué se descartó y por qué cada decisión de la entrada es la que es |
| `../.impeccable.md` | Contexto de diseño: para quién es cada web y cómo debe sentirse |
| `movimiento.md` | Los cinco valores del movimiento, las reglas y qué se mueve |
| `barra-del-navegador-ios.md` | **Caso abierto.** La barra de Brave en iPhone: lo arreglado, lo descartado y por dónde seguir |
| `fotografia.md` | Qué fotos faltan, con qué nombre y dónde dejarlas |
| `deploy.md` | Vercel: dos proyectos, modelo de ramas, env vars, dominios |
| `estado-divergencia-layout.md` | Registro de la fase 2, tarea por tarea |
| `superpowers/specs/2026-07-18-webs-grupo-tombo-design.md` | Diseño general |
| `superpowers/specs/2026-07-27-divergencia-layout-design.md` | Diseño de la fase 2 |
| `superpowers/plans/2026-07-27-divergencia-layout.md` | Plan de la fase 2 (ejecutado) |
| `superpowers/specs/2026-07-29-portadas-y-chrome-design.md` | Diseño de la fase 3 |
| `superpowers/plans/2026-07-29-portadas-y-chrome.md` | Plan de la fase 3 (ejecutado) |
