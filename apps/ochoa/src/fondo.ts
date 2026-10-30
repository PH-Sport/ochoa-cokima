// EL FONDO VIVO de la home: «Vermú y palabras» (2026-10-29).
//
// Mario lo pidió «como lo que hicimos con la web de PHSPORT, pero adaptado al
// lenguaje de esta web». De PHSPORT se toma la manera: un solo lienzo fijo detrás
// de toda la página, dibujado en directo con WebGL2, que no para, que responde al
// cursor con un muelle y que baja detrás del texto. Del local se toma lo que se
// dibuja, y son dos capas a la vez —la escena que eligió de las tres del probador—:
//
//  · el vermú: la red de luz que deja un vaso al sol sobre el mármol, solo sus
//    vetas, en rojo. Entera, en blanco, se veía como una neblina rosa;
//  · las palabras: las del espejo de la barra y las de la carta, en Yellowtail,
//    que se pintan a mano donde hay blanco libre, se quedan unos segundos y se
//    borran. Nunca más de tres a la vez (dos en el móvil). La luz es el cursor,
//    como en El relieve; sin ratón, pasea sola. Y la luz del vermú las enciende.
//
// Va en la home y en «Conócenos» y, desde el 2026-10-30, en La carta y Reservar
// solo con las vetas (`data-fondo="vetas"`; el porqué, en `Fondo.astro`).
//
// Las secciones blancas de la home son transparentes y dejan ver el lienzo; los
// bloques opacos —portada, cinta, manifiesto, pie, fotos— lo tapan. Lo que se
// probó y se descartó por el camino, en docs/ochoa-inicio-vivo.md. Es movimiento
// continuo en la GPU mientras se ve la página, y eso es una excepción escrita en
// docs/movimiento.md: con «reducir movimiento» se pinta un fotograma quieto, con
// la pestaña oculta no se pinta nada, y al salir de la página se suelta todo.

import { leeDuracion, leeDuraciones } from "./compas.ts";

/** Más resolución no se nota en algo tan tenue, y cuesta GPU (como en PHSPORT). */
const MAX_DPR = 1.5;
/** Y se pinta a esta fracción de esa resolución: con el vermú y las palabras a
 *  la vez, es lo que tenía la escena elegida en el probador. */
const ESCALA = 0.85;
/** Las palabras, en el orden en que salen. `raya`: el subrayado de pincel que
 *  llevan algunas en el espejo de la barra. */
const PALABRAS = [
  { t: "Tortilla" },
  { t: "Vermú", raya: true },
  { t: "Gildas" },
  { t: "Croquetas", raya: true },
  { t: "Ensaladilla", raya: true },
  { t: "Callos" },
  { t: "Bravas" },
];
/** El cuerpo de la letra en el atlas, en píxeles, y el margen para la sombra. */
const TAM = 140;
const PAD = 30;
const FUENTE = `${TAM}px Yellowtail`;
/** Búsqueda de hueco: si no cabe, se prueba algo más pequeña, hasta 70 sitios
 *  por tamaño. Medido en el probador: con menos, casi siempre faltaba hueco. */
const FACTORES = [1, 0.82, 0.68];
const CANDIDATOS = 70;
/** El segundo del vermú que se pinta, quieto, con «reducir movimiento». */
const QUIETO = 30;
/** Las vetas del vermú. En el ordenador, como las eligió Mario. Sin ratón
 *  (2026-10-29, Mario en su iPhone: «apenas se percibe», y no tiene cursor al
 *  que responder) van algo más rojas y algo más deprisa, la luz que pasea las
 *  enciende como las enciende allí el cursor —con esta presencia, que el cursor
 *  tiene entera—, y la red baja con la página una fracción de lo que se baja: un
 *  plano lejano, como las fotos del paralaje. Las palabras no: van fijas a la
 *  pantalla, y el porqué está en `nace`. */
const VETAS = {
  raton: { opacidad: 0.24, vel: 1, escala: 1, luz: 0, arrastre: 0 },
  tacto: { opacidad: 0.38, vel: 1.4, escala: 0.7, luz: 0.5, arrastre: 0.12 },
};

/** Lo que tapa el lienzo: los bloques opacos enteros y, dentro de las secciones
 *  blancas, cada texto, foto, botón, filete y el mapa. El resto es blanco libre.
 *  Se buscó primero preguntando a la página punto por punto y alguna palabra
 *  rozaba un texto: con la caja de cada pieza no se escapa nada. Del mosaico de
 *  La casa cuenta solo su caja: sus teselas miden el mosaico entero y sus fotos
 *  se salen de la ventana que se ve (las recorta un `clip-path`), así que
 *  contaban como si taparan el blanco de alrededor. Lo mismo con la tira de
 *  «Los que destacan»: en la rueda del ordenador hay tarjetas esperando fuera
 *  de la vista, recortadas por la tira, que no tapan nada. */
const TAPA =
  "#tombo-consent, .nav, .hero, .cinta, .manifesto, footer, :is(.highlights, .tasca, .casa, .visita, .conocenos) :is(img, figure, a, button, .btn, .rule, .mosaico, .strip, .mapa, .turnos, h1, h2, h3, h4, p, li, dt, dd, address, blockquote, .eyebrow):not(.mosaico *, .strip *)";
/** El texto que se protege: detrás de él el fondo baja al 28%. En La carta va
 *  cada tabla entera y no cada plato: el sombreador recibe 16 cajas, las más
 *  grandes, y con una por plato se quedarían platos sin proteger. El recuadro
 *  de Reservar no hace falta: es opaco. Ni La carta ni Reservar están en `TAPA`
 *  porque allí no salen palabras. De «Los que destacan» va la tira entera, por
 *  lo mismo y porque en la rueda del ordenador hay tarjetas esperando fuera de
 *  la vista: con una caja por tarjeta, el fondo bajaría también en los márgenes,
 *  detrás de nada. Lo de dentro de la tira se salta solo (`mideTexto`). */
const TEXTO =
  ":is(.highlights, .tasca, .casa, .visita, .conocenos) :is(h1, h2, h3, h4, p, li, dt, dd, address, figcaption, blockquote, .btn, .eyebrow), .highlights .strip, :is(.carta, .reservar) :is(h1, h2, p, table, dl, .eyebrow)";

const VS = `#version 300 es
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

const FS = `#version 300 es
precision highp float;
uniform float uPx;      // px internos por px CSS
uniform float uTime;
uniform vec3 uMouse;    // cursor en px CSS (origen abajo a la izquierda) y presencia
uniform vec3 uLuz;      // la luz de las palabras: el cursor o la que pasea, y su fuerza
uniform vec3 uRojo;     // --rojo
uniform vec3 uTinta;    // --ink
uniform vec4 uVeta;     // las vetas: opacidad, velocidad, cuánto han bajado con la página (px CSS) y escala
uniform int uN;
uniform vec4 uA[4];     // centro y media caja de cada palabra, px CSS
uniform vec4 uB[4];     // su sitio en el atlas (u0, v0 arriba, u1, v1 abajo)
uniform vec4 uC[4];     // coseno y seno del giro, pintado 0-1, sombra en px CSS
uniform vec4 uD[4];     // nivel de detalle del atlas y opacidad
uniform int uG;
uniform vec4 uGuarda[16]; // cajas de texto, px CSS, origen abajo a la izquierda
uniform sampler2D uAtlas;
out vec4 o;

float hash12(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }

// La red de luz que deja un vaso al sol (la de Velo en PHSPORT, tal cual).
float caustic(vec2 uv, float t) {
  vec2 p = mod(uv * 6.28318, 6.28318) - 250.0;
  vec2 i = p; float c = 1.0; float inten = 0.005;
  for (int n = 0; n < 5; n++) {
    float tt = t * (1.0 - (3.5 / float(n + 1)));
    i = p + vec2(cos(tt - i.x) + sin(tt + i.y), sin(tt - i.y) + cos(tt + i.x));
    c += 1.0 / length(vec2(p.x / (sin(i.x + tt) / inten), p.y / (cos(i.y + tt) / inten)));
  }
  c /= 5.0;
  c = 1.17 - pow(c, 1.4);
  return pow(abs(c), 8.0);
}

float cerca(vec2 p, vec2 c, float r) { vec2 d = p - c; return exp(-dot(d, d) / (2.0 * r * r)); }

// Una capa encima de otra, con alfa premultiplicado.
void sobre(inout vec4 acc, vec3 c, float a) { acc.rgb = c * a + acc.rgb * (1.0 - a); acc.a = a + acc.a * (1.0 - a); }

// Detrás del texto el fondo baja al 28 %, con un fundido de 36 px: que nunca ensucie
// lo que se lee (en PHSPORT, la luz baja fuera del titular).
float guarda(vec2 p) {
  float g = 1.0;
  for (int i = 0; i < 16; i++) {
    if (i >= uG) break;
    vec4 r = uGuarda[i];
    vec2 d = max(max(r.xy - p, p - r.zw), 0.0);
    g = min(g, mix(0.28, 1.0, smoothstep(0.0, 36.0, length(d))));
  }
  return g;
}

float atlas(int i, vec2 q) {
  vec2 n = q / uA[i].zw;
  if (abs(n.x) > 1.0 || abs(n.y) > 1.0) return 0.0;
  vec4 b = uB[i];
  vec2 uv = vec2(mix(b.x, b.z, n.x * 0.5 + 0.5), mix(b.w, b.y, n.y * 0.5 + 0.5));
  return textureLod(uAtlas, uv, uD[i].x).a;
}

void main() {
  vec2 p = gl_FragCoord.xy / uPx;
  vec4 acc = vec4(0.0);
  // El vermú. En blanco, la red entera se ve como una neblina rosa: solo se dejan
  // las venas con luz, más finas que en PHSPORT, y queda como el mármol en rojo.
  vec2 pv = p - vec2(0.0, uVeta.z);
  vec2 r = vec2(pv.x + pv.y, pv.x - pv.y) * 0.70710678;
  float m = uMouse.z * cerca(p, uMouse.xy, 240.0);
  float tv = uTime * uVeta.y;
  float k1 = caustic(r / ((460.0 - m * 120.0) * uVeta.w), tv * 0.06 + 23.0);
  float k2 = caustic(r / (290.0 * uVeta.w) + 0.37, tv * 0.045 + 11.0);
  float k = k1 * 0.7 + k2 * 0.3;
  sobre(acc, uRojo, smoothstep(0.14, 1.0, k) * (uVeta.x + m * 0.2));
  // Las palabras, encima.
  float brillo = uLuz.z * cerca(p, uLuz.xy, 250.0);
  for (int i = 0; i < 4; i++) {
    if (i >= uN) break;
    vec2 d = p - uA[i].xy;
    vec2 cs = uC[i].xy;
    vec2 q = vec2(cs.x * d.x + cs.y * d.y, -cs.y * d.x + cs.x * d.y);
    if (abs(q.x) > uA[i].z || abs(q.y) > uA[i].w) continue;
    // La luz: la sombra cae hacia el otro lado y crece cuanto más cerca está
    // (como El relieve en la barra).
    vec2 dl = uA[i].xy - uLuz.xy;
    float dist = length(dl) + 1.0;
    vec2 dir = dl / dist;
    vec2 dirL = vec2(cs.x * dir.x + cs.y * dir.y, -cs.y * dir.x + cs.x * dir.y);
    float junto = uLuz.z * exp(-dist * dist / (2.0 * 460.0 * 460.0));
    vec2 som = dirL * uC[i].w * (0.4 + 0.6 * junto);
    float lit = clamp(brillo + smoothstep(0.1, 1.0, k) * 1.6, 0.0, 1.2);
    // El pincel: avanza de izquierda a derecha con el borde vivo.
    float x01 = q.x / uA[i].z * 0.5 + 0.5;
    float frente = uC[i].z * 1.14 - 0.07 + 0.016 * sin(q.y * 0.2 + float(i) * 1.7);
    float pint = (1.0 - smoothstep(frente - 0.04, frente, x01)) * uD[i].y;
    float f = atlas(i, q) * pint;
    float s = atlas(i, q - som) * pint;
    float filo = clamp(f - atlas(i, q + dirL * 1.5) * pint, 0.0, 1.0);
    sobre(acc, uTinta, s * (0.04 + 0.08 * lit));
    sobre(acc, uRojo, f * (0.1 + 0.3 * lit));
    sobre(acc, vec3(1.0), filo * (0.2 + 0.6 * lit));
  }
  acc *= guarda(p);
  acc.rgb += (hash12(gl_FragCoord.xy + fract(uTime) * 91.7) - 0.5) / 255.0 * acc.a;
  o = clamp(acc, 0.0, 1.0);
}`;

type Medida = { t: string; raya?: boolean; ancho: number; alto: number; uv: [number, number, number, number] };
type Viva = { m: Medida; cx: number; cy: number; hx: number; hy: number; k: number; sombra: number; giro: number; fase: number; desde: number; vida: number; fin: number };

/** Un color de los tokens (`#c6222b`) como tres canales de 0 a 1. */
function color(token: string): [number, number, number] {
  const v = getComputedStyle(document.documentElement).getPropertyValue(token).trim().replace("#", "");
  const n = parseInt(v.length === 3 ? [...v].map((c) => c + c).join("") : v, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

export function montaFondo(): (() => void) | null {
  const lienzo = document.querySelector<HTMLCanvasElement>("[data-fondo]");
  if (!lienzo) return null;
  const gl = lienzo.getContext("webgl2", {
    alpha: true,
    premultipliedAlpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: "low-power",
  });
  /* Sin WebGL2 la página queda en su blanco de siempre: el lienzo es transparente. */
  if (!gl) return null;

  const compila = (tipo: number, src: string) => {
    const s = gl.createShader(tipo);
    if (!s) return null;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.warn("[fondo]", gl.getShaderInfoLog(s));
      return null;
    }
    return s;
  };
  const vs = compila(gl.VERTEX_SHADER, VS);
  const fs = compila(gl.FRAGMENT_SHADER, FS);
  const prog = gl.createProgram();
  if (!vs || !fs || !prog) return null;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.warn("[fondo]", gl.getProgramInfoLog(prog));
    return null;
  }
  gl.useProgram(prog);
  gl.bindVertexArray(gl.createVertexArray());
  const U = Object.fromEntries(
    ["uPx", "uTime", "uMouse", "uLuz", "uRojo", "uTinta", "uVeta", "uN", "uA", "uB", "uC", "uD", "uG", "uGuarda", "uAtlas"].map((n) => [n, gl.getUniformLocation(prog, n)]),
  );
  gl.uniform1i(U.uAtlas, 0);
  gl.uniform3f(U.uRojo, ...color("--rojo"));
  gl.uniform3f(U.uTinta, ...color("--ink"));

  const reducido = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const sinRaton = matchMedia("(hover: none)");
  const VIDAS = leeDuraciones("--vidas-palabra");
  const ESPERAS = leeDuraciones("--esperas-palabra");
  const PINCEL = leeDuracion("--dur-pincel");
  const BORRADO = leeDuracion("--dur-borrado");
  const REINTENTO = leeDuracion("--reintento-palabra");
  const REVISA = leeDuracion("--revisa-palabra");

  const abort = new AbortController();
  const { signal } = abort;
  let vivo = true;

  /* ------------------------------------------------ el atlas de las palabras */
  let medidas: Medida[] = [];
  const tex = gl.createTexture();
  const construyeAtlas = () => {
    const c = document.createElement("canvas");
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.font = FUENTE;
    const previas = PALABRAS.map((w) => {
      const m = ctx.measureText(w.t);
      const raya = w.raya ? TAM * 0.3 : 0;
      return {
        ...w,
        izq: m.actualBoundingBoxLeft,
        der: m.actualBoundingBoxRight,
        arr: m.actualBoundingBoxAscent,
        aba: m.actualBoundingBoxDescent,
        ancho: Math.ceil(m.actualBoundingBoxLeft + m.actualBoundingBoxRight + 2 * PAD),
        alto: Math.ceil(m.actualBoundingBoxAscent + m.actualBoundingBoxDescent + raya + 2 * PAD),
      };
    });
    const ANCHO = Math.max(...previas.map((m) => m.ancho));
    const ALTO = previas.reduce((s, m) => s + m.alto, 0);
    c.width = ANCHO;
    c.height = ALTO;
    let y = 0;
    const listas: Medida[] = [];
    for (const m of previas) {
      ctx.font = FUENTE;
      ctx.fillStyle = "#fff";
      ctx.textBaseline = "alphabetic";
      const base = y + PAD + m.arr;
      ctx.fillText(m.t, PAD + m.izq, base);
      if (m.raya) {
        /* El subrayado de pincel que llevan las palabras del espejo */
        const x0 = PAD + TAM * 0.12;
        const x1 = PAD + m.izq + m.der - TAM * 0.04;
        const yy = base + m.aba + TAM * 0.12;
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = TAM * 0.055;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(x0, yy + TAM * 0.05);
        ctx.bezierCurveTo(x0 + (x1 - x0) * 0.32, yy - TAM * 0.07, x0 + (x1 - x0) * 0.62, yy + TAM * 0.09, x1, yy - TAM * 0.04);
        ctx.stroke();
      }
      listas.push({ t: m.t, raya: m.raya, ancho: m.ancho, alto: m.alto, uv: [0, y / ALTO, m.ancho / ANCHO, (y + m.alto) / ALTO] });
      y += m.alto;
    }
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    medidas = listas;
  };

  /* ---------------------------------------- dónde hay blanco libre ahora mismo */
  const tapas = () => {
    const H = innerHeight;
    const out: DOMRect[] = [];
    for (const el of document.querySelectorAll(TAPA)) {
      const b = el.getBoundingClientRect();
      if (b.width < 1 || b.height < 1 || b.bottom < 0 || b.top > H) continue;
      out.push(b);
    }
    return out;
  };
  /* Cuánto de la caja de las letras (sin el margen del atlas) cae sobre algo, con
     10 px de aire alrededor de cada pieza; 0 es que está toda en blanco. */
  const tapado = (cx: number, cy: number, hx: number, hy: number, cajas: DOMRect[], aire = 10) => {
    const x0 = cx - hx * 0.9;
    const x1 = cx + hx * 0.9;
    const y0 = cy - hy * 0.86;
    const y1 = cy + hy * 0.86;
    let area = 0;
    for (const b of cajas) {
      const ox = Math.min(x1, b.right + aire) - Math.max(x0, b.left - aire);
      const oy = Math.min(y1, b.bottom + aire) - Math.max(y0, b.top - aire);
      if (ox > 0 && oy > 0) area += ox * oy;
    }
    return area / ((x1 - x0) * (y1 - y0));
  };

  /* ----------------------------------------------- las palabras, una a una */
  /* Cada palabra se pinta donde en ese momento hay blanco libre, vive unos
     segundos y se va. Van fijas a la pantalla, como pintadas en un cristal por el
     que se mira la página: el contenido pasa por delante al bajar. Atadas al
     scroll, en el iPhone el lienzo llega tarde y bailarían. */
  let semilla = 29;
  const azar = () => ((semilla = (semilla * 9301 + 49297) % 233280), semilla / 233280);
  const vivas: Viva[] = [];
  let turno = 0;
  let nacimientos = 0;
  let proxima = 0;
  const facil = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  const nace = (ahora: number) => {
    const W = innerWidth;
    const H = innerHeight;
    const movil = W < 861;
    const tope = (document.querySelector(".nav")?.getBoundingClientRect().bottom || 60) + 14;
    let m: Medida | null = null;
    for (let i = 0; i < medidas.length; i++) {
      const c = medidas[(turno + i) % medidas.length];
      if (!vivas.some((v) => v.m === c)) {
        m = c;
        turno = (turno + i + 1) % medidas.length;
        break;
      }
    }
    if (!m) return false;
    const cajas = tapas();
    for (const factor of FACTORES) {
      const tam = (movil ? 40 + azar() * 10 : 74 + azar() * 32) * factor;
      const k = tam / TAM;
      const hx = (m.ancho / 2) * k;
      const hy = (m.alto / 2) * k;
      if (hx * 2 > W - 32) continue;
      let sitio: { cx: number; cy: number } | null = null;
      for (let n = 0; n < CANDIDATOS; n++) {
        const cx = 16 + hx + azar() * (W - 32 - hx * 2);
        const cy = tope + hy + azar() * Math.max(1, H - tope - 16 - hy * 2);
        if (vivas.some((v) => Math.abs(v.cx - cx) < v.hx + hx + 24 && Math.abs(v.cy - cy) < v.hy + hy + 24)) continue;
        if (tapado(cx, cy, hx, hy, cajas) === 0) {
          sitio = { cx, cy };
          break;
        }
      }
      if (sitio) {
        vivas.push({
          m,
          ...sitio,
          hx,
          hy,
          k,
          sombra: tam * 0.075,
          giro: ((-7 + (azar() - 0.5) * 5) * Math.PI) / 180,
          fase: azar() * 6.283,
          /* Con «reducir movimiento» nace ya pintada: sin pincel. */
          desde: reducido ? -1e9 : ahora,
          vida: VIDAS[nacimientos % VIDAS.length],
          fin: 0,
        });
        nacimientos++;
        return true;
      }
    }
    return false;
  };
  /* Si al bajar la página una palabra queda tapada por texto o fotos, se va antes. */
  let revisada = 0;
  const revisa = (ahora: number) => {
    if (ahora - revisada < REVISA) return;
    revisada = ahora;
    const cajas = tapas();
    for (const v of vivas) if (!v.fin && tapado(v.cx, v.cy, v.hx, v.hy, cajas, 0) > 0.12) v.fin = ahora;
  };

  /* ------------------------------------------------- el texto que se protege */
  let cajasTexto: { el: Element; x0: number; x1: number; y0: number; y1: number }[] = [];
  const mideTexto = () => {
    const vistas: typeof cajasTexto = [];
    for (const el of document.querySelectorAll(TEXTO)) {
      const b = el.getBoundingClientRect();
      if (b.width < 4 || b.height < 4) continue;
      if (vistas.some((v) => v.el.contains(el))) continue;
      vistas.push({ el, x0: b.left, x1: b.right, y0: b.top + scrollY, y1: b.bottom + scrollY });
    }
    cajasTexto = vistas;
  };

  /* --------------------------------------------------------- tamaño y ratón */
  let pxRatio = 1;
  const ajusta = () => {
    pxRatio = Math.min(devicePixelRatio || 1, MAX_DPR) * ESCALA;
    const w = Math.max(1, Math.round(lienzo.clientWidth * pxRatio));
    const h = Math.max(1, Math.round(lienzo.clientHeight * pxRatio));
    if (lienzo.width !== w || lienzo.height !== h) {
      lienzo.width = w;
      lienzo.height = h;
    }
    mideTexto();
    pide();
  };
  const raton = { x: 0, y: 0, tx: 0, ty: 0, vx: 0, vy: 0, z: 0, tz: 0 };
  addEventListener(
    "pointermove",
    (e) => {
      if (e.pointerType !== "mouse") return;
      if (raton.tz === 0 && raton.z < 0.01) {
        raton.x = e.clientX;
        raton.y = e.clientY;
      }
      raton.tx = e.clientX;
      raton.ty = e.clientY;
      raton.tz = 1;
      if (reducido) pide();
    },
    { passive: true, signal },
  );
  document.documentElement.addEventListener("pointerleave", () => (raton.tz = 0), { signal });
  /* Muelle crítico, como en PHSPORT: el cursor llega amortiguado, sin saltos. Es
     física y no una duración: la rigidez 9 es la de allí. */
  const muelle = (dt: number) => {
    const w = 9;
    raton.vx += (w * w * (raton.tx - raton.x) - 2 * w * raton.vx) * dt;
    raton.vy += (w * w * (raton.ty - raton.y) - 2 * w * raton.vy) * dt;
    raton.x += raton.vx * dt;
    raton.y += raton.vy * dt;
    raton.z += (raton.tz - raton.z) * (1 - Math.exp(-dt * 4));
  };

  /* -------------------------------------------------------------- el dibujo */
  const A = new Float32Array(16);
  const B = new Float32Array(16);
  const C = new Float32Array(16);
  const D = new Float32Array(16);
  const G = new Float32Array(64);
  const dibuja = (t: number, ahora: number) => {
    const W = lienzo.clientWidth;
    const H = lienzo.clientHeight;
    gl.viewport(0, 0, lienzo.width, lienzo.height);
    gl.uniform1f(U.uPx, pxRatio);
    gl.uniform1f(U.uTime, t);
    const mx = reducido ? raton.tx : raton.x;
    const my = reducido ? raton.ty : raton.y;
    const mz = reducido ? raton.tz : raton.z;
    /* La luz de las palabras: el cursor si lo hay; si no, una que pasea despacio y
       sin compás (los periodos no casan entre sí). */
    const lx = W * (0.5 + 0.34 * Math.sin(t * 0.043) + 0.1 * Math.sin(t * 0.017 + 1.3));
    const ly = H * (0.5 + 0.3 * Math.cos(t * 0.031) + 0.12 * Math.sin(t * 0.023 + 0.4));
    gl.uniform3f(U.uLuz, lx + (mx - lx) * mz, H - (ly + (my - ly) * mz), 0.7 + 0.3 * mz);
    /* Las vetas: sin ratón, las enciende la luz que pasea, y bajan con la página. */
    const veta = sinRaton.matches ? VETAS.tacto : VETAS.raton;
    if (veta.luz) gl.uniform3f(U.uMouse, lx, H - ly, veta.luz);
    else gl.uniform3f(U.uMouse, mx, H - my, mz);
    gl.uniform4f(U.uVeta, veta.opacidad, veta.vel, reducido ? 0 : scrollY * veta.arrastre, veta.escala);
    let n = 0;
    if (medidas.length) {
      if (!reducido) revisa(ahora);
      for (let i = vivas.length - 1; i >= 0; i--) {
        const v = vivas[i];
        if (!v.fin && ahora - v.desde > v.vida && !reducido) v.fin = ahora;
        if (v.fin && ahora - v.fin > BORRADO) vivas.splice(i, 1);
      }
      const max = W < 861 ? 2 : 3;
      if (vivas.length < max && ahora >= proxima) proxima = ahora + (nace(ahora) ? ESPERAS[nacimientos % ESPERAS.length] : REINTENTO);
      for (const v of vivas) {
        const pintado = facil(Math.min(1, (ahora - v.desde) / PINCEL));
        const opacidad = v.fin ? 1 - facil(Math.min(1, (ahora - v.fin) / BORRADO)) : 1;
        /* Flotan unos píxeles, despacio y sin compás; quietas si se pide menos
           movimiento. */
        const flota = reducido ? 0 : 1;
        const cx = v.cx + Math.sin(t * 0.19 + v.fase) * 6 * flota;
        const cy = v.cy + Math.cos(t * 0.13 + v.fase * 1.3) * 5 * flota;
        const giro = v.giro + Math.sin(t * 0.11 + v.fase) * 0.012 * flota;
        A.set([cx, H - cy, v.hx, v.hy], n * 4);
        B.set(v.m.uv, n * 4);
        C.set([Math.cos(giro), Math.sin(giro), pintado, v.sombra], n * 4);
        D.set([Math.max(0, Math.log2(1 / (v.k * pxRatio))), opacidad, 0, 0], n * 4);
        n++;
      }
    }
    gl.uniform1i(U.uN, n);
    if (n) {
      gl.uniform4fv(U.uA, A);
      gl.uniform4fv(U.uB, B);
      gl.uniform4fv(U.uC, C);
      gl.uniform4fv(U.uD, D);
    }
    let g = 0;
    const cajas = cajasTexto
      .map((c) => ({ x0: c.x0, x1: c.x1, top: c.y0 - scrollY, bot: c.y1 - scrollY }))
      .filter((c) => c.bot > -40 && c.top < H + 40)
      .sort((a, b) => (b.x1 - b.x0) * (b.bot - b.top) - (a.x1 - a.x0) * (a.bot - a.top));
    for (const c of cajas) {
      if (g >= 16) break;
      G.set([c.x0, H - c.bot, c.x1, H - c.top], g * 4);
      g++;
    }
    gl.uniform1i(U.uG, g);
    if (g) gl.uniform4fv(U.uGuarda, G);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  /* Un fotograma tras otro mientras se vea la página. Con la pestaña oculta no se
     pide ninguno; con «reducir movimiento», solo cuando algo cambia (el tamaño,
     el scroll o el ratón), y siempre el mismo instante del vermú. */
  let raf = 0;
  let antes = performance.now();
  const origen = antes;
  const fotograma = (ahora: number) => {
    raf = 0;
    if (!vivo || document.hidden) return;
    muelle(Math.min(0.05, (ahora - antes) / 1000));
    antes = ahora;
    dibuja(reducido ? QUIETO : (ahora - origen) / 1000, ahora);
    if (!reducido) raf = requestAnimationFrame(fotograma);
  };
  function pide() {
    if (!raf && vivo && !document.hidden) {
      antes = performance.now();
      raf = requestAnimationFrame(fotograma);
    }
  }
  if (reducido) addEventListener("scroll", pide, { passive: true, signal });
  document.addEventListener("visibilitychange", pide, { signal });
  const ojoLienzo = new ResizeObserver(ajusta);
  ojoLienzo.observe(lienzo);
  const ojoPagina = new ResizeObserver(() => mideTexto());
  ojoPagina.observe(document.body);
  /* Si la GPU pierde el contexto (un reinicio del controlador, demasiadas
     pestañas), se deja de pintar: el lienzo queda transparente y la página, en
     su blanco. */
  lienzo.addEventListener(
    "webglcontextlost",
    () => {
      vivo = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    },
    { signal },
  );

  ajusta();
  /* Las palabras esperan a su letra, y solo salen en ella: si Yellowtail no
     llega, el vermú sigue solo en vez de pintarlas con otra. Mientras tanto no se
     espera a nada: el vermú arranca ya. Sin atlas no nace ninguna, y así quedan
     solo las vetas donde el lienzo lo pide (`data-fondo="vetas"`). */
  if (lienzo.dataset.fondo !== "vetas")
    document.fonts
      .load(FUENTE)
      .then(() => {
        if (!vivo || !document.fonts.check(FUENTE)) return;
        construyeAtlas();
        pide();
      })
      .catch(() => {});

  return () => {
    vivo = false;
    abort.abort();
    if (raf) cancelAnimationFrame(raf);
    ojoLienzo.disconnect();
    ojoPagina.disconnect();
    /* La página se va: se devuelve la GPU en vez de esperar a que el navegador
       recoja el contexto. */
    gl.getExtension("WEBGL_lose_context")?.loseContext();
  };
}
