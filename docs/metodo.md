# Método: cómo se decide y cómo se verifica

**Las dos técnicas que este repo ya ha pagado caras.** Decidir lo visual enseñando variantes en
vez de describirlas, y sostener toda afirmación sobre cómo se ve la web en una medición hecha en
el navegador, no en la lectura del código.

> Escrito el 2026-09-07 volcando lo que solo vivía en la memoria local del agente en el HP. La
> memoria no cruza de ordenador; esto sí. Ver `trabajar-con-mario.md` para el porqué del volcado.

---

## 1. Bocetos comparables antes de elegir

Cuando la decisión es sobre **cómo se mueve** algo, describirla no sirve: se juzga viéndola. El
método funcionó dos veces seguidas el 2026-08-06 con la entrada de Ochoa, y Mario eligió variante
las dos veces **sin una sola vuelta de aclaración**.

1. **Un solo HTML autocontenido** que simule la pieza real: la tipografía y los colores
   verdaderos —fuentes en base64 desde `apps/<app>/public/fonts/`, foto desde `public/images/`— y
   **los tiempos sacados de `tokens.css`, no inventados**. Un boceto con tiempos de fantasía no
   decide nada, porque no es la pieza.
2. **3–4 variantes, cada una con su botón, más la que ya existe como referencia** para comparar en
   caliente. Y un interruptor de cámara lenta: un factor `--k` que multiplica todas las duraciones
   vía `calc()`.
3. **Publicarlo con la herramienta Artifact**, no solo mandar el archivo. Mario lo prueba en el
   móvil, que es donde se juzga de verdad.

**Detalles que hacen que funcione:**

- Cada variante se activa con un `data-v` en un contenedor, y **la mecánica común no se duplica**:
  si cada variante es un bloque independiente, dejan de ser comparables.
- **Nombrarlas por su gesto, en lenguaje de la casa** —«¡Marchando!», «El colgante», «Montado a
  mano»—, nunca «Opción A/B/C». Es lo que le permite decidir con criterio de marca en vez de por
  descarte.
- **Decir siempre cuál se recomienda y por qué**, y señalar sin adornos la que rompa una regla del
  sistema. Mario eligió una que no se recomendaba, y acertó.
- Hay andamiaje reutilizable: el patrón de placeholders (`{{ANTON_B64}}`) más un script que los
  sustituye por el base64 de la fuente. Montarlo desde cero cuesta más que copiarlo.

**El corolario que costó una iteración:** una solución puede estar medida, ser correcta y cumplir
todas las reglas, y **aun así ser inadecuada**. Una cortina es sobria por naturaleza, y Los Ochoa
es una tasca. Cuando Mario pida «más juguetón» o «que grite tapa y caña», no es un ajuste de
parámetros: es cambiar el gesto entero.

**Y el fallo que ninguna medición podía cazar:** en la segunda vuelta detectó de un vistazo que el
rótulo decía «Los Ochoa» y la barra «LOS OCHOA». El aterrizaje era **exacto en píxeles**, pero
sobre otra palabra. Medir prueba la geometría, no el sentido.

---

## 2. Verificar en el navegador, midiendo

Toda afirmación sobre cómo se ve o se comporta la web se sostiene en una medición hecha en el
navegador a ~390 px. **No en la lectura del código.** El 2026-07-28 falló en las dos direcciones
el mismo día:

- **Falso negativo.** Se comprobó que el cartel de cookies se cerraba mirando el atributo
  `hidden`. Estaba puesto, pero `display: flex` le ganaba y el cartel seguía ocupando la pantalla.
  El bug era real y se dio por bueno. Lo correcto:
  `getBoundingClientRect().height > 0 && getComputedStyle(el).display !== 'none'`.
- **Falso positivo.** El navegador mostraba el botón «Reservar» oculto en móvil por una regla CSS
  **que ya no existía en el fuente**: caché obsoleta de Vite. Se estuvo a punto de reportar un bug
  inexistente. Se descarta con `rm -rf node_modules/.vite apps/*/node_modules/.vite` y rearrancando,
  o confirmando contra un build limpio.

### 2.1 Lo que NO se puede medir desde la terminal — y hay que decirlo, no fingirlo

Con la ventana de Chrome **sin foco** —que es siempre, trabajando desde el agente— el documento
está en `visibilityState: "hidden"`, y eso rompe tres cosas:

1. **`requestAnimationFrame` no avanza.** Los muestreos frame a frame devuelven 1–2 muestras y
   parecen «sin salto» cuando en realidad **no se ha medido nada**.
2. **Las animaciones CSS se congelan.** Las capturas salen a medias y no reflejan el movimiento.
3. **Chrome no registra FCP ni LCP.** Las métricas de pintado salen vacías.

**El ritmo de una animación y su LCP los juzga Mario. El agente mide geometría y estado.** Decirlo
así es más útil que entregar un número que no significa nada.

### 2.2 Técnicas que sí funcionan sin foco

- **Congelar una animación en un punto exacto:** `animation-delay` negativo + `animation-play-state:
  paused`. Determinista, y sirve para capturar el fotograma que se quiera.
- **Verificar estados en vez de trayectorias.** Comparar la geometría en los estados extremos —sin
  entrada / puesta / animándose / retirada— prueba «esto no toca el layout» mejor que un muestreo
  por frames, y no depende del reloj.
- **Nunca `await` con bucles de `rAF`** en la herramienta de JavaScript: agota el CDP a los 45 s.
  Lanzar el muestreo sin `await`, guardar en `window.__x` y consultar en una segunda llamada. Y
  nunca un bucle bloqueante: congela la pestaña.
- **Las capturas *fullPage* de Playwright no son fiables** para elementos `position: fixed`: pueden
  no aparecer aunque estén en pantalla.

### 2.3 Las cuatro trampas de método

1. **Medir a una sola altura de scroll.** El 2026-08-01 dos tandas enteras se midieron a
   `scrollY 0` y dieron por limpia la portada, que era la culpable. Al medir a cuatro alturas
   apareció además un desbordamiento lateral de 138 px dado por bueno dos veces.
2. **Medir a mitad de una transición.** El 2026-08-07 pasó **tres veces en la misma tanda**: un
   `border-color` que parecía no aplicarse, un `transform` que parecía no aplicarse, y una posición
   que devolvió −1284 px en vez de la real. Las tres veces el valor era correcto y lo que fallaba
   era leerlo en vuelo. **Antes de medir un elemento que no escribiste tú, mira qué transiciones
   arrastra y apágalas durante la medida.**
3. **Mezclar observaciones de estados distintos del árbol.** El 2026-08-01 se descartó una causa
   razonando «lo llevaban las dos páginas y solo fallaba una, luego no es». Sonaba sólido y era
   falso: la observación que decía «esta página va bien» era **posterior** a haber quitado justo
   eso. **Cada observación se anota con el commit en el que se tomó**, y solo se comparan
   observaciones del mismo estado.
4. **Arreglar lo que no está roto.** En esa misma sesión salieron tres falsos positivos propios: un
   frame de 88 ms que no se reproducía (era el instrumental compitiendo con la animación), un
   «salto» que era el `scroll-behavior: smooth` aún llegando a destino, y un scroll horizontal que
   era la tira de platos, preexistente y por diseño. **Medir dos veces antes de tocar.**

### 2.4 `dev` no es lo que se despliega

El 2026-08-17 se verificó el vídeo de la entrada en `pnpm dev` —vídeo reproduciéndose,
`readyState` 4, todo correcto—, se dio el build por bueno porque decía `Complete!`, se subió, y
Mario abrió la preview en su iPhone y **seguía viendo el póster**. El HTML publicado no traía la
etiqueta `<video>`: la condición que la pintaba usaba `new URL(..., import.meta.url)`, que en `dev`
apunta al fichero fuente y al construir apunta al chunk empaquetado. Funcionaba en local y fallaba
en producción **sin dar un error**.

Cuando el cambio dependa de algo que resuelve el bundler —rutas, existencia de ficheros, imports
condicionales—, `dev` no prueba nada. Verificar sobre la salida real
(`grep "<video" .vercel/output/static/index.html`) y, si ya está desplegado, sobre el HTML
publicado antes de decirle a Mario que lo mire. **`Complete!` dice que compiló, no que el HTML diga
lo que debe.** La regla está también en `CLAUDE.md`; el caso completo, en `cokima-el-rediseno.md` §5
— **que hoy solo existe en la rama `tmp/entrada-cokima`**, no en `preview`.

### 2.5 Si el fallo es de un motor concreto, medir en Chromium no vale de nada

**Preguntar el dispositivo antes de construir el diagnóstico.** El nombre del navegador no dice el
motor: **Brave en Android es Chromium y Brave en iPhone es WebKit**, porque Apple obliga, y el
razonamiento entero cambia.

El 2026-08-01 se dio por hecho «Brave = Chromium/Android» y se razonaron cuatro vueltas sobre
mecanismos de Chromium. Mario grabó un vídeo y era **un iPhone**. Los arreglos hechos hasta ahí
eran válidos y los saltos desaparecieron de verdad, pero la explicación de por qué funcionaban no
aplicaba a su navegador, y un arreglo entero (`theme-color`) no hacía nada en su pantalla. Otras
cuatro vueltas se dieron midiendo en Chromium de escritorio, **donde el bug sencillamente no
existe**: de ahí salieron descartes en falso y un «sospechoso principal» que no lo era.

**Lo que lo resolvió en una tanda:** montar una página de laboratorio de dos modos —idénticos salvo
una única línea—, desplegarla (basta el conector de Vercel; no hace falta ni CLI ni repo) y pedirle
a Mario treinta segundos de su iPhone. Su respuesta fue inmediata y binaria.

**Cuando algo solo se ve en un dispositivo, la prueba tiene que correr en ese dispositivo**, y el
camino más corto es una A/B de una variable en sus manos, no más instrumentación en la del agente.

Si hay una grabación de pantalla, mirarla pronto: se extraen fotogramas y se monta una hoja de
contactos con `ffmpeg -vf "fps=1,scale=200:-1,tile=8x3"`, que se lee con la herramienta de
imágenes. Ahí se ve el dispositivo, la barra del sistema y el comportamiento real.

El caso completo está en `barra-del-navegador-ios.md` — **su §8, los tres errores de método, vale
más que el arreglo**. La receta portable, en `receta-barra-ios-astro.md`.

---

## 3. El entorno de trabajo, y sus averías conocidas

- **Los `pnpm dev` lanzados en segundo plano desde el agente se mueren solos**, en las dos máquinas,
  a veces a los pocos segundos de responder con HTTP 200. Para una verificación puntual, levantarlo
  y usarlo en el mismo turno. Para que Mario lo mire, **pedirle que lo lance desde su terminal**
  (`! pnpm --filter ochoa dev`) o mandarle al alias de preview de la rama, que no depende de la
  sesión. No relanzarlo más de una vez sin que lo pida.
- **El perfil de Playwright se queda bloqueado** con un `lockfile` en uso si una llamada muere a
  medias, y entonces **los dos** servidores fallan con «Browser is already in use». Se arregla
  cerrando los `chrome.exe` cuya línea de comandos contenga el perfil `ms-playwright-mcp/mcp-chrome-*`
  —filtrando por `CommandLine`—. **Nunca matar todos los Chrome:** se lleva por delante las
  pestañas de Mario.
- **`claude-in-chrome` sirve de alternativa, con un aviso:** ahí `resize_window` **no cambia el
  viewport**, así que no vale para verificar móvil.
- **No sondear las previews de Vercel en bucle.** Activa el checkpoint anti-bot y a partir de ahí
  todo devuelve `403` a curl y a Playwright: los `grep` empiezan a dar cero y parece que el
  despliegue ha fallado. El estado se pregunta a la API de Vercel (`list_deployments` →
  `state: READY`).

---

Ver también: `trabajar-con-mario.md` (a quién se le reporta y cómo), `movimiento.md` (las reglas
numeradas, vinculantes), `barra-del-navegador-ios.md` §8 y `recursos.md`.
