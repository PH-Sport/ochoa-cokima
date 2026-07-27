# Despliegue en Vercel

> **Estado:** documentado, **no ejecutado** en Vercel. El código ya está listo (incluido el
> blindaje de `SITE_URL`); falta crear los proyectos, y eso depende de decidir dominios y de
> tener los accesos (ver `superpowers/specs/2026-07-18-webs-grupo-tombo-design.md` §12).

## El concepto: un repo, dos proyectos

La unidad de despliegue en Vercel es el **proyecto**, no el repositorio. Un mismo repo de
Git puede alimentar tantos proyectos como haga falta; lo que los distingue es el
**Root Directory**.

Aquí se crean **dos proyectos** que importan este mismo repositorio. Cada uno tiene su
dominio, sus variables de entorno, su historial de despliegues y sus URLs de preview:
independientes a todos los efectos, aunque compartan `packages/*`.

Vercel detecta `pnpm-workspace.yaml` y ejecuta el install en la raíz del repo, así que las
dependencias del workspace se resuelven solas. Confirmar que está activo
*"Include source files outside of the Root Directory in the Build Step"* (viene activado
por defecto en monorepos) — sin eso, `packages/*` no llega al build.

## Configuración de cada proyecto

| Ajuste | Proyecto `cokima` | Proyecto `ochoa` |
|---|---|---|
| Root Directory | `apps/cokima` | `apps/ochoa` |
| Framework preset | Astro (autodetectado) | Astro (autodetectado) |
| Build Command | `astro build` (autodetectado) | `astro build` (autodetectado) |
| Install Command | `pnpm install` en la raíz (automático) | igual |
| Dominio | pendiente (p. ej. `cokima.es`) | pendiente (p. ej. `tasquitalosochoa.es`) |

### Variables de entorno

Se configuran **por proyecto** en Settings → Environment Variables. Referencia completa en
los `.env.example` de cada app.

| Variable | `cokima` | `ochoa` | Notas |
|---|---|---|---|
| `SITE_URL` | su dominio | su dominio | **Obligatoria en producción**: sin ella el build falla. |
| `PUBLIC_GTM_ID` | `GTM-KW58ZDS` | `GTM-KW58ZDS` | Contenedor actual del grupo. |
| `PUBLIC_META_PIXEL_ID` | píxel de Cokima | píxel de Los Ochoa | Recomendado uno por marca (hoy comparten `6251807501500238`). |
| `PUBLIC_COVERMANAGER_SLUG` | `restaurante-cokima` | `tasquita-los-ochoa` | Verificados en la web actual. |
| `META_CAPI_TOKEN` | token de Cokima | token de Los Ochoa | **Secreto**: solo en Vercel, nunca en el repo. |

Sin `PUBLIC_META_PIXEL_ID` ni `META_CAPI_TOKEN`, el endpoint `/api/meta-capi` responde
`503 capi-not-configured` y el resto de la web funciona con normalidad. Es el
comportamiento esperado hasta que lleguen los accesos.

## Evitar que cada push reconstruya las dos webs

Por defecto, cualquier push dispara el build de **ambos** proyectos: cambiar un precio de
Los Ochoa redesplegaría también Cokima. Se corrige con el *Ignored Build Step*
(Settings → Git), idéntico en los dos proyectos:

```bash
git diff --quiet HEAD^ HEAD -- . ../../packages ../../pnpm-lock.yaml
```

El comando se ejecuta desde el Root Directory, así que `.` es la app correspondiente.
Semántica de Vercel: **salida 0 → se omite el build; salida distinta de 0 → se construye**.
Es decir: si no ha cambiado nada de esta app, ni de los paquetes compartidos, ni las
dependencias, no se reconstruye. Un cambio en `packages/ui` reconstruye las dos, que es lo
correcto. Si el comando falla (p. ej. `HEAD^` no resuelve en un clon superficial), devuelve
distinto de 0 y se construye igualmente: el fallo va del lado seguro.

## Dominios y SEO

1. Asignar el dominio a cada proyecto (Settings → Domains) y fijar `SITE_URL` con ese mismo
   valor. De `SITE_URL` salen canonical, `hreflang`, sitemap y el JSON-LD `Restaurant`.
2. Si se abandonan las URLs actuales de `grupotombo.com`, configurar **redirects 301** desde
   `/cokima-kitchenmadness/` y `/tasquita-los-ochoa/` hacia los dominios nuevos. Sin esto se
   tira el posicionamiento acumulado.
3. Dar de alta **cada dominio por separado** en Google Search Console y enlazar cada web con
   su ficha de Google Business.

## Cómo se resuelve `SITE_URL`

Ya no hay dominio placeholder. `astro.config.mjs` delega en `resolveSiteUrl()`
(`packages/config/src/site-url.mjs`, con tests), que aplica esta escalera:

| Entorno | Resultado |
|---|---|
| `SITE_URL` definida | ese valor normalizado (sin barra final; se exige `http(s)` absoluto) |
| Producción de Vercel (`VERCEL_ENV=production`) sin `SITE_URL` | **el build falla** con un error explícito |
| Preview de Vercel | `https://$VERCEL_URL`, el dominio efímero del despliegue |
| Desarrollo local | `http://localhost:4321` |

Así las previews funcionan sin configurar nada, y un despliegue de producción sin dominio
no puede publicar canonical, `hreflang`, sitemap, `robots.txt` ni JSON-LD apuntando a un
dominio inventado: rompe antes.

## Pendiente de implementar

- [ ] Crear los dos proyectos y conectarlos al repositorio (`PHSPORT/ochoa-cokima`).
- [ ] Configurar variables de entorno y dominios.
- [ ] Aplicar el *Ignored Build Step* en ambos.
- [ ] Redirects 301 desde las URLs antiguas.

## Herramientas

El CLI de Vercel no está instalado en el entorno de desarrollo actual. Para despliegues y
gestión desde terminal:

```bash
npm i -g vercel
```

El flujo por Git integration (push → build automático) no requiere el CLI. El CLI es útil
para `vercel env pull`, despliegues manuales y consultar logs.
