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
| `apps/ochoa/src/assets/hero.jpg` | Producto sobre fondo rojo liso, o la barra con el mandil rojo. |

### Fotos de plato

Las fichas de destacados están construidas para funcionar **con o sin foto**: sin imagen
se resuelven tipográficamente, así que la home no se rompe mientras tanto. Añadir una foto
son dos pasos:

1. Dejar el archivo en `apps/<app>/src/assets/dishes/<clave>.jpg`, con la clave en
   kebab-case (por ejemplo `tataki-de-atun.jpg`).
2. Añadir `"image": "tataki-de-atun"` al plato **en `menu-es.json` y en `menu-en.json`**,
   o la versión inglesa se queda sin foto.

Platos destacados que hoy salen sin imagen:

| App | Plato | Clave sugerida |
|---|---|---|
| Cokima | Gyozas de langostino | `gyozas-de-langostino` |
| Cokima | Tataki de atún | `tataki-de-atun` |
| Cokima | Tacos del gobernador de gambón | `tacos-del-gobernador` |
| Cokima | Katsu sando de solomillo | `katsu-sando` |
| Cokima | Arroz meloso de carabinero | `arroz-de-carabinero` |
| Ochoa | Oreja de cerdo crujiente | `oreja-crujiente` |
| Ochoa | Huevos rotos con puntilla | `huevos-rotos` |
| Ochoa | Cachopín de ternera | `cachopin` |
| Ochoa | Croissant de rabo de toro | `croissant-de-rabo-de-toro` |
| Ochoa | Croquetas de jamón Joselito | `croquetas-joselito` |
| Ochoa | Ensaladilla rusa casera | `ensaladilla` |

**Una foto solo se asigna a un plato cuando hay certeza de que es ese plato.** Ilustrar un
cachopín con la foto de otra cosa es información falsa en una carta con precios.

## Pendiente de confirmar con el cliente

- **Derechos.** Las cuentas son del grupo, pero la calidad indica fotógrafo profesional.
  Conviene confirmar que la cesión cubre la web y no solo redes sociales.
- **Originales en alta.** Lo de Instagram sale recomprimido y a 1080 px como máximo:
  suficiente para móvil, justo para escritorio a pantalla completa.

## Nota técnica

`hero.jpg` vive duplicado a propósito: en `src/assets/` lo procesa Astro para la portada,
y en `public/images/` se sirve tal cual como `og:image` de las redes sociales, que
necesita una URL estable. Al sustituir la portada hay que cambiar **las dos copias**.
