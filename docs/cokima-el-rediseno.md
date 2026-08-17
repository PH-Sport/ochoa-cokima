# Cokima: el rediseño

- **Abierto:** 2026-08-14 · **Última tanda:** 2026-08-17
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

### El vídeo, que ya está (2026-08-17)

Lo montó Mario en Higgsfield: **siete escenas de unos cuatro segundos** —la sala con el neón
«Orgasm, at the first bite», la barra con el sol de COKIMA, y cinco platos—. Entregado en
**1920x1080, 30 fps, 27 s y 18,5 MB**, sin pista de audio.

Llegaba con dos problemas, y ninguno es culpa del montaje: **es horizontal** y **está iluminado
como catálogo**, claro y plano. Puesto tal cual encima del póster —que es casi negro, con el neón
al fondo y solo el plato encendido— parecían dos webs distintas peleándose en la misma pantalla.

**Vertical.** Recorte central a `608x1080`, que es todo el alto del original. Y conviene entender
qué hace y qué no: en un móvil de 393x852 el `object-fit: cover` enseña **el 26% central** del
original, se recorte antes o no. **El recorte no cambia lo que se ve; cambia lo que se descarga.**
Sirviendo el 16:9 entero, tres de cada cuatro píxeles viajaban para no verse nunca. Centrado y no
desplazado porque no hay un encuadre bueno para las siete escenas: los platos quedan bien, y a los
dos neones les corta el texto —que es precisamente la banda que tapa el rótulo—.

**El grado, horneado en el archivo y no en CSS.** Un `filter` sobre un vídeo a pantalla completa
se recompone en cada fotograma; el archivo se procesa una vez. La cadena está en el commit y son
tres pasos: `eq` baja exposición y sube contraste, `curves` **baja las luces altas más en el azul
que en el rojo** —que es lo que apaga la madera clara y la cerveza sin tocar la brasa—, y una
viñeta suave cierra los bordes. Se calibró comparando fotogramas contra el póster, no a ojo: se
descartaron una versión suave (seguía siendo de día) y una fuerte (aplastaba el plato).

**Peso: de 18,5 MB a 1,05 MB en MP4 y 0,94 MB en WebM.** No compite con el LCP porque no se pide
hasta que el script lo pide: `preload="none"` y `load()` después de `astro:page-load`.

**La etiqueta `<video>` sigue sin pintarse si el archivo no está**, y esa comprobación **hubo que
rehacerla entera**: la que había no funcionaba al construir. Está contada en el §5, y es la trampa
más cara de esta tanda. Ahora los archivos viven en `src/assets/video/` y quien decide es
`import.meta.glob`, que se evalúa al compilar. La condición se queda aunque hoy haya vídeo: es lo
que sostiene que el póster mande solo cuando no hay cinta —en iPhone con ahorro de energía,
`play()` se rechaza—. La primera versión pintaba la etiqueta siempre confiando en `preload="none"`
y dejaba **cuatro 404 en la consola de cada visita**.

**Y el cartel de «falta el vídeo» ahora depende de que falte de verdad.** Estaba atado solo a
`showPhotoGuides()`, así que habría anunciado en la preview un hueco ya cubierto. Es la trampa de
siempre con las rejillas: se ponen para marcar lo que falta y hay que acordarse de que dejen de
hablar cuando deja de faltar.

**Quien no quiere movimiento no se lo descarga siquiera.** Lo preguntó Mario —«¿mantenemos la
imagen de antes para movimiento reducido y ahorro de energía?»— y al medirlo resultó que solo se
cumplía a medias: la etiqueta llevaba `autoplay`, que arranca el navegador sin pasar por el guard
del script, así que el vídeo se bajaba y se reproducía **invisible**. Se le quitó el `autoplay` y
ahora arranca solo el script. Medido en el build: en movimiento reducido, cero peticiones de red,
`readyState: 0`, `paused: true` y el póster mandando; en normal, todo como debe. Está como regla 20
en `movimiento.md`.

**En ahorro de energía, sin medir.** El póster manda igual, porque en iPhone con esa opción
`play()` se rechaza y la clase que hace visible la cinta nunca se pone. Lo que **no** está
comprobado es si la descarga llega a empezar antes del rechazo: eso solo se ve en el teléfono de
Mario, y no se ha hecho. Si importa, la vía es no llamar a `load()` y dejar que sea `play()` quien
pida los datos, para que el rechazo llegue antes que el primer byte.

**Lo que queda por mirar:** el bucle corta en seco al volver al principio —de las croquetas a la
sala—, y como el propio montaje ya cambia de escena cada cuatro segundos no desentona, pero no se
ha decidido si merece un fundido.

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

**`import.meta.url` no apunta al fuente después de empaquetar, y `dev` no lo delata.** La que más
ha costado, y no dio ni un error. La existencia del vídeo se comprobaba así:

```js
const publico = (n) => fileURLToPath(new URL(`../../public/video/${n}`, import.meta.url));
existsSync(publico("entrada.mp4"));
```

En `dev` funciona, porque ahí `import.meta.url` es el fichero fuente. **Al construir, este
componente acaba empaquetado en `dist/server/.prerender/chunks/`**, así que la ruta salía como
`dist/server/public/video/entrada.mp4` —una carpeta que no existe jamás— y la comprobación
devolvía `false` **siempre**. Medido con una sonda temporal en el build, que es lo único que lo
enseñó.

Consecuencia: el vídeo se subió, se desplegó, y en el iPhone de Mario seguía el póster. El HTML
publicado no traía `<video>` y sí traía el cartel de «falta el vídeo», encima de un vídeo que
estaba perfectamente servido en `/video/entrada.mp4`.

**Y el error de método que lo permitió: se verificó en `dev` y se dio por bueno el `build`.** El
`Complete!` del build se leyó como si fuera una verificación, y no lo es: dice que compiló, no que
el HTML diga lo que debe. **Lo que se despliega es el build, así que es el HTML del build lo que
hay que mirar** —`grep "<video" .vercel/output/static/index.html`—, igual que con la barra de iOS
se aprendió a medir en el navegador y no a leer el código.

Arreglado con `import.meta.glob(..., { eager: true, query: "?url" })` sobre `src/assets/video/`,
que resuelve el bundler al compilar y por tanto no depende de dónde acabe el módulo. Probado en las
**dos** direcciones —con los ficheros y sin ellos—, que es justo lo que nunca se había hecho: el
mecanismo viejo solo se había visto dar `false` cuando `false` era la respuesta correcta.

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
3. ~~El vídeo~~ **puesto el 2026-08-17** (§4). Queda una sola decisión suelta: si el corte del
   bucle merece un fundido.
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
