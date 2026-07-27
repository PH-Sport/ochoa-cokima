# Monorepo Grupo Tombo (Cokima + Los Ochoa) — Implementation Plan

> **Estado: completado (Tasks 0–6).** Última verificación 2026-07-27: `pnpm test` 15/15 en
> verde (content 4, config 5, tracking 6) y `pnpm build` `Complete!` en las dos apps; carta,
> iframe de CoverManager, banner de consentimiento, `hreflang` y JSON-LD comprobados en
> `dev` para ambas marcas. Añadido después del plan: `resolveSiteUrl()` en `packages/config`
> (el build de producción falla si falta `SITE_URL` — ver `docs/deploy.md`).
> Lo que queda es externo al código: crear los proyectos en Vercel, dominios y los accesos
> del spec §12.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
> **Nota de esta sesión:** el usuario ha pedido ejecución inline continua sin checkpoints; el ejecutor es la misma sesión que validó los bocetos.

**Goal:** Monorepo pnpm con dos sites Astro 6 (Cokima y Tasquita Los Ochoa) portando los bocetos validados, con carta tipada bilingüe, SEO por dominio y capa de atribución compartida.

**Architecture:** pnpm workspaces sin Turborepo. `packages/content` (esquema Zod de carta), `packages/tracking` (atribución: UTM/fbclid → cookie, puente iframe, píxel + CAPI dedup), `packages/ui` (componentes Astro sin marca). Cada app inyecta tokens CSS de marca y su contenido; salida estática con una ruta serverless (`/api/meta-capi`).

**Tech Stack:** Node 22, pnpm 9, Astro 6, Zod, Vitest, @astrojs/vercel, @astrojs/sitemap.

## Global Constraints

- Astro **6.x** estable; salida `static`; solo `/api/meta-capi` con `prerender = false`.
- pnpm workspaces, **sin Turborepo**.
- `packages/ui` **no contiene ni un color ni una fuente de marca** — todo por CSS custom properties.
- i18n: ES en raíz, EN bajo `/en/`; rutas `/carta`↔`/en/menu`, `/reservas`↔`/en/reservations`.
- Precio: `number | { half: number|null, full: number }` (spec §6).
- Alérgenos: enum de los 14 UE; **la app Ochoa no muestra alérgenos** (su carta real no los publica).
- Nada de fuentes por CDN: woff2 autoalojados (subconjunto latin, ya descargados en scratchpad).
- Eventos Meta: `Schedule` (reserva confirmada), `InitiateCheckout` (inicio), dedup por `event_id`.
- Tracking solo tras consentimiento (banner propio, Consent Mode v2).
- Env vars por app: `SITE_URL`, `PUBLIC_GTM_ID`, `PUBLIC_META_PIXEL_ID`, `PUBLIC_COVERMANAGER_SLUG`, `META_CAPI_TOKEN`.
- Slugs CoverManager reales: Cokima `restaurante-cokima`, Ochoa `tasquita-los-ochoa`.
- Contenido 100% real de las cartas publicadas (ES ya transcrita en bocetos; EN se transcribe de las imágenes oficiales `Carta-cokima-eng.jpg` y `Los-Ochoa-Carta-SEPT2025-ENG.jpg`).
- Commits al final de cada task, mensaje convencional + `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.

## Design tokens (fuente de verdad de los bocetos validados)

**Cokima (dark):** ground `#150F0C` / `#1E1611` / `#271C16`; texto `#F3EADD` / `#A99C8C` / `#6C6055`; rojo `#ED1C24` (hover `#FF3B33`); ámbar `#FF7A18`; línea `rgba(243,234,221,.12)`. Display+UI: Bricolage Grotesque (400/600/800); acentos: Georgia itálica. Canvas de ascuas en hero (respeta `prefers-reduced-motion`). Estructura: nav sticky · hero grid con foto 4/5 · manifiesto · carta 2 col con leaders punteados · card reservas · visita+mapa placeholder · footer.

**Ochoa (light):** paper `#F4EEE2` / `#ECE4D3`; tinta `#23201B` / `#6E6558` / `#9C927F`; rojo `#C6222B` (hover `#A81B23`); línea `rgba(35,32,27,.18)`. Display: Anton con `text-shadow:.045em .05em 0 var(--ink)` (rótulo real); cuerpo Georgia. Doble raya (`border-top:2px solid; border-bottom:1px solid`), leaders punteados 2px, sombras duras (`box-shadow:8px 8px 0`), sello "MADRIZ" rotado. Estructura: nav · hero con foto 16/10 · manifiesto con cita real · carta 1 col con columnas ½/1 · sección "la tasca" con foto rótulo · reservas · visita · footer. Sin JS.

**Assets en scratchpad** (`C:\Users\mario\AppData\Local\Temp\claude\C--Users-mario-ochoa-cokima\a7c449e2-da48-41e7-b346-b6d551d80ca7\scratchpad`): `bricolage-{400,600,800}.b64.txt`, `anton-400.b64.txt` (data-URIs woff2 latin → decodificar a `public/fonts/*.woff2`); `hero-cokima.jpg`, `hero-ochoa.jpg`, `tasca-ochoa.jpg` (→ `public/images/`); bocetos `cokima-demo.html`, `ochoa-demo.html` (referencia de estructura/CSS a portar).

---

### Task 0: Workspace + git

**Files:**
- Create: `package.json`, `pnpm-workspace.yaml`, `.gitignore`, `.npmrc`, `packages/config/tsconfig.base.json`, `README.md`

**Interfaces:**
- Produces: workspace raíz que resuelve `@tombo/content`, `@tombo/tracking`, `@tombo/ui` para las apps.

- [x] **Step 1: instalar pnpm** — `corepack enable pnpm` y si falla `npm i -g pnpm@9`; verificar `pnpm -v` → `9.x`/`10.x`.
- [x] **Step 2: git init** — `git init -b main` en `C:\Users\mario\ochoa-cokima`.
- [x] **Step 3: archivos raíz**

`package.json`:
```json
{
  "name": "tombo-webs",
  "private": true,
  "scripts": {
    "build": "pnpm -r --filter './apps/*' build",
    "test": "pnpm -r --filter './packages/*' test"
  },
  "packageManager": "pnpm@9.15.0"
}
```
`pnpm-workspace.yaml`:
```yaml
packages:
  - "apps/*"
  - "packages/*"
```
`.gitignore`: `node_modules/`, `dist/`, `.astro/`, `.vercel/`, `.env`, `.env.*`, `!.env.example`.
`.npmrc`: `shamefully-hoist=false`.
`packages/config/tsconfig.base.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022", "module": "ESNext", "moduleResolution": "bundler",
    "strict": true, "skipLibCheck": true, "types": []
  }
}
```
`README.md`: descripción breve, comandos (`pnpm install`, `pnpm build`, `pnpm test`), tabla de env vars de Global Constraints, enlace al spec.

- [x] **Step 4: commit** — `git add -A; git commit -m "chore: scaffold pnpm workspace"`.

---

### Task 1: packages/content — esquema de carta (TDD)

**Files:**
- Create: `packages/content/package.json`, `packages/content/src/index.ts`, `packages/content/test/schema.test.ts`

**Interfaces:**
- Produces: `dishSchema` (Zod), `allergenEnum` (z.enum de 14 slugs UE: `gluten crustaceos huevo pescado cacahuetes soja lacteos frutos-cascara apio mostaza sesamo sulfitos altramuces moluscos`), tipo `Dish = z.infer<typeof dishSchema>`, helper `hasHalfPortions(dishes: Dish[]): boolean`.

- [x] **Step 1: package.json** — name `@tombo/content`, `"type":"module"`, exports `./src/index.ts`, deps `zod`, devDeps `vitest`, script `test: vitest run`.
- [x] **Step 2: test que falla** (`test/schema.test.ts`):
```ts
import { describe, it, expect } from "vitest";
import { dishSchema, hasHalfPortions } from "../src/index.ts";

describe("dishSchema", () => {
  it("acepta precio único (Cokima)", () => {
    const d = dishSchema.parse({ name: "Tataki de atún", price: 18, allergens: ["pescado", "soja"] });
    expect(d.price).toBe(18);
    expect(d.featured).toBe(false);
  });
  it("acepta media ración nula (el guion de Los Ochoa)", () => {
    const d = dishSchema.parse({ name: "Cachopín de ternera", price: { half: null, full: 18 } });
    expect(d.price).toEqual({ half: null, full: 18 });
  });
  it("rechaza alérgeno fuera del enum UE", () => {
    expect(() => dishSchema.parse({ name: "X", price: 5, allergens: ["azucar"] })).toThrow();
  });
  it("hasHalfPortions detecta cartas con columna ½", () => {
    const cok = [dishSchema.parse({ name: "A", price: 14 })];
    const och = [dishSchema.parse({ name: "B", price: { half: 7, full: 12 } })];
    expect(hasHalfPortions(cok)).toBe(false);
    expect(hasHalfPortions(och)).toBe(true);
  });
});
```
- [x] **Step 3: correr y ver FAIL** — `pnpm --filter @tombo/content test` → "Cannot find module".
- [x] **Step 4: implementar** (`src/index.ts`):
```ts
import { z } from "zod";

export const allergenEnum = z.enum([
  "gluten","crustaceos","huevo","pescado","cacahuetes","soja","lacteos",
  "frutos-cascara","apio","mostaza","sesamo","sulfitos","altramuces","moluscos",
]);
export type Allergen = z.infer<typeof allergenEnum>;

export const dishSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  allergens: z.array(allergenEnum).default([]),
  featured: z.boolean().default(false),
  image: z.string().optional(),
  price: z.union([
    z.number().positive(),
    z.object({ half: z.number().positive().nullable(), full: z.number().positive() }),
  ]),
});
export type Dish = z.infer<typeof dishSchema>;

export const menuEntrySchema = dishSchema.extend({
  section: z.string().min(1),
  order: z.number().int(),
});
export type MenuEntry = z.infer<typeof menuEntrySchema>;

export function hasHalfPortions(dishes: Dish[]): boolean {
  return dishes.some((d) => typeof d.price === "object");
}
```
(En apps, el campo `image` se refina a `image()` de Astro si se usan assets locales; el string opcional basta para el paquete.)
- [x] **Step 5: correr y ver PASS**; **Step 6: commit** `feat(content): dish schema with EU allergens and dual pricing`.

---

### Task 2: packages/tracking — atribución (TDD en lo puro)

**Files:**
- Create: `packages/tracking/package.json`, `src/attribution.ts`, `src/events.ts`, `src/client.ts`, `src/capi.ts`, `src/index.ts`, `test/attribution.test.ts`, `README.md`

**Interfaces:**
- Produces:
  - `parseAttribution(search: string): Attribution | null` — extrae `utm_source/medium/campaign/content/term`, `fbclid`, `gclid`; null si no hay ninguno.
  - `serializeAttribution(a: Attribution, now?: number): string` / `deserializeAttribution(raw: string): Attribution | null` (JSON con `ts`).
  - `buildEventId(): string` (crypto.randomUUID con fallback).
  - `buildScheduleEvent(opts: {eventId: string; sourceUrl: string; fbp?: string; fbc?: string; ip?: string; ua?: string}): MetaCapiEvent` — payload CAPI `event_name:"Schedule"`.
  - `sendCapiEvent(pixelId: string, token: string, ev: MetaCapiEvent, fetchImpl?): Promise<{ok:boolean;status:number}>` (POST `https://graph.facebook.com/v21.0/{pixelId}/events`).
  - `initTracking(cfg: {gtmId?:string; pixelId?:string; coverSlug:string})` (client.ts, browser-only): captura atribución a cookie `tombo_attr` (90 días, `SameSite=Lax`), listener `message` del iframe CoverManager (dispara `fbq('track','Schedule',{},{eventID})` + `fetch('/api/meta-capi')` con el mismo id; `InitiateCheckout` en evento de inicio), puente GA4 `postMessage` al iframe. Solo se invoca tras consentimiento.

- [x] **Step 1: package.json** — `@tombo/tracking`, `"type":"module"`, exports `./src/index.ts` (+ `./client` → `src/client.ts`, `./capi` → `src/capi.ts`), devDeps `vitest`, script `test: vitest run`.
- [x] **Step 2: test que falla** (`test/attribution.test.ts`):
```ts
import { describe, it, expect } from "vitest";
import { parseAttribution, serializeAttribution, deserializeAttribution, buildEventId, buildScheduleEvent } from "../src/index.ts";

describe("parseAttribution", () => {
  it("extrae utm y fbclid", () => {
    const a = parseAttribution("?utm_source=instagram&utm_campaign=verano&fbclid=abc123");
    expect(a).toEqual({ utm_source: "instagram", utm_campaign: "verano", fbclid: "abc123" });
  });
  it("null cuando no hay señales", () => {
    expect(parseAttribution("?foo=bar")).toBeNull();
  });
});
describe("cookie round-trip", () => {
  it("serializa y deserializa con timestamp", () => {
    const a = { utm_source: "meta", fbclid: "x" };
    const raw = serializeAttribution(a, 1700000000000);
    const back = deserializeAttribution(raw);
    expect(back).toMatchObject(a);
  });
  it("deserialize devuelve null con basura", () => {
    expect(deserializeAttribution("%%%")).toBeNull();
  });
});
describe("eventos Meta", () => {
  it("buildEventId genera ids únicos", () => {
    expect(buildEventId()).not.toBe(buildEventId());
  });
  it("buildScheduleEvent forma el payload CAPI", () => {
    const ev = buildScheduleEvent({ eventId: "e1", sourceUrl: "https://x.es/reservas", fbc: "fb.1.1.abc", ip: "1.2.3.4", ua: "UA" });
    expect(ev.event_name).toBe("Schedule");
    expect(ev.event_id).toBe("e1");
    expect(ev.event_source_url).toBe("https://x.es/reservas");
    expect(ev.action_source).toBe("website");
    expect(ev.user_data.fbc).toBe("fb.1.1.abc");
    expect(typeof ev.event_time).toBe("number");
  });
});
```
- [x] **Step 3: FAIL**; **Step 4: implementar** `attribution.ts` + `events.ts` (tipos `Attribution` con campos opcionales; `MetaCapiEvent = {event_name; event_time; event_id; event_source_url; action_source:"website"; user_data:{client_ip_address?; client_user_agent?; fbp?; fbc?}}`); `capi.ts` con `sendCapiEvent`; `client.ts` con `initTracking` (sin test unitario; se verifica en integración manual cuando haya accesos — documentarlo en README con el diagrama del spec §9 y el plan B sin backoffice).
- [x] **Step 5: PASS** — `pnpm --filter @tombo/tracking test`; **Step 6: commit** `feat(tracking): attribution capture, event ids and Meta CAPI payloads`.

---

### Task 3: packages/ui — componentes sin marca

**Files:**
- Create: `packages/ui/package.json`, `src/Seo.astro`, `src/MenuSection.astro`, `src/DishRow.astro`, `src/AllergenIcons.astro`, `src/BookingEmbed.astro`, `src/ConsentBanner.astro`, `src/index.ts`

**Interfaces:**
- Consumes: `MenuEntry`, `hasHalfPortions` de `@tombo/content`.
- Produces (props):
  - `Seo.astro`: `{ title, description, locale: "es"|"en", altPath: string, restaurant: { name, streetAddress, postalCode, telephone, servesCuisine, priceRange, openingHours: string[], instagram } }` → meta + canonical/hreflang desde `Astro.site` + JSON-LD `Restaurant`.
  - `MenuSection.astro`: `{ title, dishes: MenuEntry[], showAllergens?: boolean, halfLabel?, fullLabel? }` — pinta columnas ½/1 si `hasHalfPortions(dishes)`.
  - `DishRow.astro`: `{ dish, showAllergens, dualColumns }` — precio único o dos celdas (`—` si `half === null`).
  - `AllergenIcons.astro`: `{ allergens: Allergen[] }` — sprite SVG interno (iconos del boceto v3), `role="img"` + `aria-label` por icono.
  - `BookingEmbed.astro`: `{ slug, locale, title }` — iframe `https://www.covermanager.com/reservation/module_restaurant/{slug}/{spanish|english}` + iframeResizer del propio CoverManager + `id={slug}`.
  - `ConsentBanner.astro`: `{ locale }` — banner fijo con Aceptar/Rechazar; al aceptar guarda `tombo_consent=granted` y emite `window.dispatchEvent(new Event("tombo:consent"))`; las apps escuchan ese evento para llamar `initTracking`.
- Estilo: solo estructura + `var(--...)` (tokens los pone cada app). Sin colores literales.

- [x] **Step 1: package.json** — `@tombo/ui`, exports de cada `.astro` y `src/index.ts` (re-export tipos); peerDep `astro`, dep `@tombo/content`.
- [x] **Step 2: implementar los 6 componentes** (estructura HTML calcada de los bocetos, clases genéricas `menu-section`, `dish`, `leader`, `price`…).
- [x] **Step 3: typecheck rápido** — se valida al compilar las apps (Task 4/5); no hay test unitario de render.
- [x] **Step 4: commit** `feat(ui): brand-agnostic menu, seo, booking and consent components`.

---

### Task 4: apps/cokima

**Files:**
- Create: `apps/cokima/package.json`, `astro.config.mjs`, `tsconfig.json`, `.env.example`, `content.config.ts`, `src/styles/tokens.css`, `src/styles/global.css`, `src/layouts/Base.astro`, `src/components/{Nav,Hero,Manifesto,Footer,Embers}.astro`, `src/pages/{index,carta,reservas,aviso-legal,privacidad,cookies}.astro`, `src/pages/en/{index,menu,reservations}.astro`, `src/pages/api/meta-capi.ts`, `src/content/menu/{es,en}/*.yaml`, `public/fonts/bricolage-{400,600,800}.woff2`, `public/images/hero.jpg`, `public/robots.txt`

**Interfaces:**
- Consumes: todo lo de Tasks 1–3.
- Produces: site estático desplegable; patrón de app que Task 5 replica.

- [x] **Step 1: package.json + config.** Deps: `astro@^6`, `@astrojs/vercel`, `@astrojs/sitemap`, `@tombo/{content,tracking,ui}` (workspace:*). `astro.config.mjs`:
```js
import { defineConfig } from "astro/config";
import vercel from "@astrojs/vercel";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: process.env.SITE_URL ?? "https://cokima.example",
  output: "static",
  adapter: vercel(),
  integrations: [sitemap()],
  i18n: { defaultLocale: "es", locales: ["es", "en"], routing: { prefixDefaultLocale: false } },
});
```
`content.config.ts`: colección `menu` con loader `glob({ pattern: "**/*.yaml", base: "./src/content/menu" })` y schema `menuEntrySchema` de `@tombo/content` (el locale se deriva del id `es/...`/`en/...`).
`.env.example` con las 5 vars de Global Constraints y los valores públicos conocidos (`PUBLIC_GTM_ID=GTM-KW58ZDS`, `PUBLIC_COVERMANAGER_SLUG=restaurante-cokima`; píxel y token vacíos — pendientes de accesos).
- [x] **Step 2: assets** — decodificar los `.b64.txt` de Bricolage a `public/fonts/*.woff2` (PowerShell `[IO.File]::WriteAllBytes`); copiar `hero-cokima.jpg` → `public/images/hero.jpg`; `robots.txt` con `Sitemap: {SITE_URL}/sitemap-index.xml`.
- [x] **Step 3: tokens + layout + componentes** — portar el CSS del boceto v3 a `tokens.css` (custom properties) y `global.css` (reset + grano + tipografía); `Base.astro` (html lang, `Seo`, Nav, Footer, ConsentBanner, script que escucha `tombo:consent` → `initTracking`); `Embers.astro` con el canvas del boceto.
- [x] **Step 4: contenido ES** — YAML por plato desde el boceto v3 (13 platos + 2 postres, secciones `compartir`/`terminar`/`postres`, alérgenos orientativos actuales marcados con comentario `# orientativo — confirmar con carta oficial`).
- [x] **Step 5: contenido EN real** — descargar y transcribir `https://www.grupotombo.com/wp-content/uploads/2026/03/Carta-cokima-eng.jpg`; crear los YAML `en/`.
- [x] **Step 6: páginas** — `index.astro` (hero + manifiesto + carta destacada + reservas + visita, como el boceto), `carta.astro` (carta completa con `MenuSection`), `reservas.astro` (`BookingEmbed` + info), legales (contenido mínimo con aviso "pendiente de datos fiscales del cliente"), espejos `en/` con las rutas del spec §7 y `hreflang` cruzado vía `Seo`.
- [x] **Step 7: endpoint CAPI** (`src/pages/api/meta-capi.ts`):
```ts
export const prerender = false;
import type { APIRoute } from "astro";
import { buildScheduleEvent, sendCapiEvent } from "@tombo/tracking/capi";

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const pixelId = import.meta.env.PUBLIC_META_PIXEL_ID;
  const token = import.meta.env.META_CAPI_TOKEN;
  if (!pixelId || !token) return new Response(JSON.stringify({ ok: false, reason: "capi-not-configured" }), { status: 503 });
  const body = await request.json().catch(() => null);
  if (!body?.eventId || !body?.sourceUrl) return new Response(null, { status: 400 });
  const ev = buildScheduleEvent({
    eventId: String(body.eventId), sourceUrl: String(body.sourceUrl),
    fbp: body.fbp, fbc: body.fbc, ip: clientAddress, ua: request.headers.get("user-agent") ?? undefined,
  });
  const res = await sendCapiEvent(pixelId, token, ev);
  return new Response(JSON.stringify(res), { status: res.ok ? 200 : 502 });
};
```
- [x] **Step 8: build verde** — `pnpm --filter cokima build` → `Complete!` sin errores (la validación Zod de la carta corre en el build). Arreglar lo que salga.
- [x] **Step 9: commit** `feat(cokima): port validated design to Astro (i18n, menu collections, seo, capi endpoint)`.

---

### Task 5: apps/ochoa

**Files:** misma estructura que Task 4 con: tokens del boceto Ochoa, fuente `anton-400.woff2`, imágenes `hero.jpg` (mesa mármol) + `tasca.jpg` (rótulo), componente extra `Tasca.astro`, sin `Embers.astro`, contenido ½/ración (los 15 platos reales; `half: null` donde el guion), **sin alérgenos** (`showAllergens={false}`), slug `tasquita-los-ochoa`, EN transcrito de `Los-Ochoa-Carta-SEPT2025-ENG.jpg`.

- [x] **Step 1: replicar estructura** (copiar app cokima y ajustar por completo: tokens, fuentes, componentes, contenido, textos de marca del boceto Ochoa).
- [x] **Step 2: build verde** — `pnpm --filter ochoa build`.
- [x] **Step 3: commit** `feat(ochoa): port validated design to Astro with dual-portion menu`.

---

### Task 6: verificación integral + cierre

- [x] **Step 1: suite completa** — `pnpm test` (content + tracking en verde) y `pnpm build` (ambas apps).
- [x] **Step 2: inspección visual** — `astro preview` de cada app en el Browser pane; comprobar contra los bocetos: tipografías cargan (tildes/ñ), carta renderiza columnas correctas, iframe CoverManager presente en `/reservas`, banner de consentimiento aparece, hreflang/JSON-LD en el HTML.
- [x] **Step 3: README final** — quickstart, mapa del repo, estado de pendientes (accesos, dominios, fotos) enlazando al spec §12.
- [x] **Step 4: commit** `docs: final readme and verification notes` + marcar checkboxes de este plan.

## Self-review del plan

1. **Cobertura del spec:** §4 stack→T0/T4; §5 estructura→T0–T5; §6 carta→T1+T4.4/T5; §7 i18n→T4.6/T5; §8 SEO→T3 (Seo.astro)+T4/T5 (sitemap, robots, hreflang, JSON-LD); §9 tracking→T2+T4.7; §10 RGPD→T3 (ConsentBanner, gate de initTracking); §11 fotos/fuentes→T4.2/T5. Fuera de alcance consciente: inyección GTM en backoffice CoverManager, píxel nuevo por marca, redirects 301 y dominios (bloqueados por accesos/decisiones del cliente — spec §12).
2. **Placeholders:** las páginas legales llevan contenido mínimo explícito pendiente de datos fiscales — es una dependencia externa declarada en el spec, no un TBD del plan.
3. **Consistencia de tipos:** `MenuEntry`/`hasHalfPortions` (T1) son los que consumen T3/T4/T5; `buildScheduleEvent`/`sendCapiEvent` (T2) son los del endpoint (T4.7); nombres de env vars idénticos en Global Constraints, `.env.example` y endpoint. Corregido en esta revisión: el schema del paquete usa `image: z.string().optional()` (el `image()` de Astro solo existe en el contexto de la app) — anotado en T1.
