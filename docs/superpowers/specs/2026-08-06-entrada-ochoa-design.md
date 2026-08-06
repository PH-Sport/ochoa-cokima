# La entrada de Los Ochoa

- **Fecha:** 2026-08-06
- **Marca:** Los Ochoa. **Cokima no se toca.**
- **Acordado con Mario** en la sesión del 6, sobre un boceto con tres variantes reproducibles.
- **Estado de la elección: provisional.** Mario eligió la variante B «sujeto a cambios». El
  diseño está montado para que cambiarla sea sustituir dos `@keyframes`, no rehacer el
  andamiaje. Ver §12.

---

## 1. Qué se pide

Una animación de entrada a la web «alineada con su identidad y estética. Algo sencillo pero
llamativo». Con una restricción que manda sobre todo lo demás, en palabras de Mario:

> No queremos generar fricción a todo el que entre haciéndole esperar una animación. Lo justo y
> necesario como para que nos de ese toque estético y premium, por muy castiza que sea la
> identidad del restaurante.

O sea: la entrada tiene que **verse**, pero no puede convertirse en un peaje.

## 2. Principio de la solución

**No se estrena vocabulario.** La web ya tiene un telón —la persiana roja del menú full-screen,
`Nav.astro:259`— y ya tiene una plancha de rótulo: la barra. La entrada es el mismo material
haciendo un gesto nuevo, no un recurso importado.

Y todos los tiempos salen de `tokens.css`. Los dos que faltaban se añaden ahí con su porqué
(§7), no se escriben sueltos en el componente. Es la disciplina de `movimiento.md`.

---

## 3. La entrada: «se hace barra»

La pantalla arranca cubierta por la plancha roja de la casa, con el rótulo **LOS OCHOA** en Anton
centrado, papel sobre rojo. Entonces:

| Desde | Hasta | Qué pasa | Con qué |
|---|---|---|---|
| 0 ms | 280 ms | La sombra dura **se despega** del rótulo | `transform`, `--dur-firma`, `--ease` |
| 280 ms | 700 ms | El rótulo, quieto y entero | los 420 ms que sobran del retardo |
| 700 ms | 1400 ms | La plancha **se recoge hasta medir la barra** y el rótulo **viaja y encoge hasta su sitio dentro de ella** | `clip-path` + `transform`, `--dur-recogida`, `--ease-telon` |

Total: **1,4 s.**

**Duraba 740 ms y Mario la alargó al verla en el móvil:** «la animación se nota muy poco». El
diagnóstico que salió de ahí importa más que el número: el problema no era la velocidad del
movimiento, era que **no daba tiempo a leer el nombre antes de que empezara a marcharse**. Por eso
el reparto nuevo es mitad y mitad —700 ms para que el rótulo se plante y se lea, 700 ms para que
se vaya— y no un estiramiento proporcional de las tres fases.

Lo que cuenta el gesto es verdad: la barra roja de la web es esa misma plancha, y el rótulo de la
barra es ese mismo rótulo. No cambia de fuente, ni de color, ni de tratamiento de sombra — solo
de tamaño y de sitio. Por eso la costura no se ve: al terminar la recogida, debajo hay el mismo
rojo.

**La sombra se despega con `transform`, no animando `text-shadow`.** El rótulo son dos capas
superpuestas —una de tinta y otra de papel— y lo que se mueve es la de tinta. Animar la sombra
directamente repinta en cada fotograma y se salta la regla 2 de `movimiento.md`.

**El viaje se mide, no se escribe.** De dónde sale el rótulo y a dónde llega dependen del ancho
de la pantalla y del cuerpo de la fuente: cualquier número fijo sería falso en algún móvil. Se
leen los dos rectángulos con `getBoundingClientRect()` y se publican como `--tx`, `--ty` y `--s`.
Medido en el boceto, el aterrizaje cae con **0 px de desvío** en x, en y y en ancho, tanto a
2560 como a 390 px.

**Hay que medir con el rótulo ya visible.** Un elemento en `display: none` no tiene caja y
devuelve cero: en el boceto eso hizo que el rótulo encogiera en el sitio en vez de aterrizar, y
no se ve en una captura. El intro se oculta con `visibility`, y la medida va **después** de
declarar la variante.

### Las descartadas

- **«El telón»** (la plancha sube y se va, 680 ms). Descartada porque al pasar **corta el rótulo
  por la mitad**. Es la regla 14: una máscara sobre texto quieto no revela, corta. En el menú eso
  pasa al cerrar, que es un gesto pedido; aquí sería la primera impresión.
- **«La plancha cruza»** (barrido lateral, 620 ms). Descartada por redundante: el barrido lateral
  ya es la transición entre páginas, y usarlo también para entrar gasta dos veces el mismo gesto.

---

## 4. Cuándo sale

Cuatro puertas, en orden. Basta que una diga no:

1. `prefers-reduced-motion: reduce` → **no**.
2. Tipo de navegación `reload` o `back_forward` → **no**.
3. `sessionStorage` ya marcado → **no**.
4. En cualquier otro caso → **sí**, y marca `sessionStorage`.

Traducido a lo que pidió Mario: sale **siempre que se entra desde fuera** —una búsqueda, un
enlace compartido, una pestaña nueva— y **no sale al recargar estando dentro**. La puerta 2 cubre
de propina el botón de atrás, que es la misma situación.

Sale en **todas las páginas**, no solo en la home. Es lo que Mario eligió sabiendo que el tráfico
de búsqueda aterriza sobre todo en `/carta`. La variante funciona igual en cualquiera de ellas
porque su destino —la barra— existe en todas.

**La decisión se toma antes del primer pintado**, en un script inline y síncrono del `<head>` de
`Base.astro`, que escribe `data-intro` en el `<html>`. El CSS de la plancha cuelga de ese
atributo. Si la decisión llegara después, se vería la web un instante y *luego* la plancha roja
encima, que es peor que no tener entrada.

**El apagado por `prefers-reduced-motion` va en el script, no en el CSS.** La regla de
`global.css:287` no deja la plancha puesta —su `animation-duration: 0.01ms !important` la
retiraría al instante—, pero eso es justo lo que hay que evitar: un **destello rojo a pantalla
completa de un fotograma**, que para quien pide menos movimiento es peor que la animación
entera. La entrada no se atenúa; no se pinta. Es la excepción a la regla 5 de `movimiento.md`,
y hay que anotarla allí.

**Sin JavaScript no hay entrada**, y la web se ve entera desde el primer frame. Es la
degradación correcta, no un descuido.

---

## 5. El disparo desde «Los Ochoa»

El rótulo de la barra (`Nav.astro:47`) es un `<a href="/">` normal del `ClientRouter`. Al
pulsarlo desde cualquier página, la entrada se reproduce.

**Estando ya en la home, no se reproduce.** Decidido por Mario. El router no navega a ninguna
parte en ese caso, así que la entrada anunciaría una llegada que no ocurre.

Mario lo dejó dicho: «esto lo cogemos con pinzas, hay que ver si produce demasiada fricción, pero
lo probamos». Por eso va detrás de una constante propia —`INTRO_EN_RETORNO` en
`packages/ui/src/intro.ts`—: ponerla en `false` apaga solo este disparo y deja intacta la entrada
desde fuera. Mismo mecanismo que el `EN_OBRAS` de `conocenos.ts`.

---

## 6. Dónde vive

Sigue el reparto del menú full-screen, que ya separa comportamiento de piel:

| Pieza | Qué contiene |
|---|---|
| `packages/ui/src/intro.ts` | Las cuatro puertas del §4 y el ciclo de vida. **Ni un color ni una fuente.** |
| `apps/ochoa/src/components/Intro.astro` | La piel: plancha roja, rótulo Anton, los dos `@keyframes`. |
| `apps/ochoa/src/layouts/Base.astro` | El script inline del `<head>` que decide antes del primer pintado. |

La regla de oro del monorepo se respeta: `packages/ui` no sabe nada de este rojo.

---

## 7. Los dos tokens nuevos

En `apps/ochoa/src/styles/tokens.css`, y documentados en `movimiento.md` como los cuatro que ya
viven ahí por el mismo motivo (`--dur-cinta`, `--dur-turno`, `--dur-sube`, `--ease-telon`): no
cabían en los cinco de base, no son un milisegundo suelto.

| Token | Valor | Para qué |
|---|---|---|
| `--dur-firma` | `210ms` | Lo que la sombra tarda en despegarse del rótulo. No es entrar ni responder a un dedo: es una firma. |
| `--espera-firma` | `320ms` | El **retardo de la recogida, contado desde el arranque**, no una duración. Deja 110 ms de rótulo quieto y entero después de la firma; sin ellos, la plancha empieza a irse antes de que el nombre se haya llegado a leer. |

El resto ya existe: `--dur-in` para la recogida y `--ease-telon` para la curva, que es la que
reparte un recorrido largo en vez de convertirlo en un golpe (regla 9).

---

## 8. Lo que la entrada NO hace

**No bloquea el scroll.** Bloquearlo reintroduce las dos trampas que ya costaron caro con el
menú —la cabecera `sticky` descolgándose y la página ensanchándose de golpe— a cambio de proteger
740 ms. Y es coherente con la regla 6: quien desliza durante la entrada ha dicho que prefiere
conducir.

**No toca el layout.** Es `position: fixed` sobre todo lo demás, así que la portada sigue
congelando su alto exactamente como hasta ahora (regla 16) y no se le añade ni una medición.

---

## 9. Convivencia

- **`z-index: 80`.** Hoy son: panel del menú 50, barra 60, cartel de cookies 60. La entrada va
  por encima de los tres.
- **El cartel de cookies** aparece en la primera visita, que es justo cuando sale la entrada.
  Queda tapado y aparece al recogerse el telón. No hay que sincronizar nada: el cartel publica
  `--t-consent-h` y el titular de la portada se aparta solo, como ya hace.
- **El `ClientRouter`** no debe disparar la entrada al navegar entre páginas. Aunque el script
  inline se re-ejecutara en un swap, la puerta 3 lo corta: `sessionStorage` ya está marcado desde
  la primera carga.

## 10. Accesibilidad

`inert` y `aria-hidden="true"`: la entrada no roba el foco ni la lee un lector de pantalla. El
rótulo que contiene es decorativo — el nombre del sitio ya está en el `<h1>` y en la barra.

## 11. El coste, dicho claro

La entrada **no retrasa la carga**: la página se carga por detrás, y de hecho tapa el momento en
que la foto de portada se está decodificando, que hoy se ve en crudo.

Pero un velo opaco sobre la portada **puede empujar el LCP** que mide Google, y esto ya no es un
matiz: al pasar de 740 ms a 1,4 s, la entrada entra de lleno en el terreno donde esa métrica se
resiente. El umbral de «bueno» de Google está en 2,5 s, así que 1,4 s de velo deja poco margen
para el resto de la carga en una red móvil normal. **Es una decisión tomada con el dato delante**
—Mario la alargó sabiéndolo—, pero **hay que medirlo**, y si sale mal la palanca es este número.

## 12. Verificación

- **Tests unitarios** de las cuatro puertas del §4. La decisión es una función pura si se le
  inyectan el tipo de navegación, el estado de `sessionStorage` y la preferencia de movimiento.
- **En el navegador, y midiendo** (regla 8 y `barra-del-navegador-ios.md` §8):
  - el aterrizaje cae con desvío 0 sobre el rótulo de la barra, a 390 y a escritorio;
  - la entrada no sale al recargar ni al volver atrás;
  - la entrada sí sale en una pestaña nueva;
  - no hay salto de layout al retirarse.
- **En el iPhone de Mario**, en Brave además de Safari.

## 13. Lo que queda abierto

- **La variante es provisional.** Cambiarla debe costar sustituir los dos `@keyframes` de
  `Intro.astro`: las cuatro puertas, el disparo, los tokens y el andamiaje no dependen de qué
  gesto haga la plancha.
- **El disparo desde «Los Ochoa»** está a prueba, por decisión de Mario. Interruptor propio.
- **Cokima no entra en esta tanda.** Si algún día la quiere, el reparto del §6 ya deja el
  mecanismo en `packages/ui` y solo haría falta una piel nueva.
