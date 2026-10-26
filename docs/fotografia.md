# Fotografía

> **Estado: vivo** · revisado 2026-10-26 · la portada y la casa de Cokima ya tienen foto; los destacados siguen sin ella

## Estado

**Desde el 2026-08-14, Cokima tiene mejor material que Ochoa.** Aparecieron **diecinueve fotos
suyas** en la misma web vieja del grupo, que nadie había mirado, y Mario aportó **seis más del
local** el 16. Veinticinco en total, cuando la web usaba una.

- `wp-content/uploads/2021/09/` → `cokima-1-1`, `cokima-2-1`, `cokima-3-1`, `cokima-4-1`,
  `cokima-5-1`, `cokima-6`, `cokima-7`, `cokima-8`. Todas `.jpg` a 1000×1000.
- `wp-content/uploads/2022/10/` → `1`, `2`, `3`, `1-copia`, `2-copia`, `3-copia`, `1-copia-2`,
  `2-copia-2`, `1-copia-3`, `1-PORTADA`, `2-PORTADA`. **A 4000×4000**, mejor que nada de Ochoa.
- Las seis de Mario, en su iCloud Drive (`cokima-fotos/`), **apaisadas** a ~3500×2500 y en
  Display P3 — **hay que convertirlas a sRGB al procesarlas** o el ocre de las sillas se va
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
cuenta en ese reparto**, porque se hizo desde `preview`, donde este apartado no existía; para la
sala, uno de sus murales encaja mejor que la mesa puesta que se usó.

En `cokima-fotos/para-el-video/` de su iCloud hay cinco elegidas para el vídeo de la entrada,
**todas sin manos a la vista**: los generadores de vídeo deforman dedos y en un plano cerrado de
comida eso canta.

---

**Ochoa ya tiene fotos reales del local.** El 2026-07-30 aparecieron **nueve fotos
en la web vieja del grupo** que nadie había mirado:
`grupotombo.com/wp-content/uploads/2021/09/LosOchoa-1..9.jpg`, a 1000×1000. Con ellas se
resolvieron la portada de Ochoa y las cuatro de «la casa». **Las croquetas (`LosOchoa-2`) se
pusieron el 2026-10-22**: el velo de papada que dice la carta se ve en la foto, así que no había
duda. **Quedan tres sin usar, y ninguna se puede poner sin que Mario confirme el plato** —un
huevo frito sobre una base, un brioche con carne deshilachada, un bocadillo en las manos con el
banco rojo detrás—. El porqué de cada duda está en la tabla de más abajo.

**Ojo al mezclar fichas con y sin foto en la tira de destacados.** En producción una ficha sin
foto se pinta solo con el nombre y el precio, pero se estira al alto de la que sí la tiene: con
la de las croquetas puesta, las otras cinco miden lo mismo (293px a 390 de ancho, medido sobre el
build de producción) y quedan con el texto arriba y un hueco blanco debajo. En `dev` y en las
previews no se ve, porque ahí las rejillas guía ocupan ese hueco.

**Instagram ya se puede descargar, desde el 2026-10-26** (§La fototeca). Las 31 fotos de las 12
últimas publicaciones de cada cuenta están bajadas y revisadas. **Cubren la portada y las cuatro
de la casa de Cokima, pero ningún destacado que falte.** Mario delegó el reparto ese mismo día
(«distribúyelas según consideres») y quedaron puestas.

Lo que sí está hecho: las imágenes existentes pasan por `<Image>` de Astro desde
`src/assets/`, así que **sustituir una foto es dejar el archivo con el mismo nombre**. No
hay que tocar ni una línea de layout.

## Qué hace falta

### Portadas — lo más urgente

Una foto por marca, **vertical o cuadrada** (se sirve a pantalla completa en móvil), a la
mayor resolución disponible.

| Destino | Qué buscamos |
|---|---|
| `apps/cokima/src/assets/hero.jpg` | ✅ **`DepAPTwNTvJ-1`, puesta el 2026-10-26**: la sartén en llamas en el fogón (cuadrada, 1440), con su copia a 1200 en `public/images/` para las redes. Sustituye a la burrata de 2021. Es la misma foto que el pase de «la casa»: en el rediseño (`tmp/entrada-cokima`) la portada es el vídeo y esta solo se ve al compartir el enlace, así que la repetición solo existe en la home vieja de `preview`. **Limitación conocida, no resuelta:** a 390px el tramo rojo del titular cae sobre el fuego y se lee mal. Con la burrata pasaba lo mismo o peor (titular blanco sobre la burrata blanca); se probaron otras dos fotos oscuras y tampoco lo resolvían. Es el velo de esta portada, no la foto, y esta portada desaparece con el rediseño. |
| `apps/ochoa/src/assets/hero.jpg` | **Ya cubierta** con la fachada (`LosOchoa-5`): toldo, cartel colgante y terraza. |

**Ojo con la portada de Ochoa.** Es cuadrada y se sirve a sangre, así que en móvil se recorta a
lo alto: lleva `object-position: 62% 42%` para que el recorte se quede con el cartel y la puerta
y no con la acera. Si se sustituye por otra foto **hay que revisar ese encuadre**, porque está
elegido para esta imagen y no para cualquiera.

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
| Ochoa | Bravas de feria con alioli | `bravas-de-feria-con-alioli.jpg` — sustituye a la oreja de cerdo, que ya no está en `menu-es.json` (visto el 2026-10-26). La única foto de Instagram (`DdAJ_f1IHuJ`) lleva un meme encima que tapa media foto |
| Ochoa | Huevos rotos con puntilla y grasa de jamón | `huevos-rotos-con-puntilla-y-grasa-de-jamon.jpg` — **candidata dudosa: `LosOchoa-6`**. Mirada el 2026-10-22: es un huevo frito con puntilla y jamón en polvo, pero no se ven patatas y la base parece ensaladilla con atún, que es el otro destacado («con atún, polvo de jamón y yema curada»). Que Mario diga cuál de los dos es |
| Ochoa | Cachopín de ternera | `cachopin-de-ternera.jpg` |
| Ochoa | Croissant de rabo de toro | `croissant-de-rabo-de-toro.jpg` — **candidata: `LosOchoa-7`**, si el brioche es este plato. En la foto son dados de brioche tostado, no un croissant |
| Ochoa | Ración de croquetas de jamón Joselito | ✅ `LosOchoa-2`, puesta el 2026-10-22 |
| Ochoa | Ensaladilla rusa casera | `ensaladilla-rusa-casera.jpg` |

**Las candidatas hay que confirmarlas antes de asignarlas.** Una foto solo se pone en un plato
cuando hay certeza de que es ese plato: `LosOchoa-6` parece huevos rotos con puntilla y
`LosOchoa-2` croquetas empanadas con jamón por encima, pero `LosOchoa-7` es un brioche con carne
deshilachada que podría ser el croissant de rabo de toro o el dúo de brioche, y **no es lo
mismo**. Queda también `LosOchoa-9`, un bocadillo en las manos con el banco rojo detrás: no
sirve para identificar un plato, pero es la única foto con gente y vale para cualquier sitio
donde haga falta calor humano.

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
| Ochoa | `src/assets/casa/equipo.jpg` | Hueco nuevo, en «Conócenos». **`LosOchoa-9` es la candidata**: el bocadillo en las manos con el banco rojo detrás, la única foto con gente que tenemos. Va 4:3 junto al texto del equipo. |
| Cokima | `src/assets/casa/pase.jpg` | ✅ `DepAPTwNTvJ-1`: la sartén en llamas, la misma de la portada. |
| Cokima | `src/assets/casa/sala.jpg` | ✅ `Dd0yh8eKSfB-1`: vino sirviéndose en una mesa puesta. **Es una sustituta:** no hay foto de la sala en las publicaciones recientes, y la mesa es la sala vista de cerca. Si aparece una de la sala de noche, se cambia. |
| Cokima | `src/assets/casa/producto.jpg` | ✅ `Deh1PKrtAKZ-1`: maracuyá abierto en macro. No es el «fondo negro, luz dura» del encargo, pero sí lo que dice el texto de la sección: «el producto crudo antes de que le pase nada». |
| Cokima | `src/assets/casa/equipo.jpg` | ✅ `Dd6QjErCvhW-2`: un cocinero salseando un plato. Vertical en un hueco 4:3: lleva `object-position: 50% 20%` en `casa.ts` para que el recorte no le corte la cara. |

## La fototeca: las fotos recientes de Instagram

**Mario quiere las fotos que el equipo sube ahora, no las de la web vieja.** El 2026-10-26 se
encontraron 68 fotos aprovechables en la biblioteca de medios de `grupotombo.com` (algunas en
original de 4000 px), y se descartaron como fuente principal por eso mismo: son de 2021 y 2022, y
una web nueva no se hace con contenido de hace cuatro años. Siguen ahí si hicieran falta
(`/wp-json/wp/v2/media`); **la tanda de 2022 mezcla Los Ochoa con La Torcida, otro local del grupo**.

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

**Toda la carpeta `fototeca/` queda fuera de git, catálogo incluido.** Las fotos se vuelven a bajar
abriendo la publicación. El catálogo se quedó fuera por decisión de Mario el 2026-10-26: el repo es
público y el catálogo lleva notas internas sobre el contenido del cliente. **La consecuencia es que
el catálogo vive solo en la máquina donde se hizo la recogida, hoy el Mac.** En la otra no existe:
hay que repetir la recogida o llevar la carpeta a mano. Lo que sí viaja es esta sección, con el
resumen de lo decidido.

**Medido el 2026-10-26:**

- Sin iniciar sesión, el perfil solo enseña **las 12 publicaciones más recientes**: unas siete
  semanas en las dos cuentas. Las publicaciones sueltas sí se abren todas.
- Las fotos llegan a **1440 px de ancho** (1440×1919, 1440×1800 o 1440×1440).
- Las URLs van firmadas y **solo funcionan enteras**: recortarles parámetros da `403`. Además
  caducan en unos días, así que se descarga justo después de recoger.
- Los vídeos se saltan, también los que van dentro de un carrusel.
- Una espera fija de 1,5 s dejó una publicación sin foto; el fragmento espera ahora a que aparezca
  la foto grande, hasta 8 s.

**Para ir más atrás, Mario inicia sesión con su cuenta en el navegador integrado** (el agente no
mete contraseñas). Sin sesión, la alternativa es repetir la recogida cada pocas semanas: con dos o
tres publicaciones por semana, el almacén crece solo.

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
- **Ochoa no recibió ninguna foto en este reparto:** sus publicaciones recientes son platos sin
  destacar o piezas con texto, y su casa ya tenía fotos reales del local.
- **Dos señales de que la carta transcrita puede estar desfasada:** Cokima publica una pannacotta
  andina que no está en `menu-es.json`, y una «nueva versión de oreja» con alioli y chips de
  boniato, cuando la carta dice milhojas de patata y salsa brava. Hay que preguntarlo al
  restaurante antes de tocar nada.

## Las rejillas guía

Cada hueco de foto se dibuja en pantalla con su proporción, la regla de tercios y el nombre
del archivo que hay que dejar. **Quedan once** (2026-10-26): diez de plato, los destacados sin
foto, y la del equipo de Ochoa, que nació con «Conócenos». Las de la casa de las dos webs ya son
fotos reales.

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

En Ochoa el `og:image` apunta a `/images/hero.jpg` —la fachada— para que la vista previa en
redes sea la misma imagen que ve quien entra. `/images/mesa.jpg` es el cenital de la mesa, que
sirve la sección «la tasca».
