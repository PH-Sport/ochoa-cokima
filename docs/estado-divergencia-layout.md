# Estado — divergencia de layout

- **Fecha de corte:** 2026-07-27
- **Rama:** `feat/divergencia-layout` (12 commits sobre `main`, base `c981387`, HEAD `69a52d6`)
- **Spec:** `docs/superpowers/specs/2026-07-27-divergencia-layout-design.md`
- **Plan:** `docs/superpowers/plans/2026-07-27-divergencia-layout.md`

Ejecutadas 7 de las 12 tareas del plan. **Nada está mergeado a `main`.**

---

## 1. Qué se ve y qué no, ahora mismo

Casi todo lo construido es **mobile-first y está oculto en escritorio a propósito**. Si se abre en una ventana ancha, la impresión es que no ha cambiado nada. Para verlo hay que estrechar a ~375px o usar el modo dispositivo del navegador.

| Construido | Dónde | Visible en escritorio |
|---|---|---|
| Carta "pizarra" de Ochoa | `localhost:4322/carta` y `/en/menu` | **Sí, a cualquier ancho** |
| Barra inferior de Ochoa (`Carta · Reservar · Llegar`) | todas las páginas de Ochoa | No: `display:none` >780px |
| Barra de reserva de Cokima | todas las páginas de Cokima | No: `display:none` >860px |
| Navegación móvil de Cokima (arreglo) | todas las páginas de Cokima | No: solo cambia <780px |
| Badge "Abierto ahora · hasta las 00:00" | dentro de las dos barras | No: hereda la ocultación |

Servidores de desarrollo: `pnpm --filter cokima dev --port 4321`, `pnpm --filter ochoa dev --port 4322` (o las configuraciones `cokima` / `ochoa` de `.claude/launch.json`).

**Las dos homes y la carta de Cokima siguen exactamente como estaban.** Son las que hacen que las dos webs se parezcan, y son las que faltan.

---

## 2. Hecho (tareas 1-7)

Cada tarea pasó por implementación, revisión independiente, corrección y re-revisión.

1. **Estado de apertura** (`packages/content/src/hours.ts`, 8 tests). `getOpenState(hours, now)` parsea el `openingHours` en formato schema.org que ya existía en cada `site.ts` — misma fuente que el JSON-LD, sin dato duplicado. Anclado a `Europe/Madrid`. Resuelve los dos casos difíciles reales: el viernes de Ochoa (`Fr 09:00-02:30`) cruza a sábado, y el `Mo-Su 09:00-00:00` de Cokima cierra a **fin** de día.
2. **`OpenState.astro`** (`packages/ui`). Sin marca. Se resuelve en cliente y **no pinta nada** hasta resolver: las páginas son estáticas y cacheadas, así que no puede afirmar "abierto" sin comprobarlo.
3. **Navegación móvil de Cokima.** Antes los enlaces se ocultaban bajo 780px sin nada que los sustituyera. Ahora son visibles, con área táctil real de 45px. El selector ES/EN queda visible en todos los breakpoints.
4. **Barra inferior de Ochoa.** Hace de navegación móvil. Su altura real se mide en cliente con `ResizeObserver` y se escribe en la variable que gobierna el `padding-bottom` del `body`.
5. **Barra de reserva de Cokima.** Aparece al superar el hero y **permanece** (pestillo de un solo sentido). En páginas sin hero (`/carta`, `/reservas`) se muestra desde la carga.
6. **Precios ½/entera** (`packages/content/src/portions.ts`, 5 tests). `formatPortionPrice` y `formatEuro`.
7. **Carta "pizarra" de Ochoa** (`MenuBoard.astro`). Columna densa, fila `nombre · puntos · precio`, interruptor global ½/entera pegajoso que reescribe los 23 precios, aviso "solo ración entera" en los 11 platos sin media, y región `aria-live` que anuncia el cambio. **Se lee completa sin JavaScript.** Contenido verificado plato a plato contra `menu-es.json` y `menu-en.json`: 25/25 intactos en ambos idiomas.

Tests: `pnpm test` → 17 en `@tombo/content`, 6 en `@tombo/tracking`. `pnpm build` compila las dos apps.

---

## 3. Lo que falta (5 tareas)

**Orden recomendado, reordenado respecto al plan original**, que iba por dependencias técnicas y dejaba todo lo visible para el final:

| # | Tarea del plan | Qué aporta |
|---|---|---|
| 1.º | **Task 9 — carta "baraja" de Cokima** | Tabs de sección pegajosas y platos con snap horizontal. Es la pieza gemela de la pizarra; sin ella las dos cartas siguen sin diferenciarse |
| 2.º | **Task 11 — las dos homes** | Escaparate lateral en Cokima (comida antes del pliegue, recorrido horizontal) y hoja de bar en Ochoa (vertical, densa, reglas de cartel). **Es el grueso de lo que se pidió** |
| 3.º | **Task 8 — buscador de Ochoa** | Filtro por nombre insensible a acentos ("jamon" encuentra "jamón") |
| 4.º | **Task 10 — filtro de alérgenos de Cokima** | Se construye **apagado**. Ver §5 |
| 5.º | **Task 12 — View Transitions y limpieza** | Navegación sin recarga y retirada de `MenuSection`/`DishRow` compartidos |

---

## 4. Trampas conocidas en el plan — leer antes de ejecutar las que faltan

**El archivo del plan conserva su código de ejemplo original, y ese código tiene defectos ya demostrados.** Durante la ejecución de las tareas 1-7 aparecieron seis, cuatro de ellos en el propio plan. No transcribir el plan a ciegas.

Defectos ya corregidos en el código (no reintroducirlos):

- El CSS ponía `flex-wrap` en `.nav-in`, pero `.nav-links` colgaba de `.nav-right`. Resultado medido: selector de idioma partido en tres líneas y cabecera al doble de alto.
- La barra de reserva era un interruptor bidireccional y se escondía al volver arriba, cuando el requisito era que permaneciera.
- `rootMargin: "-40%"` revelaba la barra con el 40% del hero todavía visible.
- `--t-bottom-bar-h: 104px` / `72px` eran números inventados que no correspondían con ninguna altura real.
- Un color literal `#3f9d5a` dentro de `packages/ui`, violando la regla de oro de que el paquete compartido no lleva color de marca.
- Ordenar por `order` global intercalaba los postres entre los platos salados, porque `order` es correlativo **por sección**.

Defectos del plan que **siguen sin corregir** y afectan a las tareas pendientes:

- **Task 9:** el `top: 66px` de las tabs pegajosas es el mismo error de 1px ya visto en Ochoa — la cabecera mide 67px de caja real (66 + `border-bottom`). Y en Cokima la cabecera móvil mide ahora ~123px, así que el valor tendrá que ser distinto por breakpoint.
- **Task 12:** el patrón `mount()` + `addEventListener("astro:page-load", mount)` que usan **todos** los componentes duplicará observers en la carga inicial en cuanto se active `ClientRouter`, porque `astro:page-load` también dispara en el primer load. Arreglarlo de una vez en esa tarea, en `OpenState`, `BottomBar`, `ReserveBar`, `MenuBoard` y `MenuDeck`.

---

## 5. Decisiones pendientes de Mario

- **Filtro de alérgenos (Task 10).** Se construirá tras la bandera `ALLERGEN_DATA_CONFIRMED = false` y **no se enciende** hasta que el restaurante firme los datos. Hoy están marcados como orientativos, y un filtro "sin gluten" en el que una persona celíaca confía con datos sin confirmar es un problema de salud, no de UX. Va a la lista de pendientes del cliente junto a los accesos y los datos fiscales.
- **Color `--t-open` de Ochoa.** Un subagente eligió por su cuenta `#4c6b2f`, un verde oliva, para el punto de "abierto". Contraste 5.0:1 sobre el papel, correcto, pero **introduce una cuarta familia de color** fuera de papel/tinta/rojo y nadie de marca lo ha validado. Cambiarlo es trivial.
- **Altura de la cabecera sticky de Cokima.** Ocupa 123px = 15.2% de un viewport de 812px, permanente durante todo el scroll. Las cabeceras del sector rondan el 8-10%. Choca con el objetivo declarado de ver comida antes del pliegue. Merece una pasada de ajuste.
- **Fragilidad menor en `formatEuro`.** Decide "¿hay céntimos?" y formatea por dos rutas de redondeo distintas. Verificados 200.000 valores sin desajuste, así que **no es un fallo activo** con los precios actuales, que vienen literales del JSON. Se rompería si algún día un precio se calculara (IVA, descuento). Arreglo propuesto: derivar ambas decisiones de un único `toFixed(2)`.

---

## 6. Limitación de entorno que condiciona la verificación

Ningún panel de navegador disponible en la sesión de agente **compone frames**: `document.hidden` es `true`, el timeline está congelado, `window.scrollTo` no mueve la página y, en consecuencia, **`IntersectionObserver`, `ResizeObserver` y `requestAnimationFrame` no disparan nunca**. Los clics por coordenadas tampoco alcanzan a los listeners.

Sí funcionan: `element.click()`, la medición estática (`getComputedStyle`, `getBoundingClientRect`) y `curl`/fetch contra el HTML servido.

**Pendiente de comprobación humana en un navegador real** (razonado por código, no observado):

- La revelación de la barra de reserva de Cokima al pasar el hero.
- El snap horizontal de la carta baraja, cuando exista (Task 9).
- El ritmo de scroll de las dos homes, cuando existan (Task 11).

---

## 7. Nota de proceso

Las tareas 1-7 se ejecutaron con un subagente por tarea más revisión independiente, corrección y re-revisión: 20 subagentes y unas 2h30 de reloj. El proceso encontró seis defectos reales que una pasada directa probablemente no habría cazado, pero **es del orden de cinco veces más lento** que implementar directamente, porque cada subagente arranca en frío y reconstruye su contexto entero.

Para las cinco tareas restantes se acordó valorar ejecución directa con una sola revisión amplia al final.
