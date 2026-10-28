# Fotografía

> **Estado: vivo** · revisado 2026-10-28 · Ochoa tiene foto en sus seis destacados y portada de seis fotos (y, en la rama `feat/inicio-vivo`, siete más de la casa); Cokima, portada y casa

## Estado

**Desde el 2026-08-14, Cokima tiene mejor material que Ochoa.** Aparecieron **diecinueve fotos
suyas** en la misma web vieja del grupo, que nadie había mirado, y Mario aportó **seis más del
local** el 16. Veinticinco en total, cuando la web usaba una.

- `wp-content/uploads/2021/09/` → `cokima-1-1`, `cokima-2-1`, `cokima-3-1`, `cokima-4-1`,
  `cokima-5-1`, `cokima-6`, `cokima-7`, `cokima-8`. Todas `.jpg` a 1000×1000.
- `wp-content/uploads/2022/10/` → `1`, `2`, `3`, `1-copia`, `2-copia`, `3-copia`, `1-copia-2`,
  `2-copia-2`, `1-copia-3`, `1-PORTADA`, `2-PORTADA`. **A 4000×4000**, mejor que nada de Ochoa.
- Las seis de Mario, en su iCloud Drive (carpeta «Fotos Cokima»; **copiadas el 2026-10-26 a
  `fototeca/icloud/cokima/`**), **apaisadas** a ~3500×2500. Cinco en Display P3 y una (`Cokima 2`)
  en sRGB, medido ese día — **hay que convertir las P3 a sRGB al procesarlas** o el ocre de las sillas se va
  hacia el verde. Con `sharp` es `.withIccProfile('srgb')`.

**Lo que enseñan, y que no sabíamos:** el local tiene **dos murales**, no uno —el sol sobre
hormigón y un segundo con un personaje de ojos en aspa bajo la palabra *Madness*, rodeado de los
nombres de sus propios platos escritos a mano—; un **neón de pared entera** que dice «Orgasm, at
the first bite» sobre una rejilla con cientos de polaroids de clientes; y que **las sillas son
ocre mostaza, no naranjas** (en la foto antigua engañaba la luz).

**Lo que sigue faltando: saber qué plato es cada foto.** De las doce de plato solo dos son
seguras —la tarta de queso y las croquetas—. **Una foto solo se asigna a un plato cuando hay
certeza de que es ese plato**, así que las otras diez no pueden entrar en la carta. Se le preparó
a Mario una hoja de contactos numerada para que el restaurante las identifique; está pendiente.
Para fondos y ambiente sí se usan, porque ahí no afirman nada.

**Desde el 2026-10-26 la portada y «La casa» de Cokima llevan fotos recientes de su
Instagram** (§La fototeca), no de este material. **Las seis del local de Mario no se tuvieron en
cuenta en ese reparto**, porque se hizo desde `preview` antes de juntarla con la rama del rediseño,
que era la única que sabía de ellas. **Para la sala, `Cokima 5` —la sala entera, con el neón, el
mural de *Madness* y las sillas ocre— encaja mejor que la mesa puesta que se usó**; está marcada
como candidata en el catálogo y espera a Mario.

En `para-el-video/` (en su iCloud y en `fototeca/icloud/cokima/`) hay cinco elegidas para el vídeo de la entrada,
**todas sin manos a la vista**: los generadores de vídeo deforman dedos y en un plano cerrado de
comida eso canta.

---

**Ochoa ya tiene fotos reales del local.** El 2026-07-30 aparecieron **nueve fotos
en la web vieja del grupo** que nadie había mirado:
`grupotombo.com/wp-content/uploads/2021/09/LosOchoa-1..9.jpg`, a 1000×1000. Con ellas se
resolvieron la portada de Ochoa y las cuatro de «la casa». **Las croquetas (`LosOchoa-2`) se
pusieron el 2026-10-22** y el 2026-10-26 se cambiaron por una de Instagram de 2025, a 1440 px
(§La fototeca). Las otras tres de 2021 que esperaban a Mario —un huevo frito sobre una base, un
brioche con carne deshilachada, un bocadillo en las manos— ya no hacen falta para los destacados.

**Ojo al mezclar fichas con y sin foto en la tira de destacados.** En producción una ficha sin
foto se pinta solo con el nombre y el precio, pero se estira al alto de la que sí la tiene: con
una sola foto puesta, las demás miden lo mismo (293px a 390 de ancho, medido sobre el build de
producción) y quedan con el texto arriba y un hueco blanco debajo. **Desde el 2026-10-26 pasa solo
en Cokima**, que sigue sin ninguna: Ochoa tiene foto en las seis. En `dev` y en las
previews no se ve, porque ahí las rejillas guía ocupan ese hueco.

**Instagram ya se puede descargar, desde el 2026-10-26** (§La fototeca). Las 31 fotos de las 12
últimas publicaciones de cada cuenta están bajadas y revisadas: **cubren la portada y las cuatro
de la casa de Cokima**. Y con la sesión de Mario se bajaron después **172 fotos de Ochoa desde
2024**, que dan foto a **sus seis destacados**.

Lo que sí está hecho: las imágenes existentes pasan por `<Image>` de Astro desde
`src/assets/`, así que **sustituir una foto es dejar el archivo con el mismo nombre**. No
hay que tocar ni una línea de layout.

## Qué hace falta

### Portadas — lo más urgente

Una foto por marca, **vertical o cuadrada** (se sirve a pantalla completa en móvil), a la
mayor resolución disponible.

| Destino | Qué buscamos |
|---|---|
| `apps/cokima/src/assets/hero.jpg` | ✅ **`DepAPTwNTvJ-1`, puesta el 2026-10-26**: la sartén en llamas en el fogón (cuadrada, 1440), con su copia a 1200 en `public/images/` para las redes. Sustituye a la burrata de 2021. Es la misma foto que el pase de «la casa», pero **en pantalla no se repite: la portada con foto (`Hero.astro`) quedó huérfana al entrar el rediseño en `preview` el 2026-10-26**, y la cabecera es el vídeo. Esta foto solo se ve al compartir el enlace. Mientras la portada vieja estuvo puesta, a 390px el tramo rojo del titular caía sobre el fuego y se leía mal; con la burrata pasaba lo mismo o peor (titular blanco sobre la burrata blanca), y otras dos fotos oscuras tampoco lo resolvían. Era el velo de esa portada, no la foto. **Si `Hero.astro` vuelve a usarse, revisar eso antes.** |
| `apps/ochoa/src/assets/portada/*.jpg` | ✅ **Desde el 2026-10-27, seis fotos de la casa con gente que se relevan con un telón** (la serie y sus textos alternativos, en `src/data/portada.ts`): la sala con el rótulo, el camarero con dos clientas (`DQe2dPqiJwV-1`), el cocinero (`DQB1FAiCKup-1`), el camarero bajo los rótulos (`DV_ZtJHCPRQ-1`), el camarero sirviendo (`DPeYU5ziIo6-1`) y el cartel colgante (`DPyg6SPCGH5-1`); la sala es `DHdb1_hCOls-1`. Mario la pidió el 2026-10-26 —«no nos hace falta una foto del local en la portada»— y eligió el telón entre cinco bocetos. La fachada (`hero.jpg`, `LosOchoa-5`) ya no se ve en la portada; **sigue siendo la imagen al compartir el enlace** (§Nota técnica). El archivo de `src/assets/hero.jpg` se queda sin uso, y no se ha borrado. |

**Ojo con el encuadre de la portada de Ochoa, que cambia de lado según la pantalla.** Las seis son
cuadradas o verticales y se sirven a sangre. En el móvil la portada es vertical y se recortan por
los lados: medidas a 390 px, las seis guardan caras y rótulos centradas. En el ordenador es al
revés —1440×682 a 1440 px— y se recortan por arriba y por abajo: centradas, al camarero con las
clientas y al cocinero se les iba la cara, y llevan `position` en `portada.ts` (`50% 20%` y
`50% 12%`). La del camarero sirviendo se deja centrada a propósito: subiéndola entraba él pero se
iba la clienta, que es la que mira a cámara. **Al cambiar o añadir una foto, mirar las dos
pantallas.** A 1440 px y pantalla retina la foto se estira 2× (calculado, no medido: la foto es de 1440 y la pantalla pide 2880).

### Fotos de plato

Las fichas de destacados están construidas para funcionar **con o sin foto**: sin imagen
se resuelven tipográficamente, así que la home no se rompe mientras tanto. Añadir una foto
son dos pasos:

1. Dejar el archivo en `apps/<app>/src/assets/dishes/<clave>.jpg`, con la clave en
   kebab-case (por ejemplo `tataki-de-atun.jpg`).
2. Añadir `"image": "tataki-de-atun"` al plato **en `menu-es.json` y en `menu-en.json`**,
   o la versión inglesa se queda sin foto.

Platos destacados que hoy salen sin imagen. **La clave no es una sugerencia: es el nombre
exacto que espera el código**, y sale del nombre del plato con `dishImageKey()`
(`packages/content`). Es el mismo que escribe cada rejilla guía en pantalla, así que se puede
copiar de ahí.

| App | Plato | Archivo |
|---|---|---|
| Cokima | Gyozas de langostino | `gyozas-de-langostino.jpg` |
| Cokima | Tataki de atún | `tataki-de-atun.jpg` |
| Cokima | Tacos del gobernador de gambón | `tacos-del-gobernador-de-gambon.jpg` |
| Cokima | Katsu sando de solomillo de ternera | `katsu-sando-de-solomillo-de-ternera.jpg` |
| Cokima | Arroz meloso de carabinero a la brasa | `arroz-meloso-de-carabinero-a-la-brasa.jpg` |
| Ochoa | Bravas de feria con alioli | ✅ `DCR57pgNXtP-1` (nov. 2024): la bandeja con sus dos salsas. Sustituyó a la oreja de cerdo, que ya no está en la carta. La de la salsa cayendo (`DPWEvvIiM0c`) perdía las patatas al recortarla a 4:3 |
| Ochoa | Huevos rotos con puntilla y grasa de jamón | ✅ `C_dBFM7N2jr-1` (sep. 2024), sobre la cortina roja; el texto los nombra. Ya no hace falta `LosOchoa-6` |
| Ochoa | Cachopín de ternera | ✅ `C7CXyVLNCBt-1` (may. 2024): el queso fundiéndose, el original más grande (3155 px, reducido a 1440) |
| Ochoa | Croissant de rabo de toro | ✅ `C_lHe3MtsXM-1` (sep. 2024), la única que hay; el texto lo nombra. Ya no hace falta `LosOchoa-7` |
| Ochoa | Ración de croquetas de jamón Joselito | ✅ `DLua8GqoiNn-1` (jul. 2025): la huevera, a 1440. Sustituye a `LosOchoa-2`, de 2021 y a 1000 |
| Ochoa | Ensaladilla rusa casera | ✅ `DMSamLoo0l1-1` (jul. 2025): se ven el atún, el polvo de jamón y la yema |

**Una foto solo se asigna a un plato cuando hay certeza de que es ese plato.** Las seis de Ochoa
la tienen porque el texto de la publicación nombra el plato. Además, se ve lo que dice la carta.
`LosOchoa-9` (un bocadillo en las manos con el banco rojo) sigue sin uso: no identifica plato.

### Fotos de la casa — el local, no el plato

Las webs enseñaban solo comida y faltaba la casa: la barra, la sala, la gente. La sección «La
casa» de cada home es eso. **En las dos casas está resuelta con cuatro fotos reales y se publica.**
En Cokima van apaisadas 4:3 en dos columnas desfasadas, en castellano y en inglés (la versión
inglesa no tenía la sección; se le puso el 2026-10-26 con el texto traducido). Las fotos y sus
descripciones viven en `apps/cokima/src/data/casa.ts`, compartido por los dos idiomas.

| App | Archivo | Estado |
|---|---|---|
| Ochoa | `src/assets/casa/barra.jpg` | ✅ `LosOchoa-8`: la barra con el espejo rotulado a mano. |
| Ochoa | `src/assets/casa/rotulo.jpg` | ✅ `LosOchoa-1`: el rótulo pintado en el cristal. |
| Ochoa | `src/assets/casa/vermu.jpg` | ✅ `LosOchoa-4`: vermú con banderilla sobre mármol. |
| Ochoa | `src/assets/casa/comedor.jpg` | ✅ `LosOchoa-3`: banco corrido rojo y mesas de mármol. |
| Ochoa | `src/assets/casa/canas.jpg` | ✅ `DCUbNe1tkBq-1`: un camarero tirando cañas con clientes en la barra. Muro, detrás de `barra.jpg`. Solo en la rama `feat/inicio-vivo`, como las seis siguientes. |
| Ochoa | `src/assets/casa/delantal.jpg` | ✅ `DO6RuaSCJJP-2`: Guille poniéndose el delantal (el texto lo nombra). Vertical, encuadre `50% 18%`. Muro, detrás de `canas.jpg`. Sigue siendo candidata al hueco del equipo: usarla aquí no decide ese hueco. |
| Ochoa | `src/assets/casa/cafe.jpg` | ✅ `Dc-g3Ofonrw-1`: una camarera sirviendo la leche en el café. Vertical, `50% 45%`. Muro, detrás de `vermu.jpg`. |
| Ochoa | `src/assets/casa/gafas-de-cana.jpg` | ✅ `DUla9WSCIlS-1`: un cliente con la camiseta de la casa y dos cañas por gafas. Vertical, `50% 30%`. Muro, detrás de `cafe.jpg`. |
| Ochoa | `src/assets/casa/futbol.jpg` | ✅ `DDj0by3N125-1`: clientes viendo el fútbol en la barra. Muro, detrás de `comedor.jpg`. |
| Ochoa | `src/assets/casa/bandeja.jpg` | ✅ `DJE_GP0CEZO-1`: un camarero llevando unas bravas (el plato, a la vista; el texto habla de «extra de salsa»). Vertical, `50% 30%`. Muro, detrás de `futbol.jpg`. |
| Ochoa | `src/assets/casa/botellas.jpg` | ✅ `DI9SX5Ri98B-1`: la pared de botellas con la etiqueta de la casa. Fondo del manifiesto: en blanco y negro y multiplicada sobre el rojo, así que se lee como rojo y negro. |
| Ochoa | `src/assets/casa/equipo.jpg` | Hueco en «Conócenos», 4:3 junto al texto del equipo. **Candidatos de Instagram (2026-10-26):** el cocinero sonriendo con el cuchillo sobre la cortina roja (`DQB1FAiCKup-1`) y Guille poniéndose el delantal (`DO6RuaSCJJP`). Mejores que `LosOchoa-9`, el bocadillo de 2021. Sin poner: espera a que Mario elija |
| Cokima | `src/assets/casa/pase.jpg` | ✅ `DepAPTwNTvJ-1`: la sartén en llamas, la misma de la portada. |
| Cokima | `src/assets/casa/sala.jpg` | ✅ `Dd0yh8eKSfB-1`: vino sirviéndose en una mesa puesta. **Es una sustituta:** no hay foto de la sala en las publicaciones recientes, y la mesa es la sala vista de cerca. Si aparece una de la sala de noche, se cambia. |
| Cokima | `src/assets/casa/producto.jpg` | ✅ `Deh1PKrtAKZ-1`: maracuyá abierto en macro. No es el «fondo negro, luz dura» del encargo, pero sí lo que dice el texto de la sección: «el producto crudo antes de que le pase nada». |
| Cokima | `src/assets/casa/equipo.jpg` | ✅ `Dd6QjErCvhW-2`: un cocinero salseando un plato. Vertical en un hueco 4:3: lleva `object-position: 50% 20%` en `casa.ts` para que el recorte no le corte la cara. |

**En la rama `feat/inicio-vivo` (2026-10-28), el muro de Ochoa cambia solo**, y por eso cada uno
de sus tres huecos tiene tres fotos: la de siempre y dos de Instagram, con gente. Mario pidió
que la home «se sienta viva» y que haya «elementos que vayan rotando/cambiando». Las siete salen
de `fototeca/instagram/tasquita.losochoa/` tal cual, a su tamaño de Instagram (1440 de ancho, o
1351 la de las gafas), solo recomprimidas con `sips` a calidad 82. Ninguna nombra un plato de la
carta, así que no hace falta `confirmar`. El encuadre de las verticales va en `index.astro`, junto
a su texto alternativo.

## La fototeca: las fotos recientes de Instagram

**Mario quiere las fotos que el equipo sube ahora, no las de la web vieja.** El 2026-10-26 se
encontraron 68 fotos aprovechables en la biblioteca de medios de `grupotombo.com` (algunas en
original de 4000 px), y se descartaron como fuente principal por eso mismo: son de 2021 y 2022, y
una web nueva no se hace con contenido de hace cuatro años. Siguen ahí si hicieran falta
(`/wp-json/wp/v2/media`); **la tanda de 2022 mezcla las tres casas: Cokima, Los Ochoa y La Torcida**, otro local del grupo.
(El 2026-10-26 se escribió aquí que solo mezclaba Ochoa y La Torcida; la rama del rediseño ya había
identificado sus fotos de Cokima en agosto, §Estado.)

**Lo que se descartó para Instagram, con su motivo:**

- **Exportación oficial de la cuenta y API de Meta:** las dos exigen acceso a las cuentas, y el
  2026-10-26 no lo había (depende de otros departamentos). Si llega, la exportación es la vía
  limpia y completa.
- **Leer el perfil con una petición directa a la API interna de Instagram:** el filtro de
  seguridad del agente la bloqueó por saltarse las protecciones de Instagram. No se insiste.
- **Descargadores masivos (Instaloader, gallery-dl):** van contra las condiciones de Instagram y
  exponen a bloqueo la cuenta con la que se inicia sesión.

**Lo que funciona:** abrir el perfil público en un navegador normal y leer las fotos que la página
ya enseña, como se haría a mano con el inspector. Dos piezas:

1. `scripts/fototeca-recoger.js` se ejecuta en la página de Instagram. En el perfil lista las
   publicaciones; en cada publicación devuelve sus fotos en alta (pasa el carrusel entero), el
   texto y la fecha. Lo ejecuta el agente en el navegador integrado, o cualquiera en la consola
   del navegador.
2. `python3 scripts/fototeca.py recogida.json` descarga las fotos a
   `fototeca/instagram/<cuenta>/<código>-<n>.jpg` y las apunta en `fototeca/catalogo.json`, que
   guarda la decisión sobre cada foto: tipo, plato, hueco, estado y nota. Volver a ejecutarlo no
   pisa lo escrito a mano.

**`confirmar`: el plato es una suposición.** Desde el 2026-10-28 Mario quiere usar también las
fotos cuyo plato no está asegurado, marcadas para preguntarle al equipo. Esas fichas llevan el
campo `confirmar` con la pregunta tal cual habría que hacérsela («¿Son las gyozas de pollo
teriyaki? Salen en vaporera; el texto solo dice "gyozas"»). Se da por asegurado lo que nombra el
texto de su publicación, también cuando un carrusel enumera sus platos en orden; lo identificado
solo a la vista va con `confirmar`. Al resolverlo, se corrige `dish` si hace falta y se borra el
campo. El script lo conserva al volver a ejecutarse, como el resto de lo escrito a mano.

**Toda la carpeta `fototeca/` queda fuera de git, catálogo incluido.** Las fotos se vuelven a bajar
abriendo la publicación. El catálogo se quedó fuera por decisión de Mario el 2026-10-26: el repo es
público y el catálogo lleva notas internas sobre el contenido del cliente. **La consecuencia es que
el catálogo vive solo en la máquina donde se hizo la recogida, hoy el Mac.** En la otra no existe:
hay que repetir la recogida o llevar la carpeta a mano. Lo que sí viaja es esta sección, con el
resumen de lo decidido.

**Medido el 2026-10-26:**

- Sin iniciar sesión, el perfil solo enseña **las 12 publicaciones más recientes**: unas siete
  semanas en las dos cuentas. Las publicaciones sueltas sí se abren todas. Con sesión, el perfil
  entero (Ochoa: 411 publicaciones, 313 con foto).
- Las fotos llegan a **1440 px de ancho** (1440×1919, 1440×1800 o 1440×1440).
- Las URLs van firmadas y **solo funcionan enteras**: recortarles parámetros da `403`. Además
  caducan en unos días, así que se descarga justo después de recoger.
- Los vídeos se saltan, también los que van dentro de un carrusel.
- Una espera fija de 1,5 s dejó una publicación sin foto; el fragmento espera ahora a que aparezca
  la foto grande, hasta 8 s.

**Con sesión iniciada (Ochoa, 2026-10-26).** Mario tiene la sesión en Brave, y el agente lo
maneja con la extensión del navegador. Desde ahí no se pueden sacar los datos: Brave bloquea en
silencio las descargas que lanza una página, incluso tras un clic simulado. La extensión no deja
pasar las direcciones firmadas, que fue lo que bloqueó en julio. Y la página de Instagram no puede
pedir nada a `localhost` (CSP). **La salida es navegar:** `fototeca-recoger.js` (con
`ENVIAR = true`) va a `127.0.0.1:8765` con los datos en la dirección, y
`scripts/fototeca-receptor.py` los apunta en `recogida.jsonl`. El receptor devuelve la pestaña
al instante a la siguiente publicación, así que cada publicación es una sola acción. **Si la
pestaña se queda en la página del receptor, la extensión bloquea todo** («no puede verificar el
sitio») hasta que alguien la cierra a mano: pasó una vez y por eso existe la redirección.

Trampas de esa recogida, todas medidas:

- Con sesión, cada publicación añade «Más publicaciones» con fotos igual de grandes; la primera
  prueba bajó seis fotos de una publicación que tenía una. Se distinguen porque van dentro de un
  enlace a otra publicación.
- En la ventana emergente del perfil las fotos no pasan de 1080; en la página propia, 1440. Por
  eso se abre cada publicación.
- La fecha sale del código de la publicación: es su id en base 64, y los bits altos son
  milisegundos desde la época de Instagram. Comprobado contra dos fechas conocidas.
- Alguna foto antigua se queda en 942 px, por debajo del mínimo de 1000 que se usaba; el mínimo es
  ahora 900. Tres llegaron en WebP con extensión `.jpg` y se convirtieron.
- Un texto llevaba U+2028, que `splitlines()` toma por salto de línea: el `.jsonl` se lee
  partiendo solo por `\n`.

**Nombres que dicen qué es.** `python3 scripts/fototeca.py --nombrar` renombra cada foto revisada
a `<tipo>_<etiqueta>__<código>-<n>.jpg` (`plato_cachopin-de-ternera__C7CXyVLNCBt-1.jpg`), con el
tipo y la etiqueta del catálogo. Las fotos de una casa quedan agrupadas por tipo, y el código sigue
ahí para volver a la publicación.

**Lo que dio la primera recogida** (detalle de cada foto en el catálogo del Mac y, para mirarlas,
en el artifact privado de Mario https://claude.ai/artifact/Y9xkL8LhfVpZtRgHsnjjAe):

- **31 fotos:** 4 puestas en Cokima (portada y las cuatro de la casa; la de la llama hace doble
  papel), 8 útiles sin hueco, 8 dudosas y 11 descartadas. Las descartadas son piezas gráficas o
  fotos con texto encima.
- **Ningún destacado que falte sale en estas fotos.** Sí hay platos de carta con foto clara y
  nombrados en el texto: pulpo a la plancha, bikini de lacón, brioche de sobrasada y tarta de
  queso de Ochoa, y el soft shell crab de Cokima. **No se han hecho destacados para que salgan con
  foto, ni siquiera con el reparto delegado:** las fotos de plato solo se ven en la tira de
  destacados, y esa tira se titula «Lo que más sale». Marcar un plato porque tiene foto sería
  afirmar algo sobre sus ventas que nadie ha dicho. Lo decide Mario con el restaurante.
- **Ochoa no recibió ninguna foto en ese primer reparto.** Lo cambió la recogida con sesión.

**Lo que dio la recogida con sesión de Ochoa** (120 publicaciones con foto desde 2024; las 193
anteriores, de 2021 a 2023, se dejaron fuera a propósito, porque Mario no quiere contenido de hace
años):

- **172 fotos:** 114 de platos, 12 del local, 12 de gente (equipo y clientes), 15 de bebida y
  ambiente, y 19 piezas gráficas descartadas.
- **Los seis destacados tienen foto con el plato nombrado en el texto**, y están puestos (tabla
  de arriba).
- **Del local y de gente hay material de verdad:** el camarero en la barra con los rótulos
  pintados, la sala con «La tasca que te mereces» y clientes, el comedor con «Conservas», el
  cocinero, Guille poniéndose el delantal, clientes viendo el fútbol. Seis de ellas son, desde el
  2026-10-27, la portada de Ochoa (tabla de portadas).
- **Dos señales de que la carta transcrita puede estar desfasada:** Cokima publica una pannacotta
  andina que no está en `menu-es.json`, y una «nueva versión de oreja» con alioli y chips de
  boniato, cuando la carta dice milhojas de patata y salsa brava. Hay que preguntarlo al
  restaurante antes de tocar nada.

## Las rejillas guía

Cada hueco de foto se dibuja en pantalla con su proporción, la regla de tercios y el nombre
del archivo que hay que dejar. **Quedan seis** (2026-10-26): los cinco destacados de Cokima y la
del equipo de Ochoa, que nació con «Conócenos». Los destacados de Ochoa y la casa de las dos webs
ya son fotos reales.

**Desde el 2026-08-04 hay también rejillas de texto** (`CopyGuide.astro`), que marcan el
párrafo que falta y dicen qué hay que contar en él. Son cuatro, todas en «Conócenos», y pasan
por la misma puerta: `showPhotoGuides()`. Se explican solas en pantalla, así que la lista de
lo que hay que preguntarle al restaurante se lee en la propia página en vez de en un documento.

Se ven en `dev` y en las previews por rama, y **no existen en producción**: no es cuestión de
acordarse de apagarlas, lo decide `showPhotoGuides()` (`packages/config/src/photo-guides.mjs`)
y hay tests que lo fijan. Un despliegue público siempre tiene `SITE_URL` o `VERCEL_ENV=production`,
y cualquiera de las dos las apaga.

**Una foto solo se asigna a un plato cuando hay certeza de que es ese plato.** Ilustrar un
cachopín con la foto de otra cosa es información falsa en una carta con precios.

## Pendiente de confirmar con el cliente

- **Derechos.** Las cuentas son del grupo, pero la calidad indica fotógrafo profesional.
  Conviene confirmar que la cesión cubre la web y no solo redes sociales.
- **Originales en alta.** Lo de Instagram sale recomprimido y a 1440 px de ancho (medido el
  2026-10-26): suficiente para móvil, justo para escritorio a pantalla completa.

## Nota técnica

Las fotos de portada viven duplicadas a propósito: en `src/assets/` las procesa Astro, y en
`public/images/` se sirven tal cual como `og:image` de las redes sociales, que necesita una URL
estable. Al sustituir una portada hay que cambiar **las dos copias**.

En Ochoa el `og:image` apunta a `/images/hero.jpg` —la fachada—. Se eligió para que la vista
previa en redes fuera la misma imagen que ve quien entra, y **desde el 2026-10-27 ya no lo es**: la
portada abre con la sala. Se dejó así a propósito, sin decidir: la fachada dice qué sitio es mejor
que cualquiera de las seis en una miniatura. Si Mario prefiere la sala, es copiarla a
`public/images/` y cambiar la ruta en `Base.astro`. `/images/mesa.jpg` es el cenital de la mesa, que
sirve la sección «la tasca».
