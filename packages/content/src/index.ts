import { z } from "zod";

import { allergenEnum } from "./allergens.ts";
export { allergenEnum, allergenNumber, usedAllergens, dishAllergens, type Allergen } from "./allergens.ts";

export const dishSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  allergens: z.array(allergenEnum).default([]),
  /* Alérgenos que el restaurante señaló en su hoja sin decir por qué (en Los
     Ochoa, el gluten de cinco platos en amarillo). Van también en `allergens`;
     esto solo dice cuáles llevan la marca en la carta. */
  allergensToConfirm: z.array(allergenEnum).default([]),
  featured: z.boolean().default(false),
  image: z.string().optional(),
  price: z.union([
    z.number().positive(),
    // half: null modela el guion de las cartas sin media ración
    z.object({ half: z.number().positive().nullable(), full: z.number().positive() }),
  ]),
});
export type Dish = z.infer<typeof dishSchema>;

export const menuEntrySchema = dishSchema.extend({
  section: z.string().min(1),
  order: z.number().int(),
});
export type MenuEntry = z.infer<typeof menuEntrySchema>;

export function hasHalfPortions(dishes: Dish[]): boolean {
  return dishes.some((d) => typeof d.price === "object");
}

export { getOpenState, type OpenState } from "./hours.ts";
export { formatPortionPrice, formatEuro, type Portion } from "./portions.ts";
export { dishImageKey } from "./image-key.ts";
export { pickFeatured } from "./featured.ts";
