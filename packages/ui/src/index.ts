export type { Dish, MenuEntry, Allergen } from "@tombo/content";
export { hasHalfPortions } from "@tombo/content";

/** Datos de restaurante que consume Seo.astro para el JSON-LD. */
export interface RestaurantInfo {
  name: string;
  streetAddress: string;
  postalCode: string;
  addressLocality: string;
  telephone: string;
  servesCuisine: string[];
  priceRange: string;
  /** Formato schema.org, p. ej. "Mo-Su 09:00-00:00". */
  openingHours: string[];
  instagram?: string;
}
