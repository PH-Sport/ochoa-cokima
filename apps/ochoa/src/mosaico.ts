// EL MOSAICO VIVO de La casa (2026-10-29). Mario pidió que La casa fuera «algo
// más animada/interactiva»: que las fotos salgan más a menudo y «que cambiasen de
// forma y de posición según van saliendo». Lo eligió en la segunda ronda del
// probador —«me gusta mucho»— frente al muro que cambiaba una foto cada 4 s.
//
// Cuatro teselas se reparten una rejilla y se recomponen solas: cada vez, la
// grande se encoge y una vecina crece en su hueco con una foto nueva. Así cada
// una cambia de forma y de sitio sin cruzarse con ninguna: la que se encoge va
// encima y arranca antes, y la que crece sale por debajo un poco después. Que dos
// pequeñas se cambiaran el sitio a la vez se probó y se quitó: se atravesaban.
//
// Nunca se estira una foto. Cada tesela es una ventana recortada con `clip-path`
// y la foto va debajo, colocada con `transform` a la escala que la cubre (con un
// 10% de sobra); las dos se mueven con la misma curva y la ventana queda siempre
// cubierta. Solo `transform`, `opacity`, `clip-path` y el desenfoque de Mochi en
// la foto que entra, que es una excepción escrita en docs/movimiento.md (regla 2).
// La ventana y su foto las mueve este script, en el mismo fotograma, y no dos
// transiciones de CSS: ver `lleva`, más abajo, que cuenta por qué.
//
// Como todo lo que se mueve solo (regla 6): no corre con menos del 30% a la
// vista ni con la pestaña oculta; con el ratón encima se para; y al pulsar una
// foto —o con Intro o Espacio— se pone grande y desde ahí ya no se mueve sola.
// Con «reducir movimiento» no arranca, y pulsar recoloca sin animación.
//
// Sin JavaScript queda una rejilla quieta con las cuatro primeras fotos: el
// marcado es el mismo, y el modo vivo lo enciende `data-vivo`.

import { leeCurva, leeDuracion, leeDuraciones } from "./compas.ts";

type Celda = [columna: number, fila: number];
type Foto = {
  src: string;
  srcset: string;
  w: number;
  h: number;
  encuadre: string;
  nombre: string;
  alt: string;
  fx: number;
  fy: number;
  url?: string;
  lista?: boolean;
  pedida?: boolean;
};
type Rect = { x: number; y: number; w: number; h: number };
type Paso = { dur: number; curva: (x: number) => number; retraso: number };
/** Algo que este script mueve fotograma a fotograma: una lista de números —el
 *  hueco de una tesela, la posición y la escala de una foto— y cómo se pinta. */
type Pieza = {
  vista: number[] | null;
  mov: { de: number[]; a: number[]; t0: number; pa: Paso } | null;
  pinta: (v: number[]) => void;
};
type Tesela = {
  fig: HTMLElement;
  sombra: HTMLElement;
  borde: HTMLElement;
  ventana: HTMLElement;
  mueve: HTMLElement;
  imgs: HTMLImageElement[];
  nombre: HTMLElement;
  frente: number;
  foto: Foto | null;
  rect: Rect | null;
  hueco: number;
  paso?: Paso;
};

/** Las composiciones, en celdas [columna, fila], una lista por tesela. En el
 *  ordenador son tres columnas y dos filas, y el texto ocupa la celda [0, 0]; en
 *  el móvil, dos columnas y tres filas, todas de fotos. */
const COMP_ORDENADOR: Celda[][][] = [
  [[[1, 0], [2, 0]], [[0, 1]], [[1, 1]], [[2, 1]]],
  [[[1, 0]], [[2, 0], [2, 1]], [[0, 1]], [[1, 1]]],
  [[[1, 0]], [[2, 0]], [[0, 1]], [[1, 1], [2, 1]]],
  [[[1, 0]], [[2, 0]], [[0, 1], [1, 1]], [[2, 1]]],
  [[[1, 0], [1, 1]], [[2, 0]], [[0, 1]], [[2, 1]]],
];
const COMP_MOVIL: Celda[][][] = [
  [[[0, 0], [1, 0]], [[0, 1]], [[1, 1], [1, 2]], [[0, 2]]],
  [[[0, 0], [0, 1]], [[1, 0]], [[1, 1]], [[0, 2], [1, 2]]],
  [[[0, 0]], [[1, 0], [1, 1]], [[0, 1], [0, 2]], [[1, 2]]],
  [[[0, 0]], [[1, 0]], [[0, 1], [1, 1]], [[0, 2], [1, 2]]],
  [[[0, 0], [1, 0]], [[0, 1], [0, 2]], [[1, 1]], [[1, 2]]],
];
/** La foto cubre su ventana con un 10% de sobra: es lo que se desplaza con el
 *  ratón encima sin enseñar nunca el borde. */
const MARGEN = 1.1;
/** Las capas de cada tesela sobresalen esto del mosaico, en píxeles, para que
 *  quepa la sombra roja. */
const E = 12;
/** El ancho, en píxeles, al que se coloca cada foto antes de escalarla. */
const BASE = 1000;
/** Lo más que se desplaza la foto con el ratón encima, en píxeles. */
const ASOMA = { x: 10, y: 8 };

const limita = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
/** Todas las maneras de repartir las cuatro teselas entre los cuatro huecos. */
const PERMS = (() => {
  const out: number[][] = [];
  const rec = (hecho: number[], resto: number[]): void => {
    if (!resto.length) {
      out.push(hecho);
      return;
    }
    resto.forEach((x, i) => rec([...hecho, x], [...resto.slice(0, i), ...resto.slice(i + 1)]));
  };
  rec([], [0, 1, 2, 3]);
  return out;
})();
const centro = (r: Rect) => [r.x + r.w / 2, r.y + r.h / 2];
const dist2 = (a: Rect, b: Rect) => {
  const [ax, ay] = centro(a);
  const [bx, by] = centro(b);
  return (ax - bx) ** 2 + (ay - by) ** 2;
};
const area = (r: Rect) => r.w * r.h;

export function montaMosaico(raiz: HTMLElement): (() => void) | null {
  const bloque = raiz.querySelector<HTMLElement>(".texto");
  const mosaico = raiz.querySelector<HTMLElement>(".mosaico");
  const figuras = mosaico ? [...mosaico.querySelectorAll<HTMLElement>(".tesela")] : [];
  if (!bloque || !mosaico || figuras.length !== 4) return null;

  let fotos: Foto[];
  try {
    fotos = (JSON.parse(mosaico.dataset.fotos ?? "[]") as Omit<Foto, "fx" | "fy">[]).map((f) => {
      const [px, py] = f.encuadre.split(/\s+/).map((v) => parseFloat(v) / 100);
      return { ...f, fx: Number.isFinite(px) ? px : 0.5, fy: Number.isFinite(py) ? py : 0.5 };
    });
  } catch {
    return null;
  }
  if (fotos.length < 5) return null;
  const SIZES = mosaico.dataset.sizes ?? "100vw";
  const VER = mosaico.dataset.ver ?? "";

  const reducido = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ancho = matchMedia("(min-width: 861px)");
  const MUEVE = leeDuracion("--dur-mosaico");
  const ELIGE = leeDuracion("--dur-mosaico-elige");
  const RESPIROS = leeDuraciones("--respiros-mosaico");
  const PRIMERA = leeDuracion("--espera-mosaico");
  /* Recorre el mosaico entero, así que va con la curva del telón (regla 9). */
  const TELON = leeCurva("--ease-telon");

  const abort = new AbortController();
  const { signal } = abort;
  const relojes = new Set<ReturnType<typeof setTimeout>>();
  const luego = (fn: () => void, ms: number) => {
    const r = setTimeout(() => {
      relojes.delete(r);
      fn();
    }, ms);
    relojes.add(r);
  };

  /* Las fotos se piden cuando el mosaico se acerca, no al cargar la página:
     quien no baja hasta aquí no las paga. Cada una entra en el turno solo cuando
     ya está entera, así que ninguna llega a medias. */
  const pide = (f: Foto) => {
    if (f.pedida) return;
    f.pedida = true;
    const im = new Image();
    im.decoding = "async";
    im.sizes = SIZES;
    im.srcset = f.srcset;
    im.src = f.src;
    im.decode()
      .then(() => {
        f.url = im.currentSrc || im.src;
        f.lista = true;
      })
      .catch(() => {});
  };

  /* ---------------------------------------------------------- las teselas */
  /* El marcado trae la ventana, la foto y la chapa de cada tesela; aquí se le
     ponen la sombra y el marco —que solo existen en el modo vivo— y una segunda
     foto, la que entra por debajo cuando le toca cambiar. */
  const fotoDe = new WeakMap<HTMLImageElement, Foto>();
  const teselas: Tesela[] = figuras.map((fig, i) => {
    const ventana = fig.querySelector<HTMLElement>(".t-ventana")!;
    const mueve = fig.querySelector<HTMLElement>(".t-mueve")!;
    const nombre = fig.querySelector<HTMLElement>(".t-nombre")!;
    const sombra = document.createElement("span");
    sombra.className = "t-sombra";
    const borde = document.createElement("span");
    borde.className = "t-borde";
    fig.prepend(sombra, borde);
    const primera = mueve.querySelector<HTMLImageElement>("img")!;
    const segunda = document.createElement("img");
    segunda.alt = "";
    segunda.decoding = "async";
    mueve.append(segunda);
    /* Dentro de un botón, la foto es decoración: su descripción va en el nombre
       del botón, que cambia con ella. */
    primera.alt = "";
    ventana.setAttribute("role", "button");
    ventana.tabIndex = 0;
    fotoDe.set(primera, fotos[i]);
    return { fig, sombra, borde, ventana, mueve, imgs: [primera, segunda], nombre, frente: 0, foto: fotos[i], rect: null, hueco: i };
  });
  const cola = fotos.slice(4);
  /* Las cuatro de arriba ya las trae el marcado: cuentan como listas en cuanto
     llegan, y desde entonces se reutiliza la misma dirección. */
  teselas.forEach((t) => {
    const img = t.imgs[0];
    const f = t.foto!;
    const marca = () => {
      f.url = img.currentSrc || img.src;
      f.lista = true;
      f.pedida = true;
    };
    if (img.complete && img.naturalWidth) marca();
    else img.addEventListener("load", marca, { once: true, signal });
  });

  let geo: { W: number; alto: number; gap: number; col: number; filas: { y: number; h: number }[]; sombra: number } | null = null;
  const geometria = () => {
    const W = mosaico.clientWidth;
    let filas: { y: number; h: number }[];
    let col: number;
    let gap: number;
    if (ancho.matches) {
      /* El texto ocupa la primera celda, y la primera fila mide lo que el texto si
         no cabe en la de una foto: así nunca se monta encima de la segunda. */
      gap = limita(W * 0.018, 16, 26);
      col = (W - 2 * gap) / 3;
      const baja = col * 0.75;
      bloque.style.width = `${col}px`;
      const th = bloque.offsetHeight;
      const alta = Math.max(baja, th);
      bloque.style.transform = `translateY(${(alta - th).toFixed(1)}px)`;
      filas = [
        { y: 0, h: alta },
        { y: alta + gap, h: baja },
      ];
    } else {
      bloque.style.width = "";
      bloque.style.transform = "";
      gap = 10;
      col = (W - gap) / 2;
      const h = col * 0.8;
      filas = [0, 1, 2].map((i) => ({ y: i * (h + gap), h }));
    }
    const ult = filas[filas.length - 1];
    const alto = ult.y + ult.h;
    mosaico.style.height = `${alto.toFixed(1)}px`;
    geo = { W, alto, gap, col, filas, sombra: ancho.matches ? 6 : 4 };
  };
  const rectDe = (celdas: Celda[]): Rect => {
    const g = geo!;
    const cs = celdas.map(([c]) => c);
    const fs = celdas.map(([, f]) => f);
    const c0 = Math.min(...cs);
    const c1 = Math.max(...cs);
    const f0 = Math.min(...fs);
    const f1 = Math.max(...fs);
    const x = c0 * (g.col + g.gap);
    const y = g.filas[f0].y;
    return { x, y, w: (c1 - c0) * (g.col + g.gap) + g.col, h: g.filas[f1].y + g.filas[f1].h - y };
  };
  const comps = () => (ancho.matches ? COMP_ORDENADOR : COMP_MOVIL);

  /* El paso de cada tesela: cuánto tarda, con qué curva y con cuánto retraso. */
  const lineal = (x: number) => x;
  const quieto: Paso = { dur: 0, curva: lineal, retraso: 0 };

  /* LA VENTANA Y SU FOTO SE MUEVEN EN EL MISMO FOTOGRAMA. En el probador eran
     dos transiciones de CSS, el `clip-path` de la ventana y el `transform` de la
     foto, y el navegador no las lleva en el mismo sitio: la del `transform` corre
     en el compositor y la del `clip-path` en el hilo principal. Cuando el hilo
     principal va cargado, la foto se adelanta a su ventana y asoma el fondo de la
     tesela. Medido el 2026-10-29 en capturas sobre el build, con el lienzo del
     fondo vivo ocupando la CPU (Chromium sin GPU): al empezar un cambio, una
     franja de 26 px sin foto al pie de la tesela que se encogía; sin el lienzo,
     ninguna. Leyendo los estilos no se veía: los dos valores calculados
     cuadraban, lo que no cuadraba era lo pintado.
     Por eso las dos se calculan aquí, en el mismo `requestAnimationFrame` y con
     las curvas de `tokens.css`: si el hilo va a tirones, van a tirones juntas,
     pero nunca una sin la otra. El fundido y el desenfoque de la foto que entra
     siguen en CSS: que se adelanten no destapa nada. */
  const activas = new Set<Pieza>();
  let fotograma = 0;
  const avanza = (ahora: number) => {
    fotograma = 0;
    for (const p of [...activas]) {
      const m = p.mov!;
      const x = (ahora - m.t0 - m.pa.retraso) / m.pa.dur;
      const k = x <= 0 ? 0 : x >= 1 ? 1 : m.pa.curva(x);
      const v = m.de.map((d, i) => d + (m.a[i] - d) * k);
      p.vista = v;
      p.pinta(v);
      if (x >= 1) {
        p.mov = null;
        activas.delete(p);
      }
    }
    if (activas.size) fotograma = requestAnimationFrame(avanza);
  };
  /** Lleva una pieza a su destino con el paso dado; sin duración, de golpe. Si
   *  estaba a medio camino, sale de donde está, como haría una transición. */
  const lleva = (p: Pieza, a: number[], pa: Paso) => {
    if (!pa.dur || !p.vista) {
      p.mov = null;
      activas.delete(p);
      p.vista = a;
      p.pinta(a);
      return;
    }
    p.mov = { de: p.vista, a, t0: performance.now(), pa };
    activas.add(p);
    if (!fotograma) fotograma = requestAnimationFrame(avanza);
  };

  /* Cada foto, su pieza: la posición y la escala que la cubren en su ventana. */
  const piezaDe = new WeakMap<HTMLImageElement, Pieza>();
  const piezaImg = (img: HTMLImageElement) => {
    let p = piezaDe.get(img);
    if (!p) {
      p = { vista: null, mov: null, pinta: (v) => (img.style.transform = `translate(${v[0].toFixed(1)}px, ${v[1].toFixed(1)}px) scale(${v[2].toFixed(4)})`) };
      piezaDe.set(img, p);
    }
    return p;
  };
  const colocaImg = (img: HTMLImageElement, r: Rect, pa: Paso) => {
    const f = fotoDe.get(img);
    if (!f) return;
    const H0 = (BASE * f.h) / f.w;
    const s = Math.max(r.w / BASE, r.h / H0) * MARGEN;
    const tx = E + r.x + (r.w - s * BASE) * f.fx;
    const ty = E + r.y + (r.h - s * H0) * f.fy;
    img.style.width = `${BASE}px`;
    img.style.height = `${H0.toFixed(1)}px`;
    /* La foto que entra se enfoca un poco antes de que la tesela se asiente. */
    const fundido = `${Math.round(pa.dur * 0.85)}ms var(--ease) ${pa.retraso}ms`;
    img.style.transition = pa.dur ? `opacity ${fundido}, filter ${fundido}` : "none";
    lleva(piezaImg(img), [tx, ty, s], pa);
  };

  /* Y cada tesela, la suya: el hueco que ocupa. Las tres capas miden el mosaico
     más E por cada lado, y cada una se recorta al hueco: la sombra desplazada, el
     marco justo y la ventana dos píxeles por dentro, que es el grosor del marco.
     La chapa del nombre va en su esquina de abajo. */
  const pintaTesela = (t: Tesela, v: number[]) => {
    const g = geo!;
    const [x, y, w, h] = v;
    const ins = (d: number, e: number, radio: string) =>
      `inset(${(E + y + d + e).toFixed(1)}px ${(E + g.W - x - w - d + e).toFixed(1)}px ${(E + g.alto - y - h - d + e).toFixed(1)}px ${(E + x + d + e).toFixed(1)}px round ${radio})`;
    t.sombra.style.clipPath = ins(g.sombra, 0, "var(--r-marco)");
    t.borde.style.clipPath = ins(0, 0, "var(--r-marco)");
    t.ventana.style.clipPath = ins(0, 2, "calc(var(--r-marco) - 2px)");
    t.nombre.style.transform = `translate(${(E + x + 12).toFixed(1)}px, ${(E + y + h - 12).toFixed(1)}px) translateY(-100%)`;
  };
  const piezaTesela = new Map<Tesela, Pieza>();
  /** El hueco que se ve ahora mismo, que a medio cambio no es ni el de antes ni
   *  el de después. */
  const huecoVisto = (t: Tesela): Rect => {
    const v = piezaTesela.get(t)?.vista;
    return v ? { x: v[0], y: v[1], w: v[2], h: v[3] } : t.rect!;
  };
  const ponRect = (t: Tesela, r: Rect, pa: Paso) => {
    let p = piezaTesela.get(t);
    if (!p) {
      const pieza: Pieza = { vista: null, mov: null, pinta: (v) => pintaTesela(t, v) };
      piezaTesela.set(t, pieza);
      p = pieza;
    }
    lleva(p, [r.x, r.y, r.w, r.h], pa);
    t.imgs.forEach((img) => colocaImg(img, r, pa));
    t.paso = pa;
    t.rect = r;
  };
  const etiqueta = (t: Tesela) => {
    if (t.foto) t.ventana.setAttribute("aria-label", VER ? `${t.foto.alt}. ${VER}` : t.foto.alt);
  };
  /* La foto que va en la ventana más grande lleva su nombre, como una chapa; sale
     cuando la tesela ya casi se ha asentado. */
  const nombra = (prota: number) => {
    teselas.forEach((t, i) => {
      const vis = i === prota;
      const pa = t.paso || quieto;
      if (vis) t.nombre.textContent = t.foto ? t.foto.nombre : "";
      const aparece = vis ? pa.retraso + Math.round(pa.dur * 0.7) : 0;
      t.nombre.style.transition = `opacity var(--dur-in) var(--ease) ${aparece}ms`;
      t.fig.classList.toggle("prota", vis);
    });
  };

  /* Mueve las cuatro a sus huecos nuevos. La que se encoge va encima y deja sitio
     primero; la que crece va debajo y sale un poco después, así no se atraviesan.
     Si la que crece trae foto nueva, la nueva entra debajo de la vieja, viaja con
     ella y se enfoca mientras se asienta. */
  const mueve = (p: number[], rects: Rect[], dur: number, curva: (x: number) => number, fresca: number) => {
    const pasos = p.map((hueco, i) => {
      const k = area(rects[hueco]) / area(teselas[i].rect!);
      const capa = k > 1.15 ? 0 : k < 0.87 ? 2 : 1;
      const pa: Paso = !dur
        ? quieto
        : capa === 0
          ? { dur: Math.round(dur * 0.8), curva, retraso: Math.round(dur * 0.2) }
          : capa === 2
            ? { dur: Math.round(dur * 0.8), curva, retraso: 0 }
            : { dur, curva, retraso: 0 };
      return { capa, pa };
    });
    let nueva: Foto | null = null;
    if (fresca >= 0) {
      const i = cola.findIndex((f) => f.lista);
      if (i >= 0) nueva = cola.splice(i, 1)[0];
    }
    if (nueva) {
      const t = teselas[fresca];
      const atras = t.imgs[1 - t.frente];
      fotoDe.set(atras, nueva);
      atras.removeAttribute("srcset");
      atras.removeAttribute("sizes");
      atras.src = nueva.url ?? nueva.src;
      atras.classList.remove("on");
      colocaImg(atras, huecoVisto(t), quieto);
      atras.style.zIndex = "2";
      t.imgs[t.frente].style.zIndex = "1";
    }
    void mosaico.offsetWidth;
    p.forEach((hueco, i) => {
      const t = teselas[i];
      t.hueco = hueco;
      t.fig.style.setProperty("--capa", String(pasos[i].capa));
      ponRect(t, rects[hueco], pasos[i].pa);
    });
    if (nueva) {
      const t = teselas[fresca];
      const delante = t.imgs[t.frente];
      const atras = t.imgs[1 - t.frente];
      atras.classList.add("on");
      if (t.foto) cola.push(t.foto);
      t.foto = nueva;
      etiqueta(t);
      /* La de antes se retira cuando la nueva ya la tapa entera: al terminar el
         paso, y un fotograma más. */
      luego(() => {
        requestAnimationFrame(() => {
          delante.classList.remove("on");
          t.frente = 1 - t.frente;
        });
      }, dur);
    }
    let prota = fresca;
    if (prota < 0) teselas.forEach((t, i) => (prota < 0 || area(t.rect!) > area(teselas[prota].rect!) + 1) && (prota = i));
    nombra(prota);
  };

  let actual = 0;
  let paso = 0;
  const siguiente = () => {
    const lista = comps();
    actual = (actual + 1) % lista.length;
    const rects = lista[actual].map(rectDe);
    let mejor: { p: number[]; coste: number } | null = null;
    for (const p of PERMS) {
      const coste = p.reduce((s, hueco, i) => s + dist2(teselas[i].rect!, rects[hueco]), 0);
      if (!mejor || coste < mejor.coste) mejor = { p, coste };
    }
    let fresca = -1;
    let crece = 1.35;
    mejor!.p.forEach((hueco, i) => {
      const k = area(rects[hueco]) / area(teselas[i].rect!);
      if (k > crece) {
        crece = k;
        fresca = i;
      }
    });
    paso++;
    mueve(mejor!.p, rects, reducido ? 0 : MUEVE, TELON, fresca);
  };

  /* Pulsar una foto la pone en la ventana grande más cercana y, como el mazo,
     desde ahí el mosaico ya no se mueve solo (regla 6). */
  const protagoniza = (i: number) => {
    let mejor: { ci: number; p: number[]; rects: Rect[]; coste: number } | null = null;
    for (const [ci, comp] of comps().entries()) {
      const rects = comp.map(rectDe);
      for (const p of PERMS) {
        if (comp[p[i]].length < 2) continue;
        const coste = p.reduce((s, hueco, j) => s + dist2(teselas[j].rect!, rects[hueco]), 0);
        if (!mejor || coste < mejor.coste) mejor = { ci, p, rects, coste };
      }
    }
    if (!mejor) return;
    actual = mejor.ci;
    mueve(mejor.p, mejor.rects, reducido ? 0 : ELIGE, TELON, -1);
    nombra(i);
  };

  const firma = () => (geo ? `${geo.W.toFixed(1)}|${geo.filas.map((f) => f.h.toFixed(1)).join()}` : "");
  const recoloca = () => {
    const antes = firma();
    geometria();
    if (antes === firma() && teselas[0].rect) return;
    const lista = comps();
    if (actual >= lista.length) actual = 0;
    const rects = lista[actual].map(rectDe);
    teselas.forEach((t) => ponRect(t, rects[t.hueco], quieto));
  };

  /* Arranque: el modo vivo encendido, y el cristal en la grande, como estaba. */
  raiz.dataset.vivo = "";
  geometria();
  const rects0 = comps()[0].map(rectDe);
  teselas.forEach((t) => {
    t.imgs[0].classList.add("on");
    ponRect(t, rects0[t.hueco], quieto);
    etiqueta(t);
  });
  nombra(0);

  let eraAncho = ancho.matches;
  ancho.addEventListener(
    "change",
    () => {
      if (eraAncho !== ancho.matches) {
        actual = 0;
        teselas.forEach((t, i) => (t.hueco = i));
        eraAncho = ancho.matches;
      }
      geo = null;
      recoloca();
    },
    { signal },
  );
  /* El texto también: si la letra llega después de medir, el bloque crece y la
     primera fila tiene que crecer con él. Se recoloca en el fotograma siguiente
     y no dentro del aviso: recolocar cambia el tamaño de lo observado, y hacerlo
     ahí mismo deja avisos sin entregar, que el navegador cuenta como error. */
  let pendiente = 0;
  const ojoTam = new ResizeObserver(() => {
    if (!pendiente)
      pendiente = requestAnimationFrame(() => {
        pendiente = 0;
        recoloca();
      });
  });
  ojoTam.observe(mosaico);
  ojoTam.observe(bloque);

  /* Solo se mueve a la vista, con la pestaña delante y sin el ratón encima. */
  let reloj: ReturnType<typeof setTimeout> | null = null;
  let parado = reducido;
  let encima = false;
  let enVista = false;
  const pausa = () => {
    if (reloj) clearTimeout(reloj);
    reloj = null;
  };
  const programa = () => {
    if (parado || encima || reloj || !enVista || document.hidden) return;
    const espera = paso === 0 ? PRIMERA : MUEVE + RESPIROS[paso % RESPIROS.length];
    reloj = setTimeout(() => {
      reloj = null;
      siguiente();
      programa();
    }, espera);
  };
  const ojoVista = new IntersectionObserver(
    ([e]) => {
      /* La proporción y no `isIntersecting`, como en la portada: esa es cierta en
         cuanto asoma un borde. */
      enVista = e.intersectionRatio >= 0.3;
      if (enVista) programa();
      else pausa();
    },
    { threshold: [0, 0.3] },
  );
  ojoVista.observe(mosaico);
  const ojoCerca = new IntersectionObserver(
    ([e]) => {
      if (!e.isIntersecting) return;
      fotos.forEach(pide);
      ojoCerca.disconnect();
    },
    { rootMargin: "100% 0px" },
  );
  ojoCerca.observe(mosaico);
  document.addEventListener("visibilitychange", () => (document.hidden ? pausa() : programa()), { signal });

  mosaico.addEventListener(
    "pointerenter",
    (e) => {
      if (e.pointerType !== "mouse") return;
      encima = true;
      pausa();
    },
    { signal },
  );
  mosaico.addEventListener(
    "pointerleave",
    (e) => {
      if (e.pointerType !== "mouse") return;
      encima = false;
      teselas.forEach((t) => {
        t.mueve.style.transform = "";
        t.fig.classList.remove("encima");
      });
      programa();
    },
    { signal },
  );
  /* Con el ratón, cada foto se desplaza un poco al contrario, como vista por una
     ventana; nunca más de lo que le sobra por cada lado. Y la que tiene el ratón
     encima enseña su nombre. */
  mosaico.addEventListener(
    "pointermove",
    (e) => {
      if (e.pointerType !== "mouse" || reducido || !geo) return;
      const c = mosaico.getBoundingClientRect();
      const x = e.clientX - c.left;
      const y = e.clientY - c.top;
      for (const t of teselas) {
        const r = t.rect;
        const f = t.foto;
        if (!r || !f) continue;
        const H0 = (BASE * f.h) / f.w;
        const s = Math.max(r.w / BASE, r.h / H0) * MARGEN;
        const sobraX = BASE * s - r.w;
        const sobraY = H0 * s - r.h;
        const dx = limita(-((x - (r.x + r.w / 2)) / (geo.W / 2)) * ASOMA.x, -sobraX * (1 - f.fx) + 1, sobraX * f.fx - 1);
        const dy = limita(-((y - (r.y + r.h / 2)) / (geo.alto / 2)) * ASOMA.y, -sobraY * (1 - f.fy) + 1, sobraY * f.fy - 1);
        t.mueve.style.transform = `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px)`;
        t.fig.classList.toggle("encima", x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h);
      }
    },
    { passive: true, signal },
  );
  teselas.forEach((t, i) => {
    const elige = () => {
      parado = true;
      pausa();
      protagoniza(i);
    };
    t.ventana.addEventListener("click", elige, { signal });
    t.ventana.addEventListener(
      "keydown",
      (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          elige();
        }
      },
      { signal },
    );
  });

  return () => {
    pausa();
    relojes.forEach(clearTimeout);
    relojes.clear();
    if (pendiente) cancelAnimationFrame(pendiente);
    if (fotograma) cancelAnimationFrame(fotograma);
    ojoTam.disconnect();
    ojoVista.disconnect();
    ojoCerca.disconnect();
    abort.abort();
  };
}
