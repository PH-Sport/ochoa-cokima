# Movimiento

Pocas animaciones, concretas, y todas saliendo de los mismos cinco valores. **No hay un solo
milisegundo suelto en los componentes**: si algo se mueve, su duración y su curva vienen de
`tokens.css` de cada app. Añadir un `0.2s ease` a mano es la forma de romper esto.

## Los valores

Viven en `apps/<app>/src/styles/tokens.css`.

| Token | Ochoa | Cokima | Para qué |
|---|---|---|---|
| `--ease` | `cubic-bezier(0.22, 1, 0.36, 1)` | igual | La curva. Una sola, en las dos marcas. |
| `--dur-in` | `420ms` | `520ms` | Lo que entra: un panel que aparece. |
| `--dur-out` | `160ms` | `180ms` | Lo que responde a un dedo: pulsar, cerrar, un hover. |
| `--shift` | `14px` | `18px` | Cuánto se desplaza lo que entra. |
| `--stagger` | `55ms` | `65ms` | El escalón entre hermanos en cascada. |

**Tres más, solo en Ochoa,** para movimientos que no son ni entrar ni responder a un dedo. Cada
uno existe porque no cabía en los cinco de arriba, no porque hiciera falta un número nuevo:

| Token | Ochoa | Para qué |
|---|---|---|
| `--dur-cinta` | `34s` | La cinta rotulada **recorre**. Lineal, no con la curva: un rótulo que acelera se lee como un fallo. |
| `--dur-turno` | `3,5s` | Lo que la tira de platos **espera** antes de pasar al siguiente. |
| `--dur-sube` | `240ms` | Lo que un botón tarda en **recuperar su sitio** tras soltarlo. |

Y una escala de curvatura, que no es movimiento pero sigue la misma disciplina de no escribir
números sueltos en los componentes: `--r-chapa` 4px, `--r-btn` 7px, `--r-caja` 9px, `--r-marco`
12px. La esquina se percibe en proporción a lo que enmarca, así que crece con la pieza en vez de
repetirse igual en todas.

**La curva es la misma en las dos marcas** porque es una decisión de calidad, no de identidad:
una *ease-out* quíntica, que arranca rápida y frena como frena un objeto de verdad. **El ritmo
sí diverge a propósito:** Cokima es un mundo oscuro y denso y se mueve un punto más despacio y
más lejos; Ochoa es una tasca y es seca.

## Las reglas

1. **Nunca bounce ni elástica.** Envejece mal y delata plantilla. Las cosas reales
   desaceleran, no rebotan.
2. **Solo `transform` y `opacity`.** Animar `width`, `height`, `padding` o `margin` obliga al
   navegador a recalcular la disposición en cada fotograma. La portada lo hacía —el titular se
   apartaba del cartel de cookies moviendo su `padding-bottom`— y ahora se aparta con
   `translateY`, con el mismo resultado en pantalla.
3. **Entrar es lento, responder es rápido.** `--dur-in` para lo que aparece; `--dur-out` para
   lo que contesta a una pulsación. Un menú que tarda lo mismo en cerrarse que en abrirse se
   siente lento aunque el número sea idéntico.
4. **La cascada solo al entrar.** `--stagger` escalona los hermanos cuando aparecen; al salir
   se van todos a la vez. Cerrar con cascada es hacer esperar a quien ya ha decidido irse.
5. **El apagado vive en un sitio.** La regla `prefers-reduced-motion` de `global.css` anula
   todas las transiciones y también las de View Transitions, que el navegador ejecuta por su
   cuenta. Ningún componente necesita su propio `@media` de apagado.
6. **Nada que se mueva solo sigue moviéndose después de que alguien lo toque.** La tira de
   platos avanza sola hasta el primer gesto y ahí se apaga para siempre: quien desliza ha dicho
   que prefiere conducir. Y no corre mientras no se la ve, ni con la pestaña en segundo plano.
7. **La respuesta al dedo no sale de `:active`.** En Safari de iOS ese estado no se aplica de
   forma fiable sin un listener táctil en la página. Va por `pointerdown`/`pointerup` desde el
   script del layout, marcando las piezas con `data-tacto`; `:active` se queda de respaldo para
   quien navegue sin JavaScript. Ver §3.quater de `estado.md`.
8. **Comprobar que la regla existe no es comprobar que se ve.** Un efecto de pulsación se
   verifica simulando el toque —`page.mouse.down()` / `up()`— y muestreando la posición real a
   lo largo del tiempo. Leer el CSSOM dio dos versiones por buenas que en el móvil no se veían.

## Qué se mueve hoy

| Dónde | Qué | Con qué |
|---|---|---|
| Menú a pantalla completa | El panel cae como una persiana y se recoge al cerrar | `clip-path`, `--dur-in` / `--dur-out` |
| Menú a pantalla completa | Las secciones entran en cascada | `translateY(--shift)`, `--dur-in`, `--stagger` |
| Botón del menú | El subrayado se recoge al abrir | `transform`, `--dur-out` |
| Enlaces del menú | Color al pasar por encima (y la brasa, en Cokima) | `color`/`box-shadow`, `--dur-out` |
| Botones, fichas de contacto y mapa | Se hunden al tocar y recuperan al soltar | `data-tacto`, `--dur-sube` |
| Cinta rotulada (Ochoa) | Recorre en bucle | `translateX`, `--dur-cinta` |
| Tira de platos (Ochoa) | El turno se rellena y pasa al siguiente | `scaleX`, `--dur-turno` |
| Portada | El titular se aparta del cartel de cookies | `translateY`, `--dur-out` |
| Entre páginas | Barrido lateral, bidireccional | `translateX`, `--dur-in` |

Y ya. Todo lo demás está quieto a propósito.
