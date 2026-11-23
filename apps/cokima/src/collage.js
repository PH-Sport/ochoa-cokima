// EL COLLAGE de Nosotros (2026-11-04). Mario lo eligió en una maqueta, con la idea del mosaico vivo de La casa de
// Ochoa: las piezas enseñan facetas del sitio sin pedir esfuerzo, cambian de tamaño solas y obedecen al tocarlas. La
// idea y no las piezas: esto son vídeos, y el código no se comparte (docs/cokima-el-rediseno.md §3, «Nosotros, en maqueta»).
//
// Dos modos. Automático: dos ampliadas, cuatro tarjetas a la vista y la quinta fuera de la pantalla, que lo pidió
// así. Tocado: una sola ampliada y las cinco a la vista. Del tocado se vuelve al automático a los 6 s sin hacer
// nada, que es una excepción a la regla 6 de movimiento.md, escrita allí con su fecha.
//
// Cada pieza es una capa del tamaño de la caja, recortada a su hueco con clip-path, y el vídeo va debajo, colocado con
// transform a la escala que la cubre. Nunca se estira. La ventana y el vídeo los mueve este script en el mismo fotograma
// (regla 27), y debajo de cada vídeo va su primer fotograma como foto fija (regla 31).
//
// Corre solo con Nosotros abierto, con la pestaña delante y con la zona a la vista. Con «reducir movimiento» empieza
// en tocado, sin animar, sin que suene nada y sin volver al automático.
const VW = 540, VH = 960, RADIO = 14;

export const montarCollage = ({ leeMs, leeCurva, token }) => {
  const escena = document.querySelector("[data-collage]");
  if (!escena) return { activar() {} };
  const caja = escena.querySelector(".collage"), bp = escena.querySelector(".pausar");
  const sinMov = matchMedia("(prefers-reduced-motion: reduce)").matches, fino = matchMedia("(hover: hover) and (pointer: fine)");
  // La misma condición que en brasa.css: un móvil tumbado va como el ordenador.
  const ANCHO = matchMedia("(min-width: 900px), (min-width: 640px) and (orientation: landscape)");
  const ps = [...caja.querySelectorAll(".pieza")].map((el) => ({ el, vid: el.querySelector("video"), foto: el.querySelector(".pieza-foto"), velo: el.querySelector(".pieza-velo"), nombre: el.querySelector(".pieza-nombre"), txt: el.querySelector(".pieza-txt"), sitioBoton: el.querySelector(".pieza-boton"), mas: el.querySelector(".mas"), r: null, mov: null, tMarca: 0 }));

  let W = 0, H = 0, corre = false, enVista = true, cargadas = false;
  let cols = 3, filas = 2, movil = false, sitio = [], carriles = [[], []], fuera = -1, leyendo = -1;
  let activa = false, auto = !sinMov, encima = false, parado = sinMov, bloqueado = false, reloj = 0, pausaN = 0, vez = 0, tVuelta = 0, tEncima = 0;

  // ----- El motor: cada pieza va a su hueco, fotograma a fotograma; ventana, vídeo y lo que los acompaña, a la vez.
  const pinta = (p, r) => { p.r = r;
    p.el.style.clipPath = `inset(${r.y.toFixed(2)}px ${(W - r.x - r.w).toFixed(2)}px ${(H - r.y - r.h).toFixed(2)}px ${r.x.toFixed(2)}px round ${RADIO}px)`;
    // El vídeo cubre su zona: toda la ventana, o la parte que diga f (al leer más en el ordenador, la mitad izquierda).
    const zw = r.w * (r.f == null ? 1 : r.f), k = Math.max(zw / VW, r.h / VH) * 1.02;
    p.vid.style.transform = p.foto.style.transform = `translate(${(r.x + (zw - VW * k) / 2).toFixed(2)}px,${(r.y + (r.h - VH * k) / 2).toFixed(2)}px) scale(${k.toFixed(5)})`;
    p.velo.style.transform = `translate(${r.x.toFixed(2)}px,${r.y.toFixed(2)}px) scale(${(r.w / 100).toFixed(4)},${(r.h / 100).toFixed(4)})`;
    p.nombre.style.transform = `translate(${(r.x + 12).toFixed(2)}px,${(r.y + r.h - 12).toFixed(2)}px) translateY(-100%)`;
    p.txt.style.transform = `translate(${r.x.toFixed(2)}px,${(r.y + r.h).toFixed(2)}px) translateY(-100%)`;
    p.sitioBoton.style.transform = `translate(${(r.x + r.w - 54).toFixed(2)}px,${(r.y + 10).toFixed(2)}px)`; };
  const paso = (ahora) => { let quedan = false;
    ps.forEach((p) => { const m = p.mov; if (!m) return; const t = Math.min(1, Math.max(0, (ahora - m.t0 - m.retraso) / m.dur)), e = t <= 0 ? 0 : t >= 1 ? 1 : m.curva(t);
      const fd = m.de.f == null ? 1 : m.de.f, fa = m.a.f == null ? 1 : m.a.f;
      pinta(p, { x: m.de.x + (m.a.x - m.de.x) * e, y: m.de.y + (m.a.y - m.de.y) * e, w: m.de.w + (m.a.w - m.de.w) * e, h: m.de.h + (m.a.h - m.de.h) * e, f: fd + (fa - fd) * e });
      if (t < 1) quedan = true; else { p.mov = null; if (m.alAcabar) m.alAcabar(); } });
    if (quedan) requestAnimationFrame(paso); else corre = false; };
  const lleva = (i, a, o = {}) => { const p = ps[i], curva = leeCurva("--ease-viaje");
    if (sinMov || !p.r || o.directo || !curva) { p.mov = null; pinta(p, a); if (o.alAcabar) o.alAcabar(); return; }
    p.mov = { de: { ...p.r }, a, t0: performance.now(), retraso: o.retraso || 0, dur: o.dur || leeMs("--dur-cambio"), curva, alAcabar: o.alAcabar };
    if (!corre) { corre = true; requestAnimationFrame(paso); } };
  const medir = () => { const b = caja.getBoundingClientRect(); W = b.width; H = b.height; };

  // ----- Los vídeos. Sin load(): reinicia el vídeo y deja la pieza un fotograma sin imagen (regla 31); play() ya lo descarga.
  // Si el navegador no deja arrancarlo solo (ahorro de batería, ajustes), «Pausar» pasa a «Reproducir»: con un toque, sí.
  const rotulo = () => { const quieto = parado || bloqueado; bp.textContent = quieto ? "Reproducir" : "Pausar"; bp.setAttribute("aria-pressed", String(quieto)); };
  const poner = (v) => { v.preload = "auto"; const pr = v.play(); if (pr) pr.then(() => { if (bloqueado) { bloqueado = false; rotulo(); } }).catch((e) => { if (e && e.name === "NotAllowedError") { bloqueado = true; rotulo(); } }); };
  // Suenan las ampliadas; las pequeñas se quedan en el fotograma en que estaban: rebobinarlas las deja en negro (regla 31).
  const sonar = () => ps.forEach((p, i) => { const toca = activa && enVista && !parado && !document.hidden && (leyendo >= 0 ? i === leyendo : (sitio[i] || []).length === 2); if (toca) poner(p.vid); else p.vid.pause(); });
  // Lo que está tapado por un clip-path no se descarga solo en Chromium (regla 28), y Nosotros no descarga nada hasta
  // abrirse: el póster y los demás vídeos se piden aquí, de uno en uno cuando el anterior ya puede sonar.
  const cargar = () => { if (cargadas) return; cargadas = true; ps.forEach((p) => { p.foto.loading = "eager"; p.vid.poster = p.foto.currentSrc || p.foto.src; }); if (sinMov) return;
    let k = 0; const sig = () => { const p = ps[k++]; if (!p) return; let ido = false; const sigue = () => { if (!ido) { ido = true; sig(); } }; p.vid.preload = "auto"; p.vid.addEventListener("canplaythrough", sigue, { once: true }); setTimeout(sigue, 2500); }; sig(); };

  // ----- La rejilla: dos columnas y tres filas en el móvil, tres columnas y dos filas en el ordenador.
  const GAP = () => (movil ? 6 : 10);
  const medidas = () => { const g = GAP(); return { g, cw: (W - g * (cols - 1)) / cols, ch: (H - g * (filas - 1)) / filas }; };
  const celda = (n) => { const { g, cw, ch } = medidas(), c = n % cols, f = Math.floor(n / cols); return { x: c * (cw + g), y: f * (ch + g), w: cw, h: ch }; };
  const hueco = (cs) => { const rs = cs.map(celda), x = Math.min(...rs.map((r) => r.x)), y = Math.min(...rs.map((r) => r.y)); return { x, y, w: Math.max(...rs.map((r) => r.x + r.w)) - x, h: Math.max(...rs.map((r) => r.y + r.h)) - y }; };
  const vecinos = (n) => { const c = n % cols, f = Math.floor(n / cols), v = []; if (c > 0) v.push(n - 1); if (c < cols - 1) v.push(n + 1); if (f > 0) v.push(n - cols); if (f < filas - 1) v.push(n + cols); return v; };
  const grande = () => sitio.findIndex((s) => s.length === 2);
  const d2 = (a, b) => (a.x + a.w / 2 - b.x - b.w / 2) ** 2 + (a.y + a.h / 2 - b.y - b.h / 2) ** 2;
  // Los carriles son las columnas en el móvil y las filas en el ordenador, el mismo dibujo girado. Cada uno tiene tres
  // posiciones; -1 y 3 son las de fuera de la caja, por donde se entra y se sale.
  const enCarril = (L, a, b) => { const { g, cw, ch } = medidas(), n = b - a + 1; return movil ? { x: L * (cw + g), y: a * (ch + g), w: cw, h: n * ch + (n - 1) * g } : { x: a * (cw + g), y: L * (ch + g), w: n * cw + (n - 1) * g, h: ch }; };
  const celdaDe = (L, pos) => (movil ? pos * cols + L : L * cols + pos);
  // `sitio` guarda las celdas de cada tarjeta; la de fuera, ninguna.
  const volcar = () => { sitio = ps.map(() => []); carriles.forEach((it, L) => { let pos = 0; it.forEach(({ c, n }) => { sitio[c] = [...Array(n)].map((_, k) => celdaDe(L, pos + k)); pos += n; }); }); };
  // El texto de una ampliada se escribe al ancho de su hueco final, y aparece cuando ya ha crecido casi del todo.
  const marcar = (espera) => ps.forEach((p, i) => { const es = sitio[i] && sitio[i].length === 2; clearTimeout(p.tMarca);
    if (!es) { p.el.classList.remove("grande"); return; }
    p.txt.style.width = hueco(sitio[i]).w + "px";
    if (!espera) p.el.classList.add("grande"); else if (!p.el.classList.contains("grande")) p.tMarca = setTimeout(() => p.el.classList.add("grande"), espera); });
  const asomar = (c, r) => { ps[c].el.style.visibility = ""; lleva(c, r, { directo: true }); };
  const ocultar = (c) => () => { if (fuera === c) ps[c].el.style.visibility = "hidden"; };
  const ponerModo = () => { caja.dataset.modo = auto ? "auto" : "tocado"; };

  // ----- Automático. El carril 0 avanza hacia el final y el 1 hacia el principio, y en cada turno se mueve uno solo.
  // Todo con la misma curva y duración, así que los huecos entre tarjetas no cambian y nunca se cruzan.
  // Cinta (la alta está en el lado de entrada): entra la de fuera, pequeña; la alta avanza una celda sin encogerse,
  // y la pequeña del otro extremo sale y pasa a ser la de fuera.
  const cinta = (L) => { const nueva = fuera, [a, b] = carriles[L];
    if (L === 0) { asomar(nueva, enCarril(0, -1, -1)); carriles[0] = [{ c: nueva, n: 1 }, { c: a.c, n: 2 }]; fuera = b.c;
      lleva(nueva, enCarril(0, 0, 0)); lleva(a.c, enCarril(0, 1, 2)); lleva(b.c, enCarril(0, 3, 3), { alAcabar: ocultar(b.c) }); }
    else { asomar(nueva, enCarril(1, 3, 3)); carriles[1] = [{ c: b.c, n: 2 }, { c: nueva, n: 1 }]; fuera = a.c;
      lleva(nueva, enCarril(1, 2, 2)); lleva(b.c, enCarril(1, 0, 1)); lleva(a.c, enCarril(1, -1, -1), { alAcabar: ocultar(a.c) }); } };
  // Cambio de tamaño (la alta está en el lado de salida): la pequeña crece y la alta se encoge, compartiendo el borde.
  const tamano = (L) => { const [a, b] = carriles[L];
    if (L === 0) { carriles[0] = [{ c: a.c, n: 2 }, { c: b.c, n: 1 }]; lleva(a.c, enCarril(0, 0, 1)); lleva(b.c, enCarril(0, 2, 2)); }
    else { carriles[1] = [{ c: a.c, n: 1 }, { c: b.c, n: 2 }]; lleva(a.c, enCarril(1, 0, 0)); lleva(b.c, enCarril(1, 1, 2)); } };
  const turno = () => { if (!auto || !sitio.length) return; const L = vez++ % 2, [a, b] = carriles[L];
    if (L === 0 ? a.n === 2 : b.n === 2) cinta(L); else tamano(L);
    volcar(); marcar(leeMs("--dur-cambio") * 0.85); sonar(); };
  // Un cambio cada 3 s, con unas décimas de diferencia para que no se le oiga el compás (regla 18).
  const programar = () => { clearTimeout(reloj); if (!auto || !activa || !enVista || encima || parado || leyendo >= 0 || document.hidden) return;
    const pausas = token("--pausas-collage").split(/\s+/), v = pausas[pausaN++ % pausas.length], pausa = v.endsWith("ms") ? parseFloat(v) : parseFloat(v) * 1000;
    reloj = setTimeout(() => { turno(); programar(); }, pausa + leeMs("--dur-cambio")); };

  // ----- Tocado. Del automático: en el carril de la tocada, ella ampliada y la otra pequeña; en el otro, tres
  // pequeñas, con la de fuera entrando por su lado de entrada y las otras dos en el mismo orden.
  const pasarATocado = (T) => { const L = carriles[0].some((x) => x.c === T) ? 0 : 1, O = 1 - L, otras = carriles[O].map((x) => x.c), e = fuera;
    carriles[L].forEach((x) => (x.n = x.c === T ? 2 : 1));
    asomar(e, O === 0 ? enCarril(0, -1, -1) : enCarril(1, 3, 3));
    carriles[O] = (O === 0 ? [e, ...otras] : [...otras, e]).map((c) => ({ c, n: 1 }));
    fuera = -1; auto = false; clearTimeout(reloj); ponerModo(); volcar();
    ps.forEach((_, i) => lleva(i, hueco(sitio[i]))); marcar(leeMs("--dur-cambio") * 0.85); sonar(); };
  // Ya en tocado, cómo se pone grande T: crece en su celda y una vecina; la grande de antes se encoge a una celda suya,
  // y si la vecina tenía otra tarjeta, esa pasa a la otra que deja libre la grande. Nunca se mueven más de tres.
  const plan = (T) => { const B = grande(); if (T === B) return null; const c = sitio[T][0], [a, b] = sitio[B]; let mejor = null;
    for (const d of vecinos(c)) { const libres = [a, b].filter((x) => x !== c && x !== d), X = sitio.findIndex((s, j) => j !== T && j !== B && s.includes(d));
      for (const bc of libres) { const xc = X >= 0 ? libres.find((x) => x !== bc) : null; if (X >= 0 && xc == null) continue;
        const coste = d2(hueco([a, b]), hueco([bc])) + (X >= 0 ? d2(hueco([d]), hueco([xc])) * 1.6 : 0);
        if (!mejor || coste < mejor.coste) mejor = { T, B, c, d, bc, X, xc, coste }; } }
    return mejor; };
  const aplicar = (pl) => { if (!pl) return; const { T, B, c, d, bc, X, xc } = pl;
    sitio[T] = [c, d].sort((p, q) => p - q); sitio[B] = [bc]; if (X >= 0) sitio[X] = [xc];
    ps.forEach((p, i) => { if (i !== leyendo) p.el.style.zIndex = 1; }); ps[B].el.style.zIndex = 3; if (X >= 0) ps[X].el.style.zIndex = 2;
    // La que se encoge va encima y arranca antes; la que crece sale por debajo, un poco después.
    const dur = leeMs("--dur-cambio");
    lleva(B, hueco(sitio[B])); if (X >= 0) lleva(X, hueco(sitio[X]), { retraso: dur * 0.1 }); lleva(T, hueco(sitio[T]), { retraso: dur * 0.2 });
    marcar(sinMov ? 0 : dur * 1.05); sonar(); };
  const elegir = (i) => { if (!sinMov) parado = false; if (auto) pasarATocado(i); else if (sitio[i].length !== 2) aplicar(plan(i)); else sonar(); rotulo(); esperaVuelta(); };

  // ----- La vuelta al automático: a los 6 s sin hacer nada (Mario, 2026-11-04). No corre leyendo, en pausa ni fuera de
  // la vista. La última tocada sigue ampliada; en el otro carril queda otra, y la que sobra sale por su lado de salida.
  const esperaVuelta = () => { clearTimeout(tVuelta); if (sinMov || auto || leyendo >= 0 || parado || !activa || !enVista || document.hidden) return; tVuelta = setTimeout(volverAlAuto, leeMs("--espera-vuelta")); };
  const volverAlAuto = () => { const T = grande(); if (auto || T < 0 || leyendo >= 0) return;
    const carrilDe = (n) => (movil ? n % cols : Math.floor(n / cols)), posDe = (n) => (movil ? Math.floor(n / cols) : n % cols);
    const ocupa = [[-1, -1, -1], [-1, -1, -1]]; sitio.forEach((cs, i) => cs.forEach((n) => (ocupa[carrilDe(n)][posDe(n)] = i)));
    const [a, b] = sitio[T]; let sale;
    if (carrilDe(a) === carrilDe(b)) { // Ampliada a lo largo de su carril: se queda como está, y el otro carril, con tres pequeñas, suelta una.
      const X = carrilDe(a), Y = 1 - X, o = ocupa[Y];
      carriles[X] = [...new Set(ocupa[X])].map((c) => ({ c, n: c === T ? 2 : 1 }));
      if (Y === 0) { sale = o[2]; carriles[0] = [{ c: o[0], n: 1 }, { c: o[1], n: 2 }]; } else { sale = o[0]; carriles[1] = [{ c: o[1], n: 2 }, { c: o[2], n: 1 }]; }
    } else { // Ampliada de través, sobre los dos carriles: se queda en el que no la hace salir, y crece a lo largo de él.
      const r = posDe(a), X = r === 2 ? 1 : 0, Y = 1 - X, o = ocupa[X], q = ocupa[Y];
      if (X === 0) { sale = o[2]; carriles[0] = r === 0 ? [{ c: T, n: 2 }, { c: o[1], n: 1 }] : [{ c: o[0], n: 1 }, { c: T, n: 2 }]; }
      else { sale = o[0]; carriles[1] = [{ c: o[1], n: 1 }, { c: T, n: 2 }]; }
      // En el otro carril, una vecina crece hacia el hueco que deja.
      const con = [0, 1, 2].filter((k) => k !== r).map((k) => q[k]);
      carriles[Y] = r === 0 ? [{ c: con[0], n: 2 }, { c: con[1], n: 1 }] : [{ c: con[0], n: 1 }, { c: con[1], n: 2 }];
    }
    const salida = ocupa[0].includes(sale) ? enCarril(0, 3, 3) : enCarril(1, -1, -1);
    fuera = sale; auto = true; ponerModo(); volcar();
    ps.forEach((p, i) => { p.el.style.zIndex = i === T ? 3 : 1; if (i === sale) lleva(i, salida, { alAcabar: ocultar(i) }); else lleva(i, hueco(sitio[i])); });
    marcar(leeMs("--dur-cambio") * 0.85); sonar(); rotulo(); programar(); };

  // ----- Leer más: la tarjeta pasa a tocado y se trae al primer plano, sobre todo el collage, sin cambiar de pantalla. En el
  // ordenador el vídeo se queda en la mitad izquierda: a toda la caja habría que ampliarlo 2,2 veces.
  const entera = () => ({ x: 0, y: 0, w: W, h: H, f: movil ? 1 : 0.5 });
  const nombreDe = (p) => p.el.querySelector(".pieza-tit").textContent;
  const abrir = (i) => { elegir(i); leyendo = i; clearTimeout(reloj); clearTimeout(tVuelta); const p = ps[i];
    clearTimeout(p.tMarca); p.el.classList.add("grande", "desplegada"); p.el.style.zIndex = 10;
    ps.forEach((q, j) => (q.el.inert = j !== i));
    p.mas.setAttribute("aria-expanded", "true"); p.mas.setAttribute("aria-label", "Cerrar " + nombreDe(p));
    lleva(i, entera(), { dur: leeMs("--dur-viaje") }); p.el.classList.add("leyendo"); sonar(); p.mas.focus({ preventScroll: true }); };
  const cerrar = () => { if (leyendo < 0) return; const i = leyendo, p = ps[i]; leyendo = -1; p.el.classList.remove("leyendo"); ps.forEach((q) => (q.el.inert = false));
    p.mas.setAttribute("aria-expanded", "false"); p.mas.setAttribute("aria-label", "Leer más sobre " + nombreDe(p));
    lleva(i, { ...hueco(sitio[i]), f: 1 }, { dur: leeMs("--dur-viaje"), alAcabar: () => { p.el.classList.remove("desplegada"); p.el.style.zIndex = 1; } });
    sonar(); if (activa) p.mas.focus({ preventScroll: true }); esperaVuelta(); };
  addEventListener("keydown", (e) => { if (e.key === "Escape") cerrar(); });
  ps.forEach((p, i) => {
    p.el.addEventListener("click", (e) => { if (e.target.closest(".mas")) { if (leyendo === i) cerrar(); else abrir(i); return; } if (leyendo === i) return; elegir(i); });
    p.el.addEventListener("keydown", (e) => { if (e.target === p.el && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); elegir(i); } }); });
  // Con el ratón moviéndose encima, el automático espera y la cuenta de los 6 s vuelve a empezar; con el ratón quieto
  // no cuenta como actividad, o tras un clic no volvería nunca, porque el cursor se queda encima de la tarjeta.
  const moverse = () => { if (!fino.matches) return; if (!auto) { esperaVuelta(); return; } encima = true; clearTimeout(reloj); clearTimeout(tEncima); tEncima = setTimeout(() => { encima = false; programar(); }, leeMs("--espera-vuelta")); };
  caja.addEventListener("mouseenter", moverse); caja.addEventListener("mousemove", moverse);
  caja.addEventListener("mouseleave", () => { encima = false; clearTimeout(tEncima); programar(); });
  caja.addEventListener("keydown", () => { if (!auto) esperaVuelta(); });
  bp.addEventListener("click", () => { if (bloqueado) { bloqueado = false; sonar(); rotulo(); return; } parado = !parado; sonar(); programar(); esperaVuelta(); rotulo(); });

  // ----- Colocar: al abrir Nosotros y al cambiar de tamaño.
  const recolocar = () => { medir(); ps.forEach((p, i) => { if (i === leyendo) lleva(i, entera(), { directo: true });
      else if (sitio[i] && sitio[i].length) lleva(i, hueco(sitio[i]), { directo: true });
      else { lleva(i, enCarril(0, -1, -1), { directo: true }); p.el.style.visibility = "hidden"; } }); marcar(); };
  const montar = () => { medir(); movil = !ANCHO.matches; cols = movil ? 2 : 3; filas = movil ? 3 : 2;
    const T = auto ? -1 : Math.max(grande(), 0);
    if (auto) { carriles = [[{ c: 0, n: 2 }, { c: 1, n: 1 }], [{ c: 2, n: 1 }, { c: 3, n: 2 }]]; fuera = 4; vez = 0; }
    else { const resto = ps.map((_, i) => i).filter((i) => i !== T); carriles = [[{ c: T, n: 2 }, { c: resto[0], n: 1 }], resto.slice(1).map((c) => ({ c, n: 1 }))]; fuera = -1; }
    volcar(); ps.forEach((p, i) => { p.el.style.visibility = ""; if (i !== leyendo) p.el.style.zIndex = 1; }); recolocar(); sonar(); };
  // Un vídeo copiado o recreado puede no quedar silenciado en Safari aunque lleve el atributo; sin silencio no arranca solo.
  ps.forEach((p) => { p.vid.muted = true; p.vid.defaultMuted = true; p.vid.playsInline = true; });
  let modoAncho = null;
  const alMedir = () => { if (!activa) return; const n = ANCHO.matches; if (n !== modoAncho) { modoAncho = n; montar(); } else recolocar(); };
  new ResizeObserver(alMedir).observe(caja);
  new IntersectionObserver(([e]) => { enVista = e.isIntersecting; sonar(); programar(); esperaVuelta(); }, { threshold: 0.3 }).observe(escena);
  document.addEventListener("visibilitychange", () => { sonar(); programar(); esperaVuelta(); });
  ponerModo(); rotulo();

  // Lo llama brasa.js al entrar en Nosotros y al salir. Al salir, se cierra lo que se estuviera leyendo.
  return { activar: (s) => { if (s === activa) return; activa = s; if (s) { cargar(); alMedir(); } else cerrar(); sonar(); programar(); esperaVuelta(); } };
};
