/** Comportamiento del menú a pantalla completa, sin una sola decisión de marca.
 *
 * Las dos webs abren el mismo menú y lo visten distinto: aquí vive lo que es
 * idéntico —estado, foco, teclado, bloqueo del scroll— y en cada app vive el
 * markup y la piel. La animación tampoco está aquí: es CSS de cada marca,
 * gobernado por el atributo `data-state` que este módulo escribe.
 *
 * Contrato del markup que lo usa:
 *   - un `<nav>` contenedor
 *   - `[data-menu-toggle]` — el botón, con `aria-expanded` y `aria-controls`
 *   - el overlay con ese `id`, `data-state="closed"` e `inert` de salida
 *
 * El overlay se busca por `aria-controls` y no dentro del `<nav>` a propósito:
 * cubre la pantalla entera por debajo de la barra, así que en el DOM cuelga del
 * body, no de la barra. La relación entre botón y panel la sostiene ARIA, que
 * es donde tiene que estar para quien usa un lector de pantalla.
 */

export interface MenuOverlayHandle {
  /** Cierra el menú y suelta todos los listeners. Idempotente. */
  destroy(): void;
}

const SCROLL_LOCK_CLASS = "menu-open";

/** Enlaces y botones del panel que de verdad pueden recibir foco ahora mismo. */
const focusablesOf = (panel: HTMLElement): HTMLElement[] =>
  [...panel.querySelectorAll<HTMLElement>("a[href], button:not([disabled])")].filter(
    (el) => el.offsetParent !== null,
  );

export function mountMenuOverlay(nav: HTMLElement): MenuOverlayHandle | null {
  const btn = nav.querySelector<HTMLButtonElement>("[data-menu-toggle]");
  const panelId = btn?.getAttribute("aria-controls");
  const panel = panelId ? document.getElementById(panelId) : null;
  if (!btn || !panel) return null;

  const root = document.documentElement;
  const controller = new AbortController();
  const { signal } = controller;

  const isOpen = () => panel.dataset.state === "open";

  /* El bloqueo es una sola clase en <html>; el CSS de cada app decide qué hace
     con ella. Dos efectos que hay que resolver ahí y no aquí:
       - el hueco de la barra de scroll, que se reserva de antemano con
         `scrollbar-gutter: stable` para que la página no dé un respingo;
       - la cabecera `sticky`, que al desaparecer el scroll del documento se
         queda sin contenedor al que pegarse y cae a su sitio en el flujo —fuera
         de la pantalla si la página estaba desplazada—, así que mientras el menú
         está abierto pasa a `fixed`. */
  const lockScroll = () => root.classList.add(SCROLL_LOCK_CLASS);
  const unlockScroll = () => root.classList.remove(SCROLL_LOCK_CLASS);

  /* El nombre accesible del botón cambia con el estado: quien lo oye tiene que
     saber si va a abrir o a cerrar, no solo que existe un "Menú". Los dos
     textos los pone cada app en el markup, porque son idioma, no comportamiento. */
  const label = btn.querySelector<HTMLElement>("[data-label-open]");
  const syncLabel = (open: boolean) => {
    if (!label) return;
    const next = open ? label.dataset.labelClose : label.dataset.labelOpen;
    if (next) label.textContent = next;
  };

  /* Mover el foco por script no dice de dónde venía el usuario, y el navegador
     resuelve la duda heredando: si el elemento que lo tenía antes mostraba el
     anillo de `:focus-visible`, el siguiente lo muestra también. Como el menú se
     pasa el foco de la barra al panel y de vuelta, basta con que el anillo entre
     una vez —un Tab, una navegación— para que se quede rebotando entre los dos
     aunque después solo se use el ratón. De ahí que salga «a ratos».
     `focusVisible` corta esa herencia y lo decide cada llamada, que es quien
     sabe si la orden vino del dedo o del teclado. Donde no esté soportado, la
     opción se ignora y queda el comportamiento de antes. */
  const open = (conAnillo = false) => {
    if (isOpen()) return;
    lockScroll();
    panel.dataset.state = "open";
    panel.removeAttribute("inert");
    btn.setAttribute("aria-expanded", "true");
    syncLabel(true);
    focusablesOf(panel)[0]?.focus({ focusVisible: conAnillo });
  };

  /* El foco vuelve al botón ANTES de marcar el panel como inerte: al revés, el
     navegador expulsa el foco a ninguna parte y se pierde el sitio en la página
     para quien navega con teclado. */
  const close = (returnFocus = false, conAnillo = false) => {
    if (!isOpen()) return;
    if (returnFocus) btn.focus({ focusVisible: conAnillo });
    panel.dataset.state = "closed";
    panel.setAttribute("inert", "");
    btn.setAttribute("aria-expanded", "false");
    syncLabel(false);
    unlockScroll();
  };

  /* `detail` cuenta los clics de ratón que trae el evento: con Enter o Espacio
     sobre el botón vale 0, porque no ha habido ninguno. Es la forma de saber si
     esto lo ha pedido un dedo o un teclado sin espiar toda la página. */
  btn.addEventListener(
    "click",
    (e) => {
      const teclado = e.detail === 0;
      if (isOpen()) close(true, teclado);
      else open(teclado);
    },
    { signal },
  );

  /* Navegar desde el menú lo cierra. Con View Transitions el documento no se
     recarga: sin esto, el overlay sobreviviría a la navegación y el scroll
     seguiría bloqueado en la página nueva. */
  panel.addEventListener(
    "click",
    (e) => {
      if ((e.target as HTMLElement).closest("a[href]")) close();
    },
    { signal },
  );

  document.addEventListener(
    "keydown",
    (e) => {
      if (!isOpen()) return;
      if (e.key === "Escape") {
        // Cerrar con Escape es teclado por definición: aquí el anillo sí tiene
        // que volver con el foco, o quien navega así pierde de vista dónde está.
        close(true, true);
        return;
      }
      if (e.key !== "Tab") return;
      const items = focusablesOf(panel);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    },
    { signal },
  );

  /* El alto real de la barra gobierna el offset de lo que se pega debajo. El
     panel ya no cuenta para ese alto —es `fixed` y está fuera del flujo—, así
     que aquí no hace falta ningún caso especial con el menú abierto. */
  const syncHeaderHeight = () => {
    root.style.setProperty("--t-header-h", `${Math.ceil(nav.getBoundingClientRect().height)}px`);
  };
  syncHeaderHeight();
  const observer = new ResizeObserver(syncHeaderHeight);
  observer.observe(nav);

  return {
    destroy() {
      close();
      observer.disconnect();
      controller.abort();
    },
  };
}

/** Monta el menú y lo vuelve a montar en cada navegación de View Transitions. */
export function initMenuOverlay(navSelector = ".nav"): void {
  let handle: MenuOverlayHandle | null = null;

  const mount = () => {
    // Soltar el montaje anterior antes de crear otro: `astro:after-swap` dispara
    // una vez por navegación y, sin esto, los listeners de `document` se
    // acumularían una capa por página visitada.
    handle?.destroy();
    const nav = document.querySelector<HTMLElement>(navSelector);
    handle = nav ? mountMenuOverlay(nav) : null;
  };

  mount();
  // `astro:after-swap` y no `astro:page-load`: este último dispara también en la
  // carga inicial y duplicaría el montaje.
  document.addEventListener("astro:after-swap", mount);
}
