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

/** Los nombres de los 14 alérgenos, para la chuleta de la carta. Las claves son
 *  las del enum de `@tombo/content`; la palabra la pone cada casa. */
export const ALLERGEN_LABELS: Record<"es" | "en", Record<string, string>> = {
  es: {
    gluten: "Gluten",
    crustaceos: "Crustáceos",
    huevo: "Huevo",
    pescado: "Pescado",
    cacahuetes: "Cacahuetes",
    soja: "Soja",
    lacteos: "Lácteos",
    "frutos-cascara": "Frutos de cáscara",
    apio: "Apio",
    mostaza: "Mostaza",
    sesamo: "Sésamo",
    sulfitos: "Sulfitos",
    altramuces: "Altramuces",
    moluscos: "Moluscos",
  },
  en: {
    gluten: "Gluten",
    crustaceos: "Crustaceans",
    huevo: "Egg",
    pescado: "Fish",
    cacahuetes: "Peanuts",
    soja: "Soy",
    lacteos: "Dairy",
    "frutos-cascara": "Tree nuts",
    apio: "Celery",
    mostaza: "Mustard",
    sesamo: "Sesame",
    sulfitos: "Sulphites",
    altramuces: "Lupin",
    moluscos: "Molluscs",
  },
};
