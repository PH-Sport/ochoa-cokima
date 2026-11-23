# Portadas, chrome y piel de Ochoa — diseño

> **Estado: cerrado** · registro histórico, no se actualiza · índice en `README.md`

- **Fecha:** 2026-07-29
- **Rama:** `preview`
- **Estado:** aprobado por Mario, pendiente de plan de implementación

---

## 1. Problema

Las dos homes no transmiten carácter propio y usan demasiado texto antes de mostrar
comida. En concreto:

- **Ochoa** encadena tres bloques de texto (hero + manifiesto + "la tasca") y **no muestra
  ni un plato**, pese a tener seis marcados `featured: true` en `menu-es.json`.
- **Cokima** sí muestra platos, pero llegan tras titular + párrafo de 30 palabras + dos
  botones, y bajo tres encabezados encadenados
  ("Lo que no te puedes perder" / "Los imprescindibles" / "Selección").
- El cartel de cookies vive en la franja inferior, donde compite con la barra fija de
  reserva de cada marca.
- La paleta de Ochoa (papel crema + tinta marrón, rojo de acento) **no coincide con su
  identidad real**, que en su Instagram y en el local es rojo bandera sobre blanco.

## 2. Alcance

Entra: primera pantalla de las dos homes, bloque de platos destacados, cabecera y menú,
ubicación del cartel de consentimiento, paleta y tipografía de Ochoa, y la fotografía de
ambas webs.

No entra: la página `/carta`, las páginas legales, `packages/tracking`, el filtro de
alérgenos, ni la integración del mapa. Los pendientes menores de `docs/estado.md` se
mantienen en su lista salvo el peso de las imágenes, que este trabajo resuelve de paso.

## 3. Investigación de referencias

Se revisaron las cinco webs aportadas por el equipo: Ponja Nikkei, Gianna Ristorante,
La Burlona, Toguita y Alto Bardero.

**Patrón común a las cinco.** Foto a pantalla completa, capa oscura uniforme encima y
texto blanco **centrado** con un imperativo intercambiable entre marcas. Ninguna de las
cinco muestra, en su primera pantalla, qué se come ni cuánto cuesta; ninguna indica si el
local está abierto en ese momento; ninguna rompe el centrado.

**Debilidades observadas.** Ponja antepone una pantalla de selección de sede
(Madrid / Lisboa) antes de mostrar contenido. Toguita usa de portada la sala vacía con las
sillas recogidas, y un carrusel con paginación de puntos. Burlona y Bardero muestran
varios segundos de pantalla en negro mientras carga el vídeo de fondo.

**Lo aprovechable.** Gianna es la única que se compromete con un color propio (petróleo y
turquesa a bloque entero) y por eso se recuerda. Bardero arriesga con el encuadre
fotográfico: primerísimo plano desenfocado, con punto de vista. Burlona y Toguita
confirman el chrome estándar del sector: marca a la izquierda, idioma y botón de reserva
arriba a la derecha.

**Ventajas nuestras a explotar**, todas ausentes en las cinco: nombre y precio de plato en
la home; estado de apertura real en hora de Madrid (ya construido en `OpenState`);
composición no centrada; titulares que solo puede firmar esta marca; y salida estática de
Astro frente a sus vídeos pesados.

## 4. Decisiones tomadas

| Decisión | Resolución |
|---|---|
| Primera pantalla | Portada a sangre en las dos marcas |
| Paleta de Ochoa | Se alinea con la marca real: rojo + blanco |
| Paleta de Cokima | Sin cambios (ya coincide con su Instagram) |
| Barra fija | Arriba a la derecha: `[Reservar]` + `[☰]` |
| Cartel de cookies | Franja inferior, ya libre de barra |
| Botones de consentimiento | Rechazar en gris, aceptar en color, mismo tamaño y nivel |
| Origen de la fotografía | Instagram ahora, originales del fotógrafo después |

## 5. Diseño

### 5.1 Portada (ambas marcas)

Foto a sangre ocupando la primera pantalla completa, de borde a borde.

- **Sin capa oscura uniforme.** Degradado únicamente en la zona donde cae el texto, para
  no apagar la comida. Es la diferencia con las cinco referencias.
- **Titular anclado abajo a la izquierda**, no centrado, a tamaño grande. Se conservan los
  textos actuales: *"Puedes comer en cualquier sitio. Pero será solo comer."* (Cokima) y
  *"La tasca que te mereces"* (Ochoa).
- **Se elimina el párrafo `.kicker`** de ambas homes.
- **Sin botones en el hero:** el de reservar ya está fijo en la cabecera.
- El `<h1>` se mantiene como texto real sobre la imagen, nunca incrustado en el archivo.

### 5.2 Platos inmediatamente después

Bloque de destacados justo bajo la portada, con el **último elemento cortado por el borde
inferior de la pantalla** para que se lea que hay más.

- **Cokima:** reutiliza `MenuDeck` con los cinco `featured` existentes (gyozas de
  langostino 14 €, tataki de atún 18 €, tacos del gobernador de gambón 14 €, katsu sando
  22 €, arroz meloso de carabinero 30 €). **Se elimina el triple encabezado:** queda un
  único rótulo, y desaparece el `title` "Selección" que se pasaba al componente.
- **Ochoa:** estrena sus seis `featured`, hoy sin usar (oreja crujiente 7/12 €, huevos
  rotos con puntilla 14 €, cachopín de ternera 18 €, croissant de rabo de toro 17 €,
  croquetas Joselito 7,50/14 €, ensaladilla rusa). Los precios con media ración muestran
  ambos importes, como ya hace `MenuBoard`.
- Cada plato lleva foto, nombre y precio. La descripción es opcional y se recorta en
  móvil.

### 5.3 Chrome

**Cabecera** (`Nav.astro` de cada app), fija en scroll:

```
[ Marca ]                              [ Reservar ]  [ ☰ ]
```

- El botón de reservar deja de ocultarse en móvil: es el CTA permanente.
- La hamburguesa despliega: **La carta**, **Dónde estamos**, y el selector **ES · EN**,
  que abandona la esquina superior derecha.
- El panel desplegable se cierra con `Escape` y con clic fuera; el foco queda atrapado
  dentro mientras está abierto, y el botón declara `aria-expanded`.

**Se eliminan** `apps/ochoa/src/components/BottomBar.astro` y
`apps/cokima/src/components/ReserveBar.astro`. El estado de apertura (`OpenState`) se
traslada: en la cabecera junto a la marca en escritorio, y dentro del panel de la
hamburguesa en móvil.

Con las barras fijas fuera, `--t-bottom-bar-h` deja de tener consumidores: se retira de
`tokens.css` de ambas apps junto con el `padding-bottom` del `body`.

### 5.4 Consentimiento

`ConsentBanner.astro` pasa a la franja inferior a lo ancho, que queda libre. Se mantiene
la maquetación compacta de móvil ya construida, sin el anclaje a `--t-bottom-bar-h`.
Los dos botones conservan mismo tamaño, misma fila y un solo clic cada uno; rechazar en
gris con borde, aceptar en el color de acento de la marca. El texto no se toca: sigue
siendo una decisión abierta de contenido legal.

### 5.5 Nueva piel de Ochoa

Cambia `apps/ochoa/src/styles/tokens.css`. No se toca `packages/ui`, que sigue sin
conocer ni un color de marca.

| Token | Antes | Después |
|---|---|---|
| `--paper` | `#f4eee2` crema | `#ffffff` |
| `--ink` | `#23201b` marrón | `#1a1a1a` |
| `--rojo` | `#c6222b` (acento) | `#c6222b` (**dominante**) |
| `--serif` | Georgia itálica | se retira |
| `--t-open` | `#4c6b2f` verde oliva | se retira |

- El rojo pasa de acento a color de superficie: bloques enteros en rojo con texto blanco,
  como en sus piezas de Instagram.
- **Cuadro vichy** rojo y blanco como recurso gráfico de separación, generado con
  `repeating-linear-gradient`, sin imagen.
- La display **Anton** se mantiene: es condensada y sostiene el registro del rótulo.
- Desaparece la serif itálica, que era la que fabricaba el aire de "tasca de 1950": las
  descripciones de plato pasan a la sans, y `--t-desc-style` deja de ser `italic`.
- **Estado de apertura sin cuarta familia de color:** texto en `--ink` con un punto rojo
  cuando está abierto, gris cuando está cerrado. El texto ya dice el estado, así que no
  depende del color.
- Efecto colateral asumido: `MenuBoard` (carta pizarra) hereda la piel nueva —
  `--t-menu-title-shadow`, `--t-leader` y `--t-rule-*` se recalculan sobre blanco.

### 5.6 Fotografía

Selección de los perfiles `@cokimamadrid` y `@tasquita.losochoa`, a 1080 px, suficiente
para móvil (390 px × 2 = 780 px).

- Todas las imágenes pasan a `<Image>` de Astro con salida AVIF/WebP, `width`/`height`
  declarados y `loading="eager"` + `fetchpriority="high"` solo en la portada.
- Los archivos viven en `apps/*/src/assets/` para que Astro los procese, no en `public/`.
- Sustituir por los originales del fotógrafo no debe requerir tocar el layout.
- **Cokima:** registro oscuro con luz dura — atún crudo, gambas rojas, parrilla con llama,
  humo. Coincide con los destacados de su carta.
- **Ochoa:** producto sobre fondo rojo liso, barra y rótulo circular.

## 6. Ficheros afectados

| Fichero | Cambio |
|---|---|
| `apps/*/src/pages/index.astro` | Portada a sangre, sin kicker ni botones; bloque de platos |
| `apps/*/src/pages/en/index.astro` | Lo mismo, en inglés |
| `apps/*/src/components/Nav.astro` | Reservar + hamburguesa, panel desplegable, OpenState |
| `apps/ochoa/src/components/BottomBar.astro` | Se elimina |
| `apps/cokima/src/components/ReserveBar.astro` | Se elimina |
| `apps/ochoa/src/styles/tokens.css` | Piel nueva; fuera `--t-open` y `--t-bottom-bar-h` |
| `apps/cokima/src/styles/tokens.css` | Fuera `--t-bottom-bar-h` |
| `packages/ui/src/ConsentBanner.astro` | Franja inferior sin anclaje a la barra |
| `packages/ui/src/OpenState.astro` | Deja de asumir que vive en una barra fija |
| `apps/*/src/assets/` | Fotografía nueva |

## 7. Verificación

Medido en navegador a 390 px de ancho, no en el código:

1. En ambas homes, la portada ocupa la primera pantalla completa y el primer plato con
   precio asoma por el borde inferior.
2. `[Reservar]` es alcanzable sin hacer scroll en cualquier página.
3. El panel de la hamburguesa se cierra con `Escape` y con clic fuera, y el foco no se
   escapa mientras está abierto.
4. El cartel de cookies no se solapa con ningún elemento fijo, y aceptar y rechazar miden
   lo mismo.
5. En Ochoa no queda ni un uso del crema `#f4eee2` ni del verde `#4c6b2f`.
6. Contraste mínimo 4.5:1 en todo texto, incluido el titular sobre la foto.
7. `pnpm test` en verde y `pnpm build` `Complete!` en las dos apps.
8. El peso de la portada baja de los 245 KB actuales de Cokima.

## 8. Riesgos

- **La foto manda.** Con portada a sangre, una imagen mediocre se nota más que antes. Si
  la selección de Instagram no aguanta a pantalla completa en escritorio, el plan B es
  recortarla a formato vertical en móvil y dejar escritorio en composición partida.
- **El rojo dominante cansa.** Rojo a bloque entero puede resultar agresivo en pantallas
  grandes. Se dosifica por secciones, no como fondo global.
- **Derechos de las fotos.** Son cuentas del propio grupo, pero conviene confirmar con el
  fotógrafo que la cesión cubre la web y no solo redes.

## 9. Decisiones que siguen abiertas

Sin cambios respecto a `docs/estado.md`: el filtro de alérgenos de Cokima sigue apagado a
la espera de datos firmados, el texto del cartel de cookies no se toca por su matiz legal,
y queda por decidir cuándo se lleva `preview` a `main`. El verde oliva deja de estar
abierto: este diseño lo retira.
