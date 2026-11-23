# El Inicio de Los Ochoa: las direcciones de octubre

> **Estado: cerrado** · 2026-10-28 · Mario vio las cuatro y no le convenció ninguna

## 0. Cómo terminó

Mario las vio el mismo 2026-10-28 y no se quedó con ninguna: *«Lo siento pero no me termina de
convencer ninguna...»*. Prefirió aprovechar lo que ya hay en la web y quedarse con su estructura:

- «Reservar» siempre accesible;
- los botones que parecen en 3D y se hunden al pulsar;
- los títulos con esa pequeña sombra («los que funcionan como títulos, no los textos»);
- el menú desplegable;
- el mapa en 3D.

Sobre eso pidió que la home «se sienta viva, no algo plano y estático»: algún fondo animado,
paralaje en segundo plano, elementos que vayan rotando o cambiando. Y preguntó si Mochi se había
tomado como referencia para algo. La respuesta: solo para una idea, la forma que se transforma
(«Reservar» que crece hasta ser el panel y el plato que vuela a su ficha). Ni sus muelles ni su
cambio con desenfoque, que chocan con las reglas 1 y 2 de `movimiento.md`. Y su playground no
se abrió: solo se leyó su README. Con eso delante, Mario decidió que sí: los muelles y el
desenfoque de Mochi entran en Ochoa, con una excepción a cada una de esas dos reglas. Lo que se
construyó con ello está en la rama `feat/inicio-vivo` (`estado.md` §0).

Lo que sigue en pie de aquí es la investigación (§2), que vale para lo próximo, y lo que se
aprendió de los recortes: tienen sentido como protagonistas a su tamaño real, no como adorno.

---

**Cuatro direcciones para el Inicio de Ochoa, investigadas, construidas como bocetos y puntuadas
por un revisor.** Pasaron tres: **El espejo** (7,5, la recomendada), **La vitrina** (7,3) y **El
cartel** (7,1). **La comanda** (5,7) se descartó. Están para probar en el Artifact
https://claude.ai/artifact/JPvDNM9ewd6Qe4jEUeppP2 (privado de Mario), en el móvil y en el
ordenador. La web real no ha cambiado.

## 1. Por qué se abrió

Mario vio la rama `feat/inicio-paralaje` (`estado.md` §0) y la paró el 2026-10-28:

- *«En ordenador es muy incómodo. Está extremadamente vacío, mucho aire blanco, y los PNGs siguen
  sin parecerme que estén colocados de manera distribuida, están todos pegados a los textos.»*
- *«No me puedes poner una foto tan enorme y un plato en PNG tan enano.»* Lo dijo de «Lo que hay»
  en el ordenador: la foto del cristal a todo el ancho y el cachopín en un rincón.
- *«Partimos de una buena base, pero los últimos ajustes que hemos estado haciendo entre hoy y
  ayer… no me han convencido gran cosa.»*

Pidió investigar referentes (Reddit, Dribbble, Mobbin, Awwwards), volver con varias opciones «competentes con el alto nivel
de diseño UX/UI de hoy en día», y que un subagente revisor, diseñador UX/UI, las puntuara de 0 a
10: por debajo de 7, no sirven. Puso su librería Mochi —una sola forma que se transforma— como
ejemplo de las tendencias que le interesan. Mochi es otro proyecto: aquí solo cuenta como gusto.

## 2. Lo que dijo la investigación

**Foros y estudios.** Reddit no se pudo leer: bloquea a los robots. La voz de la gente sale de
Hacker News, 2023-2026.

- **Lo básico no se entierra bajo el diseño:** carta, horario y dirección, a la vista. Es la
  queja que más se repite (p. ej. https://news.ycombinator.com/item?id=47974356).
- **La carta, como texto, en una lista que se recorra de un vistazo.** El PDF irrita
  (https://www.nngroup.com/articles/pdf-unfit-for-human-consumption/), y quien lo defiende lo
  que quiere es ver toda la carta de golpe.
- **En España, la carta es la primera referencia antes de reservar para el 75%, y el precio
  decide para el 42%.** TheFork Lab, julio de 2026, con más de 6.000 de sus usuarios:
  https://www.vinetur.com/amp/20260715104301/el-62-de-los-espanoles-descarta-un-restaurante-por-sus-malas-resenas-antes-de-reservar.html
- **A mediodía se compara con el menú del día:** 14,5 € de media en Madrid en 2025
  (https://www.esdiario.com/economia/260415/185162/estan-restaurantes-caros.html). La web de
  Ochoa no lo tiene (§6).
- **Movimiento:**
  - nada de secuestrar el scroll (https://www.nngroup.com/articles/scrolljacking-101/);
  - paralaje discreto y decorativo (https://www.nngroup.com/articles/parallax-usability/);
  - los carruseles largos casi nadie los pasa del tercero (https://www.nngroup.com/articles/mobile-carousels/);
  - los efectos de cursor, solo en el ordenador y sin quitar el puntero del sistema.

**Escaparates.** Las 21 referencias se comprobaron una a una. Dribbble y Mobbin no se pudieron ver
(bloqueo y cuenta).

- **TÒPAS** (https://bar-topas.ch/), bar de tapas, nominado en Awwwards el 2026-10-27: rojo
  bandera, letra estrecha enorme y el estado real del día siempre a la vista.
- **Sqew** (https://www.sqew.uk/), Mención de Honor en 2025: platos recortados grandes contra
  letra estrecha, que es el material de Ochoa.
- **Contramar** (https://www.contramar.com.mx/): la carta entera es la portada, con los precios
  a la derecha.
- **Muchos llevan «Reservar» fijo abajo en el móvil** (Sqew, Restaurant GEM, The Devonshire,
  Barrafina). En Ochoa no se ha hecho, por lo de §5.
- **Lo que ya delata plantilla en 2026:**
  - pantallas de carga;
  - papel con sellos;
  - letra hueca;
  - rejillas de cajas «bento»;
  - un titular con una palabra en cursiva.

## 3. Las direcciones

Tres salieron de un sorteo de estructuras de la skill de diseño, para no caer en lo de siempre:
La vitrina, La comanda y El cartel. La cuarta, El espejo, era la primera de la lista propia.

| Dirección | Qué es | Ronda 1 | Ronda 2 |
|---|---|---|---|
| **El espejo** | La carta es la portada. Arriba, el espejo real de la barra con los platos pintados a mano (`casa/barra.jpg`); debajo, la carta rotulada en blanco sobre rojo, con el precio a la altura del nombre. En el ordenador, el espejo ocupa media pantalla y cambia al plato que se señala | 6,8 | **7,5** |
| **La vitrina** | Los siete recortes, a su tamaño real: los de tres cuartos de pie en baldas de cristal contra la pared roja, y los fotografiados desde arriba tumbados en la barra. Nombre y precio pintados en la pared | 6,4 | **7,3** |
| **El cartel** | Una tira de carteles rojos y blancos, cada uno con su composición, un solo objeto grande y su lista con precios. La carta entera cabe en ellos | 6,6 | **7,1** |
| **La comanda** | Apuntas platos, suma a precios reales, la mandas por WhatsApp o reservas | 5,7 | descartada |

**Por qué se recomienda El espejo:**

- Pone la carta en la portada, que es lo primero que se viene a buscar.
- Lo hace con algo que solo tiene esta casa.
- En el ordenador no deja huecos.

Su punto flojo es que no usa los platos recortados. El gesto de La vitrina podría ir dentro de El
espejo.

**Por qué se descartó La comanda.** El revisor: como portada, resuelve algo que quien va con prisa
no busca, y parece una app de reparto. Como función dentro de otra dirección, sí sumaría.

## 4. Lo común a las cuatro

- **«Reservar» se transforma en la reserva.** El botón crece hasta ser el panel con un recorte
  desde su caja (clip-path; 420 ms al abrir y 240 al volver), se abra desde donde se abra.
- **El plato que se toca viaja a su ficha.** Desde un recorte, el recorte vuela con
  `--ease-telon` en 700 ms hasta su sitio dentro de su foto (la caja del plato, medida al
  recortarlo), y la foto entera aparece alrededor. Es el gesto que Mario eligió en el
  primer boceto y el mejor valorado. Desde una línea de texto, la foto se abre desde esa línea.
- **La carta entera, como texto** y en la propia home. Ni PDF ni carruseles.

## 5. Reglas que se mantuvieron, y lo que cuestan

- **«Reservar» sigue en la cabecera, no en una barra fija abajo.** La barra de abajo se quitó el
  2026-07-29 porque chocaba con el cartel de cookies (`archivo/2026-07-29-portadas-y-chrome-design.md`).
  Las referencias la usan. Volver a ella exigiría esconderla mientras el cartel esté a la vista;
  no se ha propuesto.
- **Ni píldoras ni scroll lateral.** Son de Cokima (`cokima-el-rediseno.md` §4 y §7; la «hoja
  de bar» vertical de Ochoa, en `archivo/2026-07-27-divergencia-layout-design.md` §5.2). Por eso
  La vitrina es un mueble con baldas, no un carrusel.
- **Sin desenfoque al aparecer.** El cambio con desenfoque de Mochi rompe la regla 2 de
  `movimiento.md`, que solo permite transform, opacity y clip-path. Si Mario lo quiere, hay que
  escribir la excepción en la regla.
- **Las listas del cartel cambian de color al pasar el ratón sin transición**, por la misma regla.

## 6. Lo que espera a Mario

- **Elegir dirección, o mezcla.** La elegida se construye en la web real, sobre una rama.
- **Decir si la casa tiene menú del día**, con su precio y lo que incluye. A mediodía es lo
  primero que se compara (§2), y `.impeccable.md` dice que hay «menú y raciones al mediodía», pero
  no está en la carta ni en ningún documento.

## 7. Cómo se puntuó, y sus límites

**El revisor y el reparto de la nota.** Lo hizo un subagente con papel de diseñador UX/UI sénior,
el mismo en las dos rondas, para que el listón no se moviera (`metodo.md` §1: cada juez nuevo lo
mueve). Puntuó sobre las capturas de móvil (motor de Safari, 390 px) y de ordenador (1440 px),
sobre las de cada gesto y sobre el código. Midió con Playwright lo que pudo. Los pesos fueron:

| Criterio | Peso |
|---|---|
| Primera impresión | 20 % |
| Carta y reserva | 25 % |
| Marca y reglas | 15 % |
| Móvil | 15 % |
| Ordenador | 15 % |
| Movimiento | 10 % |

**Los arreglos de después de la segunda ronda se midieron, pero no se volvieron a puntuar:**

| Arreglo | Antes | Después |
|---|---|---|
| La foto al abrir un plato en El espejo | Se abría fuera de la pantalla | Queda entera a la vista |
| El orden de la carta en el móvil | Postres antes que Raciones | En su orden |
| El titular del cartel en el ordenador | No llegaba a la foto | La pisa 248 px |
| Los postres de La vitrina | 57 y 95 px | 84 y 167 px |
| Platos con precio en la primera pantalla del cartel | 2 | 4 |

**Sin medir:** en un iPhone de verdad, con «reducir movimiento» y con un ratón de verdad.

**Dónde está el código.** Los bocetos se hicieron fuera del repo y su código está publicado en el
Artifact, que es su copia. Para construir la elegida, se lee de ahí.
