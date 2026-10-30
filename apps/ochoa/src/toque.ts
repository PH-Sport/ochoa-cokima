// Qué cuenta como tocar algo que se mueve solo. La regla 6 de docs/movimiento.md
// dice que se apaga para siempre en cuanto alguien lo toca; aquí se decide qué es
// tocarlo.
//
// LA TRAMPA, 2026-10-29. La portada y el manifiesto se apagaban con `pointerdown`
// (la portada, también con `touchstart`), y en un móvil ese evento llega en cuanto
// el dedo se apoya, también cuando se apoya para bajar la página. Desde ese mismo
// día la portada del móvil ocupa la pantalla entera bajo la cabecera, así que el
// primer gesto de cualquiera —bajar— la apagaba antes de que pasara una sola foto.
// Mario lo vio en su iPhone: «se quedan paradas y no se mueven». Reproducido en el
// simulador de iOS. En el ordenador no pasaba: la rueda del ratón no pulsa nada.
//
// La diferencia la marca el navegador: cuando se queda el gesto para desplazar la
// página, lo anuncia con `pointercancel`, y entonces ya no llega `pointerup`. Así
// que, con el dedo o el lápiz:
//  · al apoyarlo, la pieza espera (`apoya`): aún no se sabe qué es, y no debe
//    cambiar debajo de alguien que está leyendo;
//  · si el navegador lo cancela, era bajar la página, y la pieza sigue (`suelta`);
//  · si llega `pointerup`, era un toque sobre ella, y se apaga (`toca`).
// Con el ratón no hay nada que resolver: pulsar ya es tocar.
//
// El mazo de «Lo que más sale» hace lo mismo a mano, porque sus gestos de lado
// también pasan carta (Highlights.astro).

interface Manos {
  toca: () => void;
  apoya?: () => void;
  suelta?: () => void;
}

export function alTocar(el: HTMLElement, { toca, apoya, suelta }: Manos, signal: AbortSignal): void {
  const dedos = new Set<number>();
  el.addEventListener(
    "pointerdown",
    (e) => {
      if (e.pointerType === "mouse") return toca();
      dedos.add(e.pointerId);
      apoya?.();
    },
    { passive: true, signal },
  );
  el.addEventListener(
    "pointercancel",
    (e) => {
      if (dedos.delete(e.pointerId) && !dedos.size) suelta?.();
    },
    { passive: true, signal },
  );
  el.addEventListener(
    "pointerup",
    (e) => {
      if (dedos.delete(e.pointerId)) toca();
    },
    { passive: true, signal },
  );
}
