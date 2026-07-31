# Estado del proyecto

- **Corte:** 2026-07-31
- **Rama de trabajo:** `preview` (desarrollo) · `main` (producción, sin nada nuevo aún)
- **Este documento es el punto de entrada.** Lo demás cuelga de aquí.

---

## 0. Por dónde seguir

El árbol está limpio y `preview` subido. La tanda del 2026-07-31 (§3.quater) está commiteada,
construida y con los 45 tests en verde.

**Lo que espera respuesta de Mario, y sin lo cual no se puede avanzar:**

1. **La clave de Google Maps.** `Mapa.astro` está montado y dibuja el callejero con la paleta
   de la casa en cuanto exista `PUBLIC_GOOGLE_MAPS_KEY`; mientras tanto enseña el hueco
   marcado. El «cómo llegar» ya funciona porque no depende de ninguna API.
2. **Validar la carta en inglés con el restaurante.** Traducida entera el 31, pero es un
   documento comercial y la tradujo el agente con criterio propio, no con su visto bueno.
3. **Si «fríos» y «calientes» deben volver a separarse** dentro de «Pinchos y tapas». Alberto
   pidió tres secciones y eso funde los dos rótulos; el orden los conserva pero el rótulo no.
4. **Unificar «Idiazabal» / «Idiazábal»**, que el PDF del restaurante escribe de las dos formas
   según el plato. Está respetado tal cual viene.

**Lo que queda de trabajo, por orden de lo que más mueve la aguja:**

1. **Desmenuzar Cokima.** Es lo más rentable y lo que Mario lleva señalando desde el principio.
   Ochoa se ha llevado la tipografía, la carta, las fotos reales, tres iteraciones de portada y
   toda la tanda del 31; Cokima solo el menú y el movimiento, de rebote. No tiene ni una foto
   real, su carta no se ha revisado desde la fase 2 y su portada sigue siendo la genérica.
2. **La home en inglés de Ochoa está atrasada.** No tiene ni la sección «la casa» ni la cinta
   rotulada, y mantiene su propio `.mapbox` en vez de `Mapa.astro`. Igualarla con la española.
3. **Páginas nuevas (punto 6 de la fase 4).** Bloqueado por contenido: hay que decidir con Mario
   qué páginas y con qué material. No es trabajo de código hasta que eso esté.
4. **Las cuatro fotos de Ochoa sin usar.** Ver `fotografia.md`: dos son asignables ya, una
   necesita que Mario confirme qué plato es y otra no identifica ningún plato.

**Cómo levantarlo:** los `pnpm dev` lanzados en segundo plano desde el agente se mueren solos en
esta máquina. Lanzarlos desde una terminal propia.

**El repo está vinculado a Vercel y cada push a `preview` despliega.** Los alias fijos están en
§6. No buscar `.vercel/project.json` para comprobarlo: está en `.gitignore` y la vinculación por
Git vive en el panel de Vercel, no en el repo. El 31 se dedujo mal justo por ahí.

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

- [ ] **La clave de Google Maps** (`PUBLIC_GOOGLE_MAPS_KEY`). `Mapa.astro` ya está montado en la
      home ES de Ochoa: con clave dibuja el callejero real coloreado con la paleta de la casa —una
      imagen estática, cero JavaScript y cero cookies de terceros, que hoy esta web no tiene
      ninguna— y sin ella enseña el hueco marcado. El «cómo llegar» funciona en los dos casos
      porque no depende de ninguna API. **Cokima y la home EN de Ochoa siguen con el `.mapbox`
      viejo** y su cartel *«Mapa · pendiente de integrar»*.
- [ ] **Validar la carta en inglés con el restaurante.** Traducida entera el 2026-07-31,
      manteniendo sin traducir lo que no tiene equivalente (gilda, pintxo, txistorra, cachopín,
      torreznos, soldaditos de Pavía, revolconas). Es un documento comercial y lo tradujo el
      agente con criterio propio.
- [ ] **Comprobar en un iPhone real** que el hundido de los botones se ve. La lógica ya no
      depende de `:active` (ver §3.quater), pero Playwright usa Chromium: la verificación en
      Safari de iOS no se ha podido hacer desde aquí.
- [ ] El fragmento rojo del titular de Cokima da **4,26:1** sobre la foto. Cumple el 3:1
      que WCAG exige para texto grande (36,8px en negrita), pero no el 4,5:1 general: el
      vermellón `#ed1c24` no puede alcanzarlo ni sobre negro puro, donde su techo teórico
      es 4,2:1. Cambiarlo es decisión de marca (ver §4).
- [ ] Las fichas de destacados sin foto se resuelven tipográficamente. Funciona, pero la
      tira gana mucho en cuanto haya imágenes.
- [ ] `formatPortionPrice` (en `packages/content/src/portions.ts`) se quedó sin usuarios al
      pasar la carta a dos columnas: ya nadie elige una porción, se pintan las dos. Desde que la
      carta del 2026-07-31 va a precio único, **tampoco queda ni un plato con media ración** en
      Ochoa. Sigue exportada y con sus cinco tests, y el esquema conserva el soporte por si
      vuelven. Retirarla —o no— cuando se limpie el paquete.
- [ ] Astro avisa al construir de que no puede generar el JSON schema de las colecciones
      `menu-es`/`menu-en` (`Cannot read properties of undefined (reading 'def')`). Es
      incompatibilidad de versiones entre zod y el generador de tipos de editor; **la validación
      del contenido sí funciona** y el build termina en `Complete!`. Solo afecta al autocompletado.

---

## 3.ter Las fotos de Ochoa, rehechas el 2026-07-30

**Hay nueve fotos del local en la web vieja del grupo** (`/wp-content/uploads/2021/09/LosOchoa-1..9.jpg`,
1000×1000) que nadie había mirado. De ahí sale todo lo de abajo.

**La portada es la fachada** (`hero.jpg`): el toldo rojo, el cartel colgante, la barra vista
desde la calle y «LA TASCA QUE TE MERECES» en el cristal. Dice qué sitio es antes de leer una
palabra. Es una sola pieza a sangre en todos los anchos, con el titular apoyado en la foto y su
sombra roja, que es lo que mejor funcionaba de la portada original.

Dos intentos anteriores, y por qué se descartaron: el **cenital de la mesa** no decía nada
recortado a vertical —se quedaba en un fragmento de plato sin contexto— y se mudó a la sección
«la tasca», que es apaisada y le sienta; el **rótulo del cristal** era demasiado plano de cerca
y, siendo cuadrado, en móvil solo cabía el 60% del ancho («OS OCHO»), lo que obligó a partir la
portada en dos con una banda roja bajo la foto. Esa partición se retiró: la banda competía con
la imagen y forzaba a cambiar el color de la sombra del titular. El rótulo del cristal no se
pierde, es la segunda foto de «la casa».

**«Lo que hay detrás del cristal» ya no son rejillas:** las cuatro son fotos reales —la barra
con el espejo rotulado a mano, el rótulo del cristal, el vermú con su banderilla y el interior
con el banco corrido rojo—, así que la sección se publica. Van en **dos columnas desfasadas**,
con la derecha bajando un escalón: ni el mosaico de piezas desiguales del primer intento ni la
cuadrícula perfecta del segundo, que quedaba rígida.

**Un fallo de la fase 3 que salió al mirar:** el estado de apertura de la portada iba en tinta
atenuada sobre una foto oscurecida por el degradado, o sea gris oscuro sobre fondo oscuro. Se
resuelve reescribiendo dentro de `.copy` los tokens `--t-text*` que consume, no parcheando el
componente.

## 3.quater La tanda del 2026-07-31: Sibuya como referencia y los retoques de Mario

Salió de analizar **sibuyaurbansushibar.com** en móvil, que es una web que le gusta a Mario, y
de quedarse con lo que se puede contar en el idioma de esta casa. El análisis completo —lo que
compartimos, en qué nos diferenciamos y qué no copiarles— se midió con Playwright a 390px: su
home pesa **20,5 MB** (el mismo vídeo descargado tres veces) contra los 767 KB del build de
Ochoa, y su `/carta` tarda 8,9 s en el primer byte. La ambición visual sí; el peso no.

**Lo que entró de ahí:**

- **El cartel de la portada volvió a escalar.** `clamp(2.6rem, 10vw, 6rem)` se quedaba clavado
  en su mínimo en todo móvil por debajo de 416px de ancho —a 390px, 10vw daba 39px y ganaba el
  suelo—. Con `11.5vw` vuelve a crecer con la pantalla desde los 362px.
- **La cinta rotulada** (`Ticker.astro`), banda roja a sangre entre la tira de platos y el
  manifiesto, con contenido que ya vive en la página. Va ahí y no bajo la portada porque ese
  hueco está medido para que asome la primera ficha de plato.
- **El medio dentro del titular**, el mejor recurso de su home, aplicado a «la casa» y no a la
  portada: el rótulo del cristal sale del muro y se lee entre «lo que hay» y «detrás del
  cristal». En la portada habría significado partirla en dos, que ya se probó y se retiró
  (§3.ter). El muro se queda con tres piezas y cierra en plano.
- **Aire solo donde hay fotografía** (`la tasca` y `la casa`, de 28/32px a 52px en móvil). La
  densidad del resto se mantiene: la hoja de bar es densa a propósito.

**Los retoques que pidió Mario después, viéndolo en el iPhone:**

- **Fuera las tres rayas del menú.** El botón dice la palabra —`MENÚ` / `CERRAR`— en la versal
  apretada de Archivo, con un subrayado que se recoge al abrir. El texto ya estaba en el markup
  para lectores de pantalla; ahora se ve. De paso deja de estar descentrado: tenía 31px a la
  derecha del glifo contra 22 arriba, y ahora son 20 y 21.
- **El menú cae como una persiana** de arriba abajo con `clip-path`, y se recoge al cerrar. El
  fundido anterior no decía de dónde venía. Con `clip-path` y no con un desplazamiento: así los
  nombres de sección no viajan y el escalonado de los enlaces se lee como lo que aparece detrás
  del telón.
- **Curvatura proporcional al tamaño.** Ya no hay un radio suelto por componente sino cuatro
  escalones (`--r-chapa` 4px, `--r-btn` 7px, `--r-caja` 9px, `--r-marco` 12px). Mario lo detectó
  comparando «Reservar» con «Llamar»: **tenían los dos 3px**, pero el segundo mide 55px de alto
  y se veía más picudo. La esquina se percibe en proporción a lo que enmarca. La proporción
  radio/alto ronda 0,16 en las piezas táctiles.
- **La tira de platos arrancaba pegada al borde** pese a su relleno de 20px: el `scroll-snap`
  alinea contra el borde del área de scroll, que ignora el `padding`, y el navegador desplazaba
  esos mismos píxeles. Se arregla con `scroll-padding-inline`. Y su sombra roja se cortaba por
  abajo porque `overflow-x: auto` obliga al eje vertical a recortar también — por eso la esquina
  inferior derecha parecía sin redondear: no lo estaba, estaba cortada.
- **Indicador de turno en la tira**: seis marcas, la del turno en curso es una barra que se
  rellena. Avanza solo cada 3,5 s y **se apaga para siempre al primer toque** — en una tira con
  precios, moverse debajo de quien está leyendo es quitarle el sitio, así que el gesto de
  deslizar es la pausa y no hay botón que la reponga.
- **Barrido entre páginas.** `<ClientRouter />` ya estaba puesto pero hacía el fundido por
  defecto. Ahora la hoja nueva entra por el borde y **es bidireccional**: con el botón de atrás
  barre al revés. La marca de dirección hay que escribirla también en el documento entrante,
  porque el intercambio copia los atributos del `<html>` nuevo encima y la borraba.
- **«Dónde estamos» se reordena:** el mapa abre la sección en vez de cerrarla, y teléfono e
  Instagram pasan a ser dos fichas con icono **y** texto (el icono solo obliga a adivinar, y el
  número escrito es lo que alguien copia). El mismo componente va en el pie del menú.

**El hundido de los botones, que costó tres intentos.** El primero solo tenía `:hover`, que en
móvil no existe. El segundo añadió `:active` con un retardo antes de la vuelta, y **seguía sin
verse en el iPhone**. Midiendo salieron las dos causas de verdad: entre soltar un enlace y tener
la página nueva pasan **232 ms**, y los ocho botones de esta web son enlaces, así que una subida
que arrancaba a los 220 ms se la llevaba la navegación por delante; y **en Safari de iOS
`:active` no se aplica de forma fiable** sin un listener táctil en la página. La solución no
depende de ninguna de las dos: `pointerdown` hunde y `pointerup` dispara la subida en el mismo
instante en que se levanta el dedo (`--dur-sube`, 240 ms). `pointercancel` también la suelta, o
arrastrar el dedo fuera del botón para no pulsarlo lo dejaría hundido para siempre.

**Lección de método, que es la que importa:** las dos primeras versiones se dieron por buenas
comprobando que la regla CSS existía en el CSSOM. Comprobar que una regla está escrita no es
comprobar que el efecto ocurre. Lo que lo resolvió fue simular el toque con
`page.mouse.down()`/`up()` y muestrear la posición real a lo largo del tiempo.

**La carta, rehecha con el material del restaurante.** Alberto pasó dos PDF por WhatsApp y pidió
tres secciones: pinchos y tapas, con pan, y raciones. **De 25 platos a 49.** Los postres van en
una cuarta porque están en la carta de sala y no caben en ninguna de las tres; las bebidas no se
publican, como pidió. Tres decisiones que quedaron tomadas:

- **Ya no hay medias raciones.** La carta nueva trae precio único, así que la tabla se queda en
  una columna. El soporte sigue en el esquema por si vuelven.
- **Montados, bocatines y bikinis llevan su tipo en el nombre.** En el PDF eso lo dice el rótulo
  de cada bloque, pero al fundirlos bajo «con pan» aparecían dos «De jamón con tomate rallado»
  con precios distintos —4,50 y 8,00—, que es una carta que miente.
- **El PDF de sala es imagen pura, sin capa de texto.** No se puede extraer con pdfjs; hubo que
  renderizarlo a 4× y leerlo a ojo. Si vuelve a hacer falta, el visor está en el scratchpad de
  la sesión, no en el repo.

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
   viajaba con el dedo por toda la carta. **Fuera también el buscador**, que Mario retiró el
   mismo día — nadie va a buscar en una carta de veinticinco platos que se lee de un vistazo.
   Con él se fueron `matchDish` y `normalize` (`packages/content/src/search.ts`) y sus nueve
   tests, y la carta se quedó **sin una línea de JavaScript**. La
   nomenclatura la confirmó Mario con el restaurante: **«Ración» y «½ Ración», no «Tapa»**.
   Es una `<table>` de verdad, con `scope="col"`/`scope="row"`, porque un precio sin su
   cabecera no dice si es media o entera — y así un lector de pantalla lo anuncia solo.
   Once de los veinticinco platos no tienen media: llevan el mismo guion que la carta
   impresa, con el aviso en texto para quien no lo ve. Los postres, que van a precio único,
   enseñan una sola columna en vez de una vacía. Fuera también la guía de puntos: existía
   para llevar el ojo hasta un precio suelto, y con dos columnas alineadas la columna ya es
   la guía. **En escritorio la carta se acota a 44rem** — a 1280px el nombre quedaba a
   700px de su precio; el margen que sobra a la derecha es donde entrarán las fotos.
4. ~~**Rejillas guía en los huecos de foto.**~~ **Hecho el 2026-07-30.** **Diecinueve
   huecos** entre las dos webs: once de plato (las fichas de destacados que salen sin
   imagen) y ocho de la casa, en una sección nueva que enseña lo que ninguna de las dos
   webs tiene hoy: la barra, la sala, el equipo. **Su texto ya es el definitivo** —«Lo que
   hay detrás del cristal» en Ochoa, «Donde se mezcla y se mancha» en Cokima—, no el de
   andamio que hubo primero: que faltan las fotos ya lo dice cada rejilla en su etiqueta, y
   escribirlo otra vez en el titular era contarlo dos veces. Van en **cuadrícula de dos por
   dos, las cuatro iguales**; el mosaico asimétrico del primer intento llamaba la atención
   sobre la composición en vez de sobre las fotos. Cada hueco dibuja su proporción, la
   regla de tercios y **el nombre
   exacto del archivo** que hay que dejar para que desaparezca, derivado del nombre del
   plato con `dishImageKey()`. El componente es `packages/ui/src/PhotoGuide.astro`, sin
   una gota de marca, y se mide con container queries porque cae igual en una ficha de
   250px que en una banda de 700px.

   **No pueden llegar a producción, y eso no depende de acordarse:** lo decide
   `showPhotoGuides()` (`packages/config/src/photo-guides.mjs`), que las apaga si hay
   `SITE_URL` o si Vercel dice que es producción —un despliegue público siempre tiene una
   de las dos— y tiene seis tests que lo fijan. Comprobado además sobre el HTML construido:
   con `SITE_URL`, cero huecos en las dos apps; sin él, los diez de la home de Ochoa.
5. ~~**Sistema de movimiento.**~~ **Hecho el 2026-07-30.** Cinco valores por marca
   (`--ease`, `--dur-in`, `--dur-out`, `--shift`, `--stagger`) y **ni un milisegundo suelto
   en los componentes**: los cuatro que quedaban a mano —los dos `.btn` y las dos portadas—
   ya salen de los tokens. La curva es la misma en las dos marcas porque es calidad, no
   identidad; el ritmo diverge a propósito, Cokima más lenta y más lejos, Ochoa seca.
   De paso, **las portadas dejaron de animar `padding-bottom`**: el titular se aparta del
   cartel de cookies con `translateY`, mismo resultado en pantalla sin recalcular la
   disposición en cada fotograma. Y el apagado por `prefers-reduced-motion` vive ahora en un
   único sitio, no repetido por componente. Todo escrito en **`movimiento.md`**: los cinco
   valores, las cinco reglas y la lista de lo que se mueve, que es corta a propósito.
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
pnpm test                   # 45 tests
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
| `movimiento.md` | Los cinco valores del movimiento, las reglas y qué se mueve |
| `fotografia.md` | Qué fotos faltan, con qué nombre y dónde dejarlas |
| `deploy.md` | Vercel: dos proyectos, modelo de ramas, env vars, dominios |
| `estado-divergencia-layout.md` | Registro de la fase 2, tarea por tarea |
| `superpowers/specs/2026-07-18-webs-grupo-tombo-design.md` | Diseño general |
| `superpowers/specs/2026-07-27-divergencia-layout-design.md` | Diseño de la fase 2 |
| `superpowers/plans/2026-07-27-divergencia-layout.md` | Plan de la fase 2 (ejecutado) |
| `superpowers/specs/2026-07-29-portadas-y-chrome-design.md` | Diseño de la fase 3 |
| `superpowers/plans/2026-07-29-portadas-y-chrome.md` | Plan de la fase 3 (ejecutado) |
