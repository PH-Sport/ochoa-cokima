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
| `--stagger` | `30ms` | `65ms` | El escalón entre hermanos en cascada. |

**Cuatro más, solo en Ochoa,** para movimientos que no son ni entrar ni responder a un dedo. Cada
uno existe porque no cabía en los cinco de arriba, no porque hiciera falta un número nuevo:

| Token | Ochoa | Para qué |
|---|---|---|
| `--ease-telon` | `cubic-bezier(0.45, 0.02, 0.55, 1)` | La curva de lo que **recorre la pantalla entera**. Ver la regla 9. |
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
   **Esto vale para todo lo que se mueva solo, y la cinta rotulada se lo había saltado:** vivía
   en la franja 1144-1185 de una portada de casi 4000, o sea animándose en el 70% del recorrido
   sin que nadie la mirase. No es solo batería. **Chromium revalida todas las animaciones
   activas cada vez que le cambia el alto al viewport**, y ocultar y devolver la barra de
   direcciones al deslizar es exactamente eso: medido, la portada hacía 20 recálculos de estilo
   donde la carta hacía 10, y parando la cinta baja a esos mismos 10. Se pausa con
   `animation-play-state`, no se anula: al volver a la vista el rótulo sigue por donde iba en
   vez de recomponerse desde el principio.
7. **La respuesta al dedo no sale de `:active`.** En Safari de iOS ese estado no se aplica de
   forma fiable sin un listener táctil en la página. Va por `pointerdown`/`pointerup` desde el
   script del layout, marcando las piezas con `data-tacto`; `:active` se queda de respaldo para
   quien navegue sin JavaScript. Ver §3.quater de `estado.md`.
8. **Comprobar que la regla existe no es comprobar que se ve.** Un efecto de pulsación se
   verifica simulando el toque —`page.mouse.down()` / `up()`— y muestreando la posición real a
   lo largo del tiempo. Leer el CSSOM dio dos versiones por buenas que en el móvil no se veían.
9. **La curva se elige por la distancia que recorre, no por la marca.** La quíntica frena tan
   pronto que sobre un recorrido largo deja de ser una frenada y se vuelve un golpe: medida a
   390px, la persiana del menú se comía el 90% de sus 844px en 161ms y arrastraba 260ms más en
   un movimiento que ya no se percibe. Está calibrada para los 14px de `--shift`. Lo que cruza
   una pantalla usa `--ease-telon`, que reparte el recorrido.
10. **Lo que aparece detrás de algo que se mueve no puede tardar lo que tarda ese algo.** Una
    pieza que se revela tras un telón no viaja: entra en `--dur-out`, no en `--dur-in`. El menú
    tenía las dos cosas en `--dur-in` y el resultado era que el telón descubría «La carta» a los
    35ms y el texto no acababa de aparecer hasta los 420 — medio segundo de plancha roja vacía
    con letras llegando encima. **La comprobación es cruzada:** para cada pieza, en qué
    milisegundo la descubre el telón y en cuál está puesta. El desfase tiene que ser negativo —
    puesta antes de ser descubierta—, nunca positivo.
11. **Al cerrar, lo que se tapa no se desvanece.** El salto a invisible se retrasa con
    `transition: opacity 0s linear var(--dur-out)` hasta que el telón ha terminado de pasar. Si
    se desvanece a la vez, se ve un texto apagándose sobre un fondo que todavía sigue ahí, que
    son otra vez dos movimientos discutiendo.
12. **Lo que sale del flujo deja un hueco, y hay que devolverlo.** La barra pasa a `fixed`
    mientras dura el menú, así que la página de debajo perdía su alto de golpe y daba un tirón
    hacia arriba de exactamente 62px justo al abrir. Se ve porque el telón todavía está cayendo
    y no la tapa. `html.menu-open body { padding-top: var(--t-header-h) }` ocupa ese sitio. **Se
    comprueba muestreando la posición de un elemento del fondo en cada frame de la apertura y
    exigiendo que el máximo sea 0**, no mirando el estado final: el estado final ya era correcto
    y el salto pasaba igual.
13. **El reveal se calibra contra el movimiento al que acompaña, no en abstracto.** Un fade con
    la quíntica estaba al 97% a mitad de su tiempo: cuando el telón llegaba, la pieza ya estaba
    puesta y no se veía ninguna animación. Con `--ease-telon` y la espera de `--reveal`, cada
    pieza está entre el 33% y el 60% cuando la descubren, y se ve terminar.
14. **Una máscara sobre texto quieto no revela, corta.** Se probó un reveal de cortina con
    `clip-path` sobre los nombres del menú y se retiró al verlo: dejaba media letra flotando y se
    leía como un fallo de pintado. Un reveal de cortina exige que la palabra se desplace *dentro*
    de la máscara, lo que pide un envoltorio más y recorta tildes y sombras duras. Para esto
    basta un desplazamiento corto.
15. **El movimiento que hace el navegador también es movimiento nuestro.** En Chromium, ocultar
    y devolver la barra de direcciones al deslizar **redimensiona el viewport de verdad**; en
    Safari desde iOS 15 no, y por eso el vaivén solo se veía a trompicones en Brave. Ese resize
    no se puede evitar, pero sí se puede dejar de estorbar, y había dos reglas heredadas
    estorbando: `body { overflow-x: hidden }`, que al propagarse al viewport convertía el
    documento en un scroller con desbordamiento tapado, y `scroll-behavior: smooth` en el
    `<html>`, que animaba los reajustes de scroll que el navegador se da a sí mismo. **Las dos
    eran vestigios:** medido en las dieciséis rutas de las dos webs a 360px, el ancho
    desplazable sin el recorte es igual al visible, y no existe en el monorepo ni un `href="#"`
    ni un `scrollIntoView` que el `smooth` pudiera animar —el único scroll suave, el de la tira
    de platos, pide su `behavior` en la propia llamada—. Lo que se salga se recorta en la pieza
    que se sale, nunca en el documento. Y la altura de la portada cuelga de `svh`, que por
    definición no se mueve cuando la barra colapsa: `dvh` ahí habría hecho bailar la página
    entera en cada gesto.

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
