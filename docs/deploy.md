# Despliegue en Vercel

> **Estado: vivo** · revisado 2026-11-18

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
| Dominio | `www.cokima.es` (principal) y `cokima.es` (308 a `www`), dados de alta el 2026-11-23; **los DNS de DonDominio, sin cambiar** (§Dominios y SEO) | `www.tasquitalosochoa.es` (principal); `tasquitalosochoa.es`, `tasquitalosochoa.com` y `www.tasquitalosochoa.com`, 308 a ella. Dados de alta el 2026-11-23; **DNS sin cambiar** (§Dominios y SEO) |

### Variables de entorno

Se configuran **por proyecto** en Settings → Environment Variables. Referencia completa en
los `.env.example` de cada app.

| Variable | `cokima` | `ochoa` | Notas |
|---|---|---|---|
| `SITE_URL` | `https://www.cokima.es` (puesta el 2026-11-23, solo *production*) | su dominio | **Obligatoria en producción**: sin ella el build falla. |
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

**Se compara con el último despliegue que salió bien, no con el commit anterior** (desde el
2026-10-29). Vercel da ese commit en `VERCEL_GIT_PREVIOUS_SHA`, que solo existe durante este
paso. Hasta ese día se comparaba con `HEAD^`, y eso solo vale si cada push trae un commit: Vercel
despliega una vez por push y mira solo el último. El 2026-10-29 un push de diez commits a
`preview` terminaba en uno de solo `docs/`; el script comparó ese último con el de antes, no vio
nada de Ochoa y **canceló el despliegue entero**, aunque los nueve anteriores cambiaban la web. No
dio ningún error: en el panel quedó un despliegue en `CANCELED` y el alias siguió enseñando la
versión vieja. Con el arreglo salió algo más: **Cokima llevaba sin desplegarse en `preview` desde
el 2026-10-26**, por lo mismo. El push que trajo su rediseño a `preview` (23 commits) acababa en
uno de solo `docs/` (`4bde458`), y 14 archivos suyos —la entrada con vídeo, su barra, sus estilos
y el cartel de cookies de `packages/ui`— estaban en la rama y no en la web. El primer push con la versión nueva la construyó
(su último despliegue bueno era `1d10181`, 41 commits atrás).

Cuatro detalles que no son evidentes y que conviene no «simplificar»:

- **El `cd` a la raíz del repo.** El comando corre desde el Root Directory de cada proyecto y las
  rutas de `git diff` se resuelven contra el directorio actual. Sin ese `cd`, la comparación se
  haría sobre rutas que no existen y no detectaría nada — es decir, saltaría siempre.
- **No volver a `HEAD^`.** Es lo que trae el ejemplo de la documentación de Vercel, y es justo lo
  que falló: con varios commits por push se pierden todos menos el último.
- **Las tres salidas de seguridad devuelven 1 (construir):** sin argumento; sin despliegue
  anterior en la rama, que es el primero de una rama nueva; y cuando el commit del último
  despliegue no ha venido en el clon, que es superficial y puede no traerlo si quedó muchos
  commits atrás. En la duda, se construye.
- **Requiere «Include source files outside of the Root Directory»** activo en los dos proyectos.
  Ya lo está, o los `workspace:*` no resolverían y no construiría ninguna.

La versión con el último despliegue, probada el 2026-10-29 contra commits reales, poniendo a
mano la variable que da Vercel (con `HEAD` en `7ba3fd5`):

| último despliegue bueno | qué cambió desde entonces | resultado |
|---|---|---|
| `a31da59` | el push de los diez commits (Ochoa y `docs/`) | construye Ochoa, salta Cokima |
| `82fcff5` | solo `docs/` | saltan las dos |
| ninguno | rama nueva | construye |
| uno que no vino en el clon | — | construye |

Con la versión de `HEAD^`, el primer caso se saltaba: es el fallo, reproducido.

La primera versión, la de `HEAD^`, se probó el 2026-08-16 contra cuatro commits reales del
historial antes de subirla:

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
   valor. De `SITE_URL` salen canonical, `hreflang`, sitemap y el JSON-LD `Restaurant` (y el
   `WebSite`, en la app que da `siteName`; hoy, Cokima).
2. Si se abandonan las URLs actuales de `grupotombo.com`, configurar **redirects 301** desde
   `/cokima-kitchenmadness/` y `/tasquita-los-ochoa/` hacia los dominios nuevos. Sin esto se
   tira el posicionamiento acumulado.
3. Dar de alta **cada dominio por separado** en Google Search Console y enlazar cada web con
   su ficha de Google Business.

### `cokima.es`: lo que hay y qué se cambia (mirado el 2026-11-18)

**El dominio no es nuevo, y eso es lo que daba reparo.** Los DNS están en DonDominio
(`ns1/ns2.dondominio.com`, los mismos que usa `phsport.es` con Vercel en este equipo) y la zona
tiene 21 registros. Solo dos son de la web; el resto se deja tal cual:

| Registros | Qué son | Qué se hace |
|---|---|---|
| `cokima.es` ANAME → `hostingsrv97.dondominio.com` | La web, el dominio pelado | **Se borra y se crea un `A`** `@` → `216.198.79.1` (lo que pidió Vercel el 2026-11-23) |
| `www` CNAME → `hostingsrv97.dondominio.com` | La web con `www` | **Se cambia el destino** a `af2c85dc95c30ec9.vercel-dns-017.com` (ídem) |
| MX, TXT `v=spf1`, TXT `dddk._domainkey` (DKIM), `mail`, `imap`, `pop`, `pop3`, `smtp`, `webmail`, `autoconfig`, `autodiscover`, SRV `_autodiscover._tcp` | El correo @cokima.es, **montado y activo** | Nada |
| `ftp`, `bbdd`, `*.cokima.es` | Restos del hosting de DonDominio | Nada: no estorban |
| Los cuatro `_<hash>` CNAME → `comodoca.com` / `sectigo.com` | Validaciones de certificados viejos del hosting | Nada: no estorban |

**Para deshacer: los valores antes del cambio** (copiados del panel de DonDominio el 2026-11-18):

| Nombre | Tipo | Valor anterior |
|---|---|---|
| `cokima.es` | ANAME | `hostingsrv97.dondominio.com` (resolvía a `31.214.178.95`) |
| `www.cokima.es` | CNAME | `hostingsrv97.dondominio.com.` |

Volver a poner esas dos entradas deja la zona como estaba. El resto de la zona no se toca:

- MX `10 mx01.dondominio.com.`
- TXT `v=spf1 include:spf.dondominio.com`
- TXT `dddk._domainkey` (DKIM)
- `*.cokima.es` → `hostingsrv97.dondominio.com.`
- `autoconfig` → `autoconfig.panel247.com.`
- `autodiscover` → `autodiscover.panel247.com.`
- SRV `_autodiscover._tcp` → `0 443 autodiscover.panel247.com`
- `bbdd` → `bbddsrv17.dondominio.com.`
- `ftp` → `ftp-server-00.dondominio.net.`
- `imap`, `mail`, `pop`, `pop3` y `smtp` → `mailsrv8.dondominio.com.`
- `webmail` → `webmail-08.dondominio.net.`
- Las cuatro validaciones `_<hash>` de comodoca y sectigo.

La clave DKIM y los hashes no se copian aquí, porque transcribirlos de una captura es fácil de
estropear y no hace falta: siguen en DonDominio.

- **Los valores de Vercel se copian de Vercel**, no de memoria: ya no son siempre `76.76.21.21`
  y `cname.vercel-dns.com`, y en efecto dio unos propios del proyecto (los de la tabla). Por eso
  se dio de alta primero en Vercel, que no cambia nada de cara al público, y DonDominio va después.
- **La principal es `www.cokima.es`**, y `cokima.es` le redirige con un 308. Se propuso al revés,
  pero el 2026-11-23 se dejó la opción por defecto de Vercel («Redirect apex domains to www»): es la
  que recomienda, y la web vieja ya era `www`, que es lo que Google conoce. **Por eso `SITE_URL` en
  producción es `https://www.cokima.es`**: de ella salen canónica y sitemap, y deben coincidir con
  la principal.
- **Se guarda una copia de la zona antes de tocarla.** Es el deshacer.
- **No hay registro CAA** (el que limita quién puede emitir certificados): Vercel podrá sacar el suyo.
- **Lo que sirve hoy el dominio es un WordPress vacío**: menú con anclas (`#about`, `#carta`,
  `#restaurante`, `#reservas`) en una sola página, portada con «404 Page not found» y un sitemap con
  la portada y la `sample-page`. No hay direcciones antiguas que redirigir.
- **No dar de baja el hosting de DonDominio sin mirar qué incluye el plan:** el correo sale de sus
  servidores (`mailsrv8`) y puede ir en el mismo plan.
- **Producción publica Cokima desde el 2026-11-23**: `preview` se fusionó en `main` (`7d004a0`) con
  `SITE_URL=https://www.cokima.es` en producción, y el despliegue quedó `READY` con los alias
  `www.cokima.es` y `cokima.es`. Lo que falta son los dos registros de DonDominio de arriba.

### `tasquitalosochoa.es` y `.com`: lo que hay y qué se cambia (2026-11-23)

**Los dos dominios estaban aparcados.** Los DNS están en DonDominio, y lo que servían era la página
«Registrado en DonDominio». **No hay correo que funcione:** quedan las entradas de un correo de
DonDominio (`mail`, `imap`…), pero ningún MX, así que no llega nada. La principal es
`www.tasquitalosochoa.es`, como en Cokima, y las otras tres direcciones le redirigen con un 308.
Se dieron de alta por la API de Vercel ese mismo día, sin efecto de cara al público.

Los cambios son los mismos en **cada uno** de los dos dominios, con las zonas copiadas del panel
de DonDominio el 2026-11-23:

| Nombre | Antes (para deshacer) | Después (lo que pidió Vercel) |
|---|---|---|
| `@` | ANAME `parkingsrv0.dondominio.com` (resolvía a `31.214.178.55`) | **Se borra y se crea un A** `216.198.79.1` |
| `www` | CNAME `parkingsrv0.dondominio.com.` | CNAME `b138c459c3eddf88.vercel-dns-017.com` |

El resto de las dos zonas se queda como está. Es igual en las dos, salvo el servidor de la base de
datos:

- TXT `v=spf1 include:spf.dondominio.com`
- `*` → `parkingsrv0.dondominio.com.`
- `bbdd` → `bbddsrv33.dondominio.com.` en el `.es`, y `bbddsrv31.dondominio.com.` en el `.com`
- `ftp` → `ftp-server-00.dondominio.net.`
- `imap`, `mail`, `pop`, `pop3` y `smtp` → `mailsrv3.dondominio.com.`
- `webmail` → `webmail-03.dondominio.net.`

Si DonDominio tiene activado el servicio de *parking* en el dominio, hay que desactivarlo, porque
puede imponerse a los registros.

**Producción de Ochoa todavía no publica:** le falta `SITE_URL=https://www.tasquitalosochoa.es`, y
después de ponerla hay que volver a desplegar `main`. Sale con lo que ya se sabía pendiente: el aviso
legal con huecos y el plan Hobby (`estado.md` §5).

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
| `main` | **producción** | *production* en Vercel. Recibe `preview` solo cuando Mario lo pide. Cokima publica desde el 2026-11-23; Ochoa falla a propósito mientras no tenga `SITE_URL`. |
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
