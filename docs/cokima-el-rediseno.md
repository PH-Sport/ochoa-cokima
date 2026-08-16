# Cokima: el rediseño

- **Abierto:** 2026-08-14 · **Última tanda:** 2026-08-16
- **Rama:** `tmp/entrada-cokima` (temporal, pendiente del visto bueno de Mario)
- **Estado:** la landing está construida. Lo que va debajo, sin decidir.

Este documento explica **por qué** Cokima se está rehaciendo y por qué se ha descartado casi todo
lo que se propuso antes de llegar aquí. Si vas a seguir el trabajo, léelo entero antes de tocar
`Entrada.astro`: la mitad de las decisiones parecen arbitrarias hasta que sabes qué se probó y se
tiró.

---

## 1. El problema, y no era el que parecía

Cokima llevaba desde la fase 2 sin tocarse mientras Ochoa se llevaba la tipografía, la carta, las
fotos reales y tres iteraciones de portada. El diagnóstico obvio era «Cokima está sin desmenuzar»,
y con ese diagnóstico se hizo lo obvio: buscar material y proponer piel nueva —paleta, fotos,
tipografía—.

**Mario lo paró.** Su objeción: las secciones seguían siendo las mismas que las de Ochoa. Al
comprobarlo resultó ser literal, no una impresión:

```
Ochoa:   Hero → Highlights → Ticker → manifiesto → tasca → casa → visita
Cokima:  Hero → Highlights →          manifiesto →         casa → visita
```

Los mismos nombres de clase (`manifesto`, `casa`, `visita`) y los mismos cuatro componentes
compartidos (`Hero`, `Highlights`, `Nav`, `Footer`). **Cokima era Ochoa con dos secciones menos.**
Cambiar colores y fotos sobre eso no iba a arreglarlo nunca.

### Las cinco palancas

Lo que hace que dos webs se sientan iguales no es el color. Son cinco cosas, y las cinco estaban
calcadas:

| Palanca | Qué era en las dos |
|---|---|
| **El eje** | vertical, apilado, dentro de una columna centrada de ancho fijo |
| **La unidad de contenido** | un plato = foto cuadrada + nombre a la izquierda + precio a la derecha |
| **El ritmo** | todas las secciones con el mismo aire, todas abriendo con etiqueta + titular |
| **La navegación** | cabecera fija, logo izquierda, hamburguesa derecha |
| **El suelo** | un solo fondo de principio a fin |

De las cinco, **la que más pesa es la unidad de contenido**. Mientras un plato se dibuje igual en
las dos casas, se sentirán la misma web aunque cambie todo lo demás.

---

## 2. La distinción que ordena todo

La dio Mario y es la clave de la que cuelga el resto:

> **Ochoa** es *«pido lo de siempre, me siento y a charlar con mi gente»*.
> **Cokima** *«trata de ser más una experiencia, más pícara, pero experiencia»*.

Ochoa es **transacción social**: la web apilada y directa le pega, porque su trabajo es no
estorbar. Cokima es **experiencia con picardía**, y un índice de secciones no cuenta eso.

Traducido a estructura: *experiencia* significa que la página tiene un **antes y un después** en
vez de un índice, y *pícara* significa que **insinúa antes de enseñar**.

---

## 3. Lo que se propuso y se descartó

Queda escrito para que nadie lo vuelva a proponer sin saber que ya se miró.

**Tres direcciones de piel** (14 de agosto) — *El mural*, *La pared de polaroids*, *El neón*.
Descartadas por Mario: buena piel sobre el esqueleto de Ochoa. Siguen siendo válidas como
paleta y como uso de las fotos, y el material que sacaron se conserva.

**Tres esqueletos** (14 de agosto) — planos en gris, sin color ni fotos, para juzgar el hueso:

1. *A dos voces* — dos capas: la mesa ordenada sobre la pared descarada.
2. *La noche avanza* — la página no tiene secciones, tiene horas: de la luz de la calle a
   medianoche, con el suelo oscureciéndose.
3. *Se destapa* — un tablero de piezas tapadas que se destapan. **Descartado**: en móvil no
   existe el pasar por encima y esconder el precio va contra la razón por la que la gente entra.

**Mario eligió el 2 y luego cambió el planteamiento.** Trajo una referencia de app —foto a
pantalla completa, dos botones abajo— y decidió construir sobre eso, por orden, empezando por la
landing. Su frase: *«olvídate del diseño que tenemos actualmente»*.

**Lo que sobrevive del esqueleto 2 y conviene no perder de vista:** el reloj. `OpenState` ya
calcula si el restaurante está abierto con su horario real, y hoy es una etiqueta pequeña. En
aquella dirección pasaba a ser el eje de la página. Es la única pieza compartida con Ochoa que
tenía sentido conservar, porque es lógica y no forma.

> Los bocetos están en artifacts privados de la cuenta de Mario. Un agente no puede abrirlos; él
> sí. Piezas de piel: `b237e791-60f1-4107-b17c-8ed219fdd209`. Esqueletos:
> `50dfedae-4f66-4bbf-a0d6-2e445a633109`. Móvil del esqueleto 2:
> `23d1ffdc-443e-44ad-8414-254363c7d0e1`.

---

## 4. La landing, y por qué cada cosa está donde está

`apps/cokima/src/components/Entrada.astro`. Sustituye al `Hero` heredado. La pantalla entera es el
plato, el nombre en el medio, dos botones abajo, y **nada más**.

### Lo que NO está, y es deliberado

Mario, textualmente: *«hay muchas cosas en la landing. Solo deben estar los dos botones. Ni texto,
menú hamburguesa, nombre... nada»*. Están fuera, y aparecen al deslizar:

- el rótulo y la hamburguesa de la cabecera,
- su botón de «Reservar» (abajo ya hay uno a tamaño de pulgar),
- **el cartel de cookies**,
- el aviso de que falta el vídeo.

**No erosionar esto añadiendo «solo una cosita más».** Es la decisión de diseño de la pantalla.

El nombre en el centro llegó después, y no contradice lo anterior: lo que Mario quitó fue el
claim y el rótulo pequeño de la barra; lo que puso es la marca como pieza de composición.

### El cartel de cookies

Baja con el resto. **No hay pega legal**: la obligación es no instalar cookies no esenciales antes
del consentimiento, y aquí no se instala ninguna hasta aceptar (`Base.astro`, spec §10). Mientras
nadie baje no ha pasado nada que anunciar. Quien pulse «Reservar» sin bajar verá el cartel en la
página de reservas.

La regla vive en `apps/cokima/src/styles/global.css`, **no en `@tombo/ui`**: el cartel es de las
dos casas y esto es una decisión de esta.

### La curvatura: donde vive el contraste entre las dos casas

Ochoa tiene cuatro radios que crecen con la pieza (4 / 7 / 9 / 12) y su comentario dice que dejan
de crecer *«donde seguir subiendo la convertiría en una pastilla»*. **Cokima toma la decisión
contraria en ese mismo eje:**

```
lo que se PULSA  → píldora siempre (--r-control). El radio no es un valor: es la mitad
                   de la altura, así que un botón alto y uno bajo salen igual de redondos.
lo que se MIRA   → escala de tres pasos: --r-caja 10, --r-panel 14, --r-marco 20.
```

Antes había un `6px` plano, igual para un botón que para una tarjeta: un radio único para piezas
de todos los tamaños, que es justo lo que la escala de Ochoa evita. Era una deuda real.

### El vídeo que todavía no existe

Mario lo monta en Higgsfield a partir de cuatro fotos de plato. Van en
`apps/cokima/public/video/entrada.mp4` (y `.webm` si lo hay).

**La etiqueta `<video>` no se pinta hasta que el archivo esté**, y se comprueba al construir con
`existsSync`. La primera versión la pintaba siempre confiando en `preload="none"` y dejaba **cuatro
404 en la consola de cada visita** —el navegador pide las dos fuentes y el script las volvía a
pedir al llamar a `load()`—. Con la comprobación, hoy se ve el póster y el día que aparezca el
archivo se ve el vídeo, sin tocar nada.

El póster no es un fotograma cualquiera: es una foto procesada como cualquier otra de la casa,
porque **en iPhone con el ahorro de energía activado `play()` se rechaza aunque el vídeo esté
silenciado**, y entonces el póster es lo único que se ve. Lo mismo para quien pida menos
movimiento.

### El movimiento: dos piezas, y las dos con la misma doctrina

Mario pidió botones «vivos» y una animación de scroll, y en las dos avisó de **evitar los patrones
típicos de IA**. Lo típico —el brillo que barre, el halo que late, el borde de degradado girando,
el ratoncito con la ruedita, la flecha que rebota— se reconoce antes de entenderse, porque tiene
**cadencia** y porque el gesto no significa nada.

Las dos piezas salen del mundo del local, que es de brasa y de neón. Están explicadas en
`movimiento.md` (reglas 18 y 19 y la tabla de qué se mueve).

---

## 5. Las trampas que costaron tiempo

Todas aparecieron **midiendo en el navegador**, ninguna leyendo el código.

**La entrada no ocupaba la pantalla.** La cabecera es `sticky` y reserva sus 61px en el flujo
aunque parezca flotar: la sección terminaba en y=904 con una ventana de 844, el centinela nunca
entraba en pantalla y la cabecera no se volvía transparente jamás. Se sube con
`margin-top: calc(-1 * var(--t-header-h))`.

**El texto sobre la foto no llegaba al contraste.** El claim daba 2,13:1 cuando un titular de 40px
necesita 3:1. Los topes del velo se recalcularon sobre la **posición medida** del texto, no a ojo.
Y se le añadió una sombra ancha y difusa pensando en el vídeo: **cuando el fondo cambie en cada
fotograma no habrá degradado que sirva para todos**.

**Doble recorte en las portadas de los bocetos.** Se recortaba la foto y luego el CSS la recortaba
otra vez, y eso se comía justo el sujeto. La imagen se prepara a la proporción exacta de su hueco.

**El mínimo automático de un track de grid**, tres veces en un día: un hijo ancho ensancha su
columna y arrastra a todos sus hermanos. Se arregla con `min-width: 0`. Ya estaba documentado para
las retículas de Cokima y volvió a morder en sitios nuevos.

**Un falso negativo propio.** Al comprobar si el rescoldo se pausaba fuera de pantalla salió que
no. Era el test: había tocado la animación por la Web Animations API y **eso la desincroniza del
`animation-play-state` del CSS**. En página limpia funcionaba. Antes de creer un resultado raro,
comprobar que el instrumento no lo está causando.

**El checkpoint de Vercel.** Sondear la preview en bucle (50 intentos) activó su anti-bot, y a
partir de ahí devuelve `403` a curl y a Playwright. Los greps siguen «funcionando» —devuelven cero
coincidencias— y eso se lee como «no se ha desplegado». El estado de un build se pregunta a la
API (`list_deployments` → `state: READY`), no martilleando la URL.

---

## 6. Por dónde seguir

1. **Qué va debajo de la entrada.** Es la decisión grande y está sin tomar. Hoy debajo sigue la
   portada vieja (`Highlights`, manifiesto, casa, visita), que es exactamente el esqueleto de
   Ochoa que se quería tirar. **Es lo siguiente que hay que hablar con Mario**, y él ya dijo
   «enseguida vamos con lo que ocurre al scrollear».
2. **Decidir si el rótulo del centro se queda al bajar.** En cuanto aparece el «Cokima» de la
   barra, están los dos a la vez.
3. **El vídeo**, cuando Mario lo tenga.
4. **`Hero.astro` y `Embers.astro` quedan huérfanos** a propósito. No se borran hasta que el
   rediseño cierre.
5. **El `hreflang` de las tres legales de Cokima** sigue roto: declaran que su versión inglesa es
   la home inglesa. El arreglo es `altSeoPath={null}` y su `Base.astro` necesita la prop, igual
   que se hizo en Ochoa el 31 de julio. No se ha tocado porque queda fuera de este hilo.
6. **Diez de las doce fotos de plato siguen sin identificar.** Ver `fotografia.md`.

## 7. Lo que no hay que volver a discutir

- Que Cokima y Ochoa compartan estructura. Ese fue el problema entero.
- La píldora en los controles de Cokima. Está fundada en la decisión contraria de Ochoa.
- Poner cosas en la landing. Solo el nombre y los dos botones.
- El ratoncito de scroll y la flecha que rebota.
