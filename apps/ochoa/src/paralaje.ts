// El paralaje del Inicio (rama de prueba `feat/inicio-paralaje`, 2026-10-28).
//
// Mario eligió en el boceto «Planos» que cada cosa vaya en su plano: lo lejano
// un poco más lento que la página y lo cercano un poco más rápido. Aquí lo lejano
// es la serie de fotos de la portada en el móvil y lo cercano, los platos
// recortados de los huecos blancos de las secciones.
//
// Cada capa lleva `data-vel`: negativa va más lenta que la página, positiva más
// rápida. Y puede llevar `data-tope`, lo más que se separa de su sitio: los
// platos llevan uno pequeño, porque con el de la portada Mario los vio
// «exageradamente notorios». Se mide contra su sección (`data-paralaje`), no
// contra sí misma, para que la capa no persiga su propio desplazamiento. El
// desplazamiento es cero cuando la sección está centrada en la pantalla, que es
// donde se compuso.
//
// Solo `transform` (regla 2 de docs/movimiento.md), un cálculo por fotograma y
// nada si se pide menos movimiento: entonces todo queda en su sitio compuesto.

/** Lo más que se separa una capa de su sitio si no dice otra cosa, en píxeles.
 *  Es el de la portada, que sobresale un 8% por arriba y por abajo para tener
 *  ese recorrido. */
const TOPE = 70;

export function montaParalaje(): (() => void) | null {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return null;
  const capas = [...document.querySelectorAll<HTMLElement>("[data-paralaje] [data-vel]")].map((el) => ({
    el,
    vel: parseFloat(el.dataset.vel ?? "0"),
    tope: el.dataset.tope ? parseFloat(el.dataset.tope) : TOPE,
    seccion: el.closest<HTMLElement>("[data-paralaje]")!,
  }));
  if (!capas.length) return null;

  let pendiente = 0;
  const mueve = () => {
    pendiente = 0;
    const centro = document.documentElement.clientHeight / 2;
    for (const { el, vel, tope, seccion } of capas) {
      const r = seccion.getBoundingClientRect();
      const d = Math.min(tope, Math.max(-tope, (r.top + r.height / 2 - centro) * vel));
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
