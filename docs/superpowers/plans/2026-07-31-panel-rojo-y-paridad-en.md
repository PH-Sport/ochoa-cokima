# La plancha roja del menú y la paridad del inglés — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this
> plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Que el menú desplegado de Los Ochoa sea una sola plancha roja continua con la barra, que
las fichas de contacto recuperen el relieve de la casa, y que la web en inglés deje de ir por
detrás de la española.

**Architecture:** Todo el trabajo es piel de Ochoa (`apps/ochoa`), salvo un cambio neutro en
`Seo.astro` para que `altPath` pueda faltar. No se inventa ningún recurso visual: el panel invierte
la fórmula del rótulo (papel con sombra tinta) igual que la portada la invierte sobre foto, y
reescribe dentro de sí los tokens `--t-*` que consumen las piezas neutras, en vez de parchearlas
desde fuera.

**Tech Stack:** Astro 6 estático, CSS con tokens `--t-*` por marca, Vitest para la lógica pura en
`packages/*`, Playwright MCP para la verificación visual.

**Spec:** `docs/superpowers/specs/2026-07-31-panel-rojo-y-paridad-en-design.md`

## Global Constraints

- **Cokima no se toca.** Ni sus tokens, ni su piel, ni su panel.
- **`packages/ui/src/menu-overlay.ts` no se toca.** El comportamiento compartido es correcto.
- **Ningún `border-radius` en píxeles dentro de un componente.** Solo `--r-chapa` (4px),
  `--r-btn` (7px), `--r-caja` (9px), `--r-marco` (12px). Si no encaja ninguno, se discute el
  escalón; no se inventa un número.
- **Ningún milisegundo suelto.** Todo el movimiento sale de `--ease`, `--dur-in` (420ms),
  `--dur-out` (160ms), `--dur-sube` (240ms), `--shift` (14px), `--stagger` (55ms).
- **Nada de rebote.** Envejece mal y delata plantilla.
- **Contenido real.** Los textos ingleses son traducción del español existente, nunca material
  inventado.
- **Verificación en el navegador, no en el código.** Toda afirmación sobre cómo se ve se sostiene
  en una medición a ~390px de ancho. La caché de Vite ha producido tanto falsos positivos como
  falsos negativos en este repo.
- **Commits en español, en minúscula, sin acentos en el asunto** (convención del repo), con el
  pie `Co-Authored-By` y `Claude-Session`.

## Nota sobre la forma de verificar

Este repo tiene 45 tests, todos de lógica pura en `packages/content` y `packages/tracking`
(horarios, destacados, porciones, esquema, atribución). **No hay infraestructura de test para
componentes Astro ni para CSS**, y montarla para esta tanda sería desproporcionado.

Así que las tareas de piel se cierran con **medición en el navegador** —posiciones, colores
computados y contrastes reales—, que es la verificación que corresponde a este dominio y la que
el proyecto exige. Las tareas que sí producen HTML verificable (la del `hreflang`) se cierran
comprobando la salida del build. Las de siempre (`pnpm test`, `pnpm build`) se corren al final.

**Levantar el servidor:** los `pnpm dev` lanzados en segundo plano se mueren solos en esta
máquina. Levantar en el mismo turno en que se usa, o construir y servir el estático.

---

### Task 1: La plancha continua

**Files:**
- Modify: `apps/ochoa/src/components/Nav.astro` — regla `.panel` (223-243) y bloque `.nav` (90-108)

**Interfaces:**
- Consumes: `--t-header-h`, que publica `menu-overlay.ts:128` midiendo el alto real de la barra.
- Produces: el panel en rojo, sobre el que se apoyan las tareas 2 y 3.

- [x] **Step 1: Apagar el filete de la barra mientras el menú está abierto**

En el bloque `.nav` de `Nav.astro`, añadir la transición, y al bloque `html.menu-open .nav` el
color transparente:

```css
  .nav {
    position: sticky;
    top: 0;
    z-index: 60;
    background: var(--rojo);
    border-bottom: 2px solid var(--ink);
    /* La vuelta del filete al cerrar necesita durar lo que dura la persiana en
       recogerse: `close()` retira la clase `menu-open` de golpe, así que sin
       esto la línea negra reaparece de un salto sobre el rojo que aún se está
       retirando. */
    transition: border-bottom-color var(--dur-out) var(--ease);
  }
  :global(html.menu-open) .nav {
    position: fixed;
    left: 0;
    right: 0;
    /* El panel es `fixed; inset: 0` con relleno superior, así que su rojo ya
       llega por detrás de la barra: apagando el filete, las dos piezas se
       sueldan sin que nada se mueva de sitio. Se transparenta el color y no se
       quita el borde, porque `syncHeaderHeight()` mide la barra con
       `getBoundingClientRect()` —el borde incluido— para publicar
       `--t-header-h`, y quitarlo encogería la barra dos píxeles. */
    border-bottom-color: transparent;
  }
```

- [x] **Step 2: Poner el panel en rojo y arrancar la persiana en el borde de la barra**

En la regla `.panel`, sustituir `background` y los dos `clip-path`:

```css
  .panel {
    position: fixed;
    inset: 0;
    z-index: 50;
    background: var(--rojo);
    padding-top: var(--t-header-h);
    overflow-y: auto;
    overscroll-behavior: contain;
    /* El recorte arranca donde acaba la barra y no en cero: los primeros 62px
       del barrido caían por detrás de ella, donde no se ven, y la persiana
       parecía tardar en salir. */
    clip-path: inset(var(--t-header-h) 0 100% 0);
    visibility: hidden;
    transition:
      clip-path var(--dur-out) var(--ease),
      visibility 0s linear var(--dur-out);
  }
  .panel[data-state="open"] {
    clip-path: inset(var(--t-header-h) 0 0 0);
    visibility: visible;
    transition:
      clip-path var(--dur-in) var(--ease),
      visibility 0s;
  }
```

- [x] **Step 3: Medir en el navegador que no queda costura**

Levantar `pnpm --filter ochoa dev`, abrir a 390px de ancho, pulsar «Menú» y evaluar:

```js
const nav = document.querySelector('.nav');
const r = nav.getBoundingClientRect();
const cs = getComputedStyle(nav);
({
  headerH: getComputedStyle(document.documentElement).getPropertyValue('--t-header-h'),
  altoBarra: r.height,                    // debe seguir siendo 62
  bordeAbierto: cs.borderBottomColor,     // debe ser transparente / alpha 0
  fondoPanel: getComputedStyle(document.querySelector('.panel')).backgroundColor,
})
```

Expected: `altoBarra` 62, `bordeAbierto` con alfa 0, `fondoPanel` `rgb(198, 34, 43)`.

- [x] **Step 4: Comprobar que al cerrar el filete no parpadea**

Cerrar el menú y capturar a los ~80ms (a mitad de la recogida). El borde debe estar volviendo
progresivamente, no puesto del todo. Confirmar a ojo en la captura que no hay un salto de línea
negra sobre el rojo.

- [x] **Step 5: Commit**

```bash
git add apps/ochoa/src/components/Nav.astro
git commit -m "feat(ochoa): el menu deja de ser un folio bajo un rotulo"
```

---

### Task 2: La tipografía invertida y los tokens del panel

**Files:**
- Modify: `apps/ochoa/src/components/Nav.astro` — `.panel-links a`, `.lbl`, `.idx`, `.panel-foot`,
  `.addr`, `.lang` y el bloque `.panel`

**Interfaces:**
- Consumes: el panel rojo de la tarea 1.
- Produces: los tokens `--t-text`, `--t-text-dim`, `--t-text-faint` y `--t-open` reescritos dentro
  de `.panel`, de los que cuelga `OpenState` y de los que colgará `Contacto` en la tarea 3.

- [x] **Step 1: Reescribir los tokens dentro del panel**

Añadir al final de la regla `.panel` (la misma que se tocó en la tarea 1):

```css
    /* Sobre el rojo, las piezas neutras que caen dentro se leen con los colores
       invertidos. Se les reescriben los tokens que consumen en vez de
       parchearlas desde fuera, igual que hace `.copy` en la portada: así
       cualquier pieza de @tombo/ui que se meta aquí mañana se adapta sola.
       `--t-open` es el que arregla un fallo que hoy no se ve: sin él, el punto
       de «Abierto ahora» cae al acento de la marca —este mismo rojo— y sobre
       el panel desaparecería. */
    --t-text: var(--paper);
    --t-text-dim: rgba(255, 255, 255, 0.9);
    --t-text-faint: rgba(255, 255, 255, 0.62);
    --t-open: var(--paper);
```

- [x] **Step 2: Invertir los nombres de sección y su respuesta**

Sustituir las reglas `.panel-links a`, `.lbl`, el hover y el foco:

```css
  .panel-links a {
    display: flex;
    width: fit-content;
    align-items: baseline;
    gap: 0.5ch;
    padding: clamp(10px, 2.4vh, 20px) 0;
    font-size: clamp(2.1rem, 10vw, 3.4rem);
    /* La misma fórmula del rótulo, invertida: sobre rojo, la tinta pasa a ser
       el papel y la sombra la pone la tinta. Es lo que ya hace el titular de la
       portada sobre la foto, con los papeles cambiados. */
    color: var(--paper);
    text-shadow: 0.045em 0.05em 0 var(--ink);
  }
  .lbl {
    transition:
      color var(--dur-out) var(--ease),
      text-shadow var(--dur-out) var(--ease);
  }
  /* Respuesta sin movimiento: el nombre baja a tinta y suelta la sombra, que es
     un cambio nítido y no una pirueta. En rojo no puede virar al rojo de la
     casa, que es lo que hacía cuando el panel era blanco. */
  .panel-links a:hover .lbl,
  .panel-links a:focus-visible .lbl {
    color: var(--ink);
    text-shadow: none;
  }
  .panel-links a:focus-visible {
    outline: 2px solid var(--paper);
    outline-offset: 4px;
  }
```

Nota: la sombra vive en el `<a>` y el color en `.lbl`, así que al pasar el ratón hay que apagar la
sombra desde `.lbl`. Como `.lbl` es hijo y no hereda `text-shadow` computado por separado, se le
declara la sombra a `.lbl` en reposo y se retira en hover. Ajustar así:

```css
  .panel-links a { color: var(--paper); text-shadow: none; }
  .lbl {
    text-shadow: 0.045em 0.05em 0 var(--ink);
    transition:
      color var(--dur-out) var(--ease),
      text-shadow var(--dur-out) var(--ease);
  }
```

- [x] **Step 3: El número y el pie**

```css
  .idx {
    font-family: var(--sans);
    font-size: var(--fs-label);
    font-weight: 700;
    font-stretch: var(--wd-rotulo);
    /* En rojo era invisible sobre el rojo. En tinta es el único elemento oscuro
       del panel y hace de contrapunto al nombre en papel. Es `aria-hidden` y
       puramente ordinal, así que le aplica el 3:1 de componente no textual,
       que cumple con holgura sobre este rojo. */
    color: var(--ink);
    letter-spacing: 0.06em;
  }
  .panel-foot {
    opacity: 0;
    transform: translateY(var(--shift));
    transition:
      opacity var(--dur-out) var(--ease),
      transform var(--dur-out) var(--ease);
    /* El filete sigue ordenando el pie, pero en papel: en tinta partía el color
       en dos, que es justo lo que se venía a quitar. */
    border-top: 2px solid var(--paper);
    padding-top: 16px;
    display: grid;
    gap: 10px;
  }
  .addr {
    margin: 0;
    font-size: var(--fs-micro);
    color: var(--t-text-dim);
  }
  .lang {
    font-family: var(--sans);
    font-size: 0.9rem;
    color: var(--t-text-dim);
  }
  .lang b {
    color: var(--paper);
    font-weight: 600;
  }
```

- [x] **Step 4: Medir la legibilidad real de todo lo que hay en el panel**

Con el menú abierto, a 390px:

```js
const leer = (sel) => {
  const el = document.querySelector(sel);
  if (!el) return `FALTA ${sel}`;
  const cs = getComputedStyle(el);
  const r = el.getBoundingClientRect();
  return { sel, color: cs.color, visible: r.height > 0 && cs.display !== 'none' };
};
[ '.panel-links a .lbl', '.idx', '.panel-foot .open-state .text',
  '.panel-foot .open-state .dot', '.lang', '.addr' ].map(leer);
```

Expected: los seis presentes y visibles; `.lbl` y `.lang` en blanco o casi; `.idx` en
`rgb(26, 26, 26)`. El `.dot` se comprueba por `backgroundColor`, que debe ser blanco y no
`rgb(198, 34, 43)`.

- [x] **Step 5: Captura del panel abierto para revisión visual**

Guardar una captura a 390px con el menú abierto. Es la que se le enseña a Mario.

- [x] **Step 6: Commit**

```bash
git add apps/ochoa/src/components/Nav.astro
git commit -m "feat(ochoa): el rotulo invertido dentro del menu"
```

---

### Task 3: El relieve de las fichas «Llamar» e «Instagram»

**Files:**
- Modify: `apps/ochoa/src/components/Contacto.astro:124-135` — el bloque `.compacto`

**Interfaces:**
- Consumes: el panel rojo (tarea 1) y sus tokens (tarea 2).
- Produces: nada que consuman tareas posteriores.

- [x] **Step 1: Cambiar lo que significa `compacto`**

Sustituir el bloque `.compacto` entero:

```css
  /* `compacto` ya no quiere decir «sin relieve», sino «sobre rojo». Cuando el
     panel era blanco, dos cajas levantadas pesaban más que los tres nombres de
     sección y por eso se les quitó la sombra; sobre el rojo pasa lo contrario:
     sin relieve y sin fondo se pierden. Así que conservan el de la portada —el
     mismo que ya tiene «Reservar» en la barra— y solo cambia lo que el fondo
     rojo obliga: el hover deja de virar al rojo de la casa, que ahí no se ve, y
     se queda en acortar la sombra. */
  .compacto a:hover {
    color: var(--ink);
    border-color: var(--ink);
    box-shadow: 2px 2px 0 var(--ink);
    transform: translate(1px, 1px);
  }
  .compacto a:active {
    box-shadow: 0 0 0 var(--ink);
    transform: translate(3px, 3px);
  }
```

Al borrar las reglas que ponían `box-shadow: none` y `border-color: var(--line)`, las fichas
heredan de `.contacto a` el fondo papel, el borde de tinta de 1.5px, la sombra `3px 3px 0` y el
radio `--r-caja`. No hay que repetir ninguno.

- [x] **Step 2: Comprobar que el relieve está y que el tacto engancha**

Con el menú abierto:

```js
const a = document.querySelector('.panel .contacto a');
const cs = getComputedStyle(a);
({
  sombra: cs.boxShadow,           // 3px 3px con tinta
  fondo: cs.backgroundColor,      // blanco
  radio: cs.borderRadius,         // 9px = --r-caja
  tacto: a.dataset.tacto !== undefined, // true: Base.astro ya lo engancha
})
```

Expected: sombra de 3px en `rgb(26, 26, 26)`, fondo `rgb(255, 255, 255)`, radio `9px`, `tacto`
`true`. **No hay que tocar JavaScript**: `Base.astro:65` ya incluye `.contacto a` en `PIEZAS`.

- [x] **Step 3: Comprobar el hundido**

Disparar `pointerdown` sobre la ficha y confirmar que gana la clase `tocando` y que su
`transform` deja de ser `none`; soltar y confirmar que vuelve.

- [x] **Step 4: Commit**

```bash
git add apps/ochoa/src/components/Contacto.astro
git commit -m "fix(ochoa): las fichas del menu se hunden como las de la portada"
```

---

### Task 4: El `hreflang` de las legales deja de mentir

**Files:**
- Modify: `packages/ui/src/Seo.astro` — `altPath` pasa a opcional
- Modify: `apps/ochoa/src/layouts/Base.astro:11-19` — nueva prop `altSeoPath`
- Modify: `apps/ochoa/src/pages/aviso-legal.astro`, `privacidad.astro`, `cookies.astro`
- Modify: `apps/ochoa/src/components/Footer.astro:13-17`

**Interfaces:**
- Produces: `Base.astro` acepta `altSeoPath?: string | null`, que por defecto vale `altPath`.
  Pasando `null` no se emiten los `<link rel="alternate">` de idioma.

- [x] **Step 1: Hacer `altPath` opcional en `Seo.astro`**

Cambiar la interfaz a `altPath?: string` y envolver las tres líneas de `alternate` (44-46) para
que solo se emitan cuando hay equivalente:

```astro
{altPath && (
  <>
    <link rel="alternate" hreflang={locale} href={canonical.href} />
    <link rel="alternate" hreflang={altLocale} href={alternate.href} />
    <link rel="alternate" hreflang="x-default" href={new URL(locale === "es" ? Astro.url.pathname : altPath, site).href} />
  </>
)}
```

`const alternate = new URL(altPath, site)` (línea 17) revienta si `altPath` es `undefined`:
protegerlo con `const alternate = altPath ? new URL(altPath, site) : null` y usar
`alternate!.href` dentro del bloque, o mover el cálculo dentro. Comentar por qué:

```astro
{/* Sin equivalente en el otro idioma no se declara ninguno. Antes las tres
    páginas legales pasaban `/en/` y esto le decía a Google que la versión
    inglesa del aviso legal era la home inglesa —que declara `/` como la suya,
    así que el emparejamiento no era recíproco y quedaba roto. */}
```

- [x] **Step 2: Separar en `Base.astro` la navegación de la declaración**

```astro
interface Props {
  title: string;
  description: string;
  locale: "es" | "en";
  /** A dónde lleva el selector de idioma del menú. Siempre hay uno. */
  altPath: string;
  /** Qué se declara como equivalente para los buscadores. `null` cuando la
      página no tiene versión en el otro idioma: son cosas distintas, y una
      página legal solo en español tiene selector pero no equivalente. */
  altSeoPath?: string | null;
}

const { title, description, locale, altPath, altSeoPath = altPath } = Astro.props;
```

Y pasar `altPath={altSeoPath ?? undefined}` al `<Seo />`, dejando el `<Nav altPath={altPath} />`
como está.

- [x] **Step 3: Marcar las tres legales**

En `aviso-legal.astro`, `privacidad.astro` y `cookies.astro`, añadir `altSeoPath={null}` al
`<Base>`. El `altPath="/en/"` se queda: el selector sigue llevando a la home inglesa, que es lo
único que hay.

- [x] **Step 4: Que el pie inglés diga la verdad**

En `Footer.astro`:

```astro
    <span class="legal">
      <a href="/aviso-legal">{es ? "Aviso legal" : "Legal notice (ES)"}</a> ·
      <a href="/privacidad">{es ? "Privacidad" : "Privacy (ES)"}</a> ·
      <a href="/cookies">{es ? "Cookies" : "Cookies (ES)"}</a>
    </span>
```

- [x] **Step 5: Verificar contra el HTML construido, no contra el fuente**

```bash
pnpm --filter ochoa build
grep -c 'rel="alternate"' apps/ochoa/dist/aviso-legal/index.html   # 0
grep -c 'rel="alternate"' apps/ochoa/dist/index.html               # 3
grep -o 'Legal notice ([A-Z]*)' apps/ochoa/dist/en/index.html      # Legal notice (ES)
```

Expected: cero `alternate` en el aviso legal, tres en la home española, y el pie inglés marcado.

- [x] **Step 6: Commit**

```bash
git add packages/ui/src/Seo.astro apps/ochoa/src/layouts/Base.astro \
        apps/ochoa/src/pages/aviso-legal.astro apps/ochoa/src/pages/privacidad.astro \
        apps/ochoa/src/pages/cookies.astro apps/ochoa/src/components/Footer.astro
git commit -m "fix(seo): sin version inglesa no se declara equivalente"
```

---

### Task 5: La home inglesa alcanza a la española

**Files:**
- Modify: `apps/ochoa/src/pages/en/index.astro` (reescritura casi completa)

**Interfaces:**
- Consumes: `Ticker.astro`, `Mapa.astro`, `Contacto.astro`, todos con prop `locale: "es" | "en"`
  ya soportada.

- [x] **Step 1: Traer las importaciones y los datos de las fotos**

Copiar de `apps/ochoa/src/pages/index.astro:1-35` el bloque de frontmatter, ajustando las rutas
(`../../` en vez de `../`) y traduciendo los `alt`:

```astro
import { Image } from "astro:assets";
import Ticker from "../../components/Ticker.astro";
import Mapa from "../../components/Mapa.astro";
import Contacto from "../../components/Contacto.astro";
import barra from "../../assets/casa/barra.jpg";
import rotulo from "../../assets/casa/rotulo.jpg";
import vermu from "../../assets/casa/vermu.jpg";
import comedor from "../../assets/casa/comedor.jpg";

const cristal = {
  src: rotulo,
  alt: "The Los Ochoa sign painted on the window, with the terrace on the other side",
};
const casa = [
  { src: barra, alt: "The bar at Los Ochoa with the bottles and the hand-lettered mirror: tortilla, gildas, Russian salad, patatas bravas" },
  { src: vermu, alt: "Vermouth on the rocks with an anchovy and olive skewer on marble" },
  { src: comedor, alt: "Inside the bar: red banquette, marble tables and the sign seen from within" },
];
```

- [x] **Step 2: Montar las cuatro secciones que faltan**

Entre `<Highlights />` y el manifiesto, `<Ticker locale="en" />`. Después del manifiesto, las
secciones «the tasca» y «the house», con el mismo markup que la española y estos textos:

```astro
  <section class="tasca">
    <div class="wrap"><div class="rule"></div></div>
    <div class="wrap tasca-grid">
      <div class="tasca-photo">
        <img src="/images/mesa.jpg" alt="Marble table with several dishes from the menu, served to share" width="1920" height="1080" loading="lazy" />
      </div>
      <div>
        <p class="eyebrow">The tasca</p>
        <h2 class="cartel">The lifelong bar, renewed</h2>
        <p class="txt">
          Bar, marble and a red sign. <em>The tapeo of a lifetime, with flavours that will
          surprise you</em> and the best produce — from the Russian salad to the cachopín, by way
          of txistorra gyozas.
        </p>
        <p><a href="/en/menu" class="btn ghost">See the full menu</a></p>
      </div>
    </div>
  </section>

  <section class="casa">
    <div class="wrap">
      <div class="rule"></div>
      <p class="eyebrow">The house</p>
      <h2 class="cartel titular-cristal">
        <span class="tramo">What goes on</span>
        <Image src={cristal.src} alt={cristal.alt} widths={[390, 640, 960]} sizes="(max-width: 860px) 100vw, 560px" quality={72} loading="lazy" class="cristal-shot" />
        <span class="tramo">Behind the glass</span>
      </h2>
      <p class="txt">
        Bar, marble and mid-afternoon vermouth. <em>The tapeo that stretches until somebody checks
        the clock</em> and it turns out it's already night. Los Ochoa from the inside.
      </p>
      <div class="wall">
        {casa.map((c) => (
          <Image src={c.src} alt={c.alt} widths={[320, 640, 900]} sizes="(max-width: 860px) 46vw, 33vw" quality={72} loading="lazy" class="casa-shot" />
        ))}
      </div>
    </div>
  </section>
```

- [x] **Step 3: Sustituir el mapa de pega por el real**

En la sección `visita`, reemplazar el `<dl>` suelto y el `<div class="mapbox">` por la retícula de
la española: `<Mapa locale="en" />` a la izquierda y, a la derecha, `<Contacto locale="en" />`
sobre el `<dl class="info">` con `Address` y `Hours` (el teléfono y el Instagram ya los da
`Contacto`, así que sus dos `<div class="block">` desaparecen).

- [x] **Step 4: Traer el CSS de la española y tirar el muerto**

Copiar de `index.astro` las reglas `.tasca`, `.tasca-grid`, `.tasca-photo`, `.txt`, `.casa`,
`.titular-cristal`, `.cristal-shot`, `.wall`, `.casa-shot`, `.datos` y el `@media` de móvil.
**Borrar** `.mapbox`, `.pin`, `.dot`, `.ph` —con su `border-radius: 6px`, que se salta la escala
de curvatura— y las reglas muertas `.hero`, `.hero-photo` y `.kicker` del `@media` final, que son
de una portada que ya no existe.

- [x] **Step 5: Comparar las dos homes en el navegador**

Construir y abrir `/` y `/en/` a 390px. Evaluar en ambas:

```js
[...document.querySelectorAll('section')].map(s => s.className)
```

Expected: la misma lista de secciones en las dos, y `document.querySelector('.mapbox')` a `null`
en la inglesa. Comprobar además que `.mapa` existe y que el muro tiene tres fotos.

- [x] **Step 6: Commit**

```bash
git add apps/ochoa/src/pages/en/index.astro
git commit -m "feat(ochoa): la home inglesa alcanza a la espanola"
```

---

### Task 6: La nota de la carta inglesa

**Files:**
- Modify: `apps/ochoa/src/pages/en/menu.astro:22`

- [x] **Step 1: Alinear la nota con la española**

La española (`carta.astro:22`) dice «Carta facilitada por el restaurante en julio de 2026. La
carta de bebidas no se publica aquí.» La inglesa sigue diciendo «Menu from September 2025, the
latest published — pending confirmation by the restaurant», que dejó de ser verdad el 31.

```astro
      <p class="note">Menu provided by the restaurant in July 2026. The drinks list is not published here.</p>
```

- [x] **Step 2: Verificar en el HTML construido**

```bash
pnpm --filter ochoa build && grep -o 'Menu provided by[^<]*' apps/ochoa/dist/en/menu/index.html
grep -c 'September 2025' apps/ochoa/dist/en/menu/index.html   # 0
```

- [x] **Step 3: Commit**

```bash
git add apps/ochoa/src/pages/en/menu.astro
git commit -m "fix(ochoa): la nota de la carta inglesa deja de citar una carta vieja"
```

---

### Task 7: Cierre — verificación completa y estado

**Files:**
- Modify: `docs/estado.md` — §0 y §2

- [x] **Step 1: Suite y builds**

```bash
pnpm test && pnpm build
```

Expected: 45 tests en verde y las dos apps `Complete!`. Si la cuenta de tests cambió sin haber
tocado `packages/content` ni `packages/tracking`, parar e investigar.

- [x] **Step 2: Repaso visual final a 390px**

Sobre el build, no sobre `dev` —la caché de Vite ha producido falsos positivos en este repo—:
el menú abierto sin costura, los seis elementos del panel legibles, las fichas con relieve, y la
home inglesa igual a la española sección por sección.

- [x] **Step 3: Comprobar que Cokima sigue intacta**

```bash
git diff --stat main -- apps/cokima packages/ui/src/menu-overlay.ts
```

Expected: vacío salvo lo que ya viniera de `preview`. El único cambio fuera de `apps/ochoa` debe
ser `packages/ui/src/Seo.astro`.

- [x] **Step 4: Actualizar `docs/estado.md`**

Quitar de §0 el punto «La home en inglés de Ochoa está atrasada», que queda resuelto. Añadir a la
lista de lo que espera respuesta de Mario que las legales se quedan en español a propósito. Anotar
la tanda en §2.

- [x] **Step 5: Commit y push**

```bash
git add docs/estado.md
git commit -m "docs: el corte tras la plancha roja y la paridad del ingles"
git push origin preview
```

---

## Self-review

**Cobertura del spec:**

| Sección del spec | Tarea |
|---|---|
| §3 La plancha continua | 1 |
| §4 La tipografía invertida | 2 |
| §5 Los tokens reescritos | 2, paso 1 |
| §6 Las fichas | 3 |
| §7.1 La home inglesa | 5 |
| §7.2 La nota de la carta | 6 |
| §7.3 Las legales y el `hreflang` | 4 |
| §8 Fuera de alcance | 7, paso 3 (se comprueba) |
| §9 Verificación | pasos finales de 1, 2, 3, 5 y toda la 7 |

Sin huecos.

**Placeholders:** ninguno. Todos los pasos de código llevan el código.

**Consistencia de nombres:** `altSeoPath` se define en la tarea 4 paso 2 y se usa en el paso 3 con
el mismo nombre. `--t-open` se declara en la tarea 2 paso 1 y se verifica en el paso 4. `compacto`
se redefine en la tarea 3 y no lo consume ninguna tarea posterior.

**Riesgo conocido:** la tarea 2 paso 2 corrige sobre la marcha dónde vive el `text-shadow`
(en `.lbl`, no en el `<a>`) porque el hover tiene que poder retirarlo. Está escrito en el propio
paso para que no se implemente la primera versión y haya que deshacerla.
