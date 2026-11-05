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

/**
 * Los alérgenos de la carta salen del PDF oficial del restaurante (Mario,
 * 2026-11-04: «Ambos PDFs son oficiales») y se ven en números en La carta. Esta
 * bandera solo gobierna el filtro de MenuDeck, que ninguna página de Brasa pinta
 * y que nadie ha pedido recuperar: sigue en false para que no se encienda solo.
 * Un filtro "sin gluten" en el que una persona celíaca confía es un problema de
 * salud, no de UX, y encenderlo es una decisión aparte.
 */
export const ALLERGEN_DATA_CONFIRMED = false;

/** Etiquetas de alérgenos por idioma: la leyenda de La carta y lo que oye quien no ve los números. */
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
