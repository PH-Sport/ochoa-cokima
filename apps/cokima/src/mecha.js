// LA MECHA de Visítanos (2026-11-04). Mario la eligió en una maqueta, entre tres, para una sección que veía
// «muy plana»: las calles reales de Argüelles a oscuras y una mecha desde cada uno de los cuatro metros más
// cercanos, que arden por donde se llega andando y llegan a la vez a Cokima. Entonces la luz se abre por el barrio
// y se queda baja. Lo que se descartó y por qué, en docs/cokima-el-rediseno.md §3, «Visítanos: La mecha». Las calles
// y los caminos los genera scripts/mapa-barrio.py desde OpenStreetMap.
//
// Es un lienzo, como las chispas: 2.000 polígonos no se mueven con transform. Tres capas: el barrio apagado, ya
// pintado; el barrio encendido, que se ve solo a través de la luz de cada mecha; y las mechas encima. La cabeza no
// lleva halo, porque Mario ya paró el brillo sobrado en las chispas: lo que alumbra son las calles de alrededor.
//
// EL TIEMPO SE CUENTA DESDE QUE SE VE (regla 32 de movimiento.md). En la maqueta contaba desde que arrancaba, y la
// mecha más larga arrancaba fuera de la pantalla: en el móvil pasaban 1,17 s sin que se viera nada, que es lo primero
// que dijo Mario. Ahora la que más tramo tiene a la vista entra en cuanto se abre la sección, y las demás se reparten
// para llegar a la vez. Lo que queda tapado por el título arde igual, a su paso, sin contar para el tiempo.
//
// Corre una vez cada vez que se abre Visítanos, y solo a la vista: si se baja hasta perderla, se pone el final y se
// para (regla 6). Con «reducir movimiento», el final y nada más. Sin datos o sin lienzo, la escena se queda en el
// título y el nombre de Cokima, y la ficha de debajo no depende de nada de esto.
import urlMapa from "./data/mapa-barrio.json?url";

const halo = (() => {
  let c;
  return () => {
    if (c) return c;
    c = document.createElement("canvas"); c.width = c.height = 128;
    const x = c.getContext("2d"), g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
    for (let i = 0; i <= 10; i++) { const t = i / 10; g.addColorStop(t, `rgba(255,255,255,${(1 - t * t * (3 - 2 * t)).toFixed(3)})`); }
    x.fillStyle = g; x.fillRect(0, 0, 128, 128);
    return c;
  };
})();
const tramo = (x, a, b) => Math.min(1, Math.max(0, (x - a) / (b - a)));
const suave = (t) => t * t * (3 - 2 * t);
const mezcla = (a, b, t) => a + (b - a) * t;

export const montarMecha = ({ leeMs, token, tono, brotar }) => {
  const caja = document.querySelector(".mecha");
  if (!caja) return { activar() {} };
  caja.dataset.viva = "1";
  const cv = caja.querySelector(".mapa"), cx = cv.getContext("2d");
  const sinMov = matchMedia("(prefers-reduced-motion: reduce)").matches;
  // La misma condición que en brasa.css, donde se coloca Cokima (.destino).
  const ANCHA = matchMedia("(min-aspect-ratio: 21/20)");
  const apagar = () => caja.classList.remove("arde");
  if (!cx) { apagar(); return { activar() {} }; }
  const dim = document.createElement("canvas"), lit = document.createElement("canvas"), mas = document.createElement("canvas");
  // Entrando directo, ya viene pedido desde el HTML (visitanos.astro).
  const datos = window.mapaBarrio || fetch(urlMapa).then((r) => r.json()).catch(() => null);

  let MAPA = null, W = 0, H = 0, D = 1, S = 1, FX = 0, FY = 0, T = 0, B = 0, v = 0, mechas = [];
  let activa = false, corriendo = false, hecho = false, llegada = false, enVista = false, t0 = 0, id = 0;
  const X = (m) => FX + m * S, Y = (m) => FY - m * S;

  const traza = (ruta, a, cierra) => {
    for (let i = 0; i < a.length; i += 2) { if (i) ruta.lineTo(X(a[i]), Y(a[i + 1])); else ruta.moveTo(X(a[i]), Y(a[i + 1])); }
    if (cierra) ruta.closePath();
  };

  // Lo que no cambia en toda la escena: el barrio apagado con sus nombres, y el encendido.
  const capaApagada = (eds, calles, anchos) => {
    const x = dim.getContext("2d"), bone = token("--bone"), letra = token("--sans"), ancha = ANCHA.matches;
    x.setTransform(D, 0, 0, D, 0, 0); x.clearRect(0, 0, W, H);
    x.lineCap = "round"; x.lineJoin = "round";
    x.fillStyle = x.strokeStyle = bone;
    x.globalAlpha = 0.035; x.fill(eds);
    x.globalAlpha = 0.13; for (let k = 1; k <= 3; k++) { x.lineWidth = anchos[k]; x.stroke(calles[k]); }
    x.globalAlpha = 0.42; x.font = `400 10px ${letra}`; x.textAlign = "center"; x.textBaseline = "middle";
    for (const t of MAPA.t) {
      const a = X(t.x), b = Y(t.y);
      if (a < 30 || a > W - 30 || b < 30 || b > H - 20) continue;
      // En el móvil, dos de los nombres caen donde está el de Cokima.
      if (!ancha && /Mel|Guzm/.test(t.t)) continue;
      x.save(); x.translate(a, b); x.rotate(-t.a); x.fillText(t.t, 0, -6); x.restore();
    }
    x.font = `500 9.5px ${letra}`;
    try { x.letterSpacing = "1.5px"; } catch (e) {}
    for (const f of mechas) {
      // El rótulo, donde la mecha entra en la pantalla si sale de fuera; y si queda bajo el título, ninguno.
      let i = 0;
      while (i < f.p.length - 1 && (f.p[i][0] < 8 || f.p[i][0] > W - 8 || f.p[i][1] < 8 || f.p[i][1] > H - 8)) i++;
      const [a, b] = f.p[i], enSuSitio = i === 0;
      if (!ancha && b < H * 0.45) continue;
      if (enSuSitio) { x.globalAlpha = 0.7; x.lineWidth = 1; x.beginPath(); x.arc(a, b, 3, 0, 6.3); x.stroke(); }
      const txt = `Metro ${f.n}`.toUpperCase(), w = x.measureText(txt).width, izq = a + 8 + w > W - 10;
      x.globalAlpha = 0.62; x.textAlign = izq ? "right" : "left";
      x.fillText(txt, Math.max(10 + (izq ? w : 0), Math.min(W - 10 - (izq ? 0 : w), izq ? a - 8 : a + 8)), b + (enSuSitio ? 0 : -13));
    }
    x.globalAlpha = 1; try { x.letterSpacing = "0px"; } catch (e) {}
  };
  const medir = () => {
    W = caja.clientWidth; H = caja.clientHeight; D = Math.min(devicePixelRatio || 1, 2);
    const ancha = ANCHA.matches;
    S = ancha ? Math.min(H / 1400, W / 2400) : Math.max(0.36, Math.min(0.62, W / 930));
    FX = caja.querySelector(".destino").offsetLeft; FY = caja.querySelector(".destino").offsetTop;
    for (const c of [cv, dim]) { c.width = Math.round(W * D); c.height = Math.round(H * D); }
    for (const c of [lit, mas]) { c.width = W; c.height = H; }
    const eds = new Path2D(), calles = [0, 1, 2, 3].map(() => new Path2D());
    for (const a of MAPA.e) traza(eds, a, true);
    for (const [k, a] of MAPA.c) traza(calles[k], a, false);
    const anchos = [0, 0.7, 1.15, 1.9].map((a) => a * Math.max(0.8, S / 0.42));

    // Dónde arde cada una, y desde cuándo se le ve: lo que importa es lo que se ve (regla 32).
    const aLaVista = ancha ? (x, y) => x >= W * 0.34 && x <= W && y >= 0 && y <= H : (x, y) => x >= 0 && x <= W && y >= H * 0.46 && y <= H;
    mechas = MAPA.r.map((r) => {
      const p = []; for (let i = 0; i < r.p.length; i += 2) p.push([X(r.p[i]), Y(r.p[i + 1])]);
      const d = [0]; for (let i = 1; i < p.length; i++) d.push(d[i - 1] + Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]));
      return { n: r.n, p, d, L: d[d.length - 1], d0: 0, ini: 0, dist: 0 };
    });
    for (const f of mechas) { let q = 0; while (q < f.L) { const [a, b] = punto(f, q); if (aLaVista(a, b)) break; q += 4; } f.d0 = Math.min(q, f.L); }
    T = Math.max(0, leeMs("--dur-mecha") || 0); B = Math.max(0, leeMs("--dur-mecha-barrio") || 0);
    const larga = Math.max(...mechas.map((f) => f.L - f.d0));
    v = T ? larga / T : 0;
    for (const f of mechas) f.ini = v ? T - (f.L - f.d0) / v : 0;

    capaApagada(eds, calles, anchos);
    const xl = lit.getContext("2d");
    xl.clearRect(0, 0, W, H); xl.lineCap = "round"; xl.lineJoin = "round";
    xl.fillStyle = token("--mecha-casa"); xl.globalAlpha = 0.26; xl.fill(eds);
    xl.strokeStyle = token("--mecha-calle"); xl.globalAlpha = 0.72; for (let k = 1; k <= 3; k++) { xl.lineWidth = anchos[k]; xl.stroke(calles[k]); }
    xl.globalAlpha = 1;
    // Sin la letra todavía, los nombres salen con otra; se repinta al llegar, sin esperarla para arder.
    const fuente = `500 10px ${token("--sans")}`;
    if (document.fonts && !document.fonts.check(fuente)) document.fonts.load(fuente).then(() => { if (W) { capaApagada(eds, calles, anchos); if (!corriendo) pinta(hecho ? T + B : -1); } }).catch(() => {});
  };
  const punto = (f, dist) => {
    let i = 1; while (i < f.d.length - 1 && f.d[i] < dist) i++;
    const a = f.p[i - 1], b = f.p[i], t = (dist - f.d[i - 1]) / Math.max(0.001, f.d[i] - f.d[i - 1]);
    return [mezcla(a[0], b[0], t), mezcla(a[1], b[1], t)];
  };
  const trazo = (f, hasta, estilo, ancho, desde = 0) => {
    cx.strokeStyle = estilo; cx.lineWidth = ancho; cx.beginPath();
    const a = punto(f, desde); cx.moveTo(a[0], a[1]);
    for (let i = 1; i < f.p.length; i++) { if (f.d[i] <= desde) continue; if (f.d[i] >= hasta) break; cx.lineTo(f.p[i][0], f.p[i][1]); }
    const b = punto(f, hasta); cx.lineTo(b[0], b[1]); cx.stroke();
  };
  // Pinta el momento t, en milisegundos desde que empieza a verse. Devuelve las cabezas que aún arden.
  const pinta = (t) => {
    const luz = halo(), xm = mas.getContext("2d"), grueso = Math.max(0.9, S / 0.42), cabezas = [], tras = t - T;
    cx.setTransform(D, 0, 0, D, 0, 0); cx.clearRect(0, 0, W, H); cx.drawImage(dim, 0, 0, W, H);
    xm.globalCompositeOperation = "source-over"; xm.clearRect(0, 0, W, H);
    for (const f of mechas) {
      f.dist = t < 0 ? 0 : Math.min(f.L, Math.max(0, f.d0 + v * (t - f.ini)));
      if (t >= T) f.dist = f.L;
      if (!f.dist) continue;
      // La luz que deja: el rastro, que se enfría, y más fuerte la de la cabeza.
      const paso = Math.max(20, 26 * S / 0.42);
      for (let d = 0; d < f.dist; d += paso) { const [a, b] = punto(f, d); xm.globalAlpha = Math.max(0.1, 0.55 * (1 - Math.min(1, (f.dist - d) / (f.L * 0.5)))); xm.drawImage(luz, a - 46, b - 46, 92, 92); }
      if (f.dist < f.L) { const [a, b] = punto(f, f.dist); cabezas.push([a, b]); xm.globalAlpha = 1; xm.drawImage(luz, a - 104, b - 104, 208, 208); }
    }
    // Al llegar, la luz se abre desde Cokima por todo el barrio y se queda baja.
    if (tras > 0) { const a = suave(B ? tramo(tras, 0, B) : 1), r = Math.hypot(W, H) * 1.5 * a + 30; xm.globalAlpha = mezcla(0.85, 0.42, a); xm.drawImage(luz, FX - r, FY - r, r * 2, r * 2); }
    xm.globalAlpha = 1; xm.globalCompositeOperation = "source-in"; xm.drawImage(lit, 0, 0); xm.globalCompositeOperation = "source-over";
    cx.drawImage(mas, 0, 0, W, H);
    cx.lineCap = "round"; cx.lineJoin = "round";
    const cabeza = token("--neon");
    for (const f of mechas) {
      if (!f.dist) continue;
      trazo(f, f.dist, `rgba(${tono(tras > 0 ? 0.42 : 0.34)},.9)`, 1.5 * grueso);
      // Los últimos 70 px, del rojo al amarillo; al llegar, se enfrían con el resto.
      const fin = tras > 0 ? 1 - tramo(tras, 0, B / 3) : 1;
      if (fin > 0) for (let i = 0; i < 10; i++) {
        const a = Math.max(0, f.dist - 70 * (1 - i / 10)), b = Math.max(0, f.dist - 70 * (1 - (i + 1) / 10));
        if (b > a) trazo(f, b, `rgba(${tono(0.35 + 0.65 * (i + 1) / 10)},${fin.toFixed(3)})`, 1.9 * grueso, a);
      }
      if (f.dist < f.L) { const [a, b] = punto(f, f.dist); cx.fillStyle = cabeza; cx.beginPath(); cx.arc(a, b, 2.1, 0, 6.3); cx.fill(); }
    }
    return cabezas;
  };

  const terminar = () => { cancelAnimationFrame(id); id = 0; corriendo = false; hecho = true; apagar(); pinta(T + B); };
  const fotograma = (ms) => {
    id = 0; if (!corriendo) return;
    if (!t0) t0 = ms;
    const t = ms - t0, cabezas = pinta(t);
    if (cabezas.length) {
      const r = cv.getBoundingClientRect();
      for (const [a, b] of cabezas) if (a > -10 && a < W + 10 && b > -10 && b < H + 10 && Math.random() < 0.3) brotar(r.left + a, r.top + b, 1, 0.7, 1);
    }
    if (!llegada && t >= T) { llegada = true; apagar(); const r = cv.getBoundingClientRect(); brotar(r.left + FX, r.top + FY, 70, 1.35, 16); }
    if (t < T + B) id = requestAnimationFrame(fotograma); else terminar();
  };
  const arrancar = () => {
    if (corriendo || hecho || !MAPA || !activa) return;
    corriendo = true; llegada = false; t0 = 0; caja.classList.add("arde");
    id = requestAnimationFrame(fotograma);
  };
  const ob = new IntersectionObserver((es) => {
    enVista = es[es.length - 1].isIntersecting;
    if (enVista) arrancar(); else if (corriendo) terminar();
  }, { threshold: 0.35 });

  // La barra del navegador dispara `resize` sin que cambie nada de esto, que cuelga de 100svh.
  addEventListener("resize", () => {
    if (!activa || !MAPA || (caja.clientWidth === W && caja.clientHeight === H)) return;
    medir(); if (!corriendo) pinta(hecho ? T + B : -1);
  }, { passive: true });

  return {
    activar(s) {
      if (s === activa) return;
      activa = s;
      if (!s) { ob.disconnect(); cancelAnimationFrame(id); id = 0; corriendo = false; apagar(); return; }
      hecho = false;
      if (!sinMov) caja.classList.add("arde");
      datos.then((d) => {
        if (!activa) return;
        if (!d) { apagar(); return; }
        MAPA = d; medir();
        if (sinMov) { hecho = true; apagar(); pinta(T + B); return; }
        pinta(-1); ob.observe(caja);
      });
    },
  };
};
