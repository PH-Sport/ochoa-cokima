// El paralaje del Inicio (rama `feat/inicio-vivo`, 2026-10-28: «paralaje en
// segundo plano»).
//
// Cada cosa en su plano: lo lejano, un poco más lento que la página. Aquí lo
// lejano son las fotos de fondo —la serie de la portada, la mesa de La tasca y la
// pared del manifiesto—; nada de primer plano se mueve por su cuenta. Viene de la
// rama `feat/inicio-paralaje`, donde también movía platos recortados.
//
// Cada capa lleva `data-vel`: negativa va más lenta que la página, positiva más
// rápida. Y puede llevar `data-tope`, lo más que se separa de su sitio: los
// platos llevan uno pequeño, porque con el de la portada Mario los vio
// «exageradamente notorios». Se mide contra su sección (`data-paralaje`), no
// contra sí misma, para que la capa no persiga su propio desplazamiento. El
// desplazamiento es cero cuando la sección está centrada en la pantalla, que es
// donde se compuso.
//
// NUNCA MÁS DE LO QUE LE SOBRA. Cada capa sobresale de su sección un tanto por
// ciento de su alto, y ese es todo su recorrido: el tope en píxeles no basta,
// porque la sección encoge con la pantalla. La mesa de La tasca llevaba 22 px de
// tope y en un móvil de 390 px le sobran 15: medido el 2026-10-29, a más de 200 px
// del centro de la pantalla asomaba el fondo, 6,5 px por abajo o por arriba
// dentro del marco. Así que el tope se recorta, en cada fotograma, a lo que de
// verdad sobra.
//
// LA VENTANA (2026-10-29, Mario en su iPhone). La foto que lleva `data-ventana`
// se mira como las de La casa: con el ratón encima se asoma un poco al lado
// contrario (`ASOMA`, lo mismo que en `mosaico.ts`), y en una pantalla sin ratón
// va con `data-vel-tacto` en vez de con `data-vel`, que se nota algo más, y
// frenando suave antes de llegar a su borde en vez de pararse en seco
// (`enSuVentana`). «Que reaccione al scroll, no al dedo»: nada sigue al dedo.
//
// Solo `transform` y `translate` (regla 2 de docs/movimiento.md), un cálculo por
// fotograma y nada si se pide menos movimiento: entonces todo queda en su sitio
// compuesto.

/** Lo más que se separa una capa de su sitio si no dice otra cosa, en píxeles.
 *  Es el de la portada, que sobresale un 8% por arriba y por abajo para tener
 *  ese recorrido. */
const TOPE = 70;
/** Lo que se asoma con el ratón encima una foto con `data-ventana`, en píxeles. */
const ASOMA = { x: 10, y: 8 };

/** Cuánto se desplaza una foto en su ventana al bajar, en una pantalla sin
 *  ratón: `vel` por la distancia al centro de la pantalla mientras queda sitio, y
 *  cada vez menos según se acerca a lo que le sobra (`hasta`), sin llegar a
 *  pasarlo ni pararse en seco. */
export function enSuVentana(dist: number, vel: number, hasta: number): number {
  return hasta > 0 ? hasta * Math.tanh((dist * vel) / hasta) : 0;
}

export function montaParalaje(): (() => void) | null {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return null;
  const sinRaton = matchMedia("(hover: none)");
  const capas = [...document.querySelectorAll<HTMLElement>("[data-paralaje] [data-vel]")].map((el) => ({
    el,
    vel: parseFloat(el.dataset.vel ?? "0"),
    velTacto: el.dataset.velTacto ? parseFloat(el.dataset.velTacto) : null,
    tope: el.dataset.tope ? parseFloat(el.dataset.tope) : TOPE,
    ventana: el.hasAttribute("data-ventana"),
    seccion: el.closest<HTMLElement>("[data-paralaje]")!,
    arriba: 0,
    abajo: 0,
  }));
  if (!capas.length) return null;
  const abort = new AbortController();
  const { signal } = abort;

  /* Lo que sobresale cada capa por arriba y por abajo de lo que recorta su
     sección, medido en la página y no deducido del CSS: WebKit, el motor del
     iPhone, resuelve el `height: 116%` de la mesa contra la caja con el borde y
     el `top: -8%` contra la de dentro, así que allí le sobran 15,5 px por arriba
     y 20 por abajo (Chromium, 15,5 y 15,5; medido el 2026-10-29). Suponerla
     centrada destapaba 1,5 px en el iPhone. Se mide sin el desplazamiento del
     paralaje y descontando lo que la haya movido el ratón, al montar y cada vez
     que una sección cambia de tamaño. */
  const mide = () => {
    for (const c of capas) {
      const antes = c.el.style.transform;
      c.el.style.transform = "none";
      const s = c.seccion.getBoundingClientRect();
      const e = c.el.getBoundingClientRect();
      const t = getComputedStyle(c.el).translate;
      const ty = t === "none" ? 0 : parseFloat(t.split(" ")[1] ?? "0") || 0;
      c.el.style.transform = antes;
      const dentro = s.top + c.seccion.clientTop;
      c.arriba = dentro - (e.top - ty);
      c.abajo = e.bottom - ty - (dentro + c.seccion.clientHeight);
    }
  };

  let pendiente = 0;
  const mueve = () => {
    pendiente = 0;
    const centro = document.documentElement.clientHeight / 2;
    const tacto = sinRaton.matches;
    for (const { el, vel, velTacto, tope, ventana, seccion, arriba, abajo } of capas) {
      const r = seccion.getBoundingClientRect();
      const dist = r.top + r.height / 2 - centro;
      const v = tacto && velTacto !== null ? velTacto : vel;
      /* Hacia abajo se gasta lo que sobra por arriba, y al revés; menos un píxel
         y, si la foto se asoma también con el ratón, menos lo que se asoma. */
      const reserva = 1 + (ventana && !tacto ? ASOMA.y : 0);
      const lim = Math.max(0, Math.min(tope, (dist * v > 0 ? arriba : abajo) - reserva));
      const d = tacto && velTacto !== null ? enSuVentana(dist, v, lim) : Math.min(lim, Math.max(-lim, dist * v));
      el.style.transform = `translate3d(0, ${d.toFixed(1)}px, 0)`;
    }
  };
  const pide = () => {
    if (!pendiente) pendiente = requestAnimationFrame(mueve);
  };
  addEventListener("scroll", pide, { passive: true, signal });
  addEventListener("resize", pide, { signal });
  sinRaton.addEventListener("change", pide, { signal });
  const ojoTam = new ResizeObserver(() => {
    mide();
    pide();
  });
  capas.forEach((c) => ojoTam.observe(c.seccion));
  mide();
  mueve();

  /* Con el ratón encima, la foto se asoma al lado contrario, como vista por una
     ventana. Va en `translate`, que se suma al `transform` del paralaje sin
     pisarlo, y su transición es la de las teselas de La casa. */
  for (const { el, ventana, seccion } of capas) {
    if (!ventana) continue;
    seccion.addEventListener(
      "pointermove",
      (e) => {
        if (e.pointerType !== "mouse") return;
        const r = seccion.getBoundingClientRect();
        const fx = Math.min(1, Math.max(-1, (e.clientX - (r.left + r.width / 2)) / (r.width / 2)));
        const fy = Math.min(1, Math.max(-1, (e.clientY - (r.top + r.height / 2)) / (r.height / 2)));
        el.style.translate = `${(-fx * ASOMA.x).toFixed(1)}px ${(-fy * ASOMA.y).toFixed(1)}px`;
      },
      { passive: true, signal },
    );
    seccion.addEventListener("pointerleave", () => (el.style.translate = ""), { signal });
  }

  return () => {
    abort.abort();
    ojoTam.disconnect();
    if (pendiente) cancelAnimationFrame(pendiente);
  };
}
