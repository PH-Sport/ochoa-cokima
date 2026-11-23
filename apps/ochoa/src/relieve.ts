// El relieve (2026-10-29): en el ordenador, el cursor es la luz. La sombra dura
// de los rótulos —las secciones de la barra, el rótulo de la casa y el titular de
// la portada— cae siempre hacia el lado contrario al cursor, y es más larga
// cuanto más cerca está. Mario lo eligió en la primera ronda del probador frente a
// «La chapa» y «La foto» (docs/ochoa-inicio-vivo.md).
//
// Cada pieza se marca con `data-relieve` y dice en él lo más larga que puede ser
// su sombra, en `em`. Aquí solo se publican `--relieve-x` y `--relieve-y`; la
// sombra la escribe el CSS de cada pieza con esas dos variables y su valor de
// siempre como reserva, así que sin ratón, o sin script, todo queda como estaba.
//
// Solo con ratón: el dedo no tiene posición mientras no toca, y una sombra que
// salta al sitio del toque se leería como un fallo. Cambiar `text-shadow` en
// cada fotograma es una excepción a la regla 2 de docs/movimiento.md, escrita
// allí: son cinco rótulos, solo mientras se mueve el ratón, y se para en cuanto
// la luz alcanza al cursor.

import { leeNumero } from "./compas.ts";

/** La sombra más corta, la de lo que está lejos del cursor, en `em`. */
const MINIMA = 0.03;
/** A partir de esta distancia del cursor, en píxeles, la sombra es la mínima. */
const ALCANCE = 1000;

export function montaRelieve(): (() => void) | null {
  const piezas = [...document.querySelectorAll<HTMLElement>("[data-relieve]")].map((el) => ({
    el,
    tope: parseFloat(el.dataset.relieve ?? "") || MINIMA,
  }));
  if (!piezas.length) return null;

  /* Con «reducir movimiento» la sombra va directa al sitio, sin el deslizamiento:
     responde al cursor igual, pero sin moverse por su cuenta entre medias. */
  const suave = matchMedia("(prefers-reduced-motion: reduce)").matches ? 1 : leeNumero("--relieve-suave") || 1;
  const abort = new AbortController();
  const { signal } = abort;

  let luz: { x: number; y: number } | null = null;
  let sigue: { x: number; y: number } | null = null;
  let pedido = 0;

  const pinta = () => {
    pedido = 0;
    if (!luz) return;
    if (!sigue) sigue = { ...luz };
    sigue.x += (luz.x - sigue.x) * suave;
    sigue.y += (luz.y - sigue.y) * suave;
    for (const { el, tope } of piezas) {
      const r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight || r.width === 0) continue;
      const dx = r.left + r.width / 2 - sigue.x;
      const dy = r.top + r.height / 2 - sigue.y;
      const d = Math.hypot(dx, dy) || 1;
      const largo = MINIMA + (tope - MINIMA) * Math.max(0, 1 - d / ALCANCE);
      el.style.setProperty("--relieve-x", `${((dx / d) * largo).toFixed(3)}em`);
      el.style.setProperty("--relieve-y", `${((dy / d) * largo).toFixed(3)}em`);
    }
    /* Mientras la luz no haya alcanzado al cursor, otro fotograma; después,
       nada hasta que se mueva otra vez. */
    if (Math.abs(luz.x - sigue.x) > 0.5 || Math.abs(luz.y - sigue.y) > 0.5) pide();
  };
  const pide = () => {
    if (!pedido) pedido = requestAnimationFrame(pinta);
  };

  addEventListener(
    "pointermove",
    (e) => {
      if (e.pointerType !== "mouse") return;
      luz = { x: e.clientX, y: e.clientY };
      pide();
    },
    { passive: true, signal },
  );
  /* Al bajar, el titular se mueve respecto al cursor aunque el cursor no se mueva. */
  addEventListener("scroll", pide, { passive: true, signal });

  return () => {
    abort.abort();
    if (pedido) cancelAnimationFrame(pedido);
  };
}
