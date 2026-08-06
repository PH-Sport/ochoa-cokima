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

/** Mide el viaje del rótulo y publica las tres variables que lo describen.
 *
 * Se mide con el rótulo YA visible: un elemento sin caja devuelve cero, y con
 * un cero el rótulo encoge en el sitio en vez de aterrizar —un fallo que no se
 * ve en una captura, solo midiendo—. Por eso `data-intro` ya está puesto cuando
 * esto corre.
 *
 * Y se mide en vez de escribirse a mano porque de dónde sale y a dónde llega
 * dependen del ancho de la pantalla y del cuerpo de la fuente: cualquier número
 * fijo sería falso en algún móvil.
 */
function mideViaje(marca: HTMLElement, destino: HTMLElement): boolean {
  const previo = marca.style.transform;
  marca.style.transform = "none";
  const origen = marca.getBoundingClientRect();
  marca.style.transform = previo;
  const meta = destino.getBoundingClientRect();
  if (!origen.width || !meta.width) return false;

  marca.style.setProperty("--s", String(meta.width / origen.width));
  marca.style.setProperty("--tx", `${meta.left - origen.left}px`);
  marca.style.setProperty("--ty", `${meta.top - origen.top}px`);
  return true;
}

/** Quita la entrada de en medio y devuelve el rótulo de la barra. */
function retira(): void {
  document.documentElement.removeAttribute("data-intro");
}

/** Arranca la entrada que el script del `<head>` ya ha decidido pintar.
 *
 * El orden importa y es el motivo de que la animación no arranque sola desde el
 * CSS: primero se espera a la fuente —con la de respaldo el rótulo mide otra
 * cosa y el aterrizaje cae torcido—, después se mide, y solo entonces se pasa a
 * `data-intro="va"`.
 */
function montaEntrada(fuenteDelRotulo: string): void {
  const raiz = document.documentElement;
  if (raiz.dataset.intro !== "si") return;

  const plancha = document.querySelector<HTMLElement>("[data-intro-plancha]");
  const marca = document.querySelector<HTMLElement>("[data-intro-marca]");
  const destino = document.querySelector<HTMLElement>("[data-intro-destino]");
  if (!plancha || !marca || !destino) return retira();

  /* La plancha es quien manda: es la que tarda más y la que tapa. Cuando
     termina de recogerse, la entrada ha terminado.
     **`animationend` burbujea**, así que sin filtrar el objetivo la firma —que
     termina a los 210ms, dentro del rótulo— retiraría la entrada a mitad del
     viaje. */
  plancha.addEventListener("animationend", (e) => {
    if (e.target === plancha) retira();
  });

  const arranca = () => {
    if (raiz.dataset.intro !== "si") return; // el seguro se adelantó
    if (!mideViaje(marca, destino)) return retira();
    raiz.dataset.intro = "va";
  };

  /* `document.fonts.load` y no `fonts.ready`: este último espera a TODAS las
     fuentes del documento y aquí solo importa la del rótulo. El tiempo tope
     evita que una fuente que no llega deje la plancha puesta esperándola. */
  const fuentes = document.fonts;
  if (fuentes?.load) {
    Promise.race([
      fuentes.load(fuenteDelRotulo),
      new Promise((ok) => setTimeout(ok, ESPERA_FUENTE)),
    ]).then(arranca, arranca);
  } else {
    arranca();
  }
}

/** Arma el rótulo de la barra para que reproduzca la entrada al navegar.
 *
 * El rótulo es un `<a href="/">` normal del `ClientRouter`, así que aquí no se
 * navega a mano: se deja pasar el clic y se anota la intención. Quien la
 * ejecuta es `astro:after-swap`, ya con la página nueva puesta.
 */
function armaRetorno(): void {
  if (!INTRO_EN_RETORNO) return;
  const destino = document.querySelector("[data-intro-destino]");
  if (!(destino instanceof HTMLAnchorElement)) return;

  destino.addEventListener("click", () => {
    if (!decideRetorno(location.pathname, new URL(destino.href).pathname)) return;
    /* En `sessionStorage` y no en una variable del módulo: así la intención
       sobrevive igual si el router no llega a intervenir y la navegación
       termina siendo una carga completa. */
    try {
      sessionStorage.setItem(`${CLAVE_SESION}:retorno`, "1");
    } catch {
      /* Sin almacenamiento no hay retorno, y no pasa nada más. */
    }
  });
}

/** ¿Venimos de pulsar el rótulo? Consume la marca: solo vale una vez. */
function reclamaRetorno(): boolean {
  try {
    if (sessionStorage.getItem(`${CLAVE_SESION}:retorno`) !== "1") return false;
    sessionStorage.removeItem(`${CLAVE_SESION}:retorno`);
    return true;
  } catch {
    return false;
  }
}

/** Monta la entrada y deja armado el rótulo de la barra.
 *
 * El armado NO puede vivir dentro de `montaEntrada()`: esa función sale por su
 * primera línea cuando no toca entrada —que es la mayoría de las cargas—, así
 * que el enganche al router no llegaría a registrarse nunca.
 *
 * `astro:after-swap` y no `astro:page-load`: el segundo dispara también en la
 * carga inicial y duplicaría el montaje. Es la misma trampa que documenta
 * `menu-overlay.ts`.
 *
 * @param fuenteDelRotulo Descriptor de la fuente del rótulo tal y como lo espera
 *   `document.fonts.load` —p. ej. `"400 1em Anton"`—. Lo pasa cada app porque es
 *   lo único de aquí que es marca, y esta casa no la conoce.
 */
export function initEntrada(fuenteDelRotulo: string): void {
  armaRetorno();
  montaEntrada(fuenteDelRotulo);

  document.addEventListener("astro:after-swap", () => {
    // El rótulo del documento nuevo es otro elemento: hay que armarlo otra vez.
    armaRetorno();
    if (!reclamaRetorno()) return;
    document.documentElement.dataset.intro = "si";
    montaEntrada(fuenteDelRotulo);
  });
}
