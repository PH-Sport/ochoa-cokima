import type { MenuEntry } from "./index.ts";

/**
 * `order` es correlativo dentro de cada sección, no un índice global: ordenar
 * solo por `order` intercalaría los postres entre los platos salados. Cubre las
 * secciones de las dos cartas — Cokima reparte en `compartir` y `terminar`,
 * Ochoa lo lleva todo en `carta` — y las desconocidas van al final, nunca
 * delante, para que un dato nuevo no se cuele en cabeza sin querer.
 */
const SECTION_ORDER = ["compartir", "terminar", "carta", "postres"];

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
