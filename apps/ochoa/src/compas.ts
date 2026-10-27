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
