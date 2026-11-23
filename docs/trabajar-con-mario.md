# Trabajar con Mario

> **Estado: vivo** · revisado 2026-09-07

**Con quién se trabaja y cómo se le reporta.** No es un perfil de cortesía: cada punto de aquí
salió de una corrección suya, y varios costaron una tanda entera antes de aprenderse. El *qué*
está construido vive en `estado.md`; esto es el *cómo*.

> **Por qué existe este documento.** Hasta el 2026-09-07 todo esto vivía solo en la memoria local
> del agente en el HP. Esa memoria **no cruza de ordenador y se borra al acabar la sesión**, y este
> proyecto se desarrolla desde dos máquinas. Un agente que se sentaba en el Mac empezaba sin nada
> de esto y volvía a cometer los mismos errores. Lo que importa va al repositorio o se pierde.

---

## 1. Quién es

Mario lleva el marketing y el desarrollo web del **Grupo Tombo**, grupo hostelero de Madrid con
dos restaurantes: **Cokima** (Kitchen Madness) y **Tasquita Los Ochoa**. Es a la vez el cliente y
quien dirige el trabajo.

- **Perfil técnico mixto.** Sabe de desarrollo web y elige el stack —Astro lo propuso Mario—,
  pero **no domina la parte de ad-tech, atribución y píxeles**; ahí pide criterio y se fía:
  *«eres tú el que domina, me fío de ti»*. Fiarse no es querer solo la conclusión: hay que
  explicar el porqué en lenguaje llano igualmente.
- **Ojo de diseño muy fino.** Detecta al instante los tics de web generada por IA. El caso
  fundacional: señaló la **monoespaciada usada como «voz de utilidad»** (en títulos, etiquetas,
  precios, botones) como el tic delator, sin que nadie se lo apuntara. Ver `../.impeccable.md`
  §Aesthetic Direction, que es donde vive la regla.
- **Exige rigor y lo comprueba.** Pregunta explícitamente si se ha inventado información. Espera
  que se distinga sin que lo pida lo **real** (sacado de su web o de las cartas) de lo **añadido**
  (copy propuesto, alérgenos deducidos, datos de maqueta).
- **Trabaja en varias superficies:** la app de escritorio de Claude, la terminal de Claude Code y
  el control remoto desde el iPhone, sobre el mismo proyecto y a veces el mismo día. Por eso la
  continuidad la sostiene el repositorio.
- **Dónde prueba:** en el móvil, y **en Brave además de Safari**. Compara contra referencias de UX
  que cita por su nombre — **vercel.com** es la suya para el comportamiento del scroll y del chrome
  del navegador. Cuando diga «no es tan suave como X», merece la pena mirar qué hace X exactamente.

---

## 2. Cómo se le reporta

### Corto por defecto, porque dirige desde el móvil

El 2026-08-17 lo pidió con estas palabras: *«resúmeme un poco porfa, estoy desde el móvil y leer
textos un poco más largos se hace tedioso».*

Los informes largos —tablas de mediciones, bloques de código, secciones— se leen bien en una
terminal de escritorio y son **ilegibles en una pantalla de móvil**. Y buena parte de este
proyecto se dirige desde ahí: es Mario quien prueba las previews en su iPhone.

Por defecto: **lo hecho, lo que decide Mario, y la pregunta.** Nada de repetir el detalle que ya
está en el commit o en `docs/`. **El sitio del detalle es el repositorio, no el chat** — y eso ya
lo exige el `CLAUDE.md`. Si hay que enseñar mediciones o comparar opciones, un artifact o una
captura antes que un muro de texto. Se puede volver al formato largo cuando vuelva al escritorio
o lo pida.

### Progreso visible primero, no cimientos primero

Mario juzga el avance por **lo que ve al abrir el navegador**, no por tareas cerradas ni líneas
escritas. En la fase de divergencia de layout el plan se ordenó por dependencias técnicas —lógica
pura → fontanería → layouts— y pasaron **2 h 30 sin nada que mirar**. Su reacción fue justa:
*«abro el localhost y veo la web IGUAL»*.

Un plan correcto en el papel puede ser inservible para trabajar con alguien: si no puede ver
progreso, no puede corregir el rumbo. Y en mobile-first hay una trampa añadida — el trabajo puede
estar hecho y ser **invisible en una ventana ancha**.

- Ordenar por **impacto visible**, aunque obligue a un andamio temporal. Los cimientos van después
  o en paralelo.
- Decir siempre **dónde mirarlo**: URL, puerto y ancho de ventana. Si algo solo se ve a 390px,
  decirlo antes de que lo pregunte.
- **No prometer velocidad que no se va a cumplir.** Se le ofreció la ejecución con subagentes
  diciendo que «va más rápido»: es **~5× más lenta** que la ejecución directa, porque cada
  subagente arranca en frío. Sí encontró 6 defectos reales (4 del propio plan), o sea que el valor
  está en la minuciosidad, no en el ritmo — venderla por lo que es.

### Cuando pregunta algo, responder antes de seguir ejecutando

Preguntó qué faltaba y el agente se puso a trabajar; tuvo que interrumpir dos veces. La pregunta
va primero.

---

## 3. Cuando describe una sensación, es un dato — no una impresión

Esta es la regla que más tiempo ahorra, y la más fácil de incumplir sin darse cuenta.

El 2026-07-31 Mario reportó tres cosas en lenguaje natural y **las tres eran reales y medibles**:

| Lo que dijo | Lo que era, medido |
|---|---|
| «un micro corte» | 385–459 ms de desfase entre que el telón descubría cada texto y que el texto aparecía |
| «la Home pega un salto, me parece que es justo el trozo de la topbar» | 62 px exactos, el alto de la barra al pasar a `fixed` |
| «los elementos se ven según baja la cortina» | estaban puestos 73 ms antes de ser descubiertos |

**Su localización del problema suele ser correcta.** Se toma como hipótesis de partida y se busca
la medición que la confirme o la descarte. Nunca se relativiza.

**Y cuando un dato suyo refuta la hipótesis del agente, sospechar primero del método de medición.**
El 2026-08-01, «sigue por toda la Home, esté arriba o abajo» parecía descartar la portada como
causa. En realidad delataba que las dos tandas de medición se habían hecho a `scrollY 0`. Al medir
a cuatro alturas, la portada **era** la culpable, y además apareció un desbordamiento lateral de
138 px que se había dado por limpio dos veces por lo mismo. Su dato acotaba el problema; lo que
fallaba era la ventana de observación. Detalle de método en `metodo.md`.

---

## 4. Lo que no se hace

- **No inventar contenido.** Ni cartas, ni horarios, ni datos del local, ni resultados sin
  comprobar. Donde falta material se deja el hueco marcado y se dice que falta. Nada inventado
  llega a producción sin que el restaurante lo confirme.
- **No cruzar las dos marcas.** Cokima y Los Ochoa son identidades separadas y su vocabulario no
  se importa de una a otra. «Madriz» y «como los de la abuela» son de **Los Ochoa**; «Kitchen
  Madness», «compartir y desfasar» y «los minutejos» son de **Cokima**. (Mario llegó a atribuir
  las castizas a Cokima por error y se corrigió: la separación se sostiene aunque él se despiste.)
- **No mezclar proyectos en la documentación.** Mario lleva varios proyectos y menciona unos
  mientras se trabaja en otro: **eso es contexto para orientar al agente, no material que deba
  acabar escrito aquí.** Su corrección literal el 2026-08-04: *«te lo decía a ti a modo de
  indicación, no quiero mezclar conceptos o repositorios en la documentación»*. Al ir a limpiarlo
  aparecieron seis menciones cruzadas de dos sesiones distintas, o sea que no fue un desliz suelto.
  Cuando un hallazgo de aquí sirva fuera, **se describe la condición que lo provoca, no el
  proyecto**: «le pasa a cualquier web con `<ClientRouter />`», no «le pasa a la web X».
- **No resolver por cuenta propia lo que ha pedido como guía de trabajo.** Pidió rejillas grises
  visibles sobre los huecos de foto; el agente argumentó que en producción parecen obra inacabada
  y propuso marcadores con marca. Su respuesta: *«Hazme caso, pon las rejillas. Te lo pido a modo
  de guía, no a que se quede ahí y "ya veremos". A producción saldrá completamente pulido, no lo
  dejaré pasar.»* Necesita ver la maqueta para decidir dónde van las imágenes: es su forma de
  trabajar el diseño, no una decisión de producto. (Y su objeción quedó cubierta por código:
  `showPhotoGuides()` de `packages/config` las apaga con `SITE_URL` o `VERCEL_ENV=production`, así
  que no depende de que nadie se acuerde. Ver `fotografia.md`.)

---

## 5. Lo que está delegado y no hay que volver a preguntar

Mario delega criterio con frecuencia, y cuando lo hace lo dice. Lo ya delegado y cerrado:

- **La tipografía de Ochoa** — quedó en **Archivo** (Omnibus-Type), variable en peso y en ancho.
  Cerrado el 2026-07-29, no se reabre.
- **El comportamiento del menú full-screen** y el sistema de movimiento — criterio delegado, con
  el encargo de que «se note profesional». Las reglas resultantes están en `movimiento.md` y son
  vinculantes.
- **La nomenclatura de la carta de Ochoa** — confirmada con el restaurante: **«Ración» y «½
  Ración», nunca «Tapa»**. No hay que volver a preguntarlo.

Lo que **no** está delegado y es conversación con Mario: qué va debajo de la entrada de Cokima, el
contenido y los copys de las páginas nuevas, y si una rama `tmp/*` se fusiona o se descarta.

---

## 6. Cómo decide lo visual

Describir el movimiento no sirve: se juzga viéndolo. El método que funciona —bocetos comparables
en un artifact, con su tipografía y sus tiempos reales— está en **`metodo.md` §1**, porque es
técnica y no perfil.

---

Ver también: `../CLAUDE.md` (manda sobre todo), `estado.md` (el punto de entrada),
`../.impeccable.md` (para quién es cada web), `metodo.md` (cómo se decide y cómo se verifica) y
`recursos.md` (los identificadores que cuesta recuperar).
