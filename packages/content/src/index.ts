import { z } from "zod";

/** Los 14 alérgenos de declaración obligatoria en la UE (Reglamento 1169/2011). */
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

export const dishSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  allergens: z.array(allergenEnum).default([]),
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
