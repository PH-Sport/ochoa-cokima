# Movimiento

> **Estado: vivo** · revisado 2026-10-29

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

**Veintiocho más, solo en Ochoa,** para movimientos que no son ni entrar ni responder a un dedo. Cada
uno existe porque no cabía en los cinco de arriba, no porque hiciera falta un número nuevo. Los
trece últimos llegaron el 2026-10-29 con la home viva (`ochoa-inicio-vivo.md`); tres son listas, para
los ritmos sin compás, y dos no son duraciones sino una velocidad y una fracción, porque también
salen de aquí:

| Token | Ochoa | Para qué |
|---|---|---|
| `--ease-telon` | `cubic-bezier(0.45, 0.02, 0.55, 1)` | La curva de lo que **recorre la pantalla entera**. Ver la regla 9. |
| `--dur-cinta` | `34s` | La cinta rotulada **recorre**. Lineal, no con la curva: un rótulo que acelera se lee como un fallo. |
| `--dur-pase` | `3,5s` | Lo que una foto de la portada **espera** antes de que el telón traiga la siguiente. |
| `--ease-muelle` / `--dur-muelle` | `linear(…)` / `590ms` | El muelle `morph` de Mochi: lo que **se asienta**. Rebota un 0,50%, que no se ve (regla 1). **Sin uso desde el 2026-10-29:** lo usaba la foto que llegaba al muro de La casa, y el mosaico vivo que lo sustituyó se recompone con `--ease-telon`. |
| `--desenfoque` | `12px` | El cambio de contenido de Mochi: lo que llega lo hace desenfocado y se enfoca al asentarse (regla 2). Hoy, la foto nueva del mosaico de La casa. |
| `--dur-paneo` | `26s` | Lo que tarda el fondo del manifiesto en **ir de un lado al otro**; luego vuelve. Con `--ease-telon`, que frena en los dos extremos: con la quíntica, cada vuelta daría un tirón. |
| `--vel-tira` | `28px` | Lo que **avanza la tira** de la portada en el ordenador, en píxeles por segundo. Una velocidad y no una duración: lo que tarda una vuelta depende de lo que mida la fila, y eso cambia con el alto de la pantalla. Lineal, como la cinta. |
| `--relieve-suave` | `0.22` | La fracción de lo que le falta que **recorre la sombra de El relieve** en cada fotograma para alcanzar al cursor: al 90% en diez fotogramas. |
| `--vidas-palabra` / `--esperas-palabra` | `8.2s 10.4s …` / `1.3s 2.3s …` | Lo que **vive** cada palabra del fondo y lo que **espera** la siguiente, por turnos. Dos listas que no casan entre sí: no hay compás (regla 18). |
| `--dur-pincel` / `--dur-borrado` | `1.7s` / `1.4s` | Lo que tarda una palabra del fondo en **pintarse** de izquierda a derecha, y en **borrarse**. |
| `--reintento-palabra` / `--revisa-palabra` | `0.9s` / `0.65s` | Cuándo se vuelve a **buscar hueco** si no lo había, y cada cuánto se mira si una palabra ha quedado **tapada** al bajar (entonces se borra antes). |
| `--dur-mosaico` / `--dur-mosaico-elige` | `1.2s` / `720ms` | Lo que tarda el mosaico de La casa en **recomponerse** solo, y cuando alguien **pulsa** una foto. Los dos con `--ease-telon`: recorren el mosaico entero (regla 9). |
| `--respiros-mosaico` / `--espera-mosaico` | `1.7s 1.3s …` / `1.1s` | La **pausa** entre un cambio del mosaico y el siguiente, por turnos y sin compás, y la del primero al asomar. Con su propio reloj y no con `compas.ts`: el mosaico no comparte pantalla con la portada ni con el mazo (regla 25). |
| `--dur-ventana` | `900ms` | Lo que tarda la foto del mosaico en **seguir al ratón** dentro de su ventana. |
| `--dur-turno` | `5,5s` | Lo que un plato **espera** al frente del mazo antes de irse al fondo. Fue 3,5 s; se alargó el 2026-10-27 para no ir al compás de la portada (regla 25). |
| `--desfase-turno` | `0,25s` | No es una duración, es la **fase**: cuánto más tarda el primer cambio del mazo. Es lo que impide que coincida con la portada (regla 25). |
| `--dur-baraja` | `980ms` | Lo que tarda la carta de delante en **salir torciéndose y volver al fondo** del mazo. Dos viajes, así que 1,4 veces `--dur-recogida`, con `--ease-telon`. |
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
   desaceleran, no rebotan. **Excepción, decidida por Mario el 2026-10-28:** el muelle `morph`
   de Mochi, que rebota un 0,50% y no se ve. Es `--ease-muelle`, generado con la fórmula de
   Mochi, y no hay otro: un muelle nuevo se genera igual, no se escribe a ojo. **Desde el
   2026-10-29 no lo usa nada** —lo usaba el muro de La casa, y el mosaico vivo que lo sustituyó
   se mueve con `--ease-telon`—; la excepción se queda mientras siga en pie la decisión.
2. **Solo `transform` y `opacity`.** (Y `clip-path`, que ya se usaba en el telón y en el menú.)
   **Excepción, decidida por Mario el 2026-10-28:** `filter: blur()` en los cambios de
   contenido, que es el gesto de Mochi (`--desenfoque`). Solo en lo que entra o cambia —hoy,
   la foto nueva del mosaico de La casa—, nunca en una foto a pantalla completa ni ligado al
   scroll, que es donde el desenfoque cuesta. **Otra, del 2026-10-29: `text-shadow` en El
   relieve**, la luz del cursor sobre los rótulos del ordenador, que Mario eligió en el
   probador. Una sombra que cambia se repinta en cada fotograma, y eso es justo lo que esta regla
   evita; se admite porque son cinco rótulos (las tres secciones de la barra, «Los Ochoa» y el
   titular de la portada), solo con ratón y solo mientras la luz alcanza al cursor: cuando lo
   alcanza, no se pide ni un fotograma más (`relieve.ts`). Animar `width`, `height`, `padding` o `margin` obliga al
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
6. **Nada que se mueva solo sigue moviéndose después de que alguien lo toque.** El mazo de
   platos avanza solo hasta el primer gesto y ahí se apaga para siempre: quien desliza ha dicho
   que prefiere conducir. Y no corre mientras no se la ve, ni con la pestaña en segundo plano.
   **Esto vale para todo lo que se mueva solo, y la cinta rotulada se lo había saltado:** vivía
   en la franja 1144-1185 de una portada de casi 4000, o sea animándose en el 70% del recorrido
   sin que nadie la mirase. No es solo batería. **Chromium revalida todas las animaciones
   activas cada vez que le cambia el alto al viewport**, y ocultar y devolver la barra de
   direcciones al deslizar es exactamente eso: medido, la portada hacía 20 recálculos de estilo
   donde la carta hacía 10, y parando la cinta baja a esos mismos 10. Se pausa con
   `animation-play-state`, no se anula: al volver a la vista el rótulo sigue por donde iba en
   vez de recomponerse desde el principio.

   **Excepción, decidida por Mario el 2026-10-29: el fondo vivo de la home** («Vermú y
   palabras», `fondo.ts`). Es un lienzo de WebGL2 detrás de toda la página que pinta en la GPU
   en cada fotograma mientras se ve, y no se para al tocar: no es contenido que alguien esté
   leyendo y le quite el sitio, es el fondo, y tocar la página es como se baja por ella. Lo que sí
   cumple: con la pestaña oculta no pinta ni un fotograma, con «reducir movimiento» pinta uno
   quieto y solo lo repite al bajar o al cambiar el tamaño, y al salir de la home suelta la GPU.
   Lo que cuesta en un móvil modesto **no está medido**; si se nota, la palanca es la densidad
   a la que pinta (`MAX_DPR` y `ESCALA`).
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
    de platos, pedía su `behavior` en la propia llamada; desde el 2026-10-27 la tira es un mazo en
    el móvil y ya no hace scroll—. Lo que se salga se recorta en la pieza
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
    en el CSS como respaldo y como valor del primer pintado, y el script lo congela en píxeles.
    **Y el congelado puede bajar, pero no subir.** El 2026-09-07 se vio que congelar una sola vez
    tenía trampa: si la página se carga con la barra del navegador retraída —recargar estando ya
    bajado—, la primera medida es la del viewport grande y la portada se queda **94px más alta**
    para toda la sesión, porque solo se volvía a medir al cambiar el ancho. Con el mismo ancho,
    un alto menor es el viewport pequeño llegando tarde y se acepta; uno mayor es el vaivén de
    barras y se ignora. Una rotación cambia el ancho y empieza de cero. La lógica está en
    `@tombo/ui/alto-congelado.ts`, con test, y se mide sobre una **referencia** fuera del flujo
    con el mismo `calc()`: así se lee el valor sin congelar sin quitar y volver a poner la variable.
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

18. **El movimiento ambiental se delata por la cadencia, no por el efecto.** Mario pidió botones
    «vivos» y un aviso de scroll, y en los dos avisó: nada de patrones típicos de IA. Lo típico
    —el brillo que barre la pieza, el halo que late, el borde de degradado girando, el ratoncito
    con la ruedita, la flecha que rebota— no se reconoce por *qué* hace, sino porque **se le oye
    el compás** y porque el gesto no dice nada del sitio. Las dos piezas de la entrada de Cokima
    se hicieron contra eso, con tres condiciones que valen para cualquier movimiento que solo
    esté ahí para dar vida:

    - **Lento hasta que no se vea moverse.** El rescoldo de los botones recorre 6px en horizontal
      y 3,9 en vertical a lo largo de 19 segundos: **0,52 píxeles por segundo**. No se ve
      moverse; se nota que no está muerto, que no es lo mismo.
    - **Poco.** Escala entre 1 y 1,03, opacidad entre 0,36 y 0,52. Si se aprecia el
      desplazamiento, ya es demasiado.
    - **Sin compás.** Los fotogramas caen en 23%, 41%, 68% y 86% —no equidistantes— y las dos
      piezas llevan duraciones distintas y primas entre sí (19s y 26s), con retardo negativo. No
      coinciden nunca, así que no hay pulso que seguir.

    Y el gesto sale del sitio: Cokima es un mundo de brasa y de neón —sus colores se llaman
    `vermilion` y `ember`, y el local tiene un mural de fuego—, así que los botones respiran como
    un rescoldo y el aviso de scroll es una chispa que baja por un riel, como se enciende un tubo.
    Se anima un pseudo-elemento con `transform`, nunca la `box-shadow` del botón: una sombra
    animada repinta en cada fotograma y esto se compone en la GPU.

    **Dos excepciones, decididas por Mario el 2026-10-29 viéndolas en el probador**
    (`ochoa-inicio-vivo.md`). Las dos se mueven a la vista y no son pequeñas; las dos guardan la
    tercera condición, **sin compás**:

    - **El fondo vivo.** Las vetas rojas del vermú se ven moverse, y las palabras se ven
      pintarse y borrarse. Mario pidió justo eso —*«detalles sutiles rojos por el fondo que
      vayan moviéndose, haciendo formas»*— y el sitio lo da el gesto: la luz de un vaso sobre el
      mármol y las palabras del espejo de la barra. El compás no se oye: las vidas y las esperas de
      las palabras son dos listas que no casan (`--vidas-palabra`, `--esperas-palabra`), y la luz
      que pasea sin ratón suma senos de periodos que no casan entre sí.
    - **La tira de la portada en el ordenador.** Las ocho fotos pasan sin parar a 28 px/s, y
      ocupan la portada entera. Es la forma de enseñar fotos verticales enteras en una franja
      apaisada (en la de antes se veía el 36-47 % de su alto). No tiene compás porque no tiene
      cambios: es un avance lineal y continuo, como la cinta rotulada. Se para para siempre al
      primer toque y no corre con menos de media portada a la vista (regla 6).

19. **Tocar una animación por la Web Animations API la desacopla del CSS, y eso falsea la
    comprobación siguiente.** Al verificar que el rescoldo se pausaba fuera de pantalla salió que
    no se pausaba. La regla estaba bien: el test había hecho antes `anim.currentTime = ...` y
    `anim.play()` para muestrear el recorrido, y a partir de ahí la animación deja de obedecer al
    `animation-play-state` del CSS. En página limpia se pausaba. **Cuando una medición contradice
    a otra, sospechar del instrumento antes que del código**, y repetirla en una página recién
    cargada. Es la hermana de la regla 8.

20. **`autoplay` no pasa por el interruptor de `prefers-reduced-motion`, y esconder no es apagar.**
    La cinta de la entrada de Cokima llevaba `autoplay` en la etiqueta y un guard de movimiento
    reducido en el script. Parecía correcto y no lo era: el guard solo impedía añadir la clase que
    la hace visible, así que quien pedía no ver movimiento **se descargaba los 0,94 MB y el vídeo
    se reproducía a 30 fps detrás de una capa a opacidad 0**. Medido el 2026-08-17: `paused: false`
    y `currentTime` avanzando de 2,46 a 3,98 s. Pagarlo todo y no recibir nada, y encima `autoplay`
    invalida el `preload="none"` que tenía al lado.

    **Quien arranca un medio es el script, no el atributo**, porque el atributo no sabe lo que ha
    pedido quien mira. Sin `autoplay` y con `preload="none"`, en movimiento reducido ahora no hay
    ni una petición de red (`readyState: 0`) y manda el póster.

    Y la comprobación que lo demuestra no es «¿se ve?», sino **`networkState`, `readyState`,
    `paused` y si `currentTime` avanza**. Es la regla 8 aplicada al ancho de banda: comprobar que
    algo está oculto no es comprobar que está apagado.

    **La regla 6 vale también para el vídeo, y se estaba incumpliendo.** Los botones y la chispa se
    paran con `data-sobre-entrada`, pero a la cinta no la paraba nadie: medido, seguía a 30 fps a
    pantalla completa con la página en el pie (`currentTime` de 5,05 a 7,06 s). Ahora lleva su
    propio `IntersectionObserver` —y no el atributo del `<html>`, que lo pone un centinela de 1px
    al final de la sección: para pausar lo que importa es si **el vídeo** está en pantalla, no si lo
    está el final de su sección— más `visibilitychange` para la pestaña en segundo plano. Y
    `play()` se llama con `.catch()`: al deslizar rápido, la promesa se rechaza porque el elemento
    se pausa antes de arrancar, y eso no es un error sino el resultado correcto.

21. **Lo que decide un estado visible no puede esperar a `astro:page-load`.** La entrada de Cokima
    colgaba de ese evento la marca que aparta la cabecera y el arranque de la cinta. El evento no
    llega hasta que han bajado y corrido los módulos de Astro, y **medido en carga fría eso fueron
    957 ms**: durante ese segundo la cabecera se veía puesta —rótulo y hamburguesa— y luego
    desaparecía, y el vídeo ni se había empezado a pedir. Lo reportó Mario desde el iPhone, donde
    por datos se nota mucho más que en local.

    **No era un parpadeo de estilo sino de estado.** El CSS estaba bien; lo que llegaba tarde era
    quién decide. Se arregla con un `<script is:inline>` justo detrás de la sección: corre durante
    el parseo, con el marcado ya en el DOM y antes del primer pintado. El módulo se queda con lo
    que sí puede esperar —observadores y medidas—, y no vuelve a arrancar lo ya arrancado.

    Después: la petición del vídeo baja de **957 a ~137 ms**, y **en el primer fotograma pintado la
    marca ya está puesta**. Esa es la comprobación que vale, y no «cuándo se pone»: con
    `requestAnimationFrame` no se puede observar nada antes del primer frame, así que medir el
    instante da una cota del instrumento —salían 358 ms— y no el dato. La pregunta correcta es
    **«¿llegó a pintarse sin ella?»**, y se responde mirando el estado dentro del primer `rAF`.

    Lo que NO se hizo, y conviene que siga sin hacerse: `preload="auto"` para adelantar más. Eso
    deja al navegador bajando la cinta desde el principio, compitiendo con el póster, que es el LCP.

25. **Dos movimientos que se ven a la vez no comparten compás, y el desfase solo existe con un
    reloj común.** En el móvil, la portada (el telón) y «Lo que más sale» (el mazo) están en la
    misma pantalla. Con los dos cada 3,5 s y arrancando juntos cambiaban a la vez y la página latía
    —Mario lo vio en el boceto el 2026-10-27—. Se separaron: la portada cada `--dur-pase`, el mazo
    cada `--dur-turno` (5,5 s) y su primer cambio `--desfase-turno` más tarde. Con 3,5 y 5,5 los
    cambios caen en múltiplos de medio segundo, y ese cuarto los deja siempre a 0,25 s o más; sin
    él, uno de cada siete coincidía exacto. **La trampa es que el desfase no sobrevive a dos relojes
    sueltos:** el mazo arranca cuando se ve la mitad, que es al bajar, y los dos se paran fuera de
    pantalla. Cada vez que uno vuelve, su fase saldría al azar. Por eso ninguno cuenta su espera:
    los dos preguntan a `apps/ochoa/src/compas.ts` cuándo les toca, contado desde el `timeStamp`
    del mismo `astro:page-load`. **Medido sobre el build a 390 px, 40 s:** separaciones de 1,25 /
    0,75 / 0,75 / 1,25 / 0,25 / 0,25 s, las mismas que en el boceto; y bajando a los 7,45 s, el
    mazo cambió a los 11,28, en su hueco y no al azar.

    **Con la home viva (2026-10-29), cómo queda cada pieza.** En el móvil, el telón y el mazo
    siguen preguntando a `compas.ts`. En el ordenador, la portada es la tira, que no cambia sino
    que avanza sin parar, así que no tiene compás con el que coincidir. El mosaico de La casa
    lleva su propio reloj porque nunca comparte pantalla con la portada ni con el mazo: medido
    sobre el build, empieza 1.381 px por debajo de «Lo que más sale» a 390 (pantalla de 844) y
    1.555 por debajo de la portada a 1024. Y su ritmo no es un compás: pausas por turnos de una
    lista (`--respiros-mosaico`). Las palabras del fondo sí pueden salir en la misma pantalla que
    el mazo o el mosaico, pero tampoco llevan compás —sus vidas y sus esperas son listas que no
    casan— y no cambian de golpe: se pintan en 1,7 s y se borran en 1,4.

    **Y en un mazo, recolocar no es animar.** Hacia atrás el mazo solo se recolocaba, y la carta
    que volvía del fondo saltaba de capa en el primer fotograma: aparecía fundiéndose *encima* de
    la de delante, las dos a medio transparentar —Mario lo vio en su iPhone el 2026-10-27—. El
    `z-index` no se transiciona, cambia de golpe. Lo que cambia de capa necesita una animación que
    diga en qué momento cruza. **Y el resto del mazo tiene que esperar a estar tapado.** Con la
    vuelta ya animada, Mario seguía viendo que «se hunde de golpe y luego comienza la animación»:
    medido, la de delante perdía la sombra en el primer fotograma y en 150 ms ya estaba encogida
    al fondo —la quíntica—, cuando la que volvía seguía al 18% de opacidad. Ahora lo demás se
    recoloca con retardo, ya tapado, y la sombra cambia de dueña en ese mismo instante con
    `box-shadow 0s linear` y el mismo retardo.

    **Los dos sentidos tienen que enseñar el plato a la vez.** La vuelta hacía el viaje entero de
    la ida al revés —salir del fondo por detrás del mazo y cruzar a mitad de camino— y el plato no
    se veía hasta los 400 ms ni entero hasta los 900, cuando hacia el otro lado está al 80% a los
    300. Mario: «debería verse el plato más rápidamente». Ir por detrás no aportaba nada: la carta
    del fondo está escondida, así que puede aparecer fuera de la pantalla sin que se note. Ahora
    entra por la izquierda por encima, en `--dur-baraja` × 0,5 (la mitad visible de la ida).
    Medido sobre el build a 390 px, porcentaje del plato nuevo a la vista: 40 / 80 / 100% a los
    200 / 300 / 400 ms **en los dos sentidos**; la de delante, quieta hasta quedar tapada (1% a
    la vista a los 500 ms) y retirándose debajo después.

26. **Una mezcla dentro de algo que se mueve con `transform` solo se mezcla con lo de dentro.**
    El `transform` hace de su elemento una capa aparte, y un `mix-blend-mode` en uno de sus hijos
    ya no ve lo que hay detrás de esa capa. El fondo del manifiesto (rama `feat/inicio-vivo`,
    2026-10-28) multiplicaba la foto de las botellas sobre el rojo de la sección. Al poner el
    paralaje en su envoltorio, la foto salió gris, sin rojo con el que mezclarse, y sin dar un
    solo error. **La mezcla va en el elemento que se mueve, no dentro**, y la sección lleva
    `isolation: isolate` para que no se mezcle con nada más allá de ella.

27. **Dos piezas que tienen que moverse juntas no se confían a dos transiciones de propiedades
    distintas.** El navegador no las lleva en el mismo sitio: la de `transform` (y la de
    `opacity`) corre en el compositor, y la de `clip-path`, en el hilo principal. Mientras el
    hilo principal va desahogado no se nota; cuando va cargado, la del compositor se adelanta.
    Pasó en el mosaico de La casa (2026-10-29): la ventana se recortaba con una transición de
    `clip-path` y la foto se colocaba con una de `transform`, y con el lienzo del fondo vivo
    ocupando la CPU, al empezar un cambio asomaba una franja de 26 px sin foto al pie de la
    tesela. **La medición con estilos calculados decía que la foto cubría siempre su ventana**,
    porque los dos valores calculados cuadraban; lo que no cuadraba era lo pintado, y solo se
    vio en capturas. La cura es calcular las dos en el mismo `requestAnimationFrame`
    (`mosaico.ts`), con las curvas de `tokens.css` (`leeCurva` en `compas.ts`): si el hilo va a
    tirones, van a tirones juntas. Lo que puede adelantarse sin destapar nada —el fundido de la
    foto que entra— se queda en CSS. **Se comprueba con capturas a mitad del cambio, con carga
    en la página, no leyendo `getComputedStyle`.**

## Qué se mueve hoy

| Dónde | Qué | Con qué |
|---|---|---|
| Menú a pantalla completa | El panel cae como una persiana y se recoge al cerrar. En Ochoa se probó el 2026-10-28 que el botón «MENÚ» creciera hasta ser el panel, con el muelle de Mochi, y Mario volvió a la persiana ese mismo día: «queda más simétrico» | `clip-path`, `--dur-in` / `--dur-out` |
| Menú a pantalla completa | Las secciones entran en cascada | `translateY(--shift)`, `--dur-in`, `--stagger` |
| Botón del menú | El subrayado se recoge al abrir | `transform`, `--dur-out` |
| Enlaces del menú | Color al pasar por encima (y la brasa, en Cokima) | `color`/`box-shadow`, `--dur-out` |
| Botones, fichas de contacto y mapa | Se hunden al tocar y recuperan al soltar | `data-tacto`, `--dur-sube` |
| Cinta rotulada (Ochoa) | Recorre en bucle | `translateX`, `--dur-cinta` |
| Portada en el móvil (Ochoa) | El telón: cada foto entra de derecha a izquierda sobre la anterior | `clip-path`, `--dur-pase`, `--dur-recogida`, `--ease-telon`; con `compas.ts` |
| Portada en el ordenador (Ochoa) | La tira: las ocho fotos en fila, enteras, pasan de derecha a izquierda sin parar; la serie va dos veces para que la vuelta no se note | `translateX` con la Web Animations API, lineal, a `--vel-tira`; con media portada a la vista y la pestaña delante; se para al primer toque; quieta con «reducir movimiento» |
| Paralaje (Ochoa) | Tres fondos van más lentos que la página: la portada un 25% (tope 60 px), las botellas del manifiesto un 12% (tope 40) y la foto de La tasca un 8% dentro de su marco (tope 22) | `transform` desde `apps/ochoa/src/paralaje.ts`; nada con «reducir movimiento» |
| Manifiesto (Ochoa, en los dos idiomas) | La pared de botellas, en blanco y negro y multiplicada sobre el rojo, va y viene de lado | `transform`, `--dur-paneo`, `--ease-telon`; solo a la vista, se para al primer toque; nada con «reducir movimiento» |
| Mosaico de La casa (Ochoa) | Cada 2,5 a 3,3 s la tesela grande se encoge y una vecina crece en su hueco con una foto nueva, que llega desenfocada; con el ratón encima, cada foto se desplaza un poco en su ventana | `clip-path` + `transform` desde `mosaico.ts`, en el mismo fotograma (regla 27), con `--dur-mosaico`, `--respiros-mosaico` y `--ease-telon`; `opacity` + `filter` en CSS; con un 30% a la vista y la pestaña delante; se para con el ratón encima y para siempre al pulsar una foto; nada con «reducir movimiento» |
| Fondo de la home (Ochoa) | Las vetas rojas del vermú se mueven sin parar, y las palabras del espejo se pintan en el blanco libre, viven unos segundos y se borran | WebGL2 desde `fondo.ts`, en cada fotograma mientras se ve la página (excepción de las reglas 6 y 18); `--vidas-palabra`, `--esperas-palabra`, `--dur-pincel`, `--dur-borrado`; nada con la pestaña oculta; un fotograma quieto con «reducir movimiento» |
| Barra del ordenador (Ochoa) | El relieve: la sombra de las secciones, del rótulo y del titular de la portada cae al lado contrario del cursor | `text-shadow` desde `relieve.ts` (excepción de la regla 2), `--relieve-suave`; solo con ratón |
| Mazo de platos (Ochoa, solo móvil) | La de delante sale por la izquierda torciéndose y vuelve al fondo; deslizando a la derecha, la anterior entra por la izquierda por encima, en la mitad del tiempo; el turno se rellena | `transform` + `opacity`, `--dur-turno`, `--desfase-turno`, `--dur-baraja`, `--ease-telon`; `scaleX` |
| Portada | El titular se aparta del cartel de cookies | `translateY`, `--dur-out` |
| Entrada (Cokima) | Los dos botones respiran como un rescoldo | pseudo con `transform`, 19s y 26s |
| Entrada (Cokima) | Una chispa baja por un riel, avisando de que hay más | `stroke-dashoffset`, 3,2s |
| Entrada (Cokima) | La cabecera, el cartel de cookies y el aviso entran al deslizar | `opacity` + `visibility`, `--dur-in` / `--dur-out` |
| Entre páginas | Barrido lateral, bidireccional | `translateX`, `--dur-in` |
| Entrada a la web (Ochoa) | «LOS» y «OCHOA» llegan torcidas de lados opuestos y encajan, se les despega la sombra, y la plancha se recoge hasta ser la barra con el rótulo aterrizando dentro | `transform`, `--dur-in`, `--tuerce`, `--stagger`, `--dur-firma` |
| Entrada a la web (Ochoa) | La plancha se recoge y los botones de la barra —en el ordenador, también las secciones y el idioma— entran desde el borde derecho | `clip-path` + `transform`, `--espera-firma`, `--dur-recogida`, `--ease-telon` |

Y ya. Todo lo demás está quieto a propósito.
