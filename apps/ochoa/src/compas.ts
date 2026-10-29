// El compás común de la portada: la foto del telón y la carta del mazo de «Lo que
// más sale» se mueven solas y, en el móvil, a la vez en la misma pantalla.
//
// POR QUÉ UN RELOJ COMÚN. Con los dos cada 3,5 s y arrancando juntos cambiaban al
// mismo tiempo y la página latía (regla 18 de docs/movimiento.md). Mario lo vio en
// el boceto el 2026-10-27, y se separaron: la portada cada `--dur-pase` (3,5 s) y
// el mazo cada `--dur-turno` (5,5 s), con el primer cambio del mazo
// `--desfase-turno` más tarde. Pero ese desfase solo existe mientras los dos
// cuenten desde el mismo instante, y aquí no lo hacen: el mazo arranca cuando
// asoma la mitad, que es al bajar, y los dos se paran fuera de pantalla y vuelven.
// Con relojes sueltos la fase saldría al azar y podrían coincidir al milisegundo.
// Así que ninguno cuenta su espera: los dos preguntan aquí cuándo toca su próximo
// cambio, contado desde un origen común — el `timeStamp` del mismo
// `astro:page-load`, que es idéntico para todos los que lo escuchan.
//
// Medido en el boceto con 3,5 y 5,5 s: los cambios de uno y otro caen en
// múltiplos de medio segundo, y el cuarto de desfase los deja siempre a 0,25 s
// o más; dos de cada siete, justo a 0,25 s. Sin el desfase, uno de cada siete
// coincidía exacto.

/** Lee un token de duración (`3.5s` o `980ms`) y lo devuelve en milisegundos. */
export function leeDuracion(token: string): number {
  const v = getComputedStyle(document.documentElement).getPropertyValue(token).trim();
  return v.endsWith("ms") ? parseFloat(v) : parseFloat(v) * 1000;
}

/** Lee un token que es una lista de duraciones (`8.2s 10.4s …`), en milisegundos.
 *  Son los ritmos sin compás de la home viva: una espera distinta cada vez, por
 *  turnos, y todas en `tokens.css` como cualquier otra duración. */
export function leeDuraciones(token: string): number[] {
  const v = getComputedStyle(document.documentElement).getPropertyValue(token).trim();
  return v
    .split(/[\s,]+/)
    .filter(Boolean)
    .map((p) => (p.endsWith("ms") ? parseFloat(p) : parseFloat(p) * 1000));
}

/** Lee un token numérico (una velocidad, una fracción) sin su unidad. */
export function leeNumero(token: string): number {
  return parseFloat(getComputedStyle(document.documentElement).getPropertyValue(token));
}

/**
 * Lee un token de curva (`cubic-bezier(0.45, 0.02, 0.55, 1)`) y la devuelve como
 * función del avance, de 0 a 1, para lo que se anima desde el script y no desde
 * el CSS. Es la misma curva que usaría el navegador: misma fórmula, resuelta en
 * el tiempo con Newton y, si no converge, por bisección. Si el token no es una
 * `cubic-bezier`, lineal.
 */
export function leeCurva(token: string): (x: number) => number {
  const v = getComputedStyle(document.documentElement).getPropertyValue(token);
  const n = v.match(/cubic-bezier\(([^)]+)\)/)?.[1].split(",").map(Number);
  if (!n || n.length !== 4 || n.some((x) => !Number.isFinite(x))) return (x) => x;
  const [x1, y1, x2, y2] = n;
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;
  const sx = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sy = (t: number) => ((ay * t + by) * t + cy) * t;
  const dx = (t: number) => (3 * ax * t + 2 * bx) * t + cx;
  return (x) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 8; i++) {
      const e = sx(t) - x;
      if (Math.abs(e) < 1e-6) return sy(t);
      const d = dx(t);
      if (Math.abs(d) < 1e-6) break;
      t -= e / d;
    }
    let lo = 0;
    let hi = 1;
    t = x;
    for (let i = 0; i < 40 && hi - lo > 1e-7; i++) {
      if (sx(t) < x) lo = t;
      else hi = t;
      t = (lo + hi) / 2;
    }
    return sy(t);
  };
}

/**
 * Milisegundos que faltan para el próximo cambio de una serie que cambia en
 * `primero`, `primero + periodo`, `primero + 2·periodo`… contados desde `origen`.
 *
 * Al volver a la vista, un cambio que tocaba casi enseguida se salta al
 * siguiente: una carta que se va nada más asomar no da tiempo a leerla. Por eso
 * se pide al menos medio periodo de espera.
 */
export function hastaElProximo(origen: number, periodo: number, primero: number): number {
  const t = performance.now() - origen;
  const n = Math.max(0, Math.ceil((t + periodo / 2 - primero) / periodo));
  return primero + n * periodo - t;
}
