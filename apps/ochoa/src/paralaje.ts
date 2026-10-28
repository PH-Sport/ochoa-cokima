// El paralaje del Inicio (rama de prueba `feat/inicio-paralaje`, 2026-10-28).
//
// Mario eligió en el boceto «Planos» que cada cosa vaya en su plano: lo lejano
// un poco más lento que la página y lo cercano un poco más rápido. Aquí lo lejano
// es la serie de fotos de la portada y lo cercano, los platos recortados que se
// asoman por las esquinas de las fotos de las secciones.
//
// Cada capa lleva `data-vel`: negativa va más lenta que la página, positiva más
// rápida. Se mide contra su sección (`data-paralaje`), no contra sí misma, para
// que la capa no persiga su propio desplazamiento. El desplazamiento es cero
// cuando la sección está centrada en la pantalla, que es donde se compuso.
//
// Solo `transform` (regla 2 de docs/movimiento.md), un cálculo por fotograma y
// nada si se pide menos movimiento: entonces todo queda en su sitio compuesto.

/** Lo más que se separa una capa de su sitio, en píxeles. Más, y un plato se
 *  mete en el texto que tiene al lado. */
const TOPE = 70;

export function montaParalaje(): (() => void) | null {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return null;
  const capas = [...document.querySelectorAll<HTMLElement>("[data-paralaje] [data-vel]")].map((el) => ({
    el,
    vel: parseFloat(el.dataset.vel ?? "0"),
    seccion: el.closest<HTMLElement>("[data-paralaje]")!,
  }));
  if (!capas.length) return null;

  let pendiente = 0;
  const mueve = () => {
    pendiente = 0;
    const centro = document.documentElement.clientHeight / 2;
    for (const { el, vel, seccion } of capas) {
      const r = seccion.getBoundingClientRect();
      const d = Math.min(TOPE, Math.max(-TOPE, (r.top + r.height / 2 - centro) * vel));
      el.style.transform = `translate3d(0, ${d.toFixed(1)}px, 0)`;
    }
  };
  const pide = () => {
    if (!pendiente) pendiente = requestAnimationFrame(mueve);
  };
  addEventListener("scroll", pide, { passive: true });
  addEventListener("resize", pide);
  mueve();

  return () => {
    removeEventListener("scroll", pide);
    removeEventListener("resize", pide);
    if (pendiente) cancelAnimationFrame(pendiente);
  };
}
