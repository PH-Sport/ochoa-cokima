# Divergencia de layout — Cokima y Tasquita Los Ochoa

> **Estado: cerrado** · registro histórico, no se actualiza · índice en `README.md`

## Documento de diseño

- **Fecha:** 2026-07-27
- **Estado:** diseño aprobado en conversación; pendiente de revisión del documento escrito
- **Autor:** equipo técnico (con Claude)
- **Diseño previo:** `docs/superpowers/specs/2026-07-18-webs-grupo-tombo-design.md`

---

## 1. Resumen

Las dos webs están construidas y funcionan, y su estética gusta. El problema es la
**distribución**: comparten esqueleto sección por sección, y como los dos colapsan a una
sola columna con el mismo breakpoint, **en móvil son indistinguibles**. Lo único que
sobrevive al colapso es el color y la tipografía.

Este documento define cómo divergen. La divergencia no se inventa: se deriva de que las
dos cartas son de naturaleza opuesta y de que los dos negocios se consumen en momentos
distintos. Todo el trabajo es **mobile-first**, porque la mayoría del tráfico de un
restaurante llega desde el móvil.

---

## 2. Diagnóstico

### 2.1 El esqueleto compartido

| Sección | Cokima | Los Ochoa |
|---|---|---|
| Hero | grid `1.05fr / 0.95fr`, texto izq. + foto der. | grid `1.04fr / 0.96fr`, texto izq. + foto der. |
| 2 | manifiesto, cita en serif itálica | manifiesto, cita en serif itálica |
| 3 | picks (`MenuSection`) | tasca (foto + texto) |
| 4 | `.visita` → `dl.info` + `.mapbox`, grid `1fr / 1fr` | `.visita` → `dl.info` + `.mapbox`, grid `1fr / 1fr` |
| Nav | sticky, marca izq. + links der. | sticky, marca izq. + links der. |

Ambos heros colapsan con `@media (max-width: 860px) { grid-template-columns: 1fr }` y
ambos `.visit-grid` con `820px`. En móvil, las dos webs son la misma pila de bloques.

### 2.2 Defecto de navegación móvil

En los dos `Nav.astro`, los enlaces se ocultan por debajo de 780px y **no hay nada que los
sustituya**: ni menú hamburguesa, ni barra inferior, ni índice. En móvil solo queda la
marca y el botón de reservar. Es un defecto funcional, no estético, y se arregla aquí.

### 2.3 El sitio sin diseño es el sitio más usado

`/carta` es donde el usuario pasa la mayor parte del tiempo y es una lista estática de
secciones apiladas, idéntica en ambas marcas porque las dos pasan por el mismo
`MenuSection` de `packages/ui`.

### 2.4 Las cartas no se parecen en nada (datos reales)

| | Cokima | Los Ochoa |
|---|---|---|
| Platos | 21 | 25 |
| Secciones | 3, con nombre narrado | 1 plana (23) + postres (2) |
| Con descripción | 20 / 21 | 12 / 25 |
| Con alérgenos | 19 | 0 |
| Precio | único | ½ ración / entera (23 platos) |

**Cokima es una carta curada**: pocos platos, cada uno con relato y datos; el usuario
descubre y elige. **Los Ochoa es una lista de barra**: 23 cosas seguidas, media sin
descripción, y la decisión real no es "qué es esto" sino *"¿media o entera, y cuánto me
sale?"*; el usuario escanea y pide.

Imponerles el mismo componente a dos contenidos opuestos es la causa raíz.

---

## 3. Contexto de negocio que orienta el diseño

**La reserva es un extra, no el sustento.** Ninguno de los dos locales depende al 100% de
las reservas. La web no es un embudo de conversión: es una **herramienta de decisión**.

Hay **dos visitantes**, y la web sirve a ambos sin elegir bando:

1. **El decidido** — busca carta, horario y dónde estáis.
2. **El que está eligiendo dónde comer** — os compara con otros sitios. Enseñarle comida
   es la mitad del trabajo; que reservar no le cueste un pensamiento es la otra mitad.

Esto no invalida la capa de atribución de `packages/tracking`: sigue midiendo lo que
ocurre. Simplemente deja de ser el único KPI que ordena la página.

### 3.1 Restricción de fotografía

Habrá imágenes, y a corto plazo pueden ser generadas por IA alineadas con la paleta y el
lenguaje visual de cada marca. **Ningún layout de este documento depende de fotografía**:
las fotos son apoyo, no estructura, para que la web no quede rehén de una sesión que se
retrase.

**Límite explícito:** las imágenes generadas por IA valen como ambiente, textura o fondo.
**No** valen como bodegón de un plato concreto de la carta: una foto inventada de un plato
real es una promesa que la cocina no puede cumplir y el cliente lo nota en la mesa. Hasta
que haya foto real de un plato, se usa composición tipográfica.

---

## 4. Objetivos y no-objetivos

### Objetivos

1. Que un dedo bajando por las dos webs perciba **dos ritmos distintos** aunque se tape el
   color y la tipografía.
2. Que la comida se vea **antes de terminar la primera pantalla** en móvil.
3. Que **reservar esté a un pulgar de distancia** desde cualquier punto del scroll.
4. Arreglar la navegación móvil inexistente.
5. Que la carta —la página más usada— tenga por fin diseño propio en cada marca.

### No-objetivos

- No es un rediseño de identidad: la estética validada (Cokima oscuro "mecha encendida",
  Ochoa papel castizo) **se conserva**. Cambia la distribución, no el lenguaje visual.
- No se reescribe contenido de carta ni se inventan platos.
- No se toca la arquitectura de i18n, SEO, ni el endpoint CAPI.
- No se cambia de stack ni se introduce un framework de UI.

---

## 5. Diseño

### 5.1 La reserva: siempre a un pulgar de distancia

La reserva deja de ser una página al final del menú y pasa a ser un **elemento
persistente**, con forma distinta en cada marca:

- **Los Ochoa — barra inferior fija** desde el primer scroll: `Carta · Reservar · Llegar`.
  Nativa de móvil y encaja con un bar de paso.
- **Cokima — barra de acción inferior que aparece al superar el hero** y permanece:
  `Reservar mesa`. No compite con el hero ni molesta a quien baja a mirar platos, y está
  presente en el momento en que alguien se convence.

**Navegación móvil, marca por marca** (cierra el defecto de §2.2 en las dos):

- En **Los Ochoa**, la barra inferior *es* la navegación móvil. La cabecera se reduce a
  marca y selector de idioma.
- En **Cokima**, la barra inferior lleva solo la reserva, así que la navegación va en la
  cabecera pegajosa: los enlaces (`La carta`, `Dónde estamos`) se condensan en una fila
  compacta que permanece visible en móvil, en lugar de ocultarse como hoy. No se añade
  menú hamburguesa: con dos enlaces no compensa esconderlos tras un gesto.
- **El selector ES/EN permanece siempre visible en la cabecera** en ambas marcas: es un
  requisito de i18n y no puede quedar atrapado en un menú ni en la barra inferior.

**Sin modal.** La reserva vive en `/reservas` como página real: la necesitamos indexable y
enlazable, y el iframe de CoverManager dentro de una capa en móvil es una mala
experiencia. El elemento persistente navega a la página.

**Estado de apertura en vivo.** Junto al botón, el estado real del local calculado a partir
de los horarios ya presentes en la web: *"Abierto ahora · hasta la 1:00"* o *"Abre a las
13:00"*. A quien está eligiendo dónde comer, eso le resuelve la duda antes que cualquier
foto. Es información real: **no se usan señales de urgencia fabricadas** (nada de "quedan
2 mesas").

Los horarios se modelan como dato por marca, no como texto suelto en la plantilla, para
que el cálculo y lo que se muestra en `.visita` sean la misma fuente.

**Se calcula en el cliente, en `Europe/Madrid`.** Las páginas son estáticas y se sirven
cacheadas: si el estado se renderizara en build, un usuario vería "abierto ahora" con el
local cerrado. El horario se serializa en el HTML y el estado se resuelve en el navegador,
anclado siempre a `Europe/Madrid` y **no** a la zona horaria del dispositivo, porque el
restaurante está en Madrid abra quien abra la web. Mientras el script no ha resuelto, no
se muestra ningún estado: no se renderiza un valor por defecto que pueda ser falso.

### 5.2 Las dos homes

**Cokima — escaparate lateral.** Scroll vertical corto. El hero se comprime para que haya
comida antes de terminar la primera pantalla. Los imprescindibles se recorren **en
horizontal con scroll-snap**, como una baraja. Retícula asimétrica, con piezas que rompen
el margen. El manifiesto actual se reduce a una línea. La sensación es explorar.

**Los Ochoa — hoja de bar.** Cero scroll lateral: todo vertical y denso, separado por
reglas horizontales gruesas de cartel. De un vistazo: qué se tapea, cuánto vale, si está
abierto y dónde está. La sensación es leer la hoja que te dan en la barra.

El contraste **exploración lateral vs. densidad vertical** es lo que hace que las dos webs
se sientan distintas en el dispositivo donde hoy se sienten iguales.

### 5.3 La carta de Cokima — "la baraja"

- Tabs de sección pegajosas: *Compartir es vivir · Para terminar o no… · Postres*.
- Cada sección es una fila con **scroll-snap horizontal**; cada plato ocupa ~85% del ancho
  del viewport y asoma el siguiente, para comunicar que hay más.
- Cada plato: nombre grande, descripción (20 de 21 la tienen: es su mejor activo), precio,
  alérgenos como iconos discretos.
- En escritorio la baraja se despliega en retícula asimétrica de dos columnas desiguales.

**Filtro por alérgeno — construido pero desactivado.** Se diseña y se deja implementado
tras una bandera (`ALLERGEN_DATA_CONFIRMED`, constante en `apps/cokima/src/site.ts`, junto
a `ALLERGEN_LABELS`; en `false` hasta nuevo aviso), y **no se activa hasta que el
restaurante firme los datos de alérgenos**.
Hoy están marcados como orientativos; un filtro "sin gluten" en el que una persona celíaca
confía con datos sin confirmar es un problema de salud, no de UX. Hasta esa confirmación:
iconos visibles más la nota de "orientativos" que ya existe, sin filtro. Se añade a la
lista de pendientes del cliente junto a los accesos y los datos fiscales.

### 5.4 La carta de Los Ochoa — "la pizarra"

- Una sola columna, densa. Fila por plato: nombre a la izquierda, línea de puntos, precio
  a la derecha — el gesto de la carta impresa, bien ejecutado.
- **Toggle global ½ ración / entera**, pegajoso arriba. Al cambiarlo, los 23 precios se
  reescriben con una transición numérica corta. Es la interacción firma de la web y
  responde a la pregunta real de la mesa.
- Los platos con `half: null` se marcan explícitamente como *"solo ración entera"* en lugar
  de dejar un hueco.
- Buscador instantáneo discreto que filtra por nombre: en un bar la pregunta es *"¿tenéis
  ensaladilla?"*.
- Sin fotos: la fuerza es la densidad tipográfica y las reglas horizontales.

### 5.5 Movimiento e interacción

Principio: **la animación orienta, no actúa**. No se secuestra el scroll, no hay texto
apareciendo letra a letra, y nada retrasa la lectura de un precio.

- **View Transitions nativas** entre páginas: el mayor salto de calidad percibida por el
  menor coste.
- **JS mínimo y solo donde paga**: toggle ½/entera, buscador, estado de apertura, barra
  persistente. El resto, HTML y CSS.
- El iframe de CoverManager carga **solo** en `/reservas`, nunca en la home.
- `prefers-reduced-motion` respetado en todas las transiciones y animaciones.
- Áreas táctiles de 44px mínimo y foco visible en todo elemento interactivo.

### 5.6 Qué se comparte y qué se separa

`MenuSection` compartido es la causa directa del problema: el mismo componente para dos
cartas opuestas. Por tanto:

- **Cada app se queda su propia carta** (`baraja` en Cokima, `pizarra` en Ochoa).
- **`packages/ui` conserva solo lo genuinamente común y sin marca**: `Seo`,
  `ConsentBanner`, `BookingEmbed`, `AllergenIcons`.
- `MenuSection` y `DishRow` se retiran de `packages/ui` cuando ninguna app los use.
- Se mantiene la regla de oro: **ni un color ni una fuente de marca en `packages/ui`**;
  cada app inyecta sus tokens `--t-*`.

---

## 6. Accesibilidad y rendimiento

- Los carruseles con snap de Cokima son navegables por teclado y no atrapan el foco; el
  contenido sigue siendo alcanzable con `prefers-reduced-motion` activo.
- El toggle ½/entera y el buscador de Ochoa funcionan como controles de formulario reales,
  anunciables por lector de pantalla; el cambio de precios se notifica de forma
  no intrusiva.
- La carta debe ser legible y completa **sin JavaScript**: el toggle, el buscador y el
  filtro son mejoras progresivas sobre un documento que ya sirve.
- Objetivo de apertura rápida en 4G: sin fuentes ni scripts nuevos de terceros.

---

## 7. Riesgos

| Riesgo | Mitigación |
|---|---|
| El filtro de alérgenos se activa antes de confirmar los datos | Bandera apagada por defecto y anotado como pendiente de cliente |
| El scroll horizontal de Cokima se percibe como truco | Snap corto, siguiente elemento siempre asomando, alternativa vertical en escritorio |
| Las imágenes IA se cuelan como bodegón de plato real | Límite explícito en §3.1 |
| La barra persistente tapa contenido al final de página | Relleno inferior reservado en el layout |
| Divergir las cartas duplica mantenimiento | El dato sigue siendo compartido (`packages/content`); solo diverge la presentación |

---

## 8. Fuera de alcance / pendiente de cliente

Sin cambios respecto al diseño del 18-07, más una entrada nueva:

- **Nueva:** confirmación oficial de los datos de alérgenos de Cokima, requisito para
  activar el filtro.
- Heredadas: accesos a CoverManager, Meta Business y GTM/GA4; dominios; datos fiscales de
  las páginas legales; fotografía real; integración de Google Maps.
