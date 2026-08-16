# La entrada de Los Ochoa — plan de implementación

> **Para quien ejecute esto:** los pasos van con casilla (`- [ ]`) para ir marcándolos.

**Objetivo:** que al entrar en la web de Los Ochoa desde fuera, una plancha roja con el rótulo se
recoja hasta convertirse en la barra de navegación, en 740 ms, y que no salga nunca al recargar
estando dentro.

**Arquitectura:** la decisión de si sale se toma en un script **inline y síncrono** del `<head>`,
antes del primer pintado, y escribe `data-intro` en el `<html>`. La misma función pura que toman
los tests se serializa con `.toString()` dentro de ese script, así que no hay dos copias de la
lógica. La piel y los `@keyframes` son de Ochoa; el mecanismo vive en `@tombo/ui` sin un solo
color.

**Stack:** Astro 6, TypeScript, vitest, pnpm workspaces.

## Restricciones globales

- **Solo Los Ochoa.** `apps/cokima` no se toca en esta tanda.
- **`packages/ui` no lleva ni un color ni una fuente de marca.** Regla de oro del monorepo.
- **Ni un milisegundo suelto en los componentes.** Toda duración y toda curva salen de
  `apps/ochoa/src/styles/tokens.css`.
- **Solo se animan `transform`, `opacity` y `clip-path`.** Nunca `width`, `height`, `padding`,
  `margin` ni `text-shadow`.
- **Nada de bounce ni elástica.** (`movimiento.md`, regla 1.)
- **No pushear.** Mario pidió commits locales, sin subir a `preview`.
- Los filtros de pnpm van **por nombre**, no por ruta: `pnpm --filter ochoa build`.

## Ficheros

| Fichero | Responsabilidad |
|---|---|
| `packages/ui/src/intro.ts` | **Crear.** La función pura de decisión, el interruptor del retorno y el montaje (medir, arrancar, retirar). Sin colores. |
| `packages/ui/test/intro.test.ts` | **Crear.** Las cuatro puertas. |
| `packages/ui/package.json` | **Modificar.** Añadir `test` y vitest. |
| `apps/ochoa/src/styles/tokens.css` | **Modificar.** `--dur-firma` y `--espera-firma`. |
| `apps/ochoa/src/components/Intro.astro` | **Crear.** La piel: plancha, rótulo de dos capas, los dos `@keyframes`. |
| `apps/ochoa/src/layouts/Base.astro` | **Modificar.** El script inline del `<head>` y el montaje de `<Intro />`. |
| `docs/movimiento.md` | **Modificar.** Los dos tokens, la fila de «qué se mueve hoy» y la excepción a la regla 5. |
| `docs/estado.md` | **Modificar.** La tanda. |

---

## Tarea 1: La decisión, con sus tests

**Ficheros:**
- Crear: `packages/ui/src/intro.ts`
- Crear: `packages/ui/test/intro.test.ts`
- Modificar: `packages/ui/package.json`

**Interfaces que produce:**
- `type TipoNavegacion = "navigate" | "reload" | "back_forward" | "prerender"`
- `interface Circunstancias { tipo: TipoNavegacion; yaVisto: boolean; menosMovimiento: boolean }`
- `function decideEntrada(c: Circunstancias): boolean`
- `const CLAVE_SESION = "ochoa:entrada"`
- `const INTRO_EN_RETORNO: boolean`

- [ ] **Paso 1: dar tests a `@tombo/ui`**

`packages/ui/package.json` no tiene hoy ningún script de `test`. El script raíz
(`pnpm --filter "@tombo/*" -r test`) recoge solo los paquetes que lo declaran, así que sin esto
los tests nuevos no correrían nunca. Añadir, copiando lo que ya hace `@tombo/tracking`:

```json
  "scripts": {
    "test": "vitest run"
  },
  "devDependencies": {
    "vitest": "^3.0.0"
  }
```

Después: `pnpm install`

- [ ] **Paso 2: escribir el test que falla**

`packages/ui/test/intro.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { decideEntrada } from "../src/intro.ts";

const llegada = { tipo: "navigate", yaVisto: false, menosMovimiento: false } as const;

describe("decideEntrada", () => {
  it("sale al llegar desde fuera", () => {
    expect(decideEntrada(llegada)).toBe(true);
  });

  it("no sale al recargar", () => {
    expect(decideEntrada({ ...llegada, tipo: "reload" })).toBe(false);
  });

  it("no sale con el botón de atrás", () => {
    expect(decideEntrada({ ...llegada, tipo: "back_forward" })).toBe(false);
  });

  it("no sale si ya se vio en esta sesión", () => {
    expect(decideEntrada({ ...llegada, yaVisto: true })).toBe(false);
  });

  it("no sale para quien pide menos movimiento", () => {
    expect(decideEntrada({ ...llegada, menosMovimiento: true })).toBe(false);
  });

  /* Las puertas son independientes: que una diga que no basta, aunque las
     demás digan que sí. Esto es lo que evita que un refactor las convierta
     sin querer en un `&&` donde una domine a las otras. */
  it("basta una puerta cerrada", () => {
    expect(decideEntrada({ tipo: "reload", yaVisto: false, menosMovimiento: false })).toBe(false);
    expect(decideEntrada({ tipo: "navigate", yaVisto: true, menosMovimiento: false })).toBe(false);
    expect(decideEntrada({ tipo: "navigate", yaVisto: false, menosMovimiento: true })).toBe(false);
  });

  /* `prerender` es una llegada de verdad: el navegador ha precargado la página
     pero el usuario la está viendo por primera vez. */
  it("sale en una navegación precargada", () => {
    expect(decideEntrada({ ...llegada, tipo: "prerender" })).toBe(true);
  });
});

describe("decideEntrada es serializable", () => {
  /* El script inline del `<head>` se construye con `decideEntrada.toString()`,
     que es lo que garantiza que no existan dos copias de la lógica. Si la
     función capturase algo de su módulo —una constante, un import— el texto
     serializado se rompería en el navegador sin que ningún test lo notara. */
  it("no referencia nada de su módulo", () => {
    const cuerpo = decideEntrada.toString();
    expect(cuerpo).not.toMatch(/\bCLAVE_SESION\b|\bINTRO_EN_RETORNO\b|\brequire\b|\bimport\b/);
  });
});
```

- [ ] **Paso 3: comprobar que falla**

Ejecutar: `pnpm --filter @tombo/ui test`
Se espera: FALLA, no encuentra `../src/intro.ts`.

- [ ] **Paso 4: escribir `packages/ui/src/intro.ts`**

```ts
/** La entrada a la web: cuándo sale y cómo se monta. Sin una sola decisión de marca.
 *
 * La plancha, el rótulo y los `@keyframes` viven en cada app (hoy solo en
 * Ochoa). Aquí vive lo que sería idéntico en cualquier casa: las cuatro puertas
 * que deciden si la entrada se pinta, y el ciclo de medir, arrancar y retirar.
 *
 * Contrato del markup que lo usa:
 *   - `[data-intro-marca]` — el rótulo que viaja, con `transform-origin` arriba
 *     a la izquierda
 *   - `[data-intro-destino]` — dónde tiene que aterrizar (el rótulo de la barra)
 *   - `[data-intro-plancha]` — la superficie que se recoge; su `animationend`
 *     es lo que retira la entrada
 *   - `data-intro` en el `<html>`: `"si"` puesto y quieto, `"va"` animándose
 */

/** Dónde se anota que esta pestaña ya ha visto la entrada. */
export const CLAVE_SESION = "ochoa:entrada";

/** Cuántos ms se espera como mucho a que llegue la fuente antes de medir igual.
 *  Con la de respaldo el rótulo mide otra cosa y el aterrizaje cae torcido, pero
 *  esperar indefinidamente es peor: dejaría la plancha puesta. */
const ESPERA_FUENTE = 600;

/** El seguro. Si algo falla entre el pintado y el montaje, la entrada se retira
 *  igual y la web queda visible. No es un adorno: el script que pinta la plancha
 *  es síncrono y el que la retira no, así que sin esto un error de red o un
 *  módulo que no llega dejarían la pantalla en rojo.
 *  Se exporta porque quien lo arma es el script inline del `<head>`, que lo
 *  interpola desde aquí: escribirlo a mano allí serían dos fuentes para el
 *  mismo número. */
export const SEGURO = 3000;

export type TipoNavegacion = "navigate" | "reload" | "back_forward" | "prerender";

export interface Circunstancias {
  /** Qué clase de navegación ha traído a esta página. */
  tipo: TipoNavegacion;
  /** ¿Esta pestaña ya ha visto la entrada? */
  yaVisto: boolean;
  /** ¿El sistema pide menos movimiento? */
  menosMovimiento: boolean;
}

/** ¿Sale la entrada?
 *
 * Cuatro puertas, en orden; basta que una diga que no. **Esta función se
 * serializa con `.toString()` para meterla en el script inline del `<head>`**,
 * que es lo que evita tener dos copias de la lógica —una testeada y otra no—.
 * Por eso no puede referenciar nada de este módulo: ni una constante, ni un
 * import, ni otra función. Hay un test que lo vigila.
 */
export function decideEntrada(c: Circunstancias): boolean {
  if (c.menosMovimiento) return false;
  // Recargar y volver atrás son la misma situación: ya estabas dentro.
  if (c.tipo === "reload" || c.tipo === "back_forward") return false;
  if (c.yaVisto) return false;
  return true;
}

/** ¿Se reproduce la entrada al pulsar el rótulo de la barra desde otra página?
 *
 * A prueba por decisión de Mario —«esto lo cogemos con pinzas, hay que ver si
 * produce demasiada fricción, pero lo probamos»—. Ponerlo en `false` apaga solo
 * este disparo; la entrada desde fuera sigue igual. Mismo mecanismo que el
 * `EN_OBRAS` de `conocenos.ts`.
 */
export const INTRO_EN_RETORNO = true;
```

- [ ] **Paso 5: comprobar que pasan**

Ejecutar: `pnpm --filter @tombo/ui test`
Se espera: PASAN los 8.

- [ ] **Paso 6: commit**

```bash
git add packages/ui/src/intro.ts packages/ui/test/intro.test.ts packages/ui/package.json pnpm-lock.yaml
git commit -m "feat(ui): las cuatro puertas que deciden si sale la entrada"
```

---

## Tarea 2: La entrada, puesta y funcionando

**Ficheros:**
- Modificar: `apps/ochoa/src/styles/tokens.css`
- Crear: `apps/ochoa/src/components/Intro.astro`
- Modificar: `apps/ochoa/src/layouts/Base.astro`
- Modificar: `packages/ui/src/intro.ts` (añadir el montaje)

**Interfaces que consume:** `decideEntrada`, `CLAVE_SESION` de la tarea 1.
**Interfaces que produce:** `function montaEntrada(): void`

- [ ] **Paso 1: los dos tokens**

En `apps/ochoa/src/styles/tokens.css`, después de `--dur-turno`:

```css
  /* La entrada a la web. Dos valores que no cabían en los cinco de base porque
     no miden ni entrar ni responder a un dedo. */
  /* Lo que la sombra dura tarda en despegarse del rótulo. Es el gesto de un
     cartel pintado, y no es «entrar»: el rótulo ya está ahí, lo que aparece es
     su relieve. Se anima moviendo una segunda capa de tinta con `transform`,
     nunca animando `text-shadow`, que repinta en cada fotograma. */
  --dur-firma: 210ms;
  /* El retardo de la recogida, contado desde el arranque —no una duración—.
     Deja 110ms de rótulo quieto y entero después de la firma; sin ellos la
     plancha empieza a irse antes de que el nombre se haya llegado a leer. */
  --espera-firma: 320ms;
```

- [ ] **Paso 2: la piel**

Crear `apps/ochoa/src/components/Intro.astro`:

```astro
---
// La entrada: una plancha roja con el rótulo que se recoge hasta medir
// exactamente la barra, mientras el rótulo viaja y encoge hasta su sitio dentro
// de ella. No estrena vocabulario —es el telón del menú y la plancha de la
// barra haciendo un gesto nuevo— y por eso la costura no se ve: al terminar la
// recogida, debajo hay el mismo rojo.
//
// El diseño entero, con las dos variantes descartadas y sus motivos, está en
// docs/superpowers/specs/2026-08-06-entrada-ochoa-design.md.
//
// Sin props: el rótulo es el nombre del bar y se escribe igual en los dos
// idiomas. El día que haya algo que traducir aquí, entrará una.
---

<div class="intro" data-intro-plancha aria-hidden="true" inert>
  <span class="marca" data-intro-marca>
    <span class="capa sombra">Los Ochoa</span>
    <span class="capa papel">Los Ochoa</span>
  </span>
</div>

<script>
  import { montaEntrada } from "@tombo/ui/intro.ts";

  montaEntrada();
</script>

<style>
  /* Solo existe si el script del `<head>` ha decidido que sale. Mientras tanto
     no hay ni caja: la web se ve entera desde el primer frame, que es también
     lo que pasa sin JavaScript. */
  .intro {
    display: none;
  }
  :global(html[data-intro]) .intro {
    display: grid;
    place-items: center;
    position: fixed;
    inset: 0;
    /* Por encima de todo: panel del menú 50, barra 60, cartel de cookies 60. */
    z-index: 80;
    background: var(--rojo);
    padding: 0 max(16px, 4vw);
    pointer-events: none;
  }

  /* El rótulo son dos capas superpuestas y no un `text-shadow`, porque lo que
     se anima es el despegue de la sombra y eso tiene que ser un `transform`.
     Animar la sombra directamente repinta en cada fotograma (regla 2). */
  .marca {
    position: relative;
    display: inline-block;
    /* El viaje se calcula desde esta esquina: `montaEntrada` publica --tx, --ty
       y --s midiendo los dos rectángulos, porque de dónde sale y a dónde llega
       dependen del ancho de la pantalla y del cuerpo de la fuente. Cualquier
       número fijo sería falso en algún móvil. */
    transform-origin: left top;
    font-family: var(--display);
    font-size: clamp(2.6rem, 13vw, 7rem);
    line-height: 1;
    white-space: nowrap;
  }
  .capa {
    display: block;
  }
  .sombra {
    position: absolute;
    inset: 0;
    color: var(--ink);
    /* Puesta ya en su sitio: si el script no llegara a arrancar la animación,
       el rótulo se ve correcto y no a medio hacer. */
    transform: translate(0.045em, 0.05em);
  }
  .papel {
    position: relative;
    color: var(--paper);
  }

  /* Mientras la entrada está puesta, el rótulo de la barra espera apagado: dos
     copias visibles a la vez cantarían el truco justo al aterrizar. */
  :global(html[data-intro]) :global(.brand) {
    opacity: 0;
  }

  /* `data-intro="va"` y no `"si"`: la animación no arranca hasta que el script
     ha medido el viaje. Si arrancara sola, con el módulo llegando tarde el
     rótulo aterrizaría en un sitio inventado. */
  :global(html[data-intro="va"]) .intro {
    animation: recoge var(--dur-in) var(--ease-telon) var(--espera-firma) both;
  }
  :global(html[data-intro="va"]) .marca {
    animation: aterriza var(--dur-in) var(--ease-telon) var(--espera-firma) both;
  }
  :global(html[data-intro="va"]) .sombra {
    animation: firma var(--dur-firma) var(--ease) both;
  }

  /* La plancha no se va: se recoge hasta medir exactamente la barra. */
  @keyframes recoge {
    from {
      clip-path: inset(0 0 0 0);
    }
    to {
      clip-path: inset(0 0 calc(100% - var(--t-header-h, 62px)) 0);
    }
  }
  @keyframes aterriza {
    from {
      transform: translate(0, 0) scale(1);
    }
    to {
      transform: translate(var(--tx, 0px), var(--ty, 0px)) scale(var(--s, 1));
    }
  }
  @keyframes firma {
    from {
      transform: translate(0, 0);
    }
    to {
      transform: translate(0.045em, 0.05em);
    }
  }
</style>
```

- [ ] **Paso 3: el montaje, en `packages/ui/src/intro.ts`**

Añadir al final del fichero de la tarea 1:

```ts
/** Mide el viaje del rótulo y publica las tres variables que lo describen.
 *
 * Se mide con el rótulo YA visible: un elemento sin caja devuelve cero, y con
 * un cero el rótulo encoge en el sitio en vez de aterrizar —un fallo que no se
 * ve en una captura, solo midiendo—. Por eso la entrada se oculta con
 * `display: none` a través de un atributo que en este punto ya está puesto.
 */
function mideViaje(marca: HTMLElement, destino: HTMLElement): boolean {
  const previo = marca.style.transform;
  marca.style.transform = "none";
  const origen = marca.getBoundingClientRect();
  marca.style.transform = previo;
  const meta = destino.getBoundingClientRect();
  if (!origen.width || !meta.width) return false;

  marca.style.setProperty("--s", String(meta.width / origen.width));
  marca.style.setProperty("--tx", `${meta.left - origen.left}px`);
  marca.style.setProperty("--ty", `${meta.top - origen.top}px`);
  return true;
}

/** Quita la entrada de en medio y devuelve el rótulo de la barra. */
function retira(): void {
  document.documentElement.removeAttribute("data-intro");
}

/** Arranca la entrada que el script del `<head>` ya ha decidido pintar.
 *
 * El orden importa y es el motivo de que la animación no arranque sola desde el
 * CSS: primero se espera a la fuente —con la de respaldo el rótulo mide otra
 * cosa y el aterrizaje cae torcido—, después se mide, y solo entonces se pasa a
 * `data-intro="va"`.
 */
function montaEntrada(): void {
  const raiz = document.documentElement;
  if (raiz.dataset.intro !== "si") return;

  const plancha = document.querySelector<HTMLElement>("[data-intro-plancha]");
  const marca = document.querySelector<HTMLElement>("[data-intro-marca]");
  const destino = document.querySelector<HTMLElement>("[data-intro-destino]");
  if (!plancha || !marca || !destino) return retira();

  /* La plancha es quien manda: es la que tarda más y la que tapa. Cuando
     termina de recogerse, la entrada ha terminado.
     **`animationend` burbujea**, así que sin filtrar el objetivo la firma —que
     termina a los 210ms, dentro del rótulo— retiraría la entrada a mitad del
     viaje. Es el fallo más caro de este fichero y no se ve en un test unitario. */
  plancha.addEventListener(
    "animationend",
    (e) => {
      if (e.target === plancha) retira();
    },
    { once: false },
  );

  const arranca = () => {
    if (raiz.dataset.intro !== "si") return; // el seguro se adelantó
    if (!mideViaje(marca, destino)) return retira();
    raiz.dataset.intro = "va";
  };

  /* `document.fonts.load` y no `fonts.ready`: este último espera a TODAS las
     fuentes del documento y aquí solo importa la del rótulo. El tiempo tope
     evita que una fuente que no llega deje la plancha puesta esperándola. */
  const fuentes = document.fonts;
  if (fuentes?.load) {
    Promise.race([
      fuentes.load("400 1em Anton"),
      new Promise((ok) => setTimeout(ok, ESPERA_FUENTE)),
    ]).then(arranca, arranca);
  } else {
    arranca();
  }
}
```

- [ ] **Paso 4: el script del `<head>` y el componente, en `Base.astro`**

En el frontmatter, junto a los otros imports:

```ts
import { decideEntrada, CLAVE_SESION, SEGURO } from "@tombo/ui/intro.ts";
import Intro from "../components/Intro.astro";

/* La decisión se toma antes del primer pintado o no sirve de nada: si llegara
   después, se vería la web un instante y LUEGO la plancha roja encima, que es
   peor que no tener entrada.
   La función se serializa en vez de reescribirse aquí, así que la lógica que
   corre en el navegador es exactamente la que cubren los tests de
   `packages/ui/test/intro.test.ts`. */
const guionEntrada = `
(function () {
  var raiz = document.documentElement;
  var decide = ${decideEntrada.toString()};
  var nav = performance.getEntriesByType("navigation")[0];
  var yaVisto = false;
  try { yaVisto = sessionStorage.getItem(${JSON.stringify(CLAVE_SESION)}) === "1"; } catch (e) {}
  var circunstancias = {
    tipo: (nav && nav.type) || "navigate",
    yaVisto: yaVisto,
    menosMovimiento: matchMedia("(prefers-reduced-motion: reduce)").matches
  };
  if (!decide(circunstancias)) return;
  raiz.dataset.intro = "si";
  try { sessionStorage.setItem(${JSON.stringify(CLAVE_SESION)}, "1"); } catch (e) {}
  /* El seguro. Este script es síncrono y el que retira la plancha no lo es: sin
     esto, un módulo que no llegue deja la pantalla en rojo. */
  setTimeout(function () { raiz.removeAttribute("data-intro"); }, ${SEGURO});
})();
`;
```

En el `<head>`, **antes** de `<QuietScrollHistory />`:

```astro
    <script is:inline set:html={guionEntrada}></script>
```

En el `<body>`, **justo después** de `<Nav ... />` — el orden importa, porque el rótulo destino
vive dentro de la barra y tiene que existir ya cuando se mide:

```astro
    <Intro />
```

- [ ] **Paso 5: marcar el destino en `Nav.astro`**

En `apps/ochoa/src/components/Nav.astro:47`, añadir el atributo al rótulo de la barra:

```astro
  <a class="brand cartel" href={home} data-intro-destino>Los Ochoa</a>
```

- [ ] **Paso 6: construir y comprobar que no se rompe nada**

Ejecutar: `pnpm --filter ochoa build`
Se espera: `Complete!` sin avisos nuevos.

Ejecutar: `pnpm test`
Se espera: los 45 de antes más los 8 nuevos, todos en verde.

- [ ] **Paso 7: verificar en el navegador, midiendo**

Levantar el dev desde una terminal propia (los que lanza el agente en segundo plano se mueren en
esta máquina) y comprobar, **con números y no de vista**:

1. El aterrizaje cae sobre el rótulo de la barra con **desvío 0** en x, y y ancho. Medir con
   `getBoundingClientRect()` de `[data-intro-marca]` con el transform final aplicado, contra
   `[data-intro-destino]`. A ancho de escritorio y a 390 px.
2. Recargar (F5) → la entrada **no** sale.
3. Pestaña nueva sobre la misma URL → la entrada **sí** sale.
4. Navegar a `/carta` y volver con el botón de atrás → **no** sale.
5. Con `prefers-reduced-motion` activado → no sale, y **no hay ni un fotograma rojo**.
6. Ningún salto de layout al retirarse: muestrear la posición de un elemento del fondo en cada
   frame y exigir que el máximo sea 0 (es la comprobación del §12 del menú, regla 12).

- [ ] **Paso 8: commit**

```bash
git add apps/ochoa/src/components/Intro.astro apps/ochoa/src/layouts/Base.astro \
        apps/ochoa/src/components/Nav.astro apps/ochoa/src/styles/tokens.css \
        packages/ui/src/intro.ts
git commit -m "feat(ochoa): la plancha roja se recoge hasta convertirse en la barra"
```

---

## Tarea 3: El disparo desde «Los Ochoa»

**Ficheros:**
- Modificar: `packages/ui/src/intro.ts`
- Modificar: `packages/ui/test/intro.test.ts`

**Interfaces que consume:** `INTRO_EN_RETORNO`, `montaEntrada` de las tareas 1 y 2.
**Interfaces que produce:** `function decideRetorno(actual: string, destino: string): boolean`

- [ ] **Paso 1: el test que falla**

Añadir a `packages/ui/test/intro.test.ts`:

```ts
import { decideRetorno } from "../src/intro.ts";

describe("decideRetorno", () => {
  it("se reproduce al volver a la home desde otra página", () => {
    expect(decideRetorno("/carta", "/")).toBe(true);
  });

  /* Decisión de Mario: estando ya en la home el router no navega a ninguna
     parte, así que la entrada anunciaría una llegada que no ocurre. */
  it("no se reproduce estando ya en la home", () => {
    expect(decideRetorno("/", "/")).toBe(false);
  });

  it("la barra final no cuenta como otra página", () => {
    expect(decideRetorno("/en/", "/en/")).toBe(false);
    expect(decideRetorno("/carta/", "/carta")).toBe(false);
  });

  it("la home inglesa y la española son páginas distintas", () => {
    expect(decideRetorno("/en/", "/")).toBe(true);
  });
});
```

- [ ] **Paso 2: comprobar que falla**

Ejecutar: `pnpm --filter @tombo/ui test`
Se espera: FALLA, `decideRetorno` no existe.

- [ ] **Paso 3: implementar**

En `packages/ui/src/intro.ts`:

```ts
/** ¿Debe reproducirse la entrada al pulsar el rótulo de la barra?
 *
 * Solo si de verdad se va a otra página. Estando ya en el destino el router no
 * navega, así que la entrada anunciaría una llegada que no ocurre.
 * La barra final no distingue una ruta de otra: `/carta` y `/carta/` son la
 * misma página, y en Astro las dos formas aparecen según de dónde venga el
 * enlace.
 */
export function decideRetorno(actual: string, destino: string): boolean {
  const limpia = (r: string) => (r.length > 1 ? r.replace(/\/+$/, "") : r);
  return limpia(actual) !== limpia(destino);
}
```

El disparo **no puede armarse dentro de `montaEntrada()`**: esa función sale por la primera línea
cuando no toca entrada —que es la mayoría de las cargas—, así que el listener del router no
llegaría a registrarse nunca. Va en un `initEntrada()` aparte, exactamente como
`initMenuOverlay()` envuelve a `mountMenuOverlay()`:

```ts
/** Monta la entrada y deja armado el rótulo de la barra.
 *
 * `astro:after-swap` y no `astro:page-load`: el segundo dispara también en la
 * carga inicial y duplicaría el montaje. Es la misma trampa que documenta
 * `menu-overlay.ts`.
 */
export function initEntrada(): void {
  armaRetorno();
  montaEntrada();

  document.addEventListener("astro:after-swap", () => {
    // El rótulo del documento nuevo es otro elemento: hay que armarlo otra vez.
    armaRetorno();
    if (!reclamaRetorno()) return;
    document.documentElement.dataset.intro = "si";
    montaEntrada();
  });
}
```

Con estas dos funciones nuevas:

```ts
/** Arma el rótulo de la barra para que reproduzca la entrada al navegar.
 *
 * El rótulo es un `<a href="/">` normal del `ClientRouter`, así que aquí no se
 * navega a mano: se deja pasar el clic y se anota la intención. Quien la
 * ejecuta es `astro:page-load`, ya con la página nueva puesta.
 */
function armaRetorno(): void {
  if (!INTRO_EN_RETORNO) return;
  const destino = document.querySelector<HTMLElement>("[data-intro-destino]");
  if (!(destino instanceof HTMLAnchorElement)) return;

  destino.addEventListener("click", () => {
    if (!decideRetorno(location.pathname, new URL(destino.href).pathname)) return;
    /* En `sessionStorage` y no en una variable: la navegación del router
       conserva el módulo, pero esto tiene que sobrevivir igual a una carga
       completa si el router no llega a intervenir. */
    try {
      sessionStorage.setItem(`${CLAVE_SESION}:retorno`, "1");
    } catch (e) {}
  });
}

/** ¿Venimos de pulsar el rótulo? Consume la marca: solo vale una vez. */
function reclamaRetorno(): boolean {
  try {
    if (sessionStorage.getItem(`${CLAVE_SESION}:retorno`) !== "1") return false;
    sessionStorage.removeItem(`${CLAVE_SESION}:retorno`);
    return true;
  } catch (e) {
    return false;
  }
}
```

Y en `apps/ochoa/src/components/Intro.astro`, cambiar la llamada del `<script>`:

```ts
  import { initEntrada } from "@tombo/ui/intro.ts";

  initEntrada();
```

- [ ] **Paso 4: comprobar que pasan**

Ejecutar: `pnpm --filter @tombo/ui test`
Se espera: PASAN los 12.

- [ ] **Paso 5: verificar en el navegador**

1. Desde `/carta`, pulsar «Los Ochoa» → la entrada se reproduce y termina en la home.
2. Estando en la home, pulsar «Los Ochoa» → no pasa nada.
3. Poner `INTRO_EN_RETORNO = false` → el punto 1 deja de reproducirse y la entrada desde fuera
   sigue igual. Devolverlo a `true`.

- [ ] **Paso 6: commit**

```bash
git add packages/ui/src/intro.ts packages/ui/test/intro.test.ts
git commit -m "feat(ui): el rotulo de la barra vuelve a la home con la entrada puesta"
```

---

## Tarea 4: Dejarlo escrito

**Ficheros:**
- Modificar: `docs/movimiento.md`
- Modificar: `docs/estado.md`

- [ ] **Paso 1: los tokens en `movimiento.md`**

Añadir las dos filas a la tabla de «cuatro más, solo en Ochoa» (que pasa a ser seis), con el
mismo criterio que las de ahí: cada una existe porque no cabía en los cinco de base.

- [ ] **Paso 2: la excepción a la regla 5**

La regla 5 dice que el apagado por `prefers-reduced-motion` vive en un solo sitio, `global.css`.
La entrada es su excepción, y hay que decir por qué: ese bloque pone
`animation-duration: 0.01ms !important`, que no deja la plancha puesta pero sí produce un
**destello rojo a pantalla completa de un fotograma** — peor que la animación entera para quien
pide menos movimiento. La entrada no se atenúa: no se pinta, y eso se decide en el script.

- [ ] **Paso 3: la fila de «qué se mueve hoy»**

```markdown
| Entrada a la web (Ochoa) | La plancha se recoge hasta ser la barra y el rótulo aterriza dentro | `clip-path` + `transform`, `--dur-in`, `--espera-firma`, `--ease-telon` |
```

- [ ] **Paso 4: la tanda en `estado.md`**

Nueva sección con lo hecho, y actualizar el §0 «Por dónde seguir»: sigue mandando el orden que
fijó Mario —Cokima después—, y hay que dejar anotado que **el efecto de la entrada sobre el LCP
está sin medir**.

- [ ] **Paso 5: commit**

```bash
git add docs/movimiento.md docs/estado.md
git commit -m "docs: la tanda de la entrada, y por que su apagado no vive en global.css"
```

---

## Repaso contra el spec

| Sección del spec | Dónde se implementa |
|---|---|
| §3 La entrada y sus tiempos | Tarea 2, pasos 1-2 |
| §3 El viaje se mide, no se escribe | Tarea 2, paso 3 (`mideViaje`) |
| §4 Las cuatro puertas | Tarea 1 |
| §4 Decisión antes del primer pintado | Tarea 2, paso 4 |
| §4 Apagado por reduced-motion en el script | Tarea 1 (`decideEntrada`) + tarea 4, paso 2 |
| §4 Sin JavaScript no hay entrada | Tarea 2, paso 2 (`.intro { display: none }` de salida) |
| §5 El disparo desde «Los Ochoa» | Tarea 3 |
| §5 `INTRO_EN_RETORNO` | Tarea 1 (constante) + tarea 3 (uso) |
| §6 El reparto ui / app | Tareas 1-2 |
| §7 Los dos tokens | Tarea 2, paso 1 |
| §8 No bloquea el scroll | No se implementa nada: es la ausencia de `lockScroll`. Verificado en tarea 2, paso 7.6 |
| §9 `z-index: 80` | Tarea 2, paso 2 |
| §10 `inert` y `aria-hidden` | Tarea 2, paso 2 (markup) |
| §11 El LCP | Queda **sin medir**, anotado en tarea 4, paso 4 |
| §12 Verificación | Tarea 2, paso 7 y tarea 3, paso 5 |
