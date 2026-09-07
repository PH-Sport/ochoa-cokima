# Webs Grupo Tombo — Cokima & Tasquita Los Ochoa

Monorepo pnpm con las dos webs (Astro 6) y la fontanería compartida.

```
apps/
  cokima/     → web de Cokima (Kitchen Madness) · dominio propio · deploy propio
  ochoa/      → web de Tasquita Los Ochoa · dominio propio · deploy propio
packages/
  content/    → esquema tipado de la carta (Zod)
  tracking/   → capa de atribución (UTM/fbclid, píxel + Meta CAPI, puente CoverManager)
  ui/         → componentes Astro sin marca (la marca la ponen los tokens de cada app)
  config/     → configuración compartida (tsconfig, resolución de SITE_URL)
```

## Comandos

```bash
pnpm install     # instalar todo
pnpm test        # tests de packages (content + tracking)
pnpm build       # build de las dos apps
```

Por app: `pnpm --filter cokima dev` / `pnpm --filter ochoa dev`.

## Variables de entorno (por app)

| Variable | Qué es | Estado |
|---|---|---|
| `SITE_URL` | URL canónica del site (dominio pendiente de decisión) | obligatoria en producción: sin ella el build falla ([deploy.md](docs/deploy.md)). En local cae a `http://localhost:4321`; en previews de Vercel usa el dominio del despliegue |
| `PUBLIC_GTM_ID` | Contenedor Google Tag Manager | `GTM-KW58ZDS` (actual del grupo) |
| `PUBLIC_META_PIXEL_ID` | Píxel de Meta (recomendado: uno por marca) | pendiente de accesos |
| `PUBLIC_COVERMANAGER_SLUG` | Slug del motor de reservas | `restaurante-cokima` / `tasquita-los-ochoa` |
| `META_CAPI_TOKEN` | Token de la Conversions API (secreto, solo servidor) | pendiente de accesos |

## Documentación

- **Empezar por aquí: `docs/estado.md`** — estado actual, qué falta y cómo levantarlo.
- Si eres un agente: `CLAUDE.md` manda, y después `docs/trabajar-con-mario.md` (cómo se reporta
  aquí), `docs/metodo.md` (cómo se decide lo visual y cómo se verifica) y `docs/recursos.md`
  (identificadores y material).
- Spec de diseño: `docs/superpowers/specs/2026-07-18-webs-grupo-tombo-design.md`
- Plan de implementación: `docs/superpowers/plans/2026-07-18-monorepo-implementation.md`
- Despliegue en Vercel: `docs/deploy.md` (un repo → dos proyectos; pendiente de ejecutar)
