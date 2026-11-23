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
  /** El nombre corto de la web, el que Google pone encima de cada resultado
   *  ("Cokima", no "Cokima — Kitchen Madness"). Con él, Seo.astro declara la
   *  ficha `WebSite` y `og:site_name`; sin él, Google se lo deduce del título. */
  siteName?: string;
  /** Ruta de la carta, p. ej. "/carta": el `hasMenu` de la ficha. */
  menuPath?: string;
  /** Ruta donde se reserva, p. ej. "/reservas": el `acceptsReservations`. */
  reservationsPath?: string;
}
