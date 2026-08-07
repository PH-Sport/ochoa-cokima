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

**Siete más, solo en Ochoa,** para movimientos que no son ni entrar ni responder a un dedo. Cada
uno existe porque no cabía en los cinco de arriba, no porque hiciera falta un número nuevo:

| Token | Ochoa | Para qué |
|---|---|---|
| `--ease-telon` | `cubic-bezier(0.45, 0.02, 0.55, 1)` | La curva de lo que **recorre la pantalla entera**. Ver la regla 9. |
| `--dur-cinta` | `34s` | La cinta rotulada **recorre**. Lineal, no con la curva: un rótulo que acelera se lee como un fallo. |
| `--dur-turno` | `3,5s` | Lo que la tira de platos **espera** antes de pasar al siguiente. |
| `--dur-sube` | `240ms` | Lo que un botón tarda en **recuperar su sitio** tras soltarlo. |
| `--dur-firma` | `280ms` | Lo que la sombra dura tarda en **despegarse** del rótulo en la entrada. No es entrar: el rótulo ya está ahí, lo que aparece es su relieve. |
| `--espera-firma` | `700ms` | El **retardo** de la recogida de la entrada, contado desde el arranque —no una duración—. Deja 420ms de rótulo quieto y entero después de la firma. |
| `--dur-recogida` | `700ms` | Lo que la plancha de la entrada tarda en **recogerse hasta ser la barra**. No sale de `--dur-in`: ese mide un panel que aparece y esto recorre la pantalla entera. |
| `--tuerce` | `4deg` | Cuánto se **tuerce** lo que llega antes de encajar. Es a la rotación lo que `--shift` es al desplazamiento: la medida de un gesto. Un rótulo de bar se monta pieza a pieza y nunca queda a plomo. |

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
   cuenta. Ningún componente necesita su propio `@media` de apagado. **Con una excepción, y por
   una razón que conviene entender: la entrada.** Ese bloque no la dejaría puesta —su
   `animation-duration: 0.01ms !important` la retiraría al instante—, pero eso es justo lo que
   hay que evitar: un **destello rojo a pantalla completa de un fotograma**, que para quien pide
   menos movimiento es peor que la animación entera. La regla vale cuando lo que se apaga es
   *cómo* se mueve algo que va a estar ahí de todas formas; no vale cuando la pieza **solo
   existe para moverse**. Esas no se atenúan: no se pintan, y eso hay que decidirlo antes del
   primer pintado, en el script. Ver `intro.ts`.
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
    de la máscara, lo que pide un envoltorio más y recorta tildes y sombras duras. Para el menú
    basta un desplazamiento corto.

    **La entrada llegó a usarla y se retiró igual, esta vez no por un fallo técnico.** Se hizo
    cumpliendo la condición —la palabra se desplazaba dentro de la máscara— y las tres objeciones
    quedaron resueltas: dos envoltorios, versales sin tildes que recortar y el recorte aplicado
    solo por arriba, dejando aire a la derecha para la sombra. Medido, el texto no sobresalía ni
    un píxel. Y aun así Mario la cambió por el encaje de dos mitades, porque **una cortina es
    sobria por naturaleza y esta casa es una tasca**. Vale la pena recordarlo cuando una técnica
    esté impecable: correcta no es lo mismo que adecuada.
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
16. **Nada que ocupe media pantalla dimensiona su alto desde el viewport.** Cuando la portada
    cambia de alto empuja todo lo que tiene debajo e **invalida la capa entera del documento**:
    se repinta la página completa, no el rectángulo que cambió. Por eso el vaivén de la barra se
    notaba igual arriba que abajo, y por eso costó dar con ello —mirando solo la primera
    pantalla, la portada parecía inocente—. Medido con un trace, diez cambios de alto disparaban
    55 tareas de rasterizado desde cualquier posición de scroll, contra 0 en la carta; con el
    alto congelado, 0 también, y el pintado baja de 11,5 ms a 3,3. El `calc(100svh …)` se queda
    en el CSS como respaldo y como valor del primer pintado, y el script lo congela en píxeles
    **volviendo a medir solo cuando cambia el ancho**, que es el único cambio de viewport que
    afecta al cálculo: una rotación recoloca, un vaivén de barras no toca nada.
17. **El desbordamiento lateral se mide recorriendo la página, no en el primer pantallazo.**
    `.wall` le sacaba 138px de scroll lateral a la portada y se dio por limpia dos veces seguidas
    porque se midió a `scrollY 0`, y esa retícula vive a mitad de página. La causa era
    `grid-template-columns: repeat(2, 1fr)` con fotos dentro: un track `1fr` es en realidad
    `minmax(auto, 1fr)`, y el mínimo automático de una imagen es su tamaño intrínseco —estas
    declaran 1000px—, así que el track se negaba a encoger por mucho `width: 100%` que llevara la
    foto. Se arregla con `minmax(0, 1fr)`, **en la pieza y no tapándolo en el documento**.
18. **`animationend` burbujea, y quien escucha el final de una secuencia tiene que filtrar por
    objetivo.** En la entrada se animan tres piezas a la vez —la plancha, el rótulo y su sombra—
    y el listener vive en la plancha, que es la que manda porque es la que tapa. Sin
    `if (e.target === plancha)`, la firma de la sombra —que termina a los 210ms, dentro del
    rótulo— habría retirado la entrada a mitad del viaje. **No lo habría cazado ningún test
    unitario**, porque la lógica de decisión estaba bien: el fallo estaba en quién escucha a
    quién. Lo mismo vale para `transitionend`.
19. **Una animación que depende de una medida no puede arrancar sola desde el CSS.** El rótulo de
    la entrada viaja hasta donde esté el de la barra, y eso se mide en cliente. Si el CSS
    arrancase el movimiento al pintar, un módulo que llegue tarde lo mandaría a un sitio
    inventado. Por eso hay dos estados y no uno: `data-intro="si"` lo pinta quieto y
    `data-intro="va"` lo suelta, y entre los dos ocurre la medida. Dos corolarios, los dos
    medidos: **la fuente tiene que estar cargada antes de medir** —con la de respaldo el rótulo
    mide otra cosa y el aterrizaje cae torcido—, con tope de tiempo porque una fuente que no
    llega no puede dejar media web tapada; y **lo que se mide en `display: none` mide cero**, así
    que la pieza se oculta con `visibility` o se mide después de declararla visible. Con el cero,
    el rótulo encogía en el sitio en lugar de aterrizar, y eso **no se ve en una captura**.
20. **Dos piezas que tienen que encajar comparten la regla, no una copia de sus valores.** El
    rótulo de la entrada aterriza sobre el de la barra, y los dos son «el rótulo de la casa»: la
    fórmula está en `.cartel`. Se reimplementó a mano —familia e interlineado— y salieron dos
    fallos de la misma raíz, uno métrico y otro visible a simple vista: el `line-height: 1` propio
    contra el `0.96` heredado dejaba las letras 0,67px por debajo de su sitio, y **faltaban el
    `text-transform` y el `letter-spacing`, así que la entrada decía «Los Ochoa» mientras la barra
    decía «LOS OCHOA»**. Lo cazó Mario al primer vistazo, no la medición: ninguna de las
    comprobaciones de geometría podía verlo, porque el aterrizaje era exacto — sobre otra palabra.
    Poniéndole la clase, el residuo de alto baja de 0,43px a **0,01px**, que es la señal de que el
    problema nunca fue el redondeo del glifo sino no compartir proporciones. Y es el mismo
    argumento por el que `.brand` borró su `text-shadow` en vez de copiar el valor.
21. **Un `z-index` alto no sirve de nada dentro de un contexto de apilamiento ajeno.** Los botones
    de la barra tenían que entrar por encima de la plancha de la entrada, y ponerles `z-index: 81`
    contra el 80 de la plancha no hizo absolutamente nada: la barra es `sticky` con `z-index: 60`,
    o sea que **crea su propio contexto** y todo lo que hay dentro se ordena solo respecto a sus
    hermanos. Quien tiene que subir es la barra entera. Y al subirla, su fondo tapaba el rótulo que
    viaja por debajo, así que se apaga —el fondo y el filete— y hace de fondo la plancha, que es
    exactamente el mismo rojo. **Lo que sube es siempre el contexto, no la pieza**, y subirlo
    obliga a revisar qué tapaba antes.
22. **En Astro, un `:global()` por trozos deja fuera lo que hay entre medias.** Escrito como
    `:global(html[data-intro]) :global(.nav-actions) > *`, el combinador y el `*` se quedan sin
    envolver y el compilador les añade el ámbito **del componente que escribe la regla**: salió
    `.nav-actions > [data-astro-cid-<el-de-Intro>]`, y los botones llevan el de `Nav.astro`, así
    que la regla no le aplicaba a nada. No hay error, no hay aviso: sencillamente no pasa nada.
    **Cuando una regla cruza la frontera de un componente, se envuelve la cadena entera en un solo
    `:global(...)`.** Es pariente de lo que ya documenta la regla del hundido: lo que se estiliza
    desde fuera hay que comprobarlo en el CSS de salida, no darlo por escrito.
23. **Una transición heredada convierte en movimiento lo que querías instantáneo — y falsea
    cualquier medida que tomes en ese momento.** Los botones de la barra llevan
    `transition: transform` para el hundido al tacto. La entrada los aparta fuera de la ventana
    antes de empezar, y esa transición hacía dos estropicios a la vez: **se les veía salir**
    deslizándose hacia la derecha durante los primeros 160ms en vez de estar ya fuera —el «se
    asoma ligeramente» que cazó Mario—, y al anular el desplazamiento para medir su posición real,
    `getBoundingClientRect()` devolvía **la posición en curso de la transición**, no la de reposo:
    a un botón le salió una distancia negativa de 1284px, que lo habría hecho entrar por el lado
    contrario cruzando la pantalla entera. Las dos curas son la misma: `transition: none` mientras
    dure el estado, y apagarla también durante la medida. **Antes de posicionar o medir algo que
    no escribiste tú, mira qué transiciones arrastra.**
24. **Un valor de reserva tiene que ser seguro, no aproximado.** Para sacar los botones de la
    pantalla se puso `translateX(160%)`, que suena razonable y no lo es: el porcentaje es del ancho
    de **cada pieza**, así que uno de 62px se apartaba 99px y con el margen de la barra en
    escritorio seguía dentro del viewport. Ahora la distancia real se mide y se publica en
    `--fuera`, y el `var()` cae en `100vw`, que saca cualquier cosa esté donde esté. La medida no
    está para que funcione —de eso se encarga la reserva— sino para que el viaje sea el justo en
    vez de cruzar la pantalla entera, que es lo que convierte la quíntica en un golpe (regla 9).

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
| Entrada a la web (Ochoa) | «LOS» y «OCHOA» llegan torcidas de lados opuestos y encajan, se les despega la sombra, y la plancha se recoge hasta ser la barra con el rótulo aterrizando dentro | `transform`, `--dur-in`, `--tuerce`, `--stagger`, `--dur-firma` |
| Entrada a la web (Ochoa) | La plancha se recoge y los botones de la barra entran desde el borde derecho | `clip-path` + `transform`, `--espera-firma`, `--dur-recogida`, `--ease-telon` |

Y ya. Todo lo demás está quieto a propósito.
