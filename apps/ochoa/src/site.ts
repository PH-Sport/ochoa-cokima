import type { RestaurantInfo } from "@tombo/ui";

/** Datos verificados en la web actual del grupo; validar con el cliente (spec §12). */
export const RESTAURANT: RestaurantInfo = {
  name: "Tasquita Los Ochoa",
  streetAddress: "Paseo de la Castellana, 117",
  postalCode: "28046",
  addressLocality: "Madrid",
  telephone: "+34 912 87 68 20",
  servesCuisine: ["Española", "Tapas", "Madrileña"],
  priceRange: "€€",
  openingHours: ["Mo-Th 09:00-01:00", "Fr 09:00-02:30", "Sa 12:00-02:30", "Su 12:00-01:00"],
  instagram: "https://instagram.com/tasquita.losochoa",
};

export const COVER_SLUG = import.meta.env.PUBLIC_COVERMANAGER_SLUG ?? "tasquita-los-ochoa";
