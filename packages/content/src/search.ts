/**
 * Marcas combinantes: lo que NFD separa de la letra base (la tilde de "jamón"
 * pasa a ser un carácter propio). Se usa la propiedad Unicode `\p{M}` en vez de
 * un rango literal para no dejar caracteres invisibles en el código fuente.
 */
const COMBINING_MARKS = /\p{M}/gu;

/** Minúsculas, sin diacríticos y con espacios colapsados. */
export function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(COMBINING_MARKS, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Casa la consulta contra nombre y descripción, ambos normalizados: en español
 * buscar "jamon" tiene que encontrar "jamón", y al revés. Consulta vacía casa
 * con todo, para que borrar el campo devuelva la carta entera.
 */
export function matchDish(
  dish: { name: string; description?: string },
  query: string,
): boolean {
  const q = normalize(query);
  if (q === "") return true;
  const haystack = normalize(`${dish.name} ${dish.description ?? ""}`);
  return haystack.includes(q);
}
