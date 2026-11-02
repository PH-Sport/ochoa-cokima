// Brasa: las secciones, La carta con la foto de cada parte, el estado de la cocina y el fondo de brasas.
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
    const nombre = document.querySelector(`.desplegable [data-ir="${actual}"]`)?.textContent || "";
    desp.querySelector("[data-actual]").textContent = nombre;
    desp.setAttribute("aria-label", `Secciones. Estás en ${nombre}`);
  };
  const revelar = () => {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px" });
    vistas[actual].querySelectorAll(".rv:not(.in)").forEach((x) => io.observe(x));
  };
  // El vídeo de la portada vive fuera de <main> para quedar debajo del fuego, así que no se esconde
  // con la sección: se esconde aquí, y al esconderlo su observador lo pausa.
  const cine = document.querySelector(".cine");
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

  // Fondo: el lecho de brasas de Rescoldo, en WebGL a poca resolución y a 30 fps. En la portada del
  // Inicio sube; en el resto se recoge al pie. Es transparente donde no hay fuego: sobre el suelo se
  // ve igual que opaco, porque el negro de antes era el mismo --ground, y en la portada deja ver el
  // vídeo debajo. La regla 6 de movimiento.md tiene su excepción escrita para este fondo.
  const cv = document.querySelector(".fondo");
  const gl = cv.getContext("webgl", { antialias: false, alpha: true, premultipliedAlpha: true });
  if (!gl) return;
  const VS = "attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}";
  const FS = `precision mediump float;
uniform vec2 r;uniform float t,s,bed;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
  return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*n(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return v;}
float ridge(vec2 p){float v=0.,a=.55;for(int i=0;i<3;i++){float k=1.-abs(n(p)*2.-1.);v+=a*k*k*k;p=p*2.1+vec2(3.1,1.7);a*=.5;}return v;}
vec3 ramp(float x){x=clamp(x,0.,1.2);
  vec3 c=mix(vec3(0.),vec3(.30,.035,.012),smoothstep(0.,.3,x));
  c=mix(c,vec3(.82,.2,.035),smoothstep(.28,.68,x));
  c=mix(c,vec3(1.,.52,.16),smoothstep(.62,.95,x));
  return mix(c,vec3(1.,.78,.48),smoothstep(.95,1.2,x));}
void main(){
  vec2 uv=gl_FragCoord.xy/r;
  float k=min(r.x,r.y);
  vec2 p=gl_FragCoord.xy/k*2.4+vec2(0.,s*.00035);
  vec2 q=vec2(fbm(p*.7+vec2(0.,t*.018)),fbm(p*.7+vec2(5.2,1.3)-vec2(t*.012,0.)));
  float f=fbm(p+1.8*q);
  float veta=pow(ridge(p*1.35+q*2.),2.2);
  float ph=n(p*.45+7.)*6.2832;
  float resp=.62+.38*sin(t*.85+ph);
  float lecho=smoothstep(bed,0.,uv.y);
  float calor=(veta*.95+smoothstep(.5,.82,f)*.55)*resp*lecho;
  calor*=(.82+.18*sin(t*.5))*1.08;
  vec3 col=ramp(calor);
  col+=vec3(.16,.045,.015)*lecho*lecho*(.55+.45*resp)*.75;
  gl_FragColor=vec4(col,clamp(max(col.r,max(col.g,col.b)),0.,1.));
}`;
  const sh = (type, src) => { const o = gl.createShader(type); gl.shaderSource(o, src); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o)); return o; };
  const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr); gl.useProgram(pr);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(pr, "a"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U = {}; ["r", "t", "s", "bed"].forEach((u) => (U[u] = gl.getUniformLocation(pr, u)));
  cv.classList.add("viva");
  const ESCALA = 0.6;
  // El ritmo del fuego: 1 es el del boceto. Mario lo pidió «ligeramente» más rápido el 2026-10-31.
  const VELOCIDAD = 1.25;
  const size = () => { cv.width = Math.round(innerWidth * ESCALA); cv.height = Math.round(innerHeight * ESCALA); gl.viewport(0, 0, cv.width, cv.height); };
  // Cambiar el tamaño del lienzo lo borra: con «reducir movimiento», que no repinta solo, se fuerza
  // un fotograma nuevo, o el fuego desaparecería hasta el siguiente cambio de sección.
  addEventListener("resize", () => { size(); last = -1e3; }); size();
  const quieto = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let bed = actual === "inicio" ? 0.54 : 0.3, last = -1e3;
  const frame = (ms) => {
    requestAnimationFrame(frame);
    if (ms - last < 32 || (quieto && last > 0 && Math.abs(bed - objetivo()) < 0.002)) return; last = ms;
    bed += (objetivo() - bed) * (quieto ? 1 : 0.04);
    gl.uniform2f(U.r, cv.width, cv.height); gl.uniform1f(U.t, quieto ? 20 : (ms / 1000) * VELOCIDAD); gl.uniform1f(U.s, scrollY); gl.uniform1f(U.bed, bed);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };
  const objetivo = () => (actual === "inicio" ? (scrollY < innerHeight * 0.5 ? 0.54 : 0.34) : 0.3);
  requestAnimationFrame(frame);
})();
