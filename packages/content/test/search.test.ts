import { describe, it, expect } from "vitest";
import { normalize, matchDish } from "../src/search.ts";

describe("normalize", () => {
  it("quita acentos y baja a minúsculas", () => {
    expect(normalize("Jamón Ibérico")).toBe("jamon iberico");
  });
  it("conserva la ñ como n para que 'nino' encuentre 'niño'", () => {
    expect(normalize("Niño")).toBe("nino");
  });
  it("colapsa espacios", () => {
    expect(normalize("  huevos   rotos ")).toBe("huevos rotos");
  });
});

describe("matchDish", () => {
  const dish = { name: "Croquetas de jamón Joselito", description: "Con velo de papada ibérica." };

  it("encuentra por nombre sin acentos", () => {
    expect(matchDish(dish, "jamon")).toBe(true);
  });
  it("encuentra por descripción", () => {
    expect(matchDish(dish, "papada")).toBe(true);
  });
  it("no encuentra lo que no está", () => {
    expect(matchDish(dish, "gamba")).toBe(false);
  });
  it("una consulta vacía casa con todo", () => {
    expect(matchDish(dish, "   ")).toBe(true);
  });
  it("tolera platos sin descripción", () => {
    expect(matchDish({ name: "Ensaladilla" }, "ensalad")).toBe(true);
  });
  it("la consulta con acentos también encuentra el plato", () => {
    // El teclado del móvil corrige solo: "jamón" tiene que funcionar igual.
    expect(matchDish(dish, "jamón")).toBe(true);
  });
});
