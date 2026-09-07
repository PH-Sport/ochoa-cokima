# Estado — divergencia de layout

> **Estado: cerrado** · registro histórico, no se actualiza · índice en `README.md`

- **Fecha de corte:** 2026-07-27
- **Rama:** `feat/divergencia-layout` (18 commits sobre `main`, base `c981387`)
- **Spec:** `docs/superpowers/specs/2026-07-27-divergencia-layout-design.md`
- **Plan:** `docs/superpowers/plans/2026-07-27-divergencia-layout.md`

**Ejecutadas las 12 tareas del plan. Nada está mergeado a `main`.**

`pnpm test` → 37 tests (26 en `@tombo/content`, 6 en `@tombo/tracking`, 5 en `@tombo/config`).
`pnpm build` → `Complete!` en las dos apps.

---

## 1. Qué se ve y dónde

Casi todo es **mobile-first y está oculto en escritorio a propósito**. En una ventana ancha la impresión sigue siendo que cambió poco; para verlo hay que estrechar a ~375px o usar el modo dispositivo.

| Construido | Dónde | Visible en escritorio |
|---|---|---|
| Carta "pizarra" de Ochoa + buscador | `/carta` y `/en/menu` de Ochoa | **Sí** |
| Carta "baraja" de Cokima | `/carta` y `/en/menu` de Cokima | **Sí**, como retícula de dos columnas desiguales |
| Home de Cokima reordenada | `/` y `/en/` de Cokima | **Sí** (los imprescindibles suben por encima del manifiesto) |
| Home de Ochoa pautada | `/` y `/en/` de Ochoa | **Sí** (filetes de cartel entre secciones) |
| Baraja con snap horizontal | cartas y home de Cokima | No: bajo 861px es carril con snap; encima, retícula |
| Barra inferior de Ochoa | todas las páginas de Ochoa | No: `display:none` >780px |
| Barra de reserva de Cokima | todas las páginas de Cokima | No: `display:none` >860px |
| Navegación sin recarga (View Transitions) | las dos webs | Sí |

Servidores: configuraciones `cokima` (4321) y `ochoa` (4322) de `.claude/launch.json`.

---

## 2. Lo hecho en esta tanda (tareas 8-12)

- **Task 9 — carta "baraja" de Cokima** (`MenuDeck.astro`). Tabs de sección pegajosas, carril horizontal con snap donde cada carta ocupa el 85% y asoman 56px de la siguiente, retícula asimétrica (1.15fr / 0.85fr) en escritorio. Se lee entera sin JavaScript: las tabs son anclas y el scroll es nativo; el JS solo marca la tab activa.
- **Task 11 — las dos homes.** Cokima: hero comprimido, la foto sube por delante de los botones y los imprescindibles pasan por encima del manifiesto. Ochoa: sin scroll lateral en ninguna parte —es lo que la separa de Cokima—, secciones pautadas con el mismo filete doble que ya abría el manifiesto, y densificación móvil.
- **Task 8 — buscador de Ochoa** (`search.ts`, 9 tests). "jamon" encuentra "jamón" y al revés.
- **Task 10 — filtro de alérgenos de Cokima.** Construido y **apagado**: `ALLERGEN_DATA_CONFIRMED = false`.
- **Task 12 — View Transitions, reduced-motion y limpieza.** `MenuSection.astro` y `DishRow.astro` eliminados de `packages/ui`.

### Las dos trampas del plan que quedaban, cerradas

- **Task 9 (`top: 66px`).** El plan daba un número inventado. Ahora el offset cuelga de `--t-header-h`, con los valores **medidos en navegador**: 67px por encima de 780px y 110.39px por debajo (no los 123px que decía la nota anterior), redondeado a 111px para que el borde no asome por subpíxel. `Nav.astro` lo reescribe en cliente con `ResizeObserver`, así que un idioma más largo o una pantalla estrecha no lo desajustan. Medido: 0px de desajuste en Ochoa, 0.61px de holgura en Cokima.
- **Task 12 (`astro:page-load`).** Los cinco componentes con estado pasan a `astro:after-swap`, que **no** dispara en la carga inicial. Verificado en navegador tras dos navegaciones y una vuelta atrás: una sola mutación por clic, una sola instancia de cada barra y el marcador de `window` sobrevive (no hay recarga).

### Defectos propios encontrados y corregidos durante la ejecución

- El `scroll-snap` de la baraja se comía el padding inicial: la primera carta quedaba pegada al borde de la pantalla mientras el título de sección respetaba los 20px. Faltaba `scroll-padding-inline`.
- El bloque `@media` del hero de Cokima quedó **antes** de las reglas base: misma especificidad, así que perdía la cascada y ni la foto bajaba a 3/2 ni el titular se reducía. Movido al final de la hoja.
- Con el buscador, la barra pegajosa de Ochoa pasaba de 71px a 125px (dos filas) y con la cabecera se comía 192px de los 812 del viewport. La leyenda del interruptor —redundante con los propios botones— se retira de la vista bajo 560px y sigue nombrando el grupo por `aria-labelledby`.

---

## 3. Decisiones pendientes de Mario

- **Filtro de alérgenos.** No se enciende hasta que el restaurante firme los datos. Un filtro "sin gluten" en el que una persona celíaca confía con datos orientativos es un problema de salud, no de UX. Va a la lista de pendientes del cliente junto a los accesos y los datos fiscales.
- **Color `--t-open` de Ochoa.** Sigue el verde oliva `#4c6b2f` que eligió un subagente por su cuenta. Contraste 5.0:1, correcto, pero **introduce una cuarta familia de color** fuera de papel/tinta/rojo y nadie de marca lo ha validado.
- **Altura de la cabecera de Cokima.** 110.39px medidos a 375px (13.6% de un viewport de 812px), permanente durante todo el scroll. El sector ronda el 8-10%. Sigue mereciendo una pasada de ajuste; ahora es barata, porque el offset de las tabs se recalcula solo.
- **Cromo pegajoso de la carta de Ochoa.** Cabecera 67 + interruptor 71 + barra inferior 85 = 223px de 812 (27%) ocupados de forma permanente en `/carta`. Es la consecuencia de tener a la vez filtro pegajoso y barra inferior; se puede aligerar, pero es una decisión de diseño.
- **Fragilidad menor en `formatEuro`.** Decide "¿hay céntimos?" y formatea por dos rutas de redondeo distintas. Verificados 200.000 valores sin desajuste: **no es un fallo activo** con precios literales del JSON. Se rompería si algún día un precio se calculara.

---

## 4. Limitación de entorno y qué falta comprobar a ojo

Ningún panel de navegador de la sesión de agente **compone frames**: no hay captura de pantalla, `IntersectionObserver`, `ResizeObserver` y `requestAnimationFrame` no disparan nunca y `window.scrollTo` no mueve la página. Sí funcionan `element.click()`, la medición estática y `fetch` contra el HTML servido — que es como se ha verificado todo lo de arriba.

**Pendiente de comprobación humana en un navegador real** (razonado y medido por código, no observado en movimiento):

- La revelación de la barra de reserva de Cokima al pasar el hero.
- El **gesto** del snap horizontal de la baraja (que la carta encaje al soltar el dedo). Las medidas —85% de ancho, 56px asomando, `scrollLeft` naciendo en 0— sí están comprobadas.
- El marcado de la tab activa al hacer scroll, que depende de `IntersectionObserver`.
- La animación de las View Transitions. Que la navegación **no recarga** sí está comprobado.
- El ritmo de scroll de las dos homes.

## 5. Nota de entorno

El servidor de desarrollo de Ochoa que había levantado de una sesión anterior servía un grafo de módulos obsoleto tras añadirse `search.ts`: los scripts que importaban `@tombo/content` fallaban al cargar mientras el resto funcionaba. Se reinició. Si algo se comporta raro en local sin explicación, reiniciar el `astro dev` es lo primero que hay que probar.
