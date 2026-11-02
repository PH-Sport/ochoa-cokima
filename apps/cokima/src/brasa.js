// Brasa: las secciones, La carta con la foto de cada parte, el estado de la cocina y el fondo de chispas.
// Es el código del boceto que eligió Mario el 2026-10-31, pasado tal cual (docs/cokima-el-rediseno.md §3).
// La carta llega del build, de menu-es.json, en el JSON de #carta-datos: no hay copia aquí.
(() => {
  const MENU = JSON.parse(document.getElementById("carta-datos").textContent);
  // Los tokens de tokens.css se leen al usarlos y con su unidad: el build reescribe 180ms como .18s,
  // y WebKit los devuelve vacíos mientras carga la página (regla 30 de movimiento.md).
  const token = (t) => getComputedStyle(document.documentElement).getPropertyValue(t).trim();
  const leeMs = (t) => { const v = token(t); return v.endsWith("ms") ? parseFloat(v) : parseFloat(v) * 1000; };
  const POR_ID = Object.fromEntries(MENU.map((d) => [d.id, d]));
  const fmt = (p) => (Number.isInteger(p) ? p + " €" : p.toFixed(2).replace(".", ",") + " €");
  // Los platos con foto en la fototeca, y la frase que la casa ha publicado de cada uno.
  const FOTOS = {
    "compartir-01": { img: "croquetas", w: 825, h: 1100, alt: "Una croqueta con su velo de papada", frase: "Han pasado por casi todas nuestras cartas. Y siguen aquí" },
    "compartir-04": { img: "gyozas", w: 1100, h: 1100, alt: "Gyozas de langostino con salsa de chorizo", frase: "Compartir es vivir." },
    "compartir-06": { img: "dumpling", w: 880, h: 1100, alt: "Dumpling de chipirones", frase: "Madrid cabe en un dumpling." },
    "compartir-10": { img: "tacos", w: 1100, h: 1100, alt: "Una mano sostiene un taco de gambón", frase: null },
    "terminar-02": { img: "katsu", w: 880, h: 1100, alt: "Katsu sando con patatas", frase: "Hay dos tipos de clientes en Cokima." },
    "terminar-04": { img: "arroz", w: 720, h: 1280, alt: "Arroz meloso de carabinero", frase: "Este plato cambia el ritmo de la mesa…" },
    "postres-01": { img: "tarta", w: 1100, h: 1100, alt: "Una mujer se come la tarta de queso", frase: "La mejor crítica nunca ha necesitado palabras." },
    "postres-02": { img: "torrija", w: 880, h: 1100, alt: "La torrija servida bajo el neón", frase: "Un postre que no se comparte, se saborea lento." },
  };
  // Platos sin foto que también tienen frase propia publicada: llevan la voz en vez de la foto.
  const VOCES = { "terminar-05": "Hay platos que entran en carta. Y otros que se agarran a ella." };
  const PARTES = [["compartir", "Compartir es vivir"], ["terminar", "Para terminar o no…"], ["postres", "Y por fin, los postres"]];

  const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };
  const foto = (id, etiqueta) => {
    const d = POR_ID[id], f = FOTOS[id];
    const fig = el("figure", "pf");
    const img = el("img"); img.src = `/images/${f.img}.jpg`; img.alt = f.alt; img.width = f.w; img.height = f.h; img.loading = "lazy";
    const cap = el("figcaption", "wrap");
    if (etiqueta) cap.append(el("p", "etq", etiqueta));
    cap.append(el("p", "vg", f.frase || d.description));
    const ln = el("p", "linea"); ln.append(el("span", null, d.name), el("b", null, fmt(d.price))); cap.append(ln);
    if (f.frase && d.description) cap.append(el("p", "d", d.description));
    fig.append(img, cap); return fig;
  };
  const fila = (d) => {
    const li = el("li", "pl"); li.dataset.id = d.id;
    const ln = el("span", "ln"), n = el("span", null, d.name);
    if (d.featured) n.append(el("span", "imp", "Imprescindible"));
    ln.append(n, el("b", null, fmt(d.price))); li.append(ln);
    if (d.description) li.append(el("span", "d", d.description));
    if (VOCES[d.id]) li.append(el("span", "vl", VOCES[d.id]));
    return li;
  };
  const lista = (sec) => {
    const ul = el("ul");
    MENU.filter((d) => d.section === sec).forEach((d) => ul.append(fila(d)));
    return ul;
  };

  const cuerpo = document.getElementById("carta-cuerpo");
  // Cada parte de la carta se abre con uno de sus platos en foto y, debajo, todos en la misma lista,
  // ese también: la foto ilustra la parte, no corona al plato. Mario la eligió entre tres maneras el
  // 2026-11-02 (docs/cokima-el-rediseno.md §3); FOTOS guarda la foto y la frase de los ocho con foto.
  const PORTADILLAS = { compartir: "compartir-04", terminar: "terminar-04", postres: "postres-02" };
  const pintarCarta = () => {
    PARTES.forEach(([sec, t]) => {
      const s = el("section", "parte"); s.id = "p-" + sec; s.dataset.parte = sec;
      const w = el("div", "wrap"); w.append(el("h3", "sec", t)); s.append(w);
      const pid = PORTADILLAS[sec];
      const p = foto(pid, POR_ID[pid].featured ? "Imprescindible" : null); p.classList.add("portadilla"); s.append(p);
      const l = el("div", "wrap lista"); l.append(lista(sec)); s.append(l);
      cuerpo.append(s);
    });
  };
  document.querySelectorAll(".chips a").forEach((a) => a.addEventListener("click", (e) => {
    e.preventDefault(); document.getElementById("p-" + a.dataset.a)?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }));

  // Estado de la cocina, a la hora de Madrid. Horario real: cocina 13:00–16:00 y 19:30–23:30, todos los días.
  const estado = () => {
    const [h, m] = new Intl.DateTimeFormat("es-ES", { timeZone: "Europe/Madrid", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date()).split(":").map(Number);
    const t = h * 60 + m;
    let txt, abierta = false;
    if (t >= 780 && t < 960) { txt = "Cocina abierta ahora, hasta las 16:00"; abierta = true; }
    else if (t >= 1170 && t < 1410) { txt = "Cocina abierta ahora, hasta las 23:30"; abierta = true; }
    else if (t < 780) txt = "La cocina abre hoy a las 13:00";
    else if (t < 1170) txt = "La cocina vuelve a las 19:30";
    else txt = "La cocina abre mañana a las 13:00";
    document.querySelectorAll("[data-estado]").forEach((e) => { e.textContent = txt; e.classList.toggle("abierta", abierta); });
  };
  estado(); setInterval(estado, 60000);

  // Secciones: una a la vista cada vez, con un fundido corto al cambiar.
  const vistas = Object.fromEntries([...document.querySelectorAll(".vista")].map((v) => [v.dataset.vista, v]));
  const barra = document.querySelector(".barra"), desp = document.querySelector(".desp");
  let actual = "inicio";
  // Marca la sección en las del ordenador y en la lista del móvil, y pone su nombre en el desplegable.
  const marcar = () => {
    document.querySelectorAll(".secciones [data-ir], .desplegable [data-ir]").forEach((a) => {
      if (a.dataset.ir === actual) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
    // Reservar no está en el menú: su nombre lo lleva la sección (data-nombre).
    const nombre = document.querySelector(`.desplegable [data-ir="${actual}"]`)?.textContent || vistas[actual].dataset.nombre || "";
    desp.querySelector("[data-actual]").textContent = nombre;
    desp.setAttribute("aria-label", `Secciones. Estás en ${nombre}`);
  };
  const revelar = () => {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px" });
    vistas[actual].querySelectorAll(".rv:not(.in)").forEach((x) => io.observe(x));
  };
  // El vídeo de la portada vive fuera de <main> para quedar debajo de las chispas, así que no se esconde
  // con la sección: se esconde aquí, y al esconderlo su observador lo pausa.
  const cine = document.querySelector(".cine");
  // El motor de reservas (2026-11-02) se monta la primera vez que se abre Reservar, y no antes: así el
  // Inicio no llama a covermanager.com. Primero la mitad del iframeResizer que va en esta página y luego
  // el iframe, porque su onload la necesita ya cargada; si no, el iframe se queda en 550px con scroll
  // propio (recursos.md §2). Si el script no llega, el iframe se monta igual, y reserva igual.
  const motor = document.querySelector("template[data-motor]");
  const montarMotor = () => {
    if (!motor || motor.dataset.montado) return;
    motor.dataset.montado = "1";
    const frag = motor.content.cloneNode(true), viejo = frag.querySelector("script"), js = document.createElement("script");
    js.src = viejo.src; viejo.remove();
    js.onload = js.onerror = () => motor.replaceWith(frag);
    document.head.append(js);
  };
  const ir = (destino, instantaneo) => {
    // Las direcciones de cuando La carta tenía tres maneras (#carta-1, -2 y -3) llevan a La carta.
    let v = /^carta-[123]$/.test(destino) ? "carta" : destino;
    if (!vistas[v]) v = "inicio";
    try { history.replaceState(null, "", "#" + v); } catch (e) {}
    if (v === actual) { scrollTo(0, 0); return; }
    const sale = vistas[actual], entra = vistas[v];
    actual = v; marcar();
    const cambiar = () => {
      sale.hidden = true; sale.classList.remove("saliendo");
      if (cine) cine.hidden = v !== "inicio";
      entra.classList.add("entrando"); entra.hidden = false; scrollTo(0, 0);
      if (v === "reservar") montarMotor();
      requestAnimationFrame(() => requestAnimationFrame(() => entra.classList.remove("entrando")));
      revelar(); alScroll();
    };
    // El cambio de sección espera a que acabe el fundido de salida, que dura --dur-out.
    if (instantaneo) cambiar(); else { sale.classList.add("saliendo"); setTimeout(cambiar, leeMs("--dur-out")); }
  };
  // El desplegable del móvil (2026-11-02). Se cierra al elegir sección, al tocar fuera, con Escape,
  // al mover la página, al volver a la portada —donde no hay barra— y al pasar a ancho de ordenador.
  const html = document.documentElement;
  let yMenu = 0;
  const abierto = () => html.classList.contains("menu-abierto");
  const menu = (abrir) => { html.classList.toggle("menu-abierto", abrir); desp.setAttribute("aria-expanded", String(abrir)); yMenu = scrollY; };
  desp.addEventListener("click", () => menu(!abierto()));
  document.querySelector(".velo").addEventListener("click", () => menu(false));
  addEventListener("keydown", (e) => { if (e.key === "Escape" && abierto()) { menu(false); desp.focus(); } });
  matchMedia("(min-width: 900px)").addEventListener("change", () => menu(false));
  document.addEventListener("click", (e) => { const a = e.target.closest("[data-ir]"); if (!a) return; e.preventDefault(); menu(false); ir(a.dataset.ir); });

  // El viaje (2026-11-02). Al pasar el límite de la portada, «Reservar» y «Ver carta» viajan hasta su
  // sitio en la barra —«Ver carta» se vuelve «La carta», la del menú de arriba— y vuelven al subir. En
  // el móvil solo viaja «Reservar»: «La carta» está dentro del desplegable, cerrado, y no hay adónde
  // llegar; «Ver carta» se apaga con la portada, como antes. Lo que se mueve es un
  // viajero: sale de donde está la pieza que se va y llega a donde está la que viene, leída en cada
  // fotograma, porque al subir la portada sigue corriendo con el scroll. Posición, forma y letra se
  // calculan en el mismo requestAnimationFrame (regla 27 de movimiento.md), con la curva y la
  // duración de tokens.css. Si se cruza de vuelta a medio viaje, parte de donde va. Sin movimiento,
  // o si lo que se va ya no está en pantalla (un salto), el cambio es directo, como antes.
  // Los dos tokens se leen al empezar cada viaje, no al cargar (regla 30 de movimiento.md).
  const leeCurva = (t) => {
    const n = (token(t).match(/cubic-bezier\(([^)]+)\)/)?.[1] || "").split(",").map(Number);
    if (n.length !== 4 || n.some((x) => !Number.isFinite(x))) return null;
    const b = (a1, a2, t) => 3 * a1 * t * (1 - t) ** 2 + 3 * a2 * t * t * (1 - t) + t ** 3;
    return (x) => { let lo = 0, hi = 1, t = x; for (let i = 0; i < 24; i++) { t = (lo + hi) / 2; if (b(n[0], n[2], t) < x) lo = t; else hi = t; } return b(n[1], n[3], t); };
  };
  const suave = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const medir = (e) => { const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; };
  // Una píldora como trazo: el sentido contrario hace de agujero, y así el aro sale sin evenodd.
  const estadio = (x, y, w, h, contra) => {
    const r = Math.min(w, h) / 2, f = (v) => v.toFixed(2);
    return contra
      ? `M${f(x + r)} ${f(y)}A${f(r)} ${f(r)} 0 0 0 ${f(x + r)} ${f(y + h)}H${f(x + w - r)}A${f(r)} ${f(r)} 0 0 0 ${f(x + w - r)} ${f(y)}Z`
      : `M${f(x + r)} ${f(y)}H${f(x + w - r)}A${f(r)} ${f(r)} 0 0 1 ${f(x + w - r)} ${f(y + h)}H${f(x + r)}A${f(r)} ${f(r)} 0 0 1 ${f(x + r)} ${f(y)}Z`;
  };
  const copiar = (s, de, c) => { s.textContent = de.textContent.trim(); s.style.font = `${c.fontStyle} ${c.fontWeight} ${c.fontSize}/1 ${c.fontFamily}`; s.style.letterSpacing = c.letterSpacing; s.style.color = c.color; };
  const transparente = (c) => c === "transparent" || /rgba\(.*,\s*0\)$/.test(c);
  const viaje = (portada, enBarra) => {
    const v = el("div", "viajero"), cap = el("span", "cap"), aro = el("span", "aro"), lp = el("span"), lb = el("span");
    v.setAttribute("aria-hidden", "true"); v.hidden = true; v.append(cap, aro, lp, lb); document.body.append(v);
    // m: 0 es como está en la portada y 1 como está en la barra; de m sale todo lo que no es el sitio.
    let anim = 0, m = 0, caja = null, tocados = [];
    const acabar = (aBarra) => {
      cancelAnimationFrame(anim); v.hidden = true; caja = null; m = aBarra ? 1 : 0;
      tocados.forEach((x) => x.classList.remove("vuela")); tocados = [];
    };
    return (aBarra, animar) => {
      cancelAnimationFrame(anim);
      const B = enBarra(), dur = leeMs("--dur-viaje"), curva = leeCurva("--ease-viaje");
      if (!animar || !B || !(dur > 0) || !curva) { acabar(aBarra); return; }
      const llega = aBarra ? B : portada, r0 = v.hidden ? medir(aBarra ? portada : B) : caja;
      // Sin viaje si lo que se va ya no está en pantalla, o si adonde va no se pinta (otra sección).
      if (!r0.w || r0.y + r0.h < 0 || r0.y > innerHeight || !medir(llega).w) { acabar(aBarra); return; }
      const m0 = v.hidden ? (aBarra ? 0 : 1) : m, mT = aBarra ? 1 : 0;
      const rp = medir(portada), rB = medir(B), cP = getComputedStyle(portada), cB = getComputedStyle(B);
      const W = Math.ceil(Math.max(rp.w, rB.w, r0.w)) + 2, H = Math.ceil(Math.max(rp.h, rB.h, r0.h)) + 2;
      v.style.width = W + "px"; v.style.height = H + "px";
      cap.style.background = cP.backgroundColor; aro.style.background = cP.borderTopColor;
      copiar(lp, portada, cP); copiar(lb, B, cB);
      const fP = parseFloat(cP.fontSize), fB = parseFloat(cB.fontSize), mismo = lp.textContent === lb.textContent;
      const capsula = !transparente(cB.backgroundColor);
      [portada, B].forEach((x) => { x.classList.add("vuela"); if (!tocados.includes(x)) tocados.push(x); });
      v.hidden = false;
      const t0 = performance.now();
      const paso = (ahora) => {
        const p = Math.min(1, Math.max(0, (ahora - t0) / dur)), e = curva(p), r1 = medir(llega);
        caja = { x: r0.x + (r1.x - r0.x) * e, y: r0.y + (r1.y - r0.y) * e, w: r0.w + (r1.w - r0.w) * e, h: r0.h + (r1.h - r0.h) * e };
        m = m0 + (mT - m0) * e;
        const { x, y, w, h } = caja, ox = (W - w) / 2, oy = (H - h) / 2, fuera = estadio(ox, oy, w, h);
        v.style.transform = `translate(${(x - ox).toFixed(2)}px,${(y - oy).toFixed(2)}px)`;
        cap.style.clipPath = `path("${fuera}")`;
        aro.style.clipPath = `path("${fuera} ${estadio(ox + 1, oy + 1, w - 2, h - 2, true)}")`;
        // La cápsula es lo que dice que es el mismo botón: se queda entera casi todo el viaje y solo
        // se disuelve al llegar a donde no la hay. Con las dos palabras a la vez a medio fundir, el
        // botón se quedaba en nada a mitad de camino.
        cap.style.opacity = aro.style.opacity = capsula ? 1 : 1 - suave(0.55, 0.95, m);
        // La letra cambia de tamaño con la cápsula. Si es la misma palabra, se pasa de una a otra a
        // mitad de viaje, cuando ya miden lo mismo: así llega idéntica a la de verdad.
        const s = 1 + (fB / fP - 1) * m;
        lp.style.transform = `scale(${s})`; lb.style.transform = `scale(${(s * fP) / fB})`;
        lp.style.opacity = mismo ? +(m < 0.5) : 1 - suave(0.35, 0.6, m);
        lb.style.opacity = mismo ? +(m >= 0.5) : suave(0.4, 0.65, m);
        if (p < 1) anim = requestAnimationFrame(paso); else acabar(aBarra);
      };
      paso(t0);
    };
  };
  const secciones = document.querySelector(".secciones");
  const viajes = [
    viaje(document.querySelector(".portada .acc .pill.solid"), () => document.querySelector(".barra .pill")),
    viaje(document.querySelector('.portada .acc [data-ir="carta"]'), () =>
      getComputedStyle(secciones).display === "none" ? null : secciones.querySelector('[data-ir="carta"]')),
  ];

  const chips = [...document.querySelectorAll(".chips a")], accPortada = document.querySelector(".portada .acc");
  // Con margen: la portada se deja al pasar el 60% de la pantalla y se recupera por debajo del 50%,
  // para que quien se pare justo en el límite no ponga los botones a ir y venir.
  let enPortada = null;
  const alScroll = (desdeScroll) => {
    const portada = actual === "inicio" && scrollY < innerHeight * (enPortada === false ? 0.5 : 0.6);
    if (portada !== enPortada) {
      const viajar = desdeScroll === true && enPortada !== null && !matchMedia("(prefers-reduced-motion: reduce)").matches;
      enPortada = portada;
      barra.classList.toggle("oculta", portada); accPortada.classList.toggle("oculta", !portada);
      if (portada) menu(false);
      viajes.forEach((v) => v(!portada, viajar));
    }
    if (actual === "carta") {
      let on = "compartir";
      document.querySelectorAll(".parte").forEach((p) => { if (p.getBoundingClientRect().top < innerHeight * 0.35) on = p.dataset.parte; });
      if (innerHeight + scrollY >= document.documentElement.scrollHeight - 4) on = "postres";
      chips.forEach((c) => c.classList.toggle("on", c.dataset.a === on));
    }
  };
  addEventListener("scroll", () => { alScroll(true); if (abierto() && Math.abs(scrollY - yMenu) > 8) menu(false); }, { passive: true });

  pintarCarta();

  // El Inicio: los cinco paneles (2026-11-02). Ninguno cambia de tamaño —recalcularía la página en cada
  // fotograma (regla 2)—: los cinco ocupan la zona entera y cada uno se deja ver por su franja,
  // recortado con clip-path; su foto, su rótulo y su texto se colocan con transform. Al abrir otro, las
  // franjas se reparten en el mismo requestAnimationFrame (regla 27), con --ease-viaje y --dur-viaje.
  // Si la zona cabe en la pantalla bajo la barra, se queda fija mientras se baja (.fija en brasa.css) y
  // cada tramo de scroll abre el siguiente; tocar uno lo abre y lleva la página a su tramo, para que el
  // scroll y el panel abierto nunca se contradigan. Si no cabe —los móviles pequeños—, se abren al
  // tocarlos. Ya no pasan solos: con el scroll mandando, un reloj se pelearía con él.
  const paneles = document.querySelector("[data-paneles]");
  if (paneles) {
    // Los imprescindibles: los mismos platos y precios de la carta.
    const ulDest = paneles.querySelector("[data-destacados]");
    MENU.filter((d) => d.featured).forEach((d) => {
      const li = el("li"), n = el("span", null, d.name);
      if (d.description) n.append(el("small", null, d.description));
      li.append(n, el("b", null, fmt(d.price))); ulDest.append(li);
    });
    const ps = [...paneles.querySelectorAll("[data-panel]")], N = ps.length, zona = paneles.parentElement;
    const ancho = matchMedia("(min-width: 900px)"), sinMov = matchMedia("(prefers-reduced-motion: reduce)");
    // Lo que pesa el abierto frente a uno cerrado, el hueco entre franjas y el alto de una banda del móvil,
    // suelta o fija. TRAMO es el scroll que abre el siguiente, en partes del alto de la zona; HOLGURA, lo
    // que hay que pasarse de la mitad del tramo para cambiar, para que un temblor del dedo en la frontera no
    // abra y cierre; MARGEN, lo que queda entre la barra y la zona fija (los 16px de .fija en brasa.css).
    const PESO = 6.5, HUECO = 8, BANDA = 68, HUECO_FIJA = 6, BANDA_FIJA = 40, TRAMO = 0.75, HOLGURA = 0.08, MARGEN = 8;
    let abiertoP = 0, franjas = null, animP = 0, clave = "", tam = 0, hueco = HUECO, banda = BANDA;
    let fija = false, tramo = 0, arriba = 0, relleno = 0, pendiente = 0;
    // Dónde va cada franja con el panel i abierto: [inicio, tamaño] a lo largo del eje que toca.
    const reparto = (i) => {
      const total = ancho.matches ? paneles.clientWidth : paneles.clientHeight;
      const cerrado = ancho.matches ? (total - hueco * (N - 1)) / (PESO + N - 1) : banda;
      const grande = ancho.matches ? cerrado * PESO : total - (banda + hueco) * (N - 1);
      let a = 0;
      return ps.map((_, j) => { const t = j === i ? grande : cerrado, f = [a, t]; a += t + hueco; return f; });
    };
    const f1 = (v) => v.toFixed(1);
    const pintarP = (F) => {
      franjas = F;
      const h = ancho.matches, total = h ? paneles.clientWidth : paneles.clientHeight;
      ps.forEach((p, j) => {
        const [a, t] = F[j], resto = total - a - t, c = a + t / 2;
        p.style.clipPath = h ? `inset(0 ${f1(resto)}px 0 ${f1(a)}px round 4px)` : `inset(${f1(a)}px 0 ${f1(resto)}px 0 round 4px)`;
        p.querySelector(".pan-foto").style.transform = h ? `translateX(${f1(c - tam / 2)}px)` : `translateY(${f1(c - tam / 2)}px)`;
        p.querySelector(".pan-rotulo").style.transform = h ? `translateX(${f1(c)}px) translateX(-50%) rotate(180deg)` : `translateY(${f1(c)}px) translateY(-50%)`;
        p.querySelector(".pan-cont").style.transform = h ? `translateX(${f1(a)}px)` : `translateY(${f1(a)}px)`;
      });
    };
    const abrirP = (i, animar) => {
      abiertoP = i;
      ps.forEach((p, j) => { p.classList.toggle("abierto", j === i); p.querySelector(".pan-abrir").setAttribute("aria-expanded", String(j === i)); });
      cancelAnimationFrame(animP);
      const destino = reparto(i), dur = leeMs("--dur-viaje"), curva = leeCurva("--ease-viaje");
      if (!animar || !franjas || sinMov.matches || !(dur > 0) || !curva) { pintarP(destino); return; }
      const desde = franjas, t0 = performance.now();
      const paso = (ahora) => {
        const p = Math.min(1, Math.max(0, (ahora - t0) / dur)), e = curva(p);
        pintarP(destino.map(([a, t], j) => [desde[j][0] + (a - desde[j][0]) * e, desde[j][1] + (t - desde[j][1]) * e]));
        if (p < 1) animP = requestAnimationFrame(paso);
      };
      paso(t0);
    };
    // Lo que mide el texto de un panel, de la primera línea a la última.
    const texto = (p) => { const k = [...p.querySelector(".pan-cont").children]; return k[k.length - 1].getBoundingClientRect().bottom - k[0].getBoundingClientRect().top; };
    // Lo que se ha bajado desde que la zona se quedó fija: 0 al fijarse y (N-1)·tramo al soltarse.
    const bajado = () => arriba - (zona.getBoundingClientRect().top + relleno);
    // El panel que toca según el scroll: al bajar, pasada la HOLGURA; al recolocar, el que toque, sin animar.
    const segunScroll = (animar) => {
      if (!fija || !paneles.clientWidth) return;
      const f = Math.min(Math.max(bajado() / tramo, 0), N - 1), k = Math.round(f);
      if (k !== abiertoP && (!animar || Math.abs(f - abiertoP) > 0.5 + HOLGURA)) abrirP(k, animar);
    };
    // Primero se prueba fija. En el ordenador cabe si la zona, que mide lo que dice brasa.css, cabe en la
    // ventana con la barra; en el móvil la zona ya llena la pantalla, y cabe si el texto más largo cabe en
    // el panel abierto. Si no, suelta: en el móvil la zona mide lo que pide el texto más largo, abierto, más
    // las otras cuatro bandas. Y el panel abierto, lo que queda.
    const recolocar = () => {
      if (!paneles.clientWidth) return;
      const h = ancho.matches, alto = barra.getBoundingClientRect().height;
      zona.classList.add("fija"); paneles.style.removeProperty("--alto-paneles");
      hueco = h ? HUECO : HUECO_FIJA; banda = h ? BANDA : BANDA_FIJA;
      const z = paneles.clientHeight;
      fija = h ? z + alto + 2 * MARGEN <= innerHeight : Math.max(...ps.map(texto)) + 64 <= z - (banda + hueco) * (N - 1);
      if (fija) {
        tramo = Math.round(z * TRAMO); relleno = parseFloat(getComputedStyle(zona).paddingTop);
        arriba = alto + (h ? Math.max(MARGEN, (innerHeight - alto - z) / 2) : MARGEN);
        zona.style.setProperty("--recorrido", tramo * (N - 1) + "px"); zona.style.setProperty("--fijo-arriba", arriba + "px");
      } else {
        zona.classList.remove("fija"); hueco = HUECO; banda = BANDA;
        if (!h) paneles.style.setProperty("--alto-paneles", Math.round(Math.max(460, Math.max(...ps.map(texto)) + 64) + (BANDA + HUECO) * (N - 1)) + "px");
      }
      const F = reparto(abiertoP);
      tam = Math.max(...F.map((f) => f[1])); paneles.style.setProperty("--tam-abierto", tam + "px");
      cancelAnimationFrame(animP); pintarP(F);
      segunScroll(false);
    };
    // Se recoloca un fotograma después: en el móvil recolocar cambia el alto de la zona, y hacerlo dentro
    // del aviso de ResizeObserver lo vuelve a disparar en el mismo fotograma («loop completed…»). Cuenta el
    // ancho y, en el ordenador, el alto de la ventana; en el móvil el alto no, que cambia al deslizar con la
    // barra del navegador (regla 15), y la zona fija cuelga de 100svh, que no.
    const revisar = () => requestAnimationFrame(() => {
      const w = paneles.clientWidth, c = ancho.matches ? w + "x" + innerHeight : String(w);
      if (w && c !== clave) { clave = c; recolocar(); }
    });
    new ResizeObserver(revisar).observe(paneles);
    addEventListener("resize", revisar);
    document.fonts?.ready.then(recolocar);
    addEventListener("scroll", () => { if (!pendiente) pendiente = requestAnimationFrame(() => { pendiente = 0; segunScroll(true); }); }, { passive: true });
    ps.forEach((p, j) => p.querySelector(".pan-abrir").addEventListener("click", () => {
      abrirP(j, true);
      // Fija, la página salta al tramo del panel: la zona no se mueve, y el scroll que siga parte de ahí.
      if (fija) scrollTo(0, scrollY + j * tramo - bajado());
    }));
    abrirP(0, false);
  }

  const inicial = (location.hash || "").slice(1);
  if (inicial && inicial !== "inicio") ir(inicial, true); else { marcar(); revelar(); alScroll(); }

  // La cinta de la portada. Como en Entrada.astro: sin `autoplay` y con `preload="none"`, la arranca
  // esto, y no la arranca con «reducir movimiento» ni con ahorro de datos (regla 20 de
  // movimiento.md); entonces se queda el póster. Se carga la primera vez que se ve —quien entra por
  // #carta no la descarga— y se pausa fuera de la vista y con la pestaña oculta (regla 6). En el
  // ordenador, el corte ancho.
  const cinta = cine?.querySelector("video");
  if (cinta && !matchMedia("(prefers-reduced-motion: reduce)").matches && navigator.connection?.saveData !== true) {
    let cargada = false;
    new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) { cinta.pause(); return; }
      if (!cargada) {
        cargada = true;
        if (matchMedia("(min-width: 900px)").matches) {
          cinta.querySelectorAll("source").forEach((f) => {
            const ancha = f.type === "video/webm" ? cinta.dataset.anchoWebm : cinta.dataset.anchoMp4;
            if (ancha) f.src = ancha;
          });
        }
        cinta.load();
      }
      // En un iPhone con ahorro de energía, play() se rechaza: no es un error, se queda el póster.
      cinta.play().then(() => cinta.classList.add("puesta"), () => {});
    }).observe(cinta);
    document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") cinta.pause(); });
  }

  // Fondo: chispas de brasa que suben, como en una barbacoa (Mario, 2026-11-02, en lugar del lecho de
  // brasas de Rescoldo: «que suban ligeramente… que abarquen más el alto de la pantalla, sutilmente»).
  // En WebGL y a 30 fps: tres capas de chispas, de lejos —pequeñas, lentas y tenues— a cerca. Cada una
  // vive unos segundos en cualquier punto de la pantalla, se mece, parpadea y deja una estela corta;
  // abajo hay más y arriba se apagan, sin llegar a nada. Al bajar la página, las de cerca suben un poco
  // más que las de lejos. Es transparente donde no hay chispa, y en la portada deja ver el vídeo debajo.
  // La regla 6 de movimiento.md tiene su excepción escrita para este fondo.
  const cv = document.querySelector(".fondo");
  const gl = cv.getContext("webgl", { antialias: false, alpha: true, premultipliedAlpha: true });
  if (!gl) return;
  const VS = "attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}";
  // highp donde lo hay: con mediump, que en algunos móviles es de 16 bits, el reloj pierde precisión a
  // los pocos minutos y las chispas dan saltos.
  const FS = `#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 r;uniform float t,s,e;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
// Una capa: como mucho una chispa por celda (hay = la parte de celdas con chispa), y la rejilla entera
// sube a vel celdas por segundo; hondo es lo que sube de más al bajar la página.
float capa(vec2 px,float celda,float vel,float radio,float hay,float hondo,float semilla){
  vec2 p=px/celda;
  p.y-=t*vel+s*hondo/celda;
  vec2 id=floor(p),f=fract(p);
  float a=h(id+semilla);
  if(a>hay)return 0.;
  float b=h(id+semilla+3.7),c=h(id+semilla+9.1);
  vec2 sitio=vec2(.25+.5*b+.12*sin(t*(.5+.8*c)+6.2832*a/hay),.25+.5*c);
  vec2 d=(f-sitio)*celda;
  // El halo es redondo; solo el núcleo deja estela hacia abajo, y corta: estirado entero parecía una vela.
  float halo=exp(-dot(d,d)/(radio*radio*9.));
  if(d.y<0.)d.y*=.5;
  float nucleo=exp(-dot(d,d)/(radio*radio));
  float vida=fract(t*(.09+.12*b)+a*7.);
  float luz=smoothstep(0.,.12,vida)*(1.-smoothstep(.55,1.,vida));
  float parpadeo=.6+.4*sin(t*(6.+9.*c)+40.*b);
  return (nucleo+.22*halo)*luz*parpadeo*(.55+.9*c);
}
void main(){
  vec2 px=gl_FragCoord.xy/e,uv=gl_FragCoord.xy/r;
  float i=capa(px,64.,.55,1.2,.26,.1,1.)*.6+capa(px,110.,.5,1.7,.2,.22,17.)*.9+capa(px,170.,.42,2.3,.12,.38,41.)*1.2;
  i*=.2+.8*pow(1.-uv.y,1.4);
  float a=clamp(i,0.,1.);
  vec3 col=mix(vec3(1.,.42,.12),vec3(1.,.86,.6),smoothstep(.55,1.,i));
  gl_FragColor=vec4(col*a,a);
}`;
  const sh = (type, src) => { const o = gl.createShader(type); gl.shaderSource(o, src); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o)); return o; };
  const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr); gl.useProgram(pr);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(pr, "a"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U = {}; ["r", "t", "s", "e"].forEach((u) => (U[u] = gl.getUniformLocation(pr, u)));
  // A la resolución de la página, no a menos como el fuego: una chispa son dos o tres píxeles, y a
  // 0,6 se quedaba en una mancha.
  const ESCALA = 1;
  const size = () => { cv.width = Math.round(innerWidth * ESCALA); cv.height = Math.round(innerHeight * ESCALA); gl.viewport(0, 0, cv.width, cv.height); };
  // Cambiar el tamaño del lienzo lo borra: con «reducir movimiento», que no repinta solo, se fuerza
  // un fotograma nuevo, o las chispas desaparecerían hasta el siguiente cambio de sección.
  addEventListener("resize", () => { size(); last = -1e3; }); size();
  const quieto = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let last = -1e3;
  const frame = (ms) => {
    requestAnimationFrame(frame);
    // Con «reducir movimiento», un fotograma quieto, sin seguir al scroll. El reloj da la vuelta cada
    // hora: una vez por hora, las chispas cambian de sitio de golpe.
    if (ms - last < 32 || (quieto && last > 0)) return; last = ms;
    gl.uniform2f(U.r, cv.width, cv.height); gl.uniform1f(U.e, ESCALA);
    gl.uniform1f(U.t, quieto ? 20 : (ms / 1000) % 3600); gl.uniform1f(U.s, quieto ? 0 : scrollY);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };
  requestAnimationFrame(frame);
})();
