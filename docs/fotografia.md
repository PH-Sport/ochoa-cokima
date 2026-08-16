# Fotografía

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

En `cokima-fotos/para-el-video/` de su iCloud hay cinco elegidas para el vídeo de la entrada,
**todas sin manos a la vista**: los generadores de vídeo deforman dedos y en un plano cerrado de
comida eso canta.

---

**Ochoa ya tiene fotos reales del local.** El 2026-07-30 aparecieron **nueve fotos
en la web vieja del grupo** que nadie había mirado:
`grupotombo.com/wp-content/uploads/2021/09/LosOchoa-1..9.jpg`, a 1000×1000. Con ellas se
resolvieron la portada de Ochoa y las cuatro de «la casa». **Quedan cuatro sin usar y son
buenas** —croquetas en huevera, huevos rotos, brioche de rabo de toro, un bocadillo en las
manos con el banco rojo detrás—: sirven directamente para cuatro de los seis platos destacados
que siguen sin imagen. Ver la tabla de más abajo para el nombre que tiene que llevar cada una.

La selección de Instagram acordada el 2026-07-29 sigue sin poder descargarse: la extensión de
navegador bloquea la extracción de las URLs del CDN de Instagram porque llevan parámetros de
firma en la cadena de consulta. No es un problema del código ni de permisos de la cuenta.

Lo que sí está hecho: las imágenes existentes pasan por `<Image>` de Astro desde
`src/assets/`, así que **sustituir una foto es dejar el archivo con el mismo nombre**. No
hay que tocar ni una línea de layout.

## Qué hace falta

### Portadas — lo más urgente

Una foto por marca, **vertical o cuadrada** (se sirve a pantalla completa en móvil), a la
mayor resolución disponible.

| Destino | Qué buscamos |
|---|---|
| `apps/cokima/src/assets/hero.jpg` | **Lo único urgente que queda.** Registro oscuro con luz dura: en su Instagram encajan la parrilla con llama, el atún crudo sobre fondo negro o las gambas rojas. |
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
| Ochoa | Oreja de cerdo crujiente con salsa brava | `oreja-de-cerdo-crujiente-con-salsa-brava.jpg` |
| Ochoa | Huevos rotos con puntilla | `huevos-rotos-con-puntilla.jpg` — **candidata: `LosOchoa-6`** |
| Ochoa | Cachopín de ternera | `cachopin-de-ternera.jpg` |
| Ochoa | Croissant de rabo de toro | `croissant-de-rabo-de-toro.jpg` — **candidata: `LosOchoa-7`**, si el brioche es este plato |
| Ochoa | Ración de croquetas de jamón Joselito | `racion-de-croquetas-de-jamon-joselito.jpg` — **candidata: `LosOchoa-2`** |
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
casa» de cada home es eso. **En Ochoa ya está resuelta con cuatro fotos reales y se publica; en
Cokima siguen siendo rejillas.** Las cuatro van apaisadas 4:3 en dos columnas desfasadas.

| App | Archivo | Estado |
|---|---|---|
| Ochoa | `src/assets/casa/barra.jpg` | ✅ `LosOchoa-8`: la barra con el espejo rotulado a mano. |
| Ochoa | `src/assets/casa/rotulo.jpg` | ✅ `LosOchoa-1`: el rótulo pintado en el cristal. |
| Ochoa | `src/assets/casa/vermu.jpg` | ✅ `LosOchoa-4`: vermú con banderilla sobre mármol. |
| Ochoa | `src/assets/casa/comedor.jpg` | ✅ `LosOchoa-3`: banco corrido rojo y mesas de mármol. |
| Ochoa | `src/assets/casa/equipo.jpg` | Hueco nuevo, en «Conócenos». **`LosOchoa-9` es la candidata**: el bocadillo en las manos con el banco rojo detrás, la única foto con gente que tenemos. Va 4:3 junto al texto del equipo. |
| Cokima | `src/assets/casa/pase.jpg` | El pase de cocina en servicio, con la llama. |
| Cokima | `src/assets/casa/sala.jpg` | La sala de noche, luz baja y mesas llenas. |
| Cokima | `src/assets/casa/producto.jpg` | Producto en crudo sobre fondo negro, luz dura. |
| Cokima | `src/assets/casa/equipo.jpg` | El equipo en la cocina, caras de verdad. |

## Las rejillas guía

Cada hueco de foto se dibuja en pantalla con su proporción, la regla de tercios y el nombre
del archivo que hay que dejar. **Dieciséis en total**: once de plato, las cuatro de la casa de
Cokima y la del equipo de Ochoa, que nació con «Conócenos». Las otras cuatro de la casa de
Ochoa ya son fotos reales.

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
- **Originales en alta.** Lo de Instagram sale recomprimido y a 1080 px como máximo:
  suficiente para móvil, justo para escritorio a pantalla completa.

## Nota técnica

Las fotos de portada viven duplicadas a propósito: en `src/assets/` las procesa Astro, y en
`public/images/` se sirven tal cual como `og:image` de las redes sociales, que necesita una URL
estable. Al sustituir una portada hay que cambiar **las dos copias**.

En Ochoa el `og:image` apunta a `/images/hero.jpg` —la fachada— para que la vista previa en
redes sea la misma imagen que ve quien entra. `/images/mesa.jpg` es el cenital de la mesa, que
sirve la sección «la tasca».
