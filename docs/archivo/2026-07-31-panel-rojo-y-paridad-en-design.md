# La plancha roja del menú, el relieve de las fichas y la paridad del inglés

> **Estado: cerrado** · registro histórico, no se actualiza · índice en `README.md`

- **Fecha:** 2026-07-31
- **Marca:** Los Ochoa. **Cokima no se toca.**
- **Acordado con Mario** en la sesión del 31, sobre la captura del panel abierto.

---

## 1. El problema

El menú desplegado es hoy el único sitio de Ochoa donde la marca se rompe. La barra es una
plancha de rótulo roja y justo debajo aparece un folio blanco: se ve una división horizontal
que parte la pantalla en dos materiales distintos. Mario lo señaló con una captura — «para
evitar esta división, y que el collapse fluya con el resto de la web».

Arrastra dos problemas más, que se resuelven en la misma tanda:

- **Las fichas «Llamar» e «Instagram» no tienen relieve** dentro del panel. Se lo quitó el
  modificador `compacto` (`Contacto.astro:124`) con un argumento razonable en su momento —sobre
  papel blanco, dos cajas levantadas pesaban más que los tres nombres de sección—. Sobre rojo ese
  argumento se cae: ahí necesitan ser blancas y con sombra dura para leerse.
- **La web en inglés está atrasada respecto a la española.** Ya estaba fichado en
  `docs/estado.md` §0.2.

## 2. Principio de la solución

**No se inventa ningún recurso visual nuevo.** La casa ya tiene la fórmula: el titular de la
portada, sobre foto, deja de ser rojo-con-sombra-tinta y pasa a papel-con-sombra-roja
(`Hero.astro:123`). Sobre rojo toca la otra inversión de la misma regla: **papel con sombra
tinta**. Es lo que hace el rótulo real del bar.

Y el mecanismo para adaptar las piezas neutras que caen dentro ya existe: `.copy` en la portada
reescribe los tokens `--t-*` que consumen sus hijos en vez de parchearlos desde fuera
(`Hero.astro:106`). El panel hace lo mismo.

---

## 3. La plancha continua

`.panel` pasa de `var(--paper)` a `var(--rojo)`.

El panel es `position: fixed; inset: 0` con `padding-top: var(--t-header-h)`, así que su fondo
**ya llega por detrás de la barra**. Basta con apagar el filete de la barra mientras el menú está
abierto para que las dos piezas se suelden sin que nada se mueva de sitio:

```css
:global(html.menu-open) .nav { border-bottom-color: transparent; }
```

Tres restricciones que hay que respetar aquí:

1. **`border-bottom-color: transparent`, nunca `border: 0`.** `syncHeaderHeight()` mide el alto
   real de la barra con `getBoundingClientRect()`, que incluye el borde, y publica
   `--t-header-h` (`menu-overlay.ts:128`). Quitar el borde encogería la barra 2px y movería el
   relleno del panel y el offset del interruptor de la carta.
2. **La vuelta del filete necesita transición.** `close()` retira la clase `menu-open` de
   inmediato (`menu-overlay.ts:85`), mientras la persiana aún tarda `--dur-out` en recogerse. Sin
   transición en `border-bottom-color`, la línea negra reaparece de golpe sobre el rojo que se
   está retirando. Con `transition: border-bottom-color var(--dur-out) var(--ease)` las dos cosas
   terminan a la vez.
3. **La persiana arranca en `--t-header-h`, no en `0`.** El recorte actual
   `clip-path: inset(0 0 100% 0)` gasta los primeros 62px del barrido por detrás de la barra,
   donde no se ve. Pasa a `inset(var(--t-header-h) 0 100% 0)` en cerrado y
   `inset(var(--t-header-h) 0 0 0)` en abierto: la plancha empieza a caer justo en el borde de la
   barra y la cascada se lee entera.

**Efecto colateral que juega a favor:** hoy la persiana baja blanca sobre contenido blanco y es
casi invisible; en rojo se verá caer sobre la página. El «efecto en cascada más fundido» que pide
Mario sale de ahí, sin añadir un solo milisegundo de animación nueva. El sistema de movimiento
sigue siendo el mismo (`--ease`, `--dur-in`, `--dur-out`, `--shift`, `--stagger`).

## 4. La tipografía invertida

| Pieza | Hoy | Pasa a | Motivo |
|---|---|---|---|
| `.panel-links a` | `--ink`, sin sombra | `--paper` + `text-shadow: 0.045em 0.05em 0 var(--ink)` | La `.cartel` invertida. 5,7:1 de contraste, AA para texto normal |
| `.idx` (`01/02/03`) | `--rojo` | `--ink` | En rojo sería invisible. Es el único elemento oscuro y hace de contrapunto |
| `.lbl:hover` / `:focus-visible` | pasa a `--rojo` | pasa a `--ink` y pierde la sombra | El rojo sobre rojo no se ve. Cambio nítido, sin movimiento |
| `a:focus-visible` (outline) | `--rojo` | `--paper` | Ídem. El foco tiene que verse: lo recibe el primer enlace al abrir (`menu-overlay.ts:72`) |
| `.panel-foot` (borde superior) | `2px solid var(--ink)` | `2px solid var(--paper)` | Sigue ordenando el pie sin partir el color |
| `.addr`, `.lang`, `.lang b` | `--ink-dim` / `--ink` | tokens del panel (ver §5) | — |

**Sobre el `.idx` en tinta:** 3,04:1 contra el rojo. No alcanza el 4,5:1 de texto, pero el
elemento es `aria-hidden="true"` y puramente ordinal —el nombre de sección lleva toda la
información—, así que le aplica el 3:1 de WCAG 1.4.11 (componentes no textuales), que cumple.
Queda anotado por si en la revisión visual conviene subirlo a papel.

## 5. Los tokens reescritos dentro del panel

```css
.panel {
  --t-text: var(--paper);
  --t-text-dim: rgba(255, 255, 255, 0.9);
  --t-text-faint: rgba(255, 255, 255, 0.62);
  --t-open: var(--paper);
}
```

`--t-open` es el que arregla un fallo que hoy no se ve porque el fondo es blanco: el punto de
«Abierto ahora» de `OpenState` cae a `var(--t-accent)` cuando nadie declara `--t-open`
(`OpenState.astro:81`), y `--t-accent` es el rojo de la marca. Sobre el panel rojo, el punto
desaparecería. Se resuelve declarándolo aquí, dentro del panel, sin que `packages/ui` sepa nada.

## 6. Las fichas «Llamar» e «Instagram»

El modificador `compacto` deja de significar «sin relieve» y pasa a significar «sobre rojo».
Recupera el relieve de las de la portada —fondo `--paper`, borde `1.5px solid var(--ink)`,
`box-shadow: 3px 3px 0 var(--ink)`, radio `--r-caja`— y cambia solo lo que el fondo rojo obliga:

- **El hover deja de virar a rojo.** Sobre el panel, `color: var(--rojo)` y
  `box-shadow: 2px 2px 0 var(--rojo)` se pierden contra el fondo. Dentro del panel el hover
  mantiene la tinta y solo acorta la sombra a 2px con el `translate(1px, 1px)` de siempre.
- **La `.etq` («LLAMAR», «INSTAGRAM») se queda roja**: vive dentro de la ficha blanca, donde el
  rojo sigue leyéndose y es el que ata la pieza a la marca.
- **No hace falta tocar JavaScript.** `Base.astro:65` ya engancha `.contacto a` al sistema de
  tacto, y `--tacto-sombra` cae por defecto a `--ink`, que es justo la sombra en reposo aquí.

## 7. La paridad del inglés

### 7.1 La home (`apps/ochoa/src/pages/en/index.astro`)

Igualarla con la española. Le faltan, en el orden de la hoja:

1. `<Ticker locale="en" />` entre la tira de platos y el manifiesto.
2. La sección **«la tasca»** («The tasca»): foto apaisada con realce rojo, titular, texto y el
   botón fantasma a la carta.
3. La sección **«la casa»** («The house»): la etiqueta, el titular partido en dos tramos con la
   foto del cristal en medio —un solo `<h2>` para que siga siendo una frase seguida a oído—, el
   texto y el muro de tres fotos con el desfase y los dos realces rojos en esquinas opuestas.
4. El mapa: fuera el `.mapbox` de pega («Map · integration pending»), dentro `<Mapa locale="en" />`
   y `<Contacto locale="en" />`, con la misma retícula `.visit-grid` de la española.

Los textos son **traducción del contenido español existente**, no material nuevo. Los `alt` de
las cuatro fotos se traducen también.

De paso mueren dos cosas en ese archivo:

- **`border-radius: 6px` del `.mapbox`**: un número suelto que se salta la escala de curvatura
  (`--r-chapa` / `--r-btn` / `--r-caja` / `--r-marco`). Se va con la pieza.
- **CSS muerto**: `.hero`, `.hero-photo` y `.kicker` en el `@media` del final son de una portada
  que ya no existe.

### 7.2 La nota de la carta (`apps/ochoa/src/pages/en/menu.astro`)

Dice «Menu from September 2025, the latest published — pending confirmation by the restaurant» y
ya no es verdad: la carta se actualizó el 31 con la que mandó el equipo. Se alinea con la
española, que dice julio de 2026 y que la carta de bebidas no se publica.

La carta en sí **no se toca**: 49 platos, mismos `id` que la española, verificado. Sigue esperando
el visto bueno del restaurante, que es de Mario y no de código.

### 7.3 Las legales se quedan en español, pero sin mentir

Decisión de Mario: el texto legal válido en España es el español, y traducir un documento
jurídico sin que nadie lo valide es un riesgo que no compensa. Lo que sí se arregla:

- **El pie en inglés promete algo que no cumple.** `Footer.astro:14-16` dice «Legal notice» y
  «Privacy» y lleva a páginas en español. Pasa a marcarlo: «Legal notice (ES)», «Privacy (ES)»,
  «Cookies (ES)».
- **El `hreflang` de esas tres páginas declara una equivalencia falsa.** Las tres pasan
  `altPath="/en/"`, y `Seo.astro:44-46` emite siempre el par de `alternate`: hoy le está diciendo
  a Google que la versión inglesa del aviso legal es la home inglesa. No hay reciprocidad —la home
  inglesa declara `/` como su alternativa—, así que es un emparejamiento roto.

  **Arreglo:** `altPath` pasa a opcional en `Seo.astro`; sin él no se emiten los dos `alternate` y
  el `x-default` cae al canónico. `Base.astro` gana una prop opcional `altSeoPath?: string | null`
  que por defecto vale `altPath`; las tres legales pasan `altSeoPath={null}`. El selector ES·EN
  del panel sigue funcionando y llevando a la home inglesa, porque eso es navegación de usuario y
  es lo único que hay — cosa distinta de declarar equivalencia para un buscador.

---

## 8. Fuera de alcance

- **Cokima.** Su panel tiene su propia piel y su propia identidad.
- **`packages/ui/src/menu-overlay.ts`.** El comportamiento es compartido y correcto; todo lo de
  esta tanda es piel de Ochoa. La única excepción es `Seo.astro`, y el cambio ahí es neutro
  (hacer opcional una prop), sin una sola decisión de marca.
- **Traducir las legales.** Decidido en §7.3.
- **Las páginas nuevas** (punto 6 de la fase 4): siguen bloqueadas por contenido.

## 9. Verificación

No se da nada por bueno leyendo el código — la caché de Vite miente y ya ha costado tiempo antes.
Con la web levantada, en el navegador:

1. **La costura.** Abrir el menú y comprobar que no hay ninguna línea horizontal entre barra y
   panel, midiendo el color de los píxeles a ambos lados del borde.
2. **La vuelta del filete.** Cerrar y confirmar que la línea negra no parpadea sobre el rojo que
   se recoge.
3. **El alto de la barra.** `--t-header-h` sigue valiendo 62px con el menú abierto.
4. **Legibilidad real:** los tres nombres, los tres números, el estado de apertura con su punto,
   el ES·EN, la dirección y las dos fichas — todos visibles sobre el rojo.
5. **El relieve de las fichas:** que se hunden al tocarlas y vuelven, como los de la portada.
6. **La home inglesa a la altura de la española**, sección por sección.
7. `pnpm build` de las dos apps en verde y los 45 tests pasando.
