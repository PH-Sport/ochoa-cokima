# La barra del navegador en iPhone — caso abierto

**Estado: sin resolver al 100%.** Ochoa ya no da saltos y está sensiblemente mejor, pero sigue sin
comportarse como el resto de webs. Cokima está peor porque **no ha recibido los arreglos** (ver
§5). Y **la carta, que llegó a comportarse bien, ha vuelto a estropearse** al devolver
`viewport-fit=cover` — que es justo lo que lo señala como sospechoso principal (§4.bis).

Este documento existe para que la próxima sesión no repita nada de lo ya descartado. **Empezar por
§4.bis y §7.**

Abierto el 2026-08-01 a partir de un reporte de Mario y un vídeo suyo.

---

## 1. El síntoma, en sus palabras

> «Cuando termina el deslizamiento hacia abajo, sale la barra de direcciones igualmente. No se
> mantiene abajo como ocurría en Vercel o Wikipedia.»

Y antes: «es como si estuviese esperando al minimísimo instante a que mi dedo se deslizase en el
sentido contrario para mostrarme la barra de direcciones entera».

## 2. El entorno — leer esto ANTES de razonar nada

**Es un iPhone, y el navegador es Brave.** Brave en iOS está obligado por Apple a usar **WebKit**,
el motor de Safari. No es Chromium.

Durante cuatro vueltas se razonó sobre mecanismos de Chromium de Android —el viewport que se
redimensiona al colapsar la barra, `theme-color` tiñendo la barra— porque nadie preguntó el
dispositivo. **Preguntar siempre: «¿iPhone o Android?».** El nombre del navegador no dice el motor.

El vídeo está analizado extrayendo fotogramas; la receta está en §6.

## 3. Lo que SÍ se arregló, y funcionó

Todo esto era real, medible, y Mario confirmó la mejora. **No tocar sin motivo.**

| Arreglo | Medida antes → después |
|---|---|
| `body { overflow-x: hidden }` fuera (era un vestigio, no tapaba nada) | — |
| `scroll-behavior: smooth` fuera (no había ni un `href="#"` que animar) | — |
| La cinta rotulada se pausa cuando no se la ve (regla 6) | 20 → 10 recálculos de estilo |
| `.wall` con `minmax(0, 1fr)` | 138px de scroll lateral → 0 |
| La portada congela su alto y solo re-mide al cambiar el ancho | 116 → **0** tareas de rasterizado; pintado 11,5 → 3,3 ms |

El detalle de cada uno, en `estado.md` §3.sexies y en `movimiento.md` reglas 15-17.

## 4. Lo que se probó y NO era — no repetir

- **Listeners bloqueantes.** Cero. Todos los táctiles de la casa son `passive`, y aceptar cookies
  no añade ninguno (GTM aún no tiene ID). Medido con `DOMDebugger.getEventListeners`.
- **Coste del gesto.** Somos **más ligeros que la referencia**: trazando un deslizamiento táctil,
  la portada gasta 0,6 ms de hilo principal y su tarea más larga es de 21 ms; vercel.com gasta
  7,9 ms y tiene una tarea de 123 ms. Ninguna registra motivos de scroll en hilo principal.
- **Micro-retrocesos de scroll.** Cero en un swipe monótono, en las tres webs. La página no está
  pidiendo la barra por su cuenta.
- **La tira de platos robando gestos.** No los roba: con swipes a 15° y 30° sobre ella,
  `scrollLeft` se queda en 0 y el documento avanza igual que fuera de ella. (Medido en Chromium
  de escritorio; **en WebKit no se ha podido comprobar**.)
- **Las imágenes.** Ocultarlas todas no baja el rasterizado. De hecho las mediciones se hicieron
  con cinco de las seis sin cargar, porque `/_vercel/image` no existe fuera de Vercel.
- **La altura del documento cambiando al cargar fotos.** Cero: el `aspect-ratio` reserva el hueco.
- **`theme-color`.** Se presentó como arreglo de «percepción» cuando el problema era de
  comportamiento: **fue un error de razonamiento**, mezclar dos cosas para tapar que no había
  explicación. Tiñe la barra, no cambia cuándo aparece, y en Brave de iPhone ni la tiñe. Se queda
  puesto porque sirve en Chrome de Android y en Safari, pero no es parte de esto.
- ~~**`viewport-fit=cover`**~~ → **NO está descartado. Es el sospechoso principal, ver §4.bis.**
- **Que vercel.com oculte su cabecera al bajar.** **Falso**, se dijo dos veces aquí antes de
  comprobarlo: su header es `sticky top: 0` de 64px y no se mueve, muestreado a seis alturas.
  Es la misma solución que nuestra `.nav` de 62px.

## 4.bis El sospechoso principal: `viewport-fit=cover`

**Por aquí hay que empezar la próxima sesión.**

Se dio por descartado y **estaba mal descartado**. Esta es la cronología, que es lo que lo delata:

| Commit | `viewport-fit=cover` | Lo que observó Mario |
|---|---|---|
| `8974d34` | **quitado** | portada «mejor, pero no al 100%»; **carta bien**; Wikipedia bien |
| `d53439e` | **devuelto** | **la carta pasa a comportarse mal** |

Es decir: **la única página que estaba «bien» lo estaba con la directiva quitada, y volvió a
estropearse en cuanto se devolvió.** Y la portada, con la directiva quitada, también mejoró.

**El error de razonamiento, para no repetirlo:** se argumentó que «lo llevaban las dos páginas y
el problema solo estaba en la portada, luego no puede ser la causa». Suena sólido, pero comparaba
**dos observaciones tomadas en estados distintos del código** — la de la carta era posterior a
quitarlo—. Al mezclarlas en una misma tabla mental, el descarte parecía limpio. **Regla: cada
observación se anota con el commit en el que se tomó, y solo se comparan observaciones del mismo
estado.**

**Qué hacer:** volver a quitarlo, confirmar con Mario que la carta se arregla otra vez, y solo
entonces atacar lo que le quede a la portada, que es un problema **aparte y añadido**. El coste de
quitarlo es conocido y hay que decidirlo con Mario: la franja de la barra de estado del iPhone
deja de ir en el rojo de la casa, la portada ya no llega a sangre bajo el notch en horizontal, y
el `env(safe-area-inset-bottom)` del cartel de cookies pasa a valer cero (deja de hacer falta:
sin `cover` el viewport ya excluye esa zona). **Si el arreglo se confirma, merece la pena buscar
una forma de recuperar el rojo de arriba sin la directiva** — por ejemplo con `theme-color`, que
en Safari sí tiñe, aunque en Brave de iPhone no.

## 5. Lo que sabemos que acota el problema

**Pruebas de Mario, mismo iPhone y mismo Brave:**

**Cada fila con el estado del código en que se tomó, que es donde estuvo el error:**

| Página | Comportamiento | ¿`viewport-fit`? |
|---|---|---|
| Artículo de Wikipedia | **Bien** | (ajena) |
| vercel.com | **Bien** | no lo usa |
| Carta de Ochoa | **Bien** | **quitado** (`8974d34`) |
| Carta de Ochoa | **Mal** | **devuelto** (`d53439e`) |
| Portada de Ochoa | Mejor que antes, pero **sigue raro** | quitado |
| Portada de Cokima | **Peor que todas** | quitado |

Dos lecturas importantes:

1. **La rara es nuestra portada, no la referencia.** Wikipedia y Vercel hacen lo normal.
2. **Cokima peor es una confirmación retrospectiva del diagnóstico**: es la web que **no recibió
   los arreglos**, y reproduce el síntoma original —«ese resize extraño que ya no ocurre en
   Ochoa»—. Concretamente le falta:
   - `Hero.astro:49` sigue en `height: calc(100svh - …)` **sin congelar**. Es el arreglo que en
     Ochoa llevó el rasterizado de 116 tareas a 0.
   - `pages/index.astro:117` `repeat(2, 1fr)` y `:132` / `en/index.astro:53` `1fr 1fr`: mismas
     retículas que en Ochoa sacaban 138px de scroll lateral. **Hay que medirlo recorriendo la
     página entera**, no a `scrollY 0` (ver §6).

   **Portar los dos arreglos a Cokima es lo primero que hay que hacer, y es mecánico.**

**Una prueba que quedó contaminada:** se le pidió a Mario probar «abajo del todo, con la tira
fuera de pantalla». Mala idea: **al acercarse al final del documento iOS restaura la barra por
norma**, hagas lo que hagas. Ese resultado no descarta la tira de platos. La prueba correcta es en
la **zona media** de la portada —las fotos de «la casa», el titular «Detrás del cristal»—, lejos
de la tira y lejos del final.

## 6. Herramientas y recetas que ya funcionan

- **Fotogramas de un vídeo de Mario.** No hay ffmpeg en la máquina:
  `npm install ffmpeg-static --no-save --prefix .` en el scratchpad, y luego
  `ffmpeg -i v.mp4 -vf "fps=1,scale=200:-1,tile=8x3" hoja.png`, que se lee con la herramienta de
  imágenes. Recortar la franja de la barra con `crop=886:420:0:1500` da el detalle del chrome.
- **Coste de pintado y rasterizado**: CDP `Tracing` con `devtools.timeline`, contando `Paint` y
  `RasterTask` mientras se cambia el alto del viewport. Es lo que destapó el hero.
- **Capas de composición**: CDP `LayerTree`. Fue lo que reveló que la capa del documento medía
  513×4003 en vez de 375×4003 — la pista del desbordamiento.
- **Gestos táctiles reales**: `Emulation.setTouchEmulationEnabled` + `Input.dispatchTouchEvent`.
- **Medir siempre a varias alturas de scroll y recorriendo la página entera.** Medir a
  `scrollY 0` dio por buenas dos veces cosas que estaban rotas.

## 7. Por dónde seguir

1. **Volver a quitar `viewport-fit=cover`** y que Mario confirme que la carta se arregla. Es el
   sospechoso principal y el único cambio con evidencia de haber movido la aguja en las dos
   direcciones. Ver §4.bis, incluido el coste visual que hay que decidir con él.
2. **Portar a Cokima** los arreglos de §3 (hero congelado y `minmax(0, 1fr)`), y medir. Es lo más
   rentable y no depende de resolver el misterio.
3. **Repetir la prueba de la tira** en la zona media de la portada, sin el sesgo del final.
3. **Comparar contra Cokima ya arreglada**: su portada tiene tira horizontal pero **ni cinta ni
   turno automático**, así que es el control natural para separar «lo que se mueve solo» del resto.
4. Si nada señala a una causa concreta, **considerar parar**. Queda Cokima entera por desmenuzar y
   el resto de la web quedó bien.

**Lo único que no se ha podido comprobar en ningún momento: el comportamiento real en WebKit.**
Todas las medidas de este documento salen de Chromium de escritorio. Si la próxima sesión puede
conectar un iPhone con Safari Web Inspector, eso vale más que todo lo de arriba.
