# La barra del navegador en iPhone — resuelto

**Estado: resuelto el 2026-08-01.** La causa era el **`ClientRouter` de Astro**, que escribe en el
historial del navegador cada vez que el scroll se detiene. En los navegadores de iPhone que no son
Safari, esa escritura obliga a sacar la barra de direcciones. El arreglo está en
`packages/ui/src/QuietScrollHistory.astro`, enchufado en los dos `Base.astro`.

Confirmado por Mario en su Brave de iPhone con una prueba A/B que aislaba esa única variable: en el
modo con la escritura, la barra se comporta como en Ochoa, Cokima y phsport.es; sin ella, como en
Vercel y Wikipedia.

Abierto el 2026-08-01 a partir de un reporte suyo y un vídeo. Cerrado el mismo día.

---

## 1. El síntoma, en sus palabras

> «Cuando termina el deslizamiento hacia abajo, sale la barra de direcciones igualmente. No se
> mantiene abajo como ocurría en Vercel o Wikipedia.»

Y antes: «es como si estuviese esperando al minimísimo instante a que mi dedo se deslizase en el
sentido contrario para mostrarme la barra de direcciones entera».

Las dos frases describen la causa con precisión y hay que leerlas literalmente: **al terminar** el
deslizamiento, y tras **un instante mínimo**. Eso es un disparo al final del gesto, no un problema
de pintado ni de layout, que es donde se estuvo buscando.

## 2. El entorno — leer esto ANTES de razonar nada

**Es un iPhone, y el navegador es Brave.** Brave en iOS está obligado por Apple a usar **WebKit**,
el motor de Safari. No es Chromium.

Durante cuatro vueltas se razonó sobre mecanismos de Chromium de Android porque nadie preguntó el
dispositivo. **Preguntar siempre: «¿iPhone o Android?».** El nombre del navegador no dice el motor.

Y hay un segundo matiz que resultó ser la clave: **Brave de iPhone no es Safari de iPhone**. Mismo
motor, distinto navegador. Ahí está la diferencia.

## 3. La causa

El `ClientRouter` engancha el final de cada scroll y guarda la posición en el historial
(`astro/dist/transitions/router.js`):

```js
const onScrollEnd = () => {
  if (history.state && (scrollX !== history.state.scrollX || scrollY !== history.state.scrollY)) {
    updateScrollPosition({ scrollX, scrollY });   // → history.replaceState()
  }
};
if ("onscrollend" in window) addEventListener("scrollend", onScrollEnd);
else { … setInterval(scrollInterval, 50) … }
```

Los navegadores de iPhone que no son Safari —Brave, Firefox, Chrome— están obligados a envolver el
`WKWebView` de Apple, y vigilan el estado de navegación de esa vista para pintar su propia barra.
No distinguen entre «la URL ha cambiado» y «se ha reescrito el estado con la misma URL»: ante la
duda, **enseñan la barra**. Safari no lo hace porque su barra es parte del navegador, no un
observador de la vista. Por eso el fallo solo aparecía en Brave, y por eso parecía «algo nuestro»
sin serlo del todo.

WebKit no tuvo `scrollend` hasta **Safari 26.2**, así que en el iPhone corre la otra rama: un
sondeo con `setInterval` cada **50 ms**. Ese es el «minimísimo instante».

Está reportado en Astro —[withastro/astro#12285](https://github.com/withastro/astro/issues/12285),
«causes the browser address bar to reappear every time scrolling stops»— y **cerrado sin arreglar**
el 2026-05-01. El mantenedor de las transiciones lo explicó así: *«The only reason for the scroll
listeners is to record the last scroll position before someone presses the browser back button»*, y
quitarlo sin más rompería esa restauración. El mismo bug está documentado en Firefox de iOS
([firefox-ios#6375](https://github.com/mozilla-mobile/firefox-ios/issues/6375)), con la nota de que
en Safari no ocurre.

## 4. La prueba que lo demostró

Dos páginas gemelas, **idénticas en todo** —mismo sondeo de 50 ms, mismas lecturas de scroll,
mismo número de disparos— salvo si se llama o no a `replaceState`. Ninguna llevaba
`viewport-fit=cover`, así que la prueba aislaba una sola variable. Mario las deslizó en su Brave:

| Modo | `replaceState` al parar el scroll | Lo que vio |
|---|---|---|
| A | sí | igual que Ochoa, Cokima y phsport.es |
| B | no | igual que Vercel y Wikipedia |

**Este es el método que faltaba en las tandas anteriores**, y la razón de que se descartaran cosas
en falso: una página de laboratorio, fuera de la web, con una sola variable y las dos ramas
enlazadas entre sí. Todo lo demás se había medido en Chromium de escritorio, donde el bug no
existe.

La medición de contraste, en Chromium sobre las tres webs, escrituras de historial durante el
scroll: **Wikipedia 0** · **phsport.es sí** · **Ochoa sí**.

## 5. El arreglo

`packages/ui/src/QuietScrollHistory.astro`, un `is:inline` que va **antes** de `<ClientRouter />`
en los dos `Base.astro` —los módulos son diferidos, así que un script clásico llega a tiempo de
envolver la función—.

No suprime el guardado: **lo retrasa**. Retiene la escritura mientras se hace scroll y la vuelca en
el último instante útil —al navegar, al ocultarse la pestaña, al descargarse el documento—. El
razonamiento completo, con qué llamadas se filtran y cuáles pasan intactas, está en el propio
componente.

Medido en Chromium sobre el build real:

| Paso | scroll real | historial |
|---|---|---|
| Deslizo a 2000 | 2000 | **sin tocar** |
| Navego a la carta | 0 | guarda 2000 |
| Pulso atrás | **2000** | restaurado |

**Lo que se pierde:** ir atrás *y luego adelante otra vez* devuelve la segunda página arriba en vez
de donde estaba. Es el precio conocido —el mismo que frenó al equipo de Astro— y no toca el caso
normal. Si algún día molesta, la salida es guardar la posición en `sessionStorage` en vez de en el
historial, que es lo que se propuso en el issue.

## 6. Lo que SÍ se arregló por el camino, y funcionó

Todo esto era real, medible, y Mario confirmó la mejora. **No tocar sin motivo.** Ninguno era la
causa de la barra, pero todos mejoraron la web por su cuenta.

| Arreglo | Medida antes → después |
|---|---|
| `body { overflow-x: hidden }` fuera (era un vestigio, no tapaba nada) | — |
| `scroll-behavior: smooth` fuera (no había ni un `href="#"` que animar) | — |
| La cinta rotulada se pausa cuando no se la ve (regla 6) | 20 → 10 recálculos de estilo |
| `.wall` con `minmax(0, 1fr)` | 138px de scroll lateral → 0 |
| La portada congela su alto y solo re-mide al cambiar el ancho | 116 → **0** tareas de rasterizado; pintado 11,5 → 3,3 ms |

El detalle de cada uno, en `estado.md` §3.sexies y en `movimiento.md` reglas 15-17.

## 7. Lo que se probó y NO era — no repetir

- **Listeners bloqueantes.** Cero. Todos los táctiles de la casa son `passive`.
- **Coste del gesto.** Somos **más ligeros que la referencia**: la portada gasta 0,6 ms de hilo
  principal y su tarea más larga es de 21 ms; vercel.com gasta 7,9 ms y tiene una de 123 ms.
- **Micro-retrocesos de scroll.** Cero en un swipe monótono, en las tres webs.
- **La tira de platos robando gestos.** No los roba.
- **Las imágenes** y **la altura del documento al cargarlas.** El `aspect-ratio` reserva el hueco.
- **`theme-color`.** Tiñe la barra, no cambia cuándo aparece, y en Brave de iPhone ni la tiñe. Se
  queda puesto porque sirve en Chrome de Android y en Safari, pero no era parte de esto.
- **`viewport-fit=cover`.** **Descartado de verdad**, ahora que hay una causa probada. Llegó a
  parecer el sospechoso principal porque la carta se comportó bien justo con la directiva quitada y
  mal al devolverla; era ruido de dos observaciones sueltas. Se queda: es lo que hace que la franja
  de la barra de estado vaya en el color de la casa y que la portada llegue a sangre bajo el notch.
- **Que vercel.com oculte su cabecera al bajar.** **Falso**, se dijo dos veces antes de
  comprobarlo: su header es `sticky top: 0` de 64px y no se mueve. Es la misma solución que
  nuestra `.nav` de 62px.

## 8. Los tres errores de método que costaron las vueltas

Valen más que el arreglo, porque se repiten:

1. **No preguntar el dispositivo.** Cuatro vueltas razonando sobre Chromium de Android cuando era
   WebKit. El nombre del navegador no dice el motor.
2. **Mezclar observaciones de estados distintos del código.** El descarte de `viewport-fit`
   comparaba una observación de antes de quitarlo con otra de después. **Cada observación se anota
   con su commit, y solo se comparan las del mismo estado.**
3. **Medir donde el bug no existe.** Todo se midió en Chromium de escritorio, que no reproduce
   nada de esto. Cuando el fallo es de un motor concreto, **la prueba tiene que correr en ese
   motor**, aunque eso signifique montar una página de laboratorio y pedirle a Mario treinta
   segundos.

Y uno de razonamiento: se presentó `theme-color` como arreglo de «percepción» cuando el problema
era de comportamiento, para tapar que no había explicación. Si no hay explicación, se dice.

## 9. Herramientas y recetas que ya funcionan

- **Prueba A/B en el móvil de Mario.** Página estática de dos modos por query string, desplegada
  con `deploy_to_vercel` (no hace falta CLI ni repo). Es lo que resolvió el caso.
- **Fotogramas de un vídeo suyo.** No hay ffmpeg en la máquina:
  `npm install ffmpeg-static --no-save --prefix .` en el scratchpad, y
  `ffmpeg -i v.mp4 -vf "fps=1,scale=200:-1,tile=8x3" hoja.png`.
- **Coste de pintado y rasterizado**: CDP `Tracing` con `devtools.timeline`.
- **Capas de composición**: CDP `LayerTree`. Reveló que la capa del documento medía 513×4003 en vez
  de 375×4003 — la pista del desbordamiento.
- **Medir siempre a varias alturas de scroll y recorriendo la página entera.** Medir a `scrollY 0`
  dio por buenas dos veces cosas que estaban rotas.

## 10. Para llevárselo a otro proyecto

`receta-barra-ios-astro.md`, al lado de este. Es autocontenido y sirve para cualquier web hecha con
Astro que use `<ClientRouter />`: la causa, un fragmento para comprobar en la consola si le afecta,
el componente entero listo para copiar, dónde enchufarlo y qué se pierde. **phsport.es tiene el
mismo caso** y es a donde va primero.

## 11. Los arreglos que le faltaban a Cokima — hechos el mismo día

Eran los dos de §6 que nunca recibió, y explican que su portada se viera peor que la de Ochoa.
Medidos antes y después a 375px:

| | antes | después |
|---|---|---|
| Portada, viewport 812 | 623px · documento 2990 | 623px · documento 2990 |
| Portada, viewport 750 (barra asomando) | **561px · documento 2928** | **623px · documento 2990** |

Es decir: cada vaivén de la barra le cambiaba el alto a la portada y arrastraba el documento
entero, que es lo que invalida la capa. Congelada, deja de moverse; y al rotar —lo único que debe
volver a medir— recalcula bien (420px en apaisado).

**Lo del scroll lateral era distinto de lo que se suponía, y conviene dejarlo escrito.** Se dio por
hecho que las retículas `1fr` de Cokima desbordaban como desbordaba la `.wall` de Ochoa. **No
desbordaban**: medido recorriendo la página entera a 375px, `sobra: 0` en las ocho alturas, y los
tracks daban 154px limpios. El motivo es que **Cokima no tiene fotos**: lo que hay dentro de su
`.wall` son los huecos marcados, que no traen tamaño intrínseco. El `minmax(0, 1fr)` se puso igual
—en `.wall` y en las dos `.visit-grid`— porque el desbordamiento aparecerá **el día que entren las
fotos de verdad**, que es justo cuando nadie va a estar mirando esto.

Lo único que sí sale por el lado es la tira de platos, que tiene su `overflow-x: auto` y es por
diseño. Ya se había marcado como falso positivo antes; no volver a perseguirlo.
