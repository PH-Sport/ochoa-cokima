import type { RestaurantInfo } from "@tombo/ui";

/** Datos verificados en la web actual del grupo; validar con el cliente (spec §12). */
export const RESTAURANT: RestaurantInfo = {
  name: "Cokima — Kitchen Madness",
  streetAddress: "Calle de Andrés Mellado, 21",
  postalCode: "28015",
  addressLocality: "Madrid",
  telephone: "+34 915 98 94 01",
  servesCuisine: ["Fusión", "Española", "Asiática", "Latinoamericana"],
  priceRange: "€€",
  openingHours: ["Mo-Su 09:00-00:00"],
  instagram: "https://instagram.com/cokimamadrid",
};

export const COVER_SLUG = import.meta.env.PUBLIC_COVERMANAGER_SLUG ?? "restaurante-cokima";

/** Etiquetas de alérgenos por idioma (iconos de @tombo/ui). */
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
