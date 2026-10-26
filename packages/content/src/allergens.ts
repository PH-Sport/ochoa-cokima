import { z } from "zod";
import type { Dish } from "./index.ts";

/** Los 14 alérgenos de declaración obligatoria en la UE (Reglamento 1169/2011),
 *  en el orden del Anexo II. El orden importa: es el número de la chuleta. */
export const allergenEnum = z.enum([
  "gluten",
  "crustaceos",
  "huevo",
  "pescado",
  "cacahuetes",
  "soja",
  "lacteos",
  "frutos-cascara",
  "apio",
  "mostaza",
  "sesamo",
  "sulfitos",
  "altramuces",
  "moluscos",
]);
export type Allergen = z.infer<typeof allergenEnum>;

/** El número de cada alérgeno en la chuleta de la carta.
 *
 * Es el orden del Anexo II —el mismo del enum—, que es el que llevan las cartas
 * de bar de toda la vida: 1 gluten … 14 moluscos. Se deriva del enum y no se
 * escribe a mano para que no haya dos listas.
 */
export function allergenNumber(a: Allergen): number {
  return allergenEnum.options.indexOf(a) + 1;
}

/** Los alérgenos de un plato en orden de número, que es como se leen bajo él.
 *  El JSON los guarda en el orden de la hoja del restaurante, y ahí moluscos
 *  va tercero siendo el 14. */
export function dishAllergens(dish: Dish): Allergen[] {
  return [...dish.allergens].sort((a, b) => allergenNumber(a) - allergenNumber(b));
}

/** Los alérgenos que aparecen en una carta, sin repetir y en orden de número.
 *
 * Es lo que lista la leyenda al pie: un 5 (cacahuetes) que ningún plato lleva
 * no tiene que salir. Cuenta también los marcados como pendientes de
 * confirmar, que en la carta se ven igual que los demás salvo por la marca.
 */
export function usedAllergens(dishes: Dish[]): Allergen[] {
  const vistos = new Set<Allergen>();
  for (const d of dishes) {
    for (const a of d.allergens) vistos.add(a);
    for (const a of d.allergensToConfirm) vistos.add(a);
  }
  return [...vistos].sort((a, b) => allergenNumber(a) - allergenNumber(b));
}
