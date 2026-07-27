# Divergencia de layout — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Que Cokima y Los Ochoa dejen de compartir esqueleto — sobre todo en móvil, donde hoy son idénticas — dándole a cada marca una home y una carta derivadas de su propio contenido, con la reserva siempre accesible.

**Architecture:** La lógica pura (estado de apertura, formato de precio ½/entera, búsqueda sin acentos) vive en `packages/content` con tests de vitest y TDD real. La presentación diverge: cada app se queda su propia carta y su propia home; `packages/ui` conserva solo lo común y sin marca. Todo mejora progresiva: la carta se lee entera sin JavaScript.

**Tech Stack:** Astro 6 (estático + adaptador Vercel v10), pnpm workspaces sin Turborepo, vitest, TypeScript, CSS con tokens `--t-*` por marca. Sin frameworks de UI, sin dependencias nuevas.

**Spec:** `docs/superpowers/specs/2026-07-27-divergencia-layout-design.md`

## Global Constraints

- **Mobile-first**: cada layout se escribe primero para móvil; los `@media` añaden el escritorio, no al revés.
- **Ninguna dependencia nueva.** Ni npm, ni fuentes, ni scripts de terceros.
- **Ningún layout depende de fotografía.** Las imágenes son apoyo; todo debe verse bien sin ellas.
- **No se inventa contenido.** Ni platos, ni precios, ni descripciones, ni reseñas, ni señales de urgencia ("quedan 2 mesas" está prohibido).
- **`packages/ui` no lleva ni un color ni una fuente de marca.** Solo tokens `--t-*` con valor por defecto.
- **La estética validada se conserva**: Cokima oscuro "mecha encendida" (Bricolage), Ochoa papel castizo (Anton, sombra dura, sello MADRIZ). Cambia la distribución, no el lenguaje visual.
- **La carta debe leerse completa sin JavaScript.** Toggle, buscador y filtro son mejoras progresivas.
- **`prefers-reduced-motion`** respetado en toda transición o animación.
- **Áreas táctiles ≥ 44px** y foco visible en todo elemento interactivo.
- **Zona horaria anclada a `Europe/Madrid`**, nunca a la del dispositivo.
- **`ALLERGEN_DATA_CONFIRMED = false`** hasta que el cliente firme los datos de alérgenos.
- Scripts de pnpm con **filtro por nombre** (`pnpm --filter cokima`), nunca por ruta: en Windows no casan.
- Comandos desde la raíz del repo, `C:\Users\mario\ochoa-cokima`.

---

## Estructura de archivos

**Crear**
- `packages/content/src/hours.ts` — parser de `openingHours` y `getOpenState()`, puro.
- `packages/content/test/hours.test.ts`
- `packages/content/src/portions.ts` — `formatPortionPrice()`, `hasHalf()`, puro.
- `packages/content/test/portions.test.ts`
- `packages/content/src/search.ts` — `normalize()`, `matchDish()`, puro.
- `packages/content/test/search.test.ts`
- `packages/ui/src/OpenState.astro` — estado de apertura, sin marca.
- `apps/cokima/src/components/MobileNav.astro` — enlaces condensados en cabecera.
- `apps/cokima/src/components/ReserveBar.astro` — barra que aparece tras el hero.
- `apps/cokima/src/components/MenuDeck.astro` — la carta "baraja".
- `apps/cokima/src/components/AllergenFilter.astro` — tras bandera, apagado.
- `apps/ochoa/src/components/BottomBar.astro` — `Carta · Reservar · Llegar`.
- `apps/ochoa/src/components/MenuBoard.astro` — la carta "pizarra".

**Modificar**
- `packages/content/src/index.ts` — reexportar los tres módulos nuevos.
- `apps/{cokima,ochoa}/src/components/Nav.astro` — cabecera móvil, selector ES/EN siempre visible.
- `apps/{cokima,ochoa}/src/layouts/Base.astro` — View Transitions, montaje de barras.
- `apps/{cokima,ochoa}/src/pages/{index,carta}.astro` y sus equivalentes `en/`.
- `apps/{cokima,ochoa}/src/styles/tokens.css` — tokens nuevos de layout.

**Eliminar (al final, Task 12)**
- `packages/ui/src/MenuSection.astro` y `packages/ui/src/DishRow.astro`, cuando ninguna app los use.

---

## Task 1: Estado de apertura (lógica pura)

**Files:**
- Create: `packages/content/src/hours.ts`
- Test: `packages/content/test/hours.test.ts`
- Modify: `packages/content/src/index.ts`

**Interfaces:**
- Consumes: nada.
- Produces: `getOpenState(hours: string[], now: Date): OpenState` donde
  `type OpenState = { open: true; until: string } | { open: false; nextOpen: string | null }`.
  `until`/`nextOpen` son `"HH:MM"` en hora de Madrid. Lo consumen Task 2, 5 y 4.

**Por qué así:** `RESTAURANT.openingHours` ya existe en formato schema.org y ya lo usa el JSON-LD. Parsear esa misma fuente cumple el spec §5.1 ("el cálculo y lo que se muestra son la misma fuente") sin duplicar datos.

Los dos casos difíciles, que son justo los de las marcas reales: `"Fr 09:00-02:30"` cruza a sábado, y `"Mo-Su 09:00-00:00"` cierra a medianoche (fin del día, no principio).

- [ ] **Step 1: Escribir el test que falla**

```ts
// packages/content/test/hours.test.ts
import { describe, it, expect } from "vitest";
import { getOpenState } from "../src/hours.ts";

const OCHOA = ["Mo-Th 09:00-01:00", "Fr 09:00-02:30", "Sa 12:00-02:30", "Su 12:00-01:00"];
const COKIMA = ["Mo-Su 09:00-00:00"];

/** Construye un instante a partir de hora local de Madrid (verano, UTC+2). */
const madridSummer = (iso: string) => new Date(`${iso}+02:00`);
/** Invierno en Madrid, UTC+1. */
const madridWinter = (iso: string) => new Date(`${iso}+01:00`);

describe("getOpenState", () => {
  it("abierto a media tarde de un martes", () => {
    // martes 2026-07-28, 18:30 en Madrid
    expect(getOpenState(OCHOA, madridSummer("2026-07-28T18:30:00"))).toEqual({
      open: true,
      until: "01:00",
    });
  });

  it("cerrado por la mañana temprano indica la próxima apertura", () => {
    // martes 07:00: cerró a la 01:00, abre a las 09:00
    expect(getOpenState(OCHOA, madridSummer("2026-07-28T07:00:00"))).toEqual({
      open: false,
      nextOpen: "09:00",
    });
  });

  it("sigue abierto pasada la medianoche por el turno del día anterior", () => {
    // sábado 00:30 pertenece al turno del viernes (Fr 09:00-02:30)
    expect(getOpenState(OCHOA, madridSummer("2026-08-01T00:30:00"))).toEqual({
      open: true,
      until: "02:30",
    });
  });

  it("cierra el turno nocturno a su hora", () => {
    // sábado 02:31: el turno del viernes terminó; el sábado abre a las 12:00
    expect(getOpenState(OCHOA, madridSummer("2026-08-01T02:31:00"))).toEqual({
      open: false,
      nextOpen: "12:00",
    });
  });

  it("trata 00:00 como fin del día, no como principio", () => {
    // Cokima 23:50: abierto hasta las 00:00
    expect(getOpenState(COKIMA, madridSummer("2026-07-28T23:50:00"))).toEqual({
      open: true,
      until: "00:00",
    });
    // Cokima 00:10: ya cerró, abre a las 09:00
    expect(getOpenState(COKIMA, madridSummer("2026-07-29T00:10:00"))).toEqual({
      open: false,
      nextOpen: "09:00",
    });
  });

  it("usa hora de Madrid, no la del dispositivo", () => {
    // 2026-07-28T23:30 UTC = 2026-07-29T01:30 en Madrid (miércoles) → abierto por el turno del martes
    expect(getOpenState(OCHOA, new Date("2026-07-28T23:30:00Z"))).toEqual({
      open: false,
      nextOpen: "09:00",
    });
  });

  it("respeta el horario de invierno", () => {
    // martes 2026-01-13, 18:30 en Madrid (UTC+1)
    expect(getOpenState(OCHOA, madridWinter("2026-01-13T18:30:00"))).toEqual({
      open: true,
      until: "01:00",
    });
  });

  it("devuelve nextOpen null si no hay horario", () => {
    expect(getOpenState([], madridSummer("2026-07-28T18:30:00"))).toEqual({
      open: false,
      nextOpen: null,
    });
  });
});
```

- [ ] **Step 2: Ejecutar y verificar que falla**

```bash
pnpm --filter @tombo/content test
```

Esperado: FAIL — `Failed to resolve import "../src/hours.ts"`.

- [ ] **Step 3: Implementar**

```ts
// packages/content/src/hours.ts

/** Estado de apertura resuelto en hora de Madrid. */
export type OpenState =
  | { open: true; until: string }
  | { open: false; nextOpen: string | null };

const DAY_CODE: Record<string, number> = { Su: 0, Mo: 1, Tu: 2, We: 3, Th: 4, Fr: 5, Sa: 6 };
const EN_WEEKDAY: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

/** Intervalo de un día concreto. `end` puede pasar de 1440 si cruza medianoche. */
interface Interval {
  day: number;
  start: number;
  end: number;
}

const toMinutes = (hhmm: string): number => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

const toLabel = (minutes: number): string => {
  const wrapped = ((minutes % 1440) + 1440) % 1440;
  const h = String(Math.floor(wrapped / 60)).padStart(2, "0");
  const m = String(wrapped % 60).padStart(2, "0");
  return `${h}:${m}`;
};

/** "Mo-Th" → [1,2,3,4] · "Mo-Su" → los siete · "Mo,We" → [1,3] */
const expandDays = (spec: string): number[] => {
  const out: number[] = [];
  for (const chunk of spec.split(",")) {
    const [from, to] = chunk.split("-");
    const start = DAY_CODE[from];
    if (start === undefined) continue;
    if (to === undefined) {
      out.push(start);
      continue;
    }
    const end = DAY_CODE[to];
    if (end === undefined) continue;
    for (let i = 0; i < 7; i++) {
      const day = (start + i) % 7;
      out.push(day);
      if (day === end) break;
    }
  }
  return out;
};

const parseRule = (rule: string): Interval[] => {
  const [daysSpec, timeSpec] = rule.trim().split(/\s+/);
  if (!daysSpec || !timeSpec) return [];
  const [startRaw, endRaw] = timeSpec.split("-");
  if (!startRaw || !endRaw) return [];
  const start = toMinutes(startRaw);
  let end = toMinutes(endRaw);
  // "09:00-01:00" cruza medianoche; "09:00-00:00" cierra al final del día.
  if (end <= start) end += 1440;
  return expandDays(daysSpec).map((day) => ({ day, start, end }));
};

/** Día de la semana y minutos transcurridos, siempre en Europe/Madrid. */
const madridNow = (now: Date): { day: number; minutes: number } => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Madrid",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return {
    day: EN_WEEKDAY[get("weekday")] ?? 0,
    minutes: Number(get("hour")) * 60 + Number(get("minute")),
  };
};

export function getOpenState(hours: string[], now: Date): OpenState {
  const intervals = hours.flatMap(parseRule);
  if (intervals.length === 0) return { open: false, nextOpen: null };

  const { day, minutes } = madridNow(now);
  const yesterday = (day + 6) % 7;

  for (const iv of intervals) {
    // Turno que empezó hoy.
    if (iv.day === day && minutes >= iv.start && minutes < iv.end) {
      return { open: true, until: toLabel(iv.end) };
    }
    // Turno de ayer que se alargó pasada la medianoche.
    if (iv.day === yesterday && iv.end > 1440 && minutes + 1440 >= iv.start && minutes + 1440 < iv.end) {
      return { open: true, until: toLabel(iv.end) };
    }
  }

  // Cerrado: la apertura más próxima en los próximos siete días.
  let best: number | null = null;
  for (let ahead = 0; ahead < 8; ahead++) {
    const target = (day + ahead) % 7;
    for (const iv of intervals) {
      if (iv.day !== target) continue;
      const absolute = ahead * 1440 + iv.start;
      if (absolute <= minutes) continue;
      if (best === null || absolute < best) best = absolute;
    }
    if (best !== null) break;
  }

  return { open: false, nextOpen: best === null ? null : toLabel(best) };
}
```

- [ ] **Step 4: Reexportar desde el índice del paquete**

En `packages/content/src/index.ts`, añadir al final:

```ts
export { getOpenState, type OpenState } from "./hours.ts";
```

- [ ] **Step 5: Ejecutar y verificar que pasa**

```bash
pnpm --filter @tombo/content test
```

Esperado: PASS, 8 tests nuevos en `hours.test.ts` y los 4 anteriores de `schema.test.ts` intactos.

- [ ] **Step 6: Commit**

```bash
git add packages/content/src/hours.ts packages/content/test/hours.test.ts packages/content/src/index.ts
git commit -m "feat(content): estado de apertura en hora de Madrid desde openingHours"
```

---

## Task 2: Componente `OpenState` (sin marca)

**Files:**
- Create: `packages/ui/src/OpenState.astro`

**Interfaces:**
- Consumes: `getOpenState` de Task 1.
- Produces: `<OpenState hours={string[]} locale={"es"|"en"} />`. Lo montan Task 4 y Task 5.

**Por qué en el cliente:** las páginas son estáticas y se sirven cacheadas. Si el estado se renderizara en build, alguien vería "abierto ahora" con el local cerrado. Mientras el script no resuelve, **no se muestra nada** — nunca un valor por defecto que pueda ser falso (spec §5.1).

- [ ] **Step 1: Crear el componente**

```astro
---
// packages/ui/src/OpenState.astro
interface Props {
  hours: string[];
  locale: "es" | "en";
}
const { hours, locale } = Astro.props;
const labels =
  locale === "es"
    ? { open: "Abierto ahora", until: "hasta las", closed: "Cerrado", next: "abre a las" }
    : { open: "Open now", until: "until", closed: "Closed", next: "opens at" };
---

<span
  class="open-state"
  data-open-state
  data-hours={JSON.stringify(hours)}
  data-labels={JSON.stringify(labels)}
  hidden
>
  <i class="dot" aria-hidden="true"></i><span class="text"></span>
</span>

<script>
  import { getOpenState } from "@tombo/content";

  const render = (el: HTMLElement) => {
    const hours = JSON.parse(el.dataset.hours ?? "[]") as string[];
    const labels = JSON.parse(el.dataset.labels ?? "{}");
    const state = getOpenState(hours, new Date());
    const text = el.querySelector(".text");
    if (!text) return;

    if (state.open) {
      text.textContent = `${labels.open} · ${labels.until} ${state.until}`;
      el.dataset.state = "open";
    } else if (state.nextOpen) {
      text.textContent = `${labels.closed} · ${labels.next} ${state.nextOpen}`;
      el.dataset.state = "closed";
    } else {
      return; // Sin horario: no afirmamos nada.
    }
    el.hidden = false;
  };

  const mount = () => document.querySelectorAll<HTMLElement>("[data-open-state]").forEach(render);
  mount();
  document.addEventListener("astro:page-load", mount);
</script>

<style>
  .open-state {
    display: inline-flex;
    align-items: center;
    gap: 0.5ch;
    font-size: var(--t-open-state-size, 0.82rem);
    color: var(--t-text-dim);
    line-height: 1.2;
  }
  .open-state[hidden] {
    display: none;
  }
  .dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--t-text-faint);
    flex: none;
  }
  .open-state[data-state="open"] .dot {
    background: var(--t-open, #3f9d5a);
  }
  .open-state[data-state="closed"] .dot {
    background: var(--t-text-faint);
  }
</style>
```

- [ ] **Step 2: No tocar `packages/ui/src/index.ts`**

Ese archivo solo exporta tipos (`RestaurantInfo`, `Dish`, `MenuEntry`, `Allergen`) y `hasHalfPortions`. Los componentes `.astro` **no se exportan ahí**: se importan por subpath (`@tombo/ui/OpenState.astro`), que ya funciona gracias al export `"./*"` del `package.json`. Igual que `Seo.astro` o `ConsentBanner.astro`.

- [ ] **Step 3: Verificar que ambas apps siguen compilando**

```bash
pnpm build
```

Esperado: `Complete!` en las dos apps, sin avisos nuevos.

- [ ] **Step 4: Commit**

```bash
git add packages/ui/src/OpenState.astro
git commit -m "feat(ui): componente OpenState sin marca, resuelto en cliente"
```

---

## Task 3: Cokima — navegación móvil en cabecera

**Files:**
- Modify: `apps/cokima/src/components/Nav.astro`

**Interfaces:**
- Consumes: nada.
- Produces: cabecera con enlaces visibles en móvil. Task 5 asume que la cabecera **no** ocupa la zona inferior.

**Problema que cierra:** hoy `@media (max-width: 780px) { .nav-links { display: none } }` deja al móvil sin navegación. Con dos enlaces no compensa una hamburguesa: se condensan y se muestran.

- [ ] **Step 1: Sustituir el bloque `@media` que oculta los enlaces**

En vez de ocultarlos, reducir tamaño y separación, y bajar la fila de enlaces bajo la marca:

```css
@media (max-width: 780px) {
  .nav-in {
    height: auto;
    flex-wrap: wrap;
    padding-block: 10px;
    row-gap: 8px;
  }
  .nav-links {
    order: 3;
    flex-basis: 100%;
    gap: 18px;
    font-size: 0.9rem;
  }
  .nav-links a {
    padding-block: 8px; /* área táctil ≥ 44px con la línea */
    display: inline-block;
  }
}
```

Eliminar por completo la regla `.nav-links { display: none }`.

- [ ] **Step 2: Confirmar que el selector ES/EN queda siempre visible**

El `<span class="lang">` no debe entrar en ninguna regla de ocultación en ningún breakpoint. Es requisito de i18n (spec §5.1).

- [ ] **Step 3: Verificar en el navegador a 375px**

Arrancar la preview de Cokima con `preview_start` (config `cokima` de `.claude/launch.json`), `resize_window` a `mobile`, y comprobar con `read_page` que `La carta`, `Dónde estamos` y el selector `ES · EN` están presentes y son alcanzables.

- [ ] **Step 4: Commit**

```bash
git add apps/cokima/src/components/Nav.astro
git commit -m "fix(cokima): navegacion movil visible, hoy oculta bajo 780px"
```

---

## Task 4: Ochoa — barra inferior fija

**Files:**
- Create: `apps/ochoa/src/components/BottomBar.astro`
- Modify: `apps/ochoa/src/components/Nav.astro`, `apps/ochoa/src/layouts/Base.astro`, `apps/ochoa/src/styles/tokens.css`

**Interfaces:**
- Consumes: `OpenState` de Task 2, `RESTAURANT.openingHours` de `apps/ochoa/src/site.ts`.
- Produces: `<BottomBar locale={"es"|"en"} />` montado en `Base.astro`. Reserva `--t-bottom-bar-h` de relleno inferior al `<body>`.

- [ ] **Step 1: Crear la barra**

```astro
---
// apps/ochoa/src/components/BottomBar.astro
import OpenState from "@tombo/ui/OpenState.astro";
import { RESTAURANT } from "../site.ts";

interface Props {
  locale: "es" | "en";
}
const { locale } = Astro.props;
const es = locale === "es";
const items = es
  ? [
      { href: "/carta", label: "Carta" },
      { href: "/reservas", label: "Reservar", primary: true },
      { href: "/#visita", label: "Llegar" },
    ]
  : [
      { href: "/en/menu", label: "Menu" },
      { href: "/en/reservations", label: "Book", primary: true },
      { href: "/en/#visit", label: "Find us" },
    ];
---

<nav class="bottom-bar" aria-label={es ? "Acciones principales" : "Main actions"}>
  <div class="status"><OpenState hours={RESTAURANT.openingHours} locale={locale} /></div>
  <ul>
    {items.map((i) => (
      <li>
        <a href={i.href} class:list={["item", { primary: i.primary }]}>{i.label}</a>
      </li>
    ))}
  </ul>
</nav>

<style>
  .bottom-bar {
    position: fixed;
    inset: auto 0 0 0;
    z-index: 30;
    background: var(--paper);
    border-top: 2px solid var(--ink);
    padding-bottom: env(safe-area-inset-bottom);
  }
  .status {
    display: flex;
    justify-content: center;
    padding: 5px 0 0;
  }
  .status:empty {
    display: none;
  }
  ul {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 6px;
    list-style: none;
    margin: 0;
    padding: 8px 10px 10px;
  }
  .item {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 44px;
    font-family: var(--sans);
    font-size: 0.95rem;
    color: var(--ink);
    border: 1.5px solid transparent;
    border-radius: 4px;
  }
  .item.primary {
    background: var(--rojo);
    color: var(--paper);
    border-color: var(--ink);
    box-shadow: 3px 3px 0 var(--ink);
    font-weight: 600;
  }
  .item:focus-visible {
    outline: 2px solid var(--rojo);
    outline-offset: 2px;
  }
  /* En escritorio manda la cabecera: la barra inferior sobra. */
  @media (min-width: 781px) {
    .bottom-bar {
      display: none;
    }
  }
</style>
```

- [ ] **Step 2: Montarla y reservar el hueco**

En `apps/ochoa/src/layouts/Base.astro`, importar `BottomBar` y renderizarla justo antes de `<ConsentBanner …/>`:

```astro
<BottomBar locale={locale} />
```

En `apps/ochoa/src/styles/tokens.css`, dentro del bloque `:root`, añadir el token y el relleno para que la barra no tape el pie:

```css
--t-bottom-bar-h: 104px;
```

y, fuera de `:root`:

```css
@media (max-width: 780px) {
  body {
    padding-bottom: var(--t-bottom-bar-h);
  }
}
```

- [ ] **Step 3: Reducir la cabecera en móvil**

En `apps/ochoa/src/components/Nav.astro`, la navegación móvil es ahora la barra inferior, así que la cabecera se queda con marca y selector de idioma. Mantener el `@media (max-width: 780px) { .nav-links { display: none } }` existente — **aquí sí es correcto**, porque los enlaces están en la barra inferior. No tocar el `<span class="lang">`: debe seguir visible.

- [ ] **Step 4: Verificar en el navegador**

Preview de Ochoa, `resize_window` a `mobile`. Comprobar: la barra está fija abajo, el pie es alcanzable sin quedar tapado, y `read_console_messages` no muestra errores. A 1280px la barra debe desaparecer y los enlaces de cabecera volver.

- [ ] **Step 5: Commit**

```bash
git add apps/ochoa/src/components/BottomBar.astro apps/ochoa/src/components/Nav.astro apps/ochoa/src/layouts/Base.astro apps/ochoa/src/styles/tokens.css
git commit -m "feat(ochoa): barra inferior fija con estado de apertura"
```

---

## Task 5: Cokima — barra de reserva que aparece tras el hero

**Files:**
- Create: `apps/cokima/src/components/ReserveBar.astro`
- Modify: `apps/cokima/src/layouts/Base.astro`, `apps/cokima/src/styles/tokens.css`

**Interfaces:**
- Consumes: `OpenState` de Task 2, `RESTAURANT.openingHours` de `apps/cokima/src/site.ts`.
- Produces: `<ReserveBar locale={"es"|"en"} />`. Se revela cuando el elemento `#top` sale del viewport; en páginas sin `#top` (carta, reservas) se muestra desde el principio.

- [ ] **Step 1: Crear el componente**

```astro
---
// apps/cokima/src/components/ReserveBar.astro
import OpenState from "@tombo/ui/OpenState.astro";
import { RESTAURANT } from "../site.ts";

interface Props {
  locale: "es" | "en";
}
const { locale } = Astro.props;
const es = locale === "es";
const href = es ? "/reservas" : "/en/reservations";
const label = es ? "Reservar mesa" : "Book a table";
---

<div class="reserve-bar" data-reserve-bar>
  <div class="status"><OpenState hours={RESTAURANT.openingHours} locale={locale} /></div>
  <a href={href} class="btn">{label}</a>
</div>

<script>
  const mount = () => {
    const bar = document.querySelector<HTMLElement>("[data-reserve-bar]");
    if (!bar) return;
    const hero = document.querySelector("#top");

    // Sin hero (carta, reservas): visible desde el principio.
    if (!hero) {
      bar.dataset.shown = "true";
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        bar.dataset.shown = entry.isIntersecting ? "false" : "true";
      },
      { rootMargin: "-40% 0px 0px 0px" },
    );
    io.observe(hero);
  };

  mount();
  document.addEventListener("astro:page-load", mount);
</script>

<style>
  .reserve-bar {
    position: fixed;
    inset: auto 0 0 0;
    z-index: 30;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    padding: 10px 16px calc(10px + env(safe-area-inset-bottom));
    background: rgba(21, 15, 12, 0.92);
    backdrop-filter: blur(10px);
    border-top: 1px solid var(--line);
    transform: translateY(110%);
    transition: transform 260ms ease;
  }
  .reserve-bar[data-shown="true"] {
    transform: translateY(0);
  }
  .reserve-bar .btn {
    min-height: 44px;
    display: inline-flex;
    align-items: center;
  }
  .status:empty {
    display: none;
  }
  @media (prefers-reduced-motion: reduce) {
    .reserve-bar {
      transition: none;
    }
  }
  @media (min-width: 861px) {
    .reserve-bar {
      display: none;
    }
  }
</style>
```

- [ ] **Step 2: Montar y reservar el hueco**

En `apps/cokima/src/layouts/Base.astro`, importar y renderizar `<ReserveBar locale={locale} />` justo antes de `<ConsentBanner …/>`.

En `apps/cokima/src/styles/tokens.css`, añadir `--t-bottom-bar-h: 72px;` en `:root` y:

```css
@media (max-width: 860px) {
  body {
    padding-bottom: var(--t-bottom-bar-h);
  }
}
```

- [ ] **Step 3: Verificar en el navegador**

Preview de Cokima, `mobile`. En la home: la barra **no** se ve al cargar; al hacer scroll pasado el hero, aparece. En `/carta`: visible desde el inicio. Comprobar `read_console_messages` sin errores.

- [ ] **Step 4: Commit**

```bash
git add apps/cokima/src/components/ReserveBar.astro apps/cokima/src/layouts/Base.astro apps/cokima/src/styles/tokens.css
git commit -m "feat(cokima): barra de reserva persistente tras el hero"
```

---

## Task 6: Precio ½/entera (lógica pura)

**Files:**
- Create: `packages/content/src/portions.ts`, `packages/content/test/portions.test.ts`
- Modify: `packages/content/src/index.ts`

**Interfaces:**
- Consumes: `Dish` de `packages/content/src/index.ts`.
- Produces:
  - `type Portion = "half" | "full"`
  - `formatPortionPrice(price: Dish["price"], portion: Portion): { amount: number; onlyFull: boolean }`
  - `formatEuro(amount: number): string` → `"12,50 €"` (coma decimal, espacio fino antes del símbolo).
  Los consume Task 7.

**Por qué:** el toggle de la pizarra es la interacción firma. Su lógica —qué precio mostrar y qué hacer con `half: null`— es pura y merece test, no enterrarla en un `<script>`.

- [ ] **Step 1: Escribir el test que falla**

```ts
// packages/content/test/portions.test.ts
import { describe, it, expect } from "vitest";
import { formatPortionPrice, formatEuro } from "../src/portions.ts";

describe("formatPortionPrice", () => {
  it("devuelve la media cuando existe", () => {
    expect(formatPortionPrice({ half: 7, full: 12 }, "half")).toEqual({ amount: 7, onlyFull: false });
  });

  it("devuelve la entera", () => {
    expect(formatPortionPrice({ half: 7, full: 12 }, "full")).toEqual({ amount: 12, onlyFull: false });
  });

  it("cae a la entera y lo marca cuando no hay media (half: null)", () => {
    expect(formatPortionPrice({ half: null, full: 18 }, "half")).toEqual({ amount: 18, onlyFull: true });
  });

  it("un precio único no depende de la porción", () => {
    expect(formatPortionPrice(18, "half")).toEqual({ amount: 18, onlyFull: false });
    expect(formatPortionPrice(18, "full")).toEqual({ amount: 18, onlyFull: false });
  });
});

describe("formatEuro", () => {
  // Ojo: el separador es un espacio duro ( ) para que el importe no
  // parta de línea. Escribirlo explícito en el test, no un espacio normal.
  it("usa coma decimal solo cuando hay céntimos", () => {
    expect(formatEuro(12)).toBe("12 €");
    expect(formatEuro(12.5)).toBe("12,50 €");
    expect(formatEuro(3.9)).toBe("3,90 €");
  });
});
```

- [ ] **Step 2: Ejecutar y verificar que falla**

```bash
pnpm --filter @tombo/content test
```

Esperado: FAIL — no resuelve `../src/portions.ts`.

- [ ] **Step 3: Implementar**

```ts
// packages/content/src/portions.ts
import type { Dish } from "./index.ts";

export type Portion = "half" | "full";

/**
 * Resuelve el importe a mostrar. `onlyFull` marca los platos que no tienen
 * media ración (`half: null`, el guion de la carta de Los Ochoa): en vez de
 * dejar un hueco, se muestra la entera y se avisa.
 */
export function formatPortionPrice(
  price: Dish["price"],
  portion: Portion,
): { amount: number; onlyFull: boolean } {
  if (typeof price === "number") return { amount: price, onlyFull: false };
  if (portion === "full") return { amount: price.full, onlyFull: false };
  if (price.half === null) return { amount: price.full, onlyFull: true };
  return { amount: price.half, onlyFull: false };
}

export function formatEuro(amount: number): string {
  const hasCents = Math.round(amount * 100) % 100 !== 0;
  const body = hasCents ? amount.toFixed(2).replace(".", ",") : String(Math.round(amount));
  return `${body}\u00a0€`;
}
```

- [ ] **Step 4: Reexportar**

En `packages/content/src/index.ts`:

```ts
export { formatPortionPrice, formatEuro, type Portion } from "./portions.ts";
```

- [ ] **Step 5: Ejecutar y verificar que pasa**

```bash
pnpm --filter @tombo/content test
```

Esperado: PASS, 5 tests nuevos en `portions.test.ts`.

Si falla comparando importes, el separador del test se ha escrito como espacio normal en vez de espacio duro `\u00a0`. Corregirlo en el test, no en `formatEuro`. El carácter correcto es `\u00a0`.

- [ ] **Step 6: Commit**

```bash
git add packages/content/src/portions.ts packages/content/test/portions.test.ts packages/content/src/index.ts
git commit -m "feat(content): resolucion de precio media/entera y formato en euros"
```

---

## Task 7: Ochoa — la carta "pizarra"

**Files:**
- Create: `apps/ochoa/src/components/MenuBoard.astro`
- Modify: `apps/ochoa/src/pages/carta.astro`, `apps/ochoa/src/pages/en/menu.astro`

**Interfaces:**
- Consumes: `formatPortionPrice`, `formatEuro`, `Portion` de Task 6.
- Produces: `<MenuBoard dishes={MenuEntry[]} locale={"es"|"en"} />`.

**Diseño (spec §5.4):** una columna densa; fila `nombre · línea de puntos · precio`; toggle global ½/entera pegajoso arriba; `half: null` marcado como "solo ración entera".

**Sin JavaScript debe leerse entera.** El HTML se renderiza con la porción `full` y **ambos** importes van en `data-` attributes; el script solo reescribe. El toggle se renderiza `hidden` y el script lo revela.

- [ ] **Step 1: Crear el componente**

```astro
---
// apps/ochoa/src/components/MenuBoard.astro
import { formatPortionPrice, formatEuro, type MenuEntry } from "@tombo/content";

interface Props {
  dishes: MenuEntry[];
  locale: "es" | "en";
}
const { dishes, locale } = Astro.props;
const es = locale === "es";
const t = es
  ? { half: "½ ración", full: "Ración", onlyFull: "solo ración entera", legend: "Tamaño de ración" }
  : { half: "Half", full: "Full", onlyFull: "full portion only", legend: "Portion size" };

const sorted = [...dishes].sort((a, b) => a.order - b.order);
---

<div class="board">
  <div class="toggle" data-portion-toggle hidden>
    <span class="legend" id="portion-legend">{t.legend}</span>
    <div class="switch" role="group" aria-labelledby="portion-legend">
      <button type="button" data-portion="half" aria-pressed="false">{t.half}</button>
      <button type="button" data-portion="full" aria-pressed="true">{t.full}</button>
    </div>
  </div>

  <ul class="rows">
    {sorted.map((dish) => {
      const half = formatPortionPrice(dish.price, "half");
      const full = formatPortionPrice(dish.price, "full");
      return (
        <li class="row" data-dish>
          <div class="head">
            <span class="name">{dish.name}</span>
            <span class="leader" aria-hidden="true"></span>
            <span
              class="price"
              data-half={formatEuro(half.amount)}
              data-full={formatEuro(full.amount)}
              data-only-full={half.onlyFull ? "true" : "false"}
            >{formatEuro(full.amount)}</span>
          </div>
          {dish.description && <p class="desc">{dish.description}</p>}
          <p class="only-full" data-only-full-note hidden>{t.onlyFull}</p>
        </li>
      );
    })}
  </ul>
</div>

<script>
  const mount = () => {
    const toggle = document.querySelector<HTMLElement>("[data-portion-toggle]");
    if (!toggle) return;
    toggle.hidden = false;

    const apply = (portion: "half" | "full") => {
      document.querySelectorAll<HTMLElement>("[data-dish]").forEach((row) => {
        const price = row.querySelector<HTMLElement>(".price");
        const note = row.querySelector<HTMLElement>("[data-only-full-note]");
        if (!price) return;
        price.textContent = portion === "half" ? price.dataset.half! : price.dataset.full!;
        const onlyFull = price.dataset.onlyFull === "true";
        if (note) note.hidden = !(portion === "half" && onlyFull);
      });
      toggle.querySelectorAll<HTMLButtonElement>("button[data-portion]").forEach((b) => {
        b.setAttribute("aria-pressed", String(b.dataset.portion === portion));
      });
    };

    toggle.querySelectorAll<HTMLButtonElement>("button[data-portion]").forEach((b) => {
      b.addEventListener("click", () => apply(b.dataset.portion as "half" | "full"));
    });
  };

  mount();
  document.addEventListener("astro:page-load", mount);
</script>

<style>
  .toggle {
    position: sticky;
    top: 66px;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 10px 0;
    background: var(--paper);
    border-bottom: 3px solid var(--ink);
  }
  .toggle[hidden] {
    display: none;
  }
  .legend {
    font-family: var(--sans);
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--ink-dim);
  }
  .switch {
    display: flex;
    border: 2px solid var(--ink);
    border-radius: 4px;
    overflow: hidden;
  }
  .switch button {
    min-height: 44px;
    padding: 0 14px;
    font-family: var(--sans);
    font-size: 0.9rem;
    background: transparent;
    color: var(--ink);
    border: 0;
    cursor: pointer;
  }
  .switch button[aria-pressed="true"] {
    background: var(--ink);
    color: var(--paper);
    font-weight: 600;
  }
  .switch button:focus-visible {
    outline: 2px solid var(--rojo);
    outline-offset: -4px;
  }
  .rows {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .row {
    padding: 14px 0;
    border-bottom: 1px solid var(--line);
  }
  .head {
    display: flex;
    align-items: baseline;
    gap: 8px;
  }
  .name {
    font-size: 1.06rem;
  }
  .leader {
    flex: 1;
    border-bottom: 1px dotted var(--ink-faint);
    transform: translateY(-0.25em);
  }
  .price {
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }
  .desc {
    margin: 0.35rem 0 0;
    color: var(--ink-dim);
    font-size: 0.95rem;
    max-width: 60ch;
  }
  .only-full {
    margin: 0.3rem 0 0;
    font-family: var(--serif);
    font-style: italic;
    font-size: 0.85rem;
    color: var(--rojo);
  }
  .only-full[hidden] {
    display: none;
  }
</style>
```

- [ ] **Step 2: Usarlo en las dos cartas**

En `apps/ochoa/src/pages/carta.astro`, sustituir los `<MenuSection …/>` por:

```astro
<MenuBoard dishes={all} locale="es" />
```

manteniendo el encabezado de página y la nota al pie que ya existen. Repetir en `apps/ochoa/src/pages/en/menu.astro` con `locale="en"` y la colección `menu-en`. Eliminar el import de `MenuSection` en ambos archivos.

- [ ] **Step 3: Verificar sin JavaScript**

Con la preview de Ochoa abierta en `/carta`, ejecutar:

```js
document.querySelectorAll("[data-dish]").length
```

Esperado: `25`. Y comprobar con `read_page` que cada fila muestra un precio ya en el HTML servido (la porción entera) y que el toggle solo aparece con JS activo.

- [ ] **Step 4: Verificar el toggle**

Pulsar `½ ración` con `computer` y comprobar con `read_page` que los precios cambian y que los platos con `half: null` muestran *"solo ración entera"*. Volver a `Ración` y confirmar que la nota desaparece.

- [ ] **Step 5: Commit**

```bash
git add apps/ochoa/src/components/MenuBoard.astro apps/ochoa/src/pages/carta.astro apps/ochoa/src/pages/en/menu.astro
git commit -m "feat(ochoa): carta pizarra con toggle global media/entera"
```

---

## Task 8: Búsqueda sin acentos (lógica pura) + buscador de Ochoa

**Files:**
- Create: `packages/content/src/search.ts`, `packages/content/test/search.test.ts`
- Modify: `packages/content/src/index.ts`, `apps/ochoa/src/components/MenuBoard.astro`

**Interfaces:**
- Consumes: `MenuBoard` de Task 7.
- Produces: `normalize(text: string): string`, `matchDish(dish: { name: string; description?: string }, query: string): boolean`.

**Por qué importa:** en español, buscar "jamon" tiene que encontrar "jamón". Sin normalizar, el buscador parece roto.

- [ ] **Step 1: Escribir el test que falla**

```ts
// packages/content/test/search.test.ts
import { describe, it, expect } from "vitest";
import { normalize, matchDish } from "../src/search.ts";

describe("normalize", () => {
  it("quita acentos y baja a minúsculas", () => {
    expect(normalize("Jamón Ibérico")).toBe("jamon iberico");
  });
  it("conserva la ñ como n para que 'nino' encuentre 'niño'", () => {
    expect(normalize("Niño")).toBe("nino");
  });
  it("colapsa espacios", () => {
    expect(normalize("  huevos   rotos ")).toBe("huevos rotos");
  });
});

describe("matchDish", () => {
  const dish = { name: "Croquetas de jamón Joselito", description: "Con velo de papada ibérica." };

  it("encuentra por nombre sin acentos", () => {
    expect(matchDish(dish, "jamon")).toBe(true);
  });
  it("encuentra por descripción", () => {
    expect(matchDish(dish, "papada")).toBe(true);
  });
  it("no encuentra lo que no está", () => {
    expect(matchDish(dish, "gamba")).toBe(false);
  });
  it("una consulta vacía casa con todo", () => {
    expect(matchDish(dish, "   ")).toBe(true);
  });
  it("tolera platos sin descripción", () => {
    expect(matchDish({ name: "Ensaladilla" }, "ensalad")).toBe(true);
  });
});
```

- [ ] **Step 2: Ejecutar y verificar que falla**

```bash
pnpm --filter @tombo/content test
```

Esperado: FAIL — no resuelve `../src/search.ts`.

- [ ] **Step 3: Implementar**

```ts
// packages/content/src/search.ts

/** Minúsculas, sin diacríticos y con espacios colapsados. */
export function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export function matchDish(
  dish: { name: string; description?: string },
  query: string,
): boolean {
  const q = normalize(query);
  if (q === "") return true;
  const haystack = normalize(`${dish.name} ${dish.description ?? ""}`);
  return haystack.includes(q);
}
```

- [ ] **Step 4: Reexportar y verificar**

En `packages/content/src/index.ts`:

```ts
export { normalize, matchDish } from "./search.ts";
```

```bash
pnpm --filter @tombo/content test
```

Esperado: PASS, todos los tests de los cuatro archivos.

- [ ] **Step 5: Añadir el buscador a `MenuBoard.astro`**

En el frontmatter, ampliar `t` con `{ search: es ? "Buscar plato" : "Search dish", empty: es ? "Nada con ese nombre." : "Nothing by that name." }`.

Dentro de `.toggle`, antes del `.switch`, añadir el campo (marcado `hidden` como el resto: sin JS no filtra nada, así que no se ofrece):

```astro
<label class="search" data-search-wrap hidden>
  <span class="sr-only">{t.search}</span>
  <input type="search" data-search placeholder={t.search} autocomplete="off" />
</label>
```

Tras la lista, el aviso de vacío:

```astro
<p class="empty" data-empty hidden>{t.empty}</p>
```

En cada `<li class="row" data-dish>` añadir los datos a filtrar:

```astro
data-name={dish.name} data-desc={dish.description ?? ""}
```

En el `<script>`, añadir el import **arriba del todo, junto al resto de imports del módulo** — nunca dentro de `mount()`, que sería error de sintaxis:

```ts
import { matchDish } from "@tombo/content";
```

Y dentro de `mount()`, después de revelar el toggle:

```ts
const wrap = document.querySelector<HTMLElement>("[data-search-wrap]");
const input = document.querySelector<HTMLInputElement>("[data-search]");
const empty = document.querySelector<HTMLElement>("[data-empty]");
if (wrap) wrap.hidden = false;

input?.addEventListener("input", () => {
  const q = input.value;
  let visible = 0;
  document.querySelectorAll<HTMLElement>("[data-dish]").forEach((row) => {
    const hit = matchDish({ name: row.dataset.name ?? "", description: row.dataset.desc }, q);
    row.hidden = !hit;
    if (hit) visible++;
  });
  if (empty) empty.hidden = visible > 0;
});
```

Estilos del campo, coherentes con la pizarra:

```css
.search input {
  min-height: 44px;
  padding: 0 12px;
  font-family: var(--sans);
  font-size: 0.95rem;
  color: var(--ink);
  background: transparent;
  border: 2px solid var(--ink);
  border-radius: 4px;
  width: 100%;
  max-width: 200px;
}
.search input:focus-visible {
  outline: 2px solid var(--rojo);
  outline-offset: 2px;
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
.empty[hidden] {
  display: none;
}
```

- [ ] **Step 6: Verificar en el navegador**

En `/carta` de Ochoa, escribir `jamon` con `computer` y comprobar con `read_page` que quedan visibles solo los platos que lo contienen, acento incluido. Borrar y confirmar que vuelven los 25.

- [ ] **Step 7: Commit**

```bash
git add packages/content/src/search.ts packages/content/test/search.test.ts packages/content/src/index.ts apps/ochoa/src/components/MenuBoard.astro
git commit -m "feat(ochoa): buscador instantaneo de carta, insensible a acentos"
```

---

## Task 9: Cokima — la carta "baraja"

**Files:**
- Create: `apps/cokima/src/components/MenuDeck.astro`
- Modify: `apps/cokima/src/pages/carta.astro`, `apps/cokima/src/pages/en/menu.astro`

**Interfaces:**
- Consumes: `formatEuro` de Task 6, `AllergenIcons` de `packages/ui`.
- Produces: `<MenuDeck sections={{ id: string; title: string; dishes: MenuEntry[] }[]} locale allergenLabels />`.

**Diseño (spec §5.3):** tabs de sección pegajosas; cada sección es una fila con scroll-snap horizontal en móvil; cada plato ocupa ~85% del ancho y asoma el siguiente; en escritorio se despliega en retícula asimétrica de dos columnas desiguales.

**Sin JavaScript**: las tabs son anclas `href="#seccion"` que funcionan solas; el scroll horizontal es nativo. El JS solo marca la tab activa.

- [ ] **Step 1: Crear el componente**

```astro
---
// apps/cokima/src/components/MenuDeck.astro
import { formatEuro, type MenuEntry } from "@tombo/content";
import AllergenIcons from "@tombo/ui/AllergenIcons.astro";

interface Section {
  id: string;
  title: string;
  dishes: MenuEntry[];
}
interface Props {
  sections: Section[];
  locale: "es" | "en";
  allergenLabels: Record<string, string>;
}
const { sections, locale, allergenLabels } = Astro.props;
const navLabel = locale === "es" ? "Secciones de la carta" : "Menu sections";
---

<nav class="tabs" aria-label={navLabel}>
  <ul>
    {sections.map((s) => (
      <li><a href={`#${s.id}`} data-tab={s.id}>{s.title}</a></li>
    ))}
  </ul>
</nav>

{sections.map((s) => (
  <section class="deck-section" id={s.id} data-section={s.id}>
    <h2>{s.title}</h2>
    <ul class="deck">
      {[...s.dishes].sort((a, b) => a.order - b.order).map((dish) => (
        <li class="card">
          <h3>{dish.name}</h3>
          {dish.description && <p class="desc">{dish.description}</p>}
          <div class="foot">
            <span class="price">{formatEuro(typeof dish.price === "number" ? dish.price : dish.price.full)}</span>
            {dish.allergens.length > 0 && (
              <AllergenIcons allergens={dish.allergens} labels={allergenLabels} />
            )}
          </div>
        </li>
      ))}
    </ul>
  </section>
))}

<script>
  const mount = () => {
    const sections = document.querySelectorAll<HTMLElement>("[data-section]");
    if (sections.length === 0) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const id = (entry.target as HTMLElement).dataset.section;
          document.querySelectorAll<HTMLElement>("[data-tab]").forEach((tab) => {
            tab.dataset.active = String(tab.dataset.tab === id);
          });
        }
      },
      { rootMargin: "-30% 0px -60% 0px" },
    );
    sections.forEach((s) => io.observe(s));
  };

  mount();
  document.addEventListener("astro:page-load", mount);
</script>

<style>
  .tabs {
    position: sticky;
    top: 66px;
    z-index: 10;
    background: rgba(21, 15, 12, 0.92);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid var(--line);
    margin-inline: calc(50% - 50vw);
    padding-inline: max(16px, calc(50vw - 50%));
  }
  .tabs ul {
    display: flex;
    gap: 20px;
    list-style: none;
    margin: 0;
    padding: 0;
    overflow-x: auto;
    scrollbar-width: none;
  }
  .tabs ul::-webkit-scrollbar {
    display: none;
  }
  .tabs a {
    display: inline-flex;
    align-items: center;
    min-height: 44px;
    white-space: nowrap;
    font-size: 0.9rem;
    color: var(--bone-dim);
    border-bottom: 2px solid transparent;
  }
  .tabs a[data-active="true"] {
    color: var(--bone);
    border-bottom-color: var(--vermilion);
  }
  .tabs a:focus-visible {
    outline: 2px solid var(--ember);
    outline-offset: -4px;
  }

  .deck-section {
    padding-top: clamp(36px, 7vw, 64px);
    scroll-margin-top: 120px;
  }
  .deck-section h2 {
    font-size: clamp(1.8rem, 5.5vw, 2.6rem);
    margin: 0 0 1.2rem;
  }

  /* Móvil: baraja horizontal, la siguiente carta siempre asomando. */
  .deck {
    list-style: none;
    margin: 0;
    padding: 0 0 8px;
    display: flex;
    gap: 14px;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    scrollbar-width: none;
    margin-inline: calc(50% - 50vw);
    padding-inline: max(16px, calc(50vw - 50%));
  }
  .deck::-webkit-scrollbar {
    display: none;
  }
  .card {
    flex: 0 0 85%;
    scroll-snap-align: start;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    padding: 18px;
    border: 1px solid var(--ground-3);
    border-radius: 5px;
    background: var(--ground-2);
  }
  .card h3 {
    font-size: 1.3rem;
    line-height: 1.15;
    margin: 0;
    text-wrap: balance;
  }
  .desc {
    margin: 0;
    color: var(--bone-dim);
    font-size: 0.98rem;
  }
  .foot {
    margin-top: auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding-top: 0.4rem;
  }
  .price {
    font-weight: 800;
    font-size: 1.15rem;
    font-variant-numeric: tabular-nums;
  }

  /* Escritorio: la baraja se despliega en retícula asimétrica. */
  @media (min-width: 861px) {
    .deck {
      display: grid;
      grid-template-columns: 1.15fr 0.85fr;
      gap: 18px;
      overflow: visible;
      scroll-snap-type: none;
      margin-inline: 0;
      padding-inline: 0;
    }
    .card {
      flex: initial;
    }
    .card:nth-child(4n + 3) {
      grid-column: 2;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .deck {
      scroll-behavior: auto;
    }
  }
</style>
```

- [ ] **Step 2: Usarlo en las dos cartas**

En `apps/cokima/src/pages/carta.astro`, sustituir los tres `<MenuSection …/>` por:

```astro
<MenuDeck
  sections={[
    { id: "compartir", title: "Compartir es vivir", dishes: bySection("compartir") },
    { id: "terminar", title: "Para terminar o no…", dishes: bySection("terminar") },
    { id: "postres", title: "Y por fin, los postres", dishes: bySection("postres") },
  ]}
  locale="es"
  allergenLabels={ALLERGEN_LABELS.es}
/>
```

Los títulos son los que ya existen en el archivo: **no se reescriben**. Repetir en `apps/cokima/src/pages/en/menu.astro` con los títulos en inglés ya presentes allí y `locale="en"`. Quitar el import de `MenuSection` en ambos.

- [ ] **Step 3: Verificar**

```bash
pnpm --filter cokima build
```

Esperado: `Complete!`. Después, en la preview a 375px: comprobar con `read_page` que están los 21 platos, que las tabs son alcanzables, y con `javascript_tool` que la baraja desborda en horizontal:

```js
const d = document.querySelector(".deck"); d.scrollWidth > d.clientWidth
```

Esperado: `true`. A 1280px debe ser `false` (retícula).

- [ ] **Step 4: Commit**

```bash
git add apps/cokima/src/components/MenuDeck.astro apps/cokima/src/pages/carta.astro apps/cokima/src/pages/en/menu.astro
git commit -m "feat(cokima): carta baraja con tabs pegajosas y snap horizontal"
```

---

## Task 10: Cokima — filtro de alérgenos tras bandera (apagado)

**Files:**
- Create: `apps/cokima/src/components/AllergenFilter.astro`
- Modify: `apps/cokima/src/site.ts`, `apps/cokima/src/components/MenuDeck.astro`

**Interfaces:**
- Consumes: `MenuDeck` de Task 9.
- Produces: `ALLERGEN_DATA_CONFIRMED: boolean` en `apps/cokima/src/site.ts`.

**Regla no negociable (spec §5.3):** la bandera queda en `false`. Un filtro "sin gluten" en el que una persona celíaca confía con datos marcados como orientativos es un problema de salud, no de UX. Se construye y se deja listo; **no se enciende** hasta que el cliente firme los datos.

- [ ] **Step 1: Declarar la bandera**

En `apps/cokima/src/site.ts`, junto a `ALLERGEN_LABELS`:

```ts
/**
 * Los alérgenos de la carta son orientativos hasta que el restaurante firme la
 * documentación oficial (spec 2026-07-27 §5.3 y §8). Con la bandera en false el
 * filtro no se renderiza: solo se muestran los iconos y la nota de aviso.
 * NO cambiar a true sin confirmación escrita del cliente.
 */
export const ALLERGEN_DATA_CONFIRMED = false;
```

- [ ] **Step 2: Crear el filtro**

```astro
---
// apps/cokima/src/components/AllergenFilter.astro
interface Props {
  labels: Record<string, string>;
  available: string[];
  locale: "es" | "en";
}
const { labels, available, locale } = Astro.props;
const legend = locale === "es" ? "Filtrar por alérgeno" : "Filter by allergen";
const clear = locale === "es" ? "Quitar filtros" : "Clear filters";
---

<div class="filter" data-allergen-filter hidden>
  <p class="legend" id="allergen-legend">{legend}</p>
  <div class="chips" role="group" aria-labelledby="allergen-legend">
    {available.map((a) => (
      <button type="button" data-allergen={a} aria-pressed="false">
        {locale === "es" ? `Sin ${labels[a] ?? a}` : `No ${labels[a] ?? a}`}
      </button>
    ))}
    <button type="button" data-allergen-clear>{clear}</button>
  </div>
</div>

<script>
  const mount = () => {
    const root = document.querySelector<HTMLElement>("[data-allergen-filter]");
    if (!root) return;
    root.hidden = false;
    const excluded = new Set<string>();

    const apply = () => {
      document.querySelectorAll<HTMLElement>("[data-card-allergens]").forEach((card) => {
        const own = (card.dataset.cardAllergens ?? "").split(",").filter(Boolean);
        card.hidden = own.some((a) => excluded.has(a));
      });
    };

    root.querySelectorAll<HTMLButtonElement>("button[data-allergen]").forEach((b) => {
      b.addEventListener("click", () => {
        const a = b.dataset.allergen!;
        if (excluded.has(a)) excluded.delete(a);
        else excluded.add(a);
        b.setAttribute("aria-pressed", String(excluded.has(a)));
        apply();
      });
    });

    root.querySelector<HTMLButtonElement>("[data-allergen-clear]")?.addEventListener("click", () => {
      excluded.clear();
      root.querySelectorAll<HTMLButtonElement>("button[data-allergen]").forEach((b) =>
        b.setAttribute("aria-pressed", "false"),
      );
      apply();
    });
  };

  mount();
  document.addEventListener("astro:page-load", mount);
</script>

<style>
  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .chips button {
    min-height: 44px;
    padding: 0 14px;
    font-size: 0.88rem;
    color: var(--bone-dim);
    background: transparent;
    border: 1px solid var(--ground-3);
    border-radius: 999px;
    cursor: pointer;
  }
  .chips button[aria-pressed="true"] {
    color: var(--bone);
    border-color: var(--vermilion);
    background: rgba(237, 28, 36, 0.14);
  }
  .chips button:focus-visible {
    outline: 2px solid var(--ember);
    outline-offset: 2px;
  }
  .legend {
    font-size: 0.82rem;
    color: var(--bone-faint);
    margin: 0 0 0.6rem;
  }
</style>
```

- [ ] **Step 3: Conectarlo a `MenuDeck` detrás de la bandera**

En el frontmatter de `MenuDeck.astro`, importar la bandera y calcular los alérgenos presentes:

```ts
import { ALLERGEN_DATA_CONFIRMED } from "../site.ts";
import AllergenFilter from "./AllergenFilter.astro";

const available = [...new Set(sections.flatMap((s) => s.dishes.flatMap((d) => d.allergens)))].sort();
```

Renderizar el filtro solo si la bandera está encendida, justo después de `<nav class="tabs">`:

```astro
{ALLERGEN_DATA_CONFIRMED && (
  <AllergenFilter labels={allergenLabels} available={available} locale={locale} />
)}
```

Y en cada `<li class="card">` añadir el dato que el filtro necesita, siempre (no cuesta nada y evita tocar el markup al encenderlo):

```astro
data-card-allergens={dish.allergens.join(",")}
```

- [ ] **Step 4: Verificar que NO aparece**

```bash
pnpm --filter cokima build
```

Comprobar que el HTML generado no contiene el filtro:

```bash
grep -c "data-allergen-filter" apps/cokima/.vercel/output/static/carta/index.html || echo "0 — correcto, el filtro esta apagado"
```

Esperado: `0`. Y que la nota de "alérgenos orientativos" de `carta.astro` sigue en su sitio.

- [ ] **Step 5: Commit**

```bash
git add apps/cokima/src/components/AllergenFilter.astro apps/cokima/src/site.ts apps/cokima/src/components/MenuDeck.astro
git commit -m "feat(cokima): filtro de alergenos construido y apagado hasta confirmar datos"
```

---

## Task 11: Las dos homes

**Files:**
- Modify: `apps/cokima/src/pages/index.astro`, `apps/cokima/src/pages/en/index.astro`, `apps/ochoa/src/pages/index.astro`, `apps/ochoa/src/pages/en/index.astro`

**Interfaces:**
- Consumes: `MenuDeck` (Task 9) en Cokima.
- Produces: nada que consuman tareas posteriores.

**Cokima — escaparate lateral (spec §5.2):**

- [ ] **Step 1: Comprimir el hero y subir la comida**

En `apps/cokima/src/pages/index.astro`:
- Reducir el relleno del hero a `clamp(28px, 5vw, 72px) 0 clamp(24px, 4vw, 48px)`.
- En móvil, la foto del hero pasa **antes** que el `.hero-cta` mediante `order`, y baja a `aspect-ratio: 3/2` para que no coma pantalla:

```css
@media (max-width: 860px) {
  .hero-grid {
    grid-template-columns: 1fr;
  }
  .hero-photo {
    aspect-ratio: 3 / 2;
  }
  .hero h1 {
    font-size: clamp(2.4rem, 8vw, 3.4rem);
  }
  .kicker {
    font-size: 1rem;
    margin-top: 1rem;
  }
}
```

- [ ] **Step 2: Mover los imprescindibles por encima del manifiesto**

Reordenar las secciones del `<Base>`: `header.hero` → `section.picks` → `section.manifesto` → `section.visita`. La comida deja de estar por debajo del relato.

- [ ] **Step 3: Reducir el manifiesto a una línea**

Conservar `.quote` (la cita) y **eliminar** el párrafo `.sub` que la sigue. Es la reducción acordada en el spec §5.2. No reescribir la cita.

- [ ] **Step 4: Convertir los imprescindibles en baraja**

Sustituir el `<MenuSection title="Selección" …/>` de `picks` por `<MenuDeck>` con una sola sección:

```astro
<MenuDeck
  sections={[{ id: "imprescindibles", title: "Selección", dishes: featured }]}
  locale="es"
  allergenLabels={ALLERGEN_LABELS.es}
/>
```

Ocultar las tabs cuando solo hay una sección — en `MenuDeck.astro`, envolver el `<nav class="tabs">` en `{sections.length > 1 && ( … )}`.

- [ ] **Step 5: Repetir en `apps/cokima/src/pages/en/index.astro`** con `locale="en"`, `ALLERGEN_LABELS.en` y los textos en inglés ya presentes en ese archivo.

**Ochoa — hoja de bar (spec §5.2):**

- [ ] **Step 6: Verticalizar y densificar**

En `apps/ochoa/src/pages/index.astro`:
- En el `.hero-grid` móvil, la foto va después del texto y baja a `aspect-ratio: 16/9`.
- Cambiar la separación entre secciones por reglas horizontales gruesas de cartel:

```css
.manifesto,
.tasca,
.visita {
  border-top: 3px solid var(--ink);
  margin-top: clamp(32px, 6vw, 56px);
  padding-top: clamp(24px, 4vw, 40px);
}
```

- Densificar en móvil: la hoja de bar es densa, no aireada.

```css
@media (max-width: 860px) {
  .hero {
    padding: 28px 0 32px;
  }
  .hero-photo {
    aspect-ratio: 16 / 9;
  }
  .manifesto,
  .tasca,
  .visita {
    margin-top: 28px;
    padding-top: 20px;
  }
  .manifesto {
    padding-bottom: 0;
  }
  .sub,
  .txt {
    font-size: 1rem;
    margin-top: 0.9rem;
  }
}
```

- `.tasca-grid` mantiene una sola columna en móvil (ya lo hace) y **no** se introduce ningún scroll horizontal en esta marca: es lo que la separa de Cokima.

- [ ] **Step 7: Repetir en `apps/ochoa/src/pages/en/index.astro`.**

- [ ] **Step 8: Verificar las dos a 375px**

Con las previews abiertas y `resize_window` a `mobile`, tomar `screenshot` de las dos homes. Comprobar a ojo lo que pedía el spec §4: en Cokima hay comida antes de acabar la primera pantalla y se recorre en horizontal; en Ochoa todo es vertical y denso, sin scroll lateral.

- [ ] **Step 9: Commit**

```bash
git add apps/cokima/src/pages/index.astro apps/cokima/src/pages/en/index.astro apps/ochoa/src/pages/index.astro apps/ochoa/src/pages/en/index.astro apps/cokima/src/components/MenuDeck.astro
git commit -m "feat(homes): escaparate lateral en Cokima, hoja de bar en Ochoa"
```

---

## Task 12: View Transitions, movimiento y limpieza

**Files:**
- Modify: `apps/cokima/src/layouts/Base.astro`, `apps/ochoa/src/layouts/Base.astro`, `apps/{cokima,ochoa}/src/styles/global.css`
- Delete: `packages/ui/src/MenuSection.astro`, `packages/ui/src/DishRow.astro`

**Interfaces:**
- Consumes: todo lo anterior.
- Produces: nada.

- [ ] **Step 1: Activar View Transitions en las dos apps**

En cada `Base.astro`, importar y añadir al `<head>`:

```astro
import { ClientRouter } from "astro:transitions";
```

```astro
<ClientRouter />
```

Todos los componentes de este plan ya escuchan `astro:page-load`, así que siguen montándose tras cada navegación.

- [ ] **Step 2: Respetar `prefers-reduced-motion` globalmente**

En cada `global.css`:

```css
@media (prefers-reduced-motion: reduce) {
  ::view-transition-group(*),
  ::view-transition-old(*),
  ::view-transition-new(*) {
    animation: none !important;
  }
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

- [ ] **Step 3: Confirmar que ninguna app usa ya `MenuSection`**

```bash
grep -rn "MenuSection\|DishRow" apps packages --include=*.astro --include=*.ts | grep -v node_modules
```

Esperado: solo los propios archivos de `packages/ui`. Si aparece cualquier uso en `apps/`, **parar**: hay una página sin migrar (probablemente una variante `en/`) y hay que volver a Task 7 o 9 antes de borrar nada.

- [ ] **Step 4: Eliminar los componentes muertos**

```bash
git rm packages/ui/src/MenuSection.astro packages/ui/src/DishRow.astro
```

`packages/ui/src/index.ts` **no se toca**: solo exporta tipos y `hasHalfPortions`, ninguno de los dos componentes aparece ahí. `AllergenIcons`, `Seo`, `ConsentBanner` y `BookingEmbed` **se quedan** — los siguen usando `MenuDeck`, `Base.astro` y la página de reservas.

- [ ] **Step 5: Verificación completa**

```bash
pnpm test
```

Esperado: PASS en `@tombo/content` (schema 4 + hours 8 + portions 5 + search 8) y `@tombo/tracking` (6).

```bash
pnpm build
```

Esperado: `Complete!` en las dos apps.

Con las previews abiertas, recorrer en móvil home → carta → reservas en cada marca y comprobar con `read_console_messages` que no hay errores y que la navegación no recarga la página entera.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(ui): view transitions, reduced-motion y retirada de MenuSection compartido"
```

---

## Verificación final contra el spec

| Requisito del spec | Tarea |
|---|---|
| §2.2 navegación móvil inexistente | 3 (Cokima), 4 (Ochoa) |
| §5.1 reserva persistente por marca | 4, 5 |
| §5.1 estado de apertura, cliente, Europe/Madrid | 1, 2 |
| §5.1 sin modal, `/reservas` como página real | 4, 5 (los enlaces navegan) |
| §5.1 selector ES/EN siempre visible | 3, 4 |
| §5.2 Cokima escaparate lateral | 11 |
| §5.2 Ochoa hoja de bar | 11 |
| §5.3 carta baraja + tabs | 9 |
| §5.3 filtro de alérgenos apagado | 10 |
| §5.4 carta pizarra + toggle ½/entera | 6, 7 |
| §5.4 "solo ración entera" en `half: null` | 6, 7 |
| §5.4 buscador instantáneo | 8 |
| §5.5 View Transitions + reduced-motion | 12 |
| §5.5 iframe de CoverManager solo en `/reservas` | ya se cumple; Task 12 Step 5 lo confirma al recorrer las páginas |
| §5.6 cada app su carta, `ui` limpio | 7, 9, 12 |
| §6 legible sin JavaScript | 7, 9 |
| §6 controles reales y foco visible | 7, 8, 10 |

**Pendiente de cliente que este plan no resuelve** (spec §8): confirmación oficial de alérgenos, accesos a CoverManager/Meta/GTM, dominios, datos fiscales, fotografía real, Google Maps.
