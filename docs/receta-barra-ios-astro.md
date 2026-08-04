# La barra del navegador que vuelve a salir en el iPhone

**Qué arregla:** en Brave, Firefox o Chrome de iPhone, la barra de direcciones se recoge al
deslizar hacia abajo y **vuelve a salir entera justo al levantar el dedo**, en vez de quedarse
recogida como en cualquier otra web. En Safari no pasa.

**A quién le pasa:** a cualquier web hecha con Astro que use `<ClientRouter />` (antes
`<ViewTransitions />`). Diagnosticado y resuelto en Ochoa y Cokima el 2026-08-01.

---

## 1. La causa

El `ClientRouter` engancha el final de cada scroll y guarda la posición en el historial del
navegador. Es este trozo de `astro/dist/transitions/router.js`:

```js
const onScrollEnd = () => {
  if (history.state && (scrollX !== history.state.scrollX || scrollY !== history.state.scrollY)) {
    updateScrollPosition({ scrollX, scrollY });   // → history.replaceState()
  }
};
if ("onscrollend" in window) addEventListener("scrollend", onScrollEnd);
else { … setInterval(scrollInterval, 50) … }
```

Los navegadores de iPhone que no son Safari están obligados por Apple a envolver el `WKWebView`
del sistema, y vigilan el estado de navegación de esa vista para pintar su propia barra. No
distinguen entre «la URL ha cambiado» y «se ha reescrito el estado con la misma URL»: ante la duda,
**enseñan la barra**. Safari no lo hace porque su barra es parte del navegador, no un observador de
la vista.

WebKit no tuvo `scrollend` hasta Safari 26.2, así que en la mayoría de iPhones corre la otra rama:
un sondeo cada **50 ms**. De ahí la sensación de que la barra «espera un instante mínimo» a que
levantes el dedo.

Está reportado en Astro —[withastro/astro#12285](https://github.com/withastro/astro/issues/12285),
«causes the browser address bar to reappear every time scrolling stops»— y **cerrado sin
arreglar**: quitarlo rompería la restauración de posición al pulsar atrás, y hacerlo bien pide
rediseñar el guardado fuera del historial. Así que el arreglo hay que ponerlo en cada proyecto.

## 2. Comprobar que le afecta (30 segundos)

En el escritorio, con la web abierta, pega esto en la consola y desplázate un poco:

```js
(async () => {
  let n = 0;
  const nativo = history.replaceState;
  history.replaceState = function (...a) { n++; return nativo.apply(history, a); };
  for (const y of [700, 1400, 2100]) {
    scrollTo({ top: y, behavior: 'instant' });
    await new Promise(r => setTimeout(r, 400));
  }
  console.log('escrituras de historial al hacer scroll:', n, '· state:', JSON.stringify(history.state));
})();
```

- **`state` con un `scrollY` que va cambiando** → le afecta.
- **`state: null` y 0 escrituras** → no le afecta. (Es lo que devuelve Wikipedia.)

## 3. El arreglo

Crear `src/components/QuietScrollHistory.astro`:

```astro
---
/**
 * Que el historial no se toque mientras se hace scroll.
 *
 * El `ClientRouter` de Astro escribe la posición de scroll en el historial cada
 * vez que la página se queda quieta (`scrollend`, o un sondeo de 50 ms donde no
 * existe). En los navegadores de iPhone que no son Safari, ese `replaceState`
 * obliga a sacar la barra de direcciones: envuelven el WKWebView de Apple y
 * vigilan su estado de navegación para pintar su propia barra, sin distinguir
 * entre un cambio de URL y una reescritura del estado con la misma URL.
 *
 * Reportado en withastro/astro#12285 y cerrado sin arreglar, porque quitar ese
 * guardado sin más rompería la restauración de posición al pulsar atrás.
 *
 * Aquí no se suprime: se **retrasa**. La posición sólo hace falta cuando se
 * abandona la página, así que se retiene la escritura y se vuelca en el último
 * instante útil — al navegar, al ocultarse la pestaña, al descargarse el
 * documento —. Durante el scroll el historial no se toca y la barra se queda
 * recogida como en cualquier otra web.
 *
 * Sólo se filtra la escritura que no cambia la URL y que difiere únicamente en
 * `scrollX`/`scrollY`, que es la firma exacta del guardado de scroll. Las demás
 * llamadas del router pasan intactas, y `pushState` no se toca.
 *
 * Va `is:inline` y ANTES de `<ClientRouter />` a propósito: los módulos son
 * diferidos, así que un script clásico en el `<head>` corre siempre antes que
 * el router y llega a tiempo de envolver la función.
 */
---

<script is:inline>
  (function () {
    var nativo = history.replaceState.bind(history);
    var pendiente = null;
    // Ventana con caducidad en vez de un interruptor: si una navegación se
    // queda a medias, el filtro se recupera solo en cinco segundos.
    var navegandoHasta = 0;

    function soloCambiaElScroll(entrante, url) {
      if (url != null) return false;
      var actual = history.state;
      if (!actual || !entrante || typeof entrante !== "object") return false;
      for (var a in actual) {
        if (a === "scrollX" || a === "scrollY") continue;
        if (actual[a] !== entrante[a]) return false;
      }
      for (var b in entrante) {
        if (b === "scrollX" || b === "scrollY") continue;
        if (actual[b] !== entrante[b]) return false;
      }
      return true;
    }

    history.replaceState = function (entrante, sinUso, url) {
      if (Date.now() > navegandoHasta && soloCambiaElScroll(entrante, url)) {
        pendiente = entrante;
        return;
      }
      pendiente = null;
      return nativo(entrante, sinUso, url);
    };

    function vuelca() {
      if (!pendiente) return;
      var estado = pendiente;
      pendiente = null;
      try { nativo(estado, ""); } catch (e) {}
    }

    addEventListener("pagehide", vuelca);
    addEventListener("visibilitychange", function () {
      if (document.visibilityState === "hidden") vuelca();
    });
    document.addEventListener("astro:before-preparation", function () {
      vuelca();
      navegandoHasta = Date.now() + 5000;
    });
    document.addEventListener("astro:page-load", function () {
      navegandoHasta = 0;
    });
  })();
</script>
```

Y enchufarlo en el layout, **inmediatamente antes** de `<ClientRouter />`:

```astro
---
import { ClientRouter } from "astro:transitions";
import QuietScrollHistory from "../components/QuietScrollHistory.astro";
---
<head>
  …
  <QuietScrollHistory />
  <ClientRouter />
</head>
```

> El orden importa. Si va después, el router ya habrá capturado la función original y el parche no
> hará nada. `is:inline` también importa: sin él, Astro lo convierte en módulo y pasa a ser
> diferido, o sea que llegaría tarde.

## 4. Verificar

**En el escritorio**, sobre el build (`astro build && astro preview`), repetir el fragmento del §2:
debe dar **0 escrituras** y un `state` que no cambia al hacer scroll. Y comprobar que **el botón
atrás sigue restaurando la posición**: bajar en una página, entrar en otra, volver atrás y
comprobar que se vuelve al mismo sitio.

**En el iPhone**, con Brave: deslizar hacia abajo y soltar, en la zona media de la página. La barra
debe quedarse recogida.

## 5. Lo que se pierde

Ir atrás **y luego adelante otra vez** dentro de la misma sesión devuelve la segunda página arriba
en vez de donde estaba. Es el precio conocido —el mismo que frenó al equipo de Astro— y no afecta
al caso normal: la ida y la vuelta con el botón atrás siguen restaurando la posición, porque esa se
guarda antes de navegar y eso no se toca.

Si algún día molesta, la salida es guardar la posición en `sessionStorage` en vez de en el
historial, que es lo que se propuso en el issue de Astro.

## 6. Lo que NO era, por si se investiga de nuevo

Descartado con medición, no por intuición: `viewport-fit=cover`, `theme-color`, listeners
bloqueantes, el coste del gesto, micro-retrocesos de scroll, `overflow-x: hidden` en el body,
`scroll-behavior: smooth`, las imágenes y los cambios de altura del documento al cargarlas.

Y tres errores de método que costaron cuatro vueltas:

1. **No preguntar el dispositivo.** El nombre del navegador no dice el motor: Brave en Android es
   Chromium y Brave en iPhone es WebKit. El razonamiento cambia entero.
2. **Mezclar observaciones tomadas en estados distintos del código.** Cada observación se anota con
   su commit, y sólo se comparan las del mismo estado.
3. **Medir donde el bug no existe.** Todo se midió en Chromium de escritorio, que no reproduce nada
   de esto. Cuando el fallo es de un motor concreto, la prueba tiene que correr en ese motor —
   aunque signifique montar una página de laboratorio de dos modos y pedir treinta segundos de un
   móvil real. Eso es lo que resolvió el caso.

---

*Diagnosticado y verificado el 2026-08-01 sobre Astro 6.4.8. El caso completo, con las medidas, en
`docs/barra-del-navegador-ios.md` del monorepo de Ochoa/Cokima.*
