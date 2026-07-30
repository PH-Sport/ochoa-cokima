# Fotografía

## Estado

**Las webs siguen con las fotos antiguas.** La selección de Instagram acordada el
2026-07-29 no ha podido descargarse: la extensión de navegador bloquea la extracción de
las URLs del CDN de Instagram porque llevan parámetros de firma en la cadena de consulta.
No es un problema del código ni de permisos de la cuenta.

Lo que sí está hecho: las imágenes existentes pasan por `<Image>` de Astro desde
`src/assets/`, así que **sustituir una foto es dejar el archivo con el mismo nombre**. No
hay que tocar ni una línea de layout.

## Qué hace falta

### Portadas — lo más urgente

Una foto por marca, **vertical o cuadrada** (se sirve a pantalla completa en móvil), a la
mayor resolución disponible.

| Destino | Qué buscamos |
|---|---|
| `apps/cokima/src/assets/hero.jpg` | Registro oscuro con luz dura. En su Instagram encajan la parrilla con llama, el atún crudo sobre fondo negro o las gambas rojas. |
| `apps/ochoa/src/assets/tasca.jpg` | **Ya cubierta**, con el rótulo pintado en el cristal. Ver la nota de abajo antes de sustituirla. |

**Ojo con la portada de Ochoa:** desde el 2026-07-30 es `tasca.jpg` —el rótulo en el
cristal—, no `hero.jpg`, que se mudó a la sección «la tasca». Como la foto es **cuadrada** y
la portada de móvil es vertical, a sangre solo cabía el 60% del ancho y el rótulo se leía
«OS OCHO»; por eso en móvil la portada se parte en dos: la foto entera arriba y el titular en
una banda del rojo de la casa. **Si la sustituye una toma apaisada, esa composición deja de
hacer falta** y conviene revisar la media query de `Hero.astro`.

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
| Ochoa | Huevos rotos con puntilla | `huevos-rotos-con-puntilla.jpg` |
| Ochoa | Cachopín de ternera | `cachopin-de-ternera.jpg` |
| Ochoa | Croissant de rabo de toro | `croissant-de-rabo-de-toro.jpg` |
| Ochoa | Ración de croquetas de jamón Joselito | `racion-de-croquetas-de-jamon-joselito.jpg` |
| Ochoa | Ensaladilla rusa casera | `ensaladilla-rusa-casera.jpg` |

### Fotos de la casa — el local, no el plato

Las dos webs enseñan solo comida. Falta la casa: la barra, la sala, la gente. La sección «Lo
que falta por retratar» de cada home es exactamente eso, dibujada en hueco, y se publica sola
en cuanto existan los archivos.

**Las ocho van apaisadas 4:3**, todas iguales: se muestran en una cuadrícula de dos por dos y
lo que se busca es que se lean como una serie, no como cuatro encuadres distintos peleándose.

| App | Archivo | Qué buscamos |
|---|---|---|
| Ochoa | `src/assets/casa/barra.jpg` | La barra en hora punta, con el mandil rojo. |
| Ochoa | `src/assets/casa/rotulo.jpg` | El rótulo desde la calle, de noche, con el rojo encendido. |
| Ochoa | `src/assets/casa/vermu.jpg` | Vermú de grifo recién servido, plano corto. |
| Ochoa | `src/assets/casa/comedor.jpg` | El comedor lleno a mediodía, gente de verdad. |
| Cokima | `src/assets/casa/pase.jpg` | El pase de cocina en servicio, con la llama. |
| Cokima | `src/assets/casa/sala.jpg` | La sala de noche, luz baja y mesas llenas. |
| Cokima | `src/assets/casa/producto.jpg` | Producto en crudo sobre fondo negro, luz dura. |
| Cokima | `src/assets/casa/equipo.jpg` | El equipo en la cocina, caras de verdad. |

## Las rejillas guía

Cada hueco de foto se dibuja en pantalla con su proporción, la regla de tercios y el nombre
del archivo que hay que dejar. **Diecinueve en total**: once de plato y ocho de la casa.

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

En Ochoa, el `og:image` apunta a `/images/tasca.jpg` para que la vista previa en redes sea la
misma imagen que ve quien entra.
