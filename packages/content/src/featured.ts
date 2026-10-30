import type { MenuEntry } from "./index.ts";

/**
 * `order` es correlativo dentro de cada sección, no un índice global: ordenar
 * solo por `order` intercalaría los postres entre los platos salados. Cubre las
 * secciones de las dos cartas — Cokima reparte en `compartir` y `terminar`, y
 * Ochoa en `pinchos`, `con-pan`, `raciones` y `postres`, en el orden de su
 * carta — y las desconocidas van al final, nunca delante, para que un dato
 * nuevo no se cuele en cabeza sin querer.
 *
 * Las de Ochoa faltaban hasta el 2026-10-30 —la lista decía que lo llevaba todo
 * en `carta`—, y mientras sus seis destacados eran raciones no se notó. Al
 * destacar la tarta de queso, el único postre conocido se ponía delante de todo.
 */
const SECTION_ORDER = ["compartir", "terminar", "carta", "pinchos", "con-pan", "raciones", "postres"];

const rank = (section: string) => {
  const i = SECTION_ORDER.indexOf(section);
  return i === -1 ? SECTION_ORDER.length : i;
};

export function pickFeatured(entries: MenuEntry[], limit?: number): MenuEntry[] {
  const featured = entries
    .filter((e) => e.featured)
    .sort((a, b) => rank(a.section) - rank(b.section) || a.order - b.order);
  return typeof limit === "number" ? featured.slice(0, limit) : featured;
}
