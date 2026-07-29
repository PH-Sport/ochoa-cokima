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
- [ ] `formatPortionPrice` (en `packages/content/src/portions.ts`) se quedó sin usuarios al
      pasar la carta a dos columnas: ya nadie elige una porción, se pintan las dos. Sigue
      exportada y con sus cinco tests. Retirarla —o no— cuando se limpie el paquete.

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
2. ~~**Menú a pantalla completa.**~~ **Hecho el 2026-07-30, en las dos webs.** Botón sin
   borde y tres rayas que se pliegan en aspa sobre su propio centro. El panel cubre la
   pantalla por debajo de la barra —que se queda quieta, así que el botón que abre es el
   mismo que cierra y en el mismo sitio—, con "La carta" abriendo la cascada, numerada en
   Ochoa y con el punto de brasa en Cokima, y un pie con horario, teléfono, Instagram y
   dirección. El comportamiento vive una sola vez en `packages/ui/src/menu-overlay.ts`
   (estado, foco atrapado, Escape, bloqueo del fondo) y la piel entera en cada app, como
   manda la regla de oro. **Dos trampas que solo se vieron midiendo en el navegador:** una
   cabecera `sticky` se descuelga fuera de la pantalla en cuanto el fondo deja de tener
   scroll —pasa a `fixed` mientras el menú vive—, y ocultar el desbordamiento ensancha la
   página de golpe, que se resuelve reservando el hueco de la barra con
   `scrollbar-gutter: stable`.
3. ~~**Carta de Ochoa a dos columnas.**~~ **Hecho el 2026-07-30.** Los dos precios a la vez
   en columnas alineadas, y fuera el interruptor pegajoso: era una barra de 71px que
   viajaba con el dedo por toda la carta. El buscador se queda, arriba y quieto. La
   nomenclatura la confirmó Mario con el restaurante: **«Ración» y «½ Ración», no «Tapa»**.
   Es una `<table>` de verdad, con `scope="col"`/`scope="row"`, porque un precio sin su
   cabecera no dice si es media o entera — y así un lector de pantalla lo anuncia solo.
   Once de los veinticinco platos no tienen media: llevan el mismo guion que la carta
   impresa, con el aviso en texto para quien no lo ve. Los postres, que van a precio único,
   enseñan una sola columna en vez de una vacía. Fuera también la guía de puntos: existía
   para llevar el ojo hasta un precio suelto, y con dos columnas alineadas la columna ya es
   la guía. **En escritorio la carta se acota a 44rem** — a 1280px el nombre quedaba a
   700px de su precio; el margen que sobra a la derecha es donde entrarán las fotos.
4. **Rejillas guía en los huecos de foto.** Marcadores visibles, a propósito, para decidir
   dónde van las imágenes. Mario los pide como herramienta de trabajo y se compromete a
   que no lleguen a producción. Hacen falta del orden de 15-20 fotos, no dos.
5. **Sistema de movimiento.** Pocas animaciones, concretas, y ordenadas en el código con
   lógica detrás: una curva, dos duraciones, un desplazamiento. Sin bounce. **Los tokens ya
   existen** —`--ease`, `--dur-in`, `--dur-out`, `--shift`, `--stagger` en el `tokens.css`
   de cada app— porque el menú los necesitaba y era mejor estrenarlos con nombre que dejar
   milisegundos sueltos. La curva es la misma en las dos marcas (una *ease-out* quíntica,
   que frena como frena un objeto real); el ritmo diverge a propósito: Cokima se mueve más
   despacio y más lejos, Ochoa es seca. **Queda** llevar a estos tokens el movimiento que ya
   había suelto por los componentes y decidir qué más se mueve.
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
- [ ] **Cuándo llevar `preview` a `main`** (`git switch main && git merge preview`).

**Cerradas el 2026-07-29:** el verde oliva del estado de apertura (retirado con la piel
nueva de Ochoa), las dos ramas muertas —que ya no existen— y **el push de `preview`**, que
Mario autorizó: la fase 3 está subida y los alias de preview ya no van retrasados.

**Cerrada el 2026-07-30:** **«Ración» y «½ Ración»**. Mario lo confirmó con el restaurante:
sirven media ración, no tapa. Es la nomenclatura que va en la carta.

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
