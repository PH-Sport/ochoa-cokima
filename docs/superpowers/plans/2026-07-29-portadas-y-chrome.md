# Portadas, chrome y piel de Ochoa — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Que las dos homes abran con una foto a sangre y muestren platos con precio antes del primer scroll, con la reserva siempre accesible desde la cabecera y Ochoa vestido con su marca real.

**Architecture:** Se sustituyen las dos barras fijas inferiores por una única cabecera con `[Reservar]` + hamburguesa; el hueco inferior liberado lo ocupa el cartel de cookies. Cada home estrena una portada a sangre y un componente `Highlights` propio de la app que pinta los platos `featured` con foto opcional. La fotografía entra por `astro:assets`, y la selección de destacados se centraliza en un helper puro y testeado de `@tombo/content`.

**Tech Stack:** Astro 6 (salida estática, adaptador Vercel v10), pnpm workspaces sin Turborepo, vitest para la lógica pura, CSS plano con tokens `--t-*` por marca.

## Global Constraints

- `packages/ui` no lleva ni un color ni una fuente de marca. Cada app inyecta sus tokens `--t-*`.
- Los scripts de pnpm se filtran **por nombre**: `pnpm --filter cokima dev`, nunca por ruta.
- Toda verificación visual se hace **midiendo en el navegador a 390 px**, no leyendo el CSS. Si algo no cuadra con el código, sospechar de la caché de Vite: `rm -rf node_modules/.vite apps/*/node_modules/.vite`.
- Cada componente con `<script>` debe remontar en `astro:after-swap` y **no** en `astro:page-load` (con `ClientRouter` activo, este último duplica listeners).
- Contraste mínimo 4.5:1 en todo texto, incluido el titular sobre la foto.
- Áreas táctiles de 44 px mínimo.
- No se toca el texto del cartel de cookies (decisión legal abierta de Mario).
- Rama de trabajo: `preview`. Un commit por tarea.
- Los precios y nombres de plato salen **siempre** de `menu-*.json`. Nunca se escriben a mano en una plantilla.

---

## Estructura de ficheros

| Fichero | Responsabilidad |
|---|---|
| `packages/content/src/featured.ts` | **Nuevo.** `pickFeatured()`: filtra y ordena destacados. Lógica pura, testeada. |
| `packages/content/test/featured.test.ts` | **Nuevo.** Tests de `pickFeatured()`. |
| `apps/*/src/components/Nav.astro` | Cabecera: marca, `[Reservar]`, hamburguesa y panel desplegable. |
| `apps/*/src/components/Hero.astro` | **Nuevo.** Portada a sangre con foto, titular y estado de apertura. |
| `apps/*/src/components/Highlights.astro` | **Nuevo.** Tira de platos destacados con foto opcional y precio. |
| `apps/*/src/data/dish-images.ts` | **Nuevo.** Mapa `clave → ImageMetadata` resuelto por glob sobre `src/assets/dishes/`. |
| `apps/*/src/assets/` | **Nuevo.** Fotografía procesada por `astro:assets`. |
| `apps/ochoa/src/components/BottomBar.astro` | **Se elimina.** |
| `apps/cokima/src/components/ReserveBar.astro` | **Se elimina.** |
| `apps/*/src/styles/tokens.css` | Ochoa: piel roja. Ambas: fuera `--t-bottom-bar-h`. |
| `packages/ui/src/ConsentBanner.astro` | Franja inferior sin anclaje a la barra. |

**Decisiones de implementación que precisan el spec:**

1. **Foto de plato opcional.** No está garantizado que Instagram tenga foto de los once destacados. `Highlights` pinta ficha tipográfica cuando falta la imagen, para que nunca quede un hueco roto. Se aprovecha el campo `image` que el schema **ya** declara opcional (`packages/content/src/index.ts:27`).
2. **`OpenState` aparece dos veces:** en la portada bajo el titular (es la ventaja que ninguna de las cinco referencias tiene) y dentro del panel de la hamburguesa. `OpenState` resuelve con `querySelectorAll`, así que soporta varias instancias sin cambios.
3. **La hamburguesa está en todos los anchos**, no solo en móvil. Es lo que hacen Gianna y Bardero, y evita mantener dos navegaciones distintas.
4. **La home de Cokima no reutiliza `MenuDeck`,** pese a lo que dice el spec §5.2. `MenuDeck` pinta fichas tipográficas sin imagen y arrastra tabs y filtro de alérgenos, incompatible con el "cada plato lleva foto" del mismo §5.2. La home estrena `Highlights`; **`MenuDeck` sigue intacto y en uso en `/carta`**, que es donde las tabs tienen sentido.
5. **`Embers` sobrevive dentro del hero de Cokima.** Hoy solo se usa en sus dos homes: sacarlo del hero lo dejaría huérfano. Se monta entre la foto y el degradado, con las brasas por encima de la imagen. Si al medir ensucia la fotografía, se retira el componente por completo en la misma tarea.

---

### Task 1: Cabecera nueva con Reservar + hamburguesa

**Files:**
- Modify: `apps/cokima/src/components/Nav.astro` (reescritura completa)
- Modify: `apps/ochoa/src/components/Nav.astro` (reescritura completa)
- Modify: `apps/ochoa/src/components/MenuBoard.astro:155`
- Modify: `apps/ochoa/src/styles/tokens.css`

**Interfaces:**
- Consumes: `OpenState` de `@tombo/ui/OpenState.astro`, `RESTAURANT` de `../site.ts`.
- Produces: `<Nav locale={"es"|"en"} altPath={string} />` con la misma firma de props que hoy. Escribe `--t-header-h` en `documentElement` con el alto real medido.

- [ ] **Step 1: Reescribir `apps/cokima/src/components/Nav.astro`**

```astro
---
import OpenState from "@tombo/ui/OpenState.astro";
import { RESTAURANT } from "../site.ts";

interface Props {
  locale: "es" | "en";
  altPath: string;
}
const { locale, altPath } = Astro.props;
const es = locale === "es";
const links = es
  ? [
      { href: "/carta", label: "La carta" },
      { href: "/#visita", label: "Dónde estamos" },
    ]
  : [
      { href: "/en/menu", label: "Menu" },
      { href: "/en/#visit", label: "Find us" },
    ];
const home = es ? "/" : "/en/";
const reserve = es ? "/reservas" : "/en/reservations";
const t = es
  ? { menu: "Menú", reserve: "Reservar", close: "Cerrar menú" }
  : { menu: "Menu", reserve: "Book", close: "Close menu" };
---

<nav class="nav">
  <div class="wrap nav-in">
    <a class="brand" href={home}>Cokima<i class="spark" aria-hidden="true"></i></a>
    <div class="nav-actions">
      <a href={reserve} class="btn">{t.reserve}</a>
      <button
        type="button"
        class="menu-btn"
        data-menu-toggle
        aria-expanded="false"
        aria-controls="nav-panel"
      >
        <span class="bars" aria-hidden="true"><i></i><i></i></span>
        <span class="visually-hidden">{t.menu}</span>
      </button>
    </div>
  </div>

  <div class="panel" id="nav-panel" data-menu-panel hidden>
    <div class="wrap panel-in">
      <ul class="panel-links">
        {links.map((l) => (
          <li><a href={l.href}>{l.label}</a></li>
        ))}
      </ul>
      <div class="panel-foot">
        <OpenState hours={RESTAURANT.openingHours} locale={locale} />
        <span class="lang">
          {es ? <><b>ES</b> · <a href={altPath}>EN</a></> : <><a href={altPath}>ES</a> · <b>EN</b></>}
        </span>
      </div>
    </div>
  </div>
</nav>
```

- [ ] **Step 2: Añadir el script del panel al mismo fichero**

Va justo detrás del marcado. `AbortController` evita que `astro:after-swap` acumule listeners en `document` a cada navegación.

```astro
<script>
  let controller: AbortController | null = null;

  const mount = () => {
    const nav = document.querySelector<HTMLElement>(".nav");
    if (!nav) return;
    const btn = nav.querySelector<HTMLButtonElement>("[data-menu-toggle]");
    const panel = nav.querySelector<HTMLElement>("[data-menu-panel]");
    if (!btn || !panel) return;

    controller?.abort();
    controller = new AbortController();
    const { signal } = controller;

    const focusables = () =>
      [...panel.querySelectorAll<HTMLElement>("a[href], button:not([disabled])")].filter(
        (el) => el.offsetParent !== null,
      );

    const isOpen = () => btn.getAttribute("aria-expanded") === "true";

    const close = (returnFocus = false) => {
      if (!isOpen()) return;
      btn.setAttribute("aria-expanded", "false");
      panel.hidden = true;
      if (returnFocus) btn.focus();
    };

    const open = () => {
      btn.setAttribute("aria-expanded", "true");
      panel.hidden = false;
      focusables()[0]?.focus();
    };

    btn.addEventListener("click", () => (isOpen() ? close(true) : open()), { signal });

    document.addEventListener(
      "keydown",
      (e) => {
        if (!isOpen()) return;
        if (e.key === "Escape") {
          close(true);
          return;
        }
        if (e.key !== "Tab") return;
        const items = focusables();
        if (!items.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      },
      { signal },
    );

    document.addEventListener(
      "click",
      (e) => {
        if (!isOpen()) return;
        if (nav.contains(e.target as Node)) return;
        close();
      },
      { signal },
    );

    // El alto real de la cabecera gobierna el offset de las tabs de la carta.
    // Con el panel abierto, el alto del <nav> incluye el desplegable y no
    // representa la barra: en ese caso se conserva el último valor bueno.
    const sync = () => {
      if (!panel.hidden) return;
      document.documentElement.style.setProperty(
        "--t-header-h",
        `${Math.ceil(nav.getBoundingClientRect().height)}px`,
      );
    };
    sync();
    new ResizeObserver(sync).observe(nav);
  };

  mount();
  document.addEventListener("astro:after-swap", mount);
</script>
```

- [ ] **Step 3: Añadir los estilos al mismo fichero**

```astro
<style>
  .nav {
    position: sticky;
    top: 0;
    z-index: 40;
    background: rgba(21, 15, 12, 0.82);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--line);
  }
  .nav-in {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    height: 60px;
  }
  .brand {
    display: flex;
    align-items: center;
    gap: 0.5ch;
    font-weight: 800;
    font-size: 1.3rem;
    letter-spacing: -0.01em;
  }
  .spark {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--vermilion);
    box-shadow: 0 0 8px 2px var(--ember), 0 0 2px 1px var(--vermilion);
  }
  .nav-actions {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .nav-actions .btn {
    padding: 9px 16px;
    font-size: 0.92rem;
    min-height: 44px;
    display: inline-flex;
    align-items: center;
  }
  .menu-btn {
    width: 44px;
    height: 44px;
    display: grid;
    place-items: center;
    background: transparent;
    border: 1px solid var(--line);
    border-radius: 3px;
    cursor: pointer;
    color: var(--bone);
  }
  .bars {
    display: grid;
    gap: 5px;
    width: 18px;
  }
  .bars i {
    height: 2px;
    background: currentColor;
    border-radius: 2px;
  }
  .panel {
    border-top: 1px solid var(--line);
    background: var(--ground);
  }
  .panel[hidden] {
    display: none;
  }
  .panel-in {
    padding-block: 14px 18px;
  }
  .panel-links {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .panel-links a {
    display: block;
    padding: 13px 0;
    font-size: 1.06rem;
    border-bottom: 1px solid var(--line);
  }
  .panel-links a:hover {
    color: var(--vermilion);
  }
  .panel-foot {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding-top: 14px;
  }
  .lang {
    font-size: 0.9rem;
    color: var(--bone-dim);
  }
  .lang b {
    color: var(--bone);
    font-weight: 600;
  }
  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
</style>
```

- [ ] **Step 4: Reescribir `apps/ochoa/src/components/Nav.astro`**

Mismo marcado y mismo script que los pasos 1 y 2, con estas diferencias: la marca es `<a class="brand cartel" href={home}>Los Ochoa</a>` (sin el `<small>`, que se va con el rediseño), y los estilos usan la paleta de Ochoa. Copia el bloque `<style>` del paso 3 y sustituye:

```css
  .nav {
    position: sticky;
    top: 0;
    z-index: 40;
    background: var(--rojo);
    border-bottom: 2px solid var(--ink);
  }
  .brand {
    font-size: 1.4rem;
    color: var(--paper);
    text-shadow: none;
  }
  .menu-btn {
    border-color: var(--paper);
    color: var(--paper);
  }
  .panel {
    border-top: 2px solid var(--ink);
    background: var(--paper);
  }
  .panel-links a:hover {
    color: var(--rojo);
  }
```

El resto de reglas (`.nav-in`, `.nav-actions`, `.bars`, `.panel-in`, `.panel-links`, `.panel-foot`, `.lang`, `.visually-hidden`) se copian literales del paso 3.

- [ ] **Step 5: Colgar el offset de la carta de Ochoa del alto real**

En `apps/ochoa/src/components/MenuBoard.astro`, sustituir el `top: 67px` de `.toggle` (línea 155) y su comentario por:

```css
  .toggle {
    position: sticky;
    /* Cuelga del alto real que Nav.astro mide y escribe en cliente: el botón de
       reserva y la hamburguesa cambian el alto de la cabecera por idioma y ancho. */
    top: var(--t-header-h);
```

Y en `apps/ochoa/src/styles/tokens.css`, añadir dentro de `:root` el valor de partida para que el sticky sea correcto sin JavaScript:

```css
  --t-header-h: 62px;
```

- [ ] **Step 6: Corregir el valor de partida de Cokima**

En `apps/cokima/src/styles/tokens.css`, `--t-header-h` vale hoy `67px` y su `@media`
lo sube a `111px` por debajo de 780 px, porque la cabecera vieja envolvía los enlaces a
una segunda fila. La cabecera nueva es una sola fila en todos los anchos: dejar
`--t-header-h: 61px;` en `:root` (60 px de `.nav-in` más 1 px de borde) y **borrar el
bloque `@media` que lo reasigna a 111px**. El valor definitivo lo escribe el script tras
montar; este es solo el punto de partida sin JavaScript.

- [ ] **Step 7: Arrancar y medir**

```bash
pnpm --filter cokima dev
```

Con el navegador a 390 px, comprobar en la home de Cokima:
1. `[Reservar]` visible sin hacer scroll.
2. Al pulsar `☰`, el panel se abre y el foco salta al primer enlace.
3. `Escape` lo cierra y devuelve el foco al botón.
4. Un clic fuera de la cabecera lo cierra.
5. Tabulando dentro del panel, el foco no se escapa.

Repetir con `pnpm --filter ochoa dev`.

- [ ] **Step 8: Commit**

```bash
git add apps/cokima/src/components/Nav.astro apps/ochoa/src/components/Nav.astro apps/ochoa/src/components/MenuBoard.astro apps/*/src/styles/tokens.css
git commit -m "feat(nav): cabecera con reservar fijo y menu hamburguesa"
```

---

### Task 2: Retirar las barras fijas inferiores y bajar el cartel de cookies

**Files:**
- Delete: `apps/ochoa/src/components/BottomBar.astro`
- Delete: `apps/cokima/src/components/ReserveBar.astro`
- Modify: `apps/ochoa/src/layouts/Base.astro:9,34`
- Modify: `apps/cokima/src/layouts/Base.astro:9,35`
- Modify: `apps/ochoa/src/styles/tokens.css:33-37,59-63`
- Modify: `apps/cokima/src/styles/tokens.css:45,63-66`
- Modify: `packages/ui/src/ConsentBanner.astro:112-140`

**Interfaces:**
- Consumes: la cabecera de la Task 1, que ya ofrece reserva y estado de apertura.
- Produces: ningún elemento fijo al pie. `--t-bottom-bar-h` deja de existir.

- [ ] **Step 1: Borrar los dos componentes**

```bash
git rm apps/ochoa/src/components/BottomBar.astro apps/cokima/src/components/ReserveBar.astro
```

- [ ] **Step 2: Quitarlos de los dos layouts**

En `apps/ochoa/src/layouts/Base.astro`, borrar la línea `import BottomBar from "../components/BottomBar.astro";` y la línea `<BottomBar locale={locale} />`.

En `apps/cokima/src/layouts/Base.astro`, borrar la línea `import ReserveBar from "../components/ReserveBar.astro";` y la línea `<ReserveBar locale={locale} />`.

- [ ] **Step 3: Limpiar los tokens**

En `apps/ochoa/src/styles/tokens.css`, borrar la declaración `--t-bottom-bar-h: 69px;` con su comentario, y el bloque entero:

```css
@media (max-width: 780px) {
  body {
    padding-bottom: var(--t-bottom-bar-h);
  }
}
```

En `apps/cokima/src/styles/tokens.css`, borrar `--t-bottom-bar-h: 70px;` y su bloque `@media` equivalente con el `padding-bottom` del `body`.

- [ ] **Step 4: Soltar el cartel de cookies de la barra**

En `packages/ui/src/ConsentBanner.astro`, sustituir el bloque `@media (max-width: 640px)` completo (líneas 112-140, comentario incluido) por:

```css
  /* Móvil: franja a lo ancho apoyada en el borde inferior, que desde el
     rediseño de la cabecera ya no comparte con ninguna barra fija. El
     safe-area evita que los botones caigan bajo el indicador de iOS. */
  @media (max-width: 640px) {
    .consent {
      left: 0;
      right: 0;
      bottom: 0;
      max-width: none;
      border-radius: 0;
      border-inline: 0;
      padding: 10px 14px calc(10px + env(safe-area-inset-bottom));
      gap: 8px;
    }
    .consent p {
      font-size: 0.8rem;
      line-height: 1.4;
      max-width: none;
      flex: 1 1 100%;
    }
    .consent-actions {
      flex: 1 1 100%;
    }
    .consent-btn {
      flex: 1;
      min-height: 44px;
    }
  }
```

- [ ] **Step 5: Verificar que no queda ni una referencia**

```bash
grep -rn "bottom-bar-h\|BottomBar\|ReserveBar" apps packages --include=*.astro --include=*.css --include=*.ts
```

Esperado: sin resultados.

- [ ] **Step 6: Medir en el navegador**

A 390 px, con la cookie de consentimiento borrada (DevTools → Application → Cookies → borrar `tombo_consent`):
1. El cartel se apoya en el borde inferior y no tapa contenido fijo.
2. "Rechazar" y "Aceptar" miden lo mismo y están en la misma fila.
3. Al pulsar cualquiera de los dos, el cartel desaparece y no reaparece al recargar.
4. No queda hueco muerto al pie de la página.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "refactor(ui): fuera las barras fijas inferiores, cookies al pie libre"
```

---

### Task 3: Helper `pickFeatured` con tests

**Files:**
- Create: `packages/content/src/featured.ts`
- Create: `packages/content/test/featured.test.ts`
- Modify: `packages/content/src/index.ts:49`

**Interfaces:**
- Consumes: `MenuEntry` de `packages/content/src/index.ts`.
- Produces: `pickFeatured(entries: MenuEntry[], limit?: number): MenuEntry[]`, exportado desde `@tombo/content`. Ordena por posición de sección en `sectionOrder` y luego por `order`. Sin `limit`, devuelve todos.

- [ ] **Step 1: Escribir el test que falla**

Crear `packages/content/test/featured.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { pickFeatured } from "../src/featured.ts";
import type { MenuEntry } from "../src/index.ts";

const entry = (over: Partial<MenuEntry>): MenuEntry => ({
  name: "Plato",
  allergens: [],
  featured: false,
  price: 10,
  section: "carta",
  order: 1,
  ...over,
});

describe("pickFeatured", () => {
  it("se queda solo con los destacados", () => {
    const out = pickFeatured([
      entry({ name: "A", featured: true }),
      entry({ name: "B", featured: false }),
    ]);
    expect(out.map((d) => d.name)).toEqual(["A"]);
  });

  it("ordena por seccion y despues por order", () => {
    const out = pickFeatured([
      entry({ name: "postre", section: "postres", order: 1, featured: true }),
      entry({ name: "segundo", section: "carta", order: 9, featured: true }),
      entry({ name: "primero", section: "carta", order: 2, featured: true }),
    ]);
    expect(out.map((d) => d.name)).toEqual(["primero", "segundo", "postre"]);
  });

  it("una seccion desconocida va al final, no al principio", () => {
    const out = pickFeatured([
      entry({ name: "rara", section: "bebidas", order: 1, featured: true }),
      entry({ name: "normal", section: "carta", order: 1, featured: true }),
    ]);
    expect(out.map((d) => d.name)).toEqual(["normal", "rara"]);
  });

  it("recorta al limite pedido", () => {
    const out = pickFeatured(
      [
        entry({ name: "uno", order: 1, featured: true }),
        entry({ name: "dos", order: 2, featured: true }),
        entry({ name: "tres", order: 3, featured: true }),
      ],
      2,
    );
    expect(out.map((d) => d.name)).toEqual(["uno", "dos"]);
  });

  it("no muta el array recibido", () => {
    const input = [
      entry({ name: "segundo", order: 2, featured: true }),
      entry({ name: "primero", order: 1, featured: true }),
    ];
    pickFeatured(input);
    expect(input.map((d) => d.name)).toEqual(["segundo", "primero"]);
  });

  it("sin destacados devuelve vacio", () => {
    expect(pickFeatured([entry({})])).toEqual([]);
  });
});
```

- [ ] **Step 2: Ejecutar y ver que falla**

```bash
pnpm --filter @tombo/content test
```

Esperado: FAIL — no existe `../src/featured.ts`.

- [ ] **Step 3: Implementar**

Crear `packages/content/src/featured.ts`:

```ts
import type { MenuEntry } from "./index.ts";

/**
 * `order` es correlativo dentro de cada sección, no un índice global: ordenar
 * solo por `order` intercalaría los postres entre los platos salados. Las
 * secciones que no aparecen en la lista conocida van al final, nunca delante.
 */
const SECTION_ORDER = ["compartir", "terminar", "carta", "postres"];

const rank = (section: string) => {
  const i = SECTION_ORDER.indexOf(section);
  return i === -1 ? SECTION_ORDER.length : i;
};

export function pickFeatured(entries: MenuEntry[], limit?: number): MenuEntry[] {
  const featured = entries
    .filter((e) => e.featured)
    .sort((a, b) => rank(a.section) - rank(b.section) || a.order - b.order);
  return typeof limit === "number" ? featured.slice(0, limit) : featured;
}
```

- [ ] **Step 4: Exportarlo**

En `packages/content/src/index.ts`, añadir tras la línea 49:

```ts
export { pickFeatured } from "./featured.ts";
```

- [ ] **Step 5: Ejecutar y ver que pasa**

```bash
pnpm test
```

Esperado: PASS. El total sube de 37 a 43 tests.

- [ ] **Step 6: Commit**

```bash
git add packages/content/src/featured.ts packages/content/test/featured.test.ts packages/content/src/index.ts
git commit -m "feat(content): pickFeatured, seleccion ordenada de platos destacados"
```

---

### Task 4: Componente `Highlights` en las dos apps

**Files:**
- Create: `apps/cokima/src/components/Highlights.astro`
- Create: `apps/ochoa/src/components/Highlights.astro`
- Create: `apps/cokima/src/data/dish-images.ts`
- Create: `apps/ochoa/src/data/dish-images.ts`

**Interfaces:**
- Consumes: `pickFeatured` y `formatEuro` / `formatPortionPrice` de `@tombo/content`; `dishImages` del mapa de la propia app.
- Produces: `<Highlights dishes={MenuEntry[]} locale={"es"|"en"} href={string} />`, donde `href` es la ruta de la carta completa. Pinta una tira horizontal con scroll y snap.

- [ ] **Step 1: Crear el mapa de imágenes de Cokima**

Crear `apps/cokima/src/data/dish-images.ts`:

```ts
// Resuelve por glob para que añadir una foto sea dejar el archivo en la carpeta:
// la clave es el nombre del fichero sin extensión, y coincide con el campo
// `image` de menu-*.json. Sin archivo, Highlights pinta la ficha sin foto.
const files = import.meta.glob<{ default: ImageMetadata }>(
  "../assets/dishes/*.{jpg,jpeg,png,webp,avif}",
  { eager: true },
);

export const dishImages: Record<string, ImageMetadata> = Object.fromEntries(
  Object.entries(files).map(([path, mod]) => [
    path.split("/").pop()!.replace(/\.[^.]+$/, ""),
    mod.default,
  ]),
);
```

- [ ] **Step 2: Crear el mismo fichero en Ochoa**

`apps/ochoa/src/data/dish-images.ts` con contenido **idéntico** al paso 1. No se comparte desde `packages/ui` porque el glob se resuelve relativo al fichero que lo declara.

- [ ] **Step 3: Crear `apps/cokima/src/components/Highlights.astro`**

```astro
---
import { Image } from "astro:assets";
import { formatEuro, type MenuEntry } from "@tombo/content";
import { dishImages } from "../data/dish-images.ts";

interface Props {
  dishes: MenuEntry[];
  locale: "es" | "en";
  href: string;
}
const { dishes, locale, href } = Astro.props;
const es = locale === "es";
const t = es
  ? { title: "Los imprescindibles", more: "Carta completa", list: "Platos destacados" }
  : { title: "The must-haves", more: "Full menu", list: "Featured dishes" };

const cards = dishes.map((d) => ({
  dish: d,
  image: d.image ? dishImages[d.image] : undefined,
}));
---

<section class="highlights">
  <div class="wrap head">
    <h2>{t.title}</h2>
    <a href={href} class="more">{t.more} →</a>
  </div>

  <ul class="strip" tabindex="0" aria-label={t.list}>
    {cards.map(({ dish, image }) => (
      <li class:list={["card", { flat: !image }]}>
        {image && (
          <Image
            src={image}
            alt={dish.name}
            widths={[280, 560]}
            sizes="(max-width: 640px) 68vw, 280px"
            loading="lazy"
            class="shot"
          />
        )}
        <div class="body">
          <h3>{dish.name}</h3>
          <span class="price">{formatEuro(typeof dish.price === "number" ? dish.price : dish.price.full)}</span>
        </div>
      </li>
    ))}
  </ul>
</section>

<style>
  .highlights {
    padding: clamp(26px, 4vw, 44px) 0 clamp(30px, 5vw, 56px);
  }
  .head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 18px;
    margin-bottom: 16px;
  }
  .head h2 {
    font-family: var(--sans);
    font-weight: 800;
    font-size: clamp(1.5rem, 4.4vw, 2.4rem);
    letter-spacing: -0.02em;
    margin: 0;
  }
  .more {
    font-size: 0.92rem;
    color: var(--ember);
    white-space: nowrap;
  }
  .strip {
    display: flex;
    gap: 14px;
    list-style: none;
    margin: 0;
    padding: 0 clamp(20px, 5vw, 48px);
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    scrollbar-width: none;
  }
  .strip::-webkit-scrollbar {
    display: none;
  }
  .card {
    flex: 0 0 68vw;
    max-width: 280px;
    scroll-snap-align: start;
    border: 1px solid var(--ground-3);
    border-radius: 6px;
    overflow: hidden;
    background: var(--ground-2);
  }
  .card.flat {
    display: flex;
    align-items: flex-end;
    min-height: 132px;
  }
  .shot {
    width: 100%;
    height: 190px;
    object-fit: cover;
  }
  .body {
    padding: 12px 14px 14px;
    width: 100%;
  }
  .body h3 {
    font-size: 1rem;
    font-weight: 600;
    margin: 0 0 6px;
    line-height: 1.25;
  }
  .price {
    font-size: 0.95rem;
    color: var(--ember);
    font-weight: 600;
  }
  .strip:focus-visible {
    outline: 2px solid var(--vermilion);
    outline-offset: 3px;
  }
  @media (min-width: 861px) {
    .strip {
      max-width: var(--maxw);
      margin: 0 auto;
    }
    .card {
      flex: 1 1 0;
      max-width: none;
    }
  }
</style>
```

- [ ] **Step 4: Crear `apps/ochoa/src/components/Highlights.astro`**

Mismo marcado y misma lógica que el paso 3, con dos diferencias. Los textos:

```ts
const t = es
  ? { title: "Lo que más sale", more: "La carta entera", list: "Platos destacados" }
  : { title: "What sells most", more: "Full menu", list: "Featured dishes" };
```

Y el precio, que en Ochoa puede tener media ración. Sustituir la línea del `<span class="price">` por:

```astro
          <span class="price">
            {typeof dish.price === "number"
              ? formatEuro(dish.price)
              : dish.price.half
                ? `${formatEuro(dish.price.half)} · ${formatEuro(dish.price.full)}`
                : formatEuro(dish.price.full)}
          </span>
```

Los estilos se copian del paso 3 sustituyendo el bloque de colores por la paleta de Ochoa:

```css
  .head h2 {
    font-family: var(--display);
    font-weight: 400;
    text-transform: uppercase;
    color: var(--rojo);
    font-size: clamp(1.7rem, 5vw, 2.6rem);
    letter-spacing: 0.015em;
    margin: 0;
  }
  .more {
    font-size: 0.92rem;
    color: var(--rojo);
    white-space: nowrap;
  }
  .card {
    border: 2px solid var(--ink);
    border-radius: 4px;
    background: var(--paper);
    box-shadow: 4px 4px 0 var(--rojo);
  }
  .price {
    font-family: var(--sans);
    font-size: 0.95rem;
    color: var(--ink);
    font-weight: 600;
  }
```

- [ ] **Step 5: Montar `Highlights` en la home de Cokima**

En `apps/cokima/src/pages/index.astro`, sustituir el bloque `<section class="picks">` entero (líneas 39-52) por:

```astro
  <Highlights dishes={featured} locale="es" href="/carta" />
```

Y en el frontmatter, cambiar los imports:

```astro
import { getCollection } from "astro:content";
import { pickFeatured } from "@tombo/content";
import Base from "../layouts/Base.astro";
import Embers from "../components/Embers.astro";
import Highlights from "../components/Highlights.astro";

const featured = pickFeatured((await getCollection("menu-es")).map((e) => e.data));
```

`MenuDeck` y `ALLERGEN_LABELS` dejan de usarse en la home: borrar sus imports. **`MenuDeck` sigue vivo en `/carta`, no se borra el componente.** Con esto desaparecen los tres encabezados encadenados.

Borrar del `<style>` de la página las reglas `.picks` y `.more`, que ya no tienen marcado.

- [ ] **Step 6: Montar `Highlights` en la home de Ochoa**

En `apps/ochoa/src/pages/index.astro`, añadir al frontmatter:

```astro
import { getCollection } from "astro:content";
import { pickFeatured } from "@tombo/content";
import Highlights from "../components/Highlights.astro";

const featured = pickFeatured((await getCollection("menu-es")).map((e) => e.data));
```

E insertar el componente **justo después de `</header>`**, antes de `<section class="manifesto">`:

```astro
  <Highlights dishes={featured} locale="es" href="/carta" />
```

- [ ] **Step 7: Medir en el navegador**

A 390 px, en las dos homes:
1. Se ven fichas de plato con nombre y precio (aún sin foto: las fotos llegan en la Task 5).
2. Ochoa muestra sus 6 destacados; Cokima, sus 5.
3. La tira se recorre con scroll horizontal y con `Tab` + flechas.
4. Los precios coinciden con `menu-es.json`: cachopín 18 €, croquetas 7,50 € · 14 €, tataki 18 €.

- [ ] **Step 8: Commit**

```bash
git add apps/*/src/components/Highlights.astro apps/*/src/data/dish-images.ts apps/*/src/pages/index.astro
git commit -m "feat(homes): tira de platos destacados con precio en las dos homes"
```

---

### Task 5: Fotografía real desde Instagram

**Files:**
- Create: `apps/cokima/src/assets/hero.jpg`, `apps/cokima/src/assets/dishes/*.jpg`
- Create: `apps/ochoa/src/assets/hero.jpg`, `apps/ochoa/src/assets/dishes/*.jpg`
- Create: `docs/fotografia.md`
- Modify: `apps/cokima/src/data/menu-es.json`, `apps/cokima/src/data/menu-en.json`
- Modify: `apps/ochoa/src/data/menu-es.json`, `apps/ochoa/src/data/menu-en.json`

**Interfaces:**
- Consumes: nada de tareas anteriores.
- Produces: archivos en `src/assets/` y el campo `image` relleno en los platos que tengan foto. La clave de `image` es el nombre del archivo sin extensión.

- [ ] **Step 1: Seleccionar y descargar**

Con la extensión de Chrome, abrir `https://www.instagram.com/cokimamadrid/` y `https://www.instagram.com/tasquita.losochoa/`, abrir cada publicación elegida y quedarse con la imagen de 1080 px.

Candidatas ya identificadas en la fase de diseño:
- **Cokima, portada:** la parrilla con llama o el atún crudo sobre negro (registro oscuro, luz dura).
- **Cokima, platos:** tataki de atún, gyozas, arroz de carabinero — hay foto de los tres.
- **Ochoa, portada:** producto sobre fondo rojo liso, o la barra con el mandil rojo.
- **Ochoa, platos:** torreznos, croissant de rabo de toro, croquetas, ensaladilla.

Guardar en `apps/<app>/src/assets/dishes/<clave>.jpg`, con la clave en kebab-case derivada del nombre del plato (`tataki-de-atun`, `croissant-de-rabo-de-toro`). Las portadas van en `apps/<app>/src/assets/hero.jpg`.

**Si la descarga automática falla** (Instagram sirve las imágenes desde un CDN con URLs firmadas y caducas): parar, no insistir más de dos intentos, y pedir a Mario las fotos concretas por nombre, indicándole la ruta exacta donde dejarlas.

- [ ] **Step 2: Rellenar el campo `image` en los JSON**

Para cada plato con foto, añadir la clave. Ejemplo en `apps/cokima/src/data/menu-es.json`:

```json
  {
    "id": "compartir-07",
    "section": "compartir",
    "order": 7,
    "name": "Tataki de atún",
    "description": "Gel de guisante y cremoso de ají amarillo.",
    "price": 18,
    "featured": true,
    "image": "tataki-de-atun",
    "allergens": ["pescado", "soja"]
  },
```

**Importante:** aplicar la misma clave al plato equivalente en `menu-en.json`, para que la versión inglesa no salga sin foto.

- [ ] **Step 3: Comprobar que el schema los acepta**

```bash
pnpm --filter cokima build
pnpm --filter ochoa build
```

Esperado: `Complete!` en las dos. Un `image` que no case con ningún archivo **no** rompe el build: `dishImages[clave]` da `undefined` y la ficha se pinta sin foto. Si una ficha sale sin foto teniéndola, el fallo está en el nombre del archivo.

- [ ] **Step 4: Documentar la procedencia**

Crear `docs/fotografia.md`:

```markdown
# Fotografía

Origen provisional: perfiles de Instagram del propio grupo, @cokimamadrid y
@tasquita.losochoa, a 1080 px. Cubre móvil (390 px × 2 = 780 px) pero se queda
justa para escritorio a pantalla completa.

**Pendiente:** pedir los originales al fotógrafo y confirmar que la cesión de
derechos cubre la web, no solo redes sociales. Sustituirlos no requiere tocar
el layout: mismo nombre de archivo en `apps/*/src/assets/`.

| Clave | App | Plato | Publicación de origen |
|---|---|---|---|
| (rellenar según lo descargado) | | | |
```

- [ ] **Step 5: Commit**

```bash
git add apps/*/src/assets apps/*/src/data/menu-*.json docs/fotografia.md
git commit -m "feat(fotografia): fotos reales de instagram en fichas de plato"
```

---

### Task 6: Portadas a sangre

**Files:**
- Create: `apps/cokima/src/components/Hero.astro`
- Create: `apps/ochoa/src/components/Hero.astro`
- Modify: `apps/cokima/src/pages/index.astro:17-37` y su `<style>`
- Modify: `apps/ochoa/src/pages/index.astro:11-31` y su `<style>`

**Interfaces:**
- Consumes: `OpenState` de `@tombo/ui`, `RESTAURANT` de `../site.ts`, la portada de la Task 5.
- Produces: `<Hero locale={"es"|"en"} />`. Ocupa `100svh` menos la cabecera y deja asomar lo siguiente.

- [ ] **Step 1: Crear `apps/cokima/src/components/Hero.astro`**

```astro
---
import { Image } from "astro:assets";
import OpenState from "@tombo/ui/OpenState.astro";
import Embers from "./Embers.astro";
import { RESTAURANT } from "../site.ts";
import hero from "../assets/hero.jpg";

interface Props {
  locale: "es" | "en";
}
const { locale } = Astro.props;
const es = locale === "es";
---

<header class="hero" id="top">
  <Image
    src={hero}
    alt={es ? "Plato de Cokima recién servido" : "A Cokima dish, just served"}
    widths={[480, 780, 1200]}
    sizes="100vw"
    loading="eager"
    fetchpriority="high"
    class="shot"
  />
  <Embers />
  <div class="veil"></div>
  <div class="wrap copy">
    <h1>
      {es ? (
        <>Puedes comer en cualquier sitio. <span class="red">Pero será solo comer.</span></>
      ) : (
        <>You can eat anywhere. <span class="red">But it will just be eating.</span></>
      )}
    </h1>
    <OpenState hours={RESTAURANT.openingHours} locale={locale} />
  </div>
</header>

<style>
  .hero {
    position: relative;
    /* svh y no vh: en móvil, vh cuenta la barra del navegador y la portada se
       corta por abajo justo donde queremos que asome el primer plato. */
    height: calc(100svh - var(--t-header-h, 60px));
    min-height: 420px;
    display: flex;
    align-items: flex-end;
    overflow: hidden;
  }
  .shot {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  /* Degradado solo bajo el texto, no capa uniforme: apagar la foto entera es
     justo lo que hacen las cinco webs de referencia. */
  .veil {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to top,
      rgba(21, 15, 12, 0.92) 0%,
      rgba(21, 15, 12, 0.72) 26%,
      rgba(21, 15, 12, 0) 62%
    );
  }
  .copy {
    position: relative;
    padding-bottom: clamp(26px, 5vw, 54px);
    width: 100%;
  }
  .hero h1 {
    font-weight: 800;
    font-size: clamp(2.3rem, 8.2vw, 5.4rem);
    line-height: 0.99;
    letter-spacing: -0.025em;
    margin: 0 0 14px;
    max-width: 16ch;
    text-wrap: balance;
  }
  .hero h1 .red {
    color: var(--vermilion);
  }
</style>
```

- [ ] **Step 2: Crear `apps/ochoa/src/components/Hero.astro`**

Mismo esqueleto que el paso 1 **sin `Embers`** (es un componente exclusivo de Cokima), con el titular y la piel de Ochoa. Mantener también aquí `id="top"` en el `<header>`:

```astro
    <h1 class="cartel">{es ? "La tasca que te mereces" : "The tavern you deserve"}</h1>
```

Y el `<style>` idéntico salvo:

```css
  .veil {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to top,
      rgba(26, 26, 26, 0.9) 0%,
      rgba(26, 26, 26, 0.66) 28%,
      rgba(26, 26, 26, 0) 62%
    );
  }
  .hero h1 {
    font-size: clamp(2.6rem, 10vw, 6rem);
    line-height: 0.94;
    margin: 0 0 14px;
    max-width: 14ch;
    color: var(--paper);
    text-shadow: 0.04em 0.045em 0 var(--rojo);
  }
```

El `alt` de la imagen: `"Barra de Los Ochoa con el aperitivo servido"` / `"The bar at Los Ochoa with aperitivo served"`.

- [ ] **Step 3: Sustituir el hero de la home de Cokima**

En `apps/cokima/src/pages/index.astro`, borrar el `<header class="hero" id="top">` completo (líneas 17-37) y poner:

```astro
  <Hero locale="es" />
```

Añadir `import Hero from "../components/Hero.astro";` y borrar el import de `Embers`, que ahora vive dentro de `Hero.astro`. Del `<style>` de la página, borrar todas las reglas de `.hero`, `.hero-grid`, `.hero-copy`, `.kicker`, `.hero-cta`, `.hero-photo` y su bloque `@media (max-width: 860px)` asociado.

`id="top"` se conserva en `Hero.astro` aunque su único consumidor (`ReserveBar`) ya no exista: es el ancla de "volver arriba" y no cuesta nada mantenerla.

- [ ] **Step 4: Sustituir el hero de la home de Ochoa**

Igual en `apps/ochoa/src/pages/index.astro`: borrar el `<header class="hero" id="top">` (líneas 11-31), poner `<Hero locale="es" />` con su import, y limpiar del `<style>` las reglas `.hero`, `.hero-grid`, `.kicker`, `.hero-cta`, `.hero-photo`, `.stamp` y las suyas dentro del `@media (max-width: 860px)` final.

- [ ] **Step 5: Medir en el navegador**

A 390 px, en las dos homes:
1. La foto llega a los cuatro bordes y ocupa la pantalla menos la cabecera.
2. El titular está abajo a la izquierda, **no centrado**, y se lee sobre la foto.
3. Bajo el titular aparece el estado de apertura real.
4. La primera ficha de plato **asoma** por el borde inferior.
5. Con DevTools, comprobar que el contraste del titular sobre la zona de foto que le toca llega a 4.5:1.

- [ ] **Step 6: Commit**

```bash
git add apps/*/src/components/Hero.astro apps/*/src/pages/index.astro
git commit -m "feat(homes): portada a sangre con titular anclado y estado de apertura"
```

---

### Task 7: Piel roja de Ochoa

**Files:**
- Modify: `apps/ochoa/src/styles/tokens.css`
- Modify: `apps/ochoa/src/styles/global.css:19,53-69`
- Modify: `packages/ui/src/OpenState.astro:76-81`

**Interfaces:**
- Consumes: la cabecera de la Task 1 y `Highlights` de la Task 4, que ya leen estos tokens.
- Produces: paleta rojo + blanco. `--t-open` desaparece; `OpenState` deja de depender de un color propio.

- [ ] **Step 1: Reescribir los tokens de color**

En `apps/ochoa/src/styles/tokens.css`, dentro de `:root`:

```css
  --paper: #ffffff;
  --paper-2: #f7f4f2;
  --paper-3: #ebe5e2;
  --ink: #1a1a1a;
  --ink-dim: #5c5654;
  --ink-faint: #918a87;
  --rojo: #c6222b;
  --rojo-2: #a81b23;
```

Borrar `--crema` y `--t-open`. Cambiar `--line` a `rgba(26, 26, 26, 0.16)` y `--t-shadow` a `6px 6px 0 rgba(26, 26, 26, 0.9)`.

Retirar la fuente serif: borrar la línea `--serif: Georgia, ...` y cambiar `--t-desc-style` de `italic` a `normal`.

- [ ] **Step 2: Quitar la serif del cuerpo**

En `apps/ochoa/src/styles/global.css`, línea 19, cambiar `font-family: var(--serif);` por `font-family: var(--sans);`.

En `.eyebrow` (líneas 63-69), cambiar `font-family: var(--serif); font-style: italic;` por:

```css
  font-family: var(--sans);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.82rem;
```

- [ ] **Step 3: Añadir el cuadro vichy como utilidad**

Al final de `apps/ochoa/src/styles/global.css`, antes del bloque `@media (prefers-reduced-motion)`:

```css
/* Cuadro vichy rojo y blanco del mantel, generado sin imagen. Se usa como
   separador de sección, nunca como fondo de texto. */
.vichy {
  height: 22px;
  background-image:
    repeating-linear-gradient(90deg, var(--rojo) 0 11px, transparent 11px 22px),
    repeating-linear-gradient(0deg, var(--rojo) 0 11px, transparent 11px 22px);
  background-color: rgba(198, 34, 43, 0.22);
  background-blend-mode: multiply;
}
```

- [ ] **Step 4: Soltar `OpenState` del verde**

En `packages/ui/src/OpenState.astro`, sustituir las reglas de estado (líneas 76-81) por:

```css
  /* El texto ya dice si está abierto: el punto refuerza, no informa por sí solo.
     `--t-open` es opcional; sin él, el punto usa el acento de la marca. */
  .open-state[data-state="open"] .dot {
    background: var(--t-open, var(--t-accent));
  }
  .open-state[data-state="closed"] .dot {
    background: var(--t-text-faint);
  }
```

- [ ] **Step 5: Sustituir el grano de papel por fondo limpio**

En `apps/ochoa/src/styles/global.css`, borrar el bloque `body::before` entero (líneas 25-34). El grano tenía sentido sobre crema; sobre blanco solo ensucia.

- [ ] **Step 6: Verificar que no queda rastro**

```bash
grep -rn "f4eee2\|ece4d3\|e2d8c3\|23201b\|4c6b2f\|--crema" apps/ochoa
```

Esperado: sin resultados.

- [ ] **Step 7: Medir en el navegador**

A 390 px y a 1280 px, recorrer home, `/carta` y `/reservas` de Ochoa:
1. No queda ni un fondo crema.
2. La cabecera es roja con la marca en blanco.
3. La carta pizarra se lee sobre blanco: los precios, la línea de puntos y las rayas de sección tienen contraste suficiente.
4. El estado de apertura muestra punto rojo abierto / gris cerrado, sin verde.

- [ ] **Step 8: Commit**

```bash
git add apps/ochoa/src/styles packages/ui/src/OpenState.astro
git commit -m "feat(ochoa): piel roja y blanca alineada con la marca real"
```

---

### Task 8: Versiones en inglés

**Files:**
- Modify: `apps/cokima/src/pages/en/index.astro`
- Modify: `apps/ochoa/src/pages/en/index.astro`

**Interfaces:**
- Consumes: `Hero` y `Highlights` de las tareas 4 y 6, que ya reciben `locale`.
- Produces: homes inglesas con la misma estructura.

- [ ] **Step 1: Aplicar los mismos cambios en Cokima EN**

En `apps/cokima/src/pages/en/index.astro`: sustituir el `<header class="hero">` por `<Hero locale="en" />`, sustituir el bloque de destacados por `<Highlights dishes={featured} locale="en" href="/en/menu" />`, y cambiar el frontmatter a:

```astro
import { pickFeatured } from "@tombo/content";
const featured = pickFeatured((await getCollection("menu-en")).map((e) => e.data));
```

Limpiar del `<style>` las mismas reglas huérfanas que en la Task 6, y borrar el import de `Embers` (línea 4), que ahora entra por `Hero.astro`.

- [ ] **Step 2: Aplicar los mismos cambios en Ochoa EN**

Idéntico en `apps/ochoa/src/pages/en/index.astro`, con `href="/en/menu"`.

- [ ] **Step 3: Medir en el navegador**

A 390 px, en `/en/` de las dos webs: portada a sangre con el titular en inglés, fichas de plato con los nombres de `menu-en.json`, y el panel de la hamburguesa apuntando a `/en/menu` y `/en/reservations`.

- [ ] **Step 4: Commit**

```bash
git add apps/*/src/pages/en/index.astro
git commit -m "feat(homes): portada y destacados tambien en ingles"
```

---

### Task 9: Verificación final

**Files:** ninguno nuevo. Solo se corrige lo que falle.

- [ ] **Step 1: Tests y build**

```bash
pnpm test
SITE_URL=https://example.com pnpm build
```

Esperado: 43 tests en verde y `Complete!` en las dos apps.

- [ ] **Step 2: Comprobar el peso de la portada**

En DevTools → Network, recargar la home de Cokima a 390 px con caché desactivada. La imagen de portada debe servirse en AVIF o WebP y pesar **menos de los 245 KB** del `hero.jpg` actual.

- [ ] **Step 3: Recorrer los criterios del spec §7**

Uno a uno, a 390 px, en las cuatro homes (ES y EN de las dos marcas):

1. Portada a pantalla completa y primer plato con precio asomando.
2. `[Reservar]` alcanzable sin scroll en cualquier página.
3. Panel de la hamburguesa: `Escape`, clic fuera, foco atrapado.
4. Cartel de cookies sin solaparse, botones del mismo tamaño.
5. Ni rastro de `#f4eee2` ni de `#4c6b2f` en Ochoa.
6. Contraste 4.5:1 en todo texto.
7. Tests verdes y build completo.
8. Portada más ligera que antes.

- [ ] **Step 4: Actualizar el estado del proyecto**

En `docs/estado.md`: mover a "construido" la home de Ochoa con platos, las imágenes optimizadas y la cabecera de Cokima; cerrar las decisiones abiertas del verde oliva y del triple encabezado de Cokima; y dejar constancia de que `/carta` de Ochoa recuperó los 85 px de la barra inferior.

- [ ] **Step 5: Commit**

```bash
git add docs/estado.md
git commit -m "docs: estado tras portadas, chrome nuevo y piel de Ochoa"
```

---

## Riesgos y plan B

- **La descarga de Instagram falla** (Task 5): las URLs del CDN son firmadas y caducan. Tras dos intentos, pedir las fotos a Mario con la lista exacta de nombres y la ruta de destino. Las tareas 1, 2, 3, 4, 7 y 8 no dependen de las fotos: solo la 6 queda bloqueada.
- **La foto no aguanta a pantalla completa en escritorio.** Plan B del spec §8: portada vertical recortada en móvil y composición partida en escritorio, cambiando solo el `@media` de `Hero.astro`.
- **El rojo dominante cansa en pantallas grandes.** Se dosifica por secciones. Si en la medición de la Task 7 resulta agresivo, la cabecera pasa a blanco con la marca en rojo y el rojo queda para bloques puntuales.
