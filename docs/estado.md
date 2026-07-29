# Estado del proyecto

- **Corte:** 2026-07-28
- **Rama de trabajo:** `preview` (desarrollo) · `main` (producción, sin nada nuevo aún)
- **Este documento es el punto de entrada.** Lo demás cuelga de aquí.

---

## 1. Modelo de ramas

| Rama | Papel | Alias de Vercel |
|---|---|---|
| `main` | Producción | falla a propósito sin `SITE_URL` |
| `preview` | **Desarrollo — todo se integra aquí** | alias fijo por rama (ver §6) |

Ramas de tema opcionales y efímeras: nacen de `preview` y vuelven a `preview`.
Detalle en `deploy.md` §Modelo de ramas.

**Ramas muertas por borrar:** `layout-movil` y `feat/divergencia-layout` (esta última es el
mismo commit que `preview`; su contenido ya está integrado).

---

## 2. Qué está construido

**Fase 1 — las dos webs.** Astro 6 estático + adaptador Vercel, pnpm workspaces.
Cada app: 6 páginas ES + 3 EN, endpoint CAPI, robots + sitemap, JSON-LD `Restaurant`,
hreflang, banner de consentimiento. Cartas reales transcritas ES+EN.

**Fase 2 — divergencia de layout.** Las 12 tareas del plan, ejecutadas en `preview`:
carta "baraja" de Cokima con tabs y snap horizontal, carta "pizarra" de Ochoa con toggle
½/entera y buscador, barra inferior de Ochoa y barra de reserva de Cokima con estado de
apertura real en hora de Madrid, View Transitions, y `MenuSection`/`DishRow` retirados de
`packages/ui`. Registro detallado en `estado-divergencia-layout.md`.

**Añadido el 2026-07-28:** favicons provisionales en las dos apps, cartel de cookies
compacto en móvil apoyado en `--t-bottom-bar-h`, y el arreglo de que ese cartel no se
cerraba nunca (`display: flex` ganaba a `hidden`).

**Verificado el 2026-07-28 en `preview`:** `pnpm test` → 37 tests en verde (26 content,
6 tracking, 5 config). `pnpm build` → `Complete!` en las dos apps. Medido a 390px: en
Cokima la foto del hero entra en la primera pantalla (541px) y la home pasa de 3565px a
2716px; en Ochoa la cabecera mide 67px sin romper y la barra inferior muestra el estado
de apertura real; el cartel de cookies no se solapa con la barra fija (0px).

---

## 3. Pendiente de construir

**Lo único grande:**

- [ ] **La home de Ochoa no muestra ni un plato.** Hay 6 platos con `featured: true` en
      `apps/ochoa/src/data/menu-es.json` sin usar. Es el hueco que queda del objetivo
      "que se vea qué puedes comer antes de terminar la primera pantalla". El plan de la
      fase 2 no lo cubría: para Ochoa solo verticalizaba y densificaba.

**Menores:**

- [ ] Imágenes sin optimizar: `<img>` crudo en vez del `<Image>` de Astro. Cokima
      `hero.jpg` 245 KB (1200×1200 servida a ~358px), Ochoa `hero.jpg` 151 KB +
      `tasca.jpg` 112 KB. Es el LCP de las dos homes.
- [ ] El mapa sigue mostrando el cartel *"Mapa · pendiente de integrar"* en las dos webs.
      Hasta que haya embed, un botón "Cómo llegar" a Google Maps cierra el hueco sin
      parecer obra inacabada.
- [ ] Cabecera de Cokima: 110px permanentes en móvil (13% de pantalla; el sector ronda
      el 8-10%). El offset ya cuelga de `--t-header-h`, así que ajustarlo es barato.
- [ ] `/carta` de Ochoa: cabecera 67 + interruptor 71 + barra inferior 85 = 223px de 812
      (27%) ocupados de forma permanente.
- [ ] **Sin verificar:** si en la home de Cokima persiste el triple encabezado
      *"Lo que no te puedes perder / Los imprescindibles / Selección"*. El tercero sale
      del `title` que se pasa al componente de la carta.

---

## 4. Decisiones abiertas (de Mario)

- [ ] **Filtro de alérgenos de Cokima.** Construido y apagado
      (`ALLERGEN_DATA_CONFIRMED = false` en `apps/cokima/src/site.ts`). No se enciende
      hasta que el restaurante firme los datos: un filtro "sin gluten" en el que una
      persona celíaca confía con datos orientativos es un problema de salud, no de UX.
- [ ] **Verde oliva `#4c6b2f`** del estado de apertura en Ochoa. Lo eligió un subagente por
      su cuenta. Contraste 5.0:1 correcto, pero introduce una cuarta familia de color fuera
      de papel / tinta / rojo y nadie de marca lo ha validado.
- [ ] **Texto del cartel de cookies.** Es lo que más altura le da. No se ha tocado porque
      es contenido de consentimiento y acortarlo tiene matiz legal.
- [ ] **Borrar las dos ramas muertas** (§1).
- [ ] **Cuándo llevar `preview` a `main`** (`git switch main && git merge preview`).

---

## 5. Infraestructura pendiente

- [ ] Variables de entorno y dominios por proyecto en Vercel. `SITE_URL` bloquea los
      despliegues de producción a propósito mientras no haya dominio.
- [ ] *Ignored Build Step* en ambos proyectos: hoy cada push reconstruye las dos webs.
      Comando en `deploy.md`.
- [ ] Redirects 301 desde `grupotombo.com/cokima-kitchenmadness/` y
      `/tasquita-los-ochoa/` hacia los dominios nuevos.
- [ ] Alta de cada dominio en Google Search Console y enlace con su ficha de Google Business.

---

## 6. Cómo levantarlo y dónde mirarlo

```bash
pnpm install
pnpm --filter cokima dev    # http://localhost:4321
pnpm --filter ochoa dev     # segundo puerto libre
pnpm test                   # 37 tests
SITE_URL=https://example.com pnpm build
```

**Casi todo el trabajo de la fase 2 es mobile-first y está oculto en escritorio a
propósito.** En una ventana ancha la impresión es que cambió poco: hay que estrechar a
~375-390px o usar el modo dispositivo.

**Previews (alias fijos, no cambian con cada push):**
- Cokima → `https://cokima-git-preview-rodzs-projects-1c289ef0.vercel.app`
- Ochoa → `https://ochoa-git-preview-rodzs-projects-1c289ef0.vercel.app`

**Aviso de dev:** si en local ves algo que no cuadra con el código (una regla CSS que ya
no existe, un elemento oculto sin motivo), suele ser caché obsoleta de Vite. Se arregla
con `rm -rf node_modules/.vite apps/*/node_modules/.vite` y rearrancando. Pasó el
2026-07-28 y estuvo a punto de dar por bueno un fallo inexistente.

---

## 7. Bloqueado por el cliente

Sin cambios respecto a la spec §12, más una entrada nueva:

- **Nueva:** confirmación oficial de los datos de alérgenos de Cokima (requisito para
  activar el filtro).
- Accesos: **CoverManager backoffice** (el más urgente), Meta Business (píxel por marca +
  token CAPI), GTM/GA4.
- Dominios propios por marca.
- Logos en vectorial (los favicons actuales son provisionales y geométricos, no logotipos).
- Fotografía real actualizada.
- Datos fiscales para las páginas legales.

---

## Documentos

| Documento | Qué es |
|---|---|
| `deploy.md` | Vercel: dos proyectos, modelo de ramas, env vars, dominios |
| `estado-divergencia-layout.md` | Registro de la fase 2, tarea por tarea |
| `superpowers/specs/2026-07-18-webs-grupo-tombo-design.md` | Diseño general |
| `superpowers/specs/2026-07-27-divergencia-layout-design.md` | Diseño de la fase 2 |
| `superpowers/plans/2026-07-27-divergencia-layout.md` | Plan de la fase 2 (ejecutado) |
