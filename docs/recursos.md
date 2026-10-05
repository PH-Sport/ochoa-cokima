# Recursos: identificadores, accesos y material

> **Estado: vivo** · revisado 2026-10-05

**Lo que cuesta recuperar y no se deduce del código.** URLs, slugs, IDs de proyecto y dónde vive
el material que entrega Mario. Todo lo de aquí está verificado; cada bloque dice cuándo y cómo.

> Escrito el 2026-09-07 volcando lo que solo vivía en la memoria local del agente en el HP. Ver
> `trabajar-con-mario.md` para el porqué.

**Aquí no hay secretos.** Los tokens (`META_CAPI_TOKEN`) y las claves viven en las variables de
entorno de Vercel, nunca en el repo. Si algo de esta lista se convierte en secreto, se saca de
aquí.

---

## 1. Vercel

Equipo **«Rodz»**, plan Hobby.

| Qué | Valor |
|---|---|
| `teamId` | `team_dzfwjJHBTpUaYzJCkDOSQICq` |
| slug del equipo | **`rodz-dev`** |
| Proyecto `cokima` | `prj_EdHpUZSUL08uIpraAMtuKDvrt5Iu` · Root Directory `apps/cokima` |
| Proyecto `ochoa` | `prj_T4mNHTefzsFNiZChLDgxQ8JxIlEy` · Root Directory `apps/ochoa` |

**El slug cambió** —era `rodzs-projects-1c289ef0`— y con él cambiaron **todos los alias**. Si un
enlace de preview de un documento viejo devuelve 404, es esto. Verificado el 2026-08-17.

**Cada rama tiene su alias fijo, no solo `preview`.** El patrón es:

```
https://<proyecto>-git-<rama-con-guiones>-rodz-dev.vercel.app
```

- `https://cokima-git-preview-rodz-dev.vercel.app`
- `https://ochoa-git-preview-rodz-dev.vercel.app`
- `https://cokima-git-tmp-entrada-cokima-rodz-dev.vercel.app`

**Consecuencia práctica: enseñarle algo a Mario no obliga a fusionar en `preview`.** Basta con
pushear la rama temporal y darle su alias. Es lo que evita meter trabajo a medias en la rama de
integración solo para que lo vea.

**Notas de operación:**

- Las previews construyen sin `SITE_URL` y salen con `x-robots-tag: noindex`.
- El **conector MCP de Vercel funciona** en sesiones de terminal (`list_teams` → `list_projects` →
  `list_deployments`). **El CLI `vercel` no está instalado.**
- No sondear las previews en bucle: ver `metodo.md` §3.

El reparto de proyectos, el `ignoreCommand` por app y la resolución de `SITE_URL` están en
`deploy.md`.

---

## 2. Reservas y medición

**CoverManager — slugs reales:**

- Cokima: `restaurante-cokima`
- Los Ochoa: `tasquita-los-ochoa`
- Iframe: `https://www.covermanager.com/reservation/module_restaurant/{slug}/{spanish|english}`

**Lo que acepta el iframe en la URL, medido contra el motor el 2026-10-05.** Sale del plugin
oficial de WordPress (`plugins.svn.wordpress.org/covermanager/trunk/covermanager.php`, de 2017,
escrito por el autor de CoverManager), que es la única documentación técnica que hay:

- **`?template=`** — CoverManager solo anuncia `trans-white` y `trans-black` (dos hojas suyas en
  `/css/modulo/`). **Con una URL absoluta, el motor la enlaza como hoja de estilo, la última del
  `<head>`**, por detrás de Bootstrap 3, jQuery UI 1.10 y sus estilos en línea. Acepta la URL
  codificada (`https%3A%2F%2F…`). Es la vía de la piel de Ochoa (`estado.md` §0). **No está
  documentado para URLs**: si lo retiran, el motor vuelve a su aspecto de serie y sigue reservando.
  Tiene que ser `https`: el motor no carga una hoja de `http://localhost`, así que en local la piel
  no se ve.
- **`?source=`** — el plugin reenvía el `source` de la URL de la página. Parece etiquetar el origen
  de la reserva dentro de CoverManager (en el panel se ven reservas marcadas «CH: Google»). **Sin
  probar.**
- **El alto del iframe lo ajusta iframeResizer v3.6.1**, en dos mitades: la de nuestra página está
  en `/js/iframeResizer/iframeResizer.min.js` y la de dentro la carga el motor. **La ruta vieja,
  `/js/iframeResizer.min.js`, da 404** y dejaba el iframe en 550px con scroll propio; se cambió en
  `BookingEmbed` el 2026-10-05, para las dos casas.
- **El pago no es del motor:** lo pinta Stripe en su propio iframe (`#payment-elements`), y
  ninguna hoja nuestra lo alcanza.
- **El motor trae el reCAPTCHA de Google montado y apagado** (`useRecaptcha = 0` en la página de
  Ochoa). Es el freno contra reservas falsas de bots; no se sabe si se enciende desde el panel o
  pidiéndolo a soporte. **Aparcado por Mario el 2026-10-05.** Bloquear que otras webs incrusten el
  iframe no protegería nada: un bot va directo a la página pública del motor.
- **El panel** (backoffice) lo tiene Mario desde el 2026-10-05; el inicio de sesión pide un código
  de verificación. Su menú de Configuración solo enseña «Planos de sala» y «Reservas» (turnos y
  aforo): **no se ha encontrado ninguna opción de aspecto del motor**, ni hace falta para la piel.

**Medición heredada de la web WordPress vieja:**

- GTM del grupo: `GTM-KW58ZDS` — **compartido por las dos marcas. Recomendado separarlos.**
- Píxel de Meta: `6251807501500238` — también compartido. **Recomendado uno por marca.**

Ambas recomendaciones están **bloqueadas por accesos del cliente**; ver `estado.md` §7.

---

## 3. Las webs actuales y las fuentes de contenido

**Webs a sustituir** (WordPress + Flatsome):

- https://www.grupotombo.com/cokima-kitchenmadness/
- https://www.grupotombo.com/tasquita-los-ochoa/

**Imágenes de las cartas oficiales** — son la fuente de la transcripción que hay en
`packages/content`. Si hay duda sobre un plato, se mira aquí, no se deduce:

- Cokima: `/wp-content/uploads/2026/03/Carta-cokima-esp.jpg` · EN: `Carta-cokima-eng.jpg`
- Los Ochoa: `/wp-content/uploads/2025/09/Los-Ochoa-Carta-SEPT2025-ESP.jpg` · EN: `...-ENG.jpg`

**Bocetos validados** (artifacts privados de Mario, de la fase de propuesta):

- Cokima: https://claude.ai/code/artifact/1310ef1a-9b31-4a91-829a-8740df5c1bb4
- Los Ochoa: https://claude.ai/code/artifact/b716368e-80d1-48b6-ae95-83f3cee20043

---

## 4. Datos de local — **pendientes de validar con el cliente**

No están confirmados por el restaurante. **No publicar sin confirmación**; ver `estado.md` §7.

- **Cokima** — C. de Andrés Mellado 21, 28015 Madrid (Chamberí) · 915 98 94 01 · @cokimamadrid ·
  L-D 9:00-00:00, cocina 13-16 y 19:30-23:30.
- **Los Ochoa** — P.º de la Castellana 117, 28046 Madrid · 912 87 68 20 · @tasquita.losochoa ·
  L-J 9-1, V 9-2:30, S 12-2:30, D 12-1.

---

## 5. El material que entrega Mario — **solo en el HP**

> ⚠️ **Todo este apartado es específico del HP (Windows).** En el Mac prestado no existe nada de
> esto: ni las rutas, ni las herramientas, ni el truco de los accesos directos. Si estás en el
> Mac, pídele a Mario el material o la ruta equivalente en vez de buscarlo.

- **`C:\PHSPORT\GRUPO TOMBO\` es la carpeta madre.** Dentro, `Cokima - Kitchen Madness\` con
  `Vídeos\` (los clips sueltos de Higgsfield y el montaje `Cokima Vídeo.mp4`) y las fotos.
- **Si dice «te lo he dejado en la carpeta X» y no aparece en Descargas**, resolver los accesos
  directos de `%APPDATA%\Microsoft\Windows\Recent\*.lnk` leyendo su `TargetPath` con `WScript.Shell`.
  Es lo que lo encontró el 2026-08-17; recorrer el árbol entero es mucho más lento.
- **ffmpeg y ffprobe instalados** el 2026-08-17 con `winget install Gyan.FFmpeg --scope user`. El
  PATH solo se actualiza en shells nuevos; la ruta directa es
  `%LOCALAPPDATA%\Microsoft\WinGet\Packages\Gyan.FFmpeg_*\ffmpeg-*_full_build\bin\`.

**Lo que sí es del repo y no de la máquina:** la receta de conversión del vídeo de la entrada vive
en `scripts/video-entrada.sh`, con el porqué de cada parámetro en `cokima-el-rediseno.md` §4.
Mario avisó de que ese vídeo es **provisional**, así que cambiarlo es ejecutar el comando y revisar
que el grado le siente bien al material nuevo.

> **Ojo:** el script y ese documento **solo existen hoy en la rama `tmp/entrada-cokima`**. Si esa
> rama se descarta se van con ella, y con ellas 377 líneas de *por qué se descartó cada cosa*. Es
> una decisión pendiente de Mario, anotada aquí para que no se pierda por olvido.

---

## 6. Lo que falta y bloquea

Los accesos del cliente son lo que bloquea sin ser código: Meta Business, GTM/GA4, dominios, datos
fiscales y logos vectoriales (el panel de CoverManager ya está, desde el 2026-10-05; §2). La lista viva, con su estado, está en `estado.md` §7 — **si discrepa de aquí, manda
`estado.md`**.

---

Ver también: `estado.md` (punto de entrada), `deploy.md` (Vercel en detalle), `fotografia.md`
(qué fotos faltan y con qué nombre) y `trabajar-con-mario.md`.
