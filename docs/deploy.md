# Despliegue en Vercel

> **Estado (2026-07-31): los dos proyectos existen y despliegan.** Cada push a `preview` publica
> en su alias fijo, que está en `estado.md` §6. Lo que sigue pendiente son los **dominios
> propios**, las **variables de entorno de producción** y el *Ignored Build Step* (§Infraestructura
> de `estado.md`); `SITE_URL` bloquea a propósito los despliegues de producción mientras no haya
> dominio.
>
> **No busques `.vercel/project.json` para saber si el repo está vinculado:** está en
> `.gitignore` y la vinculación por Git vive en el panel de Vercel, no en el repositorio. Su
> ausencia no significa nada. Este documento decía «no ejecutado» hasta el 2026-07-31 e indujo a
> error justo por ahí.

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

**Implementado el 2026-08-16.** Hasta entonces cualquier push disparaba el build de **ambos**
proyectos, y no era teórico: de los veinte despliegues anteriores de Cokima, la mayoría eran
commits que no la tocaban —«fix(ochoa): los botones dejan de asomar», «docs: fuera las
referencias cruzadas»—. Lo levantó Mario al verlo.

Va en el repo y no en el panel, que es donde estaba planteado antes: un `ignoreCommand` en el
`vercel.json` de cada app, apuntando a un script común.

```
apps/cokima/vercel.json   →  sh ../../scripts/vercel-ignore.sh apps/cokima
apps/ochoa/vercel.json    →  sh ../../scripts/vercel-ignore.sh apps/ochoa
```

**Vercel interpreta el código de salida al revés de lo habitual: 0 salta el build, 1 construye.**
Y da la casualidad de que `git diff --quiet` devuelve exactamente eso —0 si no hay cambios—, así
que el script termina en ese comando y no traduce nada.

Reconstruye si cambia la propia app, `packages/`, el lockfile o la configuración del workspace:
las dos apps dependen de los cuatro paquetes, así que un cambio ahí sí tiene que llegar a las
dos. Ya no reconstruye nada un cambio en `docs/` ni en la app de la otra marca.

Tres detalles que no son evidentes y que conviene no «simplificar»:

- **El `cd` a la raíz del repo.** El comando corre desde el Root Directory de cada proyecto y las
  rutas de `git diff` se resuelven contra el directorio actual. Sin ese `cd`, la comparación se
  haría sobre rutas que no existen y no detectaría nada — es decir, saltaría siempre.
- **Las dos salidas de seguridad devuelven 1 (construir).** El clon de Vercel es superficial y
  puede no traer `HEAD^`; y sin argumento no hay forma de decidir. En la duda, se construye.
- **Requiere «Include source files outside of the Root Directory»** activo en los dos proyectos.
  Ya lo está, o los `workspace:*` no resolverían y no construiría ninguna.

Probado contra cuatro commits reales del historial antes de subirlo:

| commit | qué toca | resultado |
|---|---|---|
| `487d8b3` | solo `docs/` | saltan las dos |
| `4d09cff` | solo Cokima | construye Cokima, salta Ochoa |
| `f4d2367` | `packages/ui` | construyen las dos |
| `9e803f2` | Ochoa + `packages/ui` | construyen las dos |

Y confirmado en producción con el primer push a `tmp/entrada-cokima`: Cokima construyó y **Ochoa
quedó en `CANCELED`**.

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

## Modelo de ramas

Dos ramas permanentes:

| Rama | Papel | Despliegue |
|---|---|---|
| `main` | **producción** | *production* en Vercel. Falla mientras no haya `SITE_URL`, a propósito. |
| `preview` | **desarrollo** | preview con alias fijo por rama. Aquí se integra todo el trabajo. |

El trabajo se integra en `preview` y se enseña desde su alias. Cuando una tanda está
aprobada para salir a producción, se lleva a `main`:

```bash
git switch main && git merge preview
```

Las ramas de tema (`feat/…`) son opcionales y efímeras: nacen de `preview` y vuelven a
`preview`. No se acumulan.

## Enseñar las webs antes de tener dominio

Como `SITE_URL` solo es obligatoria en producción, `preview` da URLs que enseñar sin haber
decidido dominio:

```bash
git push origin preview
```

Vercel construye una preview con `VERCEL_URL` y la publica en un alias fijo por rama
(`cokima-git-preview-<team>.vercel.app`), con `x-robots-tag: noindex`, así que no interfiere
con el SEO. Verificado el 2026-07-27 en el proyecto `cokima`: canonical, `hreflang`, `og:url`,
JSON-LD y sitemap salen con el dominio del despliegue.

Mientras no exista `SITE_URL` en el proyecto, **los despliegues de producción (`main`)
fallarán a propósito**. Es lo correcto: significa que aún no hay dominio que publicar.

Si el equipo no puede abrir la URL, es la *Deployment Protection* de Vercel
(Settings → Deployment Protection): hay que desactivar *Vercel Authentication* para previews
o compartir el enlace con bypass.

## Pendiente de implementar

- [x] Proyecto `cokima` creado y conectado a `PH-Sport/ochoa-cokima` (Root Directory `apps/cokima`).
- [x] Proyecto `ochoa` creado igual, con Root Directory `apps/ochoa`. Verificado el 2026-07-28:
      despliega previews por rama con su propio alias.
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
