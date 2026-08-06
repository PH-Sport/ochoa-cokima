/** La entrada a la web: cuándo sale y cómo se monta. Sin una sola decisión de marca.
 *
 * La plancha, el rótulo y los `@keyframes` viven en cada app (hoy solo en
 * Ochoa). Aquí vive lo que sería idéntico en cualquier casa: las cuatro puertas
 * que deciden si la entrada se pinta, y el ciclo de medir, arrancar y retirar.
 *
 * Contrato del markup que lo usa:
 *   - `[data-intro-plancha]` — la superficie que se recoge; su `animationend`
 *     es lo que retira la entrada
 *   - `[data-intro-marca]` — el rótulo que viaja, con `transform-origin` arriba
 *     a la izquierda
 *   - `[data-intro-destino]` — dónde tiene que aterrizar (el rótulo de la barra)
 *   - `data-intro` en el `<html>`: `"si"` puesto y quieto, `"va"` animándose
 *
 * El diseño entero, con las dos variantes descartadas y sus motivos, está en
 * `docs/superpowers/specs/2026-08-06-entrada-ochoa-design.md`.
 */

/** Dónde se anota que esta pestaña ya ha visto la entrada. */
export const CLAVE_SESION = "ochoa:entrada";

/** El seguro. Si algo falla entre el pintado y el montaje, la entrada se retira
 *  igual y la web queda visible. No es un adorno: el script que pinta la plancha
 *  es síncrono y el que la retira no, así que sin esto un error de red o un
 *  módulo que no llega dejarían la pantalla en rojo.
 *  Se exporta porque quien lo arma es el script inline del `<head>`, que lo
 *  interpola desde aquí: escribirlo a mano allí serían dos fuentes para el
 *  mismo número. */
export const SEGURO = 3000;

/** Cuántos ms se espera como mucho a que llegue la fuente antes de medir igual.
 *  Con la de respaldo el rótulo mide otra cosa y el aterrizaje cae torcido, pero
 *  esperar indefinidamente es peor: dejaría la plancha puesta. */
const ESPERA_FUENTE = 600;

/** ¿Se reproduce la entrada al pulsar el rótulo de la barra desde otra página?
 *
 * A prueba por decisión de Mario —«esto lo cogemos con pinzas, hay que ver si
 * produce demasiada fricción, pero lo probamos»—. Ponerlo en `false` apaga solo
 * este disparo; la entrada desde fuera sigue igual. Mismo mecanismo que el
 * `EN_OBRAS` de `conocenos.ts`.
 */
export const INTRO_EN_RETORNO = true;

export type TipoNavegacion = "navigate" | "reload" | "back_forward" | "prerender";

export interface Circunstancias {
  /** Qué clase de navegación ha traído a esta página. */
  tipo: TipoNavegacion;
  /** ¿Esta pestaña ya ha visto la entrada? */
  yaVisto: boolean;
  /** ¿El sistema pide menos movimiento? */
  menosMovimiento: boolean;
}

/** ¿Sale la entrada?
 *
 * Cuatro puertas, en orden; basta que una diga que no. **Esta función se
 * serializa con `.toString()` para meterla en el script inline del `<head>`**,
 * que es lo que evita tener dos copias de la lógica —una testeada y otra no—.
 * Por eso no puede referenciar nada de este módulo: ni una constante, ni un
 * import, ni otra función. Hay un test que lo vigila.
 */
export function decideEntrada(c: Circunstancias): boolean {
  if (c.menosMovimiento) return false;
  // Recargar y volver atrás son la misma situación: ya estabas dentro.
  if (c.tipo === "reload" || c.tipo === "back_forward") return false;
  if (c.yaVisto) return false;
  return true;
}

/** ¿Debe reproducirse la entrada al pulsar el rótulo de la barra?
 *
 * Solo si de verdad se va a otra página. Estando ya en el destino el router no
 * navega, así que la entrada anunciaría una llegada que no ocurre.
 * La barra final no distingue una ruta de otra: `/carta` y `/carta/` son la
 * misma página, y en Astro las dos formas aparecen según de dónde venga el
 * enlace.
 */
export function decideRetorno(actual: string, destino: string): boolean {
  const limpia = (r: string) => (r.length > 1 ? r.replace(/\/+$/, "") : r);
  return limpia(actual) !== limpia(destino);
}
