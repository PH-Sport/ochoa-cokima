/** Congelar en píxeles un alto que el CSS calcula desde el viewport.
 *
 * Una portada con `height: calc(100svh …)` cambia de tamaño cada vez que el
 * navegador toca el alto del viewport, y con ella repinta el documento entero
 * (regla 16 de `docs/movimiento.md`: 55 tareas de rasterizado por diez cambios
 * de alto, contra 0 con el alto congelado). Por eso el CSS deja el `calc()`
 * como respaldo y el script lo congela en una variable.
 *
 * El congelado tiene una trampa, que costó un fallo el 2026-09-07: la primera
 * medida se toma en el instante de la carga, y si en ese instante el viewport
 * estaba en su estado grande —barra del navegador retraída, que es lo que
 * pasa al recargar estando ya bajado— se congela un alto 94px mayor del que
 * toca, y como solo se volvía a medir al cambiar el ANCHO, se quedaba así toda
 * la sesión. La imagen aparecía «más grande y ocupando más», que es como lo
 * describió Mario.
 *
 * La regla que sale de ahí: **con el mismo ancho, el alto congelado puede
 * bajar pero no subir.** Bajar es el viewport pequeño llegando tarde; subir
 * es el vaivén de barras que hay que ignorar. Un cambio de ancho —rotar—
 * empieza de cero.
 *
 * Contrato del markup: la página pone una **referencia** —un elemento fuera
 * del flujo, invisible, con el mismo `calc()` que la pieza a congelar— y se
 * observa esa referencia, no la pieza. Así el valor sin congelar se lee sin
 * quitar y volver a poner la variable, que forzaba un reflujo en cada medida,
 * y `ResizeObserver` solo avisa cuando el `calc()` da otra cosa.
 */

export interface Medida {
  /** Lo que da el `calc()` ahora mismo, en píxeles. */
  alto: number;
  /** `window.innerWidth` en el momento de medir. */
  ancho: number;
}

/** Qué alto queda congelado tras una medida nueva, o `null` si no cambia.
 *
 * Pura a propósito, para que el test cubra la decisión y el navegador solo
 * tenga que verificar el enganche.
 */
export function decideAlto(previo: Medida | null, medida: Medida): number | null {
  const alto = Math.round(medida.alto);
  if (!previo || previo.ancho !== medida.ancho) return alto;
  return alto < previo.alto ? alto : null;
}

export interface OpcionesCongelado {
  /** El elemento con el `calc()` sin congelar. Se observa su alto. */
  referencia: HTMLElement;
  /** La variable que lee la pieza congelada, p. ej. `--alto-portada`. */
  variable: string;
}

/** Observa la referencia y publica el alto congelado en el `<html>`.
 *
 * Devuelve la función que lo suelta: desconecta el observador y retira la
 * variable, para que la página siguiente del router no herede un alto ajeno.
 */
export function congelaAlto({ referencia, variable }: OpcionesCongelado): () => void {
  const raiz = document.documentElement;
  let congelado: Medida | null = null;

  const observer = new ResizeObserver((entradas) => {
    // Con varias entradas en cola solo vale la última: es la que está en pantalla.
    const alto = entradas[entradas.length - 1].contentRect.height;
    const medida = { alto, ancho: window.innerWidth };
    const nuevo = decideAlto(congelado, medida);
    if (nuevo === null) return;
    congelado = { alto: nuevo, ancho: medida.ancho };
    raiz.style.setProperty(variable, `${nuevo}px`);
  });
  observer.observe(referencia);

  return () => {
    observer.disconnect();
    raiz.style.removeProperty(variable);
  };
}
