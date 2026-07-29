# Estado del proyecto

- **Corte:** 2026-07-29
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

**Fase 3 — portadas, chrome y piel de Ochoa (2026-07-29).** Las dos homes abren con una
foto a sangre y titular anclado abajo a la izquierda, sin párrafo ni botones; debajo, una
tira de platos con nombre y precio que **asoma por el borde inferior** de la primera
pantalla. La reserva y la navegación se mudan a la cabecera (`[Reservar]` + hamburguesa
con foco atrapado), y desaparecen `BottomBar` y `ReserveBar`. Ochoa se viste con su marca
real: rojo bandera sobre blanco, sin serif ni grano ni verde oliva. Diseño en
`superpowers/specs/2026-07-29-portadas-y-chrome-design.md`, plan en
`superpowers/plans/2026-07-29-portadas-y-chrome.md`.

**Verificado el 2026-07-29 en `preview`,** midiendo a 390px en las cuatro homes:
`pnpm test` → 43 tests en verde (32 content, 6 tracking, 5 config) y `pnpm build` →
`Complete!` en las dos apps. La cabecera baja de 110px a 61px en Cokima y a 62px en
Ochoa; la portada ocupa el 77,5% de la pantalla y asoman las fichas con su precio;
cabecera e interruptor de la carta encajan con 0px de solape; el cartel de cookies se
apoya en el borde inferior sin competir con nada y sus dos botones miden 168,5px cada
uno; la carta de Ochoa sobre blanco da 17,4:1 de contraste y el titular de las portadas
15,7:1 (Cokima) y 16,0:1 (Ochoa).

---

## 3. Pendiente de construir

**Lo que bloquea de verdad:**

- [ ] **Fotografía real.** Ni una foto nueva ha entrado: la extracción desde Instagram
      está bloqueada por la firma de las URLs de su CDN. Las webs siguen con las fotos
      antiguas y **los once platos destacados salen sin imagen**. Todo lo demás está
      construido para recibirlas sin tocar layout. Detalle y claves de archivo exactas en
      `fotografia.md`.

**Menores:**

- [ ] El mapa sigue mostrando el cartel *"Mapa · pendiente de integrar"* en las dos webs.
      Hasta que haya embed, un botón "Cómo llegar" a Google Maps cierra el hueco sin
      parecer obra inacabada.
- [ ] El fragmento rojo del titular de Cokima da **4,26:1** sobre la foto. Cumple el 3:1
      que WCAG exige para texto grande (36,8px en negrita), pero no el 4,5:1 general: el
      vermellón `#ed1c24` no puede alcanzarlo ni sobre negro puro, donde su techo teórico
      es 4,2:1. Cambiarlo es decisión de marca (ver §4).
- [ ] Las fichas de destacados sin foto se resuelven tipográficamente. Funciona, pero la
      tira gana mucho en cuanto haya imágenes.

---

## 3.bis Fase 4 — acordada el 2026-07-29, en curso

Orden acordado. Los cinco primeros no dependen de nadie; el sexto necesita contenido real.

1. ~~**Tipografía propia para Ochoa.**~~ **Hecho el 2026-07-29.** El cuerpo ya no cae en la
   fuente del sistema: **Archivo** (Omnibus-Type), variable en peso (100-900) **y en ancho
   (62-125)**, autoalojada en un solo `.woff2` de 90 KB — menos que los tres estáticos de
   Bricolage en Cokima, que suman 124 KB para tres pesos. Anton se queda solo en los
   titulares de cartel. El eje de ancho es lo que hace de bisagra entre las dos: las
   etiquetas en versal van al 84%, en la proporción del rótulo, y la carta podrá apretar al
   92% cuando pase a dos columnas. Escala de siete pasos con nombres por papel
   (`--fs-micro` … `--fs-cartel`) en `apps/ochoa/src/styles/tokens.css`. Fuera el
   `tabular-nums` del precio. Verificado a 390px: ni un elemento del DOM conserva fuente de
   sistema, 43 tests verdes y las dos apps `Complete!`.
2. **Menú a pantalla completa.** Botón sin borde, tres rayas. Secciones en cascada
   vertical priorizando "La carta". Bloquear el scroll del fondo. Con transición suave.
3. **Carta de Ochoa a dos columnas.** Los dos precios a la vez, como carta de bar; fuera
   el interruptor pegajoso de 71px. Nomenclatura de bar («Tapa», «½»), con el reto de que
   quede limpio: el «½» no puede quedar desperdigado del «Ración». Y quitar
   `tabular-nums` del precio — es lo que hace que los números parezcan de otra fuente, no
   la familia, que ya es la misma.
4. **Rejillas guía en los huecos de foto.** Marcadores visibles, a propósito, para decidir
   dónde van las imágenes. Mario los pide como herramienta de trabajo y se compromete a
   que no lleguen a producción. Hacen falta del orden de 15-20 fotos, no dos.
5. **Sistema de movimiento.** Pocas animaciones, concretas, y ordenadas en el código con
   lógica detrás: una curva, dos duraciones, un desplazamiento. Sin bounce.
6. **Páginas nuevas.** No relleno: dar contexto a lo que ya hay y contar la historia real
   de cada casa, con copys trabajados. Las páginas concretas se deciden más adelante.

**Pendiente de foco:** casi todo el trabajo hasta ahora ha mirado a Ochoa. Cokima está sin
desmenuzar a fondo.

---

## 4. Decisiones abiertas (de Mario)

- [ ] **Filtro de alérgenos de Cokima.** Construido y apagado
      (`ALLERGEN_DATA_CONFIRMED = false` en `apps/cokima/src/site.ts`). No se enciende
      hasta que el restaurante firme los datos: un filtro "sin gluten" en el que una
      persona celíaca confía con datos orientativos es un problema de salud, no de UX.
- [ ] **Texto del cartel de cookies.** Es lo que más altura le da. No se ha tocado porque
      es contenido de consentimiento y acortarlo tiene matiz legal.
- [ ] **El rojo del titular de Cokima.** Con `#ed1c24` no hay forma de pasar de 4,26:1
      sobre la portada. Se queda así (cumple para texto grande) o el fragmento pasa al
      naranja `--ember`, que da 7,9:1 pero cambia el acento de marca en la primera
      pantalla.
- [ ] **«Tapa» o «½ ración».** No son lo mismo en hostelería y el precio va al lado: hay
      que preguntar al restaurante qué sirve de verdad antes de cambiar la palabra en la
      carta. La carta original dice «½ ración».
- [ ] **Cuándo llevar `preview` a `main`** (`git switch main && git merge preview`).

**Cerradas el 2026-07-29:** el verde oliva del estado de apertura (retirado con la piel
nueva de Ochoa), las dos ramas muertas —que ya no existen— y **el push de `preview`**, que
Mario autorizó: la fase 3 está subida y los alias de preview ya no van retrasados.

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
pnpm test                   # 43 tests
SITE_URL=https://example.com pnpm build
```

**Casi todo el trabajo es mobile-first y está pensado para pantalla estrecha.** En una
ventana ancha la impresión es que cambió menos de lo que cambió: hay que estrechar a
~375-390px o usar el modo dispositivo.

**Las imágenes solo se optimizan en Vercel, no en local.** Desde el 2026-07-29 las sirve
el servicio de imágenes del adaptador (`/_vercel/image?...`), que en `dev` y en `preview`
local devuelve el original. El peso real solo se puede medir en un despliegue.

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
| `../.impeccable.md` | Contexto de diseño: para quién es cada web y cómo debe sentirse |
| `fotografia.md` | Qué fotos faltan, con qué nombre y dónde dejarlas |
| `deploy.md` | Vercel: dos proyectos, modelo de ramas, env vars, dominios |
| `estado-divergencia-layout.md` | Registro de la fase 2, tarea por tarea |
| `superpowers/specs/2026-07-18-webs-grupo-tombo-design.md` | Diseño general |
| `superpowers/specs/2026-07-27-divergencia-layout-design.md` | Diseño de la fase 2 |
| `superpowers/plans/2026-07-27-divergencia-layout.md` | Plan de la fase 2 (ejecutado) |
| `superpowers/specs/2026-07-29-portadas-y-chrome-design.md` | Diseño de la fase 3 |
| `superpowers/plans/2026-07-29-portadas-y-chrome.md` | Plan de la fase 3 (ejecutado) |
